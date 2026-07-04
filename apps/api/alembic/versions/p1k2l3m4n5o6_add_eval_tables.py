"""add eval_runs, eval_results, eval_transcripts

Revision ID: p1k2l3m4n5o6
Revises: o5j1k6l7m8n9
Create Date: 2026-07-04

Drei neue Tabellen für das LLM-Evaluations-System:
  eval_runs        — Eval-Run-Metadaten (Status, Kosten, Konfiguration)
  eval_results     — Scores pro Persona × Session × Metrik (Row-per-Metric-Design)
  eval_transcripts — Vollständige Transkripte, normalisiert (1 Row pro Persona × Session)

Index-Strategie (Begründung im ADR-002):
  - eval_results: (run_id, persona_id, session_number) — trägt Heatmap-GROUP-BY-Query
  - eval_results: (run_id, metric_key) — trägt Metrik-spezifische Heatmap-Filterung
  - eval_transcripts: UNIQUE (run_id, persona_id, session_number) — verhindert Doppel-Einträge
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "p1k2l3m4n5o6"
down_revision: str | None = "o5j1k6l7m8n9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── eval_runs ─────────────────────────────────────────────────────────────
    op.create_table(
        "eval_runs",
        sa.Column("id", sa.String(100), primary_key=True),
        sa.Column("triggered_by", sa.String(100), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("config", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("evaluator_model", sa.String(80), nullable=False),
        sa.Column("total_cost_eur", sa.Numeric(10, 6), nullable=True),
        sa.Column("simulation_run_id", sa.String(100), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_eval_runs_status", "eval_runs", ["status"])
    op.create_index("ix_eval_runs_simulation_run_id", "eval_runs", ["simulation_run_id"])

    # ── eval_results ──────────────────────────────────────────────────────────
    op.create_table(
        "eval_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "run_id",
            sa.String(100),
            sa.ForeignKey("eval_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("persona_id", sa.String(50), nullable=False),
        sa.Column("session_number", sa.SmallInteger(), nullable=False),
        sa.Column("metric_key", sa.String(40), nullable=False),
        # score: 0–3 Integer, NULL wenn Evaluator keinen Score liefern konnte
        sa.Column("score", sa.SmallInteger(), nullable=True),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("flagged", sa.Boolean(), nullable=False, server_default="false"),
        # M7 only
        sa.Column("crisis_triggered", sa.Boolean(), nullable=True),
        # Manuelle Admin-Korrektur (AI-Vertrauens-UX)
        sa.Column("override_score", sa.SmallInteger(), nullable=True),
        sa.Column("override_reason", sa.Text(), nullable=True),
        sa.Column("override_by", sa.String(100), nullable=True),
        sa.Column("override_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    # Heatmap-Query: GROUP BY persona_id, session_number — meist genutzt
    op.create_index(
        "ix_eval_results_run_persona_session",
        "eval_results",
        ["run_id", "persona_id", "session_number"],
    )
    # Metrik-Filter in der Heatmap (z.B. "zeige nur Sokratik-Scores")
    op.create_index(
        "ix_eval_results_run_metric",
        "eval_results",
        ["run_id", "metric_key"],
    )

    # ── eval_transcripts ──────────────────────────────────────────────────────
    op.create_table(
        "eval_transcripts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "run_id",
            sa.String(100),
            sa.ForeignKey("eval_runs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("persona_id", sa.String(50), nullable=False),
        sa.Column("session_number", sa.SmallInteger(), nullable=False),
        sa.Column("messages", postgresql.JSONB(), nullable=False),
        sa.Column("flagged_exchanges", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("overall_finding", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    # UNIQUE: pro Run genau ein Transkript pro Persona × Session
    op.create_unique_constraint(
        "uq_eval_transcripts_run_persona_session",
        "eval_transcripts",
        ["run_id", "persona_id", "session_number"],
    )
    op.create_index(
        "ix_eval_transcripts_run_persona",
        "eval_transcripts",
        ["run_id", "persona_id"],
    )


def downgrade() -> None:
    op.drop_table("eval_transcripts")
    op.drop_table("eval_results")
    op.drop_table("eval_runs")
