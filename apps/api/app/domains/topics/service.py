"""Topic Evaluation Service.

Klassifiziert ein Lernthema daraufhin, ob es zum KAIA-Ansatz passt:
Knowing-Doing-Gap (Pfeffer & Sutton, 2000) — die Lücke zwischen
Wissen und Umsetzung.

Rate Limiting: In-Memory, IP-basiert, 5 Calls / Stunde.
Kein DB-Speicher — kein personenbezogener Datensatz nötig.

Modell: claude-haiku-4-5-20251001 (günstig, schnell, ausreichend für Classification).
Structured Output via Anthropic tool_use.
"""

import time
from collections import defaultdict
from typing import Any

import structlog
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.domains.topics.schemas import TopicEvalResponse

log = structlog.get_logger()

EVAL_MODEL = "claude-haiku-4-5-20251001"
MAX_OUTPUT_TOKENS = 256

RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECONDS = 3600

# Prozess-lokaler Store: key (IP oder user_id) → Liste von Unix-Timestamps
_rate_store: dict[str, list[float]] = defaultdict(list)


def check_and_record_rate_limit(key: str) -> bool:
    """True = Request erlaubt. False = Limit überschritten."""
    now = time.monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    calls = [t for t in _rate_store[key] if t > cutoff]
    if len(calls) >= RATE_LIMIT_MAX:
        _rate_store[key] = calls
        return False
    calls.append(now)
    _rate_store[key] = calls
    return True


# ── Anthropic Tool-Definition (strukturierter Output) ─────────────────────────

_EVALUATE_TOOL: dict[str, Any] = {
    "name": "evaluate_topic",
    "description": ("Evaluiert ein Lernthema auf Passung zum KAIA-Ansatz (Knowing-Doing-Gap)."),
    "input_schema": {
        "type": "object",
        "properties": {
            "fits_gap": {
                "type": "boolean",
                "description": "True wenn das Thema primär ein Umsetzungsproblem ist.",
            },
            "confidence": {
                "type": "string",
                "enum": ["high", "medium", "low"],
                "description": "Sicherheit der Klassifikation.",
            },
            "feedback": {
                "type": "string",
                "description": (
                    "1–2 Sätze direkt für den User. Erklärt kurz, warum das Thema passt "
                    "oder nicht — ohne akademische Floskeln."
                ),
            },
            "suggestion": {
                "type": ["string", "null"],
                "description": (
                    "Nur wenn fits_gap=False: Umformulierung des Themas als Knowing-Doing-Gap. "
                    "Null wenn fits_gap=True."
                ),
            },
            "category": {
                "type": "string",
                "enum": ["knowing_doing", "knowledge_acquisition", "unclear"],
            },
        },
        "required": ["fits_gap", "confidence", "feedback", "suggestion", "category"],
    },
}

# Prompt liegt versioniert in prompts/topics/evaluate.md.
# Hier die Runtime-Version — identisch, nur ohne YAML-Frontmatter.
_SYSTEM_PROMPT = """\
Du bist ein Klassifikator für KAIA, einen KI-Lernbegleiter der auf den \
„Knowing-Doing-Gap" spezialisiert ist.

KAIA hilft Menschen dabei, Dinge umzusetzen, die sie bereits kennen oder \
verstehen, aber im Alltag nicht konsequent tun. \
Das nennt sich der Knowing-Doing-Gap (Pfeffer & Sutton, 2000).

KAIA ist NICHT für:
- Neues Wissen aufbauen (z. B. „Python lernen", „Statistik verstehen")
- Spracherwerb
- Prüfungsvorbereitung
- Faktenwissen aneignen

KAIA IST für:
- Verhaltensänderungen: etwas tun, das man schon kennt, aber nicht tut
- Führungsaufgaben: Feedback geben, delegieren, Konflikte ansprechen — obwohl \
man weiß wie es geht
- Gewohnheiten aufbauen, die man theoretisch kennt, aber nicht lebt
- Bekannte Methoden oder Techniken endlich im Alltag anwenden

KLASSIFIZIERUNGS-BEISPIELE:

knowing_doing (fits_gap=True):
- „Kritische Feedbackgespräche, die ich immer wieder aufschiebe" \
→ PASST: Aufschieben trotz Wissen = klassischer Gap
- „Besser delegieren, obwohl ich weiß wie's geht" \
→ PASST: „obwohl ich weiß" = expliziter Gap
- „Endlich Konflikte im Team direkt ansprechen" \
→ PASST: „endlich" signalisiert bekanntes Verhalten, das nicht gelebt wird
- „Führung & Mitarbeitergespräche" \
→ PASST wenn bereits in Führungsrolle (Umsetzung, nicht Einstieg)
- „Entscheidungen unter Unsicherheit" \
→ PASST: meist Umsetzungsproblem, nicht Wissenslücke

knowledge_acquisition (fits_gap=False):
- „Python für Data Science lernen" \
→ PASST NICHT: Neues Wissen aufbauen
- „Englisch Vokabeln für meinen Urlaub" \
→ PASST NICHT: Spracherwerb
- „Grundlagen der Statistik verstehen" \
→ PASST NICHT: Wissensaufbau
- „Prüfungsvorbereitung Statistik" \
→ PASST NICHT: Lernstoff für Prüfung

unclear (confidence="medium" oder "low"):
- „Zeitmanagement" \
→ UNKLAR: könnte Wissensaufbau (Methoden kennenlernen) oder \
Umsetzung (Methoden nicht anwenden) sein
- „Kommunikation verbessern" \
→ UNKLAR: zu generisch für klare Klassifikation

REGELN FÜR DEIN FEEDBACK:
- Maximal 2 Sätze, direkt auf den User zugeschnitten
- Kein akademischer Ton, keine Fremdwörter
- Bei unclear: schreibe, dass KAIA am besten hilft, wenn man das Thema \
schon ein bisschen kennt
- Bei fits_gap=False: schlage eine Umformulierung als suggestion vor, die das \
Thema in einen Knowing-Doing-Gap verwandelt — nur wenn das sachlich möglich ist
- Bei fits_gap=True: suggestion = null\
"""


async def evaluate_topic(topic: str) -> TopicEvalResponse:
    """Ruft Haiku auf und gibt das klassifizierte Ergebnis zurück."""
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    response = await client.messages.create(  # type: ignore[call-overload]
        model=EVAL_MODEL,
        max_tokens=MAX_OUTPUT_TOKENS,
        system=_SYSTEM_PROMPT,
        tools=[_EVALUATE_TOOL],
        tool_choice={"type": "tool", "name": "evaluate_topic"},
        messages=[{"role": "user", "content": f"Lernthema: {topic}"}],
    )

    # tool_use ist garantiert der erste Block wenn tool_choice gesetzt ist
    tool_block = next(
        (b for b in response.content if b.type == "tool_use"),
        None,
    )
    if tool_block is None:
        log.error("topic_eval_no_tool_block", model=EVAL_MODEL, topic=topic[:80])
        # Sicherer Fallback — lieber "unclear" als Exception
        return TopicEvalResponse(
            fits_gap=False,
            confidence="low",
            feedback=(
                "Wir konnten dein Thema gerade nicht einordnen. Du kannst trotzdem weitermachen."
            ),
            suggestion=None,
            category="unclear",
        )

    assert hasattr(tool_block, "input"), "tool_block must be ToolUseBlock"
    result: dict[str, Any] = tool_block.input

    log.info(
        "topic_eval_done",
        topic=topic[:80],
        category=result.get("category"),
        fits_gap=result.get("fits_gap"),
        confidence=result.get("confidence"),
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )

    return TopicEvalResponse(
        fits_gap=bool(result["fits_gap"]),
        confidence=result["confidence"],
        feedback=result["feedback"],
        suggestion=result.get("suggestion"),
        category=result["category"],
    )
