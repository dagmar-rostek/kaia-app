"""Update KAIA prompt v3: session_mission block + 9th thinking check

Revision ID: o5j1k6l7m8n9
Revises: n4i0j5k6l7m8
Create Date: 2026-07-04

Changes:
- Add <session_mission> XML block: didactic mission, dominant type, forbidden types
- Add 9th thinking check: Session-Mission-Check
"""

import sqlalchemy as sa

from alembic import op

revision = "o5j1k6l7m8n9"
down_revision = "n4i0j5k6l7m8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V3_WARM

    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v3_warm'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes)"
            " VALUES (:name, :character, :template, TRUE, 3, :notes)"
        ),
        {
            "name": "kaia_system_v3_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V3_WARM,
            "notes": (
                "v3 + session_mission block (10-Phasen-Progressionsmodell nach Didaktiker) "
                "+ 9. thinking check (Session-Mission-Check)"
            ),
        },
    )


def downgrade() -> None:
    pass
