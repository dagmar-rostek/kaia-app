"""Tests for the admin export module — CSV helpers, HTML builder, endpoints.

Covers:
  - Pure functions: _fmt, _delta, _h, _fmt_score, _rows_to_csv
  - CSV_HEADERS column count
  - _build_report_html with full + empty data
  - _get_user_or_404 (404 cases)
  - Endpoint smoke tests with mocked DB helpers
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api.v1.export import (
    _SUBSCALE_KEYS,
    CSV_HEADERS,
    _build_report_html,
    _delta,
    _fmt,
    _fmt_score,
    _h,
    _rows_to_csv,
)
from app.domains.users.models import UserStatus
from tests.factories import make_user

# ── Pure helpers ──────────────────────────────────────────────────────────────


def test_fmt_none_is_empty() -> None:
    assert _fmt(None) == ""


def test_fmt_float_rounds_to_3() -> None:
    assert _fmt(1.23456) == "1.235"


def test_fmt_string_passthrough() -> None:
    assert _fmt("hello") == "hello"


def test_fmt_int_passthrough() -> None:
    assert _fmt(42) == "42"


def test_delta_both_present() -> None:
    assert _delta(10.0, 12.0) == "2.000"


def test_delta_negative() -> None:
    result = float(_delta(12.0, 10.0))
    assert result == pytest.approx(-2.0)


def test_delta_pre_none() -> None:
    assert _delta(None, 12.0) == ""


def test_delta_post_none() -> None:
    assert _delta(10.0, None) == ""


def test_delta_both_none() -> None:
    assert _delta(None, None) == ""


def test_h_escapes_ampersand() -> None:
    assert _h("Alice & Bob") == "Alice &amp; Bob"


def test_h_escapes_lt_gt() -> None:
    assert _h("<script>") == "&lt;script&gt;"


def test_h_plain_string() -> None:
    assert _h("hello") == "hello"


def test_fmt_score_none_is_dash() -> None:
    assert _fmt_score(None) == "—"


def test_fmt_score_float_two_dec() -> None:
    assert _fmt_score(3.5) == "3.50"


# ── CSV_HEADERS ───────────────────────────────────────────────────────────────


def test_csv_headers_count() -> None:
    # 10 fixed + 20 GSE items + 15 MSLQ (5 subscales × 3) = 45 - but some fixed ones add up
    # Exact count: participant_id, display_name, learning_topic, consent_analytics,
    #              registered_at, first_session_at, last_session_at, study_duration_days,
    #              sessions_completed, total_messages = 10
    #              gse_pre_total, gse_post_total, gse_delta = 3
    #              gse_pre_item_01..10 = 10
    #              gse_post_item_01..10 = 10
    #              mslq subscales (5 × 3) = 15
    # Total: 10 + 3 + 10 + 10 + 15 = 48
    assert len(CSV_HEADERS) > 30
    assert "participant_id" in CSV_HEADERS
    assert "gse_pre_item_01" in CSV_HEADERS
    assert "gse_post_item_10" in CSV_HEADERS
    assert "mslq_delta_self_efficacy" in CSV_HEADERS
    assert "mslq_delta_control_of_learning" in CSV_HEADERS


def test_subscale_keys_count() -> None:
    assert len(_SUBSCALE_KEYS) == 5


# ── _rows_to_csv ──────────────────────────────────────────────────────────────


def test_rows_to_csv_empty_returns_header() -> None:
    csv_text = _rows_to_csv([])
    lines = csv_text.strip().splitlines()
    assert len(lines) == 1
    assert "participant_id" in lines[0]


def test_rows_to_csv_single_row() -> None:
    row = {h: f"val_{h}" for h in CSV_HEADERS}
    csv_text = _rows_to_csv([row])
    lines = csv_text.strip().splitlines()
    assert len(lines) == 2
    assert "val_participant_id" in lines[1]


def test_rows_to_csv_multiple_rows() -> None:
    rows = [{h: f"r{i}_{h}" for h in CSV_HEADERS} for i in range(3)]
    csv_text = _rows_to_csv(rows)
    lines = csv_text.strip().splitlines()
    assert len(lines) == 4  # header + 3 rows


# ── _build_report_html ────────────────────────────────────────────────────────


def _make_gse(total: float, items: list[float]) -> MagicMock:
    obj = MagicMock()
    obj.total_score = total
    obj.items = items
    obj.created_at = datetime(2026, 1, 15, tzinfo=UTC)
    return obj


def _make_mslq(subscales: dict) -> MagicMock:
    obj = MagicMock()
    obj.subscale_scores = subscales
    obj.created_at = datetime(2026, 1, 20, tzinfo=UTC)
    return obj


def test_build_report_html_with_full_data() -> None:
    user = make_user(pk=1)
    pre_gse = _make_gse(32.0, [3.0] * 10)
    post_gse = _make_gse(35.0, [3.5] * 10)
    pre_mslq = _make_mslq(
        {
            "self_efficacy": 4.0,
            "kdg": 3.0,
            "elaboration": 3.5,
            "metacognitive_sr": 4.5,
            "control_of_learning": 3.2,
        }
    )
    post_mslq = _make_mslq(
        {
            "self_efficacy": 4.5,
            "kdg": 3.2,
            "elaboration": 3.8,
            "metacognitive_sr": 4.8,
            "control_of_learning": 3.5,
        }
    )

    sessions = [
        {
            "session_number": 1,
            "started_at": datetime(2026, 2, 1, tzinfo=UTC),
            "messages": [
                {"role": "user", "content": "Hallo KAIA"},
                {"role": "assistant", "content": "Was beschäftigt dich?"},
            ],
        }
    ]

    html = _build_report_html(user, pre_gse, post_gse, pre_mslq, post_mslq, sessions)

    assert "<!DOCTYPE html>" in html
    assert "KAIA Abschlussbericht" in html
    assert "testuser" in html
    assert "Session 1" in html
    assert "Hallo KAIA" in html
    assert "Gesamtscore" in html
    assert "Selbstwirksamkeit" in html


def test_build_report_html_all_none() -> None:
    user = make_user(pk=2)
    html = _build_report_html(user, None, None, None, None, [])
    assert "<!DOCTYPE html>" in html
    assert "—" in html  # fallback for missing scores
    assert "Keine Transkripte vorhanden" in html


def test_build_report_html_gse_delta_shown() -> None:
    user = make_user(pk=3)
    pre_gse = _make_gse(30.0, [3.0] * 10)
    post_gse = _make_gse(35.0, [3.5] * 10)
    html = _build_report_html(user, pre_gse, post_gse, None, None, [])
    assert "+5" in html or "+5.000" in html  # positive delta visible


def test_build_report_html_escapes_xss() -> None:
    user = make_user(pk=4, username="<script>alert(1)</script>")
    html = _build_report_html(user, None, None, None, None, [])
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


# ── _get_user_or_404 ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_user_or_404_not_found() -> None:
    from fastapi import HTTPException

    from app.api.v1.export import _get_user_or_404

    db = AsyncMock()
    with patch("app.api.v1.export.UserRepository") as mock_cls:
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=None)
        mock_cls.return_value = mock_repo

        with pytest.raises(HTTPException) as exc:
            await _get_user_or_404(99, db)
        assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_user_or_404_deleted_raises() -> None:
    from fastapi import HTTPException

    from app.api.v1.export import _get_user_or_404

    db = AsyncMock()
    deleted_user = make_user(pk=5, status=UserStatus.DELETED)
    with patch("app.api.v1.export.UserRepository") as mock_cls:
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=deleted_user)
        mock_cls.return_value = mock_repo

        with pytest.raises(HTTPException) as exc:
            await _get_user_or_404(5, db)
        assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_user_or_404_active_returns_user() -> None:
    from app.api.v1.export import _get_user_or_404

    db = AsyncMock()
    user = make_user(pk=7)
    with patch("app.api.v1.export.UserRepository") as mock_cls:
        mock_repo = AsyncMock()
        mock_repo.get_by_id = AsyncMock(return_value=user)
        mock_cls.return_value = mock_repo

        result = await _get_user_or_404(7, db)
    assert result.id == 7


# ── Endpoint: get_participants_summary ────────────────────────────────────────


@pytest.mark.asyncio
async def test_participants_summary_empty() -> None:
    from app.api.v1.export import get_participants_summary

    db = AsyncMock()
    with patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[])):
        result = await get_participants_summary(db)

    assert result.count == 0
    assert result.avg_gse_delta is None
    assert result.participants == []


@pytest.mark.asyncio
async def test_participants_summary_with_one_user() -> None:
    from app.api.v1.export import get_participants_summary

    user = make_user(pk=10)
    db = AsyncMock()

    pre_gse = _make_gse(30.0, [3.0] * 10)
    post_gse = _make_gse(35.0, [3.5] * 10)

    with (
        patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[user])),
        patch("app.api.v1.export._get_gse", new=AsyncMock(side_effect=[pre_gse, post_gse])),
        patch("app.api.v1.export._get_mslq", new=AsyncMock(return_value=_make_mslq({}))),
        patch(
            "app.api.v1.export._get_chat_stats",
            new=AsyncMock(
                return_value={
                    "sessions_completed": 3,
                    "first_session_at": None,
                    "last_session_at": None,
                    "total_messages": 12,
                }
            ),
        ),
    ):
        result = await get_participants_summary(db)

    assert result.count == 1
    assert result.participants[0].participant_id == "P01"
    assert result.avg_gse_delta == pytest.approx(5.0)


# ── Endpoint: export_all_participants_csv ─────────────────────────────────────


@pytest.mark.asyncio
async def test_export_all_csv_empty_returns_header_only() -> None:
    from app.api.v1.export import export_all_participants_csv

    db = AsyncMock()
    with patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[])):
        response = await export_all_participants_csv(db)

    assert response.media_type == "text/csv"
    body = response.body.decode()
    lines = body.strip().splitlines()
    assert len(lines) == 1  # header only
    assert "participant_id" in lines[0]


@pytest.mark.asyncio
async def test_export_all_csv_one_participant() -> None:
    from app.api.v1.export import export_all_participants_csv

    user = make_user(pk=11)
    row = {h: "x" for h in CSV_HEADERS}
    row["participant_id"] = "P01"
    row["display_name"] = "Max"

    db = AsyncMock()
    with (
        patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[user])),
        patch("app.api.v1.export._build_row", new=AsyncMock(return_value=row)),
    ):
        response = await export_all_participants_csv(db)

    body = response.body.decode()
    assert "P01" in body
    assert "Max" in body


# ── Endpoint: export_user_csv ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_export_user_csv_not_in_study_pid() -> None:
    from app.api.v1.export import export_user_csv

    user = make_user(pk=20)
    row = {h: "" for h in CSV_HEADERS}
    row["participant_id"] = "P??"

    db = AsyncMock()
    with (
        patch("app.api.v1.export._get_user_or_404", new=AsyncMock(return_value=user)),
        patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[])),
        patch("app.api.v1.export._build_row", new=AsyncMock(return_value=row)),
    ):
        response = await export_user_csv(20, db)

    assert response.media_type == "text/csv"
    body = response.body.decode()
    assert "P??" in body


@pytest.mark.asyncio
async def test_export_user_csv_in_study() -> None:
    from app.api.v1.export import export_user_csv

    user = make_user(pk=21)
    other = make_user(pk=22)
    row = {h: "" for h in CSV_HEADERS}
    row["participant_id"] = "P01"

    db = AsyncMock()
    with (
        patch("app.api.v1.export._get_user_or_404", new=AsyncMock(return_value=user)),
        patch("app.api.v1.export._get_completed_users", new=AsyncMock(return_value=[user, other])),
        patch("app.api.v1.export._build_row", new=AsyncMock(return_value=row)),
    ):
        response = await export_user_csv(21, db)

    assert "P01" in response.body.decode()


# ── Endpoint: export_user_pdf (HTML fallback) ─────────────────────────────────


@pytest.mark.asyncio
async def test_export_user_pdf_returns_html_or_pdf() -> None:
    import sys

    from app.api.v1.export import export_user_pdf

    user = make_user(pk=30)
    pre_gse = _make_gse(30.0, [3.0] * 10)
    post_gse = _make_gse(35.0, [3.5] * 10)
    mslq = _make_mslq(
        {
            "self_efficacy": 4.0,
            "kdg": 3.0,
            "elaboration": 3.0,
            "metacognitive_sr": 4.0,
            "control_of_learning": 3.0,
        }
    )

    # Return empty iterator for the session SQL query
    mock_sess_result = MagicMock()
    mock_sess_result.__iter__ = MagicMock(return_value=iter([]))

    db = AsyncMock()
    db.execute = AsyncMock(return_value=mock_sess_result)

    # Block weasyprint via sys.modules so the ImportError branch executes
    with (
        patch("app.api.v1.export._get_user_or_404", new=AsyncMock(return_value=user)),
        patch("app.api.v1.export._get_gse", new=AsyncMock(side_effect=[pre_gse, post_gse])),
        patch("app.api.v1.export._get_mslq", new=AsyncMock(side_effect=[mslq, mslq])),
        patch.dict(sys.modules, {"weasyprint": None}),
    ):
        response = await export_user_pdf(30, db)

    # With weasyprint blocked we get the HTML fallback
    assert response.media_type in ("text/html", "application/pdf")
