from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.cart import CartItem
from app.models.order import Order, OrderItem, OrderStatusHistory, OrderStatus
from app.models.address import Address
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.order import PlaceOrderIn, OrderOut
from app.services.discount_service import get_applicable_discount, calculate_discount
from app.services import notification_service

router = APIRouter(prefix="/orders", tags=["orders"])


def _next_order_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(Order).count() + 1
    return f"ORD-{year}-{count:04d}"


@router.post("", response_model=OrderOut)
async def place_order(body: PlaceOrderIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    address = db.query(Address).filter(Address.id == body.address_id, Address.user_id == user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    subtotal = 0.0
    order_items_data = []
    for ci in cart_items:
        v = ci.product_variant
        price = float(v.b2b_price if user.user_type and user.user_type.value == "b2b" else v.retail_price)
        subtotal += price
        order_items_data.append({
            "product_variant_id": ci.product_variant_id,
            "template_id": ci.template_id,
            "custom_image_path": ci.custom_image_path,
            "unit_price": price,
        })

    discount = get_applicable_discount(user, db)
    discount_amount = calculate_discount(subtotal, discount)
    total = round(subtotal - discount_amount, 2)

    order = Order(
        order_number=_next_order_number(db),
        user_id=user.id,
        address_id=body.address_id,
        subtotal=subtotal,
        discount_amount=discount_amount,
        total_amount=total,
        payment_method=body.payment_method,
    )
    db.add(order)
    db.flush()

    for data in order_items_data:
        db.add(OrderItem(order_id=order.id, **data, quantity=1))

    db.add(OrderStatusHistory(
        order_id=order.id,
        status=OrderStatus.pending,
        note="Order placed successfully",
        is_public=True,
    ))

    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    db.refresh(order)

    await notification_service.notify_new_order(order, user, db)

    return _build_order_out(order, user)


@router.get("", response_model=list[OrderOut])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return [_build_order_out(o, user) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _build_order_out(order, user)


def _build_order_out(order: Order, user: User) -> dict:
    items = []
    for i in order.items:
        v = i.product_variant
        items.append({
            "id": i.id,
            "product_variant_id": i.product_variant_id,
            "template_id": i.template_id,
            "custom_image_path": i.custom_image_path,
            "unit_price": float(i.unit_price),
            "quantity": i.quantity,
            "product_name": v.product.name if v else None,
            "variant_label": v.label if v else None,
        })

    public_history = [
        {"id": h.id, "status": h.status, "note": h.note, "is_public": h.is_public, "created_at": h.created_at}
        for h in order.status_history if h.is_public
    ]

    return {
        "id": order.id,
        "order_number": order.order_number,
        "subtotal": float(order.subtotal),
        "discount_amount": float(order.discount_amount),
        "total_amount": float(order.total_amount),
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "current_status": order.current_status,
        "created_at": order.created_at,
        "items": items,
        "status_history": public_history,
    }
