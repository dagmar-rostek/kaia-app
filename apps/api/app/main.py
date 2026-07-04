import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import v1_router
from app.core.config import settings

# Ensure all ORM models are in the SQLAlchemy mapper before FK resolution.
# Domains covered by their routes (chat, users, preregistration, prompts) are
# already registered; the remaining domains need an explicit import here.
from app.domains.eval import models as _eval_models  # noqa: F401
from app.domains.roadmap import models as _roadmap_models  # noqa: F401
from app.domains.survey import models as _survey_models  # noqa: F401
from app.observability.logging import configure_logging
from app.observability.sentry import init_sentry

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    configure_logging(debug=settings.debug)
    init_sentry()
    log.info("kaia_api_started", study_mode=settings.study_mode)
    yield
    log.info("kaia_api_stopped")


app = FastAPI(
    title="KAIA API",
    version="0.1.0",
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kaia.rostek-dagmar.eu", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def attach_request_id(request: Request, call_next: Any) -> Any:
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Accel-Buffering"] = "no"
    structlog.contextvars.clear_contextvars()
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    log.exception("unhandled_exception", path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Interner Serverfehler."})


app.include_router(v1_router)
