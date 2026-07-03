from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field, StringConstraints

from app.domains.users.models import UserStatus

_Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]
_Username = Annotated[
    str, StringConstraints(min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
]


class RegisterRequest(BaseModel):
    email: EmailStr
    username: _Username
    password: _Password
    # Pflicht-Checkboxen (Literal[True] — False wird abgelehnt)
    consent_data: Literal[True]
    consent_research_data: Literal[True]  # Art. 9 DSGVO — psychologische Selbsteinschätzungsdaten
    consent_analytics: bool = False
    consent_version: str = Field(default="1.0", max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"  # noqa: S105


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    status: UserStatus
    onboarding_complete: bool
    ki_disclosure_seen_at: datetime | None
    learning_topic: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TopicUpdate(BaseModel):
    learning_topic: str = Field(max_length=500)


class UserApprove(BaseModel):
    approved_by: str = Field(default="admin", max_length=50)


class UserReject(BaseModel):
    reason: str = Field(default="rejected_by_admin", max_length=200)


class UserAdminRead(BaseModel):
    id: int
    email: str
    username: str
    status: UserStatus
    consent_analytics: bool
    ki_disclosure_seen_at: datetime | None
    approved_at: datetime | None
    approved_by: str | None
    last_login_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserExport(BaseModel):
    """DSGVO Art. 20 — Datenportabilität."""

    id: int
    email: str
    username: str
    status: UserStatus
    consent_data: bool
    consent_research_data: bool
    consent_analytics: bool
    consent_version: str
    consent_at: datetime | None
    onboarding_complete: bool
    ki_disclosure_seen_at: datetime | None
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeleteRequest(BaseModel):
    """DSGVO Art. 17 — Recht auf Löschung."""

    reason: str = Field(default="user_request", max_length=100)


class ConsentUpdate(BaseModel):
    """DSGVO Art. 7 (3) — Widerruf ist jederzeit möglich."""

    consent_analytics: bool
