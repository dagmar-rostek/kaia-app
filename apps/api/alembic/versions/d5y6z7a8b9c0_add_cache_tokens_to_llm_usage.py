"""fix: add cache token columns to llm_usage for cost transparency

Revision ID: d5y6z7a8b9c0
Revises: c4x5y6z7a8b9
Create Date: 2026-08-02 00:00:00.000000

Changes:
- ADD cache_creation_tokens INT DEFAULT 0 to llm_usage
- ADD cache_read_tokens INT DEFAULT 0 to llm_usage
- Fix claude-sonnet-4-6 prices: $2.70/$13 → $3/$15 per MTok (comment only, prices live in sse.py)
"""

import sqlalchemy as sa

from alembic import op

revision: str = "d5y6z7a8b9c0"
down_revision: str | None = "c4x5y6z7a8b9"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    op.add_column(
        "llm_usage",
        sa.Column("cache_creation_tokens", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "llm_usage",
        sa.Column("cache_read_tokens", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("llm_usage", "cache_read_tokens")
    op.drop_column("llm_usage", "cache_creation_tokens")
