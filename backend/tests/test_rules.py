import pytest
from app.services.rule_engine import RuleEngine
from app.models import LabelRecord, ProductMaster

@pytest.fixture
def rule_engine():
    return RuleEngine()

@pytest.fixture
def sample_master():
    return ProductMaster(
        name="GlucoGuard Pro CGM",
        model_code="GGP-500X",
        storage_temp_min=2.0,
        storage_temp_max=8.0,
        storage_temp_text="Store at 2°C - 8°C",
        manufacturer_name="AuraPulse Medical Devices Ltd.",
        manufacturer_address="74 Innovation Way, Galway, Ireland",
        udi_di="(01)05060123456789",
        expiry_format="YYYY-MM-DD",
        sterilization_method="STERILE EO",
        ce_notified_body="CE 0123"
    )

@pytest.fixture
def sample_carton_label():
    return LabelRecord(
        label_code="LBL-CARTON-EN",
        name="Carton Packaging EN",
        label_type="carton",
        language="en",
        target_region="Global",
        has_udi=True,
        has_temp_symbol=True,
        content_text_v2="GlucoGuard Pro (GGP-500X). AuraPulse Medical Devices Ltd., Galway, Ireland. Store at 2°C - 8°C. UDI: (01)05060123456789. CE 0123. Exp: 2028-09-30."
    )

def test_rule_count_loaded(rule_engine):
    """Test that at least 8 YAML regulatory rules are loaded on startup."""
    rules = rule_engine.get_all_rules()
    assert len(rules) >= 8
    rule_ids = [r["id"] for r in rules]
    assert "RULE-UDI-001" in rule_ids
    assert "RULE-TEMP-002" in rule_ids

def test_rule_udi_presence_pass(rule_engine, sample_carton_label, sample_master):
    """Test UDI presence rule passes when valid (01) DI is in label text."""
    results = rule_engine.evaluate_label(
        label=sample_carton_label,
        master=sample_master,
        draft_text=sample_carton_label.content_text_v2,
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    udi_check = next(c for c in results if c["rule_id"] == "RULE-UDI-001")
    assert udi_check["status"] == "PASS"
    assert "FDA 21 CFR 801" in udi_check["source"]

def test_rule_udi_presence_flag(rule_engine, sample_carton_label, sample_master):
    """Test UDI rule flags critical violation when DI string is omitted."""
    corrupted_text = "GlucoGuard Pro. Storage 2-8 C. AuraPulse Galway. CE 0123. Exp 2028-09-30."
    results = rule_engine.evaluate_label(
        label=sample_carton_label,
        master=sample_master,
        draft_text=corrupted_text,
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    udi_check = next(c for c in results if c["rule_id"] == "RULE-UDI-001")
    assert udi_check["status"] == "FLAG"
    assert udi_check["severity"] == "CRITICAL"

def test_rule_temperature_update_detected(rule_engine, sample_carton_label, sample_master):
    """Test temperature rule confirms status CHANGED when draft matches new limit."""
    updated_draft = sample_carton_label.content_text_v2.replace("2°C - 8°C", "2°C - 25°C")
    results = rule_engine.evaluate_label(
        label=sample_carton_label,
        master=sample_master,
        draft_text=updated_draft,
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    temp_check = next(c for c in results if c["rule_id"] == "RULE-TEMP-002")
    assert temp_check["status"] == "CHANGED"
    assert "ISO 15223-1" in temp_check["source"]

def test_rule_temperature_obsolete_flag(rule_engine, sample_carton_label, sample_master):
    """Test temperature rule raises FLAG when draft fails to harmonize with master change."""
    results = rule_engine.evaluate_label(
        label=sample_carton_label,
        master=sample_master,
        draft_text=sample_carton_label.content_text_v2, # Still has 2-8 C
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    temp_check = next(c for c in results if c["rule_id"] == "RULE-TEMP-002")
    assert temp_check["status"] == "FLAG"

def test_rule_manufacturer_address_check(rule_engine, sample_carton_label, sample_master):
    """Test manufacturer rule flags omission of legal entity and facility location."""
    missing_mfg_text = "GlucoGuard Pro. Store at 2°C - 25°C. UDI: (01)05060123456789. CE 0123."
    results = rule_engine.evaluate_label(
        label=sample_carton_label,
        master=sample_master,
        draft_text=missing_mfg_text,
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    mfg_check = next(c for c in results if c["rule_id"] == "RULE-MFG-003")
    assert mfg_check["status"] == "FLAG"

def test_rule_ce_mark_notified_body_flag(rule_engine, sample_master):
    """Test CE mark rule flags device label if Notified Body designation is omitted."""
    device_label = LabelRecord(
        label_code="LBL-DEV-EN",
        name="Device Transmitter Label",
        label_type="device",
        language="en",
        target_region="EU / Global",
        has_udi=True,
        has_temp_symbol=False,
        content_text_v2="TX-50. AuraPulse Ltd. SN: AP-99. UDI: (01)05060123456789. CE [FLAG-OMITTED]."
    )
    results = rule_engine.evaluate_label(
        label=device_label,
        master=sample_master,
        draft_text=device_label.content_text_v2,
        field_changed="storage_temperature",
        new_value="Store at 2°C - 25°C"
    )
    ce_check = next(c for c in results if c["rule_id"] == "RULE-CE-009")
    assert ce_check["status"] == "FLAG"
    assert "EU MDR" in ce_check["source"]
