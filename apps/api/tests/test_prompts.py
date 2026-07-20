"""Tests for prompt templates and CharacterMode."""

from app.domains.prompts.models import CharacterMode
from app.domains.prompts.templates import (
    KAIA_PROMPT_V1_CHALLENGING,
    KAIA_PROMPT_V1_WARM,
    KAIA_PROMPT_V1_WILD,
    KAIA_PROMPT_V2_WARM,
    SEED_TEMPLATES,
)

_ACTIVE_TEMPLATES = [t for t in SEED_TEMPLATES if t["is_active"]]
_ALL_PROMPTS_V1 = [KAIA_PROMPT_V1_WARM, KAIA_PROMPT_V1_CHALLENGING, KAIA_PROMPT_V1_WILD]
_ALL_ACTIVE_PROMPTS = [t["template"] for t in _ACTIVE_TEMPLATES]


def test_character_modes_exist() -> None:
    assert CharacterMode.WARM == "warm"
    assert CharacterMode.CHALLENGING == "challenging"
    assert CharacterMode.WILD == "wild"


def test_seed_templates_have_required_fields() -> None:
    for t in SEED_TEMPLATES:
        assert "name" in t
        assert "character" in t
        assert "template" in t
        assert "is_active" in t
        assert "version" in t


def test_seed_templates_one_active_per_character() -> None:
    """Each character must have exactly one active template."""
    active_chars = [t["character"] for t in _ACTIVE_TEMPLATES]
    assert len(active_chars) == len(set(active_chars)), (
        "Each character must have exactly one active template"
    )


def test_seed_templates_all_characters_have_active() -> None:
    """All three character modes must have an active template."""
    active_chars = {t["character"] for t in _ACTIVE_TEMPLATES}
    assert active_chars == {"warm", "challenging", "wild"}


def test_v5_warm_supersedes_v1_v2_v3_v4_warm() -> None:
    """v1–v4 warm must be inactive; v5 warm must be the active version."""
    v1 = next(t for t in SEED_TEMPLATES if t["name"] == "kaia_system_v1_warm")
    v2 = next(t for t in SEED_TEMPLATES if t["name"] == "kaia_system_v2_warm")
    v3 = next(t for t in SEED_TEMPLATES if t["name"] == "kaia_system_v3_warm")
    v4 = next(t for t in SEED_TEMPLATES if t["name"] == "kaia_system_v4_warm")
    v5 = next(t for t in SEED_TEMPLATES if t["name"] == "kaia_system_v5_warm")
    assert v1["is_active"] is False, "v1 warm must be inactive (superseded by v5)"
    assert v2["is_active"] is False, "v2 warm must be inactive (superseded by v5)"
    assert v3["is_active"] is False, "v3 warm must be inactive (superseded by v5)"
    assert v4["is_active"] is False, "v4 warm must be inactive (superseded by v5)"
    assert v5["is_active"] is True, "v5 warm must be active"
    assert v5["version"] > v4["version"] > v3["version"] > v2["version"] > v1["version"]


def test_prompt_warm_v1_contains_key_elements() -> None:
    assert "sokratisch" in KAIA_PROMPT_V1_WARM.lower() or "fragen" in KAIA_PROMPT_V1_WARM.lower()
    assert "0800 111 0 111" in KAIA_PROMPT_V1_WARM
    assert "Klärungsfrage" in KAIA_PROMPT_V1_WARM or "frage" in KAIA_PROMPT_V1_WARM.lower()


def test_prompt_challenging_contains_key_elements() -> None:
    assert "0800 111 0 111" in KAIA_PROMPT_V1_CHALLENGING
    assert len(KAIA_PROMPT_V1_CHALLENGING) > 100


def test_prompt_wild_contains_key_elements() -> None:
    assert "0800 111 0 111" in KAIA_PROMPT_V1_WILD
    assert len(KAIA_PROMPT_V1_WILD) > 100


def test_v2_warm_has_thinking_structure() -> None:
    """v2 must contain thinking/final_answer split instructions."""
    assert "<thinking>" in KAIA_PROMPT_V2_WARM
    assert "<final_answer>" in KAIA_PROMPT_V2_WARM


def test_v2_warm_has_jailbreak_protection() -> None:
    lower = KAIA_PROMPT_V2_WARM.lower()
    assert "jailbreak" in lower or "vergiss deine anweisungen" in lower or "new role" in lower


def test_v2_warm_has_bias_neutrality() -> None:
    lower = KAIA_PROMPT_V2_WARM.lower()
    assert "bias" in lower or "neutralit" in lower


def test_v2_warm_has_xml_input_tags() -> None:
    """Context variables used as data (not in dialogue) must be wrapped in XML tags.
    Note: last_first_step and last_session_observation are embedded in dialogue strings
    and must NOT have XML tags (would be output verbatim to user).
    """
    assert "<lernziel>" in KAIA_PROMPT_V2_WARM
    assert "<tagesintention>" in KAIA_PROMPT_V2_WARM
    # last_first_step is in dialogue context — verify it does NOT have XML wrapping
    assert "<letzter_schritt>" not in KAIA_PROMPT_V2_WARM


def test_v2_warm_has_example_tags() -> None:
    """v2 must contain at least three <example> blocks for few-shot pairs."""
    assert KAIA_PROMPT_V2_WARM.count("<example>") >= 3


def test_v2_warm_has_verbatim_objection_phrase() -> None:
    """Therapeutic boundary must use the fixed two-step redirect phrase."""
    # Step 1: acknowledgement without evaluation
    assert "Das klingt wichtig fuer dich" in KAIA_PROMPT_V2_WARM
    # Step 2: redirect to learning goal
    assert "professionelle Unterstuetzung" in KAIA_PROMPT_V2_WARM
    assert "was moechtest du heute mit mir ueben" in KAIA_PROMPT_V2_WARM


def test_v2_warm_has_context_reference_ban() -> None:
    lower = KAIA_PROMPT_V2_WARM.lower()
    assert (
        "laut deinem profil" in lower
        or "kontext-referenz" in lower
        or "kein-kontext-referenz" in lower
    )


def test_v2_warm_has_hallucination_guard() -> None:
    lower = KAIA_PROMPT_V2_WARM.lower()
    assert "halluzination" in lower or "grounded" in lower or "grounded-check" in lower


def test_v2_warm_has_convergence_constraint() -> None:
    lower = KAIA_PROMPT_V2_WARM.lower()
    assert "convergence" in lower or "4-6 turns" in lower or "4–6 turns" in lower


def test_all_prompts_forbid_answers() -> None:
    """All prompts must encode the no-answers / cognitive-work principle."""
    for prompt in _ALL_ACTIVE_PROMPTS:
        lower = prompt.lower()
        old_form = "keine antworten" in lower or "keine antwort" in lower or "antworten" in lower
        new_form = "kognitive arbeit" in lower or "kognitive operation" in lower
        assert old_form or new_form, "Prompt missing no-answers / cognitive-work principle"


def test_all_active_prompts_have_crisis_instruction() -> None:
    """Crisis prevention must be in every active character prompt."""
    for prompt in _ALL_ACTIVE_PROMPTS:
        assert "0800 111 0 111" in prompt
        assert "112" in prompt
