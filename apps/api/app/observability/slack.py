import httpx
import structlog

from app.core.config import settings

log = structlog.get_logger()


async def notify(text: str, emoji: str = "📡") -> None:
    """Fire-and-forget Slack notification."""
    if not settings.slack_webhook_url:
        return
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                settings.slack_webhook_url,
                json={"text": f"{emoji} {text}"},
            )
    except Exception:
        log.warning("slack_notification_failed", text=text)
