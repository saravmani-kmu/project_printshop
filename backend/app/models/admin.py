import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class AdminRole(str, enum.Enum):
    super = "super"
    sub = "sub"


class AdminStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True)
    role: Mapped[AdminRole] = mapped_column(SAEnum(AdminRole), default=AdminRole.sub)
    status: Mapped[AdminStatus] = mapped_column(SAEnum(AdminStatus), default=AdminStatus.pending)
    approved_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("admins.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="admin")
    approver: Mapped["Admin | None"] = relationship("Admin", remote_side="Admin.id", foreign_keys=[approved_by])
    status_updates: Mapped[list["OrderStatusHistory"]] = relationship("OrderStatusHistory", back_populates="created_by_admin")
