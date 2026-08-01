"""fix: enforce single closing question in all active prompts

Revision ID: z1u2v3w4x5y6
Revises: y0t1u2v3w4x5
Create Date: 2026-08-01 00:00:00.000000

Changes:
- Re-inserts kaia_system_v7_warm with Phase 3 → single question
  (ABSCHLUSS-MODUS fix was silently failing since v6 — now correctly applied)
- Re-inserts kaia_system_v1_challenging with single closing question
- Re-inserts kaia_system_v1_wild with single closing question
- All prompts now: "Nie beide hintereinander — nicht in einem Turn, nicht in zwei"
"""

import sqlalchemy as sa

from alembic import op

revision: str = "z1u2v3w4x5y6"
down_revision: str | None = "y0t1u2v3w4x5"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    from app.domains.prompts.templates import (
        KAIA_PROMPT_V1_CHALLENGING,
        KAIA_PROMPT_V1_WILD,
        KAIA_PROMPT_V7_WARM,
    )

    conn = op.get_bind()

    # --- kaia_system_v7_warm ---
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
                "Warm character v7.1 — Phase 3 auf exakt eine Abschlussfrage reduziert "
                "(war: 2 Fragen in Folge). ABSCHLUSS-MODUS-Fix: replace()-Kette war seit v6 "
                "silent-failing — jetzt korrekt aktiv. "
                "Nach Abschlussfrage: keine weitere Frage. Session endet natuerlich."
            ),
        },
    )

    # --- kaia_system_v1_challenging ---
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v1_challenging'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes, created_at) "
            "VALUES (:name, :character, :template, :is_active, :version, :notes, NOW())"
        ),
        {
            "name": "kaia_system_v1_challenging",
            "character": "challenging",
            "template": KAIA_PROMPT_V1_CHALLENGING,
            "is_active": True,
            "version": 1,
            "notes": (
                "Challenging character v1.1 — Sessionstruktur: eine einzige Schlussfrage "
                "(war: Transfer-Frage → Erste-Schritt-Frage in Folge). Nie beide."
            ),
        },
    )

    # --- kaia_system_v1_wild ---
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v1_wild'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes, created_at) "
            "VALUES (:name, :character, :template, :is_active, :version, :notes, NOW())"
        ),
        {
            "name": "kaia_system_v1_wild",
            "character": "wild",
            "template": KAIA_PROMPT_V1_WILD,
            "is_active": True,
            "version": 1,
            "notes": (
                "Wild character v1.1 — Sessionende: eine einzige Abschlussfrage "
                "(war: überraschende Frage → Erste-Schritt in Folge). Nie zwei Fragen hintereinander."
            ),
        },
    )


def downgrade() -> None:
    # No meaningful downgrade — the prompts would need to be manually restored
    pass
