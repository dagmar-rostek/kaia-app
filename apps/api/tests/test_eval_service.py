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

    result_repo = AsyncMock()
    result_repo.get_aggregated_for_heatmap = AsyncMock(return_value=[])

    result = await build_heatmap(run, result_repo, {})

    assert isinstance(result, HeatmapRead)
    assert result.run_id == "run_test_001"
    assert result.personas == []
    assert result.system_avg_pct is None
    assert result.error_cell_count == 0
    assert result.weakest_persona_id is None


@pytest.mark.asyncio
async def test_build_heatmap_single_cell() -> None:
    run = MagicMock()
    run.id = "run_test_002"
    run.status = "completed"
    run.evaluator_model = "claude-haiku-4-5-20251001"

    # (persona_id, session_number, avg_score, has_flags, has_error)
    result_repo = AsyncMock()
    result_repo.get_aggregated_for_heatmap = AsyncMock(return_value=[("P01", 1, 2.0, False, False)])

    persona_meta = {"P01": {"learning_topic": "Mathe", "sabotage_pattern": "Schweigen"}}
    result = await build_heatmap(run, result_repo, persona_meta)

    assert len(result.personas) == 1
    assert result.personas[0].persona_id == "P01"
    assert result.personas[0].learning_topic == "Mathe"
    assert abs(result.personas[0].avg_score_pct - (2.0 / 3.0 * 100)) < 0.01  # type: ignore[operator]
    assert result.system_avg_pct is not None
