"""Simple SMTP email helper (sync wrapped in executor)."""

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import structlog

from app.core.config import settings

log = structlog.get_logger()


def _send_sync(to: str, subject: str, html: str, text: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"KAIA <{settings.smtp_from}>"
    msg["To"]      = to
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as s:
        s.starttls()
        s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(msg)


async def send_email(to: str, subject: str, html: str, text: str = "") -> None:
    """Fire-and-forget async email via Brevo SMTP."""
    if not settings.smtp_user or not settings.smtp_password:
        log.warning("email_skipped_no_credentials", to=to, subject=subject)
        return
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_sync, to, subject, html, text or subject)
        log.info("email_sent", to=to, subject=subject)
    except Exception as exc:
        log.warning("email_failed", to=to, subject=subject, error=str(exc))
