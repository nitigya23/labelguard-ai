// LabelGuard AI API Client with Resilient Client-Side Engine for Standalone Vercel Hosting
const API_BASE = "";

// Baseline Product Master Record
const FALLBACK_PRODUCT_MASTER = {
  id: 1,
  name: "GlucoGuard Pro CGM System",
  model_code: "GGP-500X",
  regulatory_region: "EU / Global (CE 0123 + FDA 510(k))",
  storage_temp_min: 2.0,
  storage_temp_max: 8.0,
  storage_temp_unit: "°C",
  storage_temp_text: "Store at 2°C - 8°C (36°F - 46°F). Do not freeze.",
  manufacturer_name: "AuraPulse Medical Devices Ltd.",
  manufacturer_address: "74 Innovation Way, Galway Medical Tech Park, Galway, H91 V4X2, Ireland",
  udi_di: "(01)05060123456789",
  expiry_format: "YYYY-MM-DD",
  sterilization_method: "STERILE EO",
  ce_notified_body: "CE 0123",
  lot_number: "LOT-2026-X88"
};

// In-memory state for client-side execution
let clientChangeRequest = null;
let clientAuditLogs = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    action: "SYSTEM_INIT_BASELINE",
    actor_name: "Compliance Automation System",
    actor_role: "System Administrator",
    change_request_id: null,
    label_id: null,
    details: "Loaded baseline product master record and 9 validated labels for GlucoGuard Pro CGM System (v2.4)."
  }
];

export async function fetchProductMaster() {
  try {
    const res = await fetch(`${API_BASE}/api/master`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback to client data
  }
  return FALLBACK_PRODUCT_MASTER;
}

export async function submitChangeRequest(description) {
  try {
    const res = await fetch(`${API_BASE}/api/change-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }

  let fieldKey = "storage_temperature";
  let title = "Storage Temperature Range Update";
  let oldVal = "Store at 2°C - 8°C (36°F - 46°F). Do not freeze.";
  let newVal = "Store at 2°C - 25°C (36°F - 77°F). Do not freeze.";

  if (description.toLowerCase().includes("address")) {
    fieldKey = "manufacturer_address";
    title = "Manufacturer Legal Address Relocation";
    oldVal = "74 Innovation Way, Galway";
    newVal = "Unit 4, Westside Life Sciences Campus, Galway, H91 V4X2, Ireland";
  }

  clientChangeRequest = {
    id: Math.floor(Math.random() * 900) + 100,
    title,
    raw_input: description,
    field_key: fieldKey,
    old_value: oldVal,
    new_value: newVal,
    status: "PENDING_REVIEW",
    created_at: new Date().toISOString()
  };

  clientAuditLogs.unshift({
    id: clientAuditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action: "CHANGE_REQUEST_SUBMITTED",
    actor_name: "Initiator (Product Change Control)",
    actor_role: "Change Control Specialist",
    change_request_id: clientChangeRequest.id,
    label_id: null,
    details: `Change initiated: '${description}'. Parsed parameter: ${fieldKey}.`
  });

  return clientChangeRequest;
}

export async function resetDemoData() {
  try {
    const res = await fetch(`${API_BASE}/api/reset-demo`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (e) {}
  clientChangeRequest = null;
  return { message: "Demo sample data reset successfully." };
}

export async function fetchImpactSummary(changeRequestId) {
  try {
    const res = await fetch(`${API_BASE}/api/impact/${changeRequestId}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const fieldKey = clientChangeRequest?.field_key || "storage_temperature";
  const labels = [
    { id: 1, code: "LBL-CARTON-EN", name: "Carton Packaging (English)", type: "carton", lang: "en", aff: true },
    { id: 2, code: "LBL-CARTON-DE", name: "Umverpackung Karton (Deutsch)", type: "carton", lang: "de", aff: true },
    { id: 3, code: "LBL-CARTON-FR", name: "Carton Emballage (Français)", type: "carton", lang: "fr", aff: true },
    { id: 4, code: "LBL-IFU-EN", name: "IFU Patient Leaflet (English)", type: "ifu", lang: "en", aff: true },
    { id: 5, code: "LBL-IFU-DE", name: "Gebrauchsanweisung (Deutsch)", type: "ifu", lang: "de", aff: true },
    { id: 6, code: "LBL-IFU-FR", name: "Notice d'Utilisation (Français)", type: "ifu", lang: "fr", aff: true },
    { id: 7, code: "LBL-DEV-EN", name: "Transmitter Direct Device Markings", type: "device", lang: "en", aff: false },
    { id: 8, code: "LBL-SHIP-GLOBAL", name: "Bulk Shipper Master Carton", type: "shipping", lang: "en", aff: true },
    { id: 9, code: "LBL-POUCH-STERILE", name: "Sensor Pod Sterile Tyvek Pouch", type: "device", lang: "en", aff: true }
  ];

  const nodes = [
    {
      id: `field:${fieldKey}`,
      label: `Change: ${fieldKey.replace('_', ' ').toUpperCase()}`,
      type: "product_field",
      category: "trigger"
    },
    { id: "std:ISO-15223-1", label: "ISO 15223-1 (Symbols & Storage)", type: "regulatory_rule", category: "regulation" },
    { id: "std:EU-MDR", label: "EU MDR 2017/745 (Packaging & Lang)", type: "regulatory_rule", category: "regulation" },
    { id: "std:FDA-801", label: "FDA 21 CFR 801 (Medical Device Labeling)", type: "regulatory_rule", category: "regulation" }
  ];

  const edges = [];
  const affIds = [];

  labels.forEach((l) => {
    nodes.push({
      id: `label:${l.code}`,
      label: l.code,
      type: "label",
      category: l.aff ? "affected" : "unaffected",
      details: {
        id: l.id,
        code: l.code,
        name: l.name,
        type: l.type,
        language: l.lang,
        is_affected: l.aff,
        version: "v2.4"
      }
    });

    if (l.aff) {
      affIds.push(l.id);
      edges.push({ source: `field:${fieldKey}`, target: `label:${l.code}`, relationship: "IMPACTS_LABEL" });
    }
  });

  return {
    change_request: clientChangeRequest || { id: changeRequestId, field_key: fieldKey },
    total_labels: 9,
    affected_labels_count: affIds.length,
    affected_percentage: 88.9,
    affected_label_ids: affIds,
    nodes,
    edges
  };
}

export async function fetchDraftsAndChecks(changeRequestId) {
  try {
    const res = await fetch(`${API_BASE}/api/drafts-and-checks/${changeRequestId}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  return [
    {
      label_id: 1,
      label_code: "LBL-CARTON-EN",
      label_name: "Carton Outer Box Packaging (English)",
      label_type: "carton",
      language: "en",
      current_text: "GlucoGuard Pro CGM System (GGP-500X). Manufacturer: AuraPulse Medical Devices Ltd., 74 Innovation Way, Galway, Ireland. Store at 2°C - 8°C (36°F - 46°F). Do not freeze. UDI: (01)05060123456789. CE 0123. STERILE EO. Expiry: 2028-09-30.",
      drafted_text: "GlucoGuard Pro CGM System (GGP-500X). Manufacturer: AuraPulse Medical Devices Ltd., 74 Innovation Way, Galway, Ireland. Store at 2°C - 25°C (36°F - 77°F). Do not freeze. UDI: (01)05060123456789. CE 0123. STERILE EO. Expiry: 2028-09-30.",
      is_affected: true,
      pass_count: 8,
      flag_count: 0,
      changed_count: 1,
      checks: [
        { rule_id: "RULE-UDI-001", title: "UDI Barcode and HRI Verification", source: "FDA 21 CFR 801.20 / EU MDR Annex VI", severity: "CRITICAL", status: "PASS", finding: "UDI Human Readable Identification '(01)' verified." },
        { rule_id: "RULE-TEMP-002", title: "Storage Temperature Compliance", source: "ISO 15223-1:2021 Clause 5.3.7", severity: "CRITICAL", status: "CHANGED", finding: "Storage condition updated to 'Store at 2°C - 25°C'. Complies with Master Record." },
        { rule_id: "RULE-MFG-003", title: "Legal Manufacturer Identification", source: "EU MDR Annex I / FDA 21 CFR 801.1", severity: "HIGH", status: "PASS", finding: "Legal manufacturer name and address verified." },
        { rule_id: "RULE-EXP-004", title: "Expiration Date Format Verification", source: "ISO 15223-1 Clause 5.1.4", severity: "HIGH", status: "PASS", finding: "Expiry date conforms to ISO 8601 (YYYY-MM-DD)." },
        { rule_id: "RULE-LANG-006", title: "EU MDR Mandatory Language Coverage", source: "EU MDR 2017/745 Article 10(11)", severity: "CRITICAL", status: "PASS", finding: "Official language validated (EN)." }
      ]
    },
    {
      label_id: 2,
      label_code: "LBL-CARTON-DE",
      label_name: "Umverpackung Karton (Deutsch)",
      label_type: "carton",
      language: "de",
      current_text: "GlucoGuard Pro KGM System (GGP-500X). Hersteller: AuraPulse Medical Devices Ltd., Galway, Irland. Bei 2°C bis 8°C lagern. Vor Frost schützen. UDI: (01)05060123456789. CE 0123. STERILE EO.",
      drafted_text: "GlucoGuard Pro KGM System (GGP-500X). Hersteller: AuraPulse Medical Devices Ltd., Galway, Irland. Bei 2°C bis 25°C lagern. Vor Frost schützen. UDI: (01)05060123456789. CE 0123. STERILE EO.",
      is_affected: true,
      pass_count: 8,
      flag_count: 0,
      changed_count: 1,
      checks: [
        { rule_id: "RULE-TEMP-002", title: "Storage Temperature Compliance", source: "ISO 15223-1:2021 Clause 5.3.7", severity: "CRITICAL", status: "CHANGED", finding: "Lagerung aktualisiert auf '2°C bis 25°C'. Harmoniert mit Produktdaten." },
        { rule_id: "RULE-LANG-006", title: "EU MDR Mandatory Language Coverage", source: "EU MDR 2017/745 Article 10(11)", severity: "CRITICAL", status: "PASS", finding: "Deutsche Kennzeichnung entspricht EU MDR." }
      ]
    },
    {
      label_id: 3,
      label_code: "LBL-CARTON-FR",
      label_name: "Carton Emballage Extérieur (Français)",
      label_type: "carton",
      language: "fr",
      current_text: "Système MCG GlucoGuard Pro (GGP-500X). Fabricant: AuraPulse Medical Devices Ltd., Galway, Irlande. Conserver entre 2°C et 8°C. Ne pas congeler. UDI: (01)05060123456789. CE 0123. STERILE EO.",
      drafted_text: "Système MCG GlucoGuard Pro (GGP-500X). Fabricant: AuraPulse Medical Devices Ltd., Galway, Irlande. Conserver entre 2°C et 25°C. Ne pas congeler. UDI: (01)05060123456789. CE 0123. STERILE EO.",
      is_affected: true,
      pass_count: 8,
      flag_count: 0,
      changed_count: 1,
      checks: [
        { rule_id: "RULE-TEMP-002", title: "Storage Temperature Compliance", source: "ISO 15223-1:2021 Clause 5.3.7", severity: "CRITICAL", status: "CHANGED", finding: "Conditions de stockage actualisées à '2°C et 25°C'." }
      ]
    },
    {
      label_id: 7,
      label_code: "LBL-DEV-EN",
      label_name: "Transmitter Direct Device Label",
      label_type: "device",
      language: "en",
      current_text: "GlucoGuard TX-50. IP28. AuraPulse Ltd. SN: AP-TX-9948214. UDI: (01)05060123456789. CE 0123.",
      drafted_text: "GlucoGuard TX-50. IP28. AuraPulse Ltd. SN: AP-TX-9948214. UDI: (01)05060123456789. CE [FLAG-OMITTED].",
      is_affected: false,
      pass_count: 6,
      flag_count: 2,
      changed_count: 0,
      checks: [
        { rule_id: "RULE-CE-009", title: "CE Mark & Notified Body Identification", source: "EU MDR 2017/745 Annex XII", severity: "CRITICAL", status: "FLAG", finding: "CE mark on transmitter is missing the 4-digit Notified Body designation (CE 0123).", recommendation: "Affix complete 'CE 0123' marking per EU MDR Annex XII." },
        { rule_id: "RULE-UDI-001", title: "UDI Barcode and HRI Verification", source: "FDA 21 CFR 801.20", severity: "HIGH", status: "FLAG", finding: "Machine-readable barcode contains unreadable quiet zone distortion.", recommendation: "Re-generate GS1 DataMatrix symbol." }
      ]
    }
  ];
}

export async function fetchLabelRedline(labelId) {
  try {
    const res = await fetch(`${API_BASE}/api/redline/${labelId}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  const codeMap = {
    1: "lbl-carton-en",
    2: "lbl-carton-de",
    3: "lbl-carton-fr",
    7: "lbl-dev-en"
  };

  const filePrefix = codeMap[labelId] || "lbl-carton-en";
  const isDevice = labelId === 7;

  return {
    label_id: labelId,
    label_code: filePrefix.toUpperCase(),
    label_name: isDevice ? "Transmitter Direct Device Label" : "Carton Packaging",
    image_v2_url: `/static/labels/${filePrefix}_v2.png`,
    image_v3_url: `/static/labels/${filePrefix}_v3.png`,
    redline_image_url: `/static/labels/redline_${filePrefix}.png`,
    difference_count: isDevice ? 2 : 1,
    detected_changes: isDevice
      ? ["CE Marking altered: Missing 4-digit Notified Body identifier.", "Barcode quiet zone / code defect detected on device housing."]
      : ["Storage temperature parameter updated: 2°C-8°C → 2°C-25°C."],
    flags: isDevice
      ? ["CRITICAL FLAG: CE mark missing Notified Body ID per EU MDR Annex XII.", "FLAG: Machine-readable 1D/2D symbol unreadable."]
      : ["Human Sign-off Required: Storage condition change impacts stability claim."],
    text_diff_html: isDevice
      ? 'GlucoGuard TX-50. AuraPulse Ltd. UDI: (01)05060123456789. <span class="bg-red-100 text-red-800 line-through px-1 rounded border border-red-300">CE 0123</span> <span class="bg-red-100 text-[#C2410C] font-bold px-1 rounded border border-red-300">CE [FLAG-OMITTED]</span>'
      : 'GlucoGuard Pro CGM (GGP-500X). AuraPulse Ltd. <span class="bg-red-100 text-red-800 line-through px-1 rounded border border-red-300">Store at 2°C - 8°C (36°F - 46°F)</span> <span class="bg-emerald-100 text-emerald-800 font-semibold px-1 rounded border border-emerald-300">Store at 2°C - 25°C (36°F - 77°F)</span>. UDI: (01)05060123456789. CE 0123.'
  };
}

export async function submitApproval(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  clientAuditLogs.unshift({
    id: clientAuditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action: `CHANGE_REQUEST_${payload.decision.toUpperCase()}`,
    actor_name: payload.actor_name,
    actor_role: payload.actor_role,
    change_request_id: payload.change_request_id,
    label_id: null,
    details: `Decision: ${payload.decision}. Remarks: '${payload.comments || 'No remarks'}'. All affected labels transitioned to ${payload.decision}.`
  });

  clientAuditLogs.unshift({
    id: clientAuditLogs.length + 1,
    timestamp: new Date().toISOString(),
    action: "LABELS_BATCH_RELEASED",
    actor_name: payload.actor_name,
    actor_role: payload.actor_role,
    change_request_id: payload.change_request_id,
    label_id: null,
    details: "Validated batch release of version v3.0 packaging & IFU labeling into production DHF."
  });

  return {
    status: "success",
    decision: payload.decision,
    signatory: `${payload.actor_name} (${payload.actor_role})`,
    timestamp: new Date().toISOString()
  };
}

export async function fetchAuditLogs() {
  try {
    const res = await fetch(`${API_BASE}/api/audit`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return clientAuditLogs;
}

export const AUDIT_CSV_EXPORT_URL = `${API_BASE}/api/audit/export-csv`;
