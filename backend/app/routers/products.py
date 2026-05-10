from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product
from app.models.template import Template
from app.schemas.product import ProductOut
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["products"])


class TemplateOut(BaseModel):
    id: str
    name: str
    preview_image: str | None
    model_config = {"from_attributes": True}


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.is_active == True).order_by(Product.sort_order).all()
    result = []
    for p in products:
        variants = [v for v in p.variants if v.is_active]
        result.append(ProductOut(
            id=p.id, name=p.name, description=p.description,
            icon=p.icon, sort_order=p.sort_order, variants=variants
        ))
    return result


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    p = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    variants = [v for v in p.variants if v.is_active]
    return ProductOut(id=p.id, name=p.name, description=p.description, icon=p.icon, sort_order=p.sort_order, variants=variants)


@router.get("/{product_id}/templates", response_model=list[TemplateOut])
def list_templates(product_id: str, db: Session = Depends(get_db)):
    return db.query(Template).filter(
        Template.product_id == product_id, Template.is_active == True
    ).all()
