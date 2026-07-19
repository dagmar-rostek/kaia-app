"""Update KAIA prompt v5: Schweiger-Check #11 + erweiterter Rupture-Repair

Revision ID: u6p7q8r9s0t1
Revises: t5o6p7q8r9s0
Create Date: 2026-07-19

Changes:
- Thinking-Check #11: Schweiger-Check — unterscheidet Fragenabstraktion
  (Lernender hat keine Antwort weil Frage zu abstrakt) von emotionalem
  Rueckzug (Lernender signalisiert Distanz zu KAIA).
- Fragenabstraktion-Reaktion: Fragetyp verkleinern (Typ 1 enger Scope
  oder Typ 5 konkrete Situation) statt Rupture-Repair.
- Rupture-Repair-Sektion: Ursachen-Bestimmung als Pflichtschritt eingefuegt.
- Footer: "alle 10 Checks" -> "alle 11 Checks".
- Neuer Template-Name: kaia_system_v4_warm (v3_warm deaktiviert).

Begruendung: Goldset-Analyse (m3-g004) und Baseline-Eval-Vorbereitung zeigten
dass Schweiger-Persona (P01) systematisch falsch behandelt wurde: einsilbige
Antworten ohne emotionalen Subtext loesten Rupture-Repair aus statt
Fragetyp-Verkleinerung. Der Meta-Kommentar ("Ich merke, dass das gerade nicht
passt") ist korrekt fuer emotionalen Rueckzug aber kontraproduktiv wenn der
Lernende einfach keine abstrakte Frage beantworten kann.
"""

import sqlalchemy as sa

from alembic import op

revision = "u6p7q8r9s0t1"
down_revision = "t5o6p7q8r9s0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V4_WARM

    conn = op.get_bind()
    # Deactivate v3_warm
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = FALSE WHERE name = 'kaia_system_v3_warm'")
    )
    # Insert v4_warm as active
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes)"
            " VALUES (:name, :character, :template, TRUE, 1, :notes)"
        ),
        {
            "name": "kaia_system_v4_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V4_WARM,
            "notes": (
                "v4_warm (prompt v5) — Schweiger-Check #11: Fragenabstraktion vs. "
                "emotionaler Rueckzug. Rupture-Repair nur bei emotionalem Subtext. "
                "Fragetyp-Verkleinerung fuer Schweiger-Muster."
            ),
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v4_warm'"))
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = TRUE WHERE name = 'kaia_system_v3_warm'")
    )
