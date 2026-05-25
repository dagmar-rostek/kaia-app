---
description: Dediziertes Bias-Audit eines Features oder Subsystems
argument-hint: <Feature oder Pfad>
---

Führe ein vollständiges Bias-Audit durch für:

$ARGUMENTS

Workflow:

1. **`compliance`** → bestätigt EU-AI-Act-Einstufung und Pflichten aus Art. 10 und Art. 15
2. **`ai-engineer`** → liefert Datengovernance-Dokumentation und Eval-Setup
3. **`ai-ethics`** → führt das vollständige Bias-Audit durch:
   - Datengovernance-Bewertung
   - Fairness-Metrik-Auswahl mit Begründung
   - Subgruppen-Analyse
   - Counterfactual-Tests
   - Stakeholder-Impact
   - Model Card
   - Monitoring-Vorgaben
4. **`qa-tester`** → implementiert die vom Audit vorgegebenen Fairness-Tests
5. **`mlops`** → richtet Bias-Drift-Monitoring ein
6. **`ux-designer`** → prüft, ob die UI Anti-Automation-Bias-Muster ausreichend umsetzt
7. **`coordinator`** → finales Review, Gate G9, Empfehlung

Wenn das Audit "Nachbesserung erforderlich" ergibt: Stoppe und eskaliere mit klarer Liste der Findings an den Entwickler. Keine Freigabe ohne explizite menschliche Entscheidung.
