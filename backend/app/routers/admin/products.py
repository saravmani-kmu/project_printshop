from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product, ProductVariant
from app.models.template import Template
from app.models.admin import Admin
from app.core.dependencies import get_current_admin
from app.schemas.product import ProductCreate, ProductUpdate, VariantCreate, VariantUpdate
from pydantic import BaseModel

router = APIRouter(prefix="/admin/products", tags=["admin-products"])


class TemplateCreate(BaseModel):
    name: str
    preview_image: str | None = None


# ── Products ────────────────────────────────────────────────────────

@router.get("")
def list_products(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    return db.query(Product).order_by(Product.sort_order).all()


@router.post("")
def create_product(body: ProductCreate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    p = Product(**body.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/{product_id}")
def update_product(product_id: str, body: ProductUpdate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(p, k, v)
    db.commit()
    return p


@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"ok": True}


# ── Variants ────────────────────────────────────────────────────────

@router.post("/{product_id}/variants")
def create_variant(product_id: str, body: VariantCreate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    v = ProductVariant(product_id=product_id, **body.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.put("/{product_id}/variants/{variant_id}")
def update_variant(product_id: str, variant_id: str, body: VariantUpdate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    v = db.query(ProductVariant).filter(ProductVariant.id == variant_id, ProductVariant.product_id == product_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    for k, val in body.model_dump(exclude_none=True).items():
        setattr(v, k, val)
    db.commit()
    return v


@router.delete("/{product_id}/variants/{variant_id}")
def delete_variant(product_id: str, variant_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    v = db.query(ProductVariant).filter(ProductVariant.id == variant_id, ProductVariant.product_id == product_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    db.delete(v)
    db.commit()
    return {"ok": True}


# ── Templates ────────────────────────────────────────────────────────

@router.get("/{product_id}/templates")
def list_templates(product_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    return db.query(Template).filter(Template.product_id == product_id).all()


@router.post("/{product_id}/templates")
def create_template(product_id: str, body: TemplateCreate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    t = Template(product_id=product_id, **body.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{product_id}/templates/{template_id}")
def delete_template(product_id: str, template_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    t = db.query(Template).filter(Template.id == template_id, Template.product_id == product_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(t)
    db.commit()
    return {"ok": True}
