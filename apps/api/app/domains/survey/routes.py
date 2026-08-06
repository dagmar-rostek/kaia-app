import json
from datetime import date
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.chat.repository import ChatRepository
from app.domains.survey.models import GseResult, MeasurementType, MslqResult
from app.domains.survey.repository import SurveyRepository
from app.domains.survey.schemas import (
    GseRead,
    GseSubmit,
    JourneyStateResponse,
    MslqRead,
    MslqSubmit,
)
from app.domains.survey.service import (
    compute_subscale_scores,
    get_journey_state,
    maybe_create_learning_profile,
)

router = APIRouter(prefix="/survey", tags=["survey"])


@router.get("/journey", response_model=JourneyStateResponse)
async def get_journey(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> JourneyStateResponse:
    return await get_journey_state(user.id, db)


@router.post("/mslq", response_model=MslqRead, status_code=status.HTTP_201_CREATED)
async def submit_mslq(
    body: MslqSubmit,
    background_tasks: BackgroundTasks,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> MslqRead:
    repo = SurveyRepository(db)

    existing = await repo.get_mslq_result(user.id, body.measurement_type)
    if existing:
        return MslqRead.model_validate(existing)

    if len(body.items) < 30:
        raise HTTPException(status_code=422, detail="30 MSLQ-Items erforderlich.")

    subscale_scores = compute_subscale_scores(body.items)
    result = await repo.create_mslq_result(
        user_id=user.id,
        measurement_type=body.measurement_type,
        items=body.items,
        subscale_scores=subscale_scores,
    )
    # Trigger profile creation if both pre-surveys are now complete
    if body.measurement_type.value == "pre":
        background_tasks.add_task(maybe_create_learning_profile, user.id)
    return MslqRead.model_validate(result)


@router.delete("/journey/reset", status_code=204)
async def reset_journey(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> None:
    """Dev/Admin: Reset journey state — deletes all surveys and chat sessions for current user."""
    await db.execute(delete(MslqResult).where(MslqResult.user_id == user.id))
    await db.execute(delete(GseResult).where(GseResult.user_id == user.id))
    await db.commit()
    await ChatRepository(db).delete_user_data(user.id)


@router.post("/gse", response_model=GseRead, status_code=status.HTTP_201_CREATED)
async def submit_gse(
    body: GseSubmit,
    background_tasks: BackgroundTasks,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> GseRead:
    repo = SurveyRepository(db)

    existing = await repo.get_gse_result(user.id, body.measurement_type)
    if existing:
        return GseRead.model_validate(existing)

    if len(body.items) != 10:
        raise HTTPException(status_code=422, detail="10 GSE-Items erforderlich.")

    result = await repo.create_gse_result(
        user_id=user.id,
        measurement_type=body.measurement_type,
        items=body.items,
    )
    # Trigger profile creation if both pre-surveys are now complete
    if body.measurement_type.value == "pre":
        background_tasks.add_task(maybe_create_learning_profile, user.id)
    return GseRead.model_validate(result)


@router.get("/results")
async def get_survey_results(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> dict[str, dict[str, dict[str, object] | None]]:
    """Return all available pre and post survey results for the authenticated user.

    Used by the post-study completion screen to display the pre/post comparison.
    Only available after study completion (post data must exist).
    """
    repo = SurveyRepository(db)
    pre_mslq = await repo.get_mslq_result(user.id, MeasurementType.PRE)
    pre_gse = await repo.get_gse_result(user.id, MeasurementType.PRE)
    post_mslq = await repo.get_mslq_result(user.id, MeasurementType.POST)
    post_gse = await repo.get_gse_result(user.id, MeasurementType.POST)

    def _mslq(r: MslqResult | None) -> dict[str, object] | None:
        return MslqRead.model_validate(r).model_dump(mode="json") if r else None

    def _gse(r: GseResult | None) -> dict[str, object] | None:
        return GseRead.model_validate(r).model_dump(mode="json") if r else None

    return {
        "pre": {"mslq": _mslq(pre_mslq), "gse": _gse(pre_gse)},
        "post": {"mslq": _mslq(post_mslq), "gse": _gse(post_gse)},
    }


@router.get("/abschluss")
async def get_abschluss_data(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> dict[str, Any]:
    """Full data for the completion screen: GSE items, MSLQ subscales, sessions with summaries + messages."""
    repo = SurveyRepository(db)
    chat_repo = ChatRepository(db)

    pre_gse = await repo.get_gse_result(user.id, MeasurementType.PRE)
    post_gse = await repo.get_gse_result(user.id, MeasurementType.POST)
    pre_mslq = await repo.get_mslq_result(user.id, MeasurementType.PRE)
    post_mslq = await repo.get_mslq_result(user.id, MeasurementType.POST)

    raw_sessions = await chat_repo.list_sessions(user.id)
    raw_sessions = sorted(raw_sessions, key=lambda s: s.session_number)

    sessions: list[dict[str, Any]] = []
    for s in raw_sessions:
        messages = await chat_repo.get_messages(s.id)
        summary: dict[str, Any] | None = None
        if s.session_summary:
            try:
                summary = json.loads(s.session_summary)
            except (json.JSONDecodeError, TypeError):
                pass
        sessions.append(
            {
                "id": s.id,
                "session_number": s.session_number,
                "started_at": s.started_at.isoformat() if s.started_at else None,
                "message_count": len(messages),
                "summary": summary,
                "messages": [{"role": str(m.role), "content": m.content} for m in messages],
            }
        )

    def _gse_data(r: GseResult | None) -> dict[str, Any] | None:
        if not r:
            return None
        return {"total_score": float(r.total_score), "items": list(r.items) if r.items else []}

    def _mslq_data(r: MslqResult | None) -> dict[str, Any] | None:
        if not r:
            return None
        return {"subscale_scores": dict(r.subscale_scores or {})}

    return {
        "gse_pre": _gse_data(pre_gse),
        "gse_post": _gse_data(post_gse),
        "mslq_pre": _mslq_data(pre_mslq),
        "mslq_post": _mslq_data(post_mslq),
        "sessions": sessions,
    }


@router.get("/abschluss/pdf")
async def download_abschluss_pdf(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> Response:
    """Generate personal PDF report for the authenticated user."""
    from app.api.v1.export import _build_report_html

    repo = SurveyRepository(db)
    chat_repo = ChatRepository(db)

    pre_gse = await repo.get_gse_result(user.id, MeasurementType.PRE)
    post_gse = await repo.get_gse_result(user.id, MeasurementType.POST)
    pre_mslq = await repo.get_mslq_result(user.id, MeasurementType.PRE)
    post_mslq = await repo.get_mslq_result(user.id, MeasurementType.POST)

    raw_sessions = await chat_repo.list_sessions(user.id)
    raw_sessions = sorted(raw_sessions, key=lambda s: s.session_number)

    sessions_with_messages: list[dict[str, Any]] = []
    for s in raw_sessions:
        messages = await chat_repo.get_messages(s.id)
        if not messages:
            continue
        summary: dict[str, Any] | None = None
        if s.session_summary:
            try:
                summary = json.loads(s.session_summary)
            except (json.JSONDecodeError, TypeError):
                pass
        sessions_with_messages.append(
            {
                "session_number": s.session_number,
                "started_at": s.started_at,
                "summary": summary,
                "messages": [{"role": str(m.role), "content": m.content} for m in messages],
            }
        )

    html = _build_report_html(
        user=user,
        pre_gse=pre_gse,
        post_gse=post_gse,
        pre_mslq=pre_mslq,
        post_mslq=post_mslq,
        sessions=sessions_with_messages,
    )

    today = date.today().isoformat()
    safe_name = (user.username or "user").replace(" ", "_")

    try:
        from weasyprint import HTML as WeasyPrintHTML

        pdf_bytes: bytes = WeasyPrintHTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="kaia_bericht_{safe_name}_{today}.pdf"'
            },
        )
    except ImportError:
        return Response(
            content=html.encode("utf-8"),
            media_type="text/html",
            headers={
                "Content-Disposition": f'inline; filename="kaia_bericht_{safe_name}_{today}.html"'
            },
        )
