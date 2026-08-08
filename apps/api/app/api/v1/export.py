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
import math
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
    """Return study-participant-flagged users who have completed the study.

    Completed = has both post_gse AND post_mslq records AND study_participant=True.
    Sorted by created_at ascending so P01 is the first registrant.
    """
    result = await db.execute(
        select(User)
        .where(
            User.status == UserStatus.ACTIVE,
            User.is_simulation.is_(False),
            User.study_participant.is_(True),
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


async def _get_active_study_users(db: AsyncSession) -> list[User]:
    """All active study participants regardless of completion status."""
    result = await db.execute(
        select(User)
        .where(
            User.status == UserStatus.ACTIVE,
            User.is_simulation.is_(False),
            User.study_participant.is_(True),
        )
        .order_by(User.created_at)
    )
    return list(result.scalars().all())


@router.get("/export/participants-interim.csv")
async def export_interim_participants_csv(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    """Download all active study participants as CSV — including incomplete ones (post columns empty)."""
    users = await _get_active_study_users(db)
    rows = [await _build_row(f"P{idx + 1:02d}", user, db) for idx, user in enumerate(users)]
    today = date.today().isoformat()
    return Response(
        content=_rows_to_csv(rows).encode("utf-8"),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="kaia_interim_export_{today}.csv"',
        },
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

    # Load sessions + messages + summary
    sess_result = await db.execute(
        text(
            "SELECT cs.id, cs.session_number, cs.started_at, cs.session_summary, "
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

    import json as _json

    sessions_with_messages: list[dict[str, Any]] = []
    for s in session_rows:
        if int(s["message_count"]) == 0:
            continue
        msgs_result = await db.execute(
            text("SELECT role, content FROM messages WHERE session_id = :sid ORDER BY id ASC"),
            {"sid": s["id"]},
        )
        summary: dict[str, Any] | None = None
        if s.get("session_summary"):
            try:
                summary = _json.loads(s["session_summary"])
            except (ValueError, TypeError):
                pass
        sessions_with_messages.append(
            {
                "session_number": s["session_number"],
                "started_at": s["started_at"],
                "summary": summary,
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

_GSE_ITEM_LABELS = [
    "Schwierigkeiten bewältigen",
    "Gegen Widerstand durchsetzen",
    "Ziele verwirklichen",
    "Unerwartete Situationen",
    "Überraschungen meistern",
    "Gelassene Selbstgewissheit",
    "Resiliente Grundhaltung",
    "Lösungsfindung",
    "Neue Situationen",
    "Ressourcen nutzen",
]

_MSLQ_META = [
    ("self_efficacy", "Akademische Selbstwirksamkeit", "#6366f1"),
    ("kdg", "Wissen-Handeln-Lücke", "#0ea5e9"),
    ("elaboration", "Elaborationsstrategien", "#8b5cf6"),
    ("metacognitive_sr", "Metakogn. Selbstregulation", "#f59e0b"),
    ("control_of_learning", "Kontrollüberzeugungen", "#10b981"),
]

_SESSION_GOALS = {
    1: "Thema, Lernintention und erster Schritt sichtbar machen.",
    2: "Ersten Schritt nachhalten. Vorwissen und Lücken kartieren.",
    3: "Erkenntnisse in konkrete Handlungsschritte überführen.",
    4: "Transfer vertiefen. Muster aus den Versuchen analysieren.",
    5: "Halbzeit-Spiegel. Fortschritt explizit sichtbar machen.",
    6: "Cross-sessionaler Widerspruch. Kognitive Dissonanz ohne Bedrohung.",
    7: "Bewertungskriterien entwickeln. Annahmen sichtbar machen.",
    8: "Tiefe Analyse. Systemisches Denken.",
    9: "Transfer-Autonomie. Eigene Lernstrategie entwickeln.",
    10: "Abschluss. Mastery Experience durch Reflexion. Transfer sichern.",
}


def _h(val: Any) -> str:
    """HTML-escape a value."""
    return str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _fmt_score(val: Any) -> str:
    if val is None:
        return "—"
    return f"{float(val):.2f}"


def _radar_svg(
    vals_pre: list[float],
    vals_post: list[float],
    labels: list[str],
    scale_min: float,
    scale_max: float,
    size: int = 300,
    color_pre: str = "#818cf8",
    color_post: str = "#34d399",
) -> str:
    """Return an inline SVG radar chart comparing pre and post values."""
    n = len(labels)
    if n == 0:
        return ""
    cx = cy = size / 2.0
    r = size / 2.0 - 38.0

    def norm(v: float) -> float:
        span = scale_max - scale_min
        return (v - scale_min) / span if span else 0.0

    def pt(i: int, v: float) -> tuple[float, float]:
        angle = 2 * math.pi * i / n - math.pi / 2
        nv = min(1.0, max(0.0, norm(v)))
        return (cx + r * nv * math.cos(angle), cy + r * nv * math.sin(angle))

    def pts_str(vals: list[float]) -> str:
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in [pt(i, v) for i, v in enumerate(vals)])

    grid_levels = [0.25, 0.5, 0.75, 1.0]
    grid_html = ""
    for lvl in grid_levels:
        gpts = " ".join(
            f"{(cx + r * lvl * math.cos(2 * math.pi * i / n - math.pi / 2)):.1f},"
            f"{(cy + r * lvl * math.sin(2 * math.pi * i / n - math.pi / 2)):.1f}"
            for i in range(n)
        )
        grid_html += f'<polygon points="{gpts}" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>\n'

    axes_html = ""
    for i in range(n):
        x, y = (
            cx + r * math.cos(2 * math.pi * i / n - math.pi / 2),
            cy + r * math.sin(2 * math.pi * i / n - math.pi / 2),
        )
        axes_html += (
            f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{x:.1f}" y2="{y:.1f}" '
            f'stroke="#e2e8f0" stroke-width="0.8"/>\n'
        )

    label_html = ""
    for i, lab in enumerate(labels):
        angle = 2 * math.pi * i / n - math.pi / 2
        lx = cx + (r + 22) * math.cos(angle)
        ly = cy + (r + 22) * math.sin(angle)
        anchor = "middle"
        if lx < cx - 8:
            anchor = "end"
        elif lx > cx + 8:
            anchor = "start"
        label_html += (
            f'<text x="{lx:.1f}" y="{ly:.1f}" dy="0.35em" text-anchor="{anchor}" '
            f'font-size="8" font-family="Arial,sans-serif" fill="#64748b">{_h(lab)}</text>\n'
        )

    pre_pts = pts_str(vals_pre)
    post_pts = pts_str(vals_post)

    legend_y = size - 12
    ff = "Arial,sans-serif"
    legend = (
        f'<rect x="10" y="{legend_y - 8}" width="10" height="10" '
        f'fill="{color_pre}44" stroke="{color_pre}" stroke-width="1.5"/>'
        f'<text x="24" y="{legend_y - 2}" font-size="8" font-family="{ff}"'
        f' fill="#64748b">Vorher</text>'
        f'<rect x="70" y="{legend_y - 8}" width="10" height="10" '
        f'fill="{color_post}44" stroke="{color_post}" stroke-width="1.5"/>'
        f'<text x="84" y="{legend_y - 2}" font-size="8" font-family="{ff}"'
        f' fill="#64748b">Nachher</text>'
    )

    poly_pre = (
        f'<polygon points="{pre_pts}" fill="{color_pre}33"'
        f' stroke="{color_pre}" stroke-width="1.8"/>\n'
    )
    poly_post = (
        f'<polygon points="{post_pts}" fill="{color_post}33"'
        f' stroke="{color_post}" stroke-width="1.8"/>\n'
    )

    return (
        f'<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">'
        f"{grid_html}{axes_html}"
        f"{poly_pre}{poly_post}"
        f"{label_html}{legend}"
        f"</svg>"
    )


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

    # ── GSE radar chart ──
    gse_radar = ""
    if pre_gse_items and post_gse_items:
        gse_radar = _radar_svg(
            [float(v) for v in pre_gse_items],
            [float(v) for v in post_gse_items],
            _GSE_ITEM_LABELS,
            scale_min=1.0,
            scale_max=4.0,
            size=310,
        )

    # ── MSLQ radar chart ──
    mslq_radar = ""
    mslq_keys = [k for k, _, _ in _MSLQ_META]
    if any(pre_sub.get(k) is not None for k in mslq_keys):
        mslq_radar = _radar_svg(
            [float(pre_sub.get(k) or 1.0) for k in mslq_keys],
            [float(post_sub.get(k) or 1.0) for k in mslq_keys],
            [lbl for _, lbl, _ in _MSLQ_META],
            scale_min=1.0,
            scale_max=7.0,
            size=310,
        )

    # ── GSE item rows ──
    gse_rows_html = ""
    for i in range(10):
        pre_v = pre_gse_items[i] if i < len(pre_gse_items) else None
        post_v = post_gse_items[i] if i < len(post_gse_items) else None
        dv = (float(post_v) - float(pre_v)) if (pre_v is not None and post_v is not None) else None
        dstr = f"{dv:+.0f}" if dv is not None else "—"
        d_color = "#16a34a" if (dv and dv > 0) else ("#dc2626" if (dv and dv < 0) else "#64748b")
        label = _GSE_ITEM_LABELS[i] if i < len(_GSE_ITEM_LABELS) else f"Item {i + 1}"
        gse_rows_html += (
            f"<tr>"
            f"<td style='width:30px;color:#64748b;font-family:monospace'>{i + 1:02d}</td>"
            f"<td>{_h(label)}</td>"
            f"<td class='c'>{_fmt_score(pre_v)}</td>"
            f"<td class='c'>{_fmt_score(post_v)}</td>"
            f"<td class='c' style='color:{d_color};font-weight:600'>{dstr}</td></tr>\n"
        )
    gse_delta_str = f"{gse_delta:+.2f}" if gse_delta is not None else "—"
    d_color_total = (
        "#16a34a"
        if (gse_delta and gse_delta > 0)
        else ("#dc2626" if (gse_delta and gse_delta < 0) else "#64748b")
    )
    gse_rows_html += (
        f"<tr style='background:#f8fafc'>"
        f"<td></td><td><strong>Gesamtscore (Mittelwert)</strong></td>"
        f"<td class='c'><strong>{_fmt_score(gse_pre_total)}</strong></td>"
        f"<td class='c'><strong>{_fmt_score(gse_post_total)}</strong></td>"
        f"<td class='c' style='color:{d_color_total};font-weight:700'>{gse_delta_str}</td></tr>\n"
    )

    # ── MSLQ subscale rows ──
    mslq_rows_html = ""
    for key, label, color in _MSLQ_META:
        pre_v = pre_sub.get(key)
        post_v = post_sub.get(key)
        dv = float(post_v) - float(pre_v) if pre_v is not None and post_v is not None else None
        dstr = f"{dv:+.2f}" if dv is not None else "—"
        d_color = "#16a34a" if (dv and dv > 0) else ("#dc2626" if (dv and dv < 0) else "#64748b")
        mslq_rows_html += (
            f"<tr>"
            f"<td><span style='display:inline-block;width:8px;height:8px;border-radius:50%;background:{color};margin-right:6px'></span>{_h(label)}</td>"
            f"<td class='c'>{_fmt_score(pre_v)}</td>"
            f"<td class='c'>{_fmt_score(post_v)}</td>"
            f"<td class='c' style='color:{d_color};font-weight:600'>{dstr}</td></tr>\n"
        )

    # ── Session sections ──
    sessions_html = ""
    for sess in sessions:
        dt = sess["started_at"]
        dt_str = dt.strftime("%d.%m.%Y") if hasattr(dt, "strftime") else str(dt)
        snum = sess["session_number"]
        goal = _SESSION_GOALS.get(snum, "")
        summary: dict[str, Any] | None = sess.get("summary")

        # Meta-Reflexion block
        meta_html = ""
        if summary:
            mood = summary.get("mood", "")
            mood_color = (
                "#16a34a"
                if mood == "positiv"
                else "#d97706"
                if mood == "neutral"
                else "#dc2626"
                if mood == "frustriert"
                else "#64748b"
            )
            mood_bg = (
                "#f0fdf4"
                if mood == "positiv"
                else "#fffbeb"
                if mood == "neutral"
                else "#fef2f2"
                if mood == "frustriert"
                else "#f8fafc"
            )
            topics = summary.get("topics") or []
            topics_html = (
                " · ".join(
                    f'<span style="background:#ede9fe;color:#7c3aed;padding:1px 6px;border-radius:4px;font-size:10px">{_h(t)}</span>'
                    for t in topics
                )
                if topics
                else ""
            )
            meta_html = f"""
            <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:14px 16px;margin:12px 0;border-radius:0 6px 6px 0">
              <p style="font-size:11px;font-weight:700;color:#6366f1;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em">KAIA Meta-Reflexion</p>
              {"<p style='margin:4px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Stimmung:</span> <span style='background:" + mood_bg + ";color:" + mood_color + ";padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600'>" + _h(mood) + "</span></p>" if mood else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Themen:</span> <span style='margin-left:4px'>" + topics_html + "</span></p>" if topics else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Stärkster Satz:</span> <em style='color:#1e293b'>&bdquo;" + _h(summary.get("strongest_quote", "")) + "&ldquo;</em></p>" if summary.get("strongest_quote") else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Beobachtete Stärken:</span> " + _h(summary.get("strengths_observed", "")) + "</p>" if summary.get("strengths_observed") else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Reibungspunkte:</span> " + _h(summary.get("friction_points", "")) + "</p>" if summary.get("friction_points") else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Nächster Schritt:</span> " + _h(summary.get("first_step", "")) + "</p>" if summary.get("first_step") else ""}
              {"<p style='margin:6px 0'><span style='font-size:10px;color:#64748b;font-weight:600'>Für nächste Session:</span> <em>" + _h(summary.get("insight_for_next_session", "")) + "</em></p>" if summary.get("insight_for_next_session") else ""}
            </div>
            """
            # Tags annotation
            tag_parts = []
            if mood:
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;Stimmung&gt;</span> {_h(mood)}"
                )
            if topics:
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;Themen&gt;</span> {_h(', '.join(topics))}"
                )
            if summary.get("strongest_quote"):
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;StärkseterSatz&gt;</span> {_h(summary['strongest_quote'])}"
                )
            if summary.get("strengths_observed"):
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;Stärken&gt;</span> {_h(summary['strengths_observed'])}"
                )
            if summary.get("friction_points"):
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;Reibung&gt;</span> {_h(summary['friction_points'])}"
                )
            if summary.get("first_step"):
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;NächsterSchritt&gt;</span> {_h(summary['first_step'])}"
                )
            if summary.get("insight_for_next_session"):
                tag_parts.append(
                    f"<span style='font-family:monospace;color:#6366f1'>&lt;FürNächsteSession&gt;</span> {_h(summary['insight_for_next_session'])}"
                )
            if tag_parts:
                meta_html += (
                    '<div style="margin:8px 0 12px;padding:8px 12px;background:#fafafa;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;line-height:1.9">'
                    + "<br>".join(tag_parts)
                    + "</div>"
                )

        # Chat transcript
        msgs_html = ""
        for msg in sess.get("messages", []):
            is_ai = msg["role"] == "assistant"
            role_label = "KAIA" if is_ai else "Du"
            bg = "#eef2ff" if is_ai else "#ffffff"
            border = "1px solid #c7d2fe" if is_ai else "1px solid #e2e8f0"
            color = "#312e81" if is_ai else "#1e293b"
            content_esc = _h(msg["content"])
            msgs_html += (
                f'<div style="margin:6px 0;padding:8px 12px;background:{bg};border:{border};border-radius:6px">'
                f'<strong style="font-size:10px;color:#64748b">{role_label}</strong>'
                f'<p style="margin:3px 0 0;font-size:11px;line-height:1.6;color:{color}">{content_esc}</p>'
                f"</div>\n"
            )

        sessions_html += f"""
        <div style="margin-bottom:32px;page-break-inside:avoid">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 16px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:13px;font-weight:700">Session {snum} — {_h(dt_str)}</p>
            {"<p style='margin:4px 0 0;font-size:10px;opacity:0.85'>" + _h(goal) + "</p>" if goal else ""}
          </div>
          <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:14px 16px">
            {meta_html}
            <p style="font-size:11px;font-weight:700;color:#64748b;margin:12px 0 6px;text-transform:uppercase;letter-spacing:0.05em">Chatverlauf</p>
            {msgs_html or '<p style="color:#64748b;font-size:11px">Keine Nachrichten.</p>'}
          </div>
        </div>
        """

    if not sessions_html:
        sessions_html = '<p style="color:#64748b">Keine Sessions vorhanden.</p>'

    gse_note = ""
    if gse_delta is not None:
        if gse_delta > 0.2:
            gse_note = "Deine Selbstwirksamkeit hat sich im Verlauf der Sessions messbar gestärkt."
        elif gse_delta < -0.2:
            gse_note = "Deine Selbstwirksamkeit hat sich leicht verändert — das ist normal in intensiven Lernprozessen."
        else:
            gse_note = "Deine Selbstwirksamkeit ist im Verlauf stabil geblieben."

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>KAIA Abschlussbericht — {_h(display_name)}</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: Arial, Helvetica, sans-serif; font-size: 12px;
          color: #1e293b; margin: 0; padding: 0; background: white; }}
  .page {{ padding: 48px 56px; max-width: 800px; margin: 0 auto; }}
  .cover {{ padding-bottom: 24px; border-bottom: 3px solid #6366f1; margin-bottom: 36px; }}
  .cover h1 {{ font-size: 26px; margin: 0 0 4px; color: #1e293b; }}
  .cover .subtitle {{ color: #6366f1; font-size: 13px; font-weight: 600; margin: 0 0 12px; }}
  .cover .meta {{ color: #64748b; font-size: 11px; line-height: 2; }}
  h2 {{ font-size: 15px; font-weight: 700; color: #312e81; border-bottom: 2px solid #e0e7ff;
        padding-bottom: 6px; margin: 40px 0 14px; }}
  h3 {{ font-size: 12px; font-weight: 600; margin: 0 0 8px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }}
  th {{ background: #eef2ff; text-align: left; padding: 7px 10px;
        border: 1px solid #c7d2fe; font-weight: 600; color: #312e81; }}
  td {{ padding: 6px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }}
  td.c {{ text-align: center; font-family: monospace; }}
  .radar-row {{ display: flex; gap: 32px; align-items: center; margin: 16px 0; }}
  .disclaimer {{ font-size: 10px; color: #94a3b8; font-style: italic;
                 margin: 20px 0; padding: 10px 14px; border: 1px solid #e2e8f0;
                 border-radius: 4px; background: #f8fafc; }}
</style>
</head>
<body>
<div class="page">

  <div class="cover">
    <h1>KAIA Abschlussbericht</h1>
    <p class="subtitle">Persönlicher Lernbericht · 10 Sessions</p>
    <p class="meta">
      Name: <strong>{_h(display_name)}</strong><br>
      Lernthema: <strong>{_h(user.learning_topic or "—")}</strong><br>
      Erstellt: <strong>{today_str}</strong>
    </p>
  </div>

  <h2>1. Allgemeine Selbstwirksamkeitserwartung (GSE)</h2>
  <p style="font-size:11px;color:#64748b">Skala 1–4 · Schwarzer &amp; Jerusalem (1999) · Gesamtscore = Mittelwert der 10 Items</p>
  {"<div style='text-align:center;margin:20px 0'>" + gse_radar + "</div>" if gse_radar else ""}
  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Item</th>
        <th style="text-align:center;width:70px">Vorher</th>
        <th style="text-align:center;width:70px">Nachher</th>
        <th style="text-align:center;width:50px">Δ</th>
      </tr>
    </thead>
    <tbody>{gse_rows_html}</tbody>
  </table>
  {"<p style='font-size:11px;color:#475569;margin:12px 0 4px;font-style:italic'>" + _h(gse_note) + " Die GSE misst eine Tendenz, keine unveränderliche Eigenschaft.</p>" if gse_note else ""}

  <h2>2. Lernmotivation &amp; Lernstrategien (MSLQ)</h2>
  <p style="font-size:11px;color:#64748b">Skala 1–7 · Pintrich et al. (1991/1993) · Subskalen-Mittelwerte</p>
  {"<div style='text-align:center;margin:20px 0'>" + mslq_radar + "</div>" if mslq_radar else ""}
  <table>
    <thead>
      <tr>
        <th>Subskala</th>
        <th style="text-align:center;width:70px">Vorher</th>
        <th style="text-align:center;width:70px">Nachher</th>
        <th style="text-align:center;width:50px">Δ</th>
      </tr>
    </thead>
    <tbody>{mslq_rows_html}</tbody>
  </table>

  <div class="disclaimer">
    Diese Werte sind Momentaufnahmen, keine Diagnosen. Veränderungen zwischen zwei
    Messzeitpunkten können viele Ursachen haben. Die Skalen messen Tendenzen,
    keine stabilen Persönlichkeitseigenschaften.
  </div>

  <h2>3. Sessions — KAIA Meta-Reflexion &amp; Chatverlauf</h2>
  {sessions_html}

</div>
</body>
</html>"""
