// Prefer an explicit build-time URL, but fall back at runtime to the current host
const RUNTIME_HOST = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE = (import.meta.env.VITE_API_URL as string) || `http://${RUNTIME_HOST}:8000`;

function normalizeImageUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://localhost:8000") || url.startsWith("http://backend:8000")) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return url.replace(/http:\/\/(localhost|backend):8000/, `http://${host}:8000`);
  }
  return url;
}

// Doctor creates request
export async function createRequest(
  doctorId: string,
  patientId: string,
  purpose: string
) {
  const response = await fetch(`${API_BASE}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, patientId, purpose }),
  });

  return response.json();
}

// Patient pending requests
export async function getPendingRequests(patientId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/pending/${patientId}`
  );
  return response.json();
}

// Patient approves request
export async function approveRequest(requestId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/${requestId}/approve`,
    { method: "POST" }
  );

  return response.json();
}

// Patient rejects request
export async function rejectRequest(requestId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/${requestId}/reject`,
    { method: "POST" }
  );

  return response.json();
}

// Doctor fetches data
export async function getAuthorizedData(patientId: string, doctorId: string) {
  const response = await fetch(
    `${API_BASE}/api/patient/${patientId}/data?doctorId=${doctorId}`
  );

  const data = await response.json();
  // normalize any image URLs returned from backend data (handles legacy localhost/backend URLs)
  try {
    if (data && data.medical && data.medical.labs) {
      data.medical.labs = data.medical.labs.map((lab: any) => {
        if (lab.images && Array.isArray(lab.images)) {
          lab.images = lab.images.map((u: string) => normalizeImageUrl(u));
        }
        return lab;
      });
    }
  } catch (e) {
    // ignore normalization errors
  }

  return data;
}

// Audit log
export async function getAudit(patientId: string) {
  const response = await fetch(
    `${API_BASE}/api/audit/${patientId}`
  );
  return response.json();
}

export async function getDoctorRequests(doctorId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/doctor/${doctorId}`
  );
  return response.json();
}

// Lab uploads result
export async function uploadLabResult(
  patientId: string,
  testType: string,
  files: File[]
) {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("testType", testType);

  files.forEach((file) => formData.append("files", file)); // multiple files

  const response = await fetch(`${API_BASE}/api/lab/upload`, {
    method: "POST",
    body: formData,
  });

  const res = await response.json();
  if (res && res.images && Array.isArray(res.images)) {
    res.images = res.images.map((u: string) => normalizeImageUrl(u));
  }

  return res;
}
