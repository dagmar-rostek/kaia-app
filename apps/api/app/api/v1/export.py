"""Admin export endpoints — CSV + PDF for study data.

All endpoints are admin-only (via shared router dependencies=[Depends(require_admin)]).

PDF generation uses WeasyPrint (HTML → PDF).
Falls back to text/html when WeasyPrint is not importable (e.g. on macOS without
  the required native libs cairo/pango).
TODO: On macOS install via: brew install weasyprint
      On Hetzner Linux (production) pip install weasyprint works without extra deps.
"""

from __future__ import annotations

import csv
import io
from datetime import date, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.db.session import get_db
from app.domains.survey.models import GseResult, MeasurementType, MslqResult
from app.domains.users.models import User, UserStatus
from app.domains.users.repository import UserRepository

router = APIRouter(
    prefix="/admin",
    tags=["admin-export"],
    dependencies=[Depends(require_admin)],
)

# ── CSV column order (must match spec) ────────────────────────────────────────

CSV_HEADERS: list[str] = [
    "participant_id",
    "display_name",
    "learning_topic",
    "consent_analytics",
    "registered_at",
    "first_session_at",
    "last_session_at",
    "study_duration_days",
    "sessions_completed",
    "total_messages",
    "gse_pre_total",
    "gse_post_total",
    "gse_delta",
    *(f"gse_pre_item_{i:02d}" for i in range(1, 11)),
    *(f"gse_post_item_{i:02d}" for i in range(1, 11)),
    "mslq_pre_self_efficacy",
    "mslq_post_self_efficacy",
    "mslq_delta_self_efficacy",
    "mslq_pre_kdg",
    "mslq_post_kdg",
    "mslq_delta_kdg",
    "mslq_pre_elaboration",
    "mslq_post_elaboration",
    "mslq_delta_elaboration",
    "mslq_pre_metacognitive_sr",
    "mslq_post_metacognitive_sr",
    "mslq_delta_metacognitive_sr",
    "mslq_pre_control_of_learning",
    "mslq_post_control_of_learning",
    "mslq_delta_control_of_learning",
]

_SUBSCALE_KEYS = [
    "self_efficacy",
    "kdg",
    "elaboration",
    "metacognitive_sr",
    "control_of_learning",
]

# ── Internal helpers ──────────────────────────────────────────────────────────


async def _get_user_or_404(user_id: int, db: AsyncSession) -> User:
    user = await UserRepository(db).get_by_id(user_id)
    if not user or user.status == UserStatus.DELETED:
        raise HTTPException(404, "User nicht gefunden.")
    return user


async def _get_completed_users(db: AsyncSession) -> list[User]:
    """Return all non-simulation active users who have completed the study.

    Completed = has both post_gse AND post_mslq records.
    Sorted by created_at ascending so P01 is the first registrant.
    """
    result = await db.execute(
        select(User)
        .where(
            User.status == UserStatus.ACTIVE,
            User.is_simulation.is_(False),
            User.id.in_(
                select(GseResult.user_id).where(GseResult.measurement_type == MeasurementType.POST)
            ),
            User.id.in_(
                select(MslqResult.user_id).where(
                    MslqResult.measurement_type == MeasurementType.POST
                )
            ),
        )
        .order_by(User.created_at)
    )
    return list(result.scalars().all())


async def _get_gse(db: AsyncSession, user_id: int, mt: MeasurementType) -> GseResult | None:
    r = await db.execute(
        select(GseResult)
        .where(GseResult.user_id == user_id, GseResult.measurement_type == mt)
        .order_by(GseResult.id.desc())
        .limit(1)
    )
    return r.scalar_one_or_none()


async def _get_mslq(db: AsyncSession, user_id: int, mt: MeasurementType) -> MslqResult | None:
    r = await db.execute(
        select(MslqResult)
        .where(MslqResult.user_id == user_id, MslqResult.measurement_type == mt)
        .order_by(MslqResult.id.desc())
        .limit(1)
    )
    return r.scalar_one_or_none()


async def _get_chat_stats(db: AsyncSession, user_id: int) -> dict[str, Any]:
    """Return min/max session timestamps, count of non-empty sessions, total messages."""
    r = await db.execute(
        text(
            "SELECT "
            "  MIN(cs.started_at) AS first_session_at, "
            "  MAX(cs.started_at) AS last_session_at, "
            "  COUNT(DISTINCT cs.id) FILTER ("
            "    WHERE EXISTS (SELECT 1 FROM messages m WHERE m.session_id = cs.id)"
            "  ) AS sessions_completed, "
            "  (SELECT COUNT(*) FROM messages m2 "
            "   JOIN chat_sessions cs2 ON cs2.id = m2.session_id "
            "   WHERE cs2.user_id = :uid) AS total_messages "
            "FROM chat_sessions cs "
            "WHERE cs.user_id = :uid"
        ),
        {"uid": user_id},
    )
    row = r.mappings().fetchone()
    if not row:
        return {
            "first_session_at": None,
            "last_session_at": None,
            "sessions_completed": 0,
            "total_messages": 0,
        }
    return {
        "first_session_at": row["first_session_at"],
        "last_session_at": row["last_session_at"],
        "sessions_completed": int(row["sessions_completed"] or 0),
        "total_messages": int(row["total_messages"] or 0),
    }


def _fmt(val: Any) -> str:
    """Format a value for CSV — None becomes empty string, floats rounded to 3 dec."""
    if val is None:
        return ""
    if isinstance(val, float):
        return f"{val:.3f}"
    return str(val)


def _delta(pre: float | None, post: float | None) -> str:
    if pre is None or post is None:
        return ""
    return _fmt(round(post - pre, 3))


async def _build_row(
    participant_id: str,
    user: User,
    db: AsyncSession,
) -> dict[str, str]:
    """Build one CSV row dict for a participant."""
    pre_gse = await _get_gse(db, user.id, MeasurementType.PRE)
    post_gse = await _get_gse(db, user.id, MeasurementType.POST)
    pre_mslq = await _get_mslq(db, user.id, MeasurementType.PRE)
    post_mslq = await _get_mslq(db, user.id, MeasurementType.POST)
    stats = await _get_chat_stats(db, user.id)

    pre_gse_items: list[Any] = pre_gse.items if pre_gse and isinstance(pre_gse.items, list) else []
    post_gse_items: list[Any] = (
        post_gse.items if post_gse and isinstance(post_gse.items, list) else []
    )
    gse_pre_total = float(pre_gse.total_score) if pre_gse else None
    gse_post_total = float(post_gse.total_score) if post_gse else None

    pre_sub: dict[str, Any] = pre_mslq.subscale_scores if pre_mslq else {}
    post_sub: dict[str, Any] = post_mslq.subscale_scores if post_mslq else {}

    # Study duration in days
    duration_days = ""
    first_at = stats["first_session_at"]
    last_at = stats["last_session_at"]
    if first_at and last_at:
        f_date = first_at.date() if hasattr(first_at, "date") else first_at
        l_date = last_at.date() if hasattr(last_at, "date") else last_at
        duration_days = str((l_date - f_date).days)

    row: dict[str, str] = {
        "participant_id": participant_id,
        "display_name": user.preferred_name or user.username,
        "learning_topic": user.learning_topic or "",
        "consent_analytics": "1" if user.consent_analytics else "0",
        "registered_at": user.created_at.isoformat() if user.created_at else "",
        "first_session_at": first_at.isoformat() if first_at else "",
        "last_session_at": last_at.isoformat() if last_at else "",
        "study_duration_days": duration_days,
        "sessions_completed": str(stats["sessions_completed"]),
        "total_messages": str(stats["total_messages"]),
        "gse_pre_total": _fmt(gse_pre_total),
        "gse_post_total": _fmt(gse_post_total),
        "gse_delta": _delta(gse_pre_total, gse_post_total),
    }

    for i in range(10):
        row[f"gse_pre_item_{i + 1:02d}"] = _fmt(
            pre_gse_items[i] if i < len(pre_gse_items) else None
        )
        row[f"gse_post_item_{i + 1:02d}"] = _fmt(
            post_gse_items[i] if i < len(post_gse_items) else None
        )

    for key in _SUBSCALE_KEYS:
        pre_val = pre_sub.get(key)
        post_val = post_sub.get(key)
        row[f"mslq_pre_{key}"] = _fmt(float(pre_val) if pre_val is not None else None)
        row[f"mslq_post_{key}"] = _fmt(float(post_val) if post_val is not None else None)
        row[f"mslq_delta_{key}"] = _delta(
            float(pre_val) if pre_val is not None else None,
            float(post_val) if post_val is not None else None,
        )

    return row


def _rows_to_csv(rows: list[dict[str, str]]) -> str:
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=CSV_HEADERS, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return buf.getvalue()


# ── Pydantic schemas ──────────────────────────────────────────────────────────


class ParticipantSummaryItem(BaseModel):
    user_id: int
    participant_id: str
    display_name: str
    learning_topic: str | None
    completed_at: datetime | None
    gse_delta: float | None
    sessions_completed: int


class ParticipantsSummaryResponse(BaseModel):
    count: int
    avg_gse_delta: float | None
    participants: list[ParticipantSummaryItem]


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("/export/participants/summary", response_model=ParticipantsSummaryResponse)
async def get_participants_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ParticipantsSummaryResponse:
    """JSON summary of all completed participants — used by the Auswertung dashboard."""
    users = await _get_completed_users(db)
    items: list[ParticipantSummaryItem] = []

    for idx, user in enumerate(users):
        pid = f"P{idx + 1:02d}"
        pre_gse = await _get_gse(db, user.id, MeasurementType.PRE)
        post_gse = await _get_gse(db, user.id, MeasurementType.POST)
        post_mslq = await _get_mslq(db, user.id, MeasurementType.POST)
        stats = await _get_chat_stats(db, user.id)

        gse_delta: float | None = None
        if pre_gse and post_gse:
            gse_delta = round(float(post_gse.total_score) - float(pre_gse.total_score), 3)

        completed_at: datetime | None = post_gse.created_at if post_gse else None
        if post_gse and post_mslq:
            completed_at = max(post_gse.created_at, post_mslq.created_at)

        items.append(
            ParticipantSummaryItem(
                user_id=user.id,
                participant_id=pid,
                display_name=user.preferred_name or user.username,
                learning_topic=user.learning_topic,
                completed_at=completed_at,
                gse_delta=gse_delta,
                sessions_completed=stats["sessions_completed"],
            )
        )

    deltas = [i.gse_delta for i in items if i.gse_delta is not None]
    avg_gse_delta = round(sum(deltas) / len(deltas), 3) if deltas else None

    return ParticipantsSummaryResponse(
        count=len(items),
        avg_gse_delta=avg_gse_delta,
        participants=items,
    )


@router.get("/export/participants.csv")
async def export_all_participants_csv(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Download all completed participants as a single CSV."""
    users = await _get_completed_users(db)
    rows = [await _build_row(f"P{idx + 1:02d}", user, db) for idx, user in enumerate(users)]
    today = date.today().isoformat()
    return Response(
        content=_rows_to_csv(rows).encode("utf-8"),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="kaia_study_export_{today}.csv"',
        },
    )


@router.get("/users/{user_id}/export/csv")
async def export_user_csv(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Download a single participant's data as CSV (one header + one data row)."""
    user = await _get_user_or_404(user_id, db)

    completed_users = await _get_completed_users(db)
    completed_ids = [u.id for u in completed_users]
    pid = f"P{completed_ids.index(user.id) + 1:02d}" if user.id in completed_ids else "P??"

    row = await _build_row(pid, user, db)
    today = date.today().isoformat()
    safe_name = user.username.replace(" ", "_")
    return Response(
        content=_rows_to_csv([row]).encode("utf-8"),
        media_type="text/csv",
        headers={
            "Content-Disposition": (f'attachment; filename="kaia_export_{safe_name}_{today}.csv"'),
        },
    )


@router.get("/users/{user_id}/export/pdf")
async def export_user_pdf(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Export a full study report for one participant.

    Generates PDF via WeasyPrint (HTML → PDF bytes).
    Falls back to text/html if WeasyPrint is not available on this platform.

    TODO (PDF on macOS): brew install weasyprint  OR
         brew install cairo pango gdk-pixbuf libffi && pip install weasyprint
    TODO (PDF on Linux / production): pip install weasyprint  — no extra native deps needed.
    """
    user = await _get_user_or_404(user_id, db)

    pre_gse = await _get_gse(db, user.id, MeasurementType.PRE)
    post_gse = await _get_gse(db, user.id, MeasurementType.POST)
    pre_mslq = await _get_mslq(db, user.id, MeasurementType.PRE)
    post_mslq = await _get_mslq(db, user.id, MeasurementType.POST)

    # Load sessions + messages
    sess_result = await db.execute(
        text(
            "SELECT cs.id, cs.session_number, cs.started_at, "
            "COUNT(m.id) AS message_count "
            "FROM chat_sessions cs "
            "LEFT JOIN messages m ON m.session_id = cs.id "
            "WHERE cs.user_id = :uid "
            "GROUP BY cs.id "
            "ORDER BY cs.started_at ASC LIMIT 50"
        ),
        {"uid": user.id},
    )
    session_rows = [dict(r._mapping) for r in sess_result]

    sessions_with_messages: list[dict[str, Any]] = []
    for s in session_rows:
        if int(s["message_count"]) == 0:
            continue
        msgs_result = await db.execute(
            text("SELECT role, content FROM messages WHERE session_id = :sid ORDER BY id ASC"),
            {"sid": s["id"]},
        )
        sessions_with_messages.append(
            {
                "session_number": s["session_number"],
                "started_at": s["started_at"],
                "messages": [dict(r._mapping) for r in msgs_result],
            }
        )

    html = _build_report_html(
        user=user,
        pre_gse=pre_gse,
        post_gse=post_gse,
        pre_mslq=pre_mslq,
        post_mslq=post_mslq,
        sessions=sessions_with_messages,
    )

    today = date.today().isoformat()
    safe_name = user.username.replace(" ", "_")

    try:
        from weasyprint import HTML

        pdf_bytes: bytes = HTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="kaia_bericht_{safe_name}_{today}.pdf"'
                ),
            },
        )
    except ImportError:
        return Response(
            content=html.encode("utf-8"),
            media_type="text/html",
            headers={
                "Content-Disposition": (
                    f'inline; filename="kaia_bericht_{safe_name}_{today}.html"'
                ),
            },
        )


# ── PDF / HTML report builder ─────────────────────────────────────────────────


def _h(val: Any) -> str:
    """HTML-escape a value."""
    return str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _fmt_score(val: Any) -> str:
    if val is None:
        return "—"
    return f"{float(val):.2f}"


def _build_report_html(
    user: User,
    pre_gse: GseResult | None,
    post_gse: GseResult | None,
    pre_mslq: MslqResult | None,
    post_mslq: MslqResult | None,
    sessions: list[dict[str, Any]],
) -> str:
    display_name = user.preferred_name or user.username
    today_str = date.today().strftime("%d.%m.%Y")

    pre_gse_items: list[Any] = pre_gse.items if pre_gse and isinstance(pre_gse.items, list) else []
    post_gse_items: list[Any] = (
        post_gse.items if post_gse and isinstance(post_gse.items, list) else []
    )
    gse_pre_total = float(pre_gse.total_score) if pre_gse else None
    gse_post_total = float(post_gse.total_score) if post_gse else None
    gse_delta = (
        round(gse_post_total - gse_pre_total, 3)
        if gse_pre_total is not None and gse_post_total is not None
        else None
    )

    pre_sub: dict[str, Any] = pre_mslq.subscale_scores if pre_mslq else {}
    post_sub: dict[str, Any] = post_mslq.subscale_scores if post_mslq else {}

    subscales_labeled = [
        ("self_efficacy", "Selbstwirksamkeit"),
        ("kdg", "KDG-Skala"),
        ("elaboration", "Elaboration"),
        ("metacognitive_sr", "Metakognitive Selbstregulation"),
        ("control_of_learning", "Kontrollüberzeugungen"),
    ]

    # GSE item rows
    gse_rows_html = ""
    for i in range(10):
        pre_v = pre_gse_items[i] if i < len(pre_gse_items) else None
        post_v = post_gse_items[i] if i < len(post_gse_items) else None
        dv = (float(post_v) - float(pre_v)) if (pre_v is not None and post_v is not None) else None
        dstr = f"{dv:+.0f}" if dv is not None else "—"
        gse_rows_html += (
            f"<tr><td>Item {i + 1:02d}</td>"
            f"<td class='c'>{_fmt_score(pre_v)}</td>"
            f"<td class='c'>{_fmt_score(post_v)}</td>"
            f"<td class='c'>{dstr}</td></tr>\n"
        )
    gse_delta_str = f"{gse_delta:+.3f}" if gse_delta is not None else "—"
    gse_rows_html += (
        f"<tr class='total'><td><strong>Gesamtscore</strong></td>"
        f"<td class='c'><strong>{_fmt_score(gse_pre_total)}</strong></td>"
        f"<td class='c'><strong>{_fmt_score(gse_post_total)}</strong></td>"
        f"<td class='c'><strong>{gse_delta_str}</strong></td></tr>\n"
    )

    # MSLQ subscale rows
    mslq_rows_html = ""
    for key, label in subscales_labeled:
        pre_v = pre_sub.get(key)
        post_v = post_sub.get(key)
        dv = float(post_v) - float(pre_v) if pre_v is not None and post_v is not None else None
        dstr = f"{dv:+.2f}" if dv is not None else "—"
        mslq_rows_html += (
            f"<tr><td>{_h(label)}</td>"
            f"<td class='c'>{_fmt_score(pre_v)}</td>"
            f"<td class='c'>{_fmt_score(post_v)}</td>"
            f"<td class='c'>{dstr}</td></tr>\n"
        )

    # Transcript sections
    transcript_html = ""
    for sess in sessions:
        dt = sess["started_at"]
        dt_str = dt.strftime("%d.%m.%Y") if hasattr(dt, "strftime") else str(dt)
        n_msgs = len(sess["messages"])
        msgs_html = ""
        for msg in sess["messages"]:
            role = "KAIA" if msg["role"] == "assistant" else "Teilnehmende:r"
            color = "#4f46e5" if msg["role"] == "assistant" else "#0f172a"
            content_escaped = _h(msg["content"])
            msgs_html += (
                f'<p style="margin:5px 0;color:{color}">'
                f"<strong>{role}:</strong> {content_escaped}</p>\n"
            )
        transcript_html += (
            f'<div style="page-break-inside:avoid;margin-bottom:28px">'
            f"<h3 style='font-size:13px;margin:0 0 8px'>"
            f"Session {sess['session_number']} — {dt_str} — {n_msgs} Nachrichten"
            f"</h3>"
            f'<div style="border-left:3px solid #e2e8f0;padding-left:14px;'
            f'font-size:11px;line-height:1.65">'
            f"{msgs_html}"
            f"</div></div>\n"
        )
    if not transcript_html:
        transcript_html = '<p style="color:#64748b">Keine Transkripte vorhanden.</p>'

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>KAIA Abschlussbericht — {_h(display_name)}</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: Arial, Helvetica, sans-serif; font-size: 12px;
          color: #1e293b; margin: 0; padding: 0; }}
  .page {{ padding: 48px 56px; max-width: 780px; margin: 0 auto; }}
  .cover {{ padding-bottom: 28px; border-bottom: 2px solid #e2e8f0; margin-bottom: 32px; }}
  h1 {{ font-size: 24px; margin: 0 0 6px; }}
  h2 {{ font-size: 15px; border-bottom: 2px solid #e2e8f0;
        padding-bottom: 5px; margin: 36px 0 12px; }}
  h3 {{ font-size: 13px; margin: 0 0 8px; }}
  .meta {{ color: #64748b; font-size: 11px; line-height: 1.8; margin: 0; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }}
  th {{ background: #f1f5f9; text-align: left; padding: 7px 10px;
        border: 1px solid #e2e8f0; font-weight: 600; }}
  td {{ padding: 6px 10px; border: 1px solid #e2e8f0; }}
  td.c {{ text-align: center; }}
  tr.total td {{ background: #f8fafc; }}
</style>
</head>
<body>
<div class="page">

  <div class="cover">
    <h1>KAIA Abschlussbericht</h1>
    <p class="meta">
      Teilnehmende:r: <strong>{_h(display_name)}</strong><br>
      Lernthema: <strong>{_h(user.learning_topic or "—")}</strong><br>
      Erstellt am: <strong>{today_str}</strong>
    </p>
  </div>

  <h2>1. Allgemeine Selbstwirksamkeitserwartung (GSE)</h2>
  <p class="meta">Skala 1–4 · Schwarzer &amp; Jerusalem (1995) ·
     Gesamtscore = Mittelwert der 10 Items</p>
  <table>
    <thead>
      <tr>
        <th>Item</th><th style="text-align:center">Vorher</th>
        <th style="text-align:center">Nachher</th><th style="text-align:center">Δ</th>
      </tr>
    </thead>
    <tbody>{gse_rows_html}</tbody>
  </table>

  <h2>2. Lernmotivation &amp; -strategien (MSLQ)</h2>
  <p class="meta">Skala 1–7 · Pintrich et al. (1991/1993) ·
     Subscores = Mittelwert der Subskalen-Items</p>
  <table>
    <thead>
      <tr>
        <th>Subskala</th><th style="text-align:center">Vorher</th>
        <th style="text-align:center">Nachher</th><th style="text-align:center">Δ</th>
      </tr>
    </thead>
    <tbody>{mslq_rows_html}</tbody>
  </table>

  <h2>3. Chat-Transkripte</h2>
  {transcript_html}

</div>
</body>
</html>"""
