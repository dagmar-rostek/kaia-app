from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class CharacterMode(StrEnum):
    WARM = "warm"  # freundlich, wertschätzend, empathisch
    CHALLENGING = "challenging"  # provozierend, klar, herausfordernd
    WILD = "wild"  # unberechenbar, überraschend


class PromptTemplate(Base):
    """Versioned Jinja2 system prompt templates.

    Editable via admin without redeploy.
    Study-Lock: when STUDY_MODE=locked, no new versions can be saved.
    """

    __tablename__ = "prompt_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)  # e.g. "kaia_system_v1"
    character: Mapped[CharacterMode] = mapped_column(String(20))
    template: Mapped[str] = mapped_column(Text)  # Jinja2 template
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)  # one active per character
    version: Mapped[int] = mapped_column(default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)  # why this version?
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    created_by: Mapped[str | None] = mapped_column(String(50), nullable=True)  # "admin" or "dagmar"
