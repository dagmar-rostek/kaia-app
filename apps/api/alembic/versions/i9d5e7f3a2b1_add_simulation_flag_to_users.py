"""add simulation flag to users

Revision ID: i9d5e7f3a2b1
Revises: h8c4d6e2f9a1
Create Date: 2026-06-22 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "i9d5e7f3a2b1"
down_revision: str | None = "h8c4d6e2f9a1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("is_simulation", sa.Boolean(), nullable=False, server_default="false")
    )
    op.add_column("users", sa.Column("simulation_run", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "simulation_run")
    op.drop_column("users", "is_simulation")
