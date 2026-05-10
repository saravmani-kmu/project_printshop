import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    product_variant_id: Mapped[str] = mapped_column(String(36), ForeignKey("product_variants.id"))
    template_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("templates.id"), nullable=True)
    custom_image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="cart_items")
    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="cart_items")
    template: Mapped["Template | None"] = relationship("Template")
