from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from app import models, schemas
from app.database import get_db
from app.utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total_components = db.query(models.Component).count()
    total_configurations = db.query(models.LaptopConfiguration).count()
    
    total_value_res = db.query(func.sum(models.LaptopConfiguration.total_price)).scalar()
    total_configuration_value = round(float(total_value_res), 2) if total_value_res else 0.0

    latest_configurations = (
        db.query(models.LaptopConfiguration)
        .options(joinedload(models.LaptopConfiguration.items))
        .order_by(models.LaptopConfiguration.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_components": total_components,
        "total_configurations": total_configurations,
        "total_configuration_value": total_configuration_value,
        "latest_configurations": latest_configurations
    }
