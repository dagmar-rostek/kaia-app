"""add chat, survey, roadmap, profile tables

Revision ID: a3f1b2c4d5e6
Revises: c5fceead2dd4
Create Date: 2026-06-05 09:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "a3f1b2c4d5e6"
down_revision: str | Sequence[str] | None = "c5fceead2dd4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── roadmap_goals (referenced by chat_sessions) ────────────────────────
    op.create_table(
        "roadmap_goals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("domain", sa.String(100), nullable=True),
        sa.Column("why", sa.Text(), nullable=True),
        sa.Column("deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(10), nullable=False, server_default="open"),
        sa.Column("progress_pct", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_roadmap_goals_user_status", "roadmap_goals", ["user_id", "status"])

    # ── chat_sessions ─────────────────────────────────────────────────────
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("daily_plan", sa.Text(), nullable=True),
        sa.Column("active_goal_id", sa.Integer(), sa.ForeignKey("roadmap_goals.id", ondelete="SET NULL"), nullable=True),
        sa.Column("session_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("initial_mode", sa.String(20), nullable=False, server_default="sokratisch"),
        sa.Column("final_mode", sa.String(20), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("session_summary", sa.Text(), nullable=True),
    )
    op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"])
    op.create_index("ix_chat_sessions_user_started", "chat_sessions", ["user_id", "started_at"])

    # ── messages ──────────────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("detected_state", sa.String(20), nullable=True),
        sa.Column("interaction_mode", sa.String(20), nullable=True),
    )
    op.create_index("ix_messages_session_id", "messages", ["session_id"])

    # ── memory_chunks (pgvector) ──────────────────────────────────────────
    # Create table without embedding column first, then add it with proper vector type
    op.create_table(
        "memory_chunks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("chunk_type", sa.String(20), nullable=False, server_default="insight"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    # Add vector column using raw SQL (pgvector extension already enabled above)
    op.execute("ALTER TABLE memory_chunks ADD COLUMN embedding vector(1536)")
    op.create_index("ix_memory_chunks_user", "memory_chunks", ["user_id"])

    # ── gse_results ───────────────────────────────────────────────────────
    op.create_table(
        "gse_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("measurement_type", sa.String(10), nullable=False),
        sa.Column("items", postgresql.JSONB(), nullable=False),
        sa.Column("total_score", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_gse_results_user_type", "gse_results", ["user_id", "measurement_type"])

    # ── consent_logs ──────────────────────────────────────────────────────
    op.create_table(
        "consent_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("meta", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_consent_logs_user_id", "consent_logs", ["user_id"])

    # ── user_profiles ─────────────────────────────────────────────────────
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        # STABLE
        sa.Column("gse_baseline", sa.Float(), nullable=True),
        sa.Column("preferred_interaction", sa.String(20), nullable=True),
        sa.Column("study_context", sa.Text(), nullable=True),
        # DYNAMIC
        sa.Column("strengths_summary", sa.Text(), nullable=True),
        sa.Column("friction_points_summary", sa.Text(), nullable=True),
        sa.Column("vocabulary_level", sa.String(20), nullable=True),
        sa.Column("response_pattern", sa.String(20), nullable=True),
        sa.Column("last_session_mood", sa.String(20), nullable=True),
        # SESSION-AGGREGATED
        sa.Column("topics_covered", postgresql.JSONB(), nullable=True),
        sa.Column("open_questions", postgresql.JSONB(), nullable=True),
        sa.Column("milestone_moments", postgresql.JSONB(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_user_profiles_user_id", "user_profiles", ["user_id"])


def downgrade() -> None:
    op.drop_table("user_profiles")
    op.drop_table("consent_logs")
    op.drop_table("gse_results")
    op.drop_table("memory_chunks")
    op.drop_table("messages")
    op.drop_table("chat_sessions")
    op.drop_table("roadmap_goals")
    op.execute("DROP EXTENSION IF EXISTS vector")
