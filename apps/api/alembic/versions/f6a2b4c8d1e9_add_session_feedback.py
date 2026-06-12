"""add session_feedback

Revision ID: f6a2b4c8d1e9
Revises: e5f1a3b2c8d7
Create Date: 2026-06-10

EMA (Ecological Momentary Assessment) signals captured inline during a session.
Four button types: transfer_marker, wow (passive), stuck, unclear (active — trigger meta question).
Required for thesis: in-session state monitoring, study analysis covariates.
DSGVO: Verhaltensdaten, user_id CASCADE-Delete, included in Art. 15/20 export.
"""

import sqlalchemy as sa

from alembic import op

revision = "f6a2b4c8d1e9"
down_revision = "e5f1a3b2c8d7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "session_feedback",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "message_id",
            sa.Integer(),
            sa.ForeignKey("messages.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("feedback_type", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
    )
    op.create_index("ix_session_feedback_session", "session_feedback", ["session_id"])
    op.create_index("ix_session_feedback_user", "session_feedback", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_session_feedback_user", table_name="session_feedback")
    op.drop_index("ix_session_feedback_session", table_name="session_feedback")
    op.drop_table("session_feedback")
