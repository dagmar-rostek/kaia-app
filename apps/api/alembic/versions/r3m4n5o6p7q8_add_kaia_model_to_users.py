"""add kaia_model to users

Revision ID: r3m4n5o6p7q8
Revises: q2l3m4n5o6p7
Create Date: 2026-07-11

Per-User-Modell-Zuweisung: null = globales System-Modell (Fallback).
Ermöglicht unterschiedliche LLM-Zuweisung pro Teilnehmer in der Studie.
"""

import sqlalchemy as sa

from alembic import op

revision = "r3m4n5o6p7q8"
down_revision = "q2l3m4n5o6p7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("kaia_model", sa.String(100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "kaia_model")
