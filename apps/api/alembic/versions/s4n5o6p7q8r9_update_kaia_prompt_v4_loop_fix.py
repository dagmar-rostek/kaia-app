"""Update KAIA prompt v4: Typ-5-loop fix + Koan/Analogie erlaubt

Revision ID: s4n5o6p7q8r9
Revises: r3m4n5o6p7q8
Create Date: 2026-07-15

Changes:
- Thinking-Check #10: Typ-5-Loop-Check (kein Typ-5 wenn bereits in letzten 2 Turns gestellt)
- Phase-3-Abschluss de-prozeduralisiert: Typ-5 ODER Koan/Analogie nach Kontext
- Charakter-Abschnitt: Analogie/Koan/Perspektivwechsel explizit als erlaubte Impuls-Form
- Footer: "alle 8 Checks" -> "alle 10 Checks"

Begruendung: Pilotbefund — vierfache Kodierung von Fragetyp 5 erzeugte horizontales
Looping. Wild-Charakter wurde als sokratischer erlebt; Wild als Primärmodus verworfen
(Crisis-Detection, Reproduzierbarkeit, Eval-Kompatibilitaet). Drei chirurgische
Aenderungen integrieren Wild-Offenheit in den strukturierten Warm-Charakter.
"""

import sqlalchemy as sa

from alembic import op

revision = "s4n5o6p7q8r9"
down_revision = "r3m4n5o6p7q8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V3_WARM

    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v3_warm'"))
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes)"
            " VALUES (:name, :character, :template, TRUE, 4, :notes)"
        ),
        {
            "name": "kaia_system_v3_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V3_WARM,
            "notes": (
                "v4 — Typ-5-Loop-Check (#10), Phase-3 de-prozeduralisiert "
                "(Typ-5 ODER Koan/Analogie), Charakter: Koan/Analogie explizit erlaubt. "
                "Pilotbefund: horizontales Typ-5-Looping durch vierfache Kodierung."
            ),
        },
    )


def downgrade() -> None:
    pass
