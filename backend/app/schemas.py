from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Component Schemas ---
VALID_CATEGORIES = [
    "Processor",
    "RAM",
    "Storage",
    "Graphics Card",
    "Display",
    "Battery",
    "Keyboard",
    "Operating System"
]

class ComponentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str
    brand: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0, description="Price must be non-negative")
    description: Optional[str] = None
    is_available: bool = True

    @field_validator("category")
    def validate_category(cls, v):
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v

    @field_validator("price")
    def validate_price(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return round(v, 2)

class ComponentCreate(ComponentBase):
    pass

class ComponentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = None
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    is_available: Optional[bool] = None

    @field_validator("category")
    def validate_category(cls, v):
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")
        return v

    @field_validator("price")
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return round(v, 2) if v is not None else v

class ComponentResponse(ComponentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Configuration Schemas ---
class ConfigurationItemResponse(BaseModel):
    id: int
    component_id: Optional[int] = None
    component_name: str
    component_category: str
    brand: str
    price_at_addition: float

    class Config:
        from_attributes = True

class ConfigurationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    component_ids: List[int] = Field(..., min_items=1)

class ConfigurationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    component_ids: Optional[List[int]] = Field(None, min_items=1)

class ConfigurationResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    user_id: int
    total_price: float
    created_at: datetime
    updated_at: datetime
    items: List[ConfigurationItemResponse] = []

    class Config:
        from_attributes = True

# --- Dashboard Schema ---
class DashboardSummary(BaseModel):
    total_components: int
    total_configurations: int
    total_configuration_value: float
    latest_configurations: List[ConfigurationResponse] = []
