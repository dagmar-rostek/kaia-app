from typing import Literal

from pydantic import BaseModel, Field, field_validator


class TopicEvalRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Thema darf nicht leer sein")
        return stripped


class TopicEvalResponse(BaseModel):
    fits_gap: bool
    confidence: Literal["high", "medium", "low"]
    feedback: str
    suggestion: str | None = None
    category: Literal["knowing_doing", "knowledge_acquisition", "unclear"]
