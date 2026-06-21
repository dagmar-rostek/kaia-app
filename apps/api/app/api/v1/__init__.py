from fastapi import APIRouter

from app.domains.chat.routes import router as chat_router
from app.domains.preregistration.routes import router as prereg_router
from app.domains.survey.routes import router as survey_router
from app.domains.users.auth import router as auth_router
from app.domains.users.routes import router as users_router

from .admin import router as admin_router
from .bugreport import router as bugreport_router
from .health import router as health_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(health_router)
v1_router.include_router(bugreport_router)
v1_router.include_router(auth_router)
v1_router.include_router(users_router)
v1_router.include_router(admin_router)
v1_router.include_router(prereg_router)
v1_router.include_router(survey_router)
v1_router.include_router(chat_router)
