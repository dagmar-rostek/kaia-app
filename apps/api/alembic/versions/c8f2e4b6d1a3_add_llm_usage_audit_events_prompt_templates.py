"""add llm_usage, audit_events, prompt_templates

Revision ID: c8f2e4b6d1a3
Revises: b7e3f9a1c2d5
Create Date: 2026-06-07 18:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "c8f2e4b6d1a3"
down_revision: str | None = "b7e3f9a1c2d5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── prompt_templates ──────────────────────────────────────────────────────
    op.create_table(
        "prompt_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, index=True),
        sa.Column("character", sa.String(20), nullable=False),
        sa.Column("template", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_by", sa.String(50), nullable=True),
    )
    op.create_index("ix_prompt_templates_name", "prompt_templates", ["name"])
    op.create_index(
        "ix_prompt_templates_character_active", "prompt_templates", ["character", "is_active"]
    )

    # ── llm_usage ─────────────────────────────────────────────────────────────
    op.create_table(
        "llm_usage",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("chat_sessions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("provider", sa.String(20), nullable=False),  # claude | openai | mistral
        sa.Column("model", sa.String(60), nullable=False),  # claude-sonnet-4-6 etc.
        sa.Column("prompt_variant_id", sa.Integer(), nullable=True),  # FK to prompt_templates
        sa.Column("input_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("output_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("thinking_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cost_eur", sa.Numeric(10, 6), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_llm_usage_session_id", "llm_usage", ["session_id"])
    op.create_index("ix_llm_usage_user_id", "llm_usage", ["user_id"])
    op.create_index("ix_llm_usage_created_at", "llm_usage", ["created_at"])

    # ── audit_events ──────────────────────────────────────────────────────────
    # Append-only DSGVO audit log — never update or delete rows
    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "event_type", sa.String(50), nullable=False
        ),  # e.g. "data_export", "account_delete"
        sa.Column("actor", sa.String(50), nullable=True),  # "user" | "admin" | "system"
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("meta", postgresql.JSONB(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_events_user_id", "audit_events", ["user_id"])
    op.create_index("ix_audit_events_event_type", "audit_events", ["event_type"])
    op.create_index("ix_audit_events_timestamp", "audit_events", ["timestamp"])


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("llm_usage")
    op.drop_table("prompt_templates")
