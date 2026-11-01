import io
import csv
from typing import List
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog
from ..schemas import AuditLogOut

router = APIRouter(prefix="/api/audit", tags=["Audit Trail & Release Logs"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_trail(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return logs

@router.get("/export-csv")
def export_audit_csv(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Log ID",
        "Timestamp (UTC)",
        "Action Type",
        "Actor Name",
        "Actor Role",
        "Change Request ID",
        "Label ID",
        "Audit Details"
    ])

    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
            log.action,
            log.actor_name,
            log.actor_role,
            log.change_request_id or "",
            log.label_id or "",
            log.details or ""
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=LabelGuard_Audit_Trail.csv"}
    )
