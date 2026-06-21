from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.survey.models import MeasurementType
from app.domains.survey.repository import SurveyRepository
from app.domains.survey.schemas import JourneyStateEnum, JourneyStateResponse

SUBSCALE_ITEMS: dict[str, list[int]] = {
    "self_efficacy": [5, 6, 12, 15, 20, 21, 29, 31],
    "intrinsic_goal": [1, 16, 22, 24],
    "elaboration": [53, 62, 64, 67, 69, 81],
    "metacognitive_sr": [33, 36, 41, 44, 54, 55, 56, 57, 61, 76, 78, 79],
}
REVERSE_ITEMS = {33, 57}


def compute_subscale_scores(items: dict[str, int]) -> dict[str, float]:
    scores: dict[str, float] = {}
    for subscale, item_nums in SUBSCALE_ITEMS.items():
        vals = []
        for num in item_nums:
            raw = items.get(str(num))
            if raw is not None:
                vals.append(8 - raw if num in REVERSE_ITEMS else raw)
        if vals:
            scores[subscale] = round(sum(vals) / len(vals), 3)
    return scores


async def get_journey_state(user_id: int, db: AsyncSession) -> JourneyStateResponse:
    repo = SurveyRepository(db)

    pre_mslq = await repo.get_mslq_result(user_id, MeasurementType.PRE)
    post_mslq = await repo.get_mslq_result(user_id, MeasurementType.POST)
    pre_gse = await repo.get_gse_result(user_id, MeasurementType.PRE)
    post_gse = await repo.get_gse_result(user_id, MeasurementType.POST)
    session_count = await repo.get_session_count(user_id)

    pre_done = pre_mslq is not None and pre_gse is not None
    post_done = post_mslq is not None and post_gse is not None

    if not pre_done:
        state = JourneyStateEnum.PRE_PENDING
    elif session_count < 10:
        state = JourneyStateEnum.ACTIVE
    elif not post_done:
        state = JourneyStateEnum.POST_PENDING
    else:
        state = JourneyStateEnum.COMPLETED

    pre_completed_at = None
    if pre_mslq and pre_gse:
        pre_completed_at = max(pre_mslq.created_at, pre_gse.created_at)

    post_completed_at = None
    if post_mslq and post_gse:
        post_completed_at = max(post_mslq.created_at, post_gse.created_at)

    return JourneyStateResponse(
        state=state,
        session_count=session_count,
        pre_mslq_done=pre_mslq is not None,
        pre_gse_done=pre_gse is not None,
        post_mslq_done=post_mslq is not None,
        post_gse_done=post_gse is not None,
        pre_completed_at=pre_completed_at,
        post_completed_at=post_completed_at,
    )
