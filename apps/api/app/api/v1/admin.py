import secrets
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.core.security import create_access_token, hash_password
from app.db.session import get_db
from app.domains.users.models import User, UserStatus
from app.domains.users.repository import RefreshTokenRepository, UserRepository
from app.domains.users.schemas import UserAdminRead, UserApprove, UserReject
from app.domains.users.service import UserService

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _svc(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(UserRepository(db), RefreshTokenRepository(db))


async def _get_user_or_404(user_id: int, db: AsyncSession) -> User:
    user = await UserRepository(db).get_by_id(user_id)
    if not user or user.status == UserStatus.DELETED:
        raise HTTPException(404, "User nicht gefunden.")
    return user


@router.get("/users", response_model=list[UserAdminRead])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str | None = None,
) -> list[User]:
    """List all non-deleted users, optionally filtered by status."""
    parsed = UserStatus(status) if status else None
    return await UserRepository(db).get_all(parsed)


@router.post("/users/{user_id}/approve", response_model=UserAdminRead)
async def approve_user(
    user_id: int,
    data: UserApprove,
    db: Annotated[AsyncSession, Depends(get_db)],
    svc: Annotated[UserService, Depends(_svc)],
) -> User:
    user = await _get_user_or_404(user_id, db)
    if user.status == UserStatus.ACTIVE:
        raise HTTPException(409, "User ist bereits aktiv.")
    return await svc.approve_user(user, data.approved_by)


@router.post("/users/{user_id}/reject", response_model=UserAdminRead)
async def reject_user(
    user_id: int,
    data: UserReject,
    db: Annotated[AsyncSession, Depends(get_db)],
    svc: Annotated[UserService, Depends(_svc)],
) -> User:
    user = await _get_user_or_404(user_id, db)
    return await svc.reject_user(user, data.reason)


@router.post("/test-token")
async def create_test_token(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    """Return a short-lived JWT for admin chat testing.

    Creates a dedicated test user (admin_test@kaia.internal) if it doesn't exist.
    The account can never be logged into via the normal login flow — its password
    is a random secret that is never exposed.
    """
    repo = UserRepository(db)
    test_email = "admin_test@kaia.internal"
    user = await repo.get_by_email(test_email)
    if not user:
        user = User(
            email=test_email,
            username="admin_test",
            password_hash=hash_password(secrets.token_urlsafe(32)),
            status=UserStatus.ACTIVE,
            consent_data=True,
            consent_analytics=True,
            consent_version="1.0",
            consent_at=datetime.now(UTC),
            onboarding_complete=True,
            approved_at=datetime.now(UTC),
            approved_by="system",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return {"access_token": create_access_token(user.id)}
