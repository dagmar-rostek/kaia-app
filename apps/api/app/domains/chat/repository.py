from datetime import UTC

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.chat.models import ChatSession, Message, MessageRole
from app.domains.users.models import User


class ChatRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Sessions ──────────────────────────────────────────────────────────────

    async def count_sessions(self, user_id: int) -> int:
        result = await self.db.execute(select(func.count()).where(ChatSession.user_id == user_id))
        return result.scalar_one()

    async def create_session(
        self,
        user_id: int,
        character: str,
        daily_plan: str | None = None,
        active_goal_id: int | None = None,
    ) -> ChatSession:
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

    async def list_sessions(self, user_id: int) -> list[ChatSession]:
        result = await self.db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.started_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())

    async def get_previous_session(self, user_id: int, before_id: int) -> ChatSession | None:
        """Return the most recent completed session before the given id."""
        result = await self.db.execute(
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                ChatSession.id < before_id,
                ChatSession.ended_at.is_not(None),
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

    # ── User context ──────────────────────────────────────────────────────────

    async def get_user(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
