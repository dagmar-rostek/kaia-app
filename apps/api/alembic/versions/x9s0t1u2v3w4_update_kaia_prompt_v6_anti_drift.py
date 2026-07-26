"""update KAIA prompt to v6: Konzept-Drift-Sperre + Schritt-Abschluss-Check

Revision ID: x9s0t1u2v3w4
Revises: w8r9s0t1u2v3
Create Date: 2026-07-26 00:00:00.000000

Changes:
- Deactivates kaia_system_v5_warm
- Inserts kaia_system_v6_warm as active warm prompt
- v6 adds Konzept-Drift-Sperre (no therapeutic frameworks unless user introduced them)
- v6 adds Schritt-Abschluss-Check #13 (close naturally after user names step + no blockers)
"""

import sqlalchemy as sa

from alembic import op

revision: str = "x9s0t1u2v3w4"
down_revision: str | None = "w8r9s0t1u2v3"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V6_WARM

    conn = op.get_bind()

    # Deactivate v5
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = false WHERE name = 'kaia_system_v5_warm'")
    )

    # Delete existing v6 if present (idempotent), then insert fresh
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v6_warm'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes, created_at) "
            "VALUES (:name, :character, :template, :is_active, :version, :notes, NOW())"
        ),
        {
            "name": "kaia_system_v6_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V6_WARM,
            "is_active": True,
            "version": 6,
            "notes": (
                "Warm character v6 — Konzept-Drift-Sperre: KAIA darf keine psychologischen "
                "Frameworks einfuehren die der Lernende nicht selbst eingebracht hat "
                "(IFS/Innerer Kritiker, ACT, Bindungstheorie, Glaubenssatz-Arbeit). "
                "Schritt-Abschluss-Check (#13): wenn Lernender Schritt benennt und keine "
                "Blocker signalisiert, bestaetigt KAIA kurz und stellt keine weiteren Fragen."
            ),
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = false WHERE name = 'kaia_system_v6_warm'")
    )
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = true WHERE name = 'kaia_system_v5_warm'")
    )
