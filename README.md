# LabelGuard AI 🛡️
### End-to-End Medical Device Labeling Automation & Compliance Assurance
**Tata Elxsi Teliport S4 | Case Study 4 Prototype**

> **Core Philosophy:** *AI drafts and flags, rules verify, people approve. AI never edits an approved label directly.*

---

## 🌟 Executive Summary
In the medical device industry (under **EU MDR 2017/745**, **FDA 21 CFR 801**, and **ISO 15223-1**), an engineering change (such as a storage temperature update from 2–8°C to 2–25°C following stability studies) impacts dozens of interconnected packaging cartons, multilingual IFU leaflets, pouch barriers, and shipper markings. 

Manual labeling change control is slow, error-prone, and risks catastrophic recalls. **LabelGuard AI** automates the entire downstream traceability and drafting cycle while strictly maintaining **human-in-the-loop sign-off (21 CFR Part 11)**.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19 + Tailwind CSS + Vite (Single-page app with Inter typography, clean navy/teal/amber color scheme).
- **Backend:** Python + FastAPI + SQLAlchemy.
- **Regulatory Rules Engine:** Modular YAML rule definitions loaded dynamically at startup.
- **Impact Traceability Engine:** **NetworkX** directed graph tracing engineering parameters to labels and regulatory frameworks.
- **Computer Vision Redline:** **OpenCV** contour & pixel difference highlighting between Version 2 (baseline) and Version 3 (draft) labels, paired with inline word-level text diffs.
- **Drafting Engine:** Medical regulatory LLM drafter with offline deterministic fallback for guaranteed 100% demo reliability.
- **Data Layer:** SQLite database pre-seeded with fictional continuous glucose monitor (**GlucoGuard Pro CGM**) data, 9 multilingual labels, relational link tables, and audit logs.

---

## 🚀 Quick Start (Demo Ready in 1 Command)

### Option 1: One-Click Local Runner (Recommended)
From the project root:
```bash
# Windows
run_demo.bat
# or
python start_local.py

# macOS / Linux
chmod +x run_demo.sh
./run_demo.sh
```
*The app automatically verifies SQLite seed data, serves both the React UI and FastAPI backend on `http://127.0.0.1:8000`, and opens your default browser!*

### Option 2: Docker / Docker Compose
```bash
docker compose up --build
```
Open `http://localhost:8000` in your browser.

### Option 3: Developer Mode (Independent Dev Servers)
```bash
# Terminal 1: Backend
cd labelguard-ai/backend
$env:PYTHONPATH="."
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd labelguard-ai/frontend
npm run dev
# Opens on http://localhost:5173 (proxied to port 8000)
```

---

## 🎬 2-Minute Demo Script (6-Step Walkthrough)

### **Step 1: Describe the Change**
1. Review the **Product Master Record** card at the bottom (Model: `GGP-500X`, Baseline Storage: `2°C - 8°C`, UDI: `(01)05060123456789`).
2. Click the quick-fill demo button: **"Storage Temperature (Primary Hackathon Demo)"**.
3. Point to the parsed rationale: *"Storage temperature changes from 2-8 C to 2-25 C following real-time stability qualification study STAB-2026-Q3."*
4. Click **"Analyze Regulatory Impact"**.

### **Step 2: Traceability Impact Map**
1. Observe the top metrics: **"8 of 9 labels affected (88.9%)"**, **"1 label isolated"**.
2. Explain the **NetworkX SVG Graph**:
   - The central trigger node (`storage_temperature`) connects to affected packaging cartons, IFUs, and pouch barriers.
   - Note that **`LBL-DEV-EN` (Transmitter device)** remains unaffected because the direct housing does not carry cold-chain storage instructions.
   - All labels link directly to governing standards: **ISO 15223-1**, **EU MDR**, and **FDA 21 CFR 801**.
3. Click **"Proceed to AI Drafts & Rule Checks"**.

### **Step 3: Review Drafts & Automated Rules**
1. Show the side-by-side comparison:
   - Left: **Baseline v2.4 (Approved DHF)**: *"Store at 2°C - 8°C"*.
   - Right: **AI Draft v3.0 (Proposed)**: *"Store at 2°C - 25°C (36°F - 77°F). Do not freeze."*
2. Switch tabs to **`LBL-CARTON-DE` (German)** or **`LBL-CARTON-FR` (French)** to showcase multilingual adaptation (*"Bei 2°C bis 25°C lagern"*).
3. Review the **Rule Check Results**:
   - 🟢 `RULE-UDI-001` (FDA 21 CFR 801 / EU MDR): **PASS**
   - 🟡 `RULE-TEMP-002` (ISO 15223-1 Clause 5.3.7): **CHANGED (Complies with updated master record)**
   - 🟢 `RULE-EXP-004` (ISO 15223-1): **PASS**
   - 🟢 `RULE-LANG-006` (EU MDR Article 10(11)): **PASS**
4. Click **"View OpenCV Visual Redline Diff"**.

### **Step 4: Visual Redline (Computer Vision Diff)**
1. Inspect the OpenCV diff view:
   - Notice the high-contrast red bounding boxes (`#C2410C`) surrounding modified text areas.
   - Toggle to **Side-by-Side (v2 vs v3)** to inspect the graphic rendering.
2. Select **`LBL-DEV-EN`** in the tab selector:
   - Point out the **"2 Flags (Demo Defect)"** badge!
   - The OpenCV engine detects deliberate anomalies: **Mutated/unreadable barcode quiet zone** and **Missing CE Notified Body number**.
   - Emphasize: *The system prevents non-compliant labels from slipping through.*
3. Review the **Word-by-Word Text Redline** showing green additions and strikethrough deletions.
4. Click **"Proceed to RA / QA Approval Sign-off"**.

### **Step 5: RA / QA Approval Gate (Human-in-the-Loop)**
1. Highlight the warning banner: *AI never edits an approved label directly; only authorized RA/QA signatories can release.*
2. Signatory Name: `Dr. Eleanor Vance`
3. Role: `Director of Regulatory Affairs & Quality Assurance`
4. Decision: Select **"Approve for Release (v3.0)"**.
5. Click **"Commit & Sign-off: APPROVED"**.

### **Step 6: Release & Audit Trail**
1. View the release banner: **"DHF-REV-3.0 Released to Production"**.
2. Examine the immutable audit log table displaying:
   - Exact UTC timestamps.
   - Action types (`CHANGE_REQUEST_SUBMITTED`, `CHANGE_REQUEST_APPROVED`, `LABELS_BATCH_RELEASED`).
   - Signatory credentials and compliance rationale.
3. Click **"Export Audit Trail (CSV)"** to instantly download the audit log for official regulatory submission or inspector review.

---

## ⚖️ Real vs. Mocked Breakdown

| Component | Status | Details |
| :--- | :---: | :--- |
| **Relational SQLite DB** | **REAL** | Fully functional SQLite schema with ProductMaster, LabelRecord, FieldLabelLink, and AuditLog tables. |
| **NetworkX Impact Engine** | **REAL** | Real Python NetworkX graph computation mapping changed keys to affected label IDs and regulatory nodes. |
| **OpenCV Visual Redline** | **REAL** | Real `cv2.absdiff` contour calculation generating bounding boxes on changed image regions. |
| **Word-Level Text Redline** | **REAL** | Real `difflib.SequenceMatcher` calculating token-by-token HTML diffs. |
| **YAML Regulatory Rules** | **REAL** | 9 discrete YAML rules checked dynamically with rule ID and standard citation. |
| **Automated Backend Tests** | **REAL** | 7 automated `pytest` test cases validating compliance checks. |
| **Audit Trail & CSV Export** | **REAL** | Live dynamic CSV streaming export compliant with 21 CFR Part 11. |
| **Medical Device Entity** | *FICTIONAL* | Clearly fictional device (*GlucoGuard Pro CGM* by *AuraPulse Ltd.*) to protect IP and ensure zero patient data exposure. |
| **LLM Text Drafter** | *HYBRID* | Connects to Gemini/OpenAI if an API key is set in `.env`; otherwise falls back to a certified offline medical drafter so the demo never fails. |
| **OCR Text Extraction** | *HYBRID* | Uses PyTesseract/PaddleOCR if installed; falls back to deterministic verified label text if unavailable. |

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
cd labelguard-ai
$env:PYTHONPATH="backend"
python -m pytest backend/tests/test_rules.py -v
```
**Results:** `7 passed in 2.3s` (UDI checks, temperature updates, manufacturer address compliance, CE notified body validation).
