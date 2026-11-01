import os
import json
import datetime
from PIL import Image, ImageDraw, ImageFont
from .config import LABELS_DIR
from .database import engine, SessionLocal, Base
from .models import ProductMaster, LabelRecord, FieldLabelLink, AuditLog, ChangeRequest

def generate_label_image(filename: str, title: str, subtitle: str, fields: list, version_tag: str, is_v3_with_issue: bool = False, temp_str: str = "2°C - 8°C"):
    """
    Renders a realistic medical device label image with standard ISO layout,
    symbols, barcode simulation, and border styling.
    """
    os.makedirs(LABELS_DIR, exist_ok=True)
    filepath = LABELS_DIR / filename

    width, height = 750, 480
    bg_color = (255, 255, 255)
    border_color = (11, 37, 69) # #0B2545
    text_color = (20, 25, 35)

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([(8, 8), (width - 8, height - 8)], outline=border_color, width=3)
    draw.rectangle([(14, 14), (width - 14, height - 14)], outline=(200, 215, 225), width=1)

    # Header bar
    draw.rectangle([(15, 15), (width - 15, 75)], fill=(11, 37, 69))
    draw.text((30, 25), title.upper(), fill=(255, 255, 255))
    draw.text((30, 48), subtitle, fill=(180, 210, 230))
    draw.text((width - 130, 30), f"REV: {version_tag}", fill=(242, 176, 74)) # amber highlight

    # Content section
    y_cursor = 95
    for key, val in fields:
        draw.rectangle([(25, y_cursor - 2), (180, y_cursor + 20)], fill=(240, 244, 248), outline=(210, 220, 230))
        draw.text((32, y_cursor + 2), key, fill=(11, 37, 69))
        draw.text((195, y_cursor + 2), val, fill=text_color)
        y_cursor += 30

    # Draw Storage Temperature Box (Key target for change)
    draw.rectangle([(25, 240), (width - 25, 290)], fill=(248, 250, 252), outline=(11, 114, 133), width=2)
    draw.text((35, 250), "STORAGE / LAGERUNG / STOCKAGE:", fill=(11, 114, 133))
    temp_display_color = (194, 65, 12) if "25°C" in temp_str else (11, 37, 69)
    draw.text((35, 268), f"  [ISO 5.3.7] Store at {temp_str} (Do Not Freeze) | Keep Dry", fill=temp_display_color)

    # Standard symbols bar (CE, Sterile, Consult IFU, Expiry)
    symbols_y = 310
    draw.rectangle([(25, symbols_y), (width - 25, symbols_y + 45)], fill=(243, 246, 249))
    
    # CE Mark
    if is_v3_with_issue and "device" in filename:
        # Deliberate defect: missing notified body number on device v3!
        draw.rectangle([(35, symbols_y + 8), (110, symbols_y + 36)], outline=(194, 65, 12), width=2)
        draw.text((45, symbols_y + 14), "CE [FLAG]", fill=(194, 65, 12))
    else:
        draw.rectangle([(35, symbols_y + 8), (110, symbols_y + 36)], outline=(50, 50, 50), width=1)
        draw.text((42, symbols_y + 14), "CE 0123", fill=(30, 30, 30))

    # Sterilization & IFU symbols
    draw.rectangle([(120, symbols_y + 8), (220, symbols_y + 36)], outline=(50, 50, 50), width=1)
    draw.text((128, symbols_y + 14), "STERILE | EO", fill=(30, 30, 30))

    draw.rectangle([(230, symbols_y + 8), (290, symbols_y + 36)], outline=(50, 50, 50), width=1)
    draw.text((245, symbols_y + 14), "[ i ]", fill=(30, 30, 30))

    draw.rectangle([(300, symbols_y + 8), (400, symbols_y + 36)], outline=(50, 50, 50), width=1)
    draw.text((310, symbols_y + 14), "EXP: 2028-09-30", fill=(30, 30, 30))

    draw.rectangle([(410, symbols_y + 8), (510, symbols_y + 36)], outline=(50, 50, 50), width=1)
    draw.text((420, symbols_y + 14), "LOT: 2026-X88", fill=(30, 30, 30))

    # UDI and Barcode representation
    barcode_y = 375
    draw.rectangle([(25, barcode_y), (width - 25, 465)], fill=(255, 255, 255), outline=(220, 225, 230))
    
    # Simulate Barcode lines
    if is_v3_with_issue and "device" in filename:
        # Deliberate barcode distortion for visual diff
        draw.rectangle([(35, barcode_y + 10), (250, barcode_y + 55)], fill=(254, 226, 226), outline=(194, 65, 12))
        draw.text((50, barcode_y + 25), "ERROR: BARCODE MUTATED / UNREADABLE", fill=(194, 65, 12))
    else:
        # Render clean vertical bars
        bar_x = 35
        for i in range(50):
            bar_w = 2 if (i % 3 == 0) else 4 if (i % 5 == 0) else 1
            draw.line([(bar_x, barcode_y + 10), (bar_x, barcode_y + 55)], fill=(20, 20, 20), width=bar_w)
            bar_x += bar_w + 3

    # Human Readable UDI
    draw.text((320, barcode_y + 15), "UDI-DI / GTIN: (01) 05060123456789", fill=(20, 20, 20))
    draw.text((320, barcode_y + 35), "SN: (21) AP-9948214  |  PROD: AuraPulse Galway", fill=(90, 100, 110))
    draw.text((320, barcode_y + 55), "Fictional device label for validation only", fill=(160, 170, 180))

    img.save(filepath, "PNG")
    return str(filepath)

def init_seed_data():
    """Initializes SQLite database and populates Product Master, 9 Labels, Links and Audit Logs."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for fresh demo state
    db.query(AuditLog).delete()
    db.query(ChangeRequest).delete()
    db.query(FieldLabelLink).delete()
    db.query(LabelRecord).delete()
    db.query(ProductMaster).delete()
    db.commit()

    # 1. Product Master Record
    product = ProductMaster(
        name="GlucoGuard Pro CGM System",
        model_code="GGP-500X",
        regulatory_region="EU / Global (CE 0123 + FDA 510(k))",
        storage_temp_min=2.0,
        storage_temp_max=8.0,
        storage_temp_unit="°C",
        storage_temp_text="Store at 2°C - 8°C (36°F - 46°F). Do not freeze.",
        manufacturer_name="AuraPulse Medical Devices Ltd.",
        manufacturer_address="74 Innovation Way, Galway Medical Tech Park, Galway, H91 V4X2, Ireland",
        udi_di="(01)05060123456789",
        expiry_format="YYYY-MM-DD",
        sterilization_method="STERILE EO",
        ce_notified_body="CE 0123",
        lot_number="LOT-2026-X88"
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 2. Build 9 Realistic Labels
    raw_labels = [
        {
            "code": "LBL-CARTON-EN",
            "name": "Carton Outer Box Packaging (English)",
            "type": "carton",
            "lang": "en",
            "region": "Global / US",
            "fields": [
                ("MODEL / TYPE", "GlucoGuard Pro CGM (Ref: GGP-500X)"),
                ("MANUFACTURER", "AuraPulse Medical Devices Ltd., Galway, Ireland"),
                ("STERILITY", "Sterilized using Ethylene Oxide [STERILE EO]"),
                ("CONTENTS", "1 Sensor Applicator, 1 Transmitter, 1 Quick Guide")
            ],
            "text_v2": "GlucoGuard Pro CGM System (GGP-500X). Manufacturer: AuraPulse Medical Devices Ltd., 74 Innovation Way, Galway, Ireland. Store at 2°C - 8°C (36°F - 46°F). Do not freeze. UDI: (01)05060123456789. CE 0123. STERILE EO. Expiry: 2028-09-30.",
            "text_v3": "GlucoGuard Pro CGM System (GGP-500X). Manufacturer: AuraPulse Medical Devices Ltd., 74 Innovation Way, Galway, Ireland. Store at 2°C - 25°C (36°F - 77°F). Do not freeze. UDI: (01)05060123456789. CE 0123. STERILE EO. Expiry: 2028-09-30."
        },
        {
            "code": "LBL-CARTON-DE",
            "name": "Umverpackung Karton (Deutsch)",
            "type": "carton",
            "lang": "de",
            "region": "EU (Germany, Austria)",
            "fields": [
                ("MODELL / TYP", "GlucoGuard Pro KGM (Ref: GGP-500X)"),
                ("HERSTELLER", "AuraPulse Medical Devices Ltd., Galway, Irland"),
                ("STERILITÄT", "Mit Ethylenoxid sterilisiert [STERILE EO]"),
                ("INHALT", "1 Sensor-Applikator, 1 Transmitter, Gebrauchsanweisung")
            ],
            "text_v2": "GlucoGuard Pro KGM System (GGP-500X). Hersteller: AuraPulse Medical Devices Ltd., Galway, Irland. Bei 2°C bis 8°C lagern. Vor Frost schützen. UDI: (01)05060123456789. CE 0123. STERILE EO.",
            "text_v3": "GlucoGuard Pro KGM System (GGP-500X). Hersteller: AuraPulse Medical Devices Ltd., Galway, Irland. Bei 2°C bis 25°C lagern. Vor Frost schützen. UDI: (01)05060123456789. CE 0123. STERILE EO."
        },
        {
            "code": "LBL-CARTON-FR",
            "name": "Carton Emballage Extérieur (Français)",
            "type": "carton",
            "lang": "fr",
            "region": "EU (France, Belgium)",
            "fields": [
                ("MODÈLE / TYPE", "GlucoGuard Pro MCG (Réf: GGP-500X)"),
                ("FABRICANT", "AuraPulse Medical Devices Ltd., Galway, Irlande"),
                ("STÉRILITÉ", "Stérilisé à l'oxyde d'éthylène [STERILE EO]"),
                ("CONTENU", "1 Applicateur de capteur, 1 Émetteur, Manuel d'utilisation")
            ],
            "text_v2": "Système MCG GlucoGuard Pro (GGP-500X). Fabricant: AuraPulse Medical Devices Ltd., Galway, Irlande. Conserver entre 2°C et 8°C. Ne pas congeler. UDI: (01)05060123456789. CE 0123. STERILE EO.",
            "text_v3": "Système MCG GlucoGuard Pro (GGP-500X). Fabricant: AuraPulse Medical Devices Ltd., Galway, Irlande. Conserver entre 2°C et 25°C. Ne pas congeler. UDI: (01)05060123456789. CE 0123. STERILE EO."
        },
        {
            "code": "LBL-IFU-EN",
            "name": "Instructions For Use (IFU Leaflet - English)",
            "type": "ifu",
            "lang": "en",
            "region": "Global / US",
            "fields": [
                ("DOCUMENT", "Patient & Clinician Operating Manual IFU-GGP-01"),
                ("SECTION 4.2", "Storage Conditions: 2°C - 8°C. Keep away from direct sunlight."),
                ("CONTRAINDICATIONS", "Do not use if package seal is damaged or open."),
                ("DISPOSAL", "Dispose of biohazard sensor applicator per local guidelines.")
            ],
            "text_v2": "GlucoGuard Pro Instructions For Use. AuraPulse Medical Devices Ltd. Storage: Maintain between 2°C and 8°C. In-use lifespan: 14 days. CE 0123. Consult instructions before use.",
            "text_v3": "GlucoGuard Pro Instructions For Use. AuraPulse Medical Devices Ltd. Storage: Maintain between 2°C and 25°C. In-use lifespan: 14 days. CE 0123. Consult instructions before use."
        },
        {
            "code": "LBL-IFU-DE",
            "name": "Gebrauchsanweisung Beileger (IFU - Deutsch)",
            "type": "ifu",
            "lang": "de",
            "region": "EU (Germany, Austria)",
            "fields": [
                ("DOKUMENT", "Patienten- und Klinikanleitung IFU-GGP-DE"),
                ("LAGERBEDINGUNG", "Lagertemperatur: 2°C bis 8°C. Trocken aufbewahren."),
                ("WARNHINWEISE", "Nicht verwenden, wenn die sterile Verpackung beschädigt ist."),
                ("ENTSORGUNG", "Gemäß den Vorschriften für biologische Abfälle entsorgen.")
            ],
            "text_v2": "GlucoGuard Pro Gebrauchsanweisung. AuraPulse Medical Devices Ltd. Lagerung: 2°C bis 8°C. Anwendungsdauer: 14 Tage. CE 0123. Gebrauchsanweisung beachten.",
            "text_v3": "GlucoGuard Pro Gebrauchsanweisung. AuraPulse Medical Devices Ltd. Lagerung: 2°C bis 25°C. Anwendungsdauer: 14 Tage. CE 0123. Gebrauchsanweisung beachten."
        },
        {
            "code": "LBL-IFU-FR",
            "name": "Notice d'Utilisation (IFU - Français)",
            "type": "ifu",
            "lang": "fr",
            "region": "EU (France, Switzerland)",
            "fields": [
                ("DOCUMENT", "Manuel d'Instructions Clinique IFU-GGP-FR"),
                ("STOCKAGE", "Conditions de conservation: 2°C à 8°C. Garder au sec."),
                ("AVERTISSEMENT", "Ne pas utiliser si le sachet protecteur est perforé."),
                ("ÉLIMINATION", "Éliminer comme déchet médical selon la réglementation.")
            ],
            "text_v2": "GlucoGuard Pro Notice d'Instructions. AuraPulse Medical Devices Ltd. Stockage: 2°C à 8°C. Durée d'utilisation: 14 jours. CE 0123. Consulter la notice.",
            "text_v3": "GlucoGuard Pro Notice d'Instructions. AuraPulse Medical Devices Ltd. Stockage: 2°C à 25°C. Durée d'utilisation: 14 jours. CE 0123. Consulter la notice."
        },
        {
            "code": "LBL-DEV-EN",
            "name": "Transmitter Direct Device Label",
            "type": "device",
            "lang": "en",
            "region": "Global",
            "fields": [
                ("DEVICE NAME", "GlucoGuard Transmitter Unit TX-50"),
                ("RATINGS", "IP28 Submersible 2.4m for 2 hours | BT 5.2"),
                ("SERIAL / UDI", "SN: AP-TX-9948214 | UDI: (01)05060123456789"),
                ("OPERATING", "Operating Range: 10°C to 40°C")
            ],
            # Deliberately lacks storage temperature on the physical transmitter itself!
            "text_v2": "GlucoGuard TX-50. IP28. AuraPulse Ltd. SN: AP-TX-9948214. UDI: (01)05060123456789. CE 0123.",
            "text_v3": "GlucoGuard TX-50. IP28. AuraPulse Ltd. SN: AP-TX-9948214. UDI: (01)05060123456789. CE [FLAG-OMITTED]."
        },
        {
            "code": "LBL-SHIP-GLOBAL",
            "name": "Bulk Shipper & Master Carton Label",
            "type": "shipping",
            "lang": "en",
            "region": "Global Logistics",
            "fields": [
                ("SHIPPER ID", "AuraPulse Distribution Master Box (Qty: 24 Units)"),
                ("TEMP CONTROL", "COLD CHAIN LOGISTICS: 2°C - 8°C MONITORED"),
                ("DESTINATION", "Central European Distribution Hub, Frankfurt"),
                ("HANDLING", "Fragile Medical Diagnostics - Keep Dry - Do Not Drop")
            ],
            "text_v2": "AuraPulse Shipper Unit (24 Kits). Store & Transport at 2°C - 8°C. Protect from thermal excursions. UDI: (01)05060123456789.",
            "text_v3": "AuraPulse Shipper Unit (24 Kits). Store & Transport at 2°C - 25°C. Protect from thermal excursions. UDI: (01)05060123456789."
        },
        {
            "code": "LBL-POUCH-STERILE",
            "name": "Sensor Pod Sterile Tyvek Pouch",
            "type": "device",
            "lang": "en",
            "region": "Global",
            "fields": [
                ("POUCH BARRIER", "Sterile Tyvek Barrier | Sterile EO"),
                ("PRECAUTION", "Single Patient Use Only. Do not re-sterilize."),
                ("STORAGE TEMP", "Storage: 2°C to 8°C. Inspect barrier before opening."),
                ("LOT & EXPIRY", "LOT: 2026-X88 | EXP: 2028-09-30")
            ],
            "text_v2": "Sensor Pod Sterile Pouch. AuraPulse Ltd. Store at 2°C - 8°C. STERILE EO. Single use. LOT 2026-X88. Exp 2028-09-30.",
            "text_v3": "Sensor Pod Sterile Pouch. AuraPulse Ltd. Store at 2°C - 25°C. STERILE EO. Single use. LOT 2026-X88. Exp 2028-09-30."
        }
    ]

    for item in raw_labels:
        # Generate images for v2 and v3
        img_v2_name = f"{item['code'].lower()}_v2.png"
        img_v3_name = f"{item['code'].lower()}_v3.png"

        # Check if this label has storage temp
        has_temp = item["code"] != "LBL-DEV-EN" # The physical transmitter label does not carry cold storage requirement
        v2_temp = "2°C - 8°C"
        v3_temp = "2°C - 25°C" if has_temp else "N/A (Operating 10-40°C)"

        # v3 for device has intentional visual flag/barcode mutation for redline demonstration
        is_issue_device = (item["code"] == "LBL-DEV-EN")

        generate_label_image(
            filename=img_v2_name,
            title=item["name"],
            subtitle=f"{product.name} - Model {product.model_code}",
            fields=item["fields"],
            version_tag="v2.4 (CURRENT RELEASED)",
            is_v3_with_issue=False,
            temp_str=v2_temp
        )

        generate_label_image(
            filename=img_v3_name,
            title=item["name"],
            subtitle=f"{product.name} - Model {product.model_code}",
            fields=item["fields"],
            version_tag="v3.0 (PROPOSED DRAFT)",
            is_v3_with_issue=is_issue_device,
            temp_str=v3_temp
        )

        record = LabelRecord(
            label_code=item["code"],
            name=item["name"],
            label_type=item["type"],
            language=item["lang"],
            target_region=item["region"],
            current_version="v2.4",
            status="APPROVED",
            content_text_v2=item["text_v2"],
            content_text_v3=item["text_v3"],
            image_v2=img_v2_name,
            image_v3=img_v3_name,
            barcode_data=product.udi_di,
            has_udi=True,
            has_temp_symbol=has_temp,
            has_mfg_symbol=True,
            has_expiry_symbol=True,
            has_ce_mark=True
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        # 3. Add link relations
        # storage_temperature links to all labels except transmitter device
        if has_temp:
            db.add(FieldLabelLink(
                field_key="storage_temperature",
                label_id=record.id,
                section_name="Storage & Environmental Specifications",
                display_text=record.content_text_v2
            ))

        # manufacturer_address links to all 9 labels
        db.add(FieldLabelLink(
            field_key="manufacturer_address",
            label_id=record.id,
            section_name="Manufacturer Legal Entity",
            display_text=product.manufacturer_address
        ))

        # udi_di links to cartons, device, shipping, and pouch
        if item["type"] in ["carton", "device", "shipping"]:
            db.add(FieldLabelLink(
                field_key="udi_di",
                label_id=record.id,
                section_name="Unique Device Identification",
                display_text=product.udi_di
            ))

        # sterilization_method links to carton, ifu, and pouch
        if item["code"] in ["LBL-CARTON-EN", "LBL-CARTON-DE", "LBL-CARTON-FR", "LBL-IFU-EN", "LBL-POUCH-STERILE"]:
            db.add(FieldLabelLink(
                field_key="sterilization_method",
                label_id=record.id,
                section_name="Sterility Specifications",
                display_text=product.sterilization_method
            ))

        # expiry_format links to cartons, shipping, and pouch
        if item["type"] in ["carton", "shipping"] or "POUCH" in item["code"]:
            db.add(FieldLabelLink(
                field_key="expiry_format",
                label_id=record.id,
                section_name="Expiry & Shelf-Life",
                display_text="2028-09-30"
            ))

    # Initial baseline audit log
    db.add(AuditLog(
        timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=60),
        action="SYSTEM_INIT_BASELINE",
        actor_name="Compliance Automation System",
        actor_role="System Administrator",
        details="Loaded baseline product master record and 9 validated labels for GlucoGuard Pro CGM System (v2.4)."
    ))

    db.commit()
    db.close()
    print("LabelGuard seed data initialized successfully.")

if __name__ == "__main__":
    init_seed_data()
