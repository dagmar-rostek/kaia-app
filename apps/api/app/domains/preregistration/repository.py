from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import PreRegistration


class PreRegistrationRepo:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def count_active(self) -> int:
        result = await self.db.execute(
            select(func.count()).where(PreRegistration.status == "active")
        )
        return result.scalar_one()

    async def exists_email(self, email: str) -> bool:
        result = await self.db.execute(
            select(PreRegistration.id).where(PreRegistration.email == email)
        )
        return result.first() is not None

    async def create(self, name: str, email: str, reason: str) -> PreRegistration:
        entry = PreRegistration(name=name, email=email, reason=reason)
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def get_by_token(self, token: str) -> PreRegistration | None:
        result = await self.db.execute(
            select(PreRegistration).where(PreRegistration.unsubscribe_token == token)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, id_: str) -> PreRegistration | None:
        result = await self.db.execute(select(PreRegistration).where(PreRegistration.id == id_))
        return result.scalar_one_or_none()

    async def set_status(self, entry: PreRegistration, status: str) -> None:
        entry.status = status
        await self.db.commit()

    async def list_all(self) -> list[PreRegistration]:
        result = await self.db.execute(
            select(PreRegistration).order_by(PreRegistration.created_at.desc())
        )
        return list(result.scalars().all())
