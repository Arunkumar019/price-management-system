from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from app.database import get_db
from app.utils.security import get_current_user

router = APIRouter(prefix="/components", tags=["Components"])

@router.get("", response_model=List[schemas.ComponentResponse])
def get_components(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or brand"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Component)
    
    if category:
        query = query.filter(models.Component.category == category)
    if is_available is not None:
        query = query.filter(models.Component.is_available == is_available)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (models.Component.name.ilike(search_fmt)) | 
            (models.Component.brand.ilike(search_fmt)) |
            (models.Component.description.ilike(search_fmt))
        )
        
    return query.order_by(models.Component.category, models.Component.name).all()

@router.get("/{component_id}", response_model=schemas.ComponentResponse)
def get_component(
    component_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found"
        )
    return component

@router.post("", response_model=schemas.ComponentResponse, status_code=status.HTTP_201_CREATED)
def create_component(
    payload: schemas.ComponentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check category + name uniqueness
    existing = db.query(models.Component).filter(
        models.Component.category == payload.category,
        models.Component.name.ilike(payload.name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Component '{payload.name}' already exists in category '{payload.category}'."
        )

    component = models.Component(
        name=payload.name.strip(),
        category=payload.category,
        brand=payload.brand.strip(),
        price=payload.price,
        description=payload.description,
        is_available=payload.is_available
    )
    
    try:
        db.add(component)
        db.commit()
        db.refresh(component)
        return component
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint failure. Ensure component name is unique within category."
        )

@router.put("/{component_id}", response_model=schemas.ComponentResponse)
def update_component(
    component_id: int,
    payload: schemas.ComponentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found"
        )

    new_name = payload.name.strip() if payload.name else component.name
    new_category = payload.category if payload.category else component.category

    # Check uniqueness if name or category changed
    if new_name != component.name or new_category != component.category:
        existing = db.query(models.Component).filter(
            models.Component.category == new_category,
            models.Component.name.ilike(new_name),
            models.Component.id != component_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Component '{new_name}' already exists in category '{new_category}'."
            )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "name" and value:
            setattr(component, field, value.strip())
        elif field == "brand" and value:
            setattr(component, field, value.strip())
        else:
            setattr(component, field, value)

    try:
        db.commit()
        db.refresh(component)
        return component
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database error during update."
        )

@router.delete("/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_component(
    component_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component with ID {component_id} not found"
        )
    
    db.delete(component)
    db.commit()
    return None
