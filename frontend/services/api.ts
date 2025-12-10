// ----------------------------------------------------------------------
// AUTO-DETECT API BASE URL 
// ----------------------------------------------------------------------

function getApiBase(): string {
  const host = window.location.hostname;

  // Local development on PC
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:8000";
  }

  return `http://${host}:8000`;
}

export const API_BASE = getApiBase();


// ----------------------------------------------------------------------
// Normalize image URLs
// ----------------------------------------------------------------------
export function normalizeImageUrl(url: string) {
  if (!url) return url;
  return `${API_BASE}${url}`;
}


// ----------------------------------------------------------------------
// Doctor creates request
// ----------------------------------------------------------------------
export async function createRequest(
  doctorId: string,
  patientId: string
) {
  const response = await fetch(`${API_BASE}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctorId, patientId }),
  });

  return response.json();
}

// ----------------------------------------------------------------------
// Patient pending requests
// ----------------------------------------------------------------------
export async function getPendingRequests(patientId: string) {
  const response = await fetch(`${API_BASE}/api/requests/pending/${patientId}`);
  return response.json();
}

// ----------------------------------------------------------------------
// Patient approves request
// ----------------------------------------------------------------------
export async function approveRequest(requestId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/${requestId}/approve`,
    { method: "POST" }
  );
  return response.json();
}

// ----------------------------------------------------------------------
// Patient rejects request
// ----------------------------------------------------------------------
export async function rejectRequest(requestId: string) {
  const response = await fetch(
    `${API_BASE}/api/requests/${requestId}/reject`,
    { method: "POST" }
  );
  return response.json();
}


// ----------------------------------------------------------------------
// Doctor fetches patient data
// ----------------------------------------------------------------------
export async function getAuthorizedData(patientId: string, doctorId: string) {
  const response = await fetch(
    `${API_BASE}/api/patient/${patientId}/data?doctorId=${doctorId}`
  );

  const data = await response.json();

  // Normalize image URLs
  try {
    if (data?.medical?.labs) {
      data.medical.labs = data.medical.labs.map((lab: any) => {
        if (Array.isArray(lab.images)) {
          lab.images = lab.images.map((url: string) => normalizeImageUrl(url));
        }
        return lab;
      });
    }
  } catch {}

  return data;
}

// ----------------------------------------------------------------------
// Patient audit log
// ----------------------------------------------------------------------
export async function getAudit(patientId: string) {
  const response = await fetch(`${API_BASE}/api/audit/${patientId}`);
  return response.json();
}

// ----------------------------------------------------------------------
// Doctor request history
// ----------------------------------------------------------------------
export async function getDoctorRequests(doctorId: string) {
  const response = await fetch(`${API_BASE}/api/requests/doctor/${doctorId}`);
  return response.json();
}
