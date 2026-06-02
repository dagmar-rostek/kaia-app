from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_notify_skips_without_webhook(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.slack_webhook_url", None)
    from app.observability.slack import notify

    await notify("test message")  # must not raise


@pytest.mark.asyncio
async def test_notify_sends_post_when_webhook_set(monkeypatch):
    monkeypatch.setattr(
        "app.core.config.settings.slack_webhook_url", "https://hooks.slack.com/test"
    )
    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(return_value=MagicMock())

    with patch("httpx.AsyncClient", return_value=mock_client):
        from app.observability.slack import notify

        await notify("hello", emoji="🧪")

    mock_client.post.assert_called_once()
    call_kwargs = mock_client.post.call_args
    assert "🧪 hello" in call_kwargs.kwargs["json"]["text"]


@pytest.mark.asyncio
async def test_notify_silences_exceptions(monkeypatch):
    monkeypatch.setattr(
        "app.core.config.settings.slack_webhook_url", "https://hooks.slack.com/test"
    )
    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.post = AsyncMock(side_effect=Exception("network down"))

    with patch("httpx.AsyncClient", return_value=mock_client):
        from app.observability.slack import notify

        await notify("error test")  # must not raise
