from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.utils.security import get_current_user
from app.services.pricing import PricingService

router = APIRouter(prefix="/configurations", tags=["Laptop Configurations"])

@router.get("", response_model=List[schemas.ConfigurationResponse])
def get_configurations(
    search: Optional[str] = Query(None, description="Search configurations by title or description"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.LaptopConfiguration).options(joinedload(models.LaptopConfiguration.items))
    
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (models.LaptopConfiguration.title.ilike(search_fmt)) |
            (models.LaptopConfiguration.description.ilike(search_fmt))
        )
        
    return query.order_by(models.LaptopConfiguration.created_at.desc()).all()

@router.post("/preview")
def preview_configuration(
    component_ids: List[int],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return PricingService.calculate_breakdown_preview(db, component_ids)

@router.get("/{config_id}", response_model=schemas.ConfigurationResponse)
def get_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.LaptopConfiguration)\
        .options(joinedload(models.LaptopConfiguration.items))\
        .filter(models.LaptopConfiguration.id == config_id).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    return config

@router.post("", response_model=schemas.ConfigurationResponse, status_code=status.HTTP_201_CREATED)
def create_configuration(
    payload: schemas.ConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total_price, snapshots = PricingService.calculate_total_and_snapshots(db, payload.component_ids)

    config = models.LaptopConfiguration(
        title=payload.title.strip(),
        description=payload.description,
        user_id=current_user.id,
        total_price=total_price
    )
    db.add(config)
    db.flush() # assign ID

    # Create historical snapshot items
    for snap in snapshots:
        item = models.ConfigurationItem(
            configuration_id=config.id,
            component_id=snap["component_id"],
            component_name=snap["component_name"],
            component_category=snap["component_category"],
            brand=snap["brand"],
            price_at_addition=snap["price_at_addition"]
        )
        db.add(item)

    db.commit()
    db.refresh(config)
    return config

@router.put("/{config_id}", response_model=schemas.ConfigurationResponse)
def update_configuration(
    config_id: int,
    payload: schemas.ConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.LaptopConfiguration)\
        .options(joinedload(models.LaptopConfiguration.items))\
        .filter(models.LaptopConfiguration.id == config_id).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )

    if payload.title is not None:
        config.title = payload.title.strip()
    if payload.description is not None:
        config.description = payload.description

    # If components are updated, recalculate price and update snapshot items
    if payload.component_ids is not None:
        total_price, snapshots = PricingService.calculate_total_and_snapshots(db, payload.component_ids)
        config.total_price = total_price

        # Clear existing items
        db.query(models.ConfigurationItem).filter(models.ConfigurationItem.configuration_id == config_id).delete()

        # Add new snapshot items
        for snap in snapshots:
            item = models.ConfigurationItem(
                configuration_id=config.id,
                component_id=snap["component_id"],
                component_name=snap["component_name"],
                component_category=snap["component_category"],
                brand=snap["brand"],
                price_at_addition=snap["price_at_addition"]
            )
            db.add(item)

    db.commit()
    db.refresh(config)
    return config

@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    config = db.query(models.LaptopConfiguration).filter(models.LaptopConfiguration.id == config_id).first()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Configuration with ID {config_id} not found"
        )
    
    db.delete(config)
    db.commit()
    return None
