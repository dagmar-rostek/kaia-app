from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.chat.models import ChatSession
from app.domains.survey.models import GseResult, MeasurementType, MslqResult


class SurveyRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_mslq_result(self, user_id: int, mt: MeasurementType) -> MslqResult | None:
        r = await self.db.execute(
            select(MslqResult)
            .where(MslqResult.user_id == user_id, MslqResult.measurement_type == mt)
            .order_by(MslqResult.created_at.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def create_mslq_result(
        self, user_id: int, measurement_type: MeasurementType, items: dict, subscale_scores: dict
    ) -> MslqResult:
        obj = MslqResult(
            user_id=user_id,
            measurement_type=measurement_type,
            items=items,
            subscale_scores=subscale_scores,
        )
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def get_gse_result(self, user_id: int, mt: MeasurementType) -> GseResult | None:
        r = await self.db.execute(
            select(GseResult)
            .where(GseResult.user_id == user_id, GseResult.measurement_type == mt)
            .order_by(GseResult.created_at.desc())
            .limit(1)
        )
        return r.scalar_one_or_none()

    async def create_gse_result(
        self, user_id: int, measurement_type: MeasurementType, items: list[int]
    ) -> GseResult:
        total_score = sum(items) / len(items)
        obj = GseResult(
            user_id=user_id,
            measurement_type=measurement_type,
            items=items,
            total_score=total_score,
        )
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def get_session_count(self, user_id: int) -> int:
        r = await self.db.execute(
            select(func.count()).select_from(ChatSession).where(ChatSession.user_id == user_id)
        )
        return r.scalar() or 0
