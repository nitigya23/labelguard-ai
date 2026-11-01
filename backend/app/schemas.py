import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ProductMasterOut(BaseModel):
    id: int
    name: str
    model_code: str
    regulatory_region: str
    storage_temp_min: float
    storage_temp_max: float
    storage_temp_unit: str
    storage_temp_text: str
    manufacturer_name: str
    manufacturer_address: str
    udi_di: str
    expiry_format: str
    sterilization_method: str
    ce_notified_body: str
    lot_number: str

    class Config:
        from_attributes = True

class LabelRecordOut(BaseModel):
    id: int
    label_code: str
    name: str
    label_type: str
    language: str
    target_region: str
    current_version: str
    status: str
    content_text_v2: str
    content_text_v3: Optional[str] = None
    image_v2: Optional[str] = None
    image_v3: Optional[str] = None
    barcode_data: Optional[str] = None
    has_udi: bool
    has_temp_symbol: bool
    has_mfg_symbol: bool
    has_expiry_symbol: bool
    has_ce_mark: bool
    affected: Optional[bool] = False

    class Config:
        from_attributes = True

class ChangeRequestIn(BaseModel):
    description: str

class ChangeRequestOut(BaseModel):
    id: int
    title: str
    raw_input: str
    field_key: str
    old_value: str
    new_value: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ImpactGraphNode(BaseModel):
    id: str
    label: str
    type: str # "product_field", "label", "regulatory_rule"
    category: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ImpactGraphEdge(BaseModel):
    source: str
    target: str
    relationship: str

class ImpactSummaryOut(BaseModel):
    change_request: ChangeRequestOut
    total_labels: int
    affected_labels_count: int
    affected_percentage: float
    affected_label_ids: List[int]
    nodes: List[ImpactGraphNode]
    edges: List[ImpactGraphEdge]

class RuleCheckItem(BaseModel):
    rule_id: str
    title: str
    source: str
    severity: str
    status: str # PASS, FLAG, CHANGED
    finding: str
    recommendation: Optional[str] = None

class LabelDraftAndChecksOut(BaseModel):
    label_id: int
    label_code: str
    label_name: str
    label_type: str
    language: str
    current_text: str
    drafted_text: str
    is_affected: bool
    checks: List[RuleCheckItem]
    pass_count: int
    flag_count: int
    changed_count: int

class RedlineDiffResponse(BaseModel):
    label_id: int
    label_code: str
    label_name: str
    image_v2_url: str
    image_v3_url: str
    redline_image_url: str
    difference_count: int
    detected_changes: List[str]
    flags: List[str]
    text_diff_html: str

class ApprovalSubmission(BaseModel):
    change_request_id: int
    actor_name: str
    actor_role: str
    decision: str # "APPROVED" or "REJECTED"
    comments: Optional[str] = ""

class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime.datetime
    action: str
    actor_name: str
    actor_role: str
    change_request_id: Optional[int] = None
    label_id: Optional[int] = None
    details: Optional[str] = None

    class Config:
        from_attributes = True
