from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.chat.models import ChatSession, FeedbackType, Message, MessageRole, SessionFeedback
from app.domains.users.models import User


class ChatRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Sessions ──────────────────────────────────────────────────────────────

    async def count_sessions(self, user_id: int) -> int:
        # Count only sessions that contain at least one message — orphaned empty sessions
        # (created by resetSession without messages) must not inflate the session number.
        result = await self.db.execute(
            select(func.count()).where(ChatSession.user_id == user_id, ChatSession.messages.any())
        )
        return result.scalar_one()

    async def _close_orphaned_empty_sessions(self, user_id: int) -> None:
        """Close open sessions with no messages — created by resetSession without /end call.

        Safety net: frontend already calls /end on reset, but this catches any
        orphaned ghosts that slipped through (e.g. browser crash, old clients).
        Without this, count_sessions would inflate and get_active_session would
        resume a ghost instead of opening a fresh session.
        """
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id, ChatSession.ended_at.is_(None))
            .options(selectinload(ChatSession.messages))
        )
        orphans = result.scalars().all()
        now = datetime.now(UTC)
        for session in orphans:
            if not session.messages:
                session.ended_at = now
        if any(not s.messages for s in orphans):
            await self.db.commit()

    async def create_session(
        self,
        user_id: int,
        character: str,
        daily_plan: str | None = None,
        active_goal_id: int | None = None,
    ) -> ChatSession:
        await self._close_orphaned_empty_sessions(user_id)
        session_number = await self.count_sessions(user_id) + 1
        session = ChatSession(
            user_id=user_id,
            character=character,
            session_number=session_number,
            daily_plan=daily_plan,
            active_goal_id=active_goal_id,
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_session(self, session_id: int, user_id: int) -> ChatSession | None:
        """Load session with messages — enforces user ownership."""
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .options(selectinload(ChatSession.messages))
        )
        return result.scalar_one_or_none()

    async def get_active_session(self, user_id: int) -> ChatSession | None:
        """Return the most recent non-ended session with messages, or None.

        Used by the frontend on page load to resume a session the user left open
        (e.g. closed the browser tab mid-session without clicking 'Session beenden').
        """
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id, ChatSession.ended_at.is_(None))
            .options(selectinload(ChatSession.messages))
            .order_by(ChatSession.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def list_sessions(self, user_id: int) -> list[ChatSession]:
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.started_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())

    async def get_previous_session(self, user_id: int, before_id: int) -> ChatSession | None:
        """Return the most recent session before the given id (ended or not).

        Ended_at is NOT required — if the user closed the tab without clicking
        "Session beenden" the session still exists and should contribute context.
        The caller is responsible for ensuring a summary is extracted if missing.
        """
        result = await self.db.execute(
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                ChatSession.id < before_id,
            )
            .order_by(ChatSession.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def end_session(self, session: ChatSession) -> None:
        from datetime import datetime

        session.ended_at = datetime.now(UTC)
        await self.db.commit()

    # ── Messages ──────────────────────────────────────────────────────────────

    async def save_message(
        self,
        session_id: int,
        role: MessageRole,
        content: str,
        detected_state: str | None = None,
        interaction_mode: str | None = None,
        thinking_raw: str | None = None,
    ) -> Message:
        msg = Message(
            session_id=session_id,
            role=role,
            content=content,
            detected_state=detected_state,
            interaction_mode=interaction_mode,
            thinking_raw=thinking_raw,
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def get_messages(self, session_id: int) -> list[Message]:
        result = await self.db.execute(
            select(Message).where(Message.session_id == session_id).order_by(Message.id)
        )
        return list(result.scalars().all())

    # ── Feedback ──────────────────────────────────────────────────────────────

    async def save_feedback(
        self,
        session_id: int,
        user_id: int,
        feedback_type: FeedbackType,
        message_id: int | None = None,
    ) -> SessionFeedback:
        fb = SessionFeedback(
            session_id=session_id,
            user_id=user_id,
            feedback_type=feedback_type,
            message_id=message_id,
        )
        self.db.add(fb)
        await self.db.commit()
        await self.db.refresh(fb)
        return fb

    async def delete_user_data(self, user_id: int) -> None:
        """Delete all sessions and memory for a user (admin reset only)."""
        from sqlalchemy import delete as sql_delete

        from app.domains.chat.models import MemoryChunk

        await self.db.execute(sql_delete(MemoryChunk).where(MemoryChunk.user_id == user_id))
        await self.db.execute(sql_delete(ChatSession).where(ChatSession.user_id == user_id))
        await self.db.commit()

    # ── User context ──────────────────────────────────────────────────────────

    async def get_user(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
