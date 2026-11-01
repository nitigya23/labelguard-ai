from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LabelRecord, ChangeRequest
from ..schemas import RedlineDiffResponse
from ..services.redline_service import redline_service

router = APIRouter(prefix="/api/redline", tags=["Visual Redline"])

@router.get("/{label_id}", response_model=RedlineDiffResponse)
def get_label_redline(label_id: int, db: Session = Depends(get_db)):
    label = db.query(LabelRecord).filter(LabelRecord.id == label_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label record not found.")

    res = redline_service.compute_visual_redline(
        label_code=label.label_code,
        image_v2_name=label.image_v2 or f"{label.label_code.lower()}_v2.png",
        image_v3_name=label.image_v3 or f"{label.label_code.lower()}_v3.png",
        text_v2=label.content_text_v2,
        text_v3=label.content_text_v3 or label.content_text_v2
    )

    return {
        "label_id": label.id,
        "label_code": label.label_code,
        "label_name": label.name,
        "image_v2_url": f"/static/labels/{label.image_v2}",
        "image_v3_url": f"/static/labels/{label.image_v3}",
        "redline_image_url": res["redline_image_url"],
        "difference_count": res["difference_count"],
        "detected_changes": res["detected_changes"],
        "flags": res["flags"],
        "text_diff_html": res["text_diff_html"]
    }
