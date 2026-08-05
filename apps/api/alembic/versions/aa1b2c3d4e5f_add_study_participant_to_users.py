"""feat: add study_participant flag to users table

Revision ID: aa1b2c3d4e5f
Revises: z1u2v3w4x5y6
Create Date: 2026-08-05 00:00:00.000000

Changes:
- Adds study_participant BOOLEAN NOT NULL DEFAULT FALSE to users table
- Allows admin to mark which active users count for the study cohort
- Export and Auswertung endpoints filter on this flag
"""

import sqlalchemy as sa

from alembic import op

revision: str = "aa1b2c3d4e5f"
down_revision: str | None = "e6a7b8c9d0e1"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("study_participant", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("users", "study_participant")
