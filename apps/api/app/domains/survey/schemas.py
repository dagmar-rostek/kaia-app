from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel

from app.domains.survey.models import MeasurementType


class JourneyStateEnum(StrEnum):
    PRE_PENDING = "pre_pending"
    ACTIVE = "active"
    POST_PENDING = "post_pending"
    COMPLETED = "completed"


class MslqSubmit(BaseModel):
    measurement_type: MeasurementType
    items: dict[str, int]  # {str(item_number): raw_score 1–7}


class MslqRead(BaseModel):
    id: int
    user_id: int
    measurement_type: MeasurementType
    items: dict[str, Any]
    subscale_scores: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class GseSubmit(BaseModel):
    measurement_type: MeasurementType
    items: list[int]  # 10 items, 1–4 each


class GseRead(BaseModel):
    id: int
    measurement_type: MeasurementType
    total_score: float
    created_at: datetime

    model_config = {"from_attributes": True}


class JourneyStateResponse(BaseModel):
    state: JourneyStateEnum
    session_count: int
    pre_mslq_done: bool
    pre_gse_done: bool
    post_mslq_done: bool
    post_gse_done: bool
    pre_completed_at: datetime | None = None
    post_completed_at: datetime | None = None
