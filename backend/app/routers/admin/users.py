from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.admin import Admin, AdminStatus
from app.core.dependencies import get_current_admin, get_super_admin

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("")
def list_users(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "user_type": u.user_type,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.patch("/{user_id}/toggle-active")
def toggle_user_active(user_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.get("/admins")
def list_admins(db: Session = Depends(get_db), admin: Admin = Depends(get_super_admin)):
    admins = db.query(Admin).all()
    return [
        {
            "id": a.id,
            "user_name": a.user.name,
            "user_email": a.user.email,
            "role": a.role,
            "status": a.status,
            "created_at": a.created_at,
        }
        for a in admins
    ]


@router.patch("/admins/{admin_id}/approve")
def approve_sub_admin(admin_id: str, db: Session = Depends(get_db), super_admin: Admin = Depends(get_super_admin)):
    from datetime import datetime
    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")
    target.status = AdminStatus.approved
    target.approved_by = super_admin.id
    target.approved_at = datetime.utcnow()
    db.commit()
    return {"ok": True}


@router.patch("/admins/{admin_id}/reject")
def reject_sub_admin(admin_id: str, db: Session = Depends(get_db), super_admin: Admin = Depends(get_super_admin)):
    target = db.query(Admin).filter(Admin.id == admin_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")
    if target.id == super_admin.id:
        raise HTTPException(status_code=400, detail="Cannot reject yourself")
    target.status = AdminStatus.rejected
    db.commit()
    return {"ok": True}
