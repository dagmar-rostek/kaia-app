from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

from app.observability.slack import notify

router = APIRouter()

PRODUCTS: dict[str, str] = {
    "gfk-leadership": "GFK im Business — Leadership",
    "gfk-business": "GFK im Business — Alle",
    "ai-leaders": "AI First Transformation — Leaders",
    "ai-builders": "AI First Transformation — Builders",
}


class WaitlistRequest(BaseModel):
    name: str
    email: EmailStr
    product: str


@router.post("/waitlist", tags=["system"])
async def join_waitlist(body: WaitlistRequest) -> dict[str, bool]:
    product_label = PRODUCTS.get(body.product, body.product)
    await notify(
        f"🎯 *Neue Warteliste-Anmeldung*\n"
        f"*Produkt:* {product_label}\n"
        f"*Name:* {body.name}\n"
        f"*E-Mail:* {body.email}",
        emoji="🎯",
    )
    return {"ok": True}
