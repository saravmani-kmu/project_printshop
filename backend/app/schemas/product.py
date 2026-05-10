from pydantic import BaseModel
from datetime import datetime


class ProductVariantOut(BaseModel):
    id: str
    label: str
    quantity: int
    retail_price: float
    b2b_price: float
    is_active: bool

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: str
    name: str
    description: str | None
    icon: str | None
    sort_order: int
    variants: list[ProductVariantOut] = []

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    icon: str | None = None
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class VariantCreate(BaseModel):
    label: str
    quantity: int
    retail_price: float
    b2b_price: float


class VariantUpdate(BaseModel):
    label: str | None = None
    quantity: int | None = None
    retail_price: float | None = None
    b2b_price: float | None = None
    is_active: bool | None = None
