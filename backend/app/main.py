from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path

from app.config import get_settings
from app.database import engine
from app.models import *  # register all models with Base
from app.database import Base

from app.routers import auth, products, cart, orders, addresses, uploads
from app.routers.admin import register, products as admin_products, orders as admin_orders
from app.routers.admin import discounts as admin_discounts, users as admin_users, config as admin_config

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.is_dev:
        Base.metadata.create_all(bind=engine)
    Path(settings.UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="PrintShop API",
    version="1.0.0",
    docs_url="/docs" if settings.is_dev else None,
    redoc_url="/redoc" if settings.is_dev else None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
uploads_path = Path(settings.UPLOADS_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(addresses.router)
app.include_router(uploads.router)

app.include_router(register.router)
app.include_router(admin_products.router)
app.include_router(admin_orders.router)
app.include_router(admin_discounts.router)
app.include_router(admin_users.router)
app.include_router(admin_config.router)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.APP_ENV}
