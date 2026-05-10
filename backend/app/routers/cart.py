from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.cart import CartItem
from app.models.product import ProductVariant
from app.models.template import Template
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


class CartItemIn(BaseModel):
    product_variant_id: str
    template_id: str | None = None
    custom_image_path: str | None = None


class CartItemOut(BaseModel):
    id: str
    product_variant_id: str
    template_id: str | None
    custom_image_path: str | None
    product_name: str
    variant_label: str
    retail_price: float
    b2b_price: float
    model_config = {"from_attributes": True}


@router.get("")
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    result = []
    for item in items:
        v = item.product_variant
        result.append({
            "id": item.id,
            "product_variant_id": item.product_variant_id,
            "template_id": item.template_id,
            "custom_image_path": item.custom_image_path,
            "product_name": v.product.name,
            "variant_label": v.label,
            "quantity": v.quantity,
            "retail_price": float(v.retail_price),
            "b2b_price": float(v.b2b_price),
        })
    return result


@router.post("")
def add_to_cart(body: CartItemIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == body.product_variant_id, ProductVariant.is_active == True
    ).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Product variant not found")
    if body.template_id is None and body.custom_image_path is None:
        raise HTTPException(status_code=422, detail="Either template_id or custom_image_path is required")
    item = CartItem(
        user_id=user.id,
        product_variant_id=body.product_variant_id,
        template_id=body.template_id,
        custom_image_path=body.custom_image_path,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "ok": True}


@router.delete("/{item_id}")
def remove_cart_item(item_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.delete("")
def clear_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"ok": True}
