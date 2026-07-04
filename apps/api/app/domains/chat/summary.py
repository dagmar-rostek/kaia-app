"""Session summary extraction and cross-session memory for KAIA.

extract_session_summary — called as a background task after session end,
  writes structured JSON to chat_sessions.session_summary via its own DB connection.

_load_cross_session_context — called inline at session start, returns the three
  fields that feed the Jinja2 prompt template for follow-up sessions.
"""

import asyncio
import json
import re

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
    " (string, leer wenn keine erkennbar)"
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

        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        try:
            response = await client.messages.create(
                model=_EXTRACTION_MODEL,
                max_tokens=512,
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


async def load_cross_session_context(
    db: AsyncSession,
    repo: ChatRepository,
    user_id: int,
    current_session_id: int,
) -> tuple[str, str, str]:
    """Return (last_first_step, last_observation, insight) from the previous session.

    Handles two failure modes:
    - Session not ended (user closed tab): auto-ends and extracts inline.
    - Summary missing despite ended session: re-extracts inline.
    Both paths have a 12-second timeout so the opening message is never blocked.
    """
    prev = await repo.get_previous_session(user_id, current_session_id)
    if not prev:
        return "", "", ""

    if prev.session_summary is None:
        if prev.ended_at is None:
            await repo.end_session(prev)
        try:
            await asyncio.wait_for(extract_session_summary(prev.id), timeout=12.0)
        except Exception:
            log.warning("cross_session_summary_extraction_failed", prev_session_id=prev.id)
            return "", "", ""
        db.expire(prev)
        await db.refresh(prev)
        if not prev.session_summary:
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
