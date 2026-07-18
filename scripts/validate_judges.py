#!/usr/bin/env python3
"""Judge-Validierung: Goldset vs. LLM-Judge — Cohen's Kappa pro Metrik.

Führt alle Judge-Prompts gegen die validierten Goldset-Einträge aus und
berechnet die Übereinstimmung (Cohen's Kappa) zwischen erwartetem Score
(menschliches Urteil) und Judge-Score (LLM-Haiku).

Kappa-Interpretation:
  < 0.40  → schlecht → Judge nicht thesis-würdig
  0.40–0.59 → moderat → überprüfen, ggf. Prompt anpassen
  0.60–0.79 → gut → als Eval-Instrument verwendbar
  ≥ 0.80  → sehr gut → solide Grundlage

Usage:
    cd apps/api
    python ../../scripts/validate_judges.py [--metrics M1 M2 ...]

Output:
    Tabelle pro Metrik + Empfehlung.
    Speichert Ergebnis als docs/eval/judge_validation_YYYY-MM-DD.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

# ── Pfade ─────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parents[1]
GOLDSET_DIR = REPO_ROOT / "prompts" / "eval" / "goldset"
PROMPT_DIR = REPO_ROOT / "prompts" / "eval"
OUTPUT_DIR = REPO_ROOT / "docs" / "eval"

# ── Importe aus KAIA-Backend ──────────────────────────────────────────────────
# Muss aus apps/api heraus ausgeführt werden (oder PYTHONPATH gesetzt)
sys.path.insert(0, str(REPO_ROOT / "apps" / "api"))

from app.core.config import settings  # noqa: E402
from app.domains.eval.models import MetricKey  # noqa: E402

# Prompt-Loader aus dem Evaluator übernehmen
_METRIC_FILES: dict[str, str] = {
    "M1": "m1_socratic_purity.md",
    "M2": "m2_mission_adherence.md",
    "M3": "m3_persona_responsiveness.md",
    "M4": "m4_question_depth.md",
    "M5": "m5_sequence_coherence.md",
    "M6": "m6_autonomy_preservation.md",
    "M7": "m7_crisis_detection.md",
}

_METRIC_KEY_MAP: dict[str, MetricKey] = {
    "M1": MetricKey.M1_SOCRATIC_PURITY,
    "M2": MetricKey.M2_MISSION_ADHERENCE,
    "M3": MetricKey.M3_PERSONA_RESPONSIVENESS,
    "M4": MetricKey.M4_QUESTION_DEPTH,
    "M5": MetricKey.M5_SEQUENCE_COHERENCE,
    "M6": MetricKey.M6_AUTONOMY_PRESERVATION,
    "M7": MetricKey.M7_CRISIS_DETECTION,
}

JUDGE_MODEL = "claude-haiku-4-5-20251001"


# ── Goldset laden ─────────────────────────────────────────────────────────────


def load_goldset(metric: str) -> list[dict]:
    path = GOLDSET_DIR / f"{metric.lower()}_goldset.jsonl"
    if not path.exists():
        print(f"  [WARN] Kein Goldset für {metric}: {path}")
        return []
    entries = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            entries.append(json.loads(line))
    return entries


# ── Prompt laden ──────────────────────────────────────────────────────────────


def load_prompt(metric: str) -> tuple[str, str]:
    """Gibt (system_prompt, user_template) zurück."""
    filename = _METRIC_FILES[metric]
    content = (PROMPT_DIR / filename).read_text(encoding="utf-8")
    parts = content.split("---", maxsplit=2)
    body = parts[2] if len(parts) >= 3 else content
    if "\n# USER\n" in body:
        system_part, user_part = body.split("\n# USER\n", maxsplit=1)
    else:
        system_part, user_part = body, ""
    system_part = system_part.strip().removeprefix("# SYSTEM").strip()
    return system_part, user_part.strip()


def render_user_prompt(template: str, entry: dict) -> str:
    context = {
        "session_number": str(entry.get("session_number", "")),
        "persona_type": entry.get("persona_type", ""),
        "session_mission": entry.get("session_mission", ""),
        "dominant_question_type": entry.get("dominant_question_type", ""),
        "forbidden_question_types": entry.get("forbidden_question_types", ""),
        "persona_sabotage_pattern": entry.get("persona_sabotage_pattern", ""),
        "transcript": entry.get("transcript", ""),
        # M7-Felder
        "crisis_signal_expected": entry.get("crisis_signal_expected", "nein"),
        "expected_crisis_signal": entry.get("expected_crisis_signal", "keines erwartet"),
    }
    for key, value in context.items():
        template = template.replace(f"{{{{ {key} }}}}", value)
    return template


# ── Judge-Call ────────────────────────────────────────────────────────────────


async def call_judge(
    client,
    system_prompt: str,
    user_prompt: str,
) -> dict:
    import re

    try:
        response = await client.messages.create(
            model=JUDGE_MODEL,
            max_tokens=512,
            temperature=0,
            system=[
                {"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}
            ],
            messages=[{"role": "user", "content": user_prompt}],
        )
        from anthropic.types import TextBlock

        block = response.content[0] if response.content else None
        raw = block.text.strip() if isinstance(block, TextBlock) else ""
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not json_match:
            return {"score": None, "error": f"No JSON in: {raw[:100]}"}
        result = json.loads(json_match.group())
        return result
    except Exception as exc:
        return {"score": None, "error": str(exc)}


# ── Cohen's Kappa ─────────────────────────────────────────────────────────────


def cohens_kappa(observed: list[int], expected: list[int]) -> float:
    """Berechnet Cohen's Kappa für ordinale Daten (0–3).

    po = beobachtete Übereinstimmung
    pe = zufällig erwartete Übereinstimmung
    kappa = (po - pe) / (1 - pe)
    """
    if not observed or len(observed) != len(expected):
        return float("nan")

    n = len(observed)
    categories = list(range(4))  # 0, 1, 2, 3

    # Übereinstimmungsmatrix
    po = sum(1 for o, e in zip(observed, expected) if o == e) / n

    # Rand-Häufigkeiten
    obs_counts = {c: observed.count(c) / n for c in categories}
    exp_counts = {c: expected.count(c) / n for c in categories}

    pe = sum(obs_counts[c] * exp_counts[c] for c in categories)

    if pe >= 1.0:
        return 1.0

    return (po - pe) / (1 - pe)


def kappa_verdict(kappa: float) -> str:
    if kappa < 0.40:
        return "❌ SCHLECHT — Judge nicht thesis-würdig, Prompt überarbeiten"
    if kappa < 0.60:
        return "⚠️  MODERAT — Grenzwertig, Goldset erweitern oder Prompt schärfen"
    if kappa < 0.80:
        return "✅ GUT — Als Eval-Instrument verwendbar"
    return "✅✅ SEHR GUT — Solide Grundlage für Thesis-Evaluation"


# ── Hauptlogik ────────────────────────────────────────────────────────────────


async def validate_metric(
    client, metric: str, verbose: bool = False
) -> dict:
    print(f"\n{'='*60}")
    print(f"  Metrik: {metric}")
    print(f"{'='*60}")

    entries = load_goldset(metric)
    if not entries:
        return {"metric": metric, "status": "no_goldset", "kappa": None}

    system_prompt, user_template = load_prompt(metric)

    judge_scores: list[int] = []
    expected_scores: list[int] = []
    results = []

    for entry in entries:
        user_prompt = render_user_prompt(user_template, entry)
        result = await call_judge(client, system_prompt, user_prompt)

        judge_score = result.get("score")
        expected_score = entry["expected_score"]
        entry_id = entry["id"]
        label = entry.get("label", "")

        if judge_score is None:
            print(f"  [{entry_id}] ❓ Judge returned None — {result.get('error', '')[:80]}")
        else:
            match = "✓" if judge_score == expected_score else "✗"
            print(
                f"  [{entry_id}] {match} expected={expected_score} judge={judge_score}"
                f"  ({label})"
            )
            if verbose and judge_score != expected_score:
                print(f"    Reasoning: {result.get('reasoning', '')[:200]}")
                print(f"    Hint: {entry.get('reasoning_hint', '')[:200]}")

        if judge_score is not None:
            judge_scores.append(judge_score)
            expected_scores.append(expected_score)

        results.append(
            {
                "id": entry_id,
                "label": label,
                "expected_score": expected_score,
                "judge_score": judge_score,
                "match": judge_score == expected_score if judge_score is not None else None,
                "reasoning": result.get("reasoning"),
                "error": result.get("error"),
            }
        )

    kappa = cohens_kappa(judge_scores, expected_scores)
    accuracy = (
        sum(1 for j, e in zip(judge_scores, expected_scores) if j == e) / len(judge_scores)
        if judge_scores
        else 0.0
    )

    print(f"\n  Ergebnisse: {len(judge_scores)}/{len(entries)} auswertbar")
    print(f"  Accuracy:   {accuracy:.1%} ({sum(1 for j,e in zip(judge_scores, expected_scores) if j==e)}/{len(judge_scores)} korrekt)")
    print(f"  Kappa:      {kappa:.3f}")
    print(f"  Verdict:    {kappa_verdict(kappa)}")

    return {
        "metric": metric,
        "n_total": len(entries),
        "n_evaluated": len(judge_scores),
        "accuracy": round(accuracy, 4),
        "kappa": round(kappa, 4) if kappa == kappa else None,  # NaN → None
        "verdict": kappa_verdict(kappa),
        "results": results,
    }


async def main(metrics: list[str], verbose: bool) -> None:
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    print(f"\nKAIA Judge-Validierung — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} UTC")
    print(f"Judge-Modell: {JUDGE_MODEL}")
    print(f"Metriken: {', '.join(metrics)}")

    all_results = []
    for metric in metrics:
        result = await validate_metric(client, metric, verbose=verbose)
        all_results.append(result)

    # Zusammenfassung
    print(f"\n{'='*60}")
    print("  GESAMT-ZUSAMMENFASSUNG")
    print(f"{'='*60}")
    for r in all_results:
        if r.get("kappa") is not None:
            print(
                f"  {r['metric']}: Kappa={r['kappa']:.3f}  Accuracy={r['accuracy']:.1%}  "
                f"{'✅' if r['kappa'] >= 0.60 else '❌'}"
            )
        else:
            print(f"  {r['metric']}: kein Goldset oder kein auswertbares Ergebnis")

    # Release-Gate-Check
    below_threshold = [r for r in all_results if r.get("kappa") is not None and r["kappa"] < 0.60]
    if below_threshold:
        print(
            f"\n  ⛔ RELEASE-GATE NICHT BESTANDEN: "
            f"{len(below_threshold)} Metrik(en) unter Kappa 0.60"
        )
        print("     Judge ist noch nicht thesis-würdig. Goldset erweitern oder Prompt anpassen.")
    else:
        evaluated = [r for r in all_results if r.get("kappa") is not None]
        if evaluated:
            print(f"\n  🟢 RELEASE-GATE BESTANDEN: alle {len(evaluated)} Metriken Kappa ≥ 0.60")

    # Speichern
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    output_path = OUTPUT_DIR / f"judge_validation_{timestamp}.json"
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "judge_model": JUDGE_MODEL,
        "metrics": all_results,
        "release_gate_passed": len(below_threshold) == 0
        and len([r for r in all_results if r.get("kappa") is not None]) > 0,
    }
    output_path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n  Ergebnis gespeichert: {output_path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KAIA Judge-Validierung (Cohen's Kappa)")
    parser.add_argument(
        "--metrics",
        nargs="+",
        default=["M1", "M2", "M3", "M4", "M5", "M6", "M7"],
        help="Metriken die validiert werden sollen (Standard: alle)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Reasoning und Hints bei Abweichungen anzeigen",
    )
    args = parser.parse_args()
    asyncio.run(main(args.metrics, args.verbose))
