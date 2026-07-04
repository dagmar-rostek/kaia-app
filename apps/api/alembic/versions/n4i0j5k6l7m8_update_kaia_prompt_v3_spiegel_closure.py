"""Update KAIA prompt v3: Spiegel-Stimme + Turn-8-Abschluss-Modus

Revision ID: n4i0j5k6l7m8
Revises: m3h9i4j5k6l7
Create Date: 2026-07-04

Changes:
- Add reflective "Spiegel-Stimme" framing for session > 1 opening
- Add ABSCHLUSS-MODUS instruction at user_turns >= 8
"""

import sqlalchemy as sa

from alembic import op

revision = "n4i0j5k6l7m8"
down_revision = "m3h9i4j5k6l7"
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
                "v3 + Spiegel-Stimme (session>1 opening als eigene Reflexion) "
                "+ ABSCHLUSS-MODUS ab user_turns>=8"
            ),
        },
    )


def downgrade() -> None:
    # No rollback — prompt content changes are forward-only
    pass
