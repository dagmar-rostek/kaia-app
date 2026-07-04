"""add user_learning_profiles table

Revision ID: l2g8h3i4b5c6
Revises: k1f7g2h3a4b5
Create Date: 2026-07-04 10:00:00.000000

Persistent learner profile derived from pre-survey (MSLQ + GSE).
Created exactly once per user after both pre-surveys are complete.
Stores raw baseline scores (for thesis reproducibility) and an
LLM-generated interpretation text used in every session prompt.

This is Layer 1 of the two-layer profile model:
  Layer 1 = this table (immutable baseline snapshot, never updated)
  Layer 2 = session_summary fields in chat_sessions (cumulative behavioral)

UNIQUE constraint on user_id prevents duplicate profiles even under
concurrent background-task execution (race condition guard).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "l2g8h3i4b5c6"
down_revision: str | None = "k1f7g2h3a4b5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_learning_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("gse_baseline", sa.Float(), nullable=False),
        sa.Column("gse_items", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("subscale_scores", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("profile_interpretation", sa.Text(), nullable=False),
        sa.Column("interpretation_prompt_hash", sa.String(64), nullable=False, server_default=""),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_learning_profiles_user_id"),
    )
    op.create_index(
        "ix_user_learning_profiles_user_id",
        "user_learning_profiles",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_user_learning_profiles_user_id", table_name="user_learning_profiles")
    op.drop_table("user_learning_profiles")
