"""add consent_research_data to users

Revision ID: k1f7g2h3a4b5
Revises: j0e6f8g4h3c2
Create Date: 2026-07-03 10:00:00.000000

Adds explicit Art. 9 DSGVO consent field for psychological self-assessment data
(GSE scale). Required as separate consent because GSE responses are special
categories of personal data under Art. 9 DSGVO.

Existing users (simulation accounts) get False; real study participants must
re-consent via the registration form which now includes this checkbox.
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "k1f7g2h3a4b5"
down_revision: str | None = "j0e6f8g4h3c2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "consent_research_data",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "consent_research_data")
