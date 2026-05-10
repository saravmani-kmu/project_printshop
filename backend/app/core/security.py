from datetime import datetime, timedelta
from jose import jwt, JWTError
from app.config import get_settings

settings = get_settings()

ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire, "type": "access"}, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": expire, "type": "refresh"}, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_admin_approval_token(admin_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.ADMIN_APPROVAL_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"admin_id": admin_id, "exp": expire, "type": "admin_approval"}, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return {}
