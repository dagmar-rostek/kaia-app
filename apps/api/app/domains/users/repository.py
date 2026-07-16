from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.users.models import (
    PasswordResetToken,
    RefreshToken,
    User,
    UserLearningProfile,
    UserStatus,
)


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self._db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        return await self._db.get(User, user_id)

    async def get_pending(self) -> list[User]:
        result = await self._db.execute(select(User).where(User.status == UserStatus.PENDING))
        return list(result.scalars().all())

    async def get_all(self, status: UserStatus | None = None) -> list[User]:
        q = select(User).where(User.status != UserStatus.DELETED)
        if status:
            q = q.where(User.status == status)
        result = await self._db.execute(q.order_by(User.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, user: User) -> User:
        self._db.add(user)
        await self._db.commit()
        await self._db.refresh(user)
        return user

    async def save(self, user: User) -> User:
        await self._db.commit()
        await self._db.refresh(user)
        return user


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, token: RefreshToken) -> RefreshToken:
        self._db.add(token)
        await self._db.commit()
        await self._db.refresh(token)
        return token

    async def get_by_hash(self, token_hash: str) -> RefreshToken | None:
        result = await self._db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def revoke_family(self, family: str, reason: str) -> None:
        result = await self._db.execute(
            select(RefreshToken).where(
                RefreshToken.family == family,
                RefreshToken.revoked_at.is_(None),
            )
        )
        now = datetime.now(UTC)
        for token in result.scalars().all():
            token.revoked_at = now
            token.revoke_reason = reason
        await self._db.commit()

    async def revoke_all_for_user(self, user_id: int, reason: str) -> None:
        result = await self._db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
        )
        now = datetime.now(UTC)
        for token in result.scalars().all():
            token.revoked_at = now
            token.revoke_reason = reason
        await self._db.commit()


class PasswordResetTokenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, token: PasswordResetToken) -> PasswordResetToken:
        self._db.add(token)
        await self._db.commit()
        await self._db.refresh(token)
        return token

    async def get_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        result = await self._db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def save(self, token: PasswordResetToken) -> None:
        await self._db.commit()


class UserProfileRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_profile(self, user_id: int) -> UserLearningProfile | None:
        result = await self._db.execute(
            select(UserLearningProfile).where(UserLearningProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_profile(self, profile: UserLearningProfile) -> UserLearningProfile:
        self._db.add(profile)
        await self._db.commit()
        await self._db.refresh(profile)
        return profile
