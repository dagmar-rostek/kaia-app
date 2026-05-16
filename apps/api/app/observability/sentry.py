import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings


def init_sentry() -> None:
    if not settings.sentry_dsn_api:
        return
    sentry_sdk.init(
        dsn=settings.sentry_dsn_api,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.2,
        environment="production" if not settings.debug else "development",
        send_default_pii=False,
    )
