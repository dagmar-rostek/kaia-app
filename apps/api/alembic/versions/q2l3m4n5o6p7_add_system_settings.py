"""add system_settings

Revision ID: q2l3m4n5o6p7
Revises: p1k2l3m4n5o6
Create Date: 2026-07-05

system_settings: Key-Value-Store für Admin-konfigurierbare System-Parameter.
Initial: kaia_chat_model (welches LLM KAIA für Live-Chat + Eval-Simulation nutzt).
Switchen ohne Server-Neustart — Admin-UI schreibt via PUT /api/v1/admin/settings.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "q2l3m4n5o6p7"
down_revision: str | None = "p1k2l3m4n5o6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "system_settings",
        sa.Column("key", sa.String(100), primary_key=True),
        sa.Column("value", sa.String(500), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("system_settings")
