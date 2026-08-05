import asyncio
import secrets
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.core.security import create_access_token, hash_password
from app.db.session import get_db
from app.domains.chat.repository import ChatRepository
from app.domains.chat.sse import _COST_TABLE
from app.domains.simulation.runner import (
    cancel_run,
    get_run_status,
    list_run_summaries,
    run_simulation,
)
from app.domains.users.emails import send_study_start
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
    approved = await svc.approve_user(user, data.approved_by)
    # Auto-mark as study participant if this is a real user (not simulation, not internal)
    if not approved.is_simulation and not approved.email.endswith("@kaia.internal"):
        approved.study_participant = True
        await db.commit()
        await db.refresh(approved)
    return approved


class StudyParticipantUpdate(BaseModel):
    study_participant: bool


@router.patch("/users/{user_id}/study-participant", response_model=UserAdminRead)
async def set_study_participant(
    user_id: int,
    body: StudyParticipantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Setzt oder entfernt die Studienteilnahme-Markierung für einen User."""
    user = await _get_user_or_404(user_id, db)
    user.study_participant = body.study_participant
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    svc: Annotated[UserService, Depends(_svc)],
) -> None:
    """Hard-delete: löscht User und alle verknüpften Daten per DB-Cascade."""
    user = await UserRepository(db).get_by_id(user_id)
    if not user or user.status == UserStatus.DELETED:
        raise HTTPException(404, "User nicht gefunden.")
    await svc.delete(user, "admin_removed")


class UserModelUpdate(BaseModel):
    kaia_model: str | None = None


@router.patch("/users/{user_id}/model", response_model=UserAdminRead)
async def set_user_model(
    user_id: int,
    body: UserModelUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Setzt das KAIA-Modell für einen einzelnen User (null = globales System-Modell)."""
    user = await _get_user_or_404(user_id, db)
    if body.kaia_model is not None and body.kaia_model not in _COST_TABLE:
        raise HTTPException(400, f"Unbekanntes Modell: {body.kaia_model}")
    user.kaia_model = body.kaia_model
    await db.commit()
    await db.refresh(user)
    return user


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
        user = await repo.create(
            User(
                email=test_email,
                username="admin_test",
                password_hash=hash_password(secrets.token_urlsafe(32)),
                status=UserStatus.ACTIVE,
                is_simulation=True,
                consent_data=True,
                consent_analytics=True,
                consent_version="1.0",
                consent_at=datetime.now(UTC),
                onboarding_complete=True,
                ki_disclosure_seen_at=datetime.now(UTC),
                preferred_name="Test",
                approved_at=datetime.now(UTC),
                approved_by="system",
            )
        )
    else:
        # Ensure required flags are set regardless of how the user was originally created
        changed = False
        if not user.is_simulation:
            user.is_simulation = True
            changed = True
        if not user.ki_disclosure_seen_at:
            user.ki_disclosure_seen_at = datetime.now(UTC)
            changed = True
        if not user.preferred_name:
            user.preferred_name = "Test"
            changed = True
        if changed:
            await db.commit()
    return {"access_token": create_access_token(user.id, expire_minutes=480)}


class SimulationStart(BaseModel):
    persona_ids: list[str] | None = None


@router.post("/simulation/run")
async def start_simulation(body: SimulationStart | None = None) -> dict[str, str]:
    """Start a crash-persona simulation run in the background.

    Pass persona_ids to run a subset; omit or pass null for all 10.
    Returns a run_id that can be polled with /simulation/status/{run_id}.
    """
    run_id = f"crash_test_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}"
    asyncio.create_task(run_simulation(run_id, body.persona_ids if body else None))
    return {"run_id": run_id, "status": "started"}


@router.get("/simulation/runs")
async def list_simulation_runs() -> list[dict[str, Any]]:
    """List run summaries with metadata (in-memory, lost on server restart)."""
    return list_run_summaries()


@router.post("/simulation/cancel/{run_id}")
async def cancel_simulation_run(run_id: str) -> dict[str, str]:
    """Signal a running simulation to stop after the current persona finishes."""
    ok = cancel_run(run_id)
    if not ok:
        raise HTTPException(409, f"Run '{run_id}' läuft nicht oder existiert nicht.")
    return {"status": "cancelled", "run_id": run_id}


@router.get("/simulation/status/{run_id}")
async def get_simulation_status(run_id: str) -> dict[str, Any]:
    """Return current status and progress for a simulation run."""
    run = get_run_status(run_id)
    if run is None:
        raise HTTPException(404, f"Run '{run_id}' nicht gefunden.")
    summary = {
        "run_id": run["run_id"],
        "status": run["status"],
        "started_at": run["started_at"],
        "finished_at": run["finished_at"],
        "error": run["error"],
        "personas": [
            {
                "codename": p["codename"],
                "status": p["status"],
                "sessions_done": sum(1 for s in p["sessions"] if s["status"] == "done"),
                "error": p["error"],
            }
            for p in run["personas"]
        ],
    }
    return summary


@router.get("/simulation/results/{run_id}")
async def get_simulation_results(run_id: str) -> dict[str, Any]:
    """Return full persona transcripts and survey scores for a run."""
    run = get_run_status(run_id)
    if run is None:
        raise HTTPException(404, f"Run '{run_id}' nicht gefunden.")
    return run


@router.get("/costs")
async def get_costs(db: Annotated[AsyncSession, Depends(get_db)]) -> dict[str, Any]:
    """Return aggregated LLM inference costs from llm_usage table."""
    from sqlalchemy import text

    rows = await db.execute(
        text(
            "SELECT model, provider, "
            "SUM(input_tokens) AS input_tokens, "
            "SUM(output_tokens) AS output_tokens, "
            "SUM(cache_creation_tokens) AS cache_creation_tokens, "
            "SUM(cache_read_tokens) AS cache_read_tokens, "
            "SUM(cost_eur) AS cost_eur, "
            "COUNT(DISTINCT session_id) AS sessions "
            "FROM llm_usage GROUP BY model, provider ORDER BY cost_eur DESC"
        )
    )
    by_model = [dict(r._mapping) for r in rows]

    total = await db.execute(text("SELECT COALESCE(SUM(cost_eur), 0) FROM llm_usage"))
    total_eur = float(total.scalar() or 0)

    per_session = await db.execute(
        text(
            "SELECT s.session_number, u.username, s.started_at, "
            "SUM(l.cost_eur) AS cost_eur, "
            "SUM(l.input_tokens) AS input_tokens, "
            "SUM(l.output_tokens) AS output_tokens, "
            "SUM(l.cache_read_tokens) AS cache_read_tokens "
            "FROM llm_usage l "
            "JOIN chat_sessions s ON s.id = l.session_id "
            "JOIN users u ON u.id = l.user_id "
            "GROUP BY s.id, s.session_number, u.username, s.started_at "
            "ORDER BY s.id DESC LIMIT 50"
        )
    )
    sessions = [dict(r._mapping) for r in per_session]

    per_user = await db.execute(
        text(
            "SELECT u.username, "
            "COUNT(DISTINCT l.session_id) AS sessions, "
            "SUM(l.input_tokens) AS input_tokens, "
            "SUM(l.output_tokens) AS output_tokens, "
            "SUM(l.cache_read_tokens) AS cache_read_tokens, "
            "SUM(l.cost_eur) AS cost_eur "
            "FROM llm_usage l "
            "JOIN users u ON u.id = l.user_id "
            "GROUP BY u.id, u.username "
            "ORDER BY cost_eur DESC"
        )
    )
    by_user = [dict(r._mapping) for r in per_user]

    return {
        "total_eur": total_eur,
        "by_model": by_model,
        "recent_sessions": sessions,
        "by_user": by_user,
    }


@router.post("/study-start-mail", status_code=200)
async def send_study_start_emails(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, int]:
    """Sendet die Studienstart-E-Mail an alle aktiven (freigeschalteten) User.

    Schließt admin_test@kaia.internal aus. Kann mehrfach aufgerufen werden —
    Verantwortung für Timing liegt beim Admin.
    """
    users = await UserRepository(db).get_all(UserStatus.ACTIVE)
    real_users = [
        u for u in users if not u.email.endswith("@kaia.internal") and not u.is_simulation
    ]
    for user in real_users:
        await send_study_start(user.username, user.email)
    return {"sent": len(real_users)}


@router.post("/users/{user_id}/study-start-mail", status_code=200)
async def send_single_study_start_mail(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    """Sendet die Studienstart-E-Mail an einen einzelnen User."""
    user = await _get_user_or_404(user_id, db)
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(400, "User ist nicht aktiv.")
    await send_study_start(user.username, user.email)
    return {"sent": user.email}


@router.post("/users/{user_id}/seed-completion", status_code=204)
async def seed_completion(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Seed synthetic post-survey results for simulation users.

    Copies pre-survey values verbatim as post values — clearly marked as test data.
    Only permitted for is_simulation=True users.
    """
    from app.domains.survey.models import MeasurementType
    from app.domains.survey.repository import SurveyRepository
    from app.domains.survey.service import compute_subscale_scores

    user = await _get_user_or_404(user_id, db)
    if not user.is_simulation:
        raise HTTPException(400, "Nur für Simulationsuser erlaubt.")

    repo = SurveyRepository(db)

    pre_gse = await repo.get_gse_result(user.id, MeasurementType.PRE)
    post_gse = await repo.get_gse_result(user.id, MeasurementType.POST)
    if pre_gse and not post_gse:
        await repo.create_gse_result(user.id, MeasurementType.POST, list(pre_gse.items))

    pre_mslq = await repo.get_mslq_result(user.id, MeasurementType.PRE)
    post_mslq = await repo.get_mslq_result(user.id, MeasurementType.POST)
    if pre_mslq and not post_mslq:
        items: dict[str, int] = {k: int(v) for k, v in pre_mslq.items.items()}
        await repo.create_mslq_result(
            user.id,
            MeasurementType.POST,
            items,
            compute_subscale_scores(items),
        )


@router.delete("/reset-test-user", status_code=204)
async def reset_test_user(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Delete all chat sessions and memory for the admin_test user.

    Resets the test account to session_number 1 without deleting the user itself.
    Only available to admins. Cascade at DB level removes messages + feedback.
    """
    test_email = "admin_test@kaia.internal"
    user = await UserRepository(db).get_by_email(test_email)
    if not user:
        return  # nothing to reset
    await ChatRepository(db).delete_user_data(user.id)


@router.post("/users/{user_id}/seed-sessions", status_code=204)
async def seed_sessions(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    count: int = 10,
) -> None:
    """Seed N completed chat sessions for simulation users.

    Each session gets one user message so it counts toward the 10-session journey limit.
    Used in admin journey test to skip manual session work and reach POST_PENDING state.
    Only permitted for is_simulation=True users.
    """
    from sqlalchemy import func, select

    from app.domains.chat.models import ChatSession, Message, MessageRole

    user = await _get_user_or_404(user_id, db)
    if not user.is_simulation:
        raise HTTPException(400, "Nur für Simulationsuser erlaubt.")

    max_num_result = await db.execute(
        select(func.max(ChatSession.session_number)).where(ChatSession.user_id == user_id)
    )
    current_max = int(max_num_result.scalar() or 0)

    now = datetime.now(UTC)
    for i in range(count):
        session = ChatSession(
            user_id=user_id,
            character="warm",
            session_number=current_max + i + 1,
            started_at=now,
            ended_at=now,
        )
        db.add(session)
        await db.flush()
        db.add(
            Message(
                session_id=session.id,
                role=MessageRole.USER,
                content=f"[Test-Session {current_max + i + 1}]",
            )
        )

    await db.commit()
