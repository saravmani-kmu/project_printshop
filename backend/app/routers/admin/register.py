from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.database import get_db
from app.models.admin import Admin, AdminRole, AdminStatus
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.security import create_admin_approval_token, decode_token
from app.services.email_service import send_admin_approval_email
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/admin", tags=["admin-register"])


@router.post("/register")
def register_admin(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin registration already exists")

    super_exists = db.query(Admin).filter(Admin.role == AdminRole.super, Admin.status == AdminStatus.approved).first()
    role = AdminRole.sub if super_exists else AdminRole.super

    admin = Admin(user_id=user.id, role=role, status=AdminStatus.pending)
    db.add(admin)
    db.commit()
    db.refresh(admin)

    token = create_admin_approval_token(admin.id)
    approval_url = f"{settings.FRONTEND_URL}/admin/approve?token={token}"
    send_admin_approval_email(
        to_email=settings.ADMIN_APPROVAL_EMAIL,
        admin_name=user.name,
        approval_url=approval_url,
    )
    return {"ok": True, "message": "Registration submitted. Awaiting approval."}


@router.get("/approve")
def approve_admin(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if payload.get("type") != "admin_approval":
        raise HTTPException(status_code=400, detail="Invalid or expired approval link")

    admin = db.query(Admin).filter(Admin.id == payload.get("admin_id")).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin record not found")
    if admin.status == AdminStatus.approved:
        return {"ok": True, "message": "Already approved"}

    admin.status = AdminStatus.approved
    admin.approved_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "message": "Admin approved successfully"}
