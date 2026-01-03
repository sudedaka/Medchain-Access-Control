from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import hashlib
from pathlib import Path
import datetime
from blockchain import Blockchain

app = Flask(__name__)
CORS(app)

# ----------------------------
# Paths
# ----------------------------
DATA_DIR = Path("data")
IDENTITY_FILE = DATA_DIR / "identity.json"
MEDICAL_FILE = DATA_DIR / "medical.json"
REQUESTS_FILE = DATA_DIR / "requests.json"

# Load blockchain
bc = Blockchain()


# ----------------------------
# Helpers
# ----------------------------
def load_json(path):
    if not path.exists():
        return {}
    with open(path, "r") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


def hash_id(value: str) -> str:
    """Hash doctorId / patientId so blockchain never stores real identifiers."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def now_timestamp():
    """Local ISO timestamp with timezone info."""
    return datetime.datetime.now().astimezone().isoformat()


# ----------------------------
# Resolve request status from blockchain
# ----------------------------
def get_request_status(request_block_index):
    for block in bc.chain:
        d = block["data"]

        if d.get("type") == "REQUEST_APPROVED" and d.get("request_block") == request_block_index:
            return "approved"

        if d.get("type") == "REQUEST_REJECTED" and d.get("request_block") == request_block_index:
            return "rejected"

    return "pending"


# --------------------------------------------------------------------
# 1) DOCTOR CREATES REQUEST
# --------------------------------------------------------------------
@app.route("/api/requests", methods=["POST"])
def create_request():
    data = request.get_json()
    doctor_id = data["doctorId"]
    patient_id = data["patientId"]

    # 1) blockchain'e yalnızca HASH yazıyoruz
    prev = bc.print_previous_block()
    proof = bc.proof_of_work(prev["proof"])
    prev_hash = bc.hash(prev)

    block = bc.create_block(
        proof,
        prev_hash,
        {
            "type": "REQUEST_CREATED",
            "doctorHash": hash_id(doctor_id),
            "patientHash": hash_id(patient_id)
           
        }
    )

    # 2) off-chain metadata kaydı (requests.json)
    reqs = load_json(REQUESTS_FILE)
    reqs[str(block["index"])] = {
        "doctorId": doctor_id,
        "patientId": patient_id,
        "createdAt": block["timestamp"]
    }
    save_json(REQUESTS_FILE, reqs)

    return jsonify({"message": "Request created", "blockIndex": block["index"]})


# --------------------------------------------------------------------
# 2) PATIENT PENDING REQUESTS
# --------------------------------------------------------------------
@app.route("/api/requests/pending/<patient_id>")
def get_pending_requests(patient_id):
    pending = []
    patient_hash = hash_id(patient_id)

    reqs = load_json(REQUESTS_FILE)

    for block in bc.chain:
        d = block["data"]

        if d.get("type") == "REQUEST_CREATED" and d.get("patientHash") == patient_hash:
            req_id = block["index"]
            status = get_request_status(req_id)

            if status == "pending":
                meta = reqs.get(str(req_id), {})
                pending.append({
                    "id": req_id,
                    "doctorId": meta.get("doctorId", "unknown"),
                    "timestamp": meta.get("createdAt", block["timestamp"]),
                })

    return jsonify({"pending": pending})


# --------------------------------------------------------------------
# 3) PATIENT APPROVES REQUEST
# --------------------------------------------------------------------
@app.route("/api/requests/<int:req_id>/approve", methods=["POST"])
def approve_request(req_id):

    prev = bc.print_previous_block()
    proof = bc.proof_of_work(prev["proof"])
    prev_hash = bc.hash(prev)

    bc.create_block(
        proof,
        prev_hash,
        {
            "type": "REQUEST_APPROVED",
            "request_block": req_id
        }
    )

    return jsonify({"message": "approved"})


# --------------------------------------------------------------------
# 4) PATIENT REJECTS REQUEST
# --------------------------------------------------------------------
@app.route("/api/requests/<int:req_id>/reject", methods=["POST"])
def reject_request(req_id):

    prev = bc.print_previous_block()
    proof = bc.proof_of_work(prev["proof"])
    prev_hash = bc.hash(prev)

    bc.create_block(
        proof,
        prev_hash,
        {
            "type": "REQUEST_REJECTED",
            "request_block": req_id
        }
    )

    return jsonify({"message": "rejected"})


# --------------------------------------------------------------------
# 5) DOCTOR REQUEST HISTORY
# --------------------------------------------------------------------
@app.route("/api/requests/doctor/<doctor_id>")
def doctor_requests(doctor_id):
    results = []
    doctor_hash = hash_id(doctor_id)

    reqs = load_json(REQUESTS_FILE)

    for block in bc.chain:
        d = block["data"]

        if d.get("type") == "REQUEST_CREATED" and d.get("doctorHash") == doctor_hash:
            req_id = block["index"]
            meta = reqs.get(str(req_id), {})

            results.append({
                "id": req_id,
                "patientId": meta.get("patientId", "unknown"),
                "status": get_request_status(req_id),
                "createdAt": meta.get("createdAt", block["timestamp"])
            })

    return jsonify({"requests": results})


# --------------------------------------------------------------------
# 6) PATIENT AUDIT LOG
# --------------------------------------------------------------------
@app.route("/api/audit/<patient_id>")
def audit(patient_id):
    audit_log = []

    reqs = load_json(REQUESTS_FILE)

    patient_hash = hash_id(patient_id)

    for block in bc.chain:
        d = block["data"]
        t = d["type"]

        # Request creation entry
        if t == "REQUEST_CREATED" and d.get("patientHash") == patient_hash:
            req_id = block["index"]
            meta = reqs.get(str(req_id), {})
            audit_log.append({
                "timestamp": meta.get("createdAt", block["timestamp"]),
                "event": t,
                "doctorId": meta.get("doctorId", "-")
            })

        # Approve / reject entry
        elif t in ("REQUEST_APPROVED", "REQUEST_REJECTED"):
            req_id = d.get("request_block")
            meta = reqs.get(str(req_id), {})
            if meta.get("patientId") == patient_id:
                audit_log.append({
                    "timestamp": block["timestamp"],
                    "event": t,
                    "doctorId": meta.get("doctorId", "-")
                })

    audit_log.reverse()
    return jsonify({"audit": audit_log})


# --------------------------------------------------------------------
# 7) Patient medical data (off-chain)
# --------------------------------------------------------------------
@app.route("/api/patient/<patient_id>/data")
def patient_data(patient_id):
    doctor_id = request.args.get("doctorId")
    if not doctor_id:
        return jsonify({"error": "doctorId required"}), 400

    doctor_hash = hash_id(doctor_id)
    patient_hash = hash_id(patient_id)

    reqs = load_json(REQUESTS_FILE)

    authorized = False

    for block in bc.chain:
        d = block["data"]

        # 1) Request created for THIS doctor & THIS patient
        if (
            d.get("type") == "REQUEST_CREATED"
            and d.get("doctorHash") == doctor_hash
            and d.get("patientHash") == patient_hash
        ):
            req_id = block["index"]

            # 2) Check if THIS request was approved
            if get_request_status(req_id) == "approved":
                authorized = True
                break

    if not authorized:
        return jsonify({"error": "Access denied"}), 403

    # Authorized → return data
    identity = load_json(IDENTITY_FILE).get(patient_id, {})
    medical = load_json(MEDICAL_FILE).get(patient_id, {})

    return jsonify({
        "identity": identity,
        "medical": medical
    })


# --------------------------------------------------------------------
# 8) Serve uploads (diagnostic images)
# --------------------------------------------------------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# --------------------------------------------------------------------
# 9) Doctor info (off-chain)
# --------------------------------------------------------------------
@app.route("/api/doctor/<doctor_id>")
def get_doctor(doctor_id):
    with open("data/doctors.json") as f:
        doctors = json.load(f)

    return jsonify(doctors.get(doctor_id, {"name": doctor_id}))

# --------------------------------------------------------------------
# RUN
# --------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
