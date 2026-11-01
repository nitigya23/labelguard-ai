import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class ProductMaster(Base):
    __tablename__ = "product_master"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    model_code = Column(String(100), nullable=False)
    regulatory_region = Column(String(100), default="EU / Global (CE 0123 + FDA 510(k))")
    storage_temp_min = Column(Float, default=2.0)
    storage_temp_max = Column(Float, default=8.0)
    storage_temp_unit = Column(String(20), default="°C")
    storage_temp_text = Column(String(255), default="Store at 2°C - 8°C (36°F - 46°F). Do not freeze.")
    manufacturer_name = Column(String(200), default="AuraPulse Medical Devices Ltd.")
    manufacturer_address = Column(String(300), default="74 Innovation Way, Galway Medical Tech Park, Galway, H91 V4X2, Ireland")
    udi_di = Column(String(100), default="(01)05060123456789")
    expiry_format = Column(String(50), default="YYYY-MM-DD")
    sterilization_method = Column(String(100), default="STERILE EO")
    ce_notified_body = Column(String(50), default="CE 0123")
    lot_number = Column(String(50), default="LOT-2026-X88")

class LabelRecord(Base):
    __tablename__ = "label_records"

    id = Column(Integer, primary_key=True, index=True)
    label_code = Column(String(50), unique=True, index=True)
    name = Column(String(200), nullable=False)
    label_type = Column(String(50), nullable=False)  # carton, ifu, device, shipping
    language = Column(String(20), default="en")     # en, de, fr
    target_region = Column(String(50), default="Global")
    current_version = Column(String(20), default="v2.4")
    status = Column(String(50), default="APPROVED")  # APPROVED, DRAFT_PENDING, IN_REVIEW, RELEASED
    content_text_v2 = Column(Text, nullable=False)
    content_text_v3 = Column(Text, nullable=True)
    image_v2 = Column(String(200), nullable=True)
    image_v3 = Column(String(200), nullable=True)
    barcode_data = Column(String(100), nullable=True)
    has_udi = Column(Boolean, default=True)
    has_temp_symbol = Column(Boolean, default=True)
    has_mfg_symbol = Column(Boolean, default=True)
    has_expiry_symbol = Column(Boolean, default=True)
    has_ce_mark = Column(Boolean, default=True)

    links = relationship("FieldLabelLink", back_populates="label")

class FieldLabelLink(Base):
    __tablename__ = "field_label_links"

    id = Column(Integer, primary_key=True, index=True)
    field_key = Column(String(100), index=True) # storage_temperature, manufacturer_address, udi_di, etc.
    label_id = Column(Integer, ForeignKey("label_records.id"))
    section_name = Column(String(100))
    display_text = Column(String(255))

    label = relationship("LabelRecord", back_populates="links")

class ChangeRequest(Base):
    __tablename__ = "change_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    raw_input = Column(Text, nullable=False)
    field_key = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=False)
    new_value = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING_REVIEW") # PENDING_REVIEW, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(Integer, primary_key=True, index=True)
    change_request_id = Column(Integer, ForeignKey("change_requests.id"))
    label_id = Column(Integer, ForeignKey("label_records.id"))
    rule_id = Column(String(50))
    rule_title = Column(String(255))
    rule_source = Column(String(100))
    severity = Column(String(50)) # CRITICAL, HIGH, MEDIUM, INFO
    status = Column(String(50))   # PASS, FLAG, CHANGED
    finding = Column(Text)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String(100), nullable=False)
    actor_name = Column(String(100), nullable=False)
    actor_role = Column(String(100), nullable=False)
    change_request_id = Column(Integer, nullable=True)
    label_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
