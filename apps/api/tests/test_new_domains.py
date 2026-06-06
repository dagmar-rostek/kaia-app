"""Smoke tests for new domain models — ensures modules import and enums are correct."""

from app.domains.chat.models import ChunkType, DetectedState, InteractionMode, MessageRole
from app.domains.roadmap.models import GoalStatus, ResponsePattern, SessionMood, VocabularyLevel
from app.domains.survey.models import ConsentEvent, MeasurementType

# ── Chat domain ───────────────────────────────────────────────────────────────


def test_interaction_modes() -> None:
    assert InteractionMode.SOKRATISCH == "sokratisch"
    assert InteractionMode.SCAFFOLDING == "scaffolding"
    assert InteractionMode.BESTAERKEND == "bestärkend"
    assert InteractionMode.HERAUSFORDERND == "herausfordernd"


def test_detected_states() -> None:
    assert DetectedState.EXPLORATIV == "explorativ"
    assert DetectedState.ORIENTIERUNGSLOS == "orientierungslos"
    assert DetectedState.REFLEKTIEREND == "reflektierend"


def test_message_roles() -> None:
    assert MessageRole.USER == "user"
    assert MessageRole.ASSISTANT == "assistant"


def test_chunk_types() -> None:
    assert ChunkType.INSIGHT == "insight"
    assert ChunkType.QUESTION == "question"
    assert ChunkType.MILESTONE == "milestone"


# ── Survey domain ─────────────────────────────────────────────────────────────


def test_measurement_types() -> None:
    assert MeasurementType.PRE == "pre"
    assert MeasurementType.POST == "post"


def test_consent_events_cover_dsgvo_rights() -> None:
    required = {
        "register",
        "ki_disclosure",
        "analytics_opt_in",
        "analytics_opt_out",
        "data_export",
        "account_delete",
    }
    existing = {e.value for e in ConsentEvent}
    assert required.issubset(existing), f"Missing consent events: {required - existing}"


# ── Roadmap domain ────────────────────────────────────────────────────────────


def test_goal_status_values() -> None:
    statuses = {s.value for s in GoalStatus}
    assert statuses == {"open", "active", "paused", "done"}


def test_vocabulary_levels() -> None:
    levels = {v.value for v in VocabularyLevel}
    assert "einfach" in levels
    assert "akademisch" in levels


def test_session_moods() -> None:
    moods = {m.value for m in SessionMood}
    assert "positiv" in moods
    assert "frustriert" in moods


def test_response_patterns() -> None:
    patterns = {p.value for p in ResponsePattern}
    assert "kurz" in patterns
    assert "ausführlich" in patterns
