from datetime import datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class MeasurementType(StrEnum):
    PRE = "pre"
    POST = "post"


class ConsentEvent(StrEnum):
    REGISTER = "register"
    KI_DISCLOSURE = "ki_disclosure"
    ANALYTICS_OPT_IN = "analytics_opt_in"
    ANALYTICS_OPT_OUT = "analytics_opt_out"
    DATA_EXPORT = "data_export"
    ACCOUNT_DELETE = "account_delete"
    CONSENT_UPDATE = "consent_update"


class GseResult(Base):
    """GSE measurement result (Schwarzer & Jerusalem, 1995).

    Stores pre- and post-measurements. Items are stored as JSON array
    of 10 integers (1–4 per item). total_score is the sum / 10.

    DSGVO: Qualifies as psychological data (Art. 9) — explicit consent required.
    """

    __tablename__ = "gse_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    measurement_type: Mapped[MeasurementType] = mapped_column(String(10))

    # 10 item scores (1–4 Likert), stored as [score1, score2, ..., score10]
    items: Mapped[list[Any]] = mapped_column(JSONB)
    total_score: Mapped[float]  # sum of items / 10 = mean (1.0–4.0)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    __table_args__ = (Index("ix_gse_results_user_type", "user_id", "measurement_type"),)


class ConsentLog(Base):
    """Immutable audit log of all consent-related events.

    DSGVO Art. 7 (2): Consent must be demonstrable.
    Each event is appended — never updated or deleted.
    """

    __tablename__ = "consent_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_type: Mapped[ConsentEvent] = mapped_column(String(30))
    timestamp: Mapped[datetime] = mapped_column(server_default=func.now())
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    # Optional metadata (e.g. consent_version, browser fingerprint for audit)
    meta: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)


class MslqResult(Base):
    """MSLQ measurement result (Pintrich et al., 1991/1993).

    5 subscales, 34 items, 7-point Likert. Items stored as JSONB
    {str(item_number): raw_score}. Subscale scores are server-computed means.

    DSGVO: Qualifies as psychological data (Art. 9) — explicit consent required.
    """

    __tablename__ = "mslq_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    measurement_type: Mapped[MeasurementType] = mapped_column(String(10))

    # {str(item_number): raw_score (1–7)} — 34 items
    items: Mapped[dict[str, Any]] = mapped_column(JSONB)

    # Server-computed: {subscale_key: mean_score} — 5 subscales
    subscale_scores: Mapped[dict[str, Any]] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    __table_args__ = (Index("ix_mslq_results_user_type", "user_id", "measurement_type"),)
