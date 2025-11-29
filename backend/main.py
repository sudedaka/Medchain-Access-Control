from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo


# ----------------------------
# Helpers
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)


def now():
    return datetime.now(ZoneInfo("Europe/Istanbul")).isoformat(timespec="minutes")


def json_load(name):
    path = os.path.join(DATA_DIR, name)
    with open(path, "r") as f:
        return json.load(f)


def json_save(name, data):
    path = os.path.join(DATA_DIR, name)
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


FILES = {
    "identity": "identity.json",
    "medical": "medical.json",
    "requests": "requests.json",
    "access": "access.json",
    "audit": "audit.json",
}



# ----------------------------
# App init + CORS
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # DEV MODE: allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# GLOBAL ERROR HANDLER (CRITICAL)
# ----------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensures backend always returns CORS headers even on 500 errors."""
    print("🔥 Backend crashed:", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"},
    )



# ----------------------------
# STATIC FILES
# ----------------------------
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")



# ----------------------------
# ROUTES
# ----------------------------
@app.get("/")
def root():
    return {"message": "Backend OK"}



# Upload lab result
@app.post("/api/lab/upload")
async def upload_file(
    patientId: str = Form(...),
    testType: str = Form(...),
    file: UploadFile = File(...)
):
    safe_test = testType.replace(" ", "_")
    filename = f"{patientId}_{safe_test}_{file.filename}"

    save_path = os.path.join(UPLOAD_DIR, filename)

    with open(save_path, "wb") as f:
        f.write(await file.read())

    image_url = f"http://127.0.0.1:8000/uploads/{filename}"

    # update medical.json
    medical = json_load(FILES["medical"])
    if patientId not in medical:
        medical[patientId] = {"labs": []}

    medical[patientId]["labs"].append({
        "test": testType,
        "date": now(),
        "result": "see-image",
        "images": [image_url]
    })

    json_save(FILES["medical"], medical)

    return {
        "message": "Lab result uploaded",
        "imageURL": image_url
    }



# ----------------------------
# The rest of your existing CRUD routes
# ----------------------------
@app.post("/api/requests")
def create_request(payload: dict):
    requests = json_load(FILES["requests"])

    new_request = {
        "id": f"req_{len(requests)+1}",
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "purpose": payload.get("purpose", "medical_review"),
        "status": "pending",
        "createdAt": datetime.utcnow().isoformat()
    }

    requests.append(new_request)
    json_save(FILES["requests"], requests)

    audit = json_load(FILES["audit"])
    audit.append({
        "event": "REQUEST_CREATED",
        "requestId": new_request["id"],
        "doctorId": payload["doctorId"],
        "patientId": payload["patientId"],
        "timestamp": datetime.utcnow().isoformat()
    })
    json_save(FILES["audit"], audit)

    return {"request": new_request}


@app.get("/api/requests/pending/{patientId}")
def pending_requests(patientId: str):
    requests = json_load(FILES["requests"])
    return {"pending": [r for r in requests if r["patientId"] == patientId and r["status"] == "pending"]}


@app.post("/api/requests/{request_id}/approve")
def approve_request(request_id: str):
    requests = json_load(FILES["requests"])
    access = json_load(FILES["access"])
    audit = json_load(FILES["audit"])

    target = next((r for r in requests if r["id"] == request_id), None)
    if not target:
        raise HTTPException(404, "Request not found")

    target["status"] = "approved"
    json_save(FILES["requests"], requests)

    access.append({
        "doctorId": target["doctorId"],
        "patientId": target["patientId"],
        "approvedAt": datetime.utcnow().isoformat(),
        "expiresAt": None
    })
    json_save(FILES["access"], access)

    audit.append({
        "event": "REQUEST_APPROVED",
        "requestId": request_id,
        "doctorId": target["doctorId"],
        "patientId": target["patientId"],
        "timestamp": datetime.utcnow().isoformat()
    })
    json_save(FILES["audit"], audit)

    return {"message": "Approved"}



@app.get("/api/audit/{patientId}")
def get_audit(patientId: str):
    audit = json_load(FILES["audit"])
    return {"audit": [x for x in audit if x["patientId"] == patientId]}


@app.get("/api/requests/doctor/{doctorId}")
def doctor_reqs(doctorId: str):
    req = json_load(FILES["requests"])
    return {"requests": [r for r in req if r["doctorId"] == doctorId]}



@app.get("/api/patient/{pid}/data")
def get_patient_data(pid: str, doctorId: str):
    identity = json_load(FILES["identity"])
    medical = json_load(FILES["medical"])
    access = json_load(FILES["access"])

    allowed = any(
        a["doctorId"] == doctorId and a["patientId"] == pid
        for a in access
    )

    if not allowed:
        raise HTTPException(403, "Access denied")

    return {
        "identity": identity.get(pid, {}),
        "medical": medical.get(pid, {})
    }
