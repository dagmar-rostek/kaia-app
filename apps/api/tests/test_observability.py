"""Tests for observability utilities — logging, sentry, slack."""

from unittest.mock import patch

from app.observability.logging import configure_logging
from app.observability.sentry import init_sentry


def test_configure_logging_json_mode():
    configure_logging(debug=False)  # covers the structlog.configure() call


def test_configure_logging_debug_mode():
    configure_logging(debug=True)  # covers the ConsoleRenderer branch


def test_init_sentry_noop_when_no_dsn():
    with patch("app.observability.sentry.settings") as mock_settings:
        mock_settings.sentry_kaia_api = None
        init_sentry()  # should return early — lines 9-10


def test_init_sentry_initializes_when_dsn_set():
    with patch("app.observability.sentry.settings") as mock_settings:
        mock_settings.sentry_kaia_api = "https://fake@sentry.io/1"
        mock_settings.debug = False
        with patch("sentry_sdk.init") as mock_init:
            init_sentry()  # covers lines 11-15
    mock_init.assert_called_once()
    call_kwargs = mock_init.call_args.kwargs
    assert call_kwargs["dsn"] == "https://fake@sentry.io/1"
    assert call_kwargs["environment"] == "production"


def test_init_sentry_debug_environment():
    with patch("app.observability.sentry.settings") as mock_settings:
        mock_settings.sentry_kaia_api = "https://fake@sentry.io/2"
        mock_settings.debug = True
        with patch("sentry_sdk.init") as mock_init:
            init_sentry()
    assert mock_init.call_args.kwargs["environment"] == "development"


def test_slack_module_imports():
    """Ensure slack module loads without errors."""
    from app.observability import slack  # noqa: F401

    assert hasattr(slack, "notify")
