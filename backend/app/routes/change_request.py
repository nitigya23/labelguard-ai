import re
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChangeRequest, ProductMaster, AuditLog
from ..schemas import ChangeRequestIn, ChangeRequestOut, ProductMasterOut
from ..seed_data import init_seed_data

router = APIRouter(prefix="/api", tags=["Change Request"])

@router.get("/master", response_model=ProductMasterOut)
def get_product_master(db: Session = Depends(get_db)):
    product = db.query(ProductMaster).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product Master record not found.")
    return product

@router.post("/change-request", response_model=ChangeRequestOut)
def create_change_request(payload: ChangeRequestIn, db: Session = Depends(get_db)):
    text = payload.description.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Change description cannot be empty.")

    product = db.query(ProductMaster).first()

    # Rule-based natural language parsing for demo scenarios
    field_key = "storage_temperature"
    title = "Storage Temperature Range Update"
    old_val = product.storage_temp_text if product else "2°C - 8°C"
    new_val = "Store at 2°C - 25°C (36°F - 77°F). Do not freeze."

    if "address" in text.lower() or "manufacturer" in text.lower():
        field_key = "manufacturer_address"
        title = "Manufacturer Legal Address Relocation"
        old_val = product.manufacturer_address if product else "74 Innovation Way, Galway"
        new_val = "Unit 4, Westside Life Sciences Campus, Galway, H91 V4X2, Ireland"
    elif "udi" in text.lower() or "barcode" in text.lower():
        field_key = "udi_di"
        title = "UDI Device Identifier Revision"
        old_val = product.udi_di if product else "(01)05060123456789"
        new_val = "(01)05060999888777"
    elif "steril" in text.lower():
        field_key = "sterilization_method"
        title = "Sterilization Method Validation"
        old_val = product.sterilization_method if product else "STERILE EO"
        new_val = "STERILE R (Gamma Irradiation)"
    else:
        # Standard temperature change detection
        temp_match = re.search(r"(\d+)[- ]*(?:to|-)[ ]*(\d+)\s*(?:°?C|c)", text, re.IGNORECASE)
        if temp_match:
            min_t, max_t = temp_match.group(1), temp_match.group(2)
            new_val = f"Store at {min_t}°C - {max_t}°C. Do not freeze."

    req = ChangeRequest(
        title=title,
        raw_input=text,
        field_key=field_key,
        old_value=old_val,
        new_value=new_val,
        status="PENDING_REVIEW"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # Add audit log
    db.add(AuditLog(
        action="CHANGE_REQUEST_SUBMITTED",
        actor_name="Initiator (Product Change Control)",
        actor_role="Change Control Specialist",
        change_request_id=req.id,
        details=f"Change initiated: '{text}'. Parsed target parameter: {field_key}."
    ))
    db.commit()

    return req

@router.post("/reset-demo")
def reset_demo_data():
    """Restores sample medical device product master, labels and clear logs for fresh demo."""
    init_seed_data()
    return {"message": "Demo sample data reset successfully."}
