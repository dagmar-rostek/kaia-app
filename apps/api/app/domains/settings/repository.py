from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.settings.models import SystemSetting


class SystemSettingsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, key: str) -> str | None:
        obj = await self.db.get(SystemSetting, key)
        return obj.value if obj else None

    async def set(self, key: str, value: str) -> None:
        obj = await self.db.get(SystemSetting, key)
        if obj:
            obj.value = value
        else:
            self.db.add(SystemSetting(key=key, value=value))
        await self.db.commit()
