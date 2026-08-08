from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models

class PricingService:

    @staticmethod
    def calculate_total_and_snapshots(db: Session, component_ids: List[int]) -> tuple[float, List[dict]]:
        """
        Validates component IDs, calculates total price using current active prices,
        and generates snapshot dicts for saving to ConfigurationItem table.
        """
        if not component_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one component must be selected for configuration."
            )

        components = db.query(models.Component).filter(models.Component.id.in_(component_ids)).all()
        
        if len(components) != len(set(component_ids)):
            found_ids = {c.id for c in components}
            missing_ids = list(set(component_ids) - found_ids)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Components with IDs {missing_ids} not found."
            )

        total_price = 0.0
        snapshots = []

        for comp in components:
            if not comp.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Component '{comp.name}' is currently unavailable."
                )
            
            price = float(comp.price)
            total_price += price
            snapshots.append({
                "component_id": comp.id,
                "component_name": comp.name,
                "component_category": comp.category,
                "brand": comp.brand,
                "price_at_addition": price # Preserving snapshot price
            })

        return round(total_price, 2), snapshots

    @staticmethod
    def calculate_breakdown_preview(db: Session, component_ids: List[int]) -> Dict[str, Any]:
        """
        Generates real-time price preview breakdown grouped by category before saving.
        """
        total_price, snapshots = PricingService.calculate_total_and_snapshots(db, component_ids)
        
        category_breakdown = {}
        for snap in snapshots:
            cat = snap["component_category"]
            category_breakdown[cat] = {
                "component_id": snap["component_id"],
                "name": snap["component_name"],
                "brand": snap["brand"],
                "price": snap["price_at_addition"]
            }

        return {
            "total_price": total_price,
            "count": len(snapshots),
            "breakdown": category_breakdown
        }
