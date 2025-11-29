from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo
def now():
    return datetime.now(ZoneInfo("Europe/Istanbul")).isoformat(timespec="minutes")
app = FastAPI()

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
DATA_DIR = "data"
FILES = {
    "identity": "identity.json",
    "medical": "medical.json",
    "requests": "requests.json",
    "access": "access.json",
    "audit": "audit.json",
}

# Helpers ---------------------------------------------------------

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r") as f:
        return json.load(f)

def save_json(filename, data):
    with open(os.path.join(DATA_DIR, filename), "w") as f:
        json.dump(data, f, indent=4)

# Routes ----------------------------------------------------------

@app.get("/")
def root():
    return {"message": "MedChain MVP Backend Running"}

# 1) Doctor creates a request -------------------------------------

@app.post("/api/requests")
def create_request(payload: dict):
    requests = load_json(FILES["requests"])

    new_request = {
        "id": f"req_{len(requests)+1}",
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "purpose": payload.get("purpose", "medical_review"),
        "status": "pending",
        "createdAt": datetime.utcnow().isoformat()
    }

    requests.append(new_request)
    save_json(FILES["requests"], requests)

    # Add to audit log
    audit = load_json(FILES["audit"])
    audit.append({
        "event": "REQUEST_CREATED",
        "requestId": new_request["id"],
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "timestamp": datetime.utcnow().isoformat()
    })
    save_json(FILES["audit"], audit)

    return {"message": "Request created", "request": new_request}

# 2) Patient lists pending requests -------------------------------

@app.get("/api/requests/pending/{patientId}")
def pending_requests(patientId: str):
    requests = load_json(FILES["requests"])
    filtered = [
        r for r in requests 
        if r["patientId"] == patientId and r["status"] == "pending"
    ]
    return {"pending": filtered}

# 3) Patient approves request -------------------------------------

@app.post("/api/requests/{request_id}/approve")
def approve_request(request_id: str):
    requests = load_json(FILES["requests"])
    access_list = load_json(FILES["access"])
    audit = load_json(FILES["audit"])

    target = next((r for r in requests if r["id"] == request_id), None)

    if target is None:
        raise HTTPException(404, "Request not found")

    target["status"] = "approved"
    save_json(FILES["requests"], requests)

    # Create access permission
    access_list.append({
        "doctorId": target["doctorId"],
        "patientId": target["patientId"],
        "approvedAt": datetime.utcnow().isoformat(),
        "expiresAt": None
    })
    save_json(FILES["access"], access_list)

    # Log event
    audit.append({
        "event": "REQUEST_APPROVED",
        "requestId": request_id,
        "doctorId": target["doctorId"],
        "patientId": target["patientId"],
        "timestamp": datetime.utcnow().isoformat()
    })
    save_json(FILES["audit"], audit)

    return {"message": "Approved"}

# 4) Patient rejects request --------------------------------------

@app.post("/api/requests/{request_id}/reject")
def reject_request(request_id: str):
    requests = load_json(FILES["requests"])
    audit = load_json(FILES["audit"])

    target = next((r for r in requests if r["id"] == request_id), None)

    if target is None:
        raise HTTPException(404, "Request not found")

    target["status"] = "rejected"
    save_json(FILES["requests"], requests)

    # Log event
    audit.append({
        "event": "REQUEST_REJECTED",
        "requestId": request_id,
        "doctorId": target["doctorId"],
        "patientId": target["patientId"],
        "timestamp": datetime.utcnow().isoformat()
    })
    save_json(FILES["audit"], audit)

    return {"message": "Rejected"}

# 5) Doctor fetches medical data ----------------------------------

@app.get("/api/patient/{patientId}/data")
def get_medical_data(patientId: str, doctorId: str):
    identity = load_json(FILES["identity"])
    medical = load_json(FILES["medical"])
    access_list = load_json(FILES["access"])

    # Check if doctor has permission
    allowed = any(
        a["doctorId"] == doctorId and a["patientId"] == patientId
        for a in access_list
    )

    if not allowed:
        raise HTTPException(403, "Access denied")

    return {
        "identity": identity.get(patientId, {}),
        "medical": medical.get(patientId, {})
    }

# 6) Audit log retrieval ------------------------------------------

@app.get("/api/audit/{patientId}")
def get_audit(patientId: str):
    audit = load_json(FILES["audit"])
    filtered = [entry for entry in audit if entry["patientId"] == patientId]
    return {"audit": filtered}

@app.get("/api/requests/doctor/{doctorId}")
def get_requests_for_doctor(doctorId: str):
    requests = load_json(FILES["requests"])
    filtered = [r for r in requests if r["doctorId"] == doctorId]
    return {"requests": filtered}
