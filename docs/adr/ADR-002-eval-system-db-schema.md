# ADR-002: Datenbankschema und API-Design des Eval-Systems

**Status:** Accepted
**Datum:** 2026-07-04
**Beteiligte:** architect

## Kontext

KAIA braucht ein System, das LLM-generierte Eval-Scores (LLM-as-Judge) für 10 Personas × 10 Sessions persistiert, in einer Heatmap aggregiert und Drill-down auf einzelne Persona × Session-Kombinationen erlaubt. Der Admin soll nach einem Prompt-Update einzelne Zellen gezielt retesten können.

Randbedingungen:
- PostgreSQL 16 + SQLAlchemy 2.0 async (bindend laut Tech-Stack)
- Die Simulation läuft sequenziell (Personas nacheinander), nicht parallel — Race-Conditions beim Schreiben sind damit kein Problem im aktuellen Runner. Wenn der Runner später parallelisiert wird, muss das Schema das trotzdem tolerieren.
- Bestehende Simulation erzeugt String-Run-IDs (`crash_test_YYYYMMDD_HHMMSS`)
- 7 Metriken: M1–M6 fix, M7 optional (nur P04/S6)
- Score: 0–3 Integer

## Optionen

### Option A: Row-per-Metric in `eval_results`

Eine Row pro Persona × Session × Metrik. Für 100 Zellen × 7 Metriken = 700 Rows.

Vorteile:
- Metrik-spezifische Heatmap-Filter ohne Schema-Änderung (neues `metric_key` wird einfach eine neue Row)
- Partial-Update beim Retest: nur die betroffenen Rows (eine Persona × Session = 7 Rows) werden neu geschrieben, nicht der gesamte Run
- `flagged` per Metrik granular
- Spätere Metriken M8, M9 kosten keine Alembic-Migration

Nachteile:
- GROUP BY in der Heatmap-Query braucht AVG über mehrere Rows statt einfaches Select einer Spalte
- Etwas mehr Schema-Disziplin (metric_key muss validiert werden)

### Option B: Spalten-per-Metrik in `eval_results`

Eine Row pro Persona × Session, mit Spalten `score_m1`, `score_m2`, ..., `score_m6`, `score_m7`.

Vorteile:
- Heatmap-Query ist trivial (SELECT score_m1 ... WHERE run_id = ...)
- Typensicherheit durch Spaltenstruktur

Nachteile:
- Jede neue Metrik = ALTER TABLE + Alembic-Migration (Thesis-Zeitraum eng)
- Metrik-spezifische Heatmap-Filter brauchen dynamische SQL-Generierung
- M7 als nullable Spalte ist semantisch unklar (NULL = nicht applicable vs. NULL = nicht berechnet)
- Partial-Update beim Retest: man überschreibt in-place — kein Audit-Trail

### Option C: JSONB für alle Scores

Alle 7 Scores als JSONB in einer `scores`-Spalte.

Vorteile: maximale Flexibilität, kein Schema-Lock

Nachteile:
- Keine DB-seitige Aggregierung (AVG auf JSONB-Felder ist umständlich)
- Kein Index auf einzelne Metriken
- Validierung muss komplett in der Applikationsschicht passieren
- Für 100 Zellen kein Problem, aber Erweiterbarkeit leidet

## Entscheidung

Wir wählen **Option A (Row-per-Metric)**.

Begründung: Die Heatmap-Query (GROUP BY persona_id, session_number + AVG über effective_score) ist eine einzelne SQL-Query mit einem Composite-Index — kein N+1. Die Flexibilität beim Metrik-Hinzufügen überwiegt den geringfügig komplexeren GROUP BY. M7 als bedingten Row (metric_key='m7_crisis_triggered') zu modellieren ist semantisch sauberer als eine nullable Spalte, die optionalen Status ausdrückt.

### Separate `eval_transcripts`-Tabelle

Transkripte sind **nicht** in `eval_results` (als JSONB pro Metrik) und **nicht** in `eval_runs` (als Array). Stattdessen separate Tabelle mit 1 Row pro Persona × Session.

Begründung:
1. Heatmap-Queries brauchen keine Transkripte — würden sie in `eval_results` oder `eval_runs` liegen, wäre jeder Heatmap-Query-Row unnötiger Payload
2. 7 Metriken pro Persona × Session würden das Transkript 7-mal duplizieren, wenn es in `eval_results` läge
3. Volltextsuche oder spätere Chunk-Extraktion ist einfacher in einer eigenen Tabelle

### Retest als neuer Run (kein Update-in-place)

Ein Retest erzeugt einen neuen `eval_run` (mit `parent_run_id` in `config`), nicht ein Update des bestehenden Runs.

Begründung:
- Audit-Trail: Admin soll Original-Score und Retest-Score vergleichen können
- Concurrency-Sicherheit: kein Schreib-Konflikt wenn zukünftig parallel getestet wird
- Konsistenz: das bestehende Simulation-System arbeitet auch mit unveränderlichen Run-IDs

### `run_id` als String

Kompatibilität mit dem bestehenden Simulation-Runner, der `crash_test_YYYYMMDD_HHMMSS` produziert. Integer-Primary-Keys wären technisch sauberer, würden aber eine separate ID-Abbildung erfordern.

## Konsequenzen

Positiv:
- Heatmap-Query ist eine einzige DB-Abfrage (kein N+1 für 100 Zellen)
- Metrik-Erweiterung kostet keine Alembic-Migration
- Retest-History ist vollständig nachvollziehbar
- Transkripte werden nur geladen wenn der Admin den Drill-down öffnet

Negativ:
- 700 Rows pro vollständigem Eval-Run (kein Problem bei diesem Volumen, aber zu beachten wenn Runs sich akkumulieren)
- `metric_key` muss applikationsseitig validiert werden (StrEnum in models.py)
- `config` als JSONB ist schemalos — persona_meta muss diszipliniert vom Evaluator befüllt werden

Neutral:
- `override_score` (manuelle Korrektur) liegt in `eval_results`, nicht in einer separaten Override-Tabelle — einfacher, ausreichend für das Thesis-Volumen

## Compliance-Bezug

Eval-Daten enthalten keine personenbezogenen Daten echter Studienteilnehmender (synthetische Personas). DSGVO Art. 15–21 nicht direkt anwendbar. Trotzdem:
- `triggered_by` speichert Admin-Username (personenbezogen) — Retention-Policy muss bei DSFA berücksichtigt werden
- `overall_finding` und `reasoning` sind LLM-Outputs — kein XSS-Risiko in DB, aber Frontend muss als Plaintext rendern (kein dangerouslySetInnerHTML)
- EU AI Act Art. 50 (Transparenzpflicht): Admin-Interna, nicht direkt betroffen, aber `evaluator_model` wird gepinnt und in Run-Metadaten gespeichert (Reproducibility-Anforderung)
