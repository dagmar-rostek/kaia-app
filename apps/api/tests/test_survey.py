"""Tests for survey domain: compute_subscale_scores (pure) + get_journey_state (mocked)."""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.survey.service import SUBSCALE_ITEMS, compute_subscale_scores, get_journey_state

_REPO = "app.domains.survey.service.SurveyRepository"
_MSLQ = f"{_REPO}.get_mslq_result"
_GSE = f"{_REPO}.get_gse_result"
_CNT = f"{_REPO}.get_session_count"


# ── helpers ───────────────────────────────────────────────────────────────────


def _full_items(value: int = 4) -> dict[str, int]:
    all_nums = {num for nums in SUBSCALE_ITEMS.values() for num in nums}
    return {str(n): value for n in all_nums}


def _make_result(created_at: datetime | None = None) -> MagicMock:
    obj = MagicMock()
    obj.created_at = created_at or datetime(2026, 1, 1, tzinfo=UTC)
    return obj


@pytest.fixture
def mock_db() -> AsyncMock:
    return AsyncMock()


# ── compute_subscale_scores ───────────────────────────────────────────────────


def test_compute_scores_returns_all_subscales() -> None:
    scores = compute_subscale_scores(_full_items(4))
    assert set(scores.keys()) == set(SUBSCALE_ITEMS.keys())


def test_compute_scores_midpoint_all_fours() -> None:
    scores = compute_subscale_scores(_full_items(4))
    for key, val in scores.items():
        assert val == pytest.approx(4.0), f"{key} should be 4.0"


def test_compute_scores_reverse_items_applied() -> None:
    # Raw=1 on reverse items (33, 57) → becomes 7; non-reverse stay 1 → metacognitive_sr > 1
    scores = compute_subscale_scores(_full_items(1))
    assert scores["metacognitive_sr"] > 1.0


def test_compute_scores_missing_items_skipped() -> None:
    assert compute_subscale_scores({}) == {}


def test_compute_scores_partial_items() -> None:
    items = {str(n): 5 for n in SUBSCALE_ITEMS["self_efficacy"]}
    scores = compute_subscale_scores(items)
    assert scores.get("self_efficacy") == pytest.approx(5.0)
    assert "kdg" not in scores


def test_compute_scores_rounds_to_three_decimals() -> None:
    items = {str(n): 3 for n in SUBSCALE_ITEMS["kdg"]}
    items[str(SUBSCALE_ITEMS["kdg"][0])] = 4
    scores = compute_subscale_scores(items)
    assert "kdg" in scores
    assert len(str(scores["kdg"]).split(".")[-1]) <= 3


# ── get_journey_state ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_journey_state_pre_pending(mock_db: AsyncMock) -> None:
    with (
        patch(_MSLQ, new_callable=AsyncMock, return_value=None),
        patch(_GSE, new_callable=AsyncMock, return_value=None),
        patch(_CNT, new_callable=AsyncMock, return_value=0),
    ):
        result = await get_journey_state(1, mock_db)
    assert result.state.value == "pre_pending"
    assert result.pre_mslq_done is False
    assert result.pre_gse_done is False


@pytest.mark.asyncio
async def test_journey_state_active_after_pre_survey(mock_db: AsyncMock) -> None:
    obj = _make_result()
    with (
        patch(_MSLQ, new_callable=AsyncMock, return_value=obj),
        patch(_GSE, new_callable=AsyncMock, return_value=obj),
        patch(_CNT, new_callable=AsyncMock, return_value=3),
    ):
        result = await get_journey_state(1, mock_db)
    assert result.state.value == "active"
    assert result.pre_mslq_done is True
    assert result.session_count == 3


@pytest.mark.asyncio
async def test_journey_state_post_pending_after_10_sessions(mock_db: AsyncMock) -> None:
    obj = _make_result()
    # PRE surveys exist, POST surveys don't → post_pending
    with (
        patch(_MSLQ, new_callable=AsyncMock, side_effect=[obj, None]),
        patch(_GSE, new_callable=AsyncMock, side_effect=[obj, None]),
        patch(_CNT, new_callable=AsyncMock, return_value=10),
    ):
        result = await get_journey_state(1, mock_db)
    assert result.state.value == "post_pending"
    assert result.pre_mslq_done is True
    assert result.post_mslq_done is False


@pytest.mark.asyncio
async def test_journey_state_completed(mock_db: AsyncMock) -> None:
    t1 = datetime(2026, 2, 1, tzinfo=UTC)
    t2 = datetime(2026, 2, 2, tzinfo=UTC)
    pre_mslq = _make_result(t1)
    post_mslq = _make_result(t1)
    pre_gse = _make_result(t2)
    post_gse = _make_result(t2)
    with (
        patch(_MSLQ, new_callable=AsyncMock, side_effect=[pre_mslq, post_mslq]),
        patch(_GSE, new_callable=AsyncMock, side_effect=[pre_gse, post_gse]),
        patch(_CNT, new_callable=AsyncMock, return_value=10),
    ):
        result = await get_journey_state(1, mock_db)
    assert result.state.value == "completed"
    assert result.pre_completed_at == t2  # max(t1, t2)
    assert result.post_completed_at == t2
