"""fix: add name usage in follow-up sessions to V7 warm prompt

Revision ID: b3w4x5y6z7a8
Revises: a2v3w4x5y6z7
Create Date: 2026-08-01 00:00:00.000000

Changes:
- Re-inserts kaia_system_v7_warm with name usage rule for follow-up sessions:
  KAIA may use the user's name once per session (at greeting or an
  emotionally significant moment), never more.
"""

import sqlalchemy as sa

from alembic import op

revision: str = "b3w4x5y6z7a8"
down_revision: str | None = "a2v3w4x5y6z7"
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
                "Warm character v7 (2026-08-01b) — "
                "Namensbenutzung in Folgesessions: max. 1x pro Session "
                "(Wiedersehen oder emotional bedeutsamer Moment). "
                "Preferred_name hat jetzt Vorrang vor username in der Prompt-Befuellung."
            ),
        },
    )


def downgrade() -> None:
    pass
