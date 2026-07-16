from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class UserStatus(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    status: Mapped[UserStatus] = mapped_column(String(20), default=UserStatus.PENDING)

    # Consent (DSGVO — Zeitpunkt ist Pflicht, nicht nur Boolean)
    consent_data: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_research_data: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_analytics: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_version: Mapped[str] = mapped_column(String(20), default="1.0")
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Onboarding
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    ki_disclosure_seen_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Admin-Approval
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Security
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_login_count: Mapped[int] = mapped_column(SmallInteger, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Learning topic (set at registration, immutable after first session)
    learning_topic: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # LLM-Modell-Zuweisung (null = globales System-Modell)
    kaia_model: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Simulation flag — marks test/research users, never real participants
    is_simulation: Mapped[bool] = mapped_column(Boolean, default=False)
    simulation_run: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Soft-Delete (DSGVO Art. 17)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deletion_reason: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # SHA-256 des Tokens — nie den Raw-Token speichern
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    # UUID-Familie für Reuse-Detection: gestohlener Token → ganze Familie revoked
    family: Mapped[str] = mapped_column(String(36))
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoke_reason: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

    __table_args__ = (
        # Häufigste Query: aktive Tokens eines Users
        Index("ix_refresh_tokens_user_active", "user_id", "revoked_at"),
    )


class UserLearningProfile(Base):
    """Persistent learner profile derived from pre-survey (MSLQ + GSE).

    Created exactly once per user after both pre-surveys are complete.
    NEVER updated automatically — it is an immutable baseline snapshot.
    Layer 1 of the two-layer profile model (immutable baseline).
    Layer 2 is the cumulative session_summary data in ChatSession.
    """

    __tablename__ = "user_learning_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    # Raw baseline data — preserved for thesis reproducibility
    gse_baseline: Mapped[float]
    gse_items: Mapped[dict[str, float]] = mapped_column(JSONB)  # all 10 GSE item scores
    subscale_scores: Mapped[dict[str, float]] = mapped_column(JSONB)  # MSLQ 4 subscales + raw items

    # LLM-generated interpretation — created once, stored, never regenerated
    profile_interpretation: Mapped[str] = mapped_column(Text)
    # Hash of the prompt template used — for reproducibility audit
    interpretation_prompt_hash: Mapped[str] = mapped_column(String(64), default="")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", name="uq_user_learning_profiles_user_id"),)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # SHA-256 des Raw-Tokens — nie den Raw-Token speichern
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
