"""add learning_topic to prompt templates

Revision ID: j0e6f8g4h3c2
Revises: i9d5e7f3a2b1
Create Date: 2026-06-22 11:00:00.000000

Patches all active prompt templates to include {{ learning_topic }} in the
session context section. The variable is now passed by PromptContext — without
this patch, the DB templates would silently ignore the new variable.

Strategy: insert '<lernthema>{{ learning_topic }}</lernthema>' before the
existing '{% if outcome %}' block which every active template has.
"""

from collections.abc import Sequence

from alembic import op

revision: str = "j0e6f8g4h3c2"
down_revision: str | None = "i9d5e7f3a2b1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_MARKER = "{% if outcome %}"
_INJECTION = "{% if learning_topic %}\n<lernthema>{{ learning_topic }}</lernthema>\n{% endif %}\n"


def upgrade() -> None:
    # Data migration — hardcoded Jinja2 template strings, no user input involved
    sql = (
        "UPDATE prompt_templates "
        "SET template = replace(template, '" + _MARKER + "', '" + _INJECTION + _MARKER + "') "
        "WHERE is_active = true "
        "  AND template LIKE '%{% if outcome %}%' "
        "  AND template NOT LIKE '%learning_topic%'"
    )
    op.execute(sql)  # noqa: S608


def downgrade() -> None:
    sql = (
        "UPDATE prompt_templates "
        "SET template = replace(template, '" + _INJECTION + _MARKER + "', '" + _MARKER + "') "
        "WHERE template LIKE '%learning_topic%' "
        "  AND template LIKE '%{% if outcome %}%'"
    )
    op.execute(sql)  # noqa: S608
