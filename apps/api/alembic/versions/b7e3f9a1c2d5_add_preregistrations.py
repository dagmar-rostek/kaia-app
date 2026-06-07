"""add preregistrations table

Revision ID: b7e3f9a1c2d5
Revises: a3f1b2c4d5e6
Create Date: 2026-06-07 12:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "b7e3f9a1c2d5"
down_revision: str | None = "a3f1b2c4d5e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "preregistrations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("reason", sa.String(500), nullable=False),
        sa.Column("unsubscribe_token", sa.String(36), nullable=False, unique=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_prereg_email", "preregistrations", ["email"])
    op.create_index("ix_prereg_token", "preregistrations", ["unsubscribe_token"])


def downgrade() -> None:
    op.drop_index("ix_prereg_token", "preregistrations")
    op.drop_index("ix_prereg_email", "preregistrations")
    op.drop_table("preregistrations")
