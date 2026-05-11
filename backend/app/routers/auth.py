import secrets
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.admin import Admin
from app.services.auth_service import get_google_auth_url, exchange_google_code, get_google_userinfo
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.config import get_settings
import pydantic

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


class UserTypeIn(pydantic.BaseModel):
    user_type: str


@router.get("/google/login")
def google_login():
    state = secrets.token_urlsafe(16)
    url = get_google_auth_url(state)
    return {"url": url}


@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: Session = Depends(get_db)):
    try:
        tokens = await exchange_google_code(code)
        userinfo = await get_google_userinfo(tokens["access_token"])
    except Exception:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name", email)
    picture = userinfo.get("picture")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
        db.commit()
        db.refresh(user)

    is_new = user.user_type is None
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    response = RedirectResponse(
        url=f"{settings.FRONTEND_URL}/auth/callback?new_user={str(is_new).lower()}"
    )
    _set_cookies(response, access_token, refresh_token)
    return response


@router.post("/refresh")
def refresh_token(response: Response, refresh_token: str | None = Cookie(default=None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token({"sub": user.id})
    new_refresh = create_refresh_token({"sub": user.id})
    _set_cookies(response, access_token, new_refresh)
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    is_prod = not settings.is_dev
    samesite = "none" if is_prod else "lax"
    response.delete_cookie("access_token", httponly=True, secure=is_prod, samesite=samesite)
    response.delete_cookie("refresh_token", httponly=True, secure=is_prod, samesite=samesite)
    return {"ok": True}


@router.post("/set-user-type")
def set_user_type(
    body: UserTypeIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.user_type is not None:
        raise HTTPException(status_code=400, detail="User type already set")
    if body.user_type not in ("retail", "b2b"):
        raise HTTPException(status_code=422, detail="user_type must be 'retail' or 'b2b'")
    user.user_type = body.user_type
    db.commit()
    return {"ok": True, "user_type": user.user_type}


@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.user_id == user.id).first()
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "user_type": user.user_type,
        "is_admin": admin is not None and admin.status == "approved",
        "admin_role": admin.role if admin and admin.status == "approved" else None,
    }


def _set_cookies(response: Response, access_token: str, refresh_token: str):
    is_prod = not settings.is_dev
    samesite = "none" if is_prod else "lax"
    response.set_cookie("access_token", access_token, httponly=True, secure=is_prod, samesite=samesite, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=is_prod, samesite=samesite, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400)
