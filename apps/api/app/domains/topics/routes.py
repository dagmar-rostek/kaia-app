import structlog
from fastapi import APIRouter, HTTPException, Request, status

from app.domains.topics.schemas import TopicEvalRequest, TopicEvalResponse
from app.domains.topics.service import check_and_record_rate_limit, evaluate_topic

log = structlog.get_logger()

router = APIRouter(prefix="/topics", tags=["topics"])


def _rate_limit_key(request: Request) -> str:
    """IP aus X-Forwarded-For (Caddy-Proxy) oder direkter Client-IP."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/evaluate",
    response_model=TopicEvalResponse,
    summary="Lernthema auf Knowing-Doing-Gap evaluieren",
)
async def evaluate(body: TopicEvalRequest, request: Request) -> TopicEvalResponse:
    """Bewertet ein Lernthema daraufhin, ob es zum KAIA-Ansatz passt.

    Keine Authentifizierung erforderlich — wird sowohl in der Registrierung
    als auch im Onboarding verwendet.

    Rate Limit: 5 Anfragen / IP / Stunde.
    Kein personenbezogener Datensatz wird gespeichert.
    """
    key = _rate_limit_key(request)
    if not check_and_record_rate_limit(key):
        log.warning("topic_eval_rate_limit", key=key[:40])
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Zu viele Anfragen. Bitte warte eine Stunde.",
        )

    try:
        return await evaluate_topic(body.topic)
    except Exception as exc:
        log.exception("topic_eval_error", topic=body.topic[:80], error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Bewertung momentan nicht verfügbar. Du kannst trotzdem weitermachen.",
        ) from exc
