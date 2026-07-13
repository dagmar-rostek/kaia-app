from app.core.config import settings
from app.observability.email import send_email
from app.observability.slack import notify

BASE_URL = "https://kaia.rostek-dagmar.eu"


def _confirmation_html(name: str, unsubscribe_token: str) -> str:
    unsubscribe_url = f"{BASE_URL}/vorregistrierung/abgemeldet?token={unsubscribe_token}"
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Du bist auf der Liste. 🎉
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {name},<br><br>
    du hast dich für die KAIA-Pilotstudie vorregistriert.
    Sobald die Studie am <strong>1. August 2026</strong> startet,
    bekommst du eine E-Mail mit allem was du wissen musst.
  </p>
  <p style="color: #555; line-height: 1.6;">
    Bis dahin: danke. Wirklich.
    Du hilfst mit, eine Idee in echte Erkenntnis zu verwandeln.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Du möchtest dich wieder abmelden?
    <a href="{unsubscribe_url}" style="color: #999;">Hier klicken</a>.
    Kein Drama, kein schlechtes Gewissen.
  </p>
</div>
"""


def _removal_html(name: str) -> str:
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Du bist von der Liste entfernt worden.
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {name},<br><br>
    deine Voranmeldung für die KAIA-Pilotstudie wurde entfernt.
    Du erhältst keine weiteren Nachrichten zur Studie.
  </p>
  <p style="color: #555; line-height: 1.6;">
    Falls das ein Fehler war oder du Fragen hast:
    <a href="mailto:{settings.admin_email}">{settings.admin_email}</a>
  </p>
</div>
"""


async def send_confirmation(name: str, email: str, unsubscribe_token: str) -> None:
    await send_email(
        to=email,
        subject="Du bist auf der KAIA-Liste 🎉",
        html=_confirmation_html(name, unsubscribe_token),
        text=f"Hallo {name}, du bist vorregistriert! Wir melden uns am 1. August 2026.",
    )


async def send_removal(name: str, email: str) -> None:
    await send_email(
        to=email,
        subject="KAIA — du wurdest von der Voranmeldeliste entfernt",
        html=_removal_html(name),
        text=f"Hallo {name}, deine Voranmeldung wurde entfernt.",
    )


async def notify_dagmar(name: str, email: str, reason: str, total: int) -> None:
    await notify(
        f"🙋 Neue Voranmeldung ({total}/{settings.max_preregistrations})\n"
        f"*{name}* ({email})\n"
        f"> {reason}",
        emoji="",
    )
