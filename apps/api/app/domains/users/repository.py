from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.users.models import User, UserStatus


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        return await self._db.get(User, user_id)

    async def get_pending(self) -> list[User]:
        result = await self._db.execute(select(User).where(User.status == UserStatus.PENDING))
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
