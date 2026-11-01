from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChangeRequest
from ..schemas import ImpactSummaryOut, ChangeRequestOut
from ..services.impact_engine import impact_engine

router = APIRouter(prefix="/api/impact", tags=["Impact Analysis"])

@router.get("/{change_request_id}", response_model=ImpactSummaryOut)
def get_impact_summary(change_request_id: int, db: Session = Depends(get_db)):
    req = db.query(ChangeRequest).filter(ChangeRequest.id == change_request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Change Request not found.")

    summary = impact_engine.compute_impact(db, req.field_key)

    return {
        "change_request": req,
        "total_labels": summary["total_labels"],
        "affected_labels_count": summary["affected_labels_count"],
        "affected_percentage": summary["affected_percentage"],
        "affected_label_ids": summary["affected_label_ids"],
        "nodes": summary["nodes"],
        "edges": summary["edges"]
    }
