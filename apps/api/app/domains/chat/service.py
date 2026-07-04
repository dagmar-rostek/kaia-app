"""Chat service — LLM streaming orchestration for KAIA.

Architecture:
  User input
    → Crisis detection (sync, pre-LLM)
    → Prompt rendering (Jinja2 + session context)
    → Claude API (streaming)
    → Thinking strip → SSE delta stream → client
    → Persist messages + log usage

SSE helpers and thinking-strip live in sse.py.
Session summary extraction and cross-session memory live in summary.py.
"""

from collections.abc import AsyncGenerator
from decimal import Decimal

import structlog
from anthropic import AsyncAnthropic
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.crisis import CRISIS_RESPONSE
from app.core.crisis import detect_crisis as is_crisis
from app.domains.chat.models import ChatSession, MessageRole
from app.domains.chat.repository import ChatRepository
from app.domains.chat.sse import (
    COST_INPUT_PER_TOKEN,
    COST_OUTPUT_PER_TOKEN,
    MAX_TOKENS,
    MODEL,
    delta,
    done,
    error,
    thinking_event,
    thinking_strip,
)
from app.domains.chat.summary import load_cross_session_context
from app.domains.prompts.models import CharacterMode
from app.domains.prompts.repository import get_active_template
from app.domains.prompts.service import PromptContext, render_prompt

log = structlog.get_logger()

# ── Trigger constants ─────────────────────────────────────────────────────────

CLOSING_TRIGGER = (
    "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
    "Keine Bewertung, kein Lob, keine Zusammenfassung. "
    "Eine kurze, offene Frage die den eigenen Gedanken des Lernenden weitertragen lässt. "
    "Maximal zwei Sätze.]"
)

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

# ── Shared prompt builder ─────────────────────────────────────────────────────


async def _build_system_prompt(
    db: AsyncSession,
    repo: ChatRepository,
    session: ChatSession,
    include_cross_session: bool = True,
) -> str:
    """Load user, optionally fetch cross-session context, render system prompt."""
    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    last_step, last_observation, insight = ("", "", "")
    if include_cross_session and not is_first:
        last_step, last_observation, insight = await load_cross_session_context(
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
    return render_prompt(raw_template, ctx)


# ── Streaming generators ──────────────────────────────────────────────────────


async def stream_response(
    db: AsyncSession,
    session: ChatSession,
    user_content: str,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Core SSE generator: crisis check → prompt → LLM → strip → persist → log."""
    repo = ChatRepository(db)

    if is_crisis(user_content):
        await repo.save_message(session.id, MessageRole.USER, user_content)
        assistant_msg = await repo.save_message(session.id, MessageRole.ASSISTANT, CRISIS_RESPONSE)
        yield delta(CRISIS_RESPONSE)
        yield done(assistant_msg.id, 0, 0)
        return

    await repo.save_message(session.id, MessageRole.USER, user_content)
    system_prompt = await _build_system_prompt(db, repo, session)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = output_tokens = 0

    try:
        async with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=api_messages,  # type: ignore[arg-type]
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens
    except Exception as exc:
        log.error("llm_stream_error", error=str(exc), session_id=session.id)
        yield error("KAIA ist gerade nicht erreichbar. Bitte versuche es in einem Moment erneut.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Ich bin einen Moment nicht sicher. Magst du das nochmal sagen?"

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(db, session, input_tokens, output_tokens)
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info(
        "llm_response_complete",
        session_id=session.id,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )


async def stream_opening(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's opening message for a fresh session (no user message stored)."""
    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session)
    trigger = "[Gesprächsstart — stelle deine Eröffnungsfrage.]"

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = output_tokens = 0

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
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Hallo! Womit darf ich dich heute begleiten?"

    yield delta(final_content)
    try:
        assistant_msg = await repo.save_message(
            session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
        )
    except IntegrityError:
        log.warning("llm_opening_session_gone", session_id=session.id)
        return
    await _log_usage(db, session, input_tokens, output_tokens)
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_opening_complete", session_id=session.id)


async def stream_closing(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's closing question — full history + closing trigger sent to LLM."""
    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": CLOSING_TRIGGER})

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = output_tokens = 0

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
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Was möchtest du aus diesem Gespräch mitnehmen?"

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(db, session, input_tokens, output_tokens)
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_closing_complete", session_id=session.id)


async def stream_meta_question(
    db: AsyncSession,
    session: ChatSession,
    feedback_type: str,
    debug: bool = False,
) -> AsyncGenerator[str, None]:
    """SSE stream of KAIA's meta-cognitive reaction to a stuck/unclear signal."""
    trigger = META_TRIGGERS.get(feedback_type)
    if not trigger:
        yield error(f"Unbekannter feedback_type: {feedback_type}")
        return

    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session, include_cross_session=False)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": trigger})

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    raw_chunks: list[str] = []
    input_tokens = output_tokens = 0

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
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    fallbacks = {
        "stuck": "Was genau macht es gerade schwierig?",
        "unclear": "Welcher Teil ist noch nicht klar?",
    }
    if not final_content:
        final_content = fallbacks[feedback_type]

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(db, session, input_tokens, output_tokens)
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_meta_complete", session_id=session.id, feedback_type=feedback_type)


# ── Usage logging ─────────────────────────────────────────────────────────────


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
