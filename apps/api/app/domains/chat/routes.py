from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.chat.repository import ChatRepository
from app.domains.chat.schemas import (
    MessageCreate,
    SessionCreate,
    SessionResponse,
    SessionWithMessages,
)
from app.domains.chat.service import extract_session_summary, stream_opening, stream_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    body: SessionCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> SessionResponse:
    repo = ChatRepository(db)
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
