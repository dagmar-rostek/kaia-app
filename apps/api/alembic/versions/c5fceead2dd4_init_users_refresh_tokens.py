"""init_users_refresh_tokens

Revision ID: c5fceead2dd4
Revises:
Create Date: 2026-05-30 15:05:50.547861

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c5fceead2dd4"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        # Consent (DSGVO Art. 7 — Zeitpunkt ist Pflicht)
        sa.Column("consent_data", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("consent_analytics", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("consent_version", sa.String(20), nullable=False, server_default="1.0"),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=True),
        # Onboarding
        sa.Column("onboarding_complete", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("ki_disclosure_seen_at", sa.DateTime(timezone=True), nullable=True),
        # Admin-Approval
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", sa.String(50), nullable=True),
        # Security
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_login_count", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        # Soft-Delete (DSGVO Art. 17)
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deletion_reason", sa.String(100), nullable=True),
        # Audit
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("family", sa.String(36), nullable=False),
        sa.Column(
            "issued_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoke_reason", sa.String(50), nullable=True),
        sa.Column("user_agent", sa.String(255), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
    )
    op.create_index(
        "ix_refresh_tokens_user_active",
        "refresh_tokens",
        ["user_id", "revoked_at"],
    )


def downgrade() -> None:
    op.drop_table("refresh_tokens")
    op.drop_table("users")
