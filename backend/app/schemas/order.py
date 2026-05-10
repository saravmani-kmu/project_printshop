from pydantic import BaseModel
from datetime import datetime
from app.models.order import OrderStatus, PaymentMethod, PaymentStatus


class OrderItemOut(BaseModel):
    id: str
    product_variant_id: str
    template_id: str | None
    custom_image_path: str | None
    unit_price: float
    quantity: int
    product_name: str | None = None
    variant_label: str | None = None

    model_config = {"from_attributes": True}


class StatusHistoryOut(BaseModel):
    id: str
    status: OrderStatus
    note: str | None
    is_public: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: str
    order_number: str
    subtotal: float
    discount_amount: float
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    current_status: OrderStatus
    created_at: datetime
    items: list[OrderItemOut] = []
    status_history: list[StatusHistoryOut] = []

    model_config = {"from_attributes": True}


class PlaceOrderIn(BaseModel):
    address_id: str
    payment_method: PaymentMethod


class UpdateOrderStatusIn(BaseModel):
    status: OrderStatus
    note: str | None = None
    is_public: bool = False
