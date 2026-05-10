from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.user import User
from app.services import email_service, whatsapp_service
from app.config import get_settings

settings = get_settings()


async def notify_new_order(order: Order, user: User, db: Session):
    # Email to customer
    email_service.send_order_confirmation(
        user_email=user.email,
        user_name=user.name,
        order_number=order.order_number,
        total=float(order.total_amount),
    )
    # WhatsApp to shop owner
    if settings.WHATSAPP_NOTIFICATION_MOBILE:
        msg = (
            f"🛒 New Order: {order.order_number}\n"
            f"Customer: {user.name}\n"
            f"Amount: ₹{float(order.total_amount):.2f}\n"
            f"Payment: {order.payment_method.value.upper()}"
        )
        await whatsapp_service.send_whatsapp(settings.WHATSAPP_NOTIFICATION_MOBILE, msg)


async def notify_status_change(order: Order, user: User, note: str | None, is_public: bool):
    if is_public and user.email:
        email_service.send_status_update(
            user_email=user.email,
            user_name=user.name,
            order_number=order.order_number,
            status=order.current_status.value,
            note=note,
        )
