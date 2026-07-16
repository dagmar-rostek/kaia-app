from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

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
        self,
        user_id: int,
        measurement_type: MeasurementType,
        items: dict[str, Any],
        subscale_scores: dict[str, Any],
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
        # Count only sessions with at least one message — empty orphaned sessions
        # (abandoned before any message was sent) must not count toward the 10-session limit.
        r = await self.db.execute(
            text(
                "SELECT COUNT(*) FROM chat_sessions cs"
                " WHERE cs.user_id = :uid"
                " AND EXISTS (SELECT 1 FROM messages m WHERE m.session_id = cs.id)"
            ),
            {"uid": user_id},
        )
        return r.scalar() or 0
