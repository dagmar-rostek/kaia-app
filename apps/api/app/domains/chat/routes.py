from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.chat.models import FeedbackType
from app.domains.chat.repository import ChatRepository
from app.domains.chat.schemas import (
    FeedbackCreate,
    FeedbackResponse,
    MessageCreate,
    SessionCreate,
    SessionResponse,
    SessionWithMessages,
)
from app.domains.chat.service import (
    stream_closing,
    stream_meta_question,
    stream_opening,
    stream_response,
)
from app.domains.chat.summary import extract_session_summary
from app.domains.survey.schemas import JourneyStateEnum
from app.domains.survey.service import get_journey_state

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    body: SessionCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> SessionResponse:
    repo = ChatRepository(db)
    journey = await get_journey_state(user.id, db)
    if journey.state == JourneyStateEnum.PRE_PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "pre_survey_required", "redirect": "/survey/pre"},
        )
    if journey.state == JourneyStateEnum.POST_PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "post_survey_required", "redirect": "/survey/post"},
        )
    if journey.state == JourneyStateEnum.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "study_completed"},
        )
    # Cost guard — skip for simulation users (is_simulation flag set by runner)
    if not getattr(user, "is_simulation", False):
        row = await db.execute(
            text("SELECT COALESCE(SUM(cost_eur), 0) FROM llm_usage WHERE user_id = :uid"),
            {"uid": user.id},
        )
        total_cost: float = row.scalar() or 0.0
        if total_cost >= settings.max_cost_per_user_eur:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "cost_limit_reached",
                    "spent_eur": round(total_cost, 4),
                    "limit_eur": settings.max_cost_per_user_eur,
                },
            )
    session = await repo.create_session(
        user_id=user.id,
        character=body.character,
        daily_plan=body.daily_plan,
        active_goal_id=body.active_goal_id,
    )
    return SessionResponse.model_validate(session)


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> list[SessionResponse]:
    repo = ChatRepository(db)
    sessions = await repo.list_sessions(user.id)
    return [SessionResponse.model_validate(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=SessionWithMessages)
async def get_session(
    session_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> SessionWithMessages:
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    return SessionWithMessages.model_validate(session)


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: int,
    body: MessageCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    debug: bool = Query(default=False),
) -> StreamingResponse:
    """Send a message and receive KAIA's response as SSE stream.

    SSE format:
        data: {"type": "delta", "content": "..."}
        data: {"type": "done", "message_id": 42, "input_tokens": 100, "output_tokens": 50}
        data: {"type": "error", "message": "..."}
    """
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is not None:
        raise HTTPException(status_code=409, detail="Session ist bereits beendet.")

    return StreamingResponse(
        stream_response(db, session, body.content, debug=debug),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable Nginx/Caddy buffering
        },
    )


@router.post("/sessions/{session_id}/opening")
async def generate_opening(
    session_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    debug: bool = Query(default=False),
) -> StreamingResponse:
    """Generate KAIA's opening message for a new session (SSE stream)."""
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is not None:
        raise HTTPException(status_code=409, detail="Session ist bereits beendet.")

    return StreamingResponse(
        stream_opening(db, session, debug=debug),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/sessions/{session_id}/closing")
async def generate_closing(
    session_id: int,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
    debug: bool = Query(default=False),
) -> StreamingResponse:
    """Generate KAIA's closing question (SSE stream).

    Called when user initiates session end. Session stays open until /end is called.
    """
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is not None:
        raise HTTPException(status_code=409, detail="Session ist bereits beendet.")

    return StreamingResponse(
        stream_closing(db, session, debug=debug),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/sessions/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: int,
    user: CurrentUser,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> SessionResponse:
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is None:
        await repo.end_session(session)
        # Extract session summary in background — feeds cross-session memory
        background_tasks.add_task(extract_session_summary, session_id)
    return SessionResponse.model_validate(session)


@router.post(
    "/sessions/{session_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
async def save_feedback(
    session_id: int,
    body: FeedbackCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> FeedbackResponse:
    """Save an EMA feedback signal (passive types: transfer_marker, wow).

    For active types (stuck, unclear) the client additionally calls
    POST /sessions/{id}/meta-question to stream KAIA's reaction.
    """
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is not None:
        raise HTTPException(status_code=409, detail="Session ist bereits beendet.")

    fb = await repo.save_feedback(
        session_id=session_id,
        user_id=user.id,
        feedback_type=FeedbackType(body.feedback_type),
        message_id=body.message_id,
    )
    return FeedbackResponse.model_validate(fb)


@router.post("/sessions/{session_id}/meta-question")
async def generate_meta_question(
    session_id: int,
    user: CurrentUser,
    feedback_type: str = Query(..., pattern="^(stuck|unclear)$"),
    db: AsyncSession = Depends(get_db),  # noqa: B008
    debug: bool = Query(default=False),
) -> StreamingResponse:
    """Stream KAIA's metacognitive reaction after a stuck/unclear signal (SSE).

    Called immediately after POST /feedback for active feedback types.
    """
    repo = ChatRepository(db)
    session = await repo.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden.")
    if session.ended_at is not None:
        raise HTTPException(status_code=409, detail="Session ist bereits beendet.")

    return StreamingResponse(
        stream_meta_question(db, session, feedback_type, debug=debug),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
