from fastapi import APIRouter

from app.domains.users.auth import router as auth_router
from app.domains.users.routes import router as users_router

from .bugreport import router as bugreport_router
from .health import router as health_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(health_router)
v1_router.include_router(bugreport_router)
v1_router.include_router(auth_router)
v1_router.include_router(users_router)
