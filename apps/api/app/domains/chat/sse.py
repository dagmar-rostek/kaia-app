"""SSE infrastructure for KAIA's streaming responses.

Provides helpers, constants, and the thinking-strip parser used by all
streaming functions in service.py.
"""

import json
import re
from decimal import Decimal
from typing import Any

from app.core.config import settings

# ── Model & cost constants ────────────────────────────────────────────────────

MAX_TOKENS = 4000  # thinking buffer (~3000) + final_answer (~1000); prevent budget exhaustion
OPENING_MODEL = "gpt-4.1-mini"  # greetings need no heavy reasoning; uses same fast path as chat

_COST_TABLE: dict[str, tuple[Decimal, Decimal]] = {
    # (input_per_token_eur, output_per_token_eur) — prices in EUR, converted at ~1.08 USD/EUR
    # Cache write = 1.25× input, cache read = 0.10× input (Anthropic standard)
    # claude-sonnet-4-6: $3/MTok input, $15/MTok output, $3.75 cache write, $0.30 cache read
    "claude-sonnet-4-6": (Decimal("0.000002778"), Decimal("0.000013889")),
    # claude-sonnet-5: $3/MTok input, $15/MTok output (same tier as 4.6)
    "claude-sonnet-5": (Decimal("0.000002778"), Decimal("0.000013889")),
    # claude-haiku-4-5: $0.80/MTok input, $4/MTok output
    "claude-haiku-4-5-20251001": (Decimal("0.00000074"), Decimal("0.0000037")),
    # gpt-4o: $2.50/MTok input, $10/MTok output
    "gpt-4o": (Decimal("0.0000023"), Decimal("0.0000093")),
    "gpt-4o-mini": (Decimal("0.00000013"), Decimal("0.00000053")),
    "gpt-5.6-terra": (Decimal("0.0000023"), Decimal("0.0000092")),
    # gpt-4.1-mini: $0.40/MTok input, $1.60/MTok output
    "gpt-4.1-mini": (Decimal("0.00000037"), Decimal("0.0000015")),
    # mistral-large: €2/MTok input, €6/MTok output
    "mistral-large-latest": (Decimal("0.000002"), Decimal("0.000006")),
    "mistral-small-latest": (Decimal("0.00000074"), Decimal("0.0000022")),
}

# ── Dynamisches Modell (Admin-switcher ohne Neustart) ─────────────────────────

_current_model: str = settings.kaia_chat_model


def get_model() -> str:
    """Gibt das aktuell konfigurierte KAIA-Chat-Modell zurück."""
    return _current_model


def set_model_override(model: str) -> None:
    """Setzt das KAIA-Chat-Modell in-memory (wirkt sofort, ohne Neustart).
    Zusätzlich muss der Aufrufer die DB aktualisieren für Restart-Persistenz.
    """
    global _current_model, COST_INPUT_PER_TOKEN, COST_OUTPUT_PER_TOKEN
    _current_model = model
    _costs = _COST_TABLE.get(model, _COST_TABLE["claude-sonnet-4-6"])
    COST_INPUT_PER_TOKEN = _costs[0]
    COST_OUTPUT_PER_TOKEN = _costs[1]


# Initialisierung der Kosten-Globals auf Basis des konfigurierten Startmodells
_init_costs = _COST_TABLE.get(_current_model, _COST_TABLE["claude-sonnet-4-6"])
COST_INPUT_PER_TOKEN = _init_costs[0]
COST_OUTPUT_PER_TOKEN = _init_costs[1]

# ── SSE event helpers ─────────────────────────────────────────────────────────


def sse(data: dict[str, Any]) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def delta(content: str) -> str:
    return sse({"type": "delta", "content": content})


def error(message: str) -> str:
    return sse({"type": "error", "message": message})


def done(message_id: int, input_tokens: int, output_tokens: int) -> str:
    return sse(
        {
            "type": "done",
            "message_id": message_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }
    )


def thinking_event(content: str) -> str:
    return sse({"type": "thinking", "content": content})


# ── Thinking-strip ────────────────────────────────────────────────────────────


def thinking_strip(raw_chunks: list[str]) -> tuple[str | None, str]:
    """Extract thinking block and final answer from collected raw chunks.

    Returns: (thinking_content | None, final_answer)
    The thinking block is preserved for the debug/research audit trail.
    """
    import structlog  # noqa: PLC0415

    log = structlog.get_logger()
    full = "".join(raw_chunks)
    original_len = len(full)

    thinking: str | None = None
    t_match = re.search(r"<thinking>([\s\S]*?)(?:</thinking>|$)", full, re.DOTALL)
    if t_match:
        t_text = t_match.group(1).strip()
        if t_text:
            thinking = t_text

    full = re.sub(r"<thinking>[\s\S]*?</thinking>", "", full, flags=re.DOTALL)
    full = re.sub(r"<thinking>[\s\S]*$", "", full, flags=re.DOTALL)

    m = re.search(r"<final_answer>([\s\S]*?)</final_answer>", full, re.DOTALL)
    if m:
        result = m.group(1).strip()
    else:
        result = full.replace("<final_answer>", "").replace("</final_answer>", "").strip()

    if not result and original_len > 0:
        log.warning(
            "thinking_strip_empty_result",
            original_chars=original_len,
            had_thinking=thinking is not None,
        )

    return thinking, result
