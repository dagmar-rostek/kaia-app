import hashlib
import json

import httpx
import structlog
from anthropic import AsyncAnthropic
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.domains.survey.models import MeasurementType
from app.domains.survey.repository import SurveyRepository
from app.domains.survey.schemas import JourneyStateEnum, JourneyStateResponse

log = structlog.get_logger()

_PROFILE_MODEL = "claude-haiku-4-5-20251001"
_PROFILE_SYSTEM = (
    "Du bist ein Lernbegleitungs-Assistent fuer KAIA.\n"
    "Du erhaeltst MSLQ-Subskalen-Scores (Skala 1-7) und einen GSE-Gesamtscore (Skala 1-4).\n"
    "Schreibe einen knappen, professionellen Lernprofil-Text (max 120 Woerter) der beschreibt,\n"
    "wie KAIA diesen Lernenden begleiten sollte.\n"
    "VERBOTEN: Diagnosen, Prognosen, Werturteile, Zahlen nennen.\n"
    "ERLAUBT: Lernstil-Hinweise, Motivationsquellen, typische Herausforderungen.\n"
    "Antworte NUR mit dem Profiltext — kein Praeambel, kein Titel."
)

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


async def maybe_create_learning_profile(user_id: int) -> None:
    """Create UserLearningProfile once both pre-surveys are complete.

    Designed to run as a FastAPI BackgroundTask — creates its own DB session.
    Idempotent: the UNIQUE constraint on user_id catches race conditions.
    """
    from app.db.session import AsyncSessionLocal
    from app.domains.users.models import UserLearningProfile
    from app.domains.users.repository import UserProfileRepository

    async with AsyncSessionLocal() as db:
        profile_repo = UserProfileRepository(db)

        # Idempotency check — UNIQUE constraint is the real guard
        existing = await profile_repo.get_profile(user_id)
        if existing:
            return

        repo = SurveyRepository(db)
        pre_mslq = await repo.get_mslq_result(user_id, MeasurementType.PRE)
        pre_gse = await repo.get_gse_result(user_id, MeasurementType.PRE)
        if not (pre_mslq and pre_gse):
            return  # not yet complete

        # Build a compact score summary for the LLM
        subscale_scores = pre_mslq.subscale_scores or {}
        gse_score = float(pre_gse.total_score)
        prompt_input = (
            f"MSLQ-Subscores: {json.dumps(subscale_scores, ensure_ascii=False)}\n"
            f"GSE-Gesamtscore: {gse_score:.2f} (Skala 1-4)"
        )

        client = AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0),
        )
        try:
            response = await client.messages.create(
                model=_PROFILE_MODEL,
                max_tokens=200,
                system=_PROFILE_SYSTEM,
                messages=[{"role": "user", "content": prompt_input}],
            )
            from anthropic.types import TextBlock

            block = response.content[0]
            interpretation = block.text.strip() if isinstance(block, TextBlock) else ""
        except Exception as exc:
            log.error("profile_interpretation_failed", user_id=user_id, error=str(exc))
            interpretation = ""

        prompt_hash = hashlib.sha256(_PROFILE_SYSTEM.encode()).hexdigest()[:16]

        raw_items = pre_gse.items
        gse_items_raw: dict[str, float] = raw_items if isinstance(raw_items, dict) else {}
        profile = UserLearningProfile(
            user_id=user_id,
            gse_baseline=gse_score,
            gse_items=gse_items_raw,
            subscale_scores=pre_mslq.subscale_scores or {},
            profile_interpretation=interpretation,
            interpretation_prompt_hash=prompt_hash,
        )
        try:
            await profile_repo.create_profile(profile)
            log.info("learning_profile_created", user_id=user_id)
        except IntegrityError:
            # Race condition — another request already created it, that's fine
            log.info("learning_profile_already_exists", user_id=user_id)


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
