"""Tests for eval service — pure-logic functions that need no DB or LLM."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.domains.eval.schemas import HeatmapRead
from app.domains.eval.service import _score_to_pct, build_heatmap

# ── _score_to_pct ─────────────────────────────────────────────────────────────


def test_score_to_pct_none_returns_none() -> None:
    assert _score_to_pct(None) is None


def test_score_to_pct_zero() -> None:
    assert _score_to_pct(0.0) == 0.0


def test_score_to_pct_max() -> None:
    assert _score_to_pct(3.0) == 100.0


def test_score_to_pct_midpoint() -> None:
    assert abs(_score_to_pct(1.5) - 50.0) < 0.001  # type: ignore[arg-type]


# ── build_heatmap — empty run ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_build_heatmap_empty_run() -> None:
    run = MagicMock()
    run.id = "run_test_001"
    run.status = "completed"
    run.evaluator_model = "claude-haiku-4-5-20251001"
    run.config = {"kaia_chat_model": None}

    result_repo = AsyncMock()
    result_repo.get_aggregated_for_heatmap = AsyncMock(return_value=[])

    result = await build_heatmap(run, result_repo, {})

    assert isinstance(result, HeatmapRead)
    assert result.run_id == "run_test_001"
    assert result.personas == []
    assert result.system_avg_pct is None
    assert result.error_cell_count == 0
    assert result.weakest_persona_id is None


# ── build_session_detail ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_build_session_detail_returns_none_when_no_results() -> None:
    from app.domains.eval.service import build_session_detail

    result_repo = AsyncMock()
    result_repo.get_for_session = AsyncMock(return_value=[])
    transcript_repo = AsyncMock()

    result = await build_session_detail("run1", "P01", 1, result_repo, transcript_repo)

    assert result is None
    transcript_repo.get.assert_not_called()


@pytest.mark.asyncio
async def test_build_session_detail_with_scores() -> None:
    from app.domains.eval.service import build_session_detail

    eval_result = MagicMock()
    eval_result.id = 1
    eval_result.override_score = None
    eval_result.score = 2
    eval_result.metric_key = "m1_socratic_purity"
    eval_result.reasoning = "Gut"
    eval_result.flagged = False
    eval_result.crisis_triggered = None
    eval_result.override_reason = None
    eval_result.override_by = None
    eval_result.override_at = None

    from datetime import UTC, datetime

    transcript = MagicMock()
    transcript.id = 1
    transcript.persona_id = "P01"
    transcript.session_number = 1
    transcript.run_id = "run1"
    transcript.messages = []
    transcript.flagged_exchanges = []
    transcript.overall_finding = "Keine Auffälligkeiten"
    transcript.created_at = datetime.now(UTC)

    result_repo = AsyncMock()
    result_repo.get_for_session = AsyncMock(return_value=[eval_result])

    transcript_repo = AsyncMock()
    transcript_repo.get = AsyncMock(return_value=transcript)

    result = await build_session_detail("run1", "P01", 1, result_repo, transcript_repo)

    assert result is not None
    assert result.run_id == "run1"


@pytest.mark.asyncio
async def test_build_heatmap_single_cell() -> None:
    run = MagicMock()
    run.id = "run_test_002"
    run.status = "completed"
    run.evaluator_model = "claude-haiku-4-5-20251001"
    run.config = {"kaia_chat_model": "claude-haiku-4-5-20251001"}

    # (persona_id, session_number, avg_score, flagged_metrics, has_error)
    result_repo = AsyncMock()
    result_repo.get_aggregated_for_heatmap = AsyncMock(return_value=[("P01", 1, 2.0, [], False)])

    persona_meta = {"P01": {"learning_topic": "Mathe", "sabotage_pattern": "Schweigen"}}
    result = await build_heatmap(run, result_repo, persona_meta)

    assert len(result.personas) == 1
    assert result.personas[0].persona_id == "P01"
    assert result.personas[0].learning_topic == "Mathe"
    assert abs(result.personas[0].avg_score_pct - (2.0 / 3.0 * 100)) < 0.01  # type: ignore[operator]
    assert result.system_avg_pct is not None
