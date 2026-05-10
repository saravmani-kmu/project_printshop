import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, Integer, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class PaymentMethod(str, enum.Enum):
    cod = "cod"
    invoice = "invoice"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    inprogress = "inprogress"
    completed = "completed"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    address_id: Mapped[str] = mapped_column(String(36), ForeignKey("addresses.id"))
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    payment_method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod))
    payment_status: Mapped[PaymentStatus] = mapped_column(SAEnum(PaymentStatus), default=PaymentStatus.pending)
    current_status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), default=OrderStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    address: Mapped["Address"] = relationship("Address", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(
        "OrderStatusHistory", back_populates="order",
        cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"))
    product_variant_id: Mapped[str] = mapped_column(String(36), ForeignKey("product_variants.id"))
    template_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("templates.id"), nullable=True)
    custom_image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="order_items")
    template: Mapped["Template | None"] = relationship("Template")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"))
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("admins.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order: Mapped["Order"] = relationship("Order", back_populates="status_history")
    created_by_admin: Mapped["Admin | None"] = relationship("Admin", back_populates="status_updates")
