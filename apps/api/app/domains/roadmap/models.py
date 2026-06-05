from datetime import datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class GoalStatus(StrEnum):
    OPEN = "open"
    ACTIVE = "active"
    PAUSED = "paused"
    DONE = "done"


class VocabularyLevel(StrEnum):
    EINFACH = "einfach"
    FACHLICH = "fachlich"
    AKADEMISCH = "akademisch"


class ResponsePattern(StrEnum):
    KURZ = "kurz"
    MITTEL = "mittel"
    AUSFUEHRLICH = "ausführlich"


class SessionMood(StrEnum):
    POSITIV = "positiv"
    NEUTRAL = "neutral"
    FRUSTRIERT = "frustriert"


class RoadmapGoal(Base):
    """A personal learning goal on the user's Lernroadmap.

    Progress is user-owned — KAIA never sets progress_pct.
    (Steinert/Bandura: self-reported progress preserves self-efficacy attribution.)
    """

    __tablename__ = "roadmap_goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    title: Mapped[str] = mapped_column(String(200))
    domain: Mapped[str | None] = mapped_column(String(100), nullable=True)
    why: Mapped[str | None] = mapped_column(Text, nullable=True)  # personal motivation
    deadline: Mapped[datetime | None] = mapped_column(nullable=True)

    status: Mapped[GoalStatus] = mapped_column(String(10), default=GoalStatus.OPEN)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0)  # 0–100, user-set only

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    __table_args__ = (Index("ix_roadmap_goals_user_status", "user_id", "status"),)


class UserProfile(Base):
    """Growing personalisation profile — one row per user, updated after each session.

    Three layers (per AI Engineer design):
    - STABLE: baseline data set at registration / pre-measurement
    - DYNAMIC: updated session-by-session via post-session extraction (temperature=0)
    - SESSION-AGGREGATED: accumulates across sessions

    Never UPSERT — append-only via versioned rows is preferred for auditability.
    Current profile = row with highest updated_at per user_id.
    """

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # ── STABLE ────────────────────────────────────────────────────────────────
    gse_baseline: Mapped[float | None] = mapped_column(nullable=True)  # 1.0–4.0
    preferred_interaction: Mapped[str | None] = mapped_column(String(20), nullable=True)
    study_context: Mapped[str | None] = mapped_column(Text, nullable=True)  # user-supplied

    # ── DYNAMIC ───────────────────────────────────────────────────────────────
    strengths_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    friction_points_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    vocabulary_level: Mapped[VocabularyLevel | None] = mapped_column(String(20), nullable=True)
    response_pattern: Mapped[ResponsePattern | None] = mapped_column(String(20), nullable=True)
    last_session_mood: Mapped[SessionMood | None] = mapped_column(String(20), nullable=True)

    # ── SESSION-AGGREGATED ────────────────────────────────────────────────────
    topics_covered: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    open_questions: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    milestone_moments: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
