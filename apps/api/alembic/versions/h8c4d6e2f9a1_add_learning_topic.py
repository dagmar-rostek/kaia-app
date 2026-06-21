"""add learning_topic to users

Revision ID: h8c4d6e2f9a1
Revises: g7b3c5a1d8f2
Create Date: 2026-06-21

"""

import sqlalchemy as sa

from alembic import op

revision = "h8c4d6e2f9a1"
down_revision = "g7b3c5a1d8f2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("learning_topic", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "learning_topic")
