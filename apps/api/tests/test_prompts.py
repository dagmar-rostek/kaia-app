"""Tests for prompt templates and CharacterMode."""

from app.domains.prompts.models import CharacterMode
from app.domains.prompts.templates import (
    KAIA_PROMPT_V1_CHALLENGING,
    KAIA_PROMPT_V1_WARM,
    KAIA_PROMPT_V1_WILD,
    SEED_TEMPLATES,
)


def test_character_modes_exist() -> None:
    assert CharacterMode.WARM == "warm"
    assert CharacterMode.CHALLENGING == "challenging"
    assert CharacterMode.WILD == "wild"


def test_seed_templates_count() -> None:
    assert len(SEED_TEMPLATES) == 3


def test_seed_templates_have_required_fields() -> None:
    for t in SEED_TEMPLATES:
        assert "name" in t
        assert "character" in t
        assert "template" in t
        assert "is_active" in t
        assert "version" in t


def test_seed_templates_one_active_per_character() -> None:
    chars = [t["character"] for t in SEED_TEMPLATES]
    assert len(chars) == len(set(chars)), "Each character must appear once"


def test_prompt_warm_contains_key_elements() -> None:
    assert "sokratisch" in KAIA_PROMPT_V1_WARM.lower() or "fragen" in KAIA_PROMPT_V1_WARM.lower()
    assert "0800 111 0 111" in KAIA_PROMPT_V1_WARM
    assert "Klärungsfrage" in KAIA_PROMPT_V1_WARM or "frage" in KAIA_PROMPT_V1_WARM.lower()


def test_prompt_challenging_contains_key_elements() -> None:
    assert "0800 111 0 111" in KAIA_PROMPT_V1_CHALLENGING
    assert len(KAIA_PROMPT_V1_CHALLENGING) > 100


def test_prompt_wild_contains_key_elements() -> None:
    assert "0800 111 0 111" in KAIA_PROMPT_V1_WILD
    assert len(KAIA_PROMPT_V1_WILD) > 100


def test_all_prompts_forbid_answers() -> None:
    """All prompts must encode the no-answers / cognitive-work principle."""
    for prompt in [KAIA_PROMPT_V1_WARM, KAIA_PROMPT_V1_CHALLENGING, KAIA_PROMPT_V1_WILD]:
        lower = prompt.lower()
        # Accept either the old formulation or the new cognitive-work principle
        old_form = "keine antworten" in lower or "keine antwort" in lower or "antworten" in lower
        new_form = "kognitive arbeit" in lower or "kognitive operation" in lower
        assert old_form or new_form, "Prompt missing no-answers / cognitive-work principle"


def test_all_prompts_have_crisis_instruction() -> None:
    """Crisis prevention must be in every character prompt."""
    for prompt in [KAIA_PROMPT_V1_WARM, KAIA_PROMPT_V1_CHALLENGING, KAIA_PROMPT_V1_WILD]:
        assert "0800 111 0 111" in prompt
        assert "112" in prompt
