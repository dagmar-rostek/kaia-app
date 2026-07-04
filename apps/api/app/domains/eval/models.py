"""Eval-Domain: SQLAlchemy 2.0 async models.

Drei Tabellen:
  eval_runs        — ein Run = ein Aufruf des LLM-Evaluators über N Personas × M Sessions
  eval_results     — ein Ergebnis pro Persona × Session × Metrik
  eval_transcripts — vollständiges Transkript pro Persona × Session (normalisiert aus eval_runs)

Design-Entscheidungen (Details im ADR-002):
- eval_results hat einen Row pro Metrik, nicht eine Spalte pro Metrik.
  Begründung: 7 Metriken heute, möglicherweise mehr morgen. Spalten-Schema würde jede
  Metrik-Erweiterung in eine Alembic-Migration zwingen und macht partial-Index-Queries komplizierter.
- eval_transcripts ist eine eigene Tabelle (nicht JSONB in eval_runs), weil Heatmap-Queries
  (GROUP BY persona_id, session_number) keine Transkripte brauchen — separate Tabelle verhindert
  unnötigen Speicher-I/O bei diesen aggregierten Abfragen.
- run_id ist ein String (nicht INT), weil der bestehende Simulator bereits String-Run-IDs
  produziert (crash_test_YYYYMMDD_HHMMSS). Kompatibilität vor Sauberkeit.
- Kein separate admin_users-Tabelle: triggered_by referenziert users.email (String),
  weil Admin-Auth über JWT läuft und der Username schon im Token ist.
"""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class EvalRunStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class MetricKey(StrEnum):
    """Die 7 Eval-Metriken. Entsprechend judge-prompt-Dateien in prompts/eval/.

    M7 wird nur für Personas/Sessions mit erwartetem Krisensignal ausgeführt
    (P04_Krisenfall ab S6, oder jede Session mit explizitem Krisensignal).
    """

    M1_SOCRATIC_PURITY = "m1_socratic_purity"
    M2_MISSION_ADHERENCE = "m2_mission_adherence"
    M3_PERSONA_RESPONSIVENESS = "m3_persona_responsiveness"
    M4_QUESTION_DEPTH = "m4_question_depth"
    M5_SEQUENCE_COHERENCE = "m5_sequence_coherence"
    M6_AUTONOMY_PRESERVATION = "m6_autonomy_preservation"
    M7_CRISIS_DETECTION = "m7_crisis_detection"  # nur P04/S6 und höher


class EvalRun(Base):
    """Ein vollständiger Evaluations-Durchlauf.

    Startet der Admin per POST /admin/eval/runs, läuft dann im Hintergrund.
    Status-Polling via GET /admin/eval/runs/{run_id}/status.
    """

    __tablename__ = "eval_runs"

    # Gleicher String-Format wie Simulation: crash_test_YYYYMMDD_HHMMSS oder eval_YYYYMMDD_HHMMSS
    id: Mapped[str] = mapped_column(String(100), primary_key=True)

    # Wer hat den Run ausgelöst (Admin-Username aus JWT)
    triggered_by: Mapped[str] = mapped_column(String(100))

    status: Mapped[EvalRunStatus] = mapped_column(
        String(20), default=EvalRunStatus.PENDING, index=True
    )

    # Konfiguration: welche Personas/Sessions wurden evaluiert.
    # JSONB, nicht normalisiert — diese Daten werden nie gefiltert, nur gelesen.
    # Format: {"persona_ids": ["P01", ...], "session_numbers": [1, ..., 10], "all_personas": true}
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, default=dict)

    # Das LLM-Modell, das als Judge agiert (gepinnte Model-ID, nicht generisch)
    evaluator_model: Mapped[str] = mapped_column(String(80))

    # Gesamtkosten des Eval-Runs (Summe aller Judge-Calls in EUR)
    total_cost_eur: Mapped[float | None] = mapped_column(Numeric(10, 6), nullable=True)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Fehler-Detail wenn status=failed
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Verknüpfung mit dem Simulations-Run, dessen Transkripte evaluiert werden
    simulation_run_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    results: Mapped[list[EvalResult]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )
    transcripts: Mapped[list[EvalTranscript]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )


class EvalResult(Base):
    """Ein Metrik-Score für genau eine Persona × Session × Metrik-Kombination.

    Pro Persona × Session gibt es bis zu 7 Rows (M1–M6 immer, M7 nur wenn applicable).
    Das erlaubt:
    - Partial-Updates (Retest schreibt nur die betroffenen Rows neu)
    - Metrik-spezifische Heatmaps ohne Schema-Änderung
    - Flagging pro Metrik

    Keine UNIQUE-Constraint auf (run_id, persona_id, session_number, metric_key) wegen Retests:
    Ein Retest erzeugt einen neuen eval_run (parent_run_id zeigt auf Original), damit die
    Ergebnishistorie erhalten bleibt — kein Update in place.
    """

    __tablename__ = "eval_results"

    id: Mapped[int] = mapped_column(primary_key=True)

    run_id: Mapped[str] = mapped_column(
        ForeignKey("eval_runs.id", ondelete="CASCADE"),
        index=True,
    )

    # Persona-Identifier (z.B. "P01_Schweiger") — kein FK auf users,
    # weil Personas synthetisch sind und user_ids zwischen Runs variieren
    persona_id: Mapped[str] = mapped_column(String(50))
    session_number: Mapped[int] = mapped_column(SmallInteger)  # 1–10

    metric_key: Mapped[MetricKey] = mapped_column(String(40))

    # Score 0–3 (Integer). Null wenn der Evaluator keinen Score liefern konnte.
    score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    # Freitext-Begründung des LLM-Judges (max ~500 Zeichen, aber kein Hard-Limit)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)

    # True wenn diese Metrik einen Alarm-Wert zeigt (Score <= 1 oder crisis_triggered=True)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False)

    # Nur für M7 (crisis detection): wurde eine Crisis-Response getriggert?
    crisis_triggered: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Manuelle Korrektur durch Admin (AI-Vertrauens-UX-Anforderung aus UX-Spec)
    override_score: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    override_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    override_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    override_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run: Mapped[EvalRun] = relationship(back_populates="results")

    __table_args__ = (
        # Heatmap-Query: GROUP BY persona_id, session_number — dieser Index trägt die Last
        Index("ix_eval_results_run_persona_session", "run_id", "persona_id", "session_number"),
        # Metrik-spezifische Heatmap-Queries
        Index("ix_eval_results_run_metric", "run_id", "metric_key"),
    )


class EvalTranscript(Base):
    """Vollständiges Transkript einer Persona × Session, normalisiert aus eval_runs.

    Separate Tabelle, nicht JSONB in EvalResult, weil:
    1. Heatmap-Queries brauchen keine Transkripte → kein unnötiger I/O
    2. Ein Transkript pro Persona × Session, nicht pro Metrik (wäre 7× Duplikat in eval_results)
    3. Spätere Volltextsuche oder Chunk-Extraktion ist einfacher in eigener Tabelle

    messages-Format (JSONB-Array):
    [
      {"role": "system", "content": "..."},
      {"role": "user", "content": "...", "exchange_index": 1},
      {"role": "assistant", "content": "...", "exchange_index": 1, "flagged": false},
      ...
    ]

    flagged_exchanges ist ein JSONB-Array der auffälligen Exchange-Indices:
    [{"index": 3, "criterion": "m3_persona_responsiveness", "flag_reason": "..."}]
    """

    __tablename__ = "eval_transcripts"

    id: Mapped[int] = mapped_column(primary_key=True)

    run_id: Mapped[str] = mapped_column(
        ForeignKey("eval_runs.id", ondelete="CASCADE"),
        index=True,
    )

    persona_id: Mapped[str] = mapped_column(String(50))
    session_number: Mapped[int] = mapped_column(SmallInteger)

    # Vollständiges Transkript als JSONB-Array
    messages: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)

    # Auffällige Exchanges (Subset aus messages, angereichert mit Flag-Grund)
    flagged_exchanges: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)

    # LLM-generierter Gesamt-Befund für diese Persona × Session
    overall_finding: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run: Mapped[EvalRun] = relationship(back_populates="transcripts")

    __table_args__ = (
        # Detail-Lookup: run + persona + session → genau ein Transkript
        UniqueConstraint(
            "run_id", "persona_id", "session_number", name="uq_eval_transcripts_run_persona_session"
        ),
        Index("ix_eval_transcripts_run_persona", "run_id", "persona_id"),
    )
