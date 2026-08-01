"""fix: IFS-drift-sperre und Direktfrage-Verbot in V7 warm

Revision ID: a2v3w4x5y6z7
Revises: z1u2v3w4x5y6
Create Date: 2026-08-01 00:00:00.000000

Changes:
- Re-inserts kaia_system_v7_warm with:
  - Konzept-Drift-Sperre: Metapher != Framework-Erlaubnis
    (Teile-Sprache des Lernenden != Erlaubnis fuer IFS-Interventionen)
  - Direktfrage-Verbot: KAIA beantwortet keine direkten Fragen
    ('hast du einen Namen fuer mich?' etc.)
  - Check #15: Direktfrage-Check im Thinking-Block
"""

import sqlalchemy as sa

from alembic import op

revision: str = "a2v3w4x5y6z7"
down_revision: str | None = "z1u2v3w4x5y6"
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
                "Warm character v7 (2026-08-01) — "
                "Konzept-Drift-Sperre: Metapher-Spiegel ja, IFS-Interventionen nein "
                "(auch bei Teile-Sprache des Lernenden). "
                "Direktfrage-Verbot: KAIA beantwortet keine direkten Fragen "
                "('hast du einen Namen?', 'was wuerdest du sagen?') — zurueckfragen statt antworten. "
                "Check #15 (Direktfrage-Check) im Thinking-Block."
            ),
        },
    )


def downgrade() -> None:
    pass
