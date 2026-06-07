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

import json
import re
from collections.abc import AsyncGenerator
from decimal import Decimal

import structlog
from anthropic import AsyncAnthropic
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.crisis import CRISIS_RESPONSE, is_crisis
from app.domains.chat.models import ChatSession, MessageRole
from app.domains.chat.repository import ChatRepository
from app.domains.prompts.models import CharacterMode
from app.domains.prompts.repository import get_active_template
from app.domains.prompts.service import PromptContext, render_prompt

log = structlog.get_logger()

# ── Constants ──────────────────────────────────────────────────────────────────

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 600  # thinking (~200) + final_answer (~150) + buffer

# Cost per token in EUR (approximate, claude-sonnet-4-6)
COST_INPUT_PER_TOKEN = Decimal("0.0000027")  # ~$3/MTok → ~€2.8/MTok
COST_OUTPUT_PER_TOKEN = Decimal("0.000013")  # ~$15/MTok → ~€13.8/MTok

# ── SSE event helpers ──────────────────────────────────────────────────────────


def _sse(data: dict) -> str:
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


# ── Thinking-strip ────────────────────────────────────────────────────────────


def _thinking_strip_generator(raw_chunks: list[str]) -> str:
    """Strip <thinking> blocks and extract <final_answer> from collected chunks."""
    full = "".join(raw_chunks)
    # Remove thinking block
    full = re.sub(r"<thinking>[\s\S]*?</thinking>", "", full, flags=re.DOTALL)
    # Extract final_answer if present
    m = re.search(r"<final_answer>([\s\S]*?)</final_answer>", full, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback: return stripped content without tags
    return full.replace("<final_answer>", "").replace("</final_answer>", "").strip()


# ── Main streaming generator ───────────────────────────────────────────────────


async def stream_response(
    db: AsyncSession,
    session: ChatSession,
    user_content: str,
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

    is_first = session.session_number == 1
    last_step = ""
    last_observation = ""
    outcome = ""

    if not is_first:
        prev = await repo.get_previous_session(session.user_id, session.id)
        if prev and prev.session_summary:
            try:
                summary = json.loads(prev.session_summary)
                last_step = summary.get("first_step", "")
                last_observation = summary.get("observation", "")
            except (json.JSONDecodeError, AttributeError):
                pass

    if session.active_goal_id:
        # Could load goal title from DB — skip for now, daily_plan covers it
        outcome = session.daily_plan or ""
    else:
        outcome = session.daily_plan or ""

    ctx = PromptContext(
        user_name=user_name,
        is_first_session=is_first,
        last_first_step=last_step,
        last_session_observation=last_observation,
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
        {"role": m.role.value, "content": m.content}
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
            messages=api_messages,
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
    final_content = _thinking_strip_generator(raw_chunks)

    if not final_content:
        final_content = "Ich bin einen Moment nicht sicher. Magst du das nochmal sagen?"

    # 8. Stream the final answer to the client
    yield _delta(final_content)

    # 9. Persist assistant message
    assistant_msg = await repo.save_message(
        session.id,
        MessageRole.ASSISTANT,
        final_content,
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
