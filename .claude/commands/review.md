---
description: Multi-Agent-Review — Architect Pattern-Check + Code-Review vor jedem nicht-trivialen Commit
argument-hint: <Pfad oder Beschreibung der Änderung>
---

Führe einen zweistufigen Review durch für:

$ARGUMENTS

## Stufe 1 — Architect (Pattern-Check, ZUERST)

Rufe `architect` auf:
- Ist der gewählte Ansatz konsistent mit bestehenden Patterns in der Codebase?
- Gibt es ein bestehendes Muster das stattdessen verwendet werden sollte?
- Wurde die relevante Codestelle gelesen BEVOR die Implementierung begann?
- Ist die Root-Cause verstanden, oder wird nur ein Symptom behoben?

## Stufe 2 — Code-Review (parallel, nach Architect-Freigabe)

Rufe parallel auf:
- `qa-tester` → Testabdeckung, Edge Cases, Fehlerbehandlung
- `security` → Sicherheitsbewertung
- `compliance` → DSGVO/EU-AI-Act-Implikationen (falls relevant)
- `ux-designer` → falls UI-Änderung

Danach `coordinator` für konsolidierte Zusammenfassung mit klarer Go/No-Go-Entscheidung.
