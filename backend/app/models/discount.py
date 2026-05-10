import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Numeric, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import enum


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    flat = "flat"


class DiscountAppliesTo(str, enum.Enum):
    retail = "retail"
    b2b = "b2b"
    both = "both"


class DiscountTrigger(str, enum.Enum):
    time_of_day = "time_of_day"
    season = "season"
    loyalty = "loyalty"
    always = "always"


class Discount(Base):
    __tablename__ = "discounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[DiscountType] = mapped_column(SAEnum(DiscountType))
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    applies_to: Mapped[DiscountAppliesTo] = mapped_column(SAEnum(DiscountAppliesTo), default=DiscountAppliesTo.both)
    trigger_type: Mapped[DiscountTrigger] = mapped_column(SAEnum(DiscountTrigger), default=DiscountTrigger.always)
    trigger_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
