"""add thinking_raw to messages

Revision ID: e5f1a3b2c8d7
Revises: d4e9f2b1c7a8
Create Date: 2026-06-09

Stores the raw <thinking> block of each KAIA assistant message.
Required for thesis: research audit trail, per-session analysis,
LLM evaluation report (empathy quality, socratic reasoning patterns).
"""

import sqlalchemy as sa

from alembic import op

revision = "e5f1a3b2c8d7"
down_revision = "d4e9f2b1c7a8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("thinking_raw", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("messages", "thinking_raw")
