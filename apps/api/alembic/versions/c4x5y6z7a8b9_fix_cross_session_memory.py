"""fix: enable natural cross-session references in V7 warm

Revision ID: c4x5y6z7a8b9
Revises: b3w4x5y6z7a8
Create Date: 2026-08-01 00:00:00.000000

Changes:
- KEIN-KONTEXT-REFERENZ → KEIN-PROTOKOLL-REFERENZ:
  Natural, warm references to past sessions are now explicitly allowed.
  ('Du hast letzte Woche erwaehnt...' OK; 'Laut Session-Protokoll...' verboten)
- session_history_summary: KAIA is now instructed to actively name open points
  and patterns from past sessions, not just silently incorporate them.
- EINSTIEG-STIMME: encourages concrete, warm session back-references.
- PII-Constraint: aligned with new name-usage rule (max 1x per session).
"""

import sqlalchemy as sa

from alembic import op

revision: str = "c4x5y6z7a8b9"
down_revision: str | None = "b3w4x5y6z7a8"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V7_WARM

    conn = op.get_bind()

    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v7_warm'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes, created_at) "
            "VALUES (:name, :character, :template, :is_active, :version, :notes, NOW())"
        ),
        {
            "name": "kaia_system_v7_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V7_WARM,
            "is_active": True,
            "version": 7,
            "notes": (
                "Warm character v7 (2026-08-01c) — "
                "Cross-Session-Memory aktiviert: KEIN-KONTEXT-REFERENZ → KEIN-PROTOKOLL-REFERENZ, "
                "natuerliche Session-Referenzen ('Du hast letzte Woche erwaehnt...') explizit erlaubt. "
                "session_history_summary: KAIA soll offene Punkte aktiv benennen. "
                "EINSTIEG-STIMME: konkrete, warme Rueckbezuege foerdern."
            ),
        },
    )


def downgrade() -> None:
    pass
