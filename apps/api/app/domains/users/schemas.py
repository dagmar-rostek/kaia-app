from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field, StringConstraints

from app.domains.users.models import UserStatus

_Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]
_Username = Annotated[str, StringConstraints(min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")]


class RegisterRequest(BaseModel):
    email: EmailStr
    username: _Username
    password: _Password
    # Pflicht-Checkboxen (Literal[True] — False wird abgelehnt)
    consent_data: Literal[True]
    consent_analytics: bool = False
    consent_version: str = Field(default="1.0", max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    status: UserStatus
    onboarding_complete: bool
    ki_disclosure_seen_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserApprove(BaseModel):
    approved_by: str = Field(max_length=50)
