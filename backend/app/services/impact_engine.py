import networkx as nx
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import LabelRecord, FieldLabelLink, ProductMaster

class ImpactEngine:
    def compute_impact(self, db: Session, field_key: str) -> Dict[str, Any]:
        G = nx.DiGraph()

        # 1. Fetch labels and links
        all_labels = db.query(LabelRecord).all()
        links = db.query(FieldLabelLink).filter(FieldLabelLink.field_key == field_key).all()
        affected_label_ids = set(link.label_id for link in links)

        # 2. Add root field node
        field_node_id = f"field:{field_key}"
        field_title = field_key.replace("_", " ").title()
        G.add_node(
            field_node_id,
            label=f"Change: {field_title}",
            type="product_field",
            category="trigger",
            details={"field_key": field_key}
        )

        # 3. Add Regulatory Standard nodes
        reg_standards = [
            ("std:ISO-15223-1", "ISO 15223-1 (Symbols & Storage)"),
            ("std:EU-MDR", "EU MDR 2017/745 (Packaging & Lang)"),
            ("std:FDA-801", "FDA 21 CFR 801 (Medical Device Labeling)")
        ]
        for sid, sname in reg_standards:
            G.add_node(
                sid,
                label=sname,
                type="regulatory_rule",
                category="regulation",
                details={"standard": sname}
            )

        # 4. Add Label Nodes and Edges
        nodes_out = []
        edges_out = []

        for lbl in all_labels:
            is_affected = lbl.id in affected_label_ids
            lbl_node_id = f"label:{lbl.label_code}"
            
            G.add_node(
                lbl_node_id,
                label=lbl.label_code,
                type="label",
                category="affected" if is_affected else "unaffected",
                details={
                    "id": lbl.id,
                    "code": lbl.label_code,
                    "name": lbl.name,
                    "type": lbl.label_type,
                    "language": lbl.language,
                    "is_affected": is_affected,
                    "version": lbl.current_version
                }
            )

            # If affected, connect field -> label
            if is_affected:
                G.add_edge(field_node_id, lbl_node_id, relationship="IMPACTS_LABEL")

            # Connect label to relevant regulatory nodes
            if lbl.has_temp_symbol:
                G.add_edge(lbl_node_id, "std:ISO-15223-1", relationship="GOVERNED_BY")
            if lbl.target_region.startswith("EU") or "Global" in lbl.target_region:
                G.add_edge(lbl_node_id, "std:EU-MDR", relationship="GOVERNED_BY")
            if "US" in lbl.target_region or "Global" in lbl.target_region:
                G.add_edge(lbl_node_id, "std:FDA-801", relationship="GOVERNED_BY")

        # Serializing graph for frontend
        for node_id, data in G.nodes(data=True):
            nodes_out.append({
                "id": node_id,
                "label": data.get("label", node_id),
                "type": data.get("type", "unknown"),
                "category": data.get("category", "default"),
                "details": data.get("details", {})
            })

        for u, v, data in G.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "relationship": data.get("relationship", "CONNECTED")
            })

        total = len(all_labels)
        affected_count = len(affected_label_ids)
        percentage = round((affected_count / total * 100), 1) if total > 0 else 0.0

        return {
            "total_labels": total,
            "affected_labels_count": affected_count,
            "affected_percentage": percentage,
            "affected_label_ids": list(affected_label_ids),
            "nodes": nodes_out,
            "edges": edges_out
        }

impact_engine = ImpactEngine()
