from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

from app.observability.slack import notify

router = APIRouter()


class BugReportRequest(BaseModel):
    vorname: str
    email: EmailStr
    beschreibung: str


@router.post("/bug-report", tags=["system"])
async def submit_bug_report(body: BugReportRequest) -> dict:
    await notify(
        f"🐛 *Bug-Report*\n"
        f"*Von:* {body.vorname} ({body.email})\n"
        f"*Beschreibung:* {body.beschreibung}",
        emoji="🐛",
    )
    return {"ok": True}
