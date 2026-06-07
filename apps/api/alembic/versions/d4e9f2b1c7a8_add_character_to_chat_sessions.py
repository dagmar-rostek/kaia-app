"""add character to chat_sessions

Revision ID: d4e9f2b1c7a8
Revises: c8f2e4b6d1a3
Create Date: 2026-06-07 20:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "d4e9f2b1c7a8"
down_revision: str | None = "c8f2e4b6d1a3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Character (warm / challenging / wild) — determines which prompt template is used
    op.add_column(
        "chat_sessions",
        sa.Column("character", sa.String(20), nullable=False, server_default="warm"),
    )
    op.create_index("ix_chat_sessions_user_character", "chat_sessions", ["user_id", "character"])


def downgrade() -> None:
    op.drop_index("ix_chat_sessions_user_character", "chat_sessions")
    op.drop_column("chat_sessions", "character")
