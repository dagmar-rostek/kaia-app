"""add preferred_name to users

Revision ID: w8r9s0t1u2v3
Revises: v7q8r9s0t1u2
Create Date: 2026-07-26 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

revision: str = "w8r9s0t1u2v3"
down_revision: str | None = "v7q8r9s0t1u2"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("preferred_name", sa.String(50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "preferred_name")
