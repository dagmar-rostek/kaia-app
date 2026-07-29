"""Unit tests for pure logic functions — no DB, no HTTP, no API calls."""

import pytest
from pydantic import ValidationError

from app.domains.preregistration.schemas import PreRegisterRequest
from app.domains.preregistration.service import _confirmation_html, _removal_html
from app.domains.topics.schemas import TopicEvalRequest
from app.domains.topics.service import RATE_LIMIT_MAX, _rate_store, check_and_record_rate_limit

# ── topics/schemas ─────────────────────────────────────────────────────────────


def test_topic_request_strips_whitespace():
    req = TopicEvalRequest(topic="  Führungskompetenz  ")
    assert req.topic == "Führungskompetenz"


def test_topic_request_rejects_blank():
    with pytest.raises(ValidationError):
        TopicEvalRequest(topic="   ")


def test_topic_request_rejects_empty():
    with pytest.raises(ValidationError):
        TopicEvalRequest(topic="")


def test_topic_request_max_length():
    with pytest.raises(ValidationError):
        TopicEvalRequest(topic="x" * 501)


# ── topics/service — rate limit ────────────────────────────────────────────────


def test_rate_limit_allows_first_call():
    key = "__test_fresh_key__"
    _rate_store.pop(key, None)
    assert check_and_record_rate_limit(key) is True


def test_rate_limit_allows_up_to_max():
    key = "__test_up_to_max__"
    _rate_store.pop(key, None)
    for i in range(RATE_LIMIT_MAX):
        assert check_and_record_rate_limit(key) is True, f"Call {i + 1} should be allowed"


def test_rate_limit_blocks_at_max_plus_one():
    key = "__test_block__"
    _rate_store.pop(key, None)
    for _ in range(RATE_LIMIT_MAX):
        check_and_record_rate_limit(key)
    assert check_and_record_rate_limit(key) is False


# ── preregistration/schemas ────────────────────────────────────────────────────


def test_prereg_request_valid():
    req = PreRegisterRequest(name="Anna", email="anna@example.com", reason="Neugier")
    assert req.name == "Anna"


def test_prereg_request_strips_name():
    req = PreRegisterRequest(name="  Anna  ", email="anna@example.com", reason="Neugier")
    assert req.name == "Anna"


def test_prereg_request_rejects_blank_name():
    with pytest.raises(ValidationError):
        PreRegisterRequest(name="   ", email="anna@example.com", reason="Neugier")


def test_prereg_request_strips_reason():
    req = PreRegisterRequest(name="Anna", email="anna@example.com", reason="  Lust  ")
    assert req.reason == "Lust"


def test_prereg_request_rejects_blank_reason():
    with pytest.raises(ValidationError):
        PreRegisterRequest(name="Anna", email="anna@example.com", reason="   ")


def test_prereg_request_rejects_invalid_email():
    with pytest.raises(ValidationError):
        PreRegisterRequest(name="Anna", email="not-an-email", reason="Test")


# ── preregistration/service — HTML templates ──────────────────────────────────


def test_confirmation_html_contains_name():
    html = _confirmation_html("Anna", "tok123")
    assert "Anna" in html
    assert "tok123" in html
    assert "KAIA" in html


def test_removal_html_contains_name():
    html = _removal_html("Anna")
    assert "Anna" in html
    assert "entfernt" in html.lower() or "Abmeldung" in html or "Liste" in html
