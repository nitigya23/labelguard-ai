from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChangeRequest, LabelRecord, ProductMaster, FieldLabelLink, ComplianceResult
from ..schemas import LabelDraftAndChecksOut
from ..services.llm_service import llm_drafter
from ..services.rule_engine import rule_engine

router = APIRouter(prefix="/api/drafts-and-checks", tags=["Drafts & Rule Verification"])

@router.get("/{change_request_id}", response_model=List[LabelDraftAndChecksOut])
def get_drafts_and_rule_checks(change_request_id: int, db: Session = Depends(get_db)):
    req = db.query(ChangeRequest).filter(ChangeRequest.id == change_request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Change Request not found.")

    master = db.query(ProductMaster).first()
    if not master:
        raise HTTPException(status_code=404, detail="Product Master record missing.")

    # Find affected labels
    links = db.query(FieldLabelLink).filter(FieldLabelLink.field_key == req.field_key).all()
    affected_ids = set(link.label_id for link in links)

    all_labels = db.query(LabelRecord).all()
    output = []

    for label in all_labels:
        is_affected = label.id in affected_ids
        
        # Draft updated text (if affected, adapt to new parameter)
        if is_affected:
            drafted_text = llm_drafter.draft_updated_text(
                label=label,
                master=master,
                field_changed=req.field_key,
                old_val=req.old_value,
                new_val=req.new_value
            )
        else:
            drafted_text = label.content_text_v2 # Remains unchanged

        # Run compliance rules
        checks = rule_engine.evaluate_label(
            label=label,
            master=master,
            draft_text=drafted_text,
            field_changed=req.field_key,
            new_value=req.new_value
        )

        pass_count = sum(1 for c in checks if c["status"] == "PASS")
        flag_count = sum(1 for c in checks if c["status"] == "FLAG")
        changed_count = sum(1 for c in checks if c["status"] == "CHANGED")

        output.append({
            "label_id": label.id,
            "label_code": label.label_code,
            "label_name": label.name,
            "label_type": label.label_type,
            "language": label.language,
            "current_text": label.content_text_v2,
            "drafted_text": drafted_text,
            "is_affected": is_affected,
            "checks": checks,
            "pass_count": pass_count,
            "flag_count": flag_count,
            "changed_count": changed_count
        })

    return output
