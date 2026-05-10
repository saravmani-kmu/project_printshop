from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.app_config import AppConfig
from app.models.admin import Admin
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/admin/config", tags=["admin-config"])


class ConfigUpdate(BaseModel):
    value: str


@router.get("")
def list_config(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    return db.query(AppConfig).all()


@router.put("/{key}")
def update_config(key: str, body: ConfigUpdate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    cfg = db.query(AppConfig).filter(AppConfig.key == key).first()
    if not cfg:
        cfg = AppConfig(key=key, value=body.value)
        db.add(cfg)
    else:
        cfg.value = body.value
    db.commit()
    return {"key": key, "value": body.value}
