"""Tests for the crisis detection pre-filter."""

import pytest

from app.core.crisis import CRISIS_RESPONSE, detect_crisis

# ---------------------------------------------------------------------------
# True positives — MUST be detected
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("text", [
    "Ich will nicht mehr leben",
    "ich denke an suizid",
    "Ich überlege Selbstmord zu begehen",
    "Ich möchte mich umbringen",
    "ich will mich erbringen",
    "Ich möchte mir das Leben nehmen",
    "ich will sterben",
    "Ich möchte tot sein",
    "ich wünsche mir den Tod",
    "Ich schreibe gerade meinen Abschiedsbrief",
    "ich rItze mich seit Wochen",
    "ich verletze mich selbst",
    "Ich möchte mir wehtun",
    "Ich sehe keinen Ausweg mehr",
    "niemand würde mich vermissen",
    "ich kann nicht mehr weiterleben",
    "Es wäre besser wenn ich nicht mehr wäre",
    "Ich ertrage es nicht mehr",
    "ich will nicht mehr da sein",
    # Embedded in longer text
    "Heute war so ein schlechter Tag, ich denke manchmal an suizid.",
    "Mir geht es nicht gut und ich will einfach nicht mehr leben wollen.",
])
def test_detects_crisis(text: str) -> None:
    assert detect_crisis(text) is True, f"MISSED crisis signal: {text!r}"


# ---------------------------------------------------------------------------
# True negatives — must NOT be detected (false positive check)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("text", [
    "Ich bin heute so müde",
    "Das Lernen ist schwer aber ich schaffe es",
    "Ich mache mir Sorgen um die Prüfung",
    "Die Geschichte des Zweiten Weltkriegs war tragisch — viele Menschen starben",
    "In der Literatur wird der Tod oft als Metapher verwendet",
    "Mein Lieblingsbuch handelt von einem Mord",
    "Ich habe gestern einen schlechten Film gesehen",
    "Kannst du mir bei Mathe helfen?",
    "Ich bin frustriert wegen der Arbeit",
    "Manchmal fühle ich mich hoffnungslos beim Lernen, aber dann geht es wieder",
    "Heute sterbe ich fast vor Hunger — was gibt es zum Mittagessen?",
    "Das Projekt stirbt langsam vor sich hin",
])
def test_no_false_positive(text: str) -> None:
    assert detect_crisis(text) is False, f"False positive triggered: {text!r}"


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------

def test_case_insensitive() -> None:
    assert detect_crisis("ICH DENKE AN SUIZID") is True
    assert detect_crisis("Suizid") is True
    assert detect_crisis("SELBSTMORD") is True


def test_empty_string() -> None:
    assert detect_crisis("") is False


def test_whitespace_only() -> None:
    assert detect_crisis("   \n\t  ") is False


def test_crisis_response_contains_hotline() -> None:
    assert "0800 111 0 111" in CRISIS_RESPONSE
    assert "112" in CRISIS_RESPONSE


def test_crisis_response_not_empty() -> None:
    assert len(CRISIS_RESPONSE.strip()) > 100
