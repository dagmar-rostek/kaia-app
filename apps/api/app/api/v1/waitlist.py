from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy import String, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core.deps import require_admin
from app.db.session import Base, get_db
from app.observability.slack import notify

router = APIRouter()

PRODUCTS: dict[str, str] = {
    "gfk-leadership": "GFK im Business — Leadership",
    "gfk-business": "GFK im Business — Alle",
    "ai-leaders": "AI First Transformation — Leaders",
    "ai-builders": "AI First Transformation — Builders",
}


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), index=True)
    product: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(UTC))


class WaitlistRequest(BaseModel):
    name: str
    email: EmailStr
    product: str


class WaitlistEntryRead(BaseModel):
    id: int
    name: str
    email: str
    product: str
    product_label: str
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("/waitlist", tags=["system"])
async def join_waitlist(
    body: WaitlistRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, bool]:
    product_label = PRODUCTS.get(body.product, body.product)
    entry = WaitlistEntry(
        name=body.name,
        email=str(body.email),
        product=body.product,
    )
    db.add(entry)
    await db.commit()
    await notify(
        f"🎯 *Neue Warteliste-Anmeldung*\n"
        f"*Produkt:* {product_label}\n"
        f"*Name:* {body.name}\n"
        f"*E-Mail:* {body.email}",
        emoji="🎯",
    )
    return {"ok": True}


@router.get(
    "/admin/waitlist",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)
async def list_waitlist(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[WaitlistEntryRead]:
    result = await db.execute(select(WaitlistEntry).order_by(WaitlistEntry.created_at.desc()))
    entries = result.scalars().all()
    return [
        WaitlistEntryRead(
            id=e.id,
            name=e.name,
            email=e.email,
            product=e.product,
            product_label=PRODUCTS.get(e.product, e.product),
            created_at=e.created_at,
        )
        for e in entries
    ]
