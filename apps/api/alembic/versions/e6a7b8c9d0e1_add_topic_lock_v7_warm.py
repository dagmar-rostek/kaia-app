"""feat: add topic-lock (Thema-Anker) to V7 warm prompt

Revision ID: e6a7b8c9d0e1
Revises: d5y6z7a8b9c0
Create Date: 2026-08-02 00:00:00.000000

Changes:
- Re-inserts kaia_system_v7_warm with [THEMA-ANKER] block (ab Session 2):
  When the learner wants to change the learning topic, KAIA does NOT follow.
  Instead KAIA asks a bridging question: "Was verbindet [neues Thema] mit
  [Lernthema]?" The topic is the study measurement variable — changing it
  mid-study breaks longitudinal continuity.
"""

import sqlalchemy as sa

from alembic import op

revision: str = "e6a7b8c9d0e1"
down_revision: str | None = "d5y6z7a8b9c0"
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
                "Warm character v7 (2026-08-02) — "
                "Thema-Anker: Topic-Lock ab Session 2. Wenn Lernende das Thema wechseln wollen, "
                "stellt KAIA eine Verbindungsfrage statt das neue Thema aufzunehmen. "
                "Lernthema ist Messvariable der Studie — Wechsel unterbricht Laengsschnitt-Kontinuitaet. "
                "Alle bisherigen v7-Constraints bleiben erhalten "
                "(EINZEL-FRAGE, Konzept-Drift-Sperre, Direktfrage-Verbot, Check #15)."
            ),
        },
    )


def downgrade() -> None:
    pass
