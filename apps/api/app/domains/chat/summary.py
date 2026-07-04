"""Session summary extraction and cross-session memory for KAIA.

extract_session_summary — called as a background task after session end,
  writes structured JSON to chat_sessions.session_summary via its own DB connection.

load_all_session_contexts — called at session start, returns a compact multi-line
  string summarising all previous sessions for the current user.

load_previous_session_fields — returns the three scalar fields (first_step,
  observation, insight) from the immediately preceding session only.
"""

import json
import re

import httpx
import structlog
from anthropic import AsyncAnthropic
from anthropic.types import TextBlock
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.domains.chat.models import ChatSession
from app.domains.chat.repository import ChatRepository

log = structlog.get_logger()

_EXTRACTION_MODEL = "claude-haiku-4-5-20251001"
_EXTRACTION_SYSTEM = (
    "Du bist ein Analyse-Assistent fuer KAIA, einen KI-Lernbegleiter.\n"
    "Nach jeder Lernsession extrahierst du strukturierte Informationen"
    " aus dem Gespraechsprotokoll.\n"
    "Antworte NUR mit einem JSON-Objekt — kein Text davor oder danach,"
    " keine Markdown-Fences.\n\n"
    "Extrahiere exakt diese Felder:\n"
    "- first_step: Der konkrete naechste Schritt den der User benannt hat"
    " (string, leer wenn keiner vereinbart wurde)\n"
    "- observation: KAIAs wichtigste Beobachtung ueber die Person —"
    " Lernstil, Energie, Muster — nur auf Basis des Transkripts (string)\n"
    "- insight_for_next_session: Eine Frage oder Beobachtung fuer die"
    " naechste Session — formuliert als natuerlicher Gespraechseinstieg"
    " den KAIA als eigene Reflexion bringen koennte,"
    " z.B. 'Ich frage mich, was passiert wenn...' (string)\n"
    "- mood: Grundstimmung des Users am Ende [positiv|neutral|frustriert|unklar]\n"
    "- topics: Themen die besprochen wurden (array of strings, max 5)\n"
    "- strengths_observed: Beobachtete Staerken oder positive Muster"
    " (string, leer wenn keine erkennbar)\n"
    "- friction_points: Beobachtete Reibungspunkte oder Blockaden"
    " (string, leer wenn keine erkennbar)\n"
    "- strongest_quote: Der starkste eigene Satz des Users — die klarste oder"
    " bedeutsamste Formulierung die er/sie selbst gefunden hat."
    " Woertlich zitiert, nicht paraphrasiert. Leer wenn nichts Treffendes."
    " (string)"
)


async def extract_session_summary(session_id: int) -> None:
    """Post-session extractor: analyse transcript → write JSON to session_summary.

    Called as a background task after end_session. Creates its own DB session
    because the request-scoped session will be closed by then.
    """
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        repo = ChatRepository(db)
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            return

        messages = await repo.get_messages(session_id)
        if not messages:
            return

        lines = [f"{'User' if str(m.role) == 'user' else 'KAIA'}: {m.content}" for m in messages]
        transcript = "\n".join(lines)

        client = AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=5.0),
        )
        try:
            response = await client.messages.create(
                model=_EXTRACTION_MODEL,
                max_tokens=600,
                system=_EXTRACTION_SYSTEM,
                messages=[{"role": "user", "content": f"Transkript:\n\n{transcript}"}],
            )
            block = response.content[0]
            if not isinstance(block, TextBlock):
                raise ValueError(f"unexpected block type: {type(block).__name__}")
            raw_json = block.text.strip()
            # Strip markdown fences Haiku sometimes adds despite instructions
            if raw_json.startswith("```"):
                raw_json = re.sub(r"^```(?:json)?\s*\n?", "", raw_json)
                raw_json = re.sub(r"\n?```\s*$", "", raw_json).strip()
            json.loads(raw_json)  # validate
            session.session_summary = raw_json
            await db.commit()
            log.info("session_summary_extracted", session_id=session_id)
        except Exception as exc:
            log.error("session_summary_extraction_failed", session_id=session_id, error=str(exc))


async def load_all_session_contexts(
    db: AsyncSession,
    user_id: int,
    current_session_id: int,
    max_sessions: int = 9,
) -> str:
    """Return a compact multi-line summary of all previous sessions.

    Loads up to max_sessions previous sessions with a session_summary,
    oldest first. Sessions without a summary are silently skipped.
    Never re-extracts inline — missing summaries are gaps, not blockers.
    """
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.id < current_session_id,
            ChatSession.session_summary.is_not(None),
        )
        .order_by(ChatSession.id.desc())
        .limit(max_sessions)
    )
    sessions = list(result.scalars().all())
    if not sessions:
        return ""

    sessions.reverse()  # chronological order

    lines: list[str] = []
    for s in sessions:
        try:
            data = json.loads(s.session_summary)
        except (json.JSONDecodeError, TypeError):
            continue

        parts = [f"Session {s.session_number}:"]
        if data.get("mood"):
            parts.append(f"Stimmung={data['mood']}")
        if data.get("topics"):
            parts.append(f"Themen={', '.join(data['topics'][:3])}")
        if data.get("observation"):
            parts.append(f"Beobachtung: {data['observation']}")
        if data.get("first_step"):
            parts.append(f"Vereinbarter Schritt: {data['first_step']}")
        if data.get("friction_points"):
            parts.append(f"Reibungspunkte: {data['friction_points']}")
        lines.append(" | ".join(parts))

    return "\n".join(lines)


async def load_historical_quotes(
    db: AsyncSession,
    user_id: int,
    current_session_id: int,
    max_sessions: int = 9,
) -> list[tuple[int, str]]:
    """Return (session_number, strongest_quote) pairs from all previous sessions.

    Used for contradiction work in Sessions 6-8 and the final reflection in Session 10.
    Only returns sessions that have a non-empty strongest_quote.
    """
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.id < current_session_id,
            ChatSession.session_summary.is_not(None),
        )
        .order_by(ChatSession.id.asc())
        .limit(max_sessions)
    )
    sessions = list(result.scalars().all())

    quotes: list[tuple[int, str]] = []
    for s in sessions:
        try:
            data = json.loads(s.session_summary)
            quote = data.get("strongest_quote", "")
            if quote:
                quotes.append((s.session_number, quote))
        except (json.JSONDecodeError, TypeError):
            continue
    return quotes


async def load_previous_session_fields(
    db: AsyncSession,
    repo: ChatRepository,
    user_id: int,
    current_session_id: int,
) -> tuple[str, str, str]:
    """Return (last_first_step, last_observation, insight) from the directly previous session.

    Returns empty strings if no previous session exists or summary is missing.
    Never re-extracts inline — avoids latency on the opening path.
    """
    prev = await repo.get_previous_session(user_id, current_session_id)
    if not prev or not prev.session_summary:
        return "", "", ""

    try:
        summary = json.loads(prev.session_summary)
        first_step = summary.get("first_step", "")
        observation = summary.get("observation", "")
        insight = summary.get("insight_for_next_session", "")
        log.info(
            "cross_session_context_loaded",
            prev_session_id=prev.id,
            has_first_step=bool(first_step),
            has_observation=bool(observation),
            has_insight=bool(insight),
        )
        return first_step, observation, insight
    except (json.JSONDecodeError, AttributeError):
        log.warning("cross_session_context_parse_failed", prev_session_id=prev.id)
        return "", "", ""


# Keep old name as alias so existing background-task callers don't break
load_cross_session_context = load_previous_session_fields
