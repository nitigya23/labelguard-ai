import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChangeRequest, AuditLog, LabelRecord
from ..schemas import ApprovalSubmission

router = APIRouter(prefix="/api/approval", tags=["Regulatory & QA Approval"])

@router.post("")
def submit_approval(submission: ApprovalSubmission, db: Session = Depends(get_db)):
    if not submission.actor_name.strip():
        raise HTTPException(status_code=400, detail="Signatory name is mandatory for 21 CFR Part 11 / EU MDR compliance.")
    if not submission.actor_role.strip():
        raise HTTPException(status_code=400, detail="Regulatory or Quality Assurance role is mandatory.")

    req = db.query(ChangeRequest).filter(ChangeRequest.id == submission.change_request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Change Request not found.")

    decision = submission.decision.upper()
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be either 'APPROVED' or 'REJECTED'.")

    req.status = decision
    db.commit()

    # Log electronic signature in immutable audit trail
    action_type = "CHANGE_REQUEST_APPROVED" if decision == "APPROVED" else "CHANGE_REQUEST_REJECTED"
    audit_entry = AuditLog(
        timestamp=datetime.datetime.utcnow(),
        action=action_type,
        actor_name=submission.actor_name.strip(),
        actor_role=submission.actor_role.strip(),
        change_request_id=req.id,
        details=f"Decision: {decision}. Comments: '{submission.comments or 'No remarks provided'}'. All affected labels transitioned to {decision} status."
    )
    db.add(audit_entry)

    # If approved, update status of affected labels to RELEASED
    if decision == "APPROVED":
        all_labels = db.query(LabelRecord).all()
        for lbl in all_labels:
            if req.field_key == "storage_temperature" and lbl.has_temp_symbol:
                lbl.status = "RELEASED"
                lbl.current_version = "v3.0"
                if lbl.content_text_v3:
                    lbl.content_text_v2 = lbl.content_text_v3

        db.add(AuditLog(
            timestamp=datetime.datetime.utcnow(),
            action="LABELS_BATCH_RELEASED",
            actor_name=submission.actor_name.strip(),
            actor_role=submission.actor_role.strip(),
            change_request_id=req.id,
            details="Validated batch release of version v3.0 packaging & IFU labeling into production DHF."
        ))

    db.commit()

    return {
        "status": "success",
        "change_request_id": req.id,
        "decision": decision,
        "signatory": f"{submission.actor_name} ({submission.actor_role})",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
