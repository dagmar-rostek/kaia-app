from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db, require_admin
from app.domains.preregistration import service
from app.domains.preregistration.repository import PreRegistrationRepo
from app.domains.preregistration.schemas import (
    PreRegisterRequest,
    PreRegisterResponse,
    PreRegistrationItem,
    StatsResponse,
)

router = APIRouter(prefix="/preregister", tags=["preregister"])


@router.get("/stats", response_model=StatsResponse)
async def stats(db: AsyncSession = Depends(get_db)) -> StatsResponse:
    repo = PreRegistrationRepo(db)
    total = await repo.count_active()
    return StatsResponse(
        total=total,
        remaining=max(0, settings.max_preregistrations - total),
        max=settings.max_preregistrations,
    )


@router.post("", response_model=PreRegisterResponse, status_code=status.HTTP_201_CREATED)
async def preregister(
    body: PreRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> PreRegisterResponse:
    repo = PreRegistrationRepo(db)

    total = await repo.count_active()
    if total >= settings.max_preregistrations:
        raise HTTPException(status_code=409, detail="Alle Plätze belegt.")

    if await repo.exists_email(body.email):
        raise HTTPException(status_code=409, detail="Diese E-Mail ist bereits registriert.")

    entry = await repo.create(body.name, body.email, body.reason)

    new_total = total + 1
    await service.send_confirmation(entry.name, entry.email, entry.unsubscribe_token)
    await service.notify_dagmar(entry.name, entry.email, entry.reason, new_total)

    return PreRegisterResponse(ok=True, message="Voranmeldung erfolgreich.")


@router.get("/unsubscribe/{token}", response_model=PreRegisterResponse)
async def unsubscribe(token: str, db: AsyncSession = Depends(get_db)) -> PreRegisterResponse:
    repo = PreRegistrationRepo(db)
    entry = await repo.get_by_token(token)
    if not entry:
        raise HTTPException(status_code=404, detail="Token nicht gefunden.")
    if entry.status == "removed":
        return PreRegisterResponse(ok=True, message="Bereits abgemeldet.")
    await repo.set_status(entry, "removed")
    return PreRegisterResponse(ok=True, message="Erfolgreich abgemeldet.")


# ── Admin ──────────────────────────────────────────────────────────────────────

@router.get("/admin/list", response_model=list[PreRegistrationItem], dependencies=[Depends(require_admin)])
async def admin_list(db: AsyncSession = Depends(get_db)) -> list[PreRegistrationItem]:
    repo = PreRegistrationRepo(db)
    return [PreRegistrationItem.model_validate(e) for e in await repo.list_all()]


@router.delete("/admin/{id}", response_model=PreRegisterResponse, dependencies=[Depends(require_admin)])
async def admin_remove(id: str, db: AsyncSession = Depends(get_db)) -> PreRegisterResponse:
    repo = PreRegistrationRepo(db)
    entry = await repo.get_by_id(id)
    if not entry:
        raise HTTPException(status_code=404, detail="Nicht gefunden.")
    if entry.status == "removed":
        return PreRegisterResponse(ok=True, message="Bereits entfernt.")
    await repo.set_status(entry, "removed")
    await service.send_removal(entry.name, entry.email)
    return PreRegisterResponse(ok=True, message="Entfernt.")
