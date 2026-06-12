from datetime import datetime
from enum import StrEnum

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class FeedbackType(StrEnum):
    TRANSFER_MARKER = "transfer_marker"  # "Muss ich weiterdenken" — no LLM reaction
    WOW = "wow"  # "Wow — das trifft was" — no LLM reaction
    STUCK = "stuck"  # "Ich hänge gerade" — triggers meta question
    UNCLEAR = "unclear"  # "Das verstehe ich noch nicht" — triggers meta question


class InteractionMode(StrEnum):
    SOKRATISCH = "sokratisch"
    SCAFFOLDING = "scaffolding"
    BESTAERKEND = "bestärkend"
    HERAUSFORDERND = "herausfordernd"


class DetectedState(StrEnum):
    EXPLORATIV = "explorativ"
    ORIENTIERUNGSLOS = "orientierungslos"
    REFLEKTIEREND = "reflektierend"


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class ChunkType(StrEnum):
    INSIGHT = "insight"
    QUESTION = "question"
    MILESTONE = "milestone"


class ChatSession(Base):
    """One learning session between a user and KAIA."""

    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Character / prompt variant
    character: Mapped[str] = mapped_column(String(20), server_default="warm")

    # Didactic context (3-phase session script)
    daily_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    active_goal_id: Mapped[int | None] = mapped_column(
        ForeignKey("roadmap_goals.id", ondelete="SET NULL"), nullable=True
    )
    session_number: Mapped[int] = mapped_column(Integer, default=1)

    # Neuroadaptive state
    initial_mode: Mapped[InteractionMode] = mapped_column(
        String(20), default=InteractionMode.SOKRATISCH
    )
    final_mode: Mapped[InteractionMode | None] = mapped_column(String(20), nullable=True)

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Post-session extraction (written by the profiler service after session ends)
    session_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    messages: Mapped[list["Message"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Message.id"
    )

    __table_args__ = (Index("ix_chat_sessions_user_started", "user_id", "started_at"),)


class Message(Base):
    """A single message within a ChatSession."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[MessageRole] = mapped_column(String(10))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # KAIA metadata for assistant messages
    detected_state: Mapped[DetectedState | None] = mapped_column(String(20), nullable=True)
    interaction_mode: Mapped[InteractionMode | None] = mapped_column(String(20), nullable=True)
    thinking_raw: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped[ChatSession] = relationship(back_populates="messages")


class MemoryChunk(Base):
    """Semantic memory: vectorised conversation fragments for cross-session retrieval.

    Row-Level Security enforced at query level — user_id is always required.
    No cross-user leak: all queries must filter by user_id.
    """

    __tablename__ = "memory_chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))  # OpenAI/Mistral default
    chunk_type: Mapped[ChunkType] = mapped_column(String(20), default=ChunkType.INSIGHT)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    __table_args__ = (
        # IVFFLAT index for approximate nearest-neighbour search
        # Created separately after table population (requires data for clustering)
        Index("ix_memory_chunks_user", "user_id"),
    )


class SessionFeedback(Base):
    """EMA signal from the user during a session.

    Passive types (transfer_marker, wow) are stored only.
    Active types (stuck, unclear) additionally trigger a meta question from KAIA.
    """

    __tablename__ = "session_feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    message_id: Mapped[int | None] = mapped_column(
        ForeignKey("messages.id", ondelete="SET NULL"), nullable=True
    )
    feedback_type: Mapped[FeedbackType] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
