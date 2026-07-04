"""Eval-Repository: alle DB-Zugriffe für die Eval-Domain.

Kein Business-Logic hier — nur Query-Bausteine.
Service-Layer (service.py) kombiniert diese Bausteine und enthält die Aggregations-Logik.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.eval.models import EvalResult, EvalRun, EvalRunStatus, EvalTranscript


class EvalRunRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, run: EvalRun) -> EvalRun:
        self._db.add(run)
        await self._db.commit()
        await self._db.refresh(run)
        return run

    async def get(self, run_id: str) -> EvalRun | None:
        result = await self._db.execute(select(EvalRun).where(EvalRun.id == run_id))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[EvalRun]:
        result = await self._db.execute(select(EvalRun).order_by(EvalRun.started_at.desc()))
        return list(result.scalars().all())

    async def update_status(
        self,
        run_id: str,
        status: EvalRunStatus,
        *,
        error: str | None = None,
        total_cost_eur: float | None = None,
    ) -> None:
        values: dict[str, Any] = {"status": status}
        if error is not None:
            values["error"] = error
        if total_cost_eur is not None:
            values["total_cost_eur"] = total_cost_eur
        if status in (EvalRunStatus.COMPLETED, EvalRunStatus.FAILED):
            values["finished_at"] = func.now()
        await self._db.execute(update(EvalRun).where(EvalRun.id == run_id).values(**values))
        await self._db.commit()


class EvalResultRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def bulk_create(self, results: list[EvalResult]) -> None:
        """Schreibt alle Ergebnisse eines Eval-Runs in einem Commit.

        Wird vom Evaluator aufgerufen, nachdem alle Judge-Calls für eine
        Persona × Session abgeschlossen sind. Kein Einzelschreiben — verhindert
        Partial-State bei Fehlern midway.
        """
        self._db.add_all(results)
        await self._db.commit()

    async def get_for_session(
        self, run_id: str, persona_id: str, session_number: int
    ) -> list[EvalResult]:
        """Alle Metriken für eine Persona × Session (für Slide-over Detail-Ansicht)."""
        result = await self._db.execute(
            select(EvalResult)
            .where(
                EvalResult.run_id == run_id,
                EvalResult.persona_id == persona_id,
                EvalResult.session_number == session_number,
            )
            .order_by(EvalResult.metric_key)
        )
        return list(result.scalars().all())

    async def get_aggregated_for_heatmap(
        self, run_id: str
    ) -> list[tuple[str, int, float | None, bool, bool]]:
        """Aggregiert Scores für die Heatmap: (persona_id, session_number, avg_score, has_flags, has_error).

        Eine einzige Query — kein N+1 für 100 Zellen.

        avg_score ist auf der DB-Seite berechnet (AVG über effective_score, d.h.
        COALESCE(override_score, score)). has_error wird über ein Flag in EvalResult
        gesetzt, das der Evaluator schreibt wenn die Simulation für diese Zelle abgebrochen ist.

        Rückgabe: sortiert nach persona_id, session_number.
        """
        # effective_score = COALESCE(override_score, score)
        effective_score = func.coalesce(EvalResult.override_score, EvalResult.score)

        stmt = (
            select(
                EvalResult.persona_id,
                EvalResult.session_number,
                func.avg(effective_score).label("avg_score"),
                func.bool_or(EvalResult.flagged).label("has_flags"),
                # has_error: score IS NULL AND override_score IS NULL bedeutet kein Score vorhanden
                func.bool_and(EvalResult.score.is_(None)).label("has_error"),
            )
            .where(EvalResult.run_id == run_id)
            .group_by(EvalResult.persona_id, EvalResult.session_number)
            .order_by(EvalResult.persona_id, EvalResult.session_number)
        )
        rows = await self._db.execute(stmt)
        return [
            (r.persona_id, r.session_number, r.avg_score, r.has_flags, r.has_error) for r in rows
        ]

    async def update_override(
        self,
        result_id: int,
        override_score: int,
        override_reason: str,
        override_by: str,
    ) -> EvalResult | None:
        """Schreibt manuelle Score-Korrektur (AI-Vertrauens-UX-Anforderung)."""
        from datetime import UTC, datetime

        await self._db.execute(
            update(EvalResult)
            .where(EvalResult.id == result_id)
            .values(
                override_score=override_score,
                override_reason=override_reason,
                override_by=override_by,
                override_at=datetime.now(UTC),
            )
        )
        await self._db.commit()
        result = await self._db.execute(select(EvalResult).where(EvalResult.id == result_id))
        return result.scalar_one_or_none()


class EvalTranscriptRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, transcript: EvalTranscript) -> EvalTranscript:
        self._db.add(transcript)
        await self._db.commit()
        await self._db.refresh(transcript)
        return transcript

    async def get(self, run_id: str, persona_id: str, session_number: int) -> EvalTranscript | None:
        result = await self._db.execute(
            select(EvalTranscript).where(
                EvalTranscript.run_id == run_id,
                EvalTranscript.persona_id == persona_id,
                EvalTranscript.session_number == session_number,
            )
        )
        return result.scalar_one_or_none()

    async def bulk_create(self, transcripts: list[EvalTranscript]) -> None:
        self._db.add_all(transcripts)
        await self._db.commit()
