"""Update KAIA prompt v5_warm: KDG-Ausrichtung (Knowing-Doing Gap)

Revision ID: v7q8r9s0t1u2
Revises: u6p7q8r9s0t1
Create Date: 2026-07-20

Changes:
- Barrieren-Mapping in Session 1 (Schritt 4b): KAIA fragt bei erkanntem
  Vertrautheitssignal explizit nach Umsetzungsbarrieren vor dem Ersten Schritt.
- Fragetyp 5 auf Gollwitzer-Format umgestellt: Wann+Wo+Was+Hindernisplan
  statt vager Wochenfrage. Metaanalytischer Effekt d=.65 (Gollwitzer & Sheeran, 2006).
- Erster-Schritt-Loop: Differenziertes Barrier-Handling (Groesse / konkrete
  Barriere / Vergessen) statt pauschaler Groessenfrage.
- KDG-Check #12 in Thinking-Struktur: Erkennt KAIA "Ich weiss es, aber ich
  tue es nicht"-Signale und routet in Barrieren-Frage + Gollwitzer-Typ-5.
- Phase-3-Referenz: expliziter Gollwitzer-Format-Hinweis.
- Footer: "alle 11 Checks" -> "alle 12 Checks".

Begruendung: Knowing-Doing Gap (Pfeffer & Sutton, 2000) als zentrales
Zielgruppenproblem: Menschen scheitern nicht am fehlenden Wissen, sondern
an der Umsetzung. Implementation Intentions (Gollwitzer, 1999) sind der
empirisch staerkste Einzelmechanismus zur Schlieszung dieser Luecke.
"""

import sqlalchemy as sa

from alembic import op

revision = "v7q8r9s0t1u2"
down_revision = "u6p7q8r9s0t1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.domains.prompts.templates import KAIA_PROMPT_V5_WARM

    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = FALSE WHERE name = 'kaia_system_v4_warm'")
    )
    conn.execute(
        sa.text(
            "INSERT INTO prompt_templates (name, character, template, is_active, version, notes)"
            " VALUES (:name, :character, :template, TRUE, 5, :notes)"
        ),
        {
            "name": "kaia_system_v5_warm",
            "character": "warm",
            "template": KAIA_PROMPT_V5_WARM,
            "notes": (
                "v5_warm — KDG-Ausrichtung: Barrieren-Mapping Session 1 (Schritt 4b), "
                "Gollwitzer-Format Typ 5 (Wann+Wo+Was+Hindernisplan), "
                "differenziertes First-Step-Loop-Handling, KDG-Check #12."
            ),
        },
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM prompt_templates WHERE name = 'kaia_system_v5_warm'"))
    conn.execute(
        sa.text("UPDATE prompt_templates SET is_active = TRUE WHERE name = 'kaia_system_v4_warm'")
    )
