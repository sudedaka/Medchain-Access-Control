from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pathlib import Path
from blockchain import Blockchain
from flask import send_from_directory
import os

app = Flask(__name__)
CORS(app)

DATA_DIR = Path("data")
IDENTITY_FILE = DATA_DIR / "identity.json"
MEDICAL_FILE = DATA_DIR / "medical.json"
REQUESTS_FILE = DATA_DIR / "requests.json"

# Load blockchain
bc = Blockchain()


# -------------------------------------
# Helper load/save JSON functions
# -------------------------------------
def load_json(path):
    if not path.exists():
        return {}
    with open(path, "r") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


# -------------------------------------
# REQUEST STATUS RESOLUTION
# -------------------------------------
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
# Frontend: POST /api/requests
# --------------------------------------------------------------------
@app.route("/api/requests", methods=["POST"])
def create_request():
    data = request.get_json()
    doctor_id = data["doctorId"]
    patient_id = data["patientId"]
    purpose = data["purpose"]

    prev = bc.print_previous_block()
    proof = bc.proof_of_work(prev["proof"])
    prev_hash = bc.hash(prev)

    block = bc.create_block(
        proof,
        prev_hash,
        {
            "type": "REQUEST_CREATED",
            "doctorId": doctor_id,
            "patientId": patient_id,
            "purpose": purpose
        }
    )

    return jsonify({"message": "Request created", "blockIndex": block["index"]})


# --------------------------------------------------------------------
# 2) PATIENT PENDING REQUESTS
# Frontend: GET /api/requests/pending/:patientId
# --------------------------------------------------------------------
@app.route("/api/requests/pending/<patient_id>")
def get_pending_requests(patient_id):
    pending = []

    for block in bc.chain:
        d = block["data"]

        if d.get("type") == "REQUEST_CREATED" and d["patientId"] == patient_id:
            req_id = block["index"]
            status = get_request_status(req_id)

            if status == "pending":
                pending.append({
                    "id": req_id,
                    "doctorId": d["doctorId"],
                    "purpose": d["purpose"],
                    "timestamp": block["timestamp"],
                })

    return jsonify({"pending": pending})


# --------------------------------------------------------------------
# 3) PATIENT APPROVES REQUEST
# Frontend: POST /api/requests/:id/approve
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
# Frontend: POST /api/requests/:id/reject
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
# Frontend: GET /api/requests/doctor/:doctorId
# --------------------------------------------------------------------
@app.route("/api/requests/doctor/<doctor_id>")
def doctor_requests(doctor_id):
    
    results = []

    for block in bc.chain:
        d = block["data"]

        if d.get("type") == "REQUEST_CREATED" and d["doctorId"] == doctor_id:
            req_id = block["index"]

            results.append({
                "id": req_id,
                "patientId": d["patientId"],
                "purpose": d["purpose"],
                "status": get_request_status(req_id),
                "createdAt": block["timestamp"]
            })

    return jsonify({"requests": results})


# --------------------------------------------------------------------
# 6) PATIENT AUDIT LOG
# Frontend: GET /api/audit/:patientId
# --------------------------------------------------------------------
@app.route("/api/audit/<patient_id>")
def audit(patient_id):
    audit_log = []

    for block in bc.chain:
        d = block["data"]

        if d.get("patientId") == patient_id or d.get("request_block"):
            entry = {
                "timestamp": block["timestamp"],
                "event": d["type"],
                "doctorId": d.get("doctorId", "-")
            }
            audit_log.append(entry)

    audit_log.reverse()
    return jsonify({"audit": audit_log})


# (Optional) clinical data endpoint
@app.route("/api/patient/<patient_id>/data")
def patient_data(patient_id):
    identity = load_json(IDENTITY_FILE).get(patient_id, {})
    medical = load_json(MEDICAL_FILE).get(patient_id, {})

    return jsonify({
        "identity": identity,
        "medical": medical
    })


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join('uploads'), filename)

# --------------------------------------------------------------------
# RUN
# --------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

