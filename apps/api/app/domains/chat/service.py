"""Chat service — LLM integration, SSE streaming, thinking-strip.

Architecture:
  User input
    → Crisis detection (sync, pre-LLM)
    → Prompt rendering (Jinja2 + session context)
    → Claude API (streaming)
    → Thinking strip (state machine)
    → SSE delta stream → client
    → Save messages to DB
    → Log to llm_usage
"""

import asyncio
import json
import re
from collections.abc import AsyncGenerator
from decimal import Decimal
from typing import Any

import structlog
from anthropic import AsyncAnthropic
from anthropic.types import TextBlock
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.crisis import CRISIS_RESPONSE
from app.core.crisis import detect_crisis as is_crisis
from app.domains.chat.models import ChatSession, MessageRole
from app.domains.chat.repository import ChatRepository
from app.domains.prompts.models import CharacterMode
from app.domains.prompts.repository import get_active_template
from app.domains.prompts.service import PromptContext, render_prompt

log = structlog.get_logger()

# ── Constants ──────────────────────────────────────────────────────────────────

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 1500  # thinking (~600) + final_answer (~300) + buffer

# Cost per token in EUR (approximate, claude-sonnet-4-6)
COST_INPUT_PER_TOKEN = Decimal("0.0000027")  # ~$3/MTok → ~€2.8/MTok
COST_OUTPUT_PER_TOKEN = Decimal("0.000013")  # ~$15/MTok → ~€13.8/MTok

# ── SSE event helpers ──────────────────────────────────────────────────────────


def _sse(data: dict[str, Any]) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def _delta(content: str) -> str:
    return _sse({"type": "delta", "content": content})


def _error(message: str) -> str:
    return _sse({"type": "error", "message": message})


def _done(message_id: int, input_tokens: int, output_tokens: int) -> str:
    return _sse(
        {
            "type": "done",
            "message_id": message_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }
    )


def _thinking_event(content: str) -> str:
    return _sse({"type": "thinking", "content": content})


# ── Thinking-strip ────────────────────────────────────────────────────────────


def _thinking_strip_generator(raw_chunks: list[str]) -> tuple[str | None, str]:
    """Extract thinking block and final answer from collected chunks.

    Returns: (thinking_content | None, final_answer)
    The thinking block is preserved for debug/analysis output.
    """
    full = "".join(raw_chunks)

    # Extract inner thinking content (handles closed and unclosed blocks)
    thinking: str | None = None
    t_match = re.search(r"<thinking>([\s\S]*?)(?:</thinking>|$)", full, re.DOTALL)
    if t_match:
        t_text = t_match.group(1).strip()
        if t_text:
            thinking = t_text

    # Remove thinking blocks from the main content
    full = re.sub(r"<thinking>[\s\S]*?</thinking>", "", full, flags=re.DOTALL)
    full = re.sub(r"<thinking>[\s\S]*$", "", full, flags=re.DOTALL)

    # Extract final_answer if present
    m = re.search(r"<final_answer>([\s\S]*?)</final_answer>", full, re.DOTALL)
    if m:
        return thinking, m.group(1).strip()
    return thinking, full.replace("<final_answer>", "").replace("</final_answer>", "").strip()


# ── Cross-session context helper ─────────────────────────────────────────────


async def _load_cross_session_context(
    db: AsyncSession,
    repo: "ChatRepository",
    user_id: int,
    current_session_id: int,
) -> tuple[str, str, str]:
    """Return (last_first_step, last_observation, insight) from the previous session.

    Handles two failure modes:
    - Session not ended (user closed tab): auto-ends it and extracts summary.
    - Summary missing despite ended session (race condition): re-extracts inline.
    Both with a 12-second timeout so the opening message is never blocked forever.
    """
    prev = await repo.get_previous_session(user_id, current_session_id)
    if not prev:
        return "", "", ""

    if prev.session_summary is None:
        # Auto-end if not ended yet
        if prev.ended_at is None:
            await repo.end_session(prev)
        # Extract summary inline with timeout
        try:
            await asyncio.wait_for(extract_session_summary(prev.id), timeout=12.0)
        except Exception:
            log.warning("cross_session_summary_extraction_failed", prev_session_id=prev.id)
            return "", "", ""
        # Re-fetch from DB to pick up the committed summary
        result = await db.execute(select(ChatSession).where(ChatSession.id == prev.id))
        prev = result.scalar_one_or_none()
        if not prev or not prev.session_summary:
            return "", "", ""

    try:
        summary = json.loads(prev.session_summary)
        return (
            summary.get("first_step", ""),
            summary.get("observation", ""),
            summary.get("insight_for_next_session", ""),
        )
    except (json.JSONDecodeError, AttributeError):
        return "", "", ""


# ── Main streaming generator ───────────────────────────────────────────────────


async def stream_response(
    db: AsyncSession,
    session: ChatSession,
    user_content: str,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Core SSE generator: crisis check → prompt → LLM → strip → persist → log."""

    repo = ChatRepository(db)

    # 1. Crisis detection — deterministic, never goes to LLM
    if is_crisis(user_content):
        # Save user message, then return crisis response without LLM call
        await repo.save_message(session.id, MessageRole.USER, user_content)
        assistant_msg = await repo.save_message(session.id, MessageRole.ASSISTANT, CRISIS_RESPONSE)
        yield _delta(CRISIS_RESPONSE)
        yield _done(assistant_msg.id, 0, 0)
        return

    # 2. Save user message
    await repo.save_message(session.id, MessageRole.USER, user_content)

    # 3. Build prompt context
    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    last_step, last_observation, insight = ("", "", "")
    if not is_first:
        last_step, last_observation, insight = await _load_cross_session_context(
            db, repo, session.user_id, session.id
        )

    outcome = session.daily_plan or ""

    ctx = PromptContext(
        user_name=user_name,
        learning_topic=learning_topic,
        is_first_session=is_first,
        last_first_step=last_step,
        last_session_observation=last_observation,
        insight_for_next_session=insight,
        outcome=outcome,
        daily_plan=session.daily_plan or "",
    )

    # 4. Render system prompt from DB (or fallback to compiled-in templates)
    character = CharacterMode(session.character)
    raw_template = await get_active_template(db, character)
    system_prompt = render_prompt(raw_template, ctx)

    # 5. Build conversation history for the API call
    history = await repo.get_messages(session.id)
    # Exclude the user message we just saved (it's already at the end)
    api_messages = [
        {"role": str(m.role), "content": m.content}
        for m in history
        if m.content  # skip empty
    ]

    # 6. Stream from Claude
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = 0
    output_tokens = 0

    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=api_messages,  # type: ignore[arg-type]
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)

            # Get final usage after stream completes
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens

    except Exception as exc:
        log.error("llm_stream_error", error=str(exc), session_id=session.id)
        yield _error("KAIA ist gerade nicht erreichbar. Bitte versuche es in einem Moment erneut.")
        return

    # 7. Strip thinking, extract final answer
    thinking, final_content = _thinking_strip_generator(raw_chunks)

    # Emit thinking block for admin debug mode (before the answer)
    if debug and thinking:
        yield _thinking_event(thinking)

    if not final_content:
        final_content = "Ich bin einen Moment nicht sicher. Magst du das nochmal sagen?"

    # 8. Stream the final answer to the client
    yield _delta(final_content)

    # 9. Persist assistant message (including thinking block for research audit trail)
    assistant_msg = await repo.save_message(
        session.id,
        MessageRole.ASSISTANT,
        final_content,
        thinking_raw=thinking,
    )

    # 10. Log LLM usage
    await _log_usage(db, session, input_tokens, output_tokens)

    # 11. Signal done
    yield _done(assistant_msg.id, input_tokens, output_tokens)
    log.info(
        "llm_response_complete",
        session_id=session.id,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )


async def extract_session_summary(session_id: int) -> None:
    """Post-session extractor: analyse transcript → write JSON to session_summary.

    Called as a background task after end_session. Creates its own DB session
    because the request-scoped session will be closed by then.
    """
    from app.db.session import AsyncSessionLocal

    extraction_model = "claude-haiku-4-5-20251001"
    extraction_system = (
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

    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        repo = ChatRepository(db)
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            return

        messages = await repo.get_messages(session_id)
        if not messages:
            return

        # Build readable transcript
        lines = []
        for m in messages:
            speaker = "User" if str(m.role) == "user" else "KAIA"
            lines.append(f"{speaker}: {m.content}")
        transcript = "\n".join(lines)

        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        try:
            response = await client.messages.create(
                model=extraction_model,
                max_tokens=512,
                system=extraction_system,
                messages=[{"role": "user", "content": f"Transkript:\n\n{transcript}"}],
            )
            block = response.content[0]
            if not isinstance(block, TextBlock):
                raise ValueError(f"unexpected block type: {type(block).__name__}")
            raw_json = block.text.strip()
            # Validate by parsing — store raw JSON string
            json.loads(raw_json)
            session.session_summary = raw_json
            await db.commit()
            log.info("session_summary_extracted", session_id=session_id)
        except Exception as exc:
            log.error("session_summary_extraction_failed", session_id=session_id, error=str(exc))


async def stream_opening(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's opening message for a fresh session.

    No user message is stored — only KAIA's response persists.
    Uses an invisible system trigger so Claude knows to open the conversation.
    """
    repo = ChatRepository(db)
    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    last_step, last_observation, insight = ("", "", "")
    if not is_first:
        last_step, last_observation, insight = await _load_cross_session_context(
            db, repo, session.user_id, session.id
        )

    ctx = PromptContext(
        user_name=user_name,
        learning_topic=learning_topic,
        is_first_session=is_first,
        last_first_step=last_step,
        last_session_observation=last_observation,
        insight_for_next_session=insight,
        outcome=session.daily_plan or "",
        daily_plan=session.daily_plan or "",
    )

    character = CharacterMode(session.character)
    raw_template = await get_active_template(db, character)
    system_prompt = render_prompt(raw_template, ctx)

    # Invisible trigger — instructs KAIA to open. Never stored.
    trigger = "[Gesprächsstart — stelle deine Eröffnungsfrage.]"

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = 0
    output_tokens = 0

    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": trigger}],
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens

    except Exception as exc:
        log.error("llm_opening_error", error=str(exc), session_id=session.id)
        yield _error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = _thinking_strip_generator(raw_chunks)

    if debug and thinking:
        yield _thinking_event(thinking)

    if not final_content:
        final_content = "Hallo! Womit darf ich dich heute begleiten?"

    yield _delta(final_content)

    try:
        assistant_msg = await repo.save_message(
            session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
        )
    except IntegrityError:
        # Session was deleted mid-stream (e.g. admin reset) — discard silently.
        log.warning("llm_opening_session_gone", session_id=session.id)
        return
    await _log_usage(db, session, input_tokens, output_tokens)
    yield _done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_opening_complete", session_id=session.id)


CLOSING_TRIGGER = (
    "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
    "Keine Bewertung, kein Lob, keine Zusammenfassung. "
    "Eine kurze, offene Frage die den eigenen Gedanken des Lernenden weitertragen lässt. "
    "Maximal zwei Sätze.]"
)


async def stream_closing(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's closing question (SSE stream).

    Called when the user triggers session end. Session stays open — the client
    calls /end only after the user confirms. Follows the same pattern as
    stream_opening: no user message stored, only KAIA's response persists.
    """
    repo = ChatRepository(db)
    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    last_step, last_observation, insight = ("", "", "")
    if not is_first:
        last_step, last_observation, insight = await _load_cross_session_context(
            db, repo, session.user_id, session.id
        )

    ctx = PromptContext(
        user_name=user_name,
        learning_topic=learning_topic,
        is_first_session=is_first,
        last_first_step=last_step,
        last_session_observation=last_observation,
        insight_for_next_session=insight,
        outcome=session.daily_plan or "",
        daily_plan=session.daily_plan or "",
    )

    character = CharacterMode(session.character)
    raw_template = await get_active_template(db, character)
    system_prompt = render_prompt(raw_template, ctx)

    # Full conversation history + closing trigger as last user turn
    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": CLOSING_TRIGGER})

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = 0
    output_tokens = 0

    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=300,
            system=system_prompt,
            messages=api_messages,  # type: ignore[arg-type]
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens

    except Exception as exc:
        log.error("llm_closing_error", error=str(exc), session_id=session.id)
        yield _error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = _thinking_strip_generator(raw_chunks)

    if debug and thinking:
        yield _thinking_event(thinking)

    if not final_content:
        final_content = "Was möchtest du aus diesem Gespräch mitnehmen?"

    yield _delta(final_content)

    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(db, session, input_tokens, output_tokens)
    yield _done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_closing_complete", session_id=session.id)


META_TRIGGERS = {
    "stuck": (
        "[Metakognitions-Signal — die lernende Person hat signalisiert dass sie gerade feststeckt. "
        "Stelle jetzt eine kurze klärende Frage was konkret schwierig ist. "
        "Nicht trösten. Nicht erklären. Nur eine einzige, kurze Frage.]"
    ),
    "unclear": (
        "[Verständnis-Signal — die lernende Person hat signalisiert dass etwas unklar ist. "
        "Stelle jetzt eine kurze Frage um zu verstehen welcher Teil noch nicht sitzt. "
        "Nicht erklären. Nur eine einzige, kurze Frage.]"
    ),
}


async def stream_meta_question(
    db: AsyncSession,
    session: ChatSession,
    feedback_type: str,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """SSE stream of KAIA's meta-cognitive reaction to a stuck/unclear signal.

    Appends the appropriate META_TRIGGER to the full conversation history.
    max_tokens=120 — one short question only.
    """
    trigger = META_TRIGGERS.get(feedback_type)
    if not trigger:
        yield _error(f"Unbekannter feedback_type: {feedback_type}")
        return

    repo = ChatRepository(db)
    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    ctx = PromptContext(
        user_name=user_name,
        learning_topic=learning_topic,
        is_first_session=is_first,
        outcome=session.daily_plan or "",
        daily_plan=session.daily_plan or "",
    )

    character = CharacterMode(session.character)
    raw_template = await get_active_template(db, character)
    system_prompt = render_prompt(raw_template, ctx)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": trigger})

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = 0
    output_tokens = 0

    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=120,
            system=system_prompt,
            messages=api_messages,  # type: ignore[arg-type]
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens

    except Exception as exc:
        log.error("llm_meta_error", error=str(exc), session_id=session.id)
        yield _error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = _thinking_strip_generator(raw_chunks)

    if debug and thinking:
        yield _thinking_event(thinking)

    fallbacks = {
        "stuck": "Was genau macht es gerade schwierig?",
        "unclear": "Welcher Teil ist noch nicht klar?",
    }
    if not final_content:
        final_content = fallbacks[feedback_type]

    yield _delta(final_content)

    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(db, session, input_tokens, output_tokens)
    yield _done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_meta_complete", session_id=session.id, feedback_type=feedback_type)


async def _log_usage(
    db: AsyncSession,
    session: ChatSession,
    input_tokens: int,
    output_tokens: int,
) -> None:
    from app.db.session import Base  # noqa: F401 — ensure models loaded

    cost = (
        Decimal(input_tokens) * COST_INPUT_PER_TOKEN
        + Decimal(output_tokens) * COST_OUTPUT_PER_TOKEN
    )

    # Use raw insert to avoid circular imports with llm_usage ORM model
    await db.execute(
        __import__("sqlalchemy").text(
            "INSERT INTO llm_usage (session_id, user_id, provider, model, "
            "input_tokens, output_tokens, cost_eur) "
            "VALUES (:sid, :uid, :provider, :model, :inp, :out, :cost)"
        ),
        {
            "sid": session.id,
            "uid": session.user_id,
            "provider": "claude",
            "model": MODEL,
            "inp": input_tokens,
            "out": output_tokens,
            "cost": float(cost),
        },
    )
    await db.commit()
