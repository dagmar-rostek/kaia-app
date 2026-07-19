"""Admin Settings API — GET/PUT /api/v1/admin/settings.

Erlaubt das Wechseln des KAIA-Chat-Modells ohne Server-Neustart.
Änderung wird sowohl in-memory (sofort wirksam) als auch in DB (restart-sicher) gespeichert.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.deps import require_admin
from app.db.session import AsyncSessionLocal
from app.domains.chat.sse import get_model, set_model_override
from app.domains.settings.repository import SystemSettingsRepository

router = APIRouter(
    prefix="/admin/settings",
    tags=["settings"],
    dependencies=[Depends(require_admin)],
)

# ── Verfügbare Modelle ────────────────────────────────────────────────────────

_ALL_MODELS = [
    {"id": "claude-sonnet-5", "label": "Claude Sonnet 5", "provider": "anthropic"},
    {"id": "claude-sonnet-4-6", "label": "Claude Sonnet 4.6", "provider": "anthropic"},
    {"id": "claude-haiku-4-5-20251001", "label": "Claude Haiku 4.5", "provider": "anthropic"},
    {"id": "gpt-5.6-terra", "label": "GPT-5.6 Terra", "provider": "openai"},
    {"id": "gpt-4.1-mini", "label": "GPT-4.1 mini", "provider": "openai"},
    {"id": "gpt-4o", "label": "GPT-4o (Legacy)", "provider": "openai"},
    {"id": "gpt-4o-mini", "label": "GPT-4o mini (Legacy)", "provider": "openai"},
    {"id": "mistral-large-latest", "label": "Mistral Large", "provider": "mistral"},
    {"id": "mistral-small-latest", "label": "Mistral Small", "provider": "mistral"},
]


def _available_models() -> list[dict[str, str]]:
    result = []
    for m in _ALL_MODELS:
        if m["provider"] == "anthropic":
            result.append(m)
        elif m["provider"] == "openai" and settings.openai_api_key:
            result.append(m)
        elif m["provider"] == "mistral" and settings.mistral_api_key:
            result.append(m)
    return result


# ── Request/Response-Schemas ──────────────────────────────────────────────────


class SettingsUpdate(BaseModel):
    kaia_chat_model: str


# ── Routen ────────────────────────────────────────────────────────────────────


@router.get("")
async def get_settings(_: Annotated[Any, Depends(require_admin)]) -> dict[str, Any]:
    return {
        "kaia_chat_model": get_model(),
        "available_models": _available_models(),
    }


@router.put("")
async def update_settings(
    body: SettingsUpdate,
    _: Annotated[Any, Depends(require_admin)],
) -> dict[str, str]:
    valid_ids = {m["id"] for m in _ALL_MODELS}
    if body.kaia_chat_model not in valid_ids:
        raise HTTPException(status_code=400, detail=f"Unbekanntes Modell: {body.kaia_chat_model}")

    # In-Memory sofort updaten (kein Neustart nötig)
    set_model_override(body.kaia_chat_model)

    # In DB für Restart-Persistenz
    async with AsyncSessionLocal() as db:
        await SystemSettingsRepository(db).set("kaia_chat_model", body.kaia_chat_model)

    return {"kaia_chat_model": get_model()}
