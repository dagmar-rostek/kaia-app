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

    # Observability
    sentry_kaia_api: str = ""
    slack_webhook_url: str = ""

    # Admin
    admin_password: str = "changeme"  # noqa: S105

    # Studie
    study_mode: StudyMode = StudyMode.DEVELOPMENT


settings = Settings()
