const API_BASE = "";

export async function fetchProductMaster() {
  const res = await fetch(`${API_BASE}/api/master`);
  if (!res.ok) throw new Error("Failed to load Product Master Record.");
  return res.json();
}

export async function submitChangeRequest(description) {
  const res = await fetch(`${API_BASE}/api/change-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit change request.");
  }
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/api/reset-demo`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo data.");
  return res.json();
}

export async function fetchImpactSummary(changeRequestId) {
  const res = await fetch(`${API_BASE}/api/impact/${changeRequestId}`);
  if (!res.ok) throw new Error("Failed to compute regulatory impact graph.");
  return res.json();
}

export async function fetchDraftsAndChecks(changeRequestId) {
  const res = await fetch(`${API_BASE}/api/drafts-and-checks/${changeRequestId}`);
  if (!res.ok) throw new Error("Failed to fetch drafts and regulatory rules.");
  return res.json();
}

export async function fetchLabelRedline(labelId) {
  const res = await fetch(`${API_BASE}/api/redline/${labelId}`);
  if (!res.ok) throw new Error("Failed to generate OpenCV visual redline.");
  return res.json();
}

export async function submitApproval(payload) {
  const res = await fetch(`${API_BASE}/api/approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to record QA/RA approval.");
  }
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/api/audit`);
  if (!res.ok) throw new Error("Failed to load audit trail.");
  return res.json();
}

export const AUDIT_CSV_EXPORT_URL = `${API_BASE}/api/audit/export-csv`;
