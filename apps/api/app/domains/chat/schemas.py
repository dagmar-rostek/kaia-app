from datetime import datetime

from pydantic import BaseModel, field_validator

# ── Session ───────────────────────────────────────────────────────────────────


class SessionCreate(BaseModel):
    character: str = "warm"  # warm | challenging | wild
    daily_plan: str | None = None
    active_goal_id: int | None = None

    @field_validator("character")
    @classmethod
    def character_valid(cls, v: str) -> str:
        if v not in {"warm", "challenging", "wild"}:
            raise ValueError("character must be warm, challenging, or wild")
        return v


class SessionResponse(BaseModel):
    id: int
    session_number: int
    character: str
    started_at: datetime
    ended_at: datetime | None

    model_config = {"from_attributes": True}


class SessionWithMessages(SessionResponse):
    messages: list["MessageResponse"]


# ── Message ───────────────────────────────────────────────────────────────────


class MessageCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nachricht darf nicht leer sein.")
        if len(v) > 4000:
            raise ValueError("Nachricht ist zu lang (max. 4000 Zeichen).")
        return v


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    detected_state: str | None
    interaction_mode: str | None

    model_config = {"from_attributes": True}


# ── Session Feedback ──────────────────────────────────────────────────────────


class FeedbackCreate(BaseModel):
    feedback_type: str
    message_id: int | None = None

    @field_validator("feedback_type")
    @classmethod
    def feedback_type_valid(cls, v: str) -> str:
        valid = {"transfer_marker", "wow", "stuck", "unclear"}
        if v not in valid:
            raise ValueError(f"feedback_type must be one of {valid}")
        return v


class FeedbackResponse(BaseModel):
    id: int
    feedback_type: str
    message_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Session Report ────────────────────────────────────────────────────────────


class SessionReport(BaseModel):
    reason: str | None = None


# Update forward ref
SessionWithMessages.model_rebuild()
