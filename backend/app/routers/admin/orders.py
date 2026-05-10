from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderStatusHistory
from app.models.admin import Admin
from app.core.dependencies import get_current_admin
from app.schemas.order import UpdateOrderStatusIn
from app.services import notification_service

router = APIRouter(prefix="/admin/orders", tags=["admin-orders"])


@router.get("")
def list_all_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.current_status == status)
    orders = q.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "order_number": o.order_number,
            "user_name": o.user.name,
            "user_email": o.user.email,
            "total_amount": float(o.total_amount),
            "payment_method": o.payment_method,
            "payment_status": o.payment_status,
            "current_status": o.current_status,
            "created_at": o.created_at,
            "item_count": len(o.items),
        })
    return result


@router.get("/{order_id}")
def get_order_detail(order_id: str, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id,
        "order_number": order.order_number,
        "user": {"id": order.user.id, "name": order.user.name, "email": order.user.email},
        "address": {
            "full_name": order.address.full_name,
            "mobile": order.address.mobile,
            "line1": order.address.line1,
            "line2": order.address.line2,
            "city": order.address.city,
            "state": order.address.state,
            "pincode": order.address.pincode,
        },
        "subtotal": float(order.subtotal),
        "discount_amount": float(order.discount_amount),
        "total_amount": float(order.total_amount),
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "current_status": order.current_status,
        "created_at": order.created_at,
        "items": [
            {
                "id": i.id,
                "product_name": i.product_variant.product.name,
                "variant_label": i.product_variant.label,
                "unit_price": float(i.unit_price),
                "template_id": i.template_id,
                "custom_image_path": i.custom_image_path,
            }
            for i in order.items
        ],
        "status_history": [
            {
                "id": h.id,
                "status": h.status,
                "note": h.note,
                "is_public": h.is_public,
                "created_at": h.created_at,
                "created_by": h.created_by_admin.user.name if h.created_by_admin else "System",
            }
            for h in order.status_history
        ],
    }


@router.post("/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: UpdateOrderStatusIn,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.current_status = body.status
    history = OrderStatusHistory(
        order_id=order.id,
        status=body.status,
        note=body.note,
        is_public=body.is_public,
        created_by=admin.id,
    )
    db.add(history)
    db.commit()
    db.refresh(order)

    await notification_service.notify_status_change(order, order.user, body.note, body.is_public)
    return {"ok": True, "status": order.current_status}


@router.patch("/{order_id}/payment")
def update_payment_status(
    order_id: str,
    payment_status: str,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if payment_status not in ("pending", "paid", "failed"):
        raise HTTPException(status_code=422, detail="Invalid payment status")
    order.payment_status = payment_status
    db.commit()
    return {"ok": True}
