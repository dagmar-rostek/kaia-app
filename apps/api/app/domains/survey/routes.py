from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser
from app.db.session import get_db
from app.domains.chat.repository import ChatRepository
from app.domains.survey.models import GseResult, MslqResult
from app.domains.survey.repository import SurveyRepository
from app.domains.survey.schemas import (
    GseRead,
    GseSubmit,
    JourneyStateResponse,
    MslqRead,
    MslqSubmit,
)
from app.domains.survey.service import compute_subscale_scores, get_journey_state

router = APIRouter(prefix="/survey", tags=["survey"])


@router.get("/journey", response_model=JourneyStateResponse)
async def get_journey(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> JourneyStateResponse:
    return await get_journey_state(user.id, db)


@router.post("/mslq", response_model=MslqRead, status_code=status.HTTP_201_CREATED)
async def submit_mslq(
    body: MslqSubmit,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> MslqRead:
    repo = SurveyRepository(db)

    existing = await repo.get_mslq_result(user.id, body.measurement_type)
    if existing:
        return MslqRead.model_validate(existing)

    if len(body.items) < 30:
        raise HTTPException(status_code=422, detail="30 MSLQ-Items erforderlich.")

    subscale_scores = compute_subscale_scores(body.items)
    result = await repo.create_mslq_result(
        user_id=user.id,
        measurement_type=body.measurement_type,
        items=body.items,
        subscale_scores=subscale_scores,
    )
    return MslqRead.model_validate(result)


@router.delete("/journey/reset", status_code=204)
async def reset_journey(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> None:
    """Dev/Admin: Reset journey state — deletes all surveys and chat sessions for current user."""
    await db.execute(delete(MslqResult).where(MslqResult.user_id == user.id))
    await db.execute(delete(GseResult).where(GseResult.user_id == user.id))
    await db.commit()
    await ChatRepository(db).delete_user_data(user.id)


@router.post("/gse", response_model=GseRead, status_code=status.HTTP_201_CREATED)
async def submit_gse(
    body: GseSubmit,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),  # noqa: B008
) -> GseRead:
    repo = SurveyRepository(db)

    existing = await repo.get_gse_result(user.id, body.measurement_type)
    if existing:
        return GseRead.model_validate(existing)

    if len(body.items) != 10:
        raise HTTPException(status_code=422, detail="10 GSE-Items erforderlich.")

    result = await repo.create_gse_result(
        user_id=user.id,
        measurement_type=body.measurement_type,
        items=body.items,
    )
    return GseRead.model_validate(result)
