"""Eval-Routes: alle HTTP-Endpunkte der Eval-Domain.

Alle Routen sind admin-only (require_admin via Router-Dependency).
Der eigentliche Eval-Prozess (LLM-Judge-Calls) wird von einem noch zu schreibenden
Evaluator-Modul ausgeführt — routes.py startet ihn als asyncio.create_task,
analog zum bestehenden Simulation-Runner.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from typing import Annotated, Any

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.db.session import get_db
from app.domains.eval.models import EvalRun, EvalRunStatus
from app.domains.eval.repository import (
    EvalResultRepository,
    EvalRunRepository,
    EvalTranscriptRepository,
)
from app.domains.eval.schemas import (
    EvalOverride,
    EvalRunCreate,
    EvalRunRead,
    EvalRunStarted,
    HeatmapRead,
    RetestCreate,
    RetestStarted,
    SessionDetailRead,
)
from app.domains.eval.service import build_heatmap, build_session_detail

log = structlog.get_logger()

router = APIRouter(
    prefix="/admin/eval",
    tags=["eval"],
    dependencies=[Depends(require_admin)],
)


def _run_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> EvalRunRepository:
    return EvalRunRepository(db)


def _result_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> EvalResultRepository:
    return EvalResultRepository(db)


def _transcript_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> EvalTranscriptRepository:
    return EvalTranscriptRepository(db)


def _make_run_id() -> str:
    return f"eval_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"


# ── GET /admin/eval/runs ───────────────────────────────────────────────────────


@router.get("/runs", response_model=list[EvalRunRead])
async def list_runs(
    repo: Annotated[EvalRunRepository, Depends(_run_repo)],
) -> list[EvalRun]:
    """Alle Eval-Runs, neueste zuerst."""
    return await repo.list_all()


# ── POST /admin/eval/runs ──────────────────────────────────────────────────────


@router.post("/runs", response_model=EvalRunStarted, status_code=202)
async def start_eval_run(
    body: EvalRunCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[Any, Depends(require_admin)],
) -> EvalRunStarted:
    """Startet einen neuen Eval-Run asynchron.

    Gibt sofort run_id + status=pending zurück.
    Polling via GET /admin/eval/runs/{run_id}/status.

    Kein Parallelitätsproblem beim Starten: der Run wird zuerst in der DB
    angelegt (status=pending), dann als Task gestartet. Auch wenn der Server
    vor Task-Start neu startet, bleibt der pending-Run in der DB sichtbar.
    """
    run_id = _make_run_id()
    repo = EvalRunRepository(db)

    config: dict[str, Any] = {
        "simulation_run_id": body.simulation_run_id,
        "all_personas": body.persona_ids is None,
        "all_sessions": body.session_numbers is None,
    }
    if body.persona_ids:
        config["persona_ids"] = body.persona_ids
    if body.session_numbers:
        config["session_numbers"] = body.session_numbers

    run = EvalRun(
        id=run_id,
        triggered_by=getattr(admin, "username", "admin"),
        status=EvalRunStatus.PENDING,
        evaluator_model=body.evaluator_model,
        simulation_run_id=body.simulation_run_id,
        config=config,
    )
    await repo.create(run)

    # Evaluator wird als Background-Task gestartet.
    # Import hier (nicht global) — evaluator.py existiert noch nicht, verhindert
    # Import-Fehler bis das Modul implementiert ist.
    try:
        from app.domains.eval.evaluator import run_eval  # noqa: PLC0415

        asyncio.create_task(run_eval(run_id, body))
    except ImportError:
        log.warning("eval_evaluator_not_implemented", run_id=run_id)
        # Run bleibt auf pending — Admin sieht das im Status-Endpoint
        await repo.update_status(
            run_id,
            EvalRunStatus.FAILED,
            error="Evaluator nicht implementiert (evaluator.py fehlt noch).",
        )

    log.info("eval_run_started", run_id=run_id, simulation_run_id=body.simulation_run_id)
    return EvalRunStarted(run_id=run_id, status=EvalRunStatus.PENDING)


# ── GET /admin/eval/runs/{run_id}/status ──────────────────────────────────────


@router.get("/runs/{run_id}/status", response_model=EvalRunRead)
async def get_run_status(
    run_id: str,
    repo: Annotated[EvalRunRepository, Depends(_run_repo)],
) -> EvalRun:
    run = await repo.get(run_id)
    if run is None:
        raise HTTPException(404, f"Eval-Run '{run_id}' nicht gefunden.")
    return run


# ── GET /admin/eval/runs/{run_id}/heatmap ─────────────────────────────────────


@router.get("/runs/{run_id}/heatmap", response_model=HeatmapRead)
async def get_heatmap(
    run_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> HeatmapRead:
    """Aggregierte Heatmap-Daten: Personas × Sessions → Score.

    Liefert auch Spalten-Durchschnitte und das schwächste Glied.
    Persona-Metadaten (learning_topic, sabotage_pattern) werden aus dem
    Simulation-Runner bezogen — derzeit aus dem in-memory _runs-Dict,
    later aus eval_runs.config.
    """
    run_repo = EvalRunRepository(db)
    result_repo = EvalResultRepository(db)

    run = await run_repo.get(run_id)
    if run is None:
        raise HTTPException(404, f"Eval-Run '{run_id}' nicht gefunden.")

    if run.status == EvalRunStatus.PENDING:
        raise HTTPException(409, "Eval-Run läuft noch nicht — warte auf status=running.")

    # Persona-Metadaten: erst aus eval_runs.config, dann Fallback auf Simulation-Runner
    persona_meta = _extract_persona_meta(run)

    return await build_heatmap(run, result_repo, persona_meta)


def _extract_persona_meta(run: EvalRun) -> dict[str, dict[str, str]]:
    """Extrahiert persona_meta aus eval_runs.config.

    Format das config enthält (wird vom Evaluator beim Schreiben befüllt):
    config["persona_meta"] = {
        "P01_Schweiger": {"learning_topic": "...", "sabotage_pattern": "..."},
        ...
    }
    """
    result: dict[str, dict[str, str]] = run.config.get("persona_meta", {})
    return result


# ── GET /admin/eval/runs/{run_id}/sessions/{persona_id}/{session_number} ──────


@router.get(
    "/runs/{run_id}/sessions/{persona_id}/{session_number}",
    response_model=SessionDetailRead,
)
async def get_session_detail(
    run_id: str,
    persona_id: str,
    session_number: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionDetailRead:
    """Detail einer Persona × Session: alle Metriken + Reasoning + Transkript.

    Entspricht dem Slide-over in der UX-Spec.
    """
    run_repo = EvalRunRepository(db)
    run = await run_repo.get(run_id)
    if run is None:
        raise HTTPException(404, f"Eval-Run '{run_id}' nicht gefunden.")

    detail = await build_session_detail(
        run_id=run_id,
        persona_id=persona_id,
        session_number=session_number,
        result_repo=EvalResultRepository(db),
        transcript_repo=EvalTranscriptRepository(db),
    )
    if detail is None:
        raise HTTPException(
            404,
            f"Keine Eval-Daten für {persona_id} × Session {session_number} in Run '{run_id}'.",
        )
    return detail


# ── POST /admin/eval/runs/{run_id}/retest ─────────────────────────────────────


@router.post("/runs/{run_id}/retest", response_model=RetestStarted, status_code=202)
async def start_retest(
    run_id: str,
    body: RetestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[Any, Depends(require_admin)],
) -> RetestStarted:
    """Startet einen Retest für eine einzelne Persona × Session.

    Erzeugt einen neuen EvalRun (retest_YYYYMMDD_HHMMSS) der auf den
    Parent-Run verweist. Die Ergebnishistorie bleibt so erhalten —
    kein Update-in-place.

    Warum kein Update des bestehenden Runs:
    - Audit-Trail: Admin soll sehen können, dass ein Retest stattgefunden hat
    - Vergleichbarkeit: Original-Score + Retest-Score nebeneinander
    - Parallelitätssicherheit: kein Concurrency-Problem beim Überschreiben
    """
    parent_run_repo = EvalRunRepository(db)
    parent_run = await parent_run_repo.get(run_id)
    if parent_run is None:
        raise HTTPException(404, f"Eval-Run '{run_id}' nicht gefunden.")

    if parent_run.status == EvalRunStatus.RUNNING:
        raise HTTPException(409, "Parent-Run läuft noch. Warte auf completion.")

    retest_run_id = f"retest_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
    evaluator_model = body.evaluator_model or parent_run.evaluator_model

    config: dict[str, Any] = {
        "parent_run_id": run_id,
        "simulation_run_id": parent_run.simulation_run_id,
        "persona_ids": [body.persona_id],
        "session_numbers": [body.session_number],
        "all_personas": False,
        "all_sessions": False,
        "is_retest": True,
    }

    retest_run = EvalRun(
        id=retest_run_id,
        triggered_by=getattr(admin, "username", "admin"),
        status=EvalRunStatus.PENDING,
        evaluator_model=evaluator_model,
        simulation_run_id=parent_run.simulation_run_id,
        config=config,
    )
    await parent_run_repo.create(retest_run)

    try:
        from app.domains.eval.evaluator import run_eval  # noqa: PLC0415

        retest_create = EvalRunCreate(
            simulation_run_id=parent_run.simulation_run_id or "",
            evaluator_model=evaluator_model,
            persona_ids=[body.persona_id],
            session_numbers=[body.session_number],
        )
        asyncio.create_task(run_eval(retest_run_id, retest_create))
    except ImportError:
        log.warning("eval_evaluator_not_implemented", run_id=retest_run_id)
        await parent_run_repo.update_status(
            retest_run_id,
            EvalRunStatus.FAILED,
            error="Evaluator nicht implementiert.",
        )

    log.info(
        "eval_retest_started",
        retest_run_id=retest_run_id,
        parent_run_id=run_id,
        persona_id=body.persona_id,
        session_number=body.session_number,
    )
    return RetestStarted(
        retest_run_id=retest_run_id,
        parent_run_id=run_id,
        persona_id=body.persona_id,
        session_number=body.session_number,
        status=EvalRunStatus.PENDING,
    )


# ── POST /admin/eval/runs/{run_id}/cancel ─────────────────────────────────────


@router.post("/runs/{run_id}/cancel", response_model=dict[str, str])
async def cancel_run(
    run_id: str,
    repo: Annotated[EvalRunRepository, Depends(_run_repo)],
    admin: Annotated[Any, Depends(require_admin)],
) -> dict[str, str]:
    """Bricht einen laufenden Eval-Run ab.

    Setzt status=failed + error='Abgebrochen'. Der Evaluator prüft
    zwischen Personas ob der Status sich geändert hat und beendet sich dann.
    Bereits gespeicherte Ergebnisse bleiben erhalten.
    """
    run = await repo.get(run_id)
    if run is None:
        raise HTTPException(404, f"Eval-Run '{run_id}' nicht gefunden.")
    if run.status not in (EvalRunStatus.RUNNING, EvalRunStatus.PENDING):
        raise HTTPException(409, f"Run ist bereits '{run.status}' — kein Abbruch möglich.")

    await repo.update_status(
        run_id,
        EvalRunStatus.FAILED,
        error=f"Abgebrochen von {getattr(admin, 'username', 'admin')}.",
    )
    log.info("eval_run_cancelled", run_id=run_id, by=getattr(admin, "username", "admin"))
    return {"status": "cancelled", "run_id": run_id}


# ── PATCH /admin/eval/runs/{run_id}/results/{result_id} ───────────────────────


@router.patch("/runs/{run_id}/results/{result_id}", response_model=dict[str, str])
async def override_result(
    run_id: str,
    result_id: int,
    body: EvalOverride,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[Any, Depends(require_admin)],
) -> dict[str, str]:
    """Manuelle Score-Korrektur durch Admin (AI-Vertrauens-UX-Anforderung).

    Schreibt override_score + override_reason in eval_results.
    Der effective_score (COALESCE(override_score, score)) wird in der
    Heatmap dann automatisch mit dem korrigierten Wert angezeigt.
    Die Zelle erhält in der UX einen [M]-Marker (manuell korrigiert).
    """
    result_repo = EvalResultRepository(db)
    updated = await result_repo.update_override(
        result_id=result_id,
        override_score=body.override_score,
        override_reason=body.override_reason,
        override_by=getattr(admin, "username", "admin"),
    )
    if updated is None:
        raise HTTPException(404, f"Eval-Result {result_id} nicht gefunden.")

    log.info(
        "eval_result_overridden",
        run_id=run_id,
        result_id=result_id,
        override_score=body.override_score,
        override_by=getattr(admin, "username", "admin"),
    )
    return {"status": "ok", "result_id": str(result_id)}
