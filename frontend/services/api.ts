// Doctor creates request
export async function createRequest(
  doctorId: string,
  patientId: string,
  purpose: string
) {
  const response = await fetch("http://127.0.0.1:8000/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, patientId, purpose }),
  });

  return response.json();
}

// Patient pending requests
export async function getPendingRequests(patientId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/requests/pending/${patientId}`
  );
  return response.json();
}

// Patient approves request
export async function approveRequest(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/requests/${requestId}/approve`,
    { method: "POST" }
  );

  return response.json();
}

// Patient rejects request
export async function rejectRequest(requestId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/requests/${requestId}/reject`,
    { method: "POST" }
  );

  return response.json();
}

// Doctor fetches data
export async function getAuthorizedData(patientId: string, doctorId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/patient/${patientId}/data?doctorId=${doctorId}`
  );

  return response.json();
}

// Audit log
export async function getAudit(patientId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/audit/${patientId}`
  );
  return response.json();
}

export async function getDoctorRequests(doctorId: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/requests/doctor/${doctorId}`
  );
  return response.json();
}