from fastapi import APIRouter

from .health import router as health_router
from .bugreport import router as bugreport_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(health_router)
v1_router.include_router(bugreport_router)
