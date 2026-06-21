"""add mslq_results table

Revision ID: g7b3c5a1d8f2
Revises: f6a2b4c8d1e9
Create Date: 2026-06-21 10:00:00.000000

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "g7b3c5a1d8f2"
down_revision = "f6a2b4c8d1e9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "mslq_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("measurement_type", sa.String(length=10), nullable=False),
        sa.Column("items", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("subscale_scores", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mslq_results_user_type", "mslq_results", ["user_id", "measurement_type"])


def downgrade() -> None:
    op.drop_index("ix_mslq_results_user_type", table_name="mslq_results")
    op.drop_table("mslq_results")
