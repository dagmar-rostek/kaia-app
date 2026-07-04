"""Tests for chat domain — repository, schemas, and service helpers.

Coverage targets:
  - chat/repository.py   all methods with mocked DB
  - chat/schemas.py      validator edge cases
  - chat/sse.py          SSE helpers and thinking-strip
  - chat/service.py      stream_closing, stream_meta_question
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pydantic import ValidationError

from app.domains.chat.models import FeedbackType, MessageRole
from app.domains.chat.repository import ChatRepository
from app.domains.chat.schemas import FeedbackCreate, MessageCreate, SessionCreate
from app.domains.chat.service import stream_closing, stream_meta_question
from app.domains.chat.sse import delta, done, error, thinking_event, thinking_strip

# Shorter prefix for patch() calls inside service.py
_SVC = "app.domains.chat.service"

# ── Helpers ───────────────────────────────────────────────────────────────────


async def _collect(gen) -> list[str]:
    """Drain an async generator into a list."""
    result = []
    async for item in gen:
        result.append(item)
    return result


class _MockStream:
    """Minimal mock for anthropic.messages.stream() context manager."""

    def __init__(
        self,
        text_chunks: list[str],
        input_tokens: int = 10,
        output_tokens: int = 20,
    ):
        self._chunks = text_chunks
        self._input_tokens = input_tokens
        self._output_tokens = output_tokens

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    @property
    def text_stream(self):
        async def _gen():
            for c in self._chunks:
                yield c

        return _gen()

    async def get_final_message(self):
        msg = MagicMock()
        msg.usage.input_tokens = self._input_tokens
        msg.usage.output_tokens = self._output_tokens
        return msg


def _mock_result(*, scalar_one=0, scalar_one_or_none=None, all_items=None):
    result = MagicMock()
    result.scalar_one.return_value = scalar_one
    result.scalar_one_or_none.return_value = scalar_one_or_none
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = all_items or []
    result.scalars.return_value = scalars_mock
    return result


@pytest.fixture
def db():
    session = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def mock_session():
    s = MagicMock()
    s.id = 1
    s.user_id = 1
    s.character = "warm"
    s.session_number = 1
    s.daily_plan = None
    s.ended_at = None
    return s


# ── chat/schemas.py ────────────────────────────────────────────────────────────


def test_session_create_invalid_character():
    with pytest.raises(ValidationError):
        SessionCreate(character="unknown")


def test_session_create_valid():
    s = SessionCreate(character="warm")
    assert s.character == "warm"


def test_message_create_empty_raises():
    with pytest.raises(ValidationError):
        MessageCreate(content="   ")


def test_message_create_too_long_raises():
    with pytest.raises(ValidationError):
        MessageCreate(content="x" * 4001)


def test_message_create_ok():
    m = MessageCreate(content="Hallo KAIA")
    assert m.content == "Hallo KAIA"


def test_feedback_create_invalid_type():
    with pytest.raises(ValidationError):
        FeedbackCreate(feedback_type="unknown")


def test_feedback_create_valid_transfer_marker():
    f = FeedbackCreate(feedback_type="transfer_marker", message_id=42)
    assert f.feedback_type == "transfer_marker"
    assert f.message_id == 42


def test_feedback_create_valid_stuck():
    f = FeedbackCreate(feedback_type="stuck")
    assert f.feedback_type == "stuck"
    assert f.message_id is None


# ── FeedbackType enum ──────────────────────────────────────────────────────────


def test_feedback_type_values():
    assert FeedbackType.TRANSFER_MARKER == "transfer_marker"
    assert FeedbackType.WOW == "wow"
    assert FeedbackType.STUCK == "stuck"
    assert FeedbackType.UNCLEAR == "unclear"


# ── chat/sse.py — SSE helpers ─────────────────────────────────────────────────


def test_delta_format():
    result = delta("Hallo")
    assert '"type": "delta"' in result
    assert '"content": "Hallo"' in result
    assert result.startswith("data: ")
    assert result.endswith("\n\n")


def test_error_format():
    result = error("Verbindungsfehler")
    assert '"type": "error"' in result
    assert "Verbindungsfehler" in result


def test_done_format():
    result = done(message_id=7, input_tokens=100, output_tokens=50)
    assert '"type": "done"' in result
    assert '"message_id": 7' in result
    assert '"input_tokens": 100' in result
    assert '"output_tokens": 50' in result


def test_thinking_event_format():
    result = thinking_event("some thought")
    assert '"type": "thinking"' in result
    assert "some thought" in result


# ── chat/sse.py — thinking_strip ──────────────────────────────────────────────


def test_thinking_strip_clean_content():
    t, content = thinking_strip(["Hello world"])
    assert content == "Hello world"
    assert t is None


def test_thinking_strip_removes_thinking_block():
    t, content = thinking_strip(["<thinking>internal thought</thinking>Final answer"])
    assert content == "Final answer"
    assert t == "internal thought"


def test_thinking_strip_extracts_final_answer_tag():
    t, content = thinking_strip(["<final_answer>The real answer</final_answer>"])
    assert content == "The real answer"


def test_thinking_strip_unclosed_thinking():
    t, content = thinking_strip(["<thinking>starts but never closes"])
    assert content == ""


def test_thinking_strip_multi_chunk():
    t, content = thinking_strip(["Hello ", "world"])
    assert content == "Hello world"
    assert t is None


def test_thinking_strip_thinking_with_final_answer():
    chunk = "<thinking>internal</thinking><final_answer>clean answer</final_answer>"
    t, content = thinking_strip([chunk])
    assert t == "internal"
    assert content == "clean answer"


# ── chat/repository.py — all methods ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_count_sessions(db):
    db.execute = AsyncMock(return_value=_mock_result(scalar_one=3))
    repo = ChatRepository(db)
    assert await repo.count_sessions(user_id=1) == 3


@pytest.mark.asyncio
async def test_create_session(db):
    db.execute = AsyncMock(return_value=_mock_result(scalar_one=2))
    repo = ChatRepository(db)
    session = await repo.create_session(user_id=1, character="warm")
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(session)


@pytest.mark.asyncio
async def test_get_session_not_found(db):
    db.execute = AsyncMock(return_value=_mock_result(scalar_one_or_none=None))
    repo = ChatRepository(db)
    assert await repo.get_session(session_id=999, user_id=1) is None


@pytest.mark.asyncio
async def test_get_session_found(db):
    fake = MagicMock()
    db.execute = AsyncMock(return_value=_mock_result(scalar_one_or_none=fake))
    repo = ChatRepository(db)
    assert await repo.get_session(session_id=1, user_id=1) is fake


@pytest.mark.asyncio
async def test_list_sessions_empty(db):
    db.execute = AsyncMock(return_value=_mock_result(all_items=[]))
    repo = ChatRepository(db)
    assert await repo.list_sessions(user_id=1) == []


@pytest.mark.asyncio
async def test_list_sessions_returns_items(db):
    items = [MagicMock(), MagicMock()]
    db.execute = AsyncMock(return_value=_mock_result(all_items=items))
    repo = ChatRepository(db)
    result = await repo.list_sessions(user_id=1)
    assert len(result) == 2


@pytest.mark.asyncio
async def test_get_previous_session_none(db):
    db.execute = AsyncMock(return_value=_mock_result(scalar_one_or_none=None))
    repo = ChatRepository(db)
    assert await repo.get_previous_session(user_id=1, before_id=5) is None


@pytest.mark.asyncio
async def test_end_session_sets_ended_at(db):
    from datetime import UTC

    session = MagicMock()
    session.ended_at = None
    repo = ChatRepository(db)
    await repo.end_session(session)
    assert session.ended_at is not None
    assert session.ended_at.tzinfo == UTC
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_save_message(db):
    repo = ChatRepository(db)
    msg = await repo.save_message(
        session_id=1,
        role=MessageRole.ASSISTANT,
        content="Hallo",
    )
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(msg)


@pytest.mark.asyncio
async def test_get_messages(db):
    items = [MagicMock(), MagicMock()]
    db.execute = AsyncMock(return_value=_mock_result(all_items=items))
    repo = ChatRepository(db)
    result = await repo.get_messages(session_id=1)
    assert len(result) == 2


@pytest.mark.asyncio
async def test_save_feedback(db):
    repo = ChatRepository(db)
    fb = await repo.save_feedback(
        session_id=1,
        user_id=1,
        feedback_type=FeedbackType.WOW,
        message_id=42,
    )
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(fb)


@pytest.mark.asyncio
async def test_save_feedback_no_message_id(db):
    repo = ChatRepository(db)
    await repo.save_feedback(session_id=1, user_id=1, feedback_type=FeedbackType.STUCK)
    db.add.assert_called_once()


@pytest.mark.asyncio
async def test_get_user_found(db):
    user = MagicMock()
    db.execute = AsyncMock(return_value=_mock_result(scalar_one_or_none=user))
    repo = ChatRepository(db)
    assert await repo.get_user(user_id=1) is user


@pytest.mark.asyncio
async def test_get_user_not_found(db):
    db.execute = AsyncMock(return_value=_mock_result(scalar_one_or_none=None))
    repo = ChatRepository(db)
    assert await repo.get_user(user_id=999) is None


# ── chat/service.py — stream_closing ─────────────────────────────────────────


@pytest.mark.asyncio
async def test_stream_closing_happy_path(db, mock_session):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=None)
    mock_repo.get_messages = AsyncMock(
        return_value=[
            MagicMock(role="user", content="Ich lerne Python"),
            MagicMock(role="assistant", content="Was interessiert dich?"),
        ]
    )
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=10))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="sys"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(
            ["Was möchtest ", "du mitnehmen?"]
        )
        events = await _collect(stream_closing(db=db, session=mock_session))

    assert any('"type": "delta"' in e for e in events)
    assert any('"type": "done"' in e for e in events)
    mock_repo.save_message.assert_called_once()


@pytest.mark.asyncio
async def test_stream_closing_first_session_skips_prev_lookup(db, mock_session):
    mock_session.session_number = 1
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=10))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(["Abschlussfrage?"])
        events = await _collect(stream_closing(db=db, session=mock_session))

    mock_repo.get_previous_session.assert_not_called()
    assert any('"type": "done"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_closing_llm_error_yields_error_event(db, mock_session):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=None)
    mock_repo.get_messages = AsyncMock(return_value=[])

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.side_effect = RuntimeError("API down")
        events = await _collect(stream_closing(db=db, session=mock_session))

    assert any('"type": "error"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_closing_empty_content_uses_fallback(db, mock_session):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=None)
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=11))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream([])
        events = await _collect(stream_closing(db=db, session=mock_session))

    delta_events = [e for e in events if '"type": "delta"' in e]
    assert any("mitnehmen" in e for e in delta_events)


# ── chat/service.py — stream_meta_question ───────────────────────────────────


@pytest.mark.asyncio
@pytest.mark.parametrize("feedback_type", ["stuck", "unclear"])
async def test_stream_meta_question_happy_path(db, mock_session, feedback_type):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=20))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(["Meta-Frage?"])
        events = await _collect(
            stream_meta_question(db=db, session=mock_session, feedback_type=feedback_type)
        )

    assert any('"type": "delta"' in e for e in events)
    assert any('"type": "done"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_meta_question_unknown_type_yields_error(db, mock_session):
    events = await _collect(
        stream_meta_question(db=db, session=mock_session, feedback_type="bogus")
    )
    assert any('"type": "error"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_meta_question_llm_error(db, mock_session):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_messages = AsyncMock(return_value=[])

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.side_effect = RuntimeError("timeout")
        events = await _collect(
            stream_meta_question(db=db, session=mock_session, feedback_type="stuck")
        )

    assert any('"type": "error"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_meta_question_empty_content_uses_fallback(db, mock_session):
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=21))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream([])
        events = await _collect(
            stream_meta_question(db=db, session=mock_session, feedback_type="unclear")
        )

    delta_events = [e for e in events if '"type": "delta"' in e]
    assert len(delta_events) > 0  # fallback was yielded


@pytest.mark.asyncio
async def test_stream_closing_debug_emits_thinking_event(db, mock_session):
    """debug=True + thinking block → a thinking event is yielded before the delta."""
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=None)
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=99))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(
            ["<thinking>hidden thought</thinking>Answer"]
        )
        events = await _collect(stream_closing(db=db, session=mock_session, debug=True))

    assert any('"type": "thinking"' in e for e in events)
    assert any('"type": "delta"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_meta_question_debug_emits_thinking_event(db, mock_session):
    """debug=True + thinking block → a thinking event is yielded."""
    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=98))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(
            ["<thinking>thought</thinking>Meta-Frage?"]
        )
        events = await _collect(
            stream_meta_question(db=db, session=mock_session, feedback_type="stuck", debug=True)
        )

    assert any('"type": "thinking"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_closing_malformed_summary_json_ignored(db, mock_session):
    """Malformed session_summary JSON is silently swallowed — no crash."""
    mock_session.session_number = 2
    prev = MagicMock()
    prev.session_summary = "{ not valid json"

    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=prev)
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=97))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(["Frage?"])
        events = await _collect(stream_closing(db=db, session=mock_session))

    assert any('"type": "done"' in e for e in events)


@pytest.mark.asyncio
async def test_stream_closing_previous_session_summary_parsed(db, mock_session):
    """Session 2+: previous session summary is loaded and used in context."""
    mock_session.session_number = 2
    prev = MagicMock()
    prev.session_summary = (
        '{"first_step": "step1", "observation": "obs1", "insight_for_next_session": "carry"}'
    )

    mock_repo = AsyncMock()
    mock_repo.get_user = AsyncMock(return_value=MagicMock(username="ada"))
    mock_repo.get_previous_session = AsyncMock(return_value=prev)
    mock_repo.get_messages = AsyncMock(return_value=[])
    mock_repo.save_message = AsyncMock(return_value=MagicMock(id=30))

    with (
        patch(f"{_SVC}.ChatRepository", return_value=mock_repo),
        patch(f"{_SVC}.get_active_template", new_callable=AsyncMock, return_value="t"),
        patch(f"{_SVC}.render_prompt", return_value="s"),
        patch(f"{_SVC}._log_usage", new_callable=AsyncMock),
        patch(f"{_SVC}.AsyncAnthropic") as mock_client,
    ):
        mock_client.return_value.messages.stream.return_value = _MockStream(["Frage?"])
        events = await _collect(stream_closing(db=db, session=mock_session))

    mock_repo.get_previous_session.assert_called_once()
    assert any('"type": "done"' in e for e in events)
