# 7 Fazit und Ausblick

**Stand:** Skeleton — wird nach Fertigstellung von Kap6 verfasst (ca. 4–5 Seiten)
**Hinweis:** Das Fazit fasst zusammen — keine neuen Argumente, keine neuen Quellen.

---

## 7.1 Beitrag der Arbeit

Diese Arbeit hatte das Ziel, einen LLM-basierten Agenten für adaptive und
sokratische Lernbegleitung theoretisch zu begründen, technisch zu entwickeln
und in einer explorativen Pilotstudie zu erproben. Sie folgte dabei der Logik von
Design Science Research (Hevner et al., 2004), die Artefaktentwicklung und
Artefaktevaluation als aufeinander bezogene Schritte versteht.

**FF1** (Übersetzung theoretischer Anforderungen) wurde durch Kapitel 3
beantwortet: Sieben Designanforderungen aus den Bereichen Selbstregulation,
Scaffolding, Adaptivität und empathisches Systemverhalten wurden in eine
dokumentierte Architekturentscheidung und eine operationalisierte Gesprächslogik
überführt. [KONKRETE BILANZ nach Diskussion einfügen]

**FF2** (technische Evaluation) wurde durch die LLM-Judge-Evaluation beantwortet.
Das System erfüllt die Kriterien [BEFUND zusammengefasst]. M4 (Question Depth)
erwies sich als stärkste Dimension; M1 (Socratic Purity) und M2 (Mission
Adherence) zeigen Optimierungspotenzial. Die Krisenerkennungslogik wurde durch
den Eval-Prozess verbessert — ein Beleg für den praktischen Wert des
systematischen Eval-Ansatzes.

**FF3** (GSE-Veränderung) wurde explorativ beantwortet. [BEFUND: z.B. "Innerhalb
der Pilotstichprobe (N = [WERT]) wurde eine [schwache / mittlere / keine
messbare] Veränderung der allgemeinen Selbstwirksamkeitserwartung beobachtet
(W = [WERT], p = [WERT], r = [WERT])."] Diese Beobachtung erlaubt keine
kausale Zuschreibung und ist als explorativer Hinweis zu verstehen.

---

## 7.2 Wissenschaftlicher Beitrag

Der Beitrag dieser Arbeit liegt auf drei Ebenen:

**Designwissen:** Die dokumentierte Artefaktlogik — sokratischer Modus,
textbasierte Adaptation auf Basis des Lazarus-Frameworks, persistentes
Sessiongedächtnis — stellt übertragbares Designwissen für ähnliche Systeme
bereit.

**Evaluationsmethodik:** Das LLM-as-Judge-System mit sieben validierten
Metriken, synthetischen Crash-Personas und Goldset-Kalibrierung demonstriert
einen reproduzierbaren Ansatz zur Verhaltensprüfung sokratischer LLM-Agenten
vor Echtstudien-Einsatz.

**Empirische Evidenz:** Die Pilotstudie liefert erste Hinweise auf Nutzbarkeit
und GSE-Verlauf in einer realen, wenn auch kleinen Stichprobe.

---

## 7.3 Grenzen und Ausblick

Die zentralen Grenzen der Arbeit sind das einarmige Pilotdesign, die begrenzte
Stichprobengröße und der Interessenkonflikt durch die Doppelrolle der Forscherin
als Entwicklerin und Studienleiterin (vgl. Abschnitt 6.3).

Für eine Hauptstudie wären folgende Bedingungen erforderlich:
- Kontrollgruppe (z.B. Warteliste oder konventionelles Lernangebot)
- Randomisierte Zuweisung
- Größere Stichprobe (G*Power-Analyse auf Basis der Pilot-Effektgröße:
  N ≈ [WERT] für Power = 0,80, α = .05, r = [WERT])
- Unabhängige Beurteilung der Goldset-Scores (ohne Interessenkonflikt)
- Längerer Erhebungszeitraum für Transferwirkungen

Technisch besteht das größte Optimierungspotenzial in der sokratischen Reinheit
(M1) und der Missionstreue (M2). Hier könnte ein differenzierteres Prompt-Design
mit expliziten Guardrails und session-spezifischen Verbotslisten eine Verbesserung
bewirken. Langfristig wäre die Aktivierung der semantischen Gedächtnisschicht
(pgvector) ein Schritt hin zu echter sitzungsübergreifender Personalisierung.

---

*Literaturangaben sind im konsolidierten Literaturverzeichnis am Ende der
Thesis aufgeführt.*
