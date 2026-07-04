"""add KAIA warm prompt v3 — session-aware, profile-integrated

Revision ID: m3h9i4j5k6l7
Revises: l2g8h3i4b5c6
Create Date: 2026-07-04 11:00:00.000000

Activates warm character prompt v3 which adds:
- session_number / session_phase / is_final_session context variables
- Persistent learner profile (learner_profile, gse_baseline) from pre-survey
- Cumulative session history summary (session_history_summary)
- Historical strongest quotes for contradiction work (historical_quotes, Sessions 6-8)
- Mandatory Session-5 milestone trigger (obligatorischer Halbzeit-Spiegel)
- Session-10 three-task closing logic (didactic + psychological + research/GSE-timing)

Deactivates warm v2 — kept in DB for eval regression baseline.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op
from app.domains.prompts.templates import KAIA_PROMPT_V3_WARM

revision: str = "m3h9i4j5k6l7"
down_revision: str | None = "l2g8h3i4b5c6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_V3_NOTES = (
    "Warm character v3 — session_number/session_phase/is_final_session context, "
    "persistent learner profile (learner_profile, gse_baseline), "
    "cumulative session history (session_history_summary), "
    "historical quotes for contradiction work (historical_quotes), "
    "mandatory Session-5 milestone trigger, Session-10 three-task closing logic."
)


def upgrade() -> None:
    conn = op.get_bind()

    # Deactivate v2
    conn.execute(
        sa.text(
            "UPDATE prompt_templates SET is_active = FALSE "
            "WHERE name = 'kaia_system_v2_warm' AND character = 'warm'"
        )
    )

    # Insert v3 — delete-then-insert (idempotent, no UNIQUE constraint needed)

    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v3_warm'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes) "
            "VALUES (:name, :character, :template, TRUE, 3, :notes)"
        ),
        {
            "name": "kaia_system_v3_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V3_WARM,
            "notes": _V3_NOTES,
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = FALSE WHERE name = 'kaia_system_v3_warm'")
    )
    conn.execute(
        sa.text(
            "UPDATE prompt_templates SET is_active = TRUE "
            "WHERE name = 'kaia_system_v2_warm' AND character = 'warm'"
        )
    )
