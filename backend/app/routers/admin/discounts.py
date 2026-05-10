from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.discount import Discount
from app.models.admin import Admin
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/admin/discounts", tags=["admin-discounts"])


class DiscountIn(BaseModel):
    name: str
    type: str
    value: float
    applies_to: str = "both"
    trigger_type: str = "always"
    trigger_config: dict | None = None
    is_active: bool = True
    valid_from: datetime | None = None
    valid_until: datetime | None = None


@router.get("")
def list_discounts(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    return db.query(Discount).order_by(Discount.created_at.desc()).all()


@router.post("")
def create_discount(body: DiscountIn, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    d = Discount(**body.model_dump())
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


@router.put("/{discount_id}")
def update_discount(discount_id: str, body: DiscountIn, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    d = db.query(Discount).filter(Discount.id == discount_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discount not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    db.commit()
    return d


@router.delete("/{discount_id}")
def delete_discount(discount_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    d = db.query(Discount).filter(Discount.id == discount_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Discount not found")
    db.delete(d)
    db.commit()
    return {"ok": True}
