from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.discount import Discount, DiscountTrigger, DiscountType
from app.models.user import User


def get_applicable_discount(user: User, db: Session) -> Discount | None:
    now = datetime.utcnow()
    discounts = db.query(Discount).filter(
        Discount.is_active == True,
        (Discount.valid_from == None) | (Discount.valid_from <= now),
        (Discount.valid_until == None) | (Discount.valid_until >= now),
    ).all()

    user_type = user.user_type.value if user.user_type else "retail"

    for d in discounts:
        applies_to = d.applies_to.value
        if applies_to != "both" and applies_to != user_type:
            continue
        if _check_trigger(d, user, now):
            return d
    return None


def calculate_discount(subtotal: float, discount: Discount | None) -> float:
    if not discount:
        return 0.0
    if discount.type == DiscountType.percentage:
        return round(subtotal * float(discount.value) / 100, 2)
    return min(float(discount.value), subtotal)


def _check_trigger(d: Discount, user: User, now: datetime) -> bool:
    trigger = d.trigger_type.value
    cfg = d.trigger_config or {}

    if trigger == DiscountTrigger.always.value:
        return True

    if trigger == DiscountTrigger.time_of_day.value:
        start = cfg.get("start", "00:00")
        end = cfg.get("end", "23:59")
        current_time = now.strftime("%H:%M")
        return start <= current_time <= end

    if trigger == DiscountTrigger.season.value:
        month = now.month
        months = cfg.get("months", [])
        return month in months

    if trigger == DiscountTrigger.loyalty.value:
        months_required = cfg.get("months_since_join", 0)
        from dateutil.relativedelta import relativedelta
        join_date = user.created_at
        return (now - join_date).days >= months_required * 30

    return False
