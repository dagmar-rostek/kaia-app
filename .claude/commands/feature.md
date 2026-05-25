---
description: Vollständiger Feature-Workflow durch das Agenten-Team
argument-hint: <kurze Feature-Beschreibung>
---

Du orchestrierst die Entwicklung eines neuen Features durch das Agenten-Team. Beschreibung des Features:

$ARGUMENTS

Gehe wie folgt vor:

1. **Rufe den `coordinator`-Agenten auf** mit der Feature-Beschreibung. Er erstellt einen Ablaufplan.

2. **Rufe nacheinander auf** (warte jeweils auf Abschluss):
   - `discovery-researcher` → bei neuen Ideen/Features: Hypothesen-Validierung. Bei klar validierten Features überspringbar.
   - `product-owner` → User Story + Akzeptanzkriterien
   - `compliance` → Risikoeinstufung
   - `psychologist` → bei diagnostischen Komponenten: psychometrische Bewertung
   - `architect` → Architektur + ADR
   - `ai-engineer` → falls AI-Komponente nötig
   - `ai-ethics` → falls System Menschen bewertet/empfiehlt/scoret oder Entscheidungen über Menschen vorbereitet (Bias-Audit)
   - `ux-designer` → Interaktionsdesign (inkl. Anti-Automation-Bias und Sprachregelungen falls relevant)
   - `security` → Threat Model

3. **Implementiere das Feature** selbst (Hauptsession) gemäß den Vorgaben aller Agenten.

4. **Rufe danach auf:**
   - `qa-tester` → Testplan + Tests implementieren
   - `mlops` → Observability + Evals einrichten

5. **Abschluss-Review** durch `coordinator` mit Gate-Check.

6. **Fasse das Endergebnis** kurz für den Entwickler zusammen mit:
   - Status aller Gates
   - Pfade zu allen erstellten Artefakten
   - Empfehlung: ready / needs work

Wenn ein Agent blockiert ist oder Klärung braucht, halte an und frage den Entwickler. Rate nicht.
