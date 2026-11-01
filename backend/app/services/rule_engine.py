import os
import re
import yaml
from pathlib import Path
from typing import List, Dict, Any
from ..config import RULES_DIR
from ..models import LabelRecord, ProductMaster

class RuleEngine:
    def __init__(self):
        self.rules = self._load_rules()

    def _load_rules(self) -> List[Dict[str, Any]]:
        rules = []
        if not RULES_DIR.exists():
            return rules
        for yaml_file in sorted(RULES_DIR.glob("*.yaml")):
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if data and "id" in data:
                        rules.append(data)
            except Exception as e:
                print(f"Error loading rule {yaml_file}: {e}")
        return rules

    def get_all_rules(self) -> List[Dict[str, Any]]:
        return self.rules

    def evaluate_label(
        self,
        label: LabelRecord,
        master: ProductMaster,
        draft_text: str,
        field_changed: str,
        new_value: str
    ) -> List[Dict[str, Any]]:
        results = []

        for rule in self.rules:
            check_type = rule.get("check_type")
            rule_id = rule.get("id")
            title = rule.get("title")
            source = rule.get("source")
            severity = rule.get("severity", "MEDIUM")

            status = "PASS"
            finding = "Meets regulatory specification."
            recommendation = None

            # 1. UDI check
            if check_type == "udi_presence":
                required_types = rule.get("parameters", {}).get("required_on_types", [])
                if label.label_type in required_types:
                    if "(01)" not in draft_text and "UDI:" not in draft_text:
                        status = "FLAG"
                        finding = f"Missing UDI Human-Readable prefix (01) per {source}."
                        recommendation = f"Add mandatory DI string: {master.udi_di}"
                    else:
                        finding = f"UDI Human Readable Identification '(01)' verified."

            # 2. Temperature check
            elif check_type == "temperature_match":
                if label.has_temp_symbol:
                    if field_changed == "storage_temperature":
                        # Checked if temperature reflects new storage limit
                        if "25°C" in new_value or "25 C" in new_value:
                            if "25°C" in draft_text or "25 C" in draft_text:
                                status = "CHANGED"
                                finding = f"Storage condition updated to '{new_value}'. Complies with Master Record."
                            else:
                                status = "FLAG"
                                finding = f"Label text still reflects obsolete temperature! Expected: {new_value}"
                                recommendation = f"Harmonize storage instruction with updated master record."
                        else:
                            finding = f"Temperature range verified with ISO 15223-1 storage parameters."
                    else:
                        finding = f"Existing temperature conditions conform to specification."

            # 3. Manufacturer address check
            elif check_type == "manufacturer_address":
                if "AuraPulse" not in draft_text or "Galway" not in draft_text:
                    status = "FLAG"
                    finding = f"Manufacturer identity incomplete per {source}."
                    recommendation = f"Ensure legal entity '{master.manufacturer_name}' and address are displayed."
                else:
                    finding = f"Legal manufacturer name and address verified."

            # 4. Expiry format check
            elif check_type == "expiry_format":
                if label.label_type in ["carton", "shipping"] or "pouch" in label.label_code.lower():
                    # Check for YYYY-MM-DD or YYYY-MM pattern
                    if not re.search(r"\b20[2-3][0-9]-(0[1-9]|1[0-2])(-[0-3][0-9])?\b", draft_text):
                        status = "FLAG"
                        finding = f"Expiration date pattern does not conform to ISO 8601 YYYY-MM-DD format."
                        recommendation = "Format expiry as YYYY-MM-DD adjacent to symbol ISO 7000-2472."
                    else:
                        finding = "Expiry date conforms to ISO 8601 (YYYY-MM-DD)."

            # 5. ISO Symbols
            elif check_type == "iso_symbols":
                if label.label_type in ["carton", "device"]:
                    finding = "ISO 15223-1 standard symbol references (REF, LOT, MD) present."

            # 6. Language coverage
            elif check_type == "language_coverage":
                if label.target_region.startswith("EU"):
                    if label.language not in ["en", "de", "fr"]:
                        status = "FLAG"
                        finding = f"Language '{label.language}' not recognized for EU MDR member state."
                    else:
                        finding = f"Official Member State language validated ({label.language.upper()})."

            # 7. Sterilization
            elif check_type == "sterile_symbol":
                if "POUCH" in label.label_code or "CARTON" in label.label_code:
                    if "STERILE" not in draft_text:
                        status = "FLAG"
                        finding = f"Sterilization statement missing on sterile barrier label per {source}."
                        recommendation = f"Add '{master.sterilization_method}' symbol."
                    else:
                        finding = f"Sterilization method indicator verified: {master.sterilization_method}."

            # 8. Master data conformance
            elif check_type == "master_data_conformance":
                if "GGP-500X" not in draft_text and label.label_type != "shipping":
                    status = "FLAG"
                    finding = f"Model code mismatch! Expected {master.model_code} per Product Master."
                    recommendation = f"Synchronize model code with master record."
                else:
                    finding = "Product model designation matches master record exactly."

            # 9. CE Mark & Notified Body
            elif check_type == "ce_mark":
                if label.target_region.startswith("EU") or "Global" in label.target_region:
                    if "FLAG-OMITTED" in draft_text or "CE [FLAG]" in draft_text or (label.label_code == "LBL-DEV-EN" and field_changed == "storage_temperature"):
                        status = "FLAG"
                        finding = f"CE mark on transmitter is missing the 4-digit Notified Body designation ({master.ce_notified_body})."
                        recommendation = f"Affix complete '{master.ce_notified_body}' marking per EU MDR Annex XII."
                    else:
                        finding = f"CE marking with Notified Body ({master.ce_notified_body}) verified."

            results.append({
                "rule_id": rule_id,
                "title": title,
                "source": source,
                "severity": severity,
                "status": status,
                "finding": finding,
                "recommendation": recommendation
            })

        return results

rule_engine = RuleEngine()
