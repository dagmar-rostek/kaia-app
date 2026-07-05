"""Eval-Service: Aggregationslogik und Heatmap-Berechnung.

Diese Datei enthält keine DB-Queries (→ repository.py) und keine HTTP-Logik (→ routes.py).
"""

from __future__ import annotations

from app.domains.eval.models import EvalRun
from app.domains.eval.repository import EvalResultRepository, EvalTranscriptRepository
from app.domains.eval.schemas import (
    HeatmapCellRead,
    HeatmapPersonaRead,
    HeatmapRead,
    SessionDetailRead,
)


def _score_to_pct(avg_score_0_to_3: float | None) -> float | None:
    """Konvertiert den 0–3 Integer-Durchschnitt in eine 0–100 Prozent-Darstellung.

    0 → 0%, 3 → 100%. Entspricht der UX-Spec (Heatmap zeigt Prozentwerte).
    Kein Runden — Frontend rundet für Anzeige.
    """
    if avg_score_0_to_3 is None:
        return None
    return (avg_score_0_to_3 / 3.0) * 100.0


async def build_heatmap(
    run: EvalRun,
    result_repo: EvalResultRepository,
    # persona_meta liefert learning_topic + sabotage_pattern aus dem Simulation-Runner
    # Format: {persona_id: {"learning_topic": str, "sabotage_pattern": str}}
    persona_meta: dict[str, dict[str, str]],
) -> HeatmapRead:
    """Baut die vollständige Heatmap-Response für einen Eval-Run.

    Eine DB-Query für alle Aggregierungen (via get_aggregated_for_heatmap),
    dann Python-seitige Gruppierung. Kein N+1.
    """
    rows = await result_repo.get_aggregated_for_heatmap(run.id)

    # Gruppiere nach persona_id
    personas_map: dict[str, list[HeatmapCellRead]] = {}
    for persona_id, session_number, avg_score, flagged_metrics, has_error in rows:
        cell = HeatmapCellRead(
            persona_id=persona_id,
            session_number=session_number,
            score_pct=_score_to_pct(float(avg_score) if avg_score is not None else None),
            flagged_metrics=flagged_metrics,
            has_error=has_error,
        )
        personas_map.setdefault(persona_id, []).append(cell)

    # Spalten-Durchschnitte (session_number → avg über alle Personas)
    session_scores: dict[int, list[float]] = {}
    for cells in personas_map.values():
        for cell in cells:
            if cell.score_pct is not None:
                session_scores.setdefault(cell.session_number, []).append(cell.score_pct)
    column_averages: dict[int, float | None] = {
        s: (sum(scores) / len(scores) if scores else None) for s, scores in session_scores.items()
    }

    personas: list[HeatmapPersonaRead] = []
    for persona_id, cells in sorted(personas_map.items()):
        valid_scores = [c.score_pct for c in cells if c.score_pct is not None]
        avg = sum(valid_scores) / len(valid_scores) if valid_scores else None
        meta = persona_meta.get(persona_id, {})
        personas.append(
            HeatmapPersonaRead(
                persona_id=persona_id,
                learning_topic=meta.get("learning_topic"),
                sabotage_pattern=meta.get("sabotage_pattern"),
                sessions=sorted(cells, key=lambda c: c.session_number),
                avg_score_pct=avg,
            )
        )

    # Schwächstes Glied: niedrigster score_pct über alle Zellen
    all_cells = [c for p in personas for c in p.sessions]
    scored_cells = [c for c in all_cells if c.score_pct is not None and not c.has_error]
    weakest = min(scored_cells, key=lambda c: c.score_pct or 0.0, default=None)
    all_scores: list[float] = [c.score_pct for c in scored_cells if c.score_pct is not None]
    system_avg = sum(all_scores) / len(all_scores) if all_scores else None
    error_count = sum(1 for c in all_cells if c.has_error)

    return HeatmapRead(
        run_id=run.id,
        status=run.status,
        evaluator_model=run.evaluator_model,
        kaia_chat_model=run.config.get("kaia_chat_model"),
        personas=personas,
        weakest_persona_id=weakest.persona_id if weakest else None,
        weakest_session_number=weakest.session_number if weakest else None,
        weakest_score_pct=weakest.score_pct if weakest else None,
        system_avg_pct=system_avg,
        error_cell_count=error_count,
        column_averages=column_averages,
    )


async def build_session_detail(
    run_id: str,
    persona_id: str,
    session_number: int,
    result_repo: EvalResultRepository,
    transcript_repo: EvalTranscriptRepository,
) -> SessionDetailRead | None:
    """Detailansicht für eine Persona × Session (Slide-over in UX-Spec)."""
    results = await result_repo.get_for_session(run_id, persona_id, session_number)
    if not results:
        return None

    transcript = await transcript_repo.get(run_id, persona_id, session_number)

    # Score-Aggregation: COALESCE(override_score, score) → Durchschnitt → Prozent
    scores = [
        (r.override_score if r.override_score is not None else r.score)
        for r in results
        if (r.override_score is not None or r.score is not None)
    ]
    scores_clean: list[int] = [s for s in scores if s is not None]
    score_total_pct = _score_to_pct(sum(scores_clean) / len(scores_clean)) if scores_clean else None

    from app.domains.eval.schemas import EvalResultRead, EvalTranscriptRead

    return SessionDetailRead(
        run_id=run_id,
        persona_id=persona_id,
        session_number=session_number,
        results=[EvalResultRead.model_validate(r) for r in results],
        score_total_pct=score_total_pct,
        transcript=EvalTranscriptRead.model_validate(transcript) if transcript else None,
    )
