"""E-Mail-Vorlagen für User-Lifecycle (Registrierung, Freischaltung, Studienstart)."""

from app.core.config import settings
from app.observability.email import send_email

BASE_URL = "https://kaia.rostek-dagmar.eu"


def _registration_html(username: str, email: str) -> str:
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Anmeldung eingegangen ✓
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {username},<br><br>
    deine Registrierung für die KAIA-Pilotstudie ist eingegangen.
    Dagmar prüft deine Anmeldung und schaltet deinen Account manuell frei —
    das dauert meistens nicht lange.
  </p>
  <p style="color: #555; line-height: 1.6;">
    Sobald es losgeht, bekommst du eine weitere E-Mail an <strong>{email}</strong>.
  </p>
  <p style="color: #555; line-height: 1.6;">
    Bis dahin: danke für dein Interesse. Du hilfst mit, eine Idee in echte Erkenntnis zu verwandeln.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Fragen? <a href="mailto:{settings.admin_email}" style="color: #999;">{settings.admin_email}</a>
  </p>
</div>
"""


def _approval_html(username: str) -> str:
    login_url = f"{BASE_URL}/login"
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Dein Account ist freigeschaltet 🎉
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {username},<br><br>
    dein KAIA-Account ist jetzt aktiv. Du kannst dich ab sofort einloggen und mit deiner
    ersten Session starten.
  </p>
  <div style="margin: 28px 0;">
    <a href="{login_url}"
       style="display: inline-block; background: #1a1a1a; color: #fff;
              text-decoration: none; padding: 12px 28px; border-radius: 8px;
              font-size: 14px; font-weight: 600;">
      Jetzt einloggen →
    </a>
  </div>
  <p style="color: #555; line-height: 1.6; font-size: 13px;">
    Die Studie läuft über <strong>4 Wochen</strong> mit mindestens
    <strong>3 Sessions</strong>. Du kannst selbst bestimmen, wann du startest —
    am besten bald, damit du alle Sessions entspannt verteilen kannst.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Fragen? <a href="mailto:{settings.admin_email}" style="color: #999;">{settings.admin_email}</a>
  </p>
</div>
"""


def _study_start_html(username: str) -> str:
    login_url = f"{BASE_URL}/login"
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Die Studie startet — KAIA wartet auf dich 🚀
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {username},<br><br>
    es ist so weit: die KAIA-Pilotstudie hat offiziell begonnen.
    Melde dich jetzt an und starte deine erste Session.
  </p>
  <p style="color: #555; line-height: 1.6;">
    <strong>Was dich erwartet:</strong><br>
    Mindestens 3 Gespräche mit KAIA über 4 Wochen — rund um das Thema,
    das du bei der Registrierung angegeben hast. Davor und danach ein kurzer Fragebogen.
    Das war's.
  </p>
  <div style="margin: 28px 0;">
    <a href="{login_url}"
       style="display: inline-block; background: #1a1a1a; color: #fff;
              text-decoration: none; padding: 12px 28px; border-radius: 8px;
              font-size: 14px; font-weight: 600;">
      Zur ersten Session →
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Fragen? <a href="mailto:{settings.admin_email}" style="color: #999;">{settings.admin_email}</a>
  </p>
</div>
"""


async def send_registration_confirmation(username: str, email: str) -> None:
    await send_email(
        to=email,
        subject="KAIA — Anmeldung eingegangen ✓",
        html=_registration_html(username, email),
        text=(
            f"Hallo {username}, deine Registrierung ist eingegangen."
            " Du bekommst eine weitere E-Mail sobald dein Account freigeschaltet ist."
        ),
    )


async def send_account_approved(username: str, email: str) -> None:
    await send_email(
        to=email,
        subject="KAIA — Dein Account ist freigeschaltet 🎉",
        html=_approval_html(username),
        text=(
            f"Hallo {username}, dein KAIA-Account ist jetzt aktiv."
            f" Meld dich an unter {BASE_URL}/login"
        ),
    )


def _password_reset_html(username: str, reset_url: str) -> str:
    return f"""
<div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Passwort zurücksetzen
  </h2>
  <p style="color: #555; line-height: 1.6;">
    Hallo {username},<br><br>
    du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.
    Klicke auf den Button, um ein neues Passwort zu vergeben.
    Der Link ist <strong>1 Stunde</strong> gültig.
  </p>
  <div style="margin: 28px 0;">
    <a href="{reset_url}"
       style="display: inline-block; background: #1a1a1a; color: #fff;
              text-decoration: none; padding: 12px 28px; border-radius: 8px;
              font-size: 14px; font-weight: 600;">
      Passwort zurücksetzen →
    </a>
  </div>
  <p style="color: #999; font-size: 13px; line-height: 1.6;">
    Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.
    Dein Passwort bleibt unverändert.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 12px; color: #999;">
    Fragen? <a href="mailto:{settings.admin_email}" style="color: #999;">{settings.admin_email}</a>
  </p>
</div>
"""


async def send_password_reset(username: str, email: str, raw_token: str) -> None:
    reset_url = f"{BASE_URL}/passwort-reset/{raw_token}"
    await send_email(
        to=email,
        subject="KAIA — Passwort zurücksetzen",
        html=_password_reset_html(username, reset_url),
        text=(
            f"Hallo {username}, setze dein Passwort zurück: {reset_url}\n"
            "Der Link ist 1 Stunde gültig."
        ),
    )


async def send_study_start(username: str, email: str) -> None:
    await send_email(
        to=email,
        subject="KAIA — Die Studie startet 🚀",
        html=_study_start_html(username),
        text=(
            f"Hallo {username}, die KAIA-Pilotstudie hat begonnen."
            f" Starte jetzt deine erste Session: {BASE_URL}/login"
        ),
    )
