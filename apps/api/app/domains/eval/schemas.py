"""Pydantic v2 Request/Response-Schemas für die Eval-Domain.

Namenskonvention: *Read = Response-Schema, *Create = Request-Schema.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domains.eval.models import EvalRunStatus, MetricKey

# ── Request-Schemas ────────────────────────────────────────────────────────────


class EvalRunCreate(BaseModel):
    """POST /admin/eval/runs — startet einen neuen Eval-Run.

    Zwei Modi:
    - simulation_run_id = None  → LLM-Simulation: eval_personas.py Personas werden live simuliert
    - simulation_run_id = "..."  → Crash-Test-Eval: bestehende Transkripte aus dem Crash-Test-Runner
    """

    simulation_run_id: str | None = Field(
        default=None,
        description=(
            "Run-ID eines Crash-Test-Simulation-Runs. "
            "None (Standard) = LLM-Simulation mit eval_personas.py starten."
        ),
    )
    evaluator_model: str = Field(
        default="claude-haiku-4-5-20251001",
        description="Gepinnte Model-ID des LLM-Judges. Nie generisch.",
    )
    # Optionale Einschränkung: nur bestimmte Personas/Sessions evaluieren
    persona_ids: list[str] | None = Field(
        default=None,
        description="Subset der Persona-IDs (P01..P10). None = alle 10 Personas.",
    )
    session_numbers: list[int] | None = Field(
        default=None,
        description="Subset der Session-Nummern (1–10). None = alle 10 Sessions.",
    )
    turns_per_session: int = Field(
        default=5,
        ge=3,
        le=10,
        description="Anzahl Nutzer-Turns pro Session in der LLM-Simulation.",
    )
    kaia_model: str = Field(
        default="",
        description=(
            "Welches LLM als KAIA antwortet. Leer = kaia_chat_model aus system_settings. "
            "Für Multi-Model-Eval: 'gpt-4o', 'mistral-large-latest', etc."
        ),
    )


class RetestCreate(BaseModel):
    """POST /admin/eval/runs/{run_id}/retest — startet Retest für eine Persona × Session."""

    persona_id: str
    session_number: int = Field(ge=1, le=10)
    evaluator_model: str | None = Field(
        default=None,
        description="Überschreibt das Modell des Parent-Runs. None = Parent-Modell übernehmen.",
    )


class EvalOverride(BaseModel):
    """PATCH /admin/eval/runs/{run_id}/results/{result_id} — manuelle Score-Korrektur."""

    override_score: int = Field(ge=0, le=3)
    override_reason: str = Field(min_length=10, max_length=1000)


# ── Response-Schemas ───────────────────────────────────────────────────────────


class EvalRunRead(BaseModel):
    """Kurzform — wird in der Run-Liste verwendet."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    status: EvalRunStatus
    triggered_by: str
    evaluator_model: str
    simulation_run_id: str | None
    total_cost_eur: float | None
    started_at: datetime
    finished_at: datetime | None
    error: str | None
    config: dict[str, Any]


class EvalResultRead(BaseModel):
    """Ein einzelner Metrik-Score innerhalb einer Persona × Session."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    metric_key: MetricKey
    score: int | None
    reasoning: str | None
    flagged: bool
    crisis_triggered: bool | None

    # Manuelle Korrektur (None wenn nicht korrigiert)
    override_score: int | None
    override_reason: str | None
    override_by: str | None
    override_at: datetime | None

    @property
    def effective_score(self) -> int | None:
        """Gibt override_score zurück wenn vorhanden, sonst score."""
        return self.override_score if self.override_score is not None else self.score


class FlaggedExchangeRead(BaseModel):
    """Ein auffälliger Exchange-Eintrag aus dem Transkript."""

    index: int
    criterion: str
    user: str
    kaia: str
    flag_reason: str


class EvalTranscriptRead(BaseModel):
    """Vollständiges Transkript einer Persona × Session."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    persona_id: str
    session_number: int
    messages: list[dict[str, Any]]
    flagged_exchanges: list[dict[str, Any]]
    overall_finding: str | None
    created_at: datetime


class SessionDetailRead(BaseModel):
    """Detail einer Persona × Session: alle Metriken + Transkript.

    Entspricht dem Slide-over in der UX-Spec (STORY-EVAL-MATRIX-ux.md).
    """

    model_config = ConfigDict(from_attributes=True)

    run_id: str
    persona_id: str
    session_number: int

    # Alle Metriken für diese Kombination
    results: list[EvalResultRead]

    # Aggregierter Score (Durchschnitt über effective_score aller Metriken, 0–3 → 0–100%)
    # Berechnung auf API-Seite, nicht in DB — so bleibt die Logik testbar und zentral
    score_total_pct: float | None

    # Transkript (None wenn noch nicht verfügbar)
    transcript: EvalTranscriptRead | None


class HeatmapCellRead(BaseModel):
    """Eine Zelle in der Heatmap: Persona × Session → aggregierter Score."""

    persona_id: str
    session_number: int
    # Durchschnitt über alle effective_scores, 0–3 skaliert auf 0–100
    score_pct: float | None
    # Geflaggte Metrik-Keys dieser Zelle, z.B. ["m1_socratic_purity", "m3_persona_responsiveness"]
    flagged_metrics: list[str]
    # True wenn diese Zelle einen Fehler hatte (simulation abgebrochen)
    has_error: bool


class HeatmapPersonaRead(BaseModel):
    """Alle Sessions einer Persona in der Heatmap."""

    persona_id: str
    learning_topic: str | None
    sabotage_pattern: str | None
    sessions: list[HeatmapCellRead]
    # Durchschnitt über alle Sessions dieser Persona
    avg_score_pct: float | None


class HeatmapRead(BaseModel):
    """Vollständige Heatmap für einen Eval-Run.

    GET /admin/eval/runs/{run_id}/heatmap
    """

    run_id: str
    status: EvalRunStatus
    evaluator_model: str
    personas: list[HeatmapPersonaRead]

    # Aggregierte Metriken für "Schwächstes Glied"-Banner (UX-Spec)
    weakest_persona_id: str | None
    weakest_session_number: int | None
    weakest_score_pct: float | None
    system_avg_pct: float | None

    # Anzahl Fehler-Zellen (simulation abgebrochen)
    error_cell_count: int

    # Spalten-Durchschnitte (session_number → score_pct)
    column_averages: dict[int, float | None]


class EvalRunStarted(BaseModel):
    """Response auf POST /admin/eval/runs — gibt run_id zurück, Eval läuft im Hintergrund."""

    run_id: str
    status: EvalRunStatus


class RetestStarted(BaseModel):
    """Response auf POST /admin/eval/runs/{run_id}/retest."""

    retest_run_id: str
    parent_run_id: str
    persona_id: str
    session_number: int
    status: EvalRunStatus
