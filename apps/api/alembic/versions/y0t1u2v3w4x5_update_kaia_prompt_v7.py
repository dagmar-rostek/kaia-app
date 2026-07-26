"""update KAIA prompt to v7: Session-Ton, Memory-Horizont, Beziehungsreife, EINZEL-FRAGE

Revision ID: y0t1u2v3w4x5
Revises: x9s0t1u2v3w4
Create Date: 2026-07-26 00:00:00.000000

Changes:
- Deactivates kaia_system_v6_warm
- Deletes kaia_system_v7_warm if present (idempotent)
- Inserts kaia_system_v7_warm as active warm prompt
- v7 adds session_tone + session_memory_horizon to session_mission block
- v7 adds Beziehungsreife-Constraint for sessions >= 6
- v7 adds [EINZEL-FRAGE] constraint (exactly 1 question mark in final_answer)
- v7 adds Fragen-Commit Check #14 in thinking block
"""

import sqlalchemy as sa

from alembic import op

revision: str = "y0t1u2v3w4x5"
down_revision: str | None = "x9s0t1u2v3w4"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V7_WARM

    conn = op.get_bind()

    # Deactivate v6
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = false WHERE name = 'kaia_system_v6_warm'")
    )

    # Delete existing v7 if present (idempotent), then insert fresh
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
                "Warm character v7 — Session-Ton + Memory-Horizont in session_mission-Block "
                "(session_tone, session_memory_horizon), Beziehungsreife-Constraint ab Session 6 "
                "(keine S1-S2-Einstiegsmuster), EINZEL-FRAGE-Constraint (exakt 1 Fragezeichen in "
                "final_answer), Fragen-Commit-Check (#14) im Thinking-Block. "
                "Begruendung: Mehrfach-Fragen-Pattern und fehlende Session-Ton-Differenzierung "
                "in Pilotnutzung."
            ),
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = false WHERE name = 'kaia_system_v7_warm'")
    )
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = true WHERE name = 'kaia_system_v6_warm'")
    )
