from enum import StrEnum

from pydantic_settings import BaseSettings, SettingsConfigDict


class StudyMode(StrEnum):
    DEVELOPMENT = "development"
    PILOT = "pilot"
    LOCKED = "locked"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_name: str = "KAIA API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+psycopg://kaia:changeme@localhost:5432/kaia"

    # Auth
    jwt_secret: str = "changeme-min-32-chars-long-random-string"  # noqa: S105
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # LLM
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    mistral_api_key: str = ""
    kaia_chat_model: str = "claude-sonnet-4-6"

    # Observability
    sentry_kaia_api: str = ""
    slack_webhook_url: str = ""

    # Admin
    admin_password: str = "changeme"  # noqa: S105

    # E-Mail (Brevo SMTP)
    smtp_host: str = "smtp-relay.brevo.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""  # noqa: S105
    smtp_from: str = "noreply@kaia.rostek-dagmar.eu"
    admin_email: str = "dagmar@ecoaching-rostek.de"

    # Voranmeldung
    max_preregistrations: int = 25

    # Studie
    study_mode: StudyMode = StudyMode.DEVELOPMENT
    max_cost_per_user_eur: float = 5.0  # überschreibbar via MAX_COST_PER_USER_EUR in .env


settings = Settings()
