import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PreRegistration(Base):
    __tablename__ = "preregistrations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    reason: Mapped[str] = mapped_column(String(500))
    unsubscribe_token: Mapped[str] = mapped_column(
        String(36), unique=True, default=lambda: str(uuid.uuid4()), index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | removed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
