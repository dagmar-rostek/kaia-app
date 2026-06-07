from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class PreRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    reason: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name darf nicht leer sein")
        return v.strip()

    @field_validator("reason")
    @classmethod
    def reason_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Begründung darf nicht leer sein")
        return v.strip()


class PreRegisterResponse(BaseModel):
    ok: bool
    message: str


class StatsResponse(BaseModel):
    total: int
    remaining: int
    max: int


class PreRegistrationItem(BaseModel):
    id: str
    name: str
    email: str
    reason: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
