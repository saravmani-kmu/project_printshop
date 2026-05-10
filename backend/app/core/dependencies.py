from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.admin import Admin, AdminStatus


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )
    if not access_token:
        raise credentials_error
    payload = decode_token(access_token)
    if payload.get("type") != "access":
        raise credentials_error
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise credentials_error
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise credentials_error
    return user


def get_current_admin(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Admin:
    admin = db.query(Admin).filter(
        Admin.user_id == user.id,
        Admin.status == AdminStatus.approved,
    ).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return admin


def get_super_admin(admin: Admin = Depends(get_current_admin)) -> Admin:
    from app.models.admin import AdminRole
    if admin.role != AdminRole.super:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return admin
