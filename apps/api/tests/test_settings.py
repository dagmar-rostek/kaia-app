"""Tests for admin settings routes — model selection and API key filtering."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.domains.settings.routes import _available_models

# ── _available_models ─────────────────────────────────────────────────────────


def test_available_models_openai_only() -> None:
    from app.core.config import settings as cfg

    with (
        patch.object(cfg, "openai_api_key", "sk-test"),
        patch.object(cfg, "anthropic_api_key", None),
        patch.object(cfg, "mistral_api_key", None),
    ):
        models = _available_models()

    assert len(models) > 0
    assert all(m["provider"] == "openai" for m in models)
    assert any(m["id"] == "gpt-4.1-mini" for m in models)


def test_available_models_empty_when_no_keys() -> None:
    from app.core.config import settings as cfg

    with (
        patch.object(cfg, "openai_api_key", None),
        patch.object(cfg, "anthropic_api_key", None),
        patch.object(cfg, "mistral_api_key", None),
    ):
        models = _available_models()

    assert models == []


def test_available_models_all_providers() -> None:
    from app.core.config import settings as cfg

    with (
        patch.object(cfg, "openai_api_key", "sk-test"),
        patch.object(cfg, "anthropic_api_key", "sk-ant-test"),
        patch.object(cfg, "mistral_api_key", "mistral-key"),
    ):
        models = _available_models()

    providers = {m["provider"] for m in models}
    assert providers == {"openai", "anthropic", "mistral"}


def test_available_models_anthropic_only() -> None:
    from app.core.config import settings as cfg

    with (
        patch.object(cfg, "openai_api_key", None),
        patch.object(cfg, "anthropic_api_key", "sk-ant-test"),
        patch.object(cfg, "mistral_api_key", None),
    ):
        models = _available_models()

    assert all(m["provider"] == "anthropic" for m in models)


# ── get_settings endpoint ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_settings_returns_model_and_list() -> None:
    from app.domains.settings.routes import get_settings

    available = [{"id": "gpt-4.1-mini"}]
    with (
        patch("app.domains.settings.routes.get_model", return_value="gpt-4.1-mini"),
        patch("app.domains.settings.routes._available_models", return_value=available),
    ):
        result = await get_settings(None)  # type: ignore[arg-type]

    assert result["kaia_chat_model"] == "gpt-4.1-mini"
    assert result["available_models"] == [{"id": "gpt-4.1-mini"}]


# ── update_settings endpoint ──────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_update_settings_invalid_model_raises_400() -> None:
    from app.domains.settings.routes import SettingsUpdate, update_settings

    with pytest.raises(HTTPException) as exc:
        await update_settings(SettingsUpdate(kaia_chat_model="does-not-exist"), None)  # type: ignore[arg-type]

    assert exc.value.status_code == 400
    assert "Unbekanntes Modell" in exc.value.detail


@pytest.mark.asyncio
async def test_update_settings_valid_model_persists() -> None:
    from app.domains.settings.routes import SettingsUpdate, update_settings

    mock_repo = AsyncMock()
    mock_repo.set = AsyncMock()

    mock_ctx = MagicMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=AsyncMock())
    mock_ctx.__aexit__ = AsyncMock(return_value=None)

    with (
        patch("app.domains.settings.routes.set_model_override") as mock_set,
        patch("app.domains.settings.routes.AsyncSessionLocal", return_value=mock_ctx),
        patch("app.domains.settings.routes.SystemSettingsRepository", return_value=mock_repo),
        patch("app.domains.settings.routes.get_model", return_value="gpt-4.1-mini"),
    ):
        result = await update_settings(SettingsUpdate(kaia_chat_model="gpt-4.1-mini"), None)  # type: ignore[arg-type]

    mock_set.assert_called_once_with("gpt-4.1-mini")
    assert result == {"kaia_chat_model": "gpt-4.1-mini"}
