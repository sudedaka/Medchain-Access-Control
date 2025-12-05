from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json, os
import uuid     #creates unique IDs for requests
from datetime import datetime, timezone
BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

# ---- PATHS ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---- APP ----
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- HELPERS ----
def now():
    return datetime.now(timezone.utc).isoformat(timespec="minutes")

def json_load(name):
    with open(os.path.join(DATA_DIR, name)) as f:
        return json.load(f)

def json_save(name, data):
    with open(os.path.join(DATA_DIR, name), "w") as f:
        json.dump(data, f, indent=4)

FILES = {
    "identity": "identity.json",
    "medical": "medical.json",
    "requests": "requests.json",
    "access": "access.json",
    "audit": "audit.json",
}

# Serve uploads folder
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ============================================================
#                     LAB UPLOAD ENDPOINT
# ============================================================
@app.post("/api/lab/upload")
async def upload_lab_result(
    request: Request,
    patientId: str = Form(...),
    testType: str = Form(...),
    files: list[UploadFile] = File(...)
):
    print("UPLOAD RECEIVED", patientId, testType)

    urls = []
    for file in files:
        safe_name = f"{patientId}_{testType.replace(' ','_')}_{file.filename}"
        path = os.path.join(UPLOAD_DIR, safe_name)

        with open(path, "wb") as f:
            f.write(await file.read())

        host_base = str(request.base_url).rstrip("/")
        urls.append(f"{host_base}/uploads/{safe_name}")

    med = json_load(FILES["medical"])
    if patientId not in med:
        med[patientId] = {"labs": []}

    med[patientId]["labs"].append({
        "test": testType,
        "date": now(),
        "result": "see-images",
        "images": urls,
    })

    json_save(FILES["medical"], med)

    print("UPLOAD SUCCESSFUL")
    return {"ok": True, "images": urls}

# ============================================================
#                     REQUEST SYSTEM
# ============================================================
@app.post("/api/requests")
def create_request(payload: dict):
    reqs = json_load(FILES["requests"])

    new_req = {
        "id": f"req_{len(reqs)+1}",
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "purpose": payload.get("purpose", ""),
        "status": "pending",
        "createdAt": now()
    }

    reqs.append(new_req)
    json_save(FILES["requests"], reqs)

    # audit log
    audit = json_load(FILES["audit"])
    audit.append({
        "event": "REQUEST_CREATED",
        "requestId": new_req["id"],
        "doctorId": new_req["doctorId"],
        "patientId": new_req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"request": new_req}


@app.get("/api/requests/pending/{patientId}")
def pending_requests(patientId: str):
    reqs = json_load(FILES["requests"])
    return {"pending": [r for r in reqs if r["patientId"] == patientId and r["status"] == "pending"]}


@app.post("/api/requests/{request_id}/approve")
def approve(request_id: str):
    reqs = json_load(FILES["requests"])
    access = json_load(FILES["access"])
    audit = json_load(FILES["audit"])

    req = next((r for r in reqs if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Request not found")

    req["status"] = "approved"
    json_save(FILES["requests"], reqs)

    access.append({
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "approvedAt": now(),
        "expiresAt": None
    })
    json_save(FILES["access"], access)

    audit.append({
        "event": "REQUEST_APPROVED",
        "requestId": request_id,
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"ok": True}


@app.post("/api/requests/{request_id}/reject")
def reject(request_id: str):
    reqs = json_load(FILES["requests"])
    audit = json_load(FILES["audit"])

    req = next((r for r in reqs if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Not found")

    req["status"] = "rejected"
    json_save(FILES["requests"], reqs)

    audit.append({
        "event": "REQUEST_REJECTED",
        "requestId": request_id,
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"ok": True}


@app.get("/api/requests/doctor/{doctorId}")
def doctor_requests(doctorId: str):
    reqs = json_load(FILES["requests"])
    return {"requests": [r for r in reqs if r["doctorId"] == doctorId]}

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json, os
from datetime import datetime, timezone

# ---- PATHS ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---- APP ----
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- HELPERS ----
def now():
    return datetime.now(timezone.utc).isoformat(timespec="minutes")

def json_load(name):
    with open(os.path.join(DATA_DIR, name)) as f:
        return json.load(f)

def json_save(name, data):
    with open(os.path.join(DATA_DIR, name), "w") as f:
        json.dump(data, f, indent=4)

FILES = {
    "identity": "identity.json",
    "medical": "medical.json",
    "requests": "requests.json",
    "access": "access.json",
    "audit": "audit.json",
}

# Serve uploads folder
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ============================================================
#                     LAB UPLOAD ENDPOINT
# ============================================================
@app.post("/api/lab/upload")
async def upload_lab_result(
    request: Request,
    patientId: str = Form(...),
    testType: str = Form(...),
    files: list[UploadFile] = File(...)
):
    print("UPLOAD RECEIVED", patientId, testType)

    urls = []
    for file in files:
        safe_name = f"{patientId}_{testType.replace(' ','_')}_{file.filename}"
        path = os.path.join(UPLOAD_DIR, safe_name)

        with open(path, "wb") as f:
            f.write(await file.read())

        host_base = str(request.base_url).rstrip("/")
        urls.append(f"{host_base}/uploads/{safe_name}")

    med = json_load(FILES["medical"])
    if patientId not in med:
        med[patientId] = {"labs": []}

    med[patientId]["labs"].append({
        "test": testType,
        "date": now(),
        "result": "see-images",
        "images": urls,
    })

    json_save(FILES["medical"], med)

    print("UPLOAD SUCCESSFUL")
    return {"ok": True, "images": urls}

# ============================================================
#                     REQUEST SYSTEM
# ============================================================
@app.post("/api/requests")
def create_request(payload: dict):
    reqs = json_load(FILES["requests"])

    new_req = {
        "id": str(uuid.uuid4()),
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "purpose": payload.get("purpose", ""),
        "status": "pending",
        "createdAt": now()
    }

    reqs.append(new_req)
    json_save(FILES["requests"], reqs)

    # audit log
    audit = json_load(FILES["audit"])
    audit.append({
        "event": "REQUEST_CREATED",
        "requestId": new_req["id"],
        "doctorId": new_req["doctorId"],
        "patientId": new_req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"request": new_req}


@app.get("/api/requests/pending/{patientId}")
def pending_requests(patientId: str):
    reqs = json_load(FILES["requests"])
    return {"pending": [r for r in reqs if r["patientId"] == patientId and r["status"] == "pending"]}


@app.post("/api/requests/{request_id}/approve")
def approve(request_id: str):
    reqs = json_load(FILES["requests"])
    access = json_load(FILES["access"])
    audit = json_load(FILES["audit"])

    req = next((r for r in reqs if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Request not found")

    req["status"] = "approved"
    json_save(FILES["requests"], reqs)

    access.append({
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "approvedAt": now(),
        "expiresAt": None
    })
    json_save(FILES["access"], access)

    audit.append({
        "event": "REQUEST_APPROVED",
        "requestId": request_id,
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"ok": True}


@app.post("/api/requests/{request_id}/reject")
def reject(request_id: str):
    reqs = json_load(FILES["requests"])
    audit = json_load(FILES["audit"])

    req = next((r for r in reqs if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Not found")

    req["status"] = "rejected"
    json_save(FILES["requests"], reqs)

    audit.append({
        "event": "REQUEST_REJECTED",
        "requestId": request_id,
        "doctorId": req["doctorId"],
        "patientId": req["patientId"],
        "timestamp": now()
    })
    json_save(FILES["audit"], audit)

    return {"ok": True}


@app.get("/api/requests/doctor/{doctorId}")
def doctor_requests(doctorId: str):
    reqs = json_load(FILES["requests"])
    return {"requests": [r for r in reqs if r["doctorId"] == doctorId]}

# ============================================================
#                     PATIENT DATA
# ============================================================
@app.get("/api/patient/{pid}/data")
def get_patient_data(pid: str, doctorId: str):
    identity = json_load(FILES["identity"])
    medical = json_load(FILES["medical"])
    access = json_load(FILES["access"])

    # Patient can ALWAYS view their own records
    if pid == doctorId:
        return {
            "identity": identity.get(pid, {}),
            "medical": medical.get(pid, {})
        }

    # Doctor must be authorized
    allowed = any(a["doctorId"] == doctorId and a["patientId"] == pid for a in access)
    if not allowed:
        raise HTTPException(403, "Access denied")

    return {
        "identity": identity.get(pid, {}),
        "medical": medical.get(pid, {})
    }

@app.get("/api/audit/{patientId}")
def get_audit(patientId: str):
    audit = json_load(FILES["audit"])
    return {"audit": [a for a in audit if a["patientId"] == patientId]}
