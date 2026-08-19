# Kapitel 4 — Methodisches Vorgehen

> **Stand:** 19. August 2026 · **Version:** 2.0
> **Reviewer:** Architect · Compliance · Data-Scientist
> **Umfang:** ca. 2.500 Wörter
> **Status:** Restrukturiert — technische Implementierungsdetails in Anhang G ausgelagert

---

## 4.1 Design Science Research als methodischer Rahmen

### 4.1.1 Begründung der Methodenwahl

Die Entwicklung von KAIA folgt dem Paradigma des Design Science Research (DSR; Hevner et al., 2004). DSR ist eine Forschungsmethodik für die Informationssystemforschung, die die Entwicklung von Artefakten — Konstrukte, Modelle, Methoden oder Instanziierungen — mit der Generierung wissenschaftlicher Erkenntnisse verbindet. Das entwickelte Artefakt ist nicht Nebenprodukt, sondern zentrales Forschungsergebnis. Diese duale Ausrichtung macht DSR zum methodisch angemessenen Rahmen für KAIA, das als funktionsfähiger Prototyp zugleich Forschungsgegenstand und Wissensträger ist.

Die Wahl von DSR gegenüber klassisch-empirischen Ansätzen ist inhaltlich begründet: KAIA ist ein neuartiges Artefakt ohne etablierte Vorläufer im deutschsprachigen Bildungskontext. Konfirmatorische Hypothesenprüfung setzt voraus, dass ein stabiles, evaluierbares System bereits existiert. DSR erlaubt die notwendige sequenzielle Logik: Artefaktentwicklung, dann Artefaktevaluation. Die Pilotstudie (Abschnitt 4.2.3) ist Evaluationsschritt im DSR-Zyklus — sie prüft nicht primär theoretische Hypothesen, sondern liefert explorative Erkenntnisse über Nutzbarkeit, subjektive Wirksamkeitserfahrung und technische Robustheit. Die Unterscheidung zwischen Artefaktevaluation und hypothesenprüfender Forschung ist für die Interpretation der Ergebnisse konstitutiv (Gregor & Hevner, 2013).

### 4.1.2 Das Dreizyklus-Modell und seine Anwendung auf KAIA

Hevner (2007) beschreibt DSR als Dreizyklus-Modell mit drei interagierenden Zyklen:

- **Relevance-Zyklus:** Verankerung im Anwendungskontext. Für KAIA: Masterstudierende mit Lernblockaden im selbstorganisierten Lernen, insbesondere der Knowing-Doing Gap (Pfeffer & Sutton, 2000) zwischen vorhandenem Wissen und tatsächlich verändertem Verhalten.
- **Rigor-Zyklus:** Fundierung in der wissenschaftlichen Wissensbasis. Für KAIA: sokratische Gesprächsführung, Selbstwirksamkeitstheorie (Bandura, 1997), Cognitive Load Theory (Sweller, 1988), Implementation Intention (Gollwitzer, 1999), Flow-Kalibrierung (Oliveira & Hamari, 2024) und DSGVO-Anforderungen.
- **Design-Zyklus:** Iterative Konstruktion und Evaluation des Artefakts. Für KAIA: drei Entwicklungsiterationen mit eingebetteten Evaluationsschritten (Abschnitt 4.1.3).

### 4.1.3 Die drei Entwicklungsiterationen

**Iteration 1 — Systemarchitektur und Grundfunktion (Mai–Juni 2026):**
Die erste Iteration umfasste den Aufbau der technischen Infrastruktur, die Implementierung des Authentifizierungssystems, die Consent-Architektur und die grundlegende Chat-Pipeline. Am Ende dieser Iteration lag ein deploymentfähiges System vor, das Basisfunktionen abdeckte: Registrierung, Admin-Freigabe, Session-Erstellung und LLM-Streaming. Technische Entscheidungen dieser Phase sind in Architecture Decision Records (ADRs) dokumentiert. *[→ Anhang G: Technische Systemarchitektur und Implementierungsdetails]*

**Iteration 2 — Didaktisches Design und Prompt-Entwicklung (Juni–Juli 2026):**
Die zweite Iteration entwickelte das didaktische Progressionsmodell: zehn Sessions mit definierten Missionen, priorisierten Fragetypen und explizit verbotenen Interaktionsformen. Parallel entstand der Systemprompt durch einen iterativen Feldforschungsansatz. Ein strukturelles Problem in KAIA_PROMPT_V3_WARM wurde identifiziert: Fragetyp 5 war an vier Stellen des Prompts hartkodiert, was unter dem 80-Wort-Constraint zu einem Typ-5-Loop auf Bloom-Stufe 1–2 führte statt zur taxonomischen Progression. KAIA_PROMPT_V4_WARM implementierte drei chirurgische Korrekturen: einen Thinking-Check gegen Typ-5-Looping, die De-Prozeduralisierung des Abschlusses und eine explizite Analogie-/Koan-Lizenz für kontextuelle Variation.

Parallel wurde beobachtet, dass der Wild-Charakter von Testnutzerinnen als sokratischer wahrgenommen wurde als der strukturierte Warm-Charakter — eine Wirkung, die auf kognitive Überraschung durch Metaphern und Analogien zurückzuführen ist (Gadamer, 1960) und dem Zen-Koan näher steht als dem klassischen Elenchos. Die Designentscheidung zugunsten des Warm-Charakters als Primärmodus basierte auf drei Faktoren: fehlende Crisis-Detection-Integration im Wild-Prompt, fehlende Session-Missionen und erhöhte Inter-Session-Varianz, die die Prä/Post-Validität der GSE-Messung gefährdet hätte. Am Ende dieser Iteration war KAIA didaktisch konzipiert und prompt-technisch stabilisiert.

**Iteration 3 — Evaluation und Studienprotokoll (Juli–August 2026):**
Die dritte Iteration umfasste die Implementierung der LLM-Evaluationspipeline (Abschnitt 4.2.1), die Crash-Persona-Simulation, die Judge-Validierung (Cohen's Kappa ≥ 0,60 für M1–M7; bestanden 2026-07-19) und die Behebung einer sicherheitskritischen Lücke: Im Baseline-Eval-Run wurde identifiziert, dass `_call_kaia_direct()` den Crisis-Detection-Prefilter umging. Die Behebung und Nachverifikation sind in Abschnitt 4.2.1.5.3 dokumentiert. Die finale Modellwahl für die Pilotstudie (GPT-4.1-mini; Begründung: unzumutbare Antwortlatenzen von claude-sonnet-4-6 unter Produktionsbedingungen, vgl. ADR-003) und der Study-Lock am 28. Juli 2026 schlossen diese Iteration ab.

### 4.1.4 KAIA als Forschungsartefakt — Methodologische Besonderheit

Ein zentrales methodisches Problem bei der Entwicklung LLM-basierter Systeme ist die fehlende formale Spezifikation für "guten" Output: Es gibt keine allgemeine Funktion, die misst, ob ein sokratisch-empathischer Lernbegleiter seinen Auftrag erfüllt. Die Güte eines Systemprompts ist kontextabhängig, nutzerspezifisch und lässt sich nicht vollständig vor der Nutzung evaluieren. Dies unterscheidet LLM-Entwicklung fundamental von klassischer Software, in der Korrektheit durch Tests formal verifizierbar ist.

Die Entwicklung des KAIA-Systemprompts folgt daher einem iterativen Feldforschungsansatz: Die Forscherin interagiert selbst mit dem System, beobachtet das Verhalten, formuliert Hypothesen über Schwächen und revidiert den Prompt — in direkter Anlehnung an Hevners Design-Evaluate-Revise-Zyklus (2007). KAIA_PROMPT_V4_WARM ist die aktive Version (Stand: 15. Juli 2026); V3 wird als Regressionsbaseline für die Eval-Pipeline vorgehalten. Die Prompt-Entwicklungshistorie ist durch datenbankgestützte Versionierung (Tabelle `prompt_templates` mit Timestamp und Versionsnummer) Teil der wissenschaftlichen Dokumentation.

Dieser Prozess ist inherent subjektiv: Die Forscherin ist gleichzeitig Entwicklerin und primäre Testnutzerin. Das Risiko des Confirmation Bias — unbewusste Optimierung des Prompts auf die eigene Kommunikationsweise — wird durch die Crash-Persona-Simulation und die LLM-as-Judge-Evaluation strukturell begrenzt, aber nicht vollständig eliminiert. Der dreifache Interessenkonflikt (Forscherin–Entwicklerin–potenzielle Kommerzialisiererin) ist in Abschnitt 4.2.3.2.3 und im Positionality Statement (Kapitel 6) vollständig ausgewiesen.

---

## 4.2 Prototypentwicklung

KAIA implementiert vier Schichten: Texteingabe → LLM-Verarbeitung → zweischichtiges Gedächtnis (symbolisch: PostgreSQL-Sitzungszusammenfassungen; semantisch: pgvector-Vektordatenbank, für die Pilotstudie noch nicht produktiv aktiviert) → DSGVO-konforme Datenhaltung auf EU-Servern (Hetzner Helsinki). Das Backend ist nach Domain-Driven Design strukturiert. Der Service-Layer ist vom HTTP-Layer getrennt. Alle technischen Implementierungsdetails (Authentifizierungssystem, Frontend-Architektur, Docker-Konfiguration, Observability-Setup, Datenbankschema, API-Endpunkte, SSE-Protokoll) sind im *[→ Anhang G: Technische Systemarchitektur und Implementierungsdetails]* dokumentiert.

Drei Komponenten haben unmittelbare wissenschaftliche und ethische Relevanz und werden daher hier beschrieben:

**Ethische Schutzmaßnahmen:** Ein deterministischer Crisis-Detection-Prefilter prüft jede Nutzereingabe vor der LLM-Verarbeitung. Er enthält 27 Regex-Muster für Suizidgedanken (explizit und passiv), Selbstverletzung und akute Hoffnungslosigkeit. Bei Treffer wird keine LLM-Antwort generiert; stattdessen erscheint eine statische Eskalations-Notice mit Krisenressourcen (Telefonseelsorge 0800 111 0 111). Das KI-Disclosure-Gate stellt sicher, dass alle Teilnehmenden vor dem ersten Chat-Zugriff explizit bestätigen, mit einer KI zu interagieren — kein Mensch, computational empathy im Sinne von Picard (1997) und Decety & Jackson (2004). Die Bestätigung wird mit Timestamp im Audit-Log gespeichert. Der Multi-Step-Consent trennt die Einwilligung in Datenverarbeitung und Studienteilnahme in zwei voneinander unabhängige Checkboxen, die separat widerrufbar sind.

**Didaktisches Progressionsmodell:** Die zehn KAIA-Sessions folgen einem strukturierten Lernbogen mit sessionsspezifischen Missionen, priorisierten Fragetypen und explizit verbotenen Interaktionsformen (ADR-007). Dieses Modell ist nicht LLM-generiert, sondern als Lookup-Tabelle im Systemprompt implementiert und damit deterministisch steuerbar. Session 1 anchert das Lernmotiv und klärt den Knowing-Doing Gap (Anamnese-Fragetyp). Sessions 6–10 implementieren den sokratischen Elenchos mit wörtlichen Zitaten der lernenden Person aus Vorsessions. Verbotene Fragetypen verhindern didaktische Fehler: Widerspruchsfragen (Typ 3) sind in Sessions 1–5 gesperrt, da kein ausreichendes argumentatives Fundament vorhanden ist.

**Study-Lock:** Bei `STUDY_MODE=locked` blockiert die CI-Pipeline Prompt- und Schemaänderungen. Dieser Mechanismus sichert die Reproduzierbarkeit der Studienbedingungen und verhindert unbewusste Eingriffe der Forscherin nach Beginn der Datenerhebung. Die Aktivierung erfolgte manuell am 28. Juli 2026. Eine automatische Transition auf Basis eines kalendarischen Datums ist bewusst nicht implementiert — die manuelle Aktivierung erfordert eine explizite Deployment-Entscheidung und verhindert versehentliche Studienstarts.

**Cross-Session-Memory:** Die Gedächtnisarchitektur besteht aus zwei Schichten. Die aktiv eingesetzte Schicht ist symbolisches Gedächtnis: Nach jeder Sitzung extrahiert ein separater LLM-Call eine strukturierte JSON-Zusammenfassung mit acht Pflichtfeldern (Beobachtung, vereinbarter Schritt, Stimmung, Reibungspunkte, stärkstes Zitat der lernenden Person u. a.). Diese Zusammenfassungen bilden den Kontext für Folgesessions und ermöglichen den sokratischen Elenchos ab Session 6. Die semantische Schicht (pgvector, 1536-dimensionale Vektoren) ist implementiert, für die Pilotstudie aber nicht produktiv aktiviert. Diese Entscheidung ist methodisch begründet: Bei 20 Teilnehmenden und maximal 10 Sessions ist symbolisches Gedächtnis ausreichend. Retrieval-Augmented Generation würde ein schwer kontrollierbares Variabilitätsrisiko für die Prä/Post-Messung einführen.

Die LLM-Evaluation des Prototyps ist in **Abschnitt 4.2.1** dokumentiert. Das Studiendesign und die Durchführung der Pilotstudie sind in **Abschnitt 4.2.3** beschrieben.

---

## 4.3 Datenerhebung

### 4.3.1 Erhobene Datenkategorien

Die Pilotstudie erhebt Daten aus vier Quellen, die unterschiedliche Aspekte der Lernbegleitung abbilden und eine methodologische Triangulation ermöglichen.

**Quantitative Selbstberichte:**
Die Allgemeine Selbstwirksamkeitserwartung wird mit der validierten 10-Item-Skala von Schwarzer und Jerusalem (1995) gemessen, 4-stufige Likert-Skala (1 = stimmt nicht; 4 = stimmt genau). Zwei Messzeitpunkte: Prä-Messung vor Session 1 (ab 8. August 2026) und Post-Messung nach der letzten Session (1.–4. September 2026). Die Prä-GSE fließt als numerischer Baseline-Wert in das Nutzerprofil ein und beeinflusst über den Systemprompt alle KAIA-Sessions. Die Post-GSE ist die primäre Outcome-Variable für H1. Der Gesamtscore ergibt sich als arithmetisches Mittel aller Items (Range 1,0–4,0); Normdaten für deutschsprachige Bevölkerungsstichproben: M = 2,97 (SD = 0,49; Schwarzer & Jerusalem, 1995). Die Wahl der allgemeinen GSE gegenüber einer domänenspezifischen Skala ist dadurch begründet, dass KAIA als bereichsübergreifender Lernbegleiter konzipiert ist und die transferierbare Lernkompetenzüberzeugung — nicht der konkrete Lerninhalt — das Zielkonstrukt darstellt.

Motivationale Lernstrategien werden mit einer MSLQ-Kurzversion erhoben (Pintrich et al., 1991, 1993): 34 Items aus fünf Subskalen, 7-stufige Likert-Skala (1 = gar nicht zutreffend; 7 = sehr zutreffend). Fisher-Yates-Randomisierung der Itemreihenfolge innerhalb jeder Subskala verhindert Reihenfolgeeffekte. Subskalen-Scores werden als Mittelwerte berechnet. Die Erhebung erfolgt einmalig als Prä-Messung vor Session 1. Die eingesetzte Version ist eine Selektion aus dem 81-Item-Originalinstrument ohne eigenständige Revalidierung; Subskalen-Cronbachs-Alphas werden post-hoc aus den Pilotdaten berechnet. Zweck: Stichprobencharakterisierung, Confounder-Kontrolle und Konstruktkonvergenz-Prüfung (H3: MSLQ-Selbstwirksamkeit × GSE-Prä).

**Prozessnahe Verhaltensdaten:**
Innerhalb jeder Session stehen vier diskrete In-Session-Feedback-Marker zur Verfügung. Diese bilden verhaltensnahe In-situ-Prozessindikatoren ohne EMA-konforme Stichproben-Randomisierung. Sie sind keine validierten psychometrischen Skalen. Ihre Konstruktbezüge sind theoretisch begründet, nicht empirisch validiert.

| Marker | Kürzel | Konstruktnähe |
|---|---|---|
| Transfer-Marker | `transfer_marker` | Subjektiv bedeutsamer Transfermoment; Indikator für tiefe Verarbeitung (Craik & Lockhart, 1972) |
| Aha-Erlebnis | `wow` | Verständnisdurchbruchserlebnis; Indikator für elaborative Verknüpfung |
| Stecken-Geblieben | `stuck` | Kognitives Overloading, Blockade-Signal (Sweller, 1988) |
| Verständnislücke | `unclear` | Inhaltliche Unklarheit; Indikator für Verstehenshemmung |

Gespeichert werden Zeitstempel, Session-ID, Marker-Typ und pseudonymisierte User-ID. Auswertungen sind rein explorativ-deskriptiv. Inferenzstatistische Schlüsse auf Basis dieser Marker sind nicht vorgesehen.

**Qualitative Daten:**
Alle Chat-Sessions werden vollständig pseudonymisiert in der Datenbank gespeichert. Nach Sitzungsende erzeugt ein separater LLM-Call eine strukturierte Zusammenfassung mit acht Pflichtfeldern (Beobachtung, vereinbarter Schritt, Stimmung, Reibungspunkte, stärkstes Zitat der lernenden Person u. a.). Die Zusammenfassungen dienen der Cross-Session-Gedächtnisfunktion und der qualitativen Analyse; ihr generativer Ursprung wird bei der Interpretation berücksichtigt. Ausgewählte Transkripte und Summaries werden mit Thematischer Analyse (Braun & Clarke, 2006) induktiv kodiert. Am Studienende enthält ein optionaler Erfahrungsbericht die Frage: "Gab es Bereiche, in denen du durch KAIA etwas in deinen Alltag übertragen hast, das vorher wissenstheoretisch klar, aber praktisch nicht umgesetzt war?" Diese qualitative Frage operationalisiert den KDG-Effekt ohne standardisiertes Instrument.

**Nutzungsstatistiken als Kovariaten:**
Anzahl abgeschlossener Sessions, Gesamtnutzungsdauer und Nutzungszeitpunkte werden als deskriptive Kovariaten erhoben (nur bei `consent_analytics = true`) und in die explorative Auswertung von H2 (Nutzungshäufigkeit × ΔGSE) einbezogen.

### 4.3.2 Datenschutz und Erhebungssicherung

Alle Daten werden pseudonymisiert auf dem Hetzner-Server (Helsinki, EU) gespeichert. Chatinhalte werden für die LLM-Verarbeitung an OpenAI übertragen. Ein Data Processing Agreement ist abgeschlossen (vgl. *[→ Anhang G]*). Betroffenenrechte Art. 15–21 DSGVO sind als API-Endpunkte vollständig implementiert. Der Study-Lock verhindert nachträgliche Schemaänderungen, die die Datenstruktur der Erhebungsphase verändern könnten. Pseudonymisierte Studiendaten werden 6 Monate nach Studienabschluss gelöscht. Ein Löschprotokoll wird geführt.

**Technisches Protokoll-Enforcement:** Die Journey-State-Machine im Backend stellt sicher, dass Teilnehmende Sessions erst nach Abschluss der Prä-Befragung (MSLQ + GSE) starten können und die Post-GSE-Erhebung nach der letzten Session eingeblendet wird. Der System-Guard prüft bei jeder Session-Erstellungsanfrage den Studienstatus der Nutzerin. Dieser automatisierte Flow ist das technische Äquivalent eines experimentellen Protokolls und verhindert Abweichungen in der Erhebungsreihenfolge, die bei manueller Kontrolle bei N ≈ 20 Teilnehmenden schwer zu überwachen wären.

---

## 4.4 Auswertungsverfahren

### 4.4.1 Statistische Analysestrategie

Die statistische Auswertung der Pilotstudie folgt einer explorativen, nicht-konfirmatorischen Strategie. Bei N ≈ 20 und ordinaler 4-Punkt-Skala (GSE) ist der Wilcoxon-Vorzeichenrangtest (Wilcoxon, 1945) der methodisch angemessene Ersatz für den t-Test, da Normalverteilungsannahmen bei dieser Stichprobengröße nicht überprüfbar sind. Die Effektgröße wird als r = |Z| / √N berechnet (Rosenthal, 1991).

Für bivariate Zusammenhänge (H2: Nutzungshäufigkeit × ΔGSE; H3: MSLQ-Selbstwirksamkeit × GSE-Prä) wird Spearmans Rangkorrelation eingesetzt, ergänzt durch Bootstrap-BCa-Konfidenzintervalle (R = 2.000 Iterationen; Efron & Tibshirani, 1993). Bootstrap-BCa ist bei asymmetrischen Verteilungen und kleinen Stichproben der Fisher-z-Transformation vorzuziehen, da diese Normalverteilungsannahmen voraussetzt, die bei N < 30 selten erfüllt sind.

H4 (Verlauf der In-Session-Feedback-Marker über die Studienlaufzeit) und H5 (KDG-Selbstbericht: subjektiv wahrgenommene Alltagsanwendungshäufigkeit) werden ausschließlich deskriptiv ausgewertet. Auf eine Bonferroni-Korrektur wird angesichts des explorativen Charakters und der kleinen Stichprobe verzichtet. Dies wird im Ergebniskapitel transparent kommuniziert.

Intent-to-Treat-Reporting: Alle rekrutierten Teilnehmenden werden in der Stichprobenbeschreibung ausgewiesen. Teilnehmende mit weniger als drei abgeschlossenen Sessions werden als Dropout klassifiziert. Für die primäre Hypothesenprüfung (H1) werden nur Teilnehmende mit vollständigem Prä-Post-Datensatz einbezogen. Eine Sensitivitätsanalyse prüft den Einfluss von Ausreißern auf die Effektgröße.

**Power-Analyse (G*Power 3.1; Faul et al., 2007):** Bei N = 20, d = 0.5 und α = .05 (einseitig, entsprechend der gerichteten H1) beträgt die Power ca. 69 %. Bei realistischeren Effektgrößen d = 0.30–0.40 sinkt die Power auf 41–55 %. Das Studiendesign ist explizit als explorative Pilotstudie zur Hypothesengenerierung konzipiert, nicht als konfirmatorische Überprüfung. Ein statistisch nicht-signifikantes Ergebnis schließt einen realen Effekt nicht aus.

### 4.4.2 Qualitative Analyse

Ausgewählte Transkripte und Session-Summaries werden mit Thematischer Analyse nach Braun und Clarke (2006) induktiv kodiert. Qualitative Befunde werden mit den quantitativen GSE- und In-Session-Daten trianguliert, um widersprüchliche Muster sichtbar zu machen. Alle Analyseskripte werden auf GitHub veröffentlicht. Ergebnisse werden unabhängig ihrer Richtung und Signifikanz vollständig und ungekürzt berichtet (APA 7 Reporting Standards).

### 4.4.3 Software

Alle Analysen erfolgen in R 4.5.x (R Core Team, 2024) mit den Paketen `coin`, `rstatix`, `boot`, `ggplot2` und `psych`.

### 4.4.4 Triangulation mit Eval-Metriken

Die M1–M8-Scores aus der LLM-Evaluationspipeline (Abschnitt 4.2.1) stehen als maschinell erhobener Evidenzstrang zur Verfügung. Sie ermöglichen Triangulation zwischen automatisiert gemessener Gesprächsqualität — sokratische Reinheit (M1), Missionserfüllung (M2), Krisenreaktion (M7) — und selbstberichtetem Erleben (GSE, In-Session-Marker). Diese Triangulation ist explorativ und adressiert die Frage, ob das Gesprächssystem die intendierten Qualitätskriterien auch unter Alltagsbedingungen aufrechthält. Die Eval-Metriken bilden damit einen eigenständigen Evidenzstrang neben der Pilotstudie, der eine modellseitige Erklärung für Varianz in den Nutzeroutcomes ermöglicht.

---

*Literaturangaben dieses Kapitels sind im konsolidierten Literaturverzeichnis am Ende der Thesis aufgeführt.*
