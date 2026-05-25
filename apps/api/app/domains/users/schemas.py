from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.domains.users.models import UserStatus


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    status: UserStatus
    onboarding_complete: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserApprove(BaseModel):
    approved_by: int
