---
description: Hypothesengetriebene Validierung einer Produktidee mit MVP-Test
argument-hint: <Produktidee oder Hypothese>
---

Validiere die folgende Produktidee, bevor sie in die Entwicklung geht:

$ARGUMENTS

Workflow:

1. **`discovery-researcher`** → führt die Discovery-Arbeit durch:
   - Hypothese präzise formulieren
   - Riskiest Assumption identifizieren
   - Test-Methode wählen (Interviews, MVP, Landing Page, Concierge etc.)
   - Tester-Kohorte definieren
   - Interview-Leitfaden oder Test-Skript erstellen
   - Erfolgs-/Falsifikationskriterien festlegen
2. **`psychologist`** → bei diagnostischen Konzepten: Vorab-Prüfung, ob das geplante Verfahren wissenschaftlich tragfähig ist
3. **`compliance`** → DSGVO-Konformität der Forschung (Einwilligung, Datenverarbeitung, Speicherung)
4. **`ai-ethics`** → bei Tests mit menschlichen Probanden: ethische Bewertung, Schadenspotenzial, Stakeholder-Diversität
5. **Mensch führt das Experiment durch** (außerhalb des Agenten-Teams)
6. **`discovery-researcher`** → Auswertung gegen vorab definierte Kriterien
7. **`coordinator`** → Empfehlung: Validated / Invalidated / Pivot / Next Experiment

Wenn das Experiment ein eindeutiges "Invalidated" liefert: Empfehlung an den Menschen, das Feature nicht zu bauen. Keine Verlegenheits-Fortsetzung.
