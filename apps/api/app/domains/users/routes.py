from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.users.repository import RefreshTokenRepository, UserRepository
from app.domains.users.schemas import (
    ConsentUpdate,
    DeleteRequest,
    TopicUpdate,
    UserExport,
    UserRead,
)
from app.domains.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def _user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(UserRepository(db), RefreshTokenRepository(db))


@router.get("/me")
async def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.get("/me/export")
async def export_my_data(
    current_user: CurrentUser,
    svc: Annotated[UserService, Depends(_user_service)],
) -> UserExport:
    """DSGVO Art. 20 — Datenportabilität."""
    user = await svc.export(current_user)
    return UserExport.model_validate(user)


@router.delete("/me", status_code=204)
async def delete_my_account(
    data: DeleteRequest,
    current_user: CurrentUser,
    svc: Annotated[UserService, Depends(_user_service)],
    response: Response,
) -> None:
    """DSGVO Art. 17 — Recht auf Vergessenwerden."""
    await svc.delete(current_user, data.reason)
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")


@router.patch("/me/topic")
async def update_topic(
    data: TopicUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserRead:
    current_user.learning_topic = data.learning_topic
    current_user.onboarding_complete = True
    await db.commit()
    await db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.patch("/me/consent")
async def update_consent(
    data: ConsentUpdate,
    current_user: CurrentUser,
    svc: Annotated[UserService, Depends(_user_service)],
) -> UserRead:
    """DSGVO Art. 7 (3) — Consent jederzeit widerrufbar."""
    user = await svc.update_consent(current_user, data.consent_analytics)
    return UserRead.model_validate(user)
