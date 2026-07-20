# Kapitel 4, Abschnitte 4.2.3–4.4 — Studiendesign und Pilotstudie

> **Stand:** 13. Juli 2026 · **Version:** 0.9-DRAFT
> **Reviewer:** Psychologe · Compliance · Data Scientist · Discovery Researcher
> **Status:** Vollständige Überarbeitung — Messmodell finalisiert (MSLQ 34 Items + GSE 10 Items + EMA 4 Typen); FKS aus Messmodell entfernt; Studienstart korrigiert (1. August 2026); Timeline-Sektion erstellt; Limitationen eigenständig ausgegliedert. Studie hat noch NICHT begonnen (Stand: 13. Juli 2026).

---

## Überblick

Kapitel 6 beschreibt Design, Durchführung und — soweit zum aktuellen Zeitpunkt möglich — die geplanten Auswertungsschritte der explorativen Pilotstudie mit KAIA. Die methodische Grundlage entspricht dem Studienprotokoll (v2.0, docs/STUDIENPROTOKOLL.md). Die Datenerhebung beginnt am 1. August 2026 und endet am 29. August 2026.

---

## 6.1 Forschungsdesign

### 6.1.1 Studientyp und methodologischer Rahmen

Design: Einfaktorielle Prä-Post-Untersuchung ohne Kontrollgruppe, eingebettet in einen explorativen Mixed-Methods-Ansatz (qualitativ-quantitativ).

Die Studie ist im Design Science Research-Paradigma (Hevner et al., 2004) verankert: KAIA ist das zu evaluierende Artefakt. Die empirische Pilotierung dient als Evaluation-Schritt des DSR-Zyklus — sie prüft nicht primär theoretische Hypothesen, sondern liefert explorative Erkenntnisse über Nutzbarkeit, subjektive Wirksamkeitserfahrung und technische Robustheit des Systems. Die Unterscheidung zwischen Artefakt-Evaluation und hypothesenprüfender Forschung ist für die Interpretation der Ergebnisse konstitutiv (Gregor & Hevner, 2013).

### 6.1.2 Begründung des Designs ohne Kontrollgruppe

Die fehlende Kontrollgruppe ist systematisch begründet: Bei N ≈ 20 Teilnehmenden würde eine Aufteilung in Experimental- und Kontrollgruppe (N ≈ 10 pro Bedingung) zu statistisch nicht interpretierbaren Gruppenvergleichen führen. Die Power wäre selbst für mittlere Effekte (d = 0.5) unter 30 %. Das Design verzichtet daher bewusst auf konfirmatorische Gruppenvergleiche und setzt auf explorative Verlaufs- und Prozessanalyse. Konfirmatorische Schlüsse sind explizit nicht intendiert; die Studie dient der Hypothesengenerierung für eine Folgestudie mit adäquater Power.

---

## 6.2 Stichprobe

### 6.2.1 Rekrutierung und Einschlusskriterien

**Rekrutierung:** Persönliches Netzwerk der Forscherin (Convenience Sample; Einschränkung: s. Positionality Statement 6.2.3)

**Einschlusskriterien:**
- Volljährig (≥ 18 Jahre)
- Deutschsprachig (Muttersprache oder vergleichbare Kompetenz C1+)
- Aktive Lernsituation zum Zeitpunkt der Teilnahme (Studium, berufliche Weiterbildung, selbstorganisiertes Lernen) **bei der grundlegendes Vorwissen zum gewählten Thema vorhanden ist und die primäre Herausforderung in der Umsetzung liegt** (Knowing-Doing Gap; Pfeffer & Sutton, 2000). Reine Wissensneueinsteiger ohne Bezug zum Thema sind nicht die primäre Zielgruppe.
- Zugang zu Computer oder Tablet mit stabiler Internetverbindung
- Schriftliche informierte Einwilligung (Multi-Step-Consent; s. 6.4.1)

**Ausschlusskriterien:**
- Aktuelle oder anamnestische psychiatrische Diagnose (Selbstauskunft)
- Aktuelle Krisenintervention oder psychotherapeutische Behandlung
- Unzureichende Schreib- und Lesefähigkeit auf Deutsch

### 6.2.2 Stichprobengröße und Power-Analyse

| Parameter | Wert |
|---|---|
| Ziel-N (auswertbar) | ≈ 20 |
| Rekrutierungsziel | ≈ 25–28 (25 % Dropout-Puffer) |
| Untergrenze Auswertung | 15 (darunter: deskriptive Fallbeschreibungen statt Inferenzstatistik) |
| Power bei N = 20, d = 0.5, α = .05 | ≈ 56 % |
| Power bei N = 20, d = 0.4, α = .05 | ≈ 37 % |
| Primäre Analysemethode (H1) | Wilcoxon-Vorzeichenrangtest |

Power-Analyse durchgeführt mit R (Paket `pwr` v1.3, Skript: `docs/power_analyse.R`). Details: Studienprotokoll v2.0, Kapitel 3.

**Bewertung — bewusste Unterpower:**
Die Pilotstudie ist bewusst unterpowert. Bei d = 0.5 (mittlerer Effekt nach Cohen, 1988) und N = 20 beträgt die Power ca. 56 %; bei d = 0.4 — einer konservativen Schätzung für eine junge Systemintervention ohne externe Baseline-Evidenz — sinkt sie auf ca. 37 %. Das bedeutet konkret: Selbst wenn ein realer Effekt vorliegt, wird er mit hoher Wahrscheinlichkeit statistisch nicht signifikant. Dies ist kein methodischer Fehler, sondern eine strukturelle Realität einer Masterthesis-Pilotstudie. Der Erkenntnisbeitrag dieser Studie liegt in der qualitativen Exploration und der Systemvalidierung, nicht in der statistischen Bestätigung von Hypothesen. Wer aus dieser Studie konfirmatorische Schlüsse zieht, überdehnt die Datenlage.

### 6.2.3 Positionality Statement und Bias-Kontrolle

Die Forscherin ist gleichzeitig Entwicklerin von KAIA und potenzielle Kommerzialisiererin des Systems. Dieser dreifache Interessenkonflikt (Forscherin — Entwicklerin — Kommerzinteressentin) wird offen deklariert und ist ein methodisch bedeutsames Merkmal dieser Studie, das ihre gesamte epistemische Reichweite begrenzt.

**Maßnahmen zur Bias-Minimierung:**
1. Standardisiertes Outcome-Maß (GSE-Skala) mit etablierten, unabhängig validierten Gütekriterien
2. Anonymisierte Dateneingabe im System — kein direkter Kontakt zwischen Forscherin und Teilnehmenden während der Fragebogenerhebung
3. Expliziter Hinweis in der Einwilligungserklärung auf die Erwünschtheit ehrlicher, auch negativer Rückmeldungen
5. Zurückhaltende und explizit selbstkritische Ergebnisinterpretation gemäß APA 7 Reporting Standards

**Social-Desirability-Bias:** Die Rekrutierung aus dem persönlichen Netzwerk der Forscherin begünstigt systematische Verzerrung durch soziale Erwünschtheit strukturell. Teilnehmende könnten Selbstberichte unbewusst an wahrgenommenen Erwartungen der Forscherin ausrichten. Dieser Bias ist durch die technischen Maßnahmen in Punkt 3 und 4 lediglich reduziert, nicht eliminiert. Eine zusätzliche Skala zur sozialen Erwünschtheit (Stöber, 1999) wird für die Pilotierung nicht eingesetzt, um den Fragebogenumfang nicht weiter zu erhöhen; die damit verbundene Einschränkung wird in Abschnitt 6.10 vollständig ausgewiesen.

---

## 6.3 Messinstrumente

### 6.3.1 Motivierte Lernstrategien — MSLQ (Kurzversion, Prä-Messung)

**Instrument:** Motivated Strategies for Learning Questionnaire, KAIA-Kurzversion (Pintrich, Smith, Garcia & McKeachie, 1991, 1993)
**Fassung:** 34-Item-Adaptation mit 5 Subskalen, dokumentiert in docs/STUDIENPROTOKOLL.md
**Skalierung:** 7-stufige Likert-Skala (1 = gar nicht zutreffend, 7 = sehr zutreffend)
**Erhebungszeitpunkt:** Einmalig als Prä-Messung vor der ersten Session; kein Post-MSLQ

**Subskalen:**

| Subskala | Konstrukt | Items (Adaptation) | α (Original) |
|---|---|---|---|
| Intrinsische Zielorientierung | Motivation durch Interesse, Verstehen und Kompetenzentwicklung | 4 | .74 (Pintrich et al., 1993) |
| Selbstwirksamkeit für Lernen und Leistung | Überzeugung, Lernaufgaben erfolgreich bewältigen zu können | 8 | .93 (Pintrich et al., 1993) |
| Lernstrategien (Elaboration) | Aktive Verknüpfung neuen Wissens mit vorhandenen Wissensstrukturen | 10 | .76 (Pintrich et al., 1993) |
| Kognitive Verarbeitungstiefe | Tiefenorientierte Informationsverarbeitung, kritisches Denken | 8 | .80 (Pintrich et al., 1993) |
| **Kontrollüberzeugungen für Lernen** | Glaube, dass Anstrengung und Lernstrategien den Lernerfolg bestimmen (internale Attribution) | 4 | .68 (Pintrich et al., 1993) |

**Gütekriterien (Originalinstrument):**
- Interne Konsistenz: Cronbachs α zwischen .62 und .93 je Subskala (Pintrich et al., 1993)
- Konstruktvalidität: Konfirmatorische Faktorenanalyse bestätigt Skalstruktur (Pintrich et al., 1991)
- Prädiktive Validität: Positive Zusammenhänge mit Studienleistung nachgewiesen (Pintrich & De Groot, 1990)
- Normierung: Amerikanische College-Stichprobe (N > 400); keine repräsentative deutschsprachige Normstichprobe verfügbar — Vergleiche mit Normwerten sind nicht möglich
- Lizenzbedingungen: MSLQ ist frei verfügbar für Forschungszwecke (keine kommerziellen Lizenzkosten; Pintrich et al., 1991); Quellenangabe Pflicht

**Kritische psychometrische Einschränkungen der KAIA-Adaptation:**
Die in KAIA eingesetzte 34-Item-Version ist eine Selektion und Kurzung des 81-Item-Originalinstruments. Für diese Adaptation liegt keine eigenständige Validierungsstudie vor. Die Gütekriterien des Originalinstruments sind nicht automatisch auf eine gekürzte Version übertragbar (Stanton, Sinar, Balzer & Smith, 2002). Bei Kürzungen können Faktorstruktur, Reliabilität und Validität erheblich von der Originalversion abweichen. Die Subskalen-Cronbachs-Alphas werden aus den erhobenen Pilotdaten post-hoc berechnet und transparent berichtet. Sollten die internen Konsistenzwerte unter α = .70 fallen, ist die Aussagekraft der Subskalen-Scores stark eingeschränkt.

**Funktionen in dieser Studie:**
- Deskriptive Stichprobencharakterisierung: Lernmotivationsprofil der Teilnehmenden zu Studieneintritt
- Confounder-Kontrolle: MSLQ-Profil als potentieller Moderator des GSE-Prä-Post-Effekts
- Konstruktkonvergenz-Prüfung: MSLQ-Selbstwirksamkeits-Subskala × GSE-Prä (H3)

**Was MSLQ-Werte nicht leisten:** Auf Basis von MSLQ-Scores lassen sich keine Vorhersagen über individuelle Lernerfolge, Kompetenzniveaus oder Potenziale ableiten, die über die durch Validierungsstudien belegte Korrelationsstruktur hinausgehen.

### 6.3.2 Allgemeine Selbstwirksamkeitserwartung — GSE (Prä- und Post-Messung)

**Instrument:** General Self-Efficacy Scale, deutschsprachige Originalversion (Schwarzer & Jerusalem, 1995)
**Items:** 10 (Beispielitem: "Wenn ich mit einem Problem konfrontiert werde, habe ich meist mehrere Ideen, wie ich damit fertig werde.")
**Skalierung:** 4-stufige Likert-Skala (1 = stimmt nicht, 4 = stimmt genau)
**Erhebungszeitpunkte:** Prä-Messung (vor erster Session, ab 1. August 2026) und Post-Messung (29. August – 5. September 2026)

**Gütekriterien (Originalinstrument):**
- Interne Konsistenz: Cronbachs α = .80–.90 in zahlreichen Validierungsstudien (N > 1.000; Schwarzer & Jerusalem, 1995)
- Test-Retest-Reliabilität: r = .55–.75 je nach Erhebungsintervall (Schwarzer, 1992); hinreichend stabil für Prä-Post-Design
- Konstruktvalidität: Konvergente Validität mit verwandten Selbstwirksamkeitskonstrukten nachgewiesen; diskriminante Validität gegenüber Optimismus, Depressivität und Ängstlichkeit belegt (Schwarzer & Jerusalem, 1995)
- Normierung: Deutschsprachige Bevölkerungsstichprobe (Jerusalem & Schwarzer, 1999); Normen nach Geschlecht vorhanden, Alters- und Bildungsnormen eingeschränkt
- Lizenzbedingungen: Frei verfügbar für Forschungszwecke; Quellenangabe Pflicht; ITC-Richtlinien zur Testnutzung eingehalten
- ITC-Konformität: Instrument ist für digital selbst-administrierte Erhebung geeignet (kein verändernder Einfluss des Erhebungsmodus bei Selbstauskunft)

**Methodische Diskussion — Trait-Stabilität als Sensitivitätsproblem:**
Die GSE ist konzeptionell als generalisierendes Trait-Konstrukt angelegt: Sie erfasst stabile Überzeugungen über die eigene Handlungsfähigkeit, keine situativen Zustände (Bandura, 1997). Dies erzeugt ein strukturelles Sensitivitätsproblem — eine 4-wöchige Intervention erzeugt möglicherweise nicht hinreichend starke Mastery Experiences, um stabile Trait-Überzeugungen zu verändern. Empirisch belegt ist jedoch, dass Trait-Selbstwirksamkeit auf intensive Kompetenz- und Mastery-Erfahrungen reagiert (Jerusalem & Schwarzer, 1992; Bandura, 1997, Kap. 3). Die Wahl der allgemeinen GSE gegenüber einer domänenspezifischen Skala ist dadurch begründet, dass KAIA als bereichsübergreifender Lernbegleiter konzipiert ist; eine domänenspezifische Skala würde nur den konkreten Lerninhalt der Teilnehmenden erfassen, nicht die transferierbare Lernkompetenzüberzeugung. Das Sensitivitätsproblem wird als bekannte Limitation akzeptiert und in Abschnitt 6.10 vollständig ausgewiesen.

**Wichtige Abgrenzung:** Die GSE misst Selbstwirksamkeitserwartungen — keine Kompetenz, keine Leistung, kein Lernpotenzial. Aus GSE-Werten lassen sich keine Leistungsprognosen ableiten, die über den durch Meta-Analysen belegten Zusammenhang hinausgehen (r ≈ .38; Multon, Brown & Lent, 1991).

### 6.3.3 In-situ EMA — Ökologisches Momentanassessment (Session-Feedback)

Innerhalb jeder Session stehen Teilnehmenden vier diskrete Feedback-Marker zur Verfügung. Diese werden als Ecological Momentary Assessment (EMA; Shiffman, Stone & Hufford, 2008) im Sinne verhaltensnaher In-situ-Prozessindikatoren eingesetzt.

| Marker | Kürzel | Konstruktnähe |
|---|---|---|
| Transfer-Marker | `transfer_marker` | Subjektiv bedeutsamer Transfermoment; Indikator für tiefe Verarbeitung (Craik & Lockhart, 1972) |
| Aha-Erlebnis | `wow` | Subjektives Verständnisdurchbruchserlebnis; Indikator für elaborative Verknüpfung (Flavell, 1979) |
| Stecken-Geblieben | `stuck` | Metakognitiver Distress, kognitives Overloading; Indikator für mögliches Kalibrierungsversagen |
| Verständnislücke | `unclear` | Inhaltliche Unklarheit; Indikator für Verstehenshemmung (Dunlosky & Metcalfe, 2009) |

**Speicherung:** Zeitstempel, Session-ID, Marker-Typ, pseudonymisierte User-ID → Tabelle `session_feedback`

**Wissenschaftliche Grundlage:** Metacognitive Monitoring als Lernprozessvariable (Flavell, 1979; Dunlosky & Metcalfe, 2009); In-situ-Signale als Ergänzung zu Post-hoc-Selbstberichten (Larson & Csikszentmihalyi, 1983).

**Kritische methodische Einschränkung:** Die vier EMA-Marker sind keine validierten psychometrischen Skalen. Sie sind verhaltensnahe Selbstsignale ohne standardisierte Gütekriterien. Ihre Konstruktbezüge in der Tabelle oben sind theoretisch begründet, nicht empirisch validiert. Jede Auswertung dieser Daten ist rein explorativ-deskriptiv; inferenzstatistische Schlüsse auf Basis dieser Marker sind nicht vorgesehen und nicht gerechtfertigt.

### 6.3.4 Qualitative Daten

**Session-Transkripte:** Vollständige Chat-Verläufe jeder KAIA-Session, pseudonymisiert gespeichert. Basis für die qualitative Thematische Analyse (Braun & Clarke, 2006) ausgewählter Verläufe.

**Session-Summaries:** Von KAIA nach jeder Session automatisiert generierte Zusammenfassungen des Gesprächsverlaufs und identifizierter Lernmomente. Werden ergänzend zu den Transkripten für die qualitative Analyse herangezogen; ihr generativer Ursprung wird bei der Interpretation berücksichtigt.

**Triangulation:** Qualitative Befunde aus Transkripten und Summaries werden mit den quantitativen EMA- und GSE-Daten trianguliert, um widersprüchliche Muster sichtbar zu machen.

Im Erfahrungsbericht am Studienende (optional) wird explizit erfragt: 'Gab es Bereiche, in denen du durch KAIA etwas in deinen Alltag übertragen hast, das vorher wissenstheoretisch klar, aber praktisch nicht umgesetzt war?' Diese qualitative Frage operationalisiert den KDG-Effekt ohne standardisiertes Instrument.

### 6.3.5 Nutzungsstatistiken (Kovariaten)

Sofern `consent_analytics = true`: Anzahl abgeschlossener Sessions, Gesamtnutzungsdauer, Zeitpunkte der Nutzung. Werden als deskriptive Kovariaten in explorative Analysen einbezogen und ermöglichen die Beschreibung der Nutzungsintensität.

---

## 6.4 Ethische Anforderungen und Datenschutz

### 6.4.1 Informierte Einwilligung (Multi-Step-Consent)

Die Einwilligung erfolgt in zwei getrennten, unabhängigen Schritten:

1. **Checkbox 1 — Datenverarbeitung:** Einwilligung in die DSGVO-konforme Verarbeitung personenbezogener Daten (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO)
2. **Checkbox 2 — Studienteilnahme:** Einwilligung in die Nutzung der Daten für Studienzwecke (Analytics, Auswertung, Thesis, Publikation)

Beide Checkboxen sind inhaltlich und technisch voneinander unabhängig. Eine Verweigerung von Checkbox 2 schließt die KAIA-Nutzung nicht aus, führt jedoch zum Ausschluss aus der Studienauswertung. Die Einwilligung ist jederzeit widerrufbar (DSGVO Art. 7 Abs. 3).

### 6.4.2 KI-Disclosure

Vor dem Onboarding erhalten alle Teilnehmenden einen expliziten, persistent sichtbaren Hinweis, dass KAIA ein KI-System ist — kein Mensch, keine psychologische Fachkraft (computational empathy im Sinne von Decety & Jackson, 2004). Dieser Hinweis muss aktiv bestätigt werden und ist nicht überspringbar.

### 6.4.3 Crisis-Detection

Ein automatisierter Pre-Filter analysiert jeden User-Input auf Krisensignale (psychologische Notlage, Suizidalität). Bei Detektion wird eine statische, nicht-interaktive Eskalations-Notice angezeigt:

> **Telefonseelsorge: 0800 111 0 111 (kostenlos, 24 Stunden, 7 Tage)**

Die KAIA-Session wird nicht fortgeführt. Diese Maßnahme ist nicht optional — sie entspricht den berufsethischen Mindeststandards der DGPs/BDP für digitale psychologische Angebote und ist gemäß den wissenschaftlichen Pflichten der Thesis nicht verhandelbar.

### 6.4.4 DSGVO-Konformität

- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- **Betroffenenrechte:** DSGVO Art. 15–21 vollständig implementiert (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch)
- **Serverstandort:** Hetzner CX23, Helsinki (EU) — kein US-Datentransfer für Nutzerdaten
- **LLM-Training:** Nutzerdaten werden nicht für LLM-Training verwendet (Data Processing Agreements; s. 6.4.5)
- **Löschfrist:** Pseudonymisierte Studiendaten werden 6 Monate nach Studienabschluss gelöscht; Löschprotokoll wird geführt
- **Schrems-II:** Risikoabschätzung für Drittlanddatenübermittlung (LLM-API-Calls) in der Datenschutzerklärung dokumentiert

### 6.4.5 Data Processing Agreements (DPAs)

DPAs mit allen drei LLM-Anbietern sind in Bearbeitung (Stand: 13. Juli 2026):
- Anthropic (Claude Sonnet 4.6)
- OpenAI (GPT-4o)
- Mistral AI (Mistral Large)

Die DPAs müssen vor dem Study-Lock am 28. Juli 2026 vollständig abgeschlossen und dokumentiert sein. Kein Studienbeginn ohne unterzeichnete DPAs — dies ist eine nicht verhandelbare Voraussetzung.

### 6.4.6 Conflict of Interest — Deklaration

Die Forscherin ist gleichzeitig Entwicklerin von KAIA und potenzielle Kommerzialisiererin. Dieser Konflikt ist in der Thesis offen deklariert (Positionality Statement, s. 6.2.3), im Studienprotokoll dokumentiert und in der Einwilligungserklärung für Teilnehmende kommuniziert. Die Deklaration folgt den Anforderungen der DGPs-Richtlinien für gute wissenschaftliche Praxis.

---

## 6.5 Timeline

| Datum | Meilenstein | Status (13.07.2026) |
|---|---|---|
| Laufend | DPAs abgeschlossen (Anthropic, OpenAI) | Abgeschlossen ✓ |
| **28. Juli 2026** | **Study-Lock: Prompt-Freeze** — keine Prompt- oder Schema-Änderungen ab diesem Datum | Geplant |
| **1. August 2026** | **Studienstart** — Registrierung, KI-Disclosure, Multi-Step-Consent, Prä-Befragung (MSLQ + GSE) + erste Sessions möglich | Geplant |
| 1. August – 29. August 2026 | Aktive Studienphase (4 Wochen, max. 1 Session pro Tag) | Geplant |
| **29. August 2026** | **Studienende** — letzte Session, Studienphase abgeschlossen | Geplant |
| 29. August – 5. September 2026 | Post-Befragung (GSE Post, 10 Items); optionaler Erfahrungsbericht | Geplant |
| September – Oktober 2026 | Datenauswertung, qualitative Analyse, Ergebniskapitel | Geplant |
| **1. September 2026** | **Abgabe Masterthesis** (SRH Fernhochschule Riedlingen) | Deadline |

**Kritischer Hinweis (Stand 15. Juli 2026):** Die Studie hat noch NICHT begonnen. DPAs mit Anthropic und OpenAI sind abgeschlossen. Offene kritische Voraussetzungen: Datenschutzerklärung, Impressum, Password-Reset-Flow, Postgres-Backup, Study-Lock. Ohne Abschluss dieser Punkte vor dem 28. Juli 2026 verschiebt sich der Studienstart. Eine Verschiebung über den 8. August 2026 hinaus würde den Thesis-Abgabetermin gefährden.

---

## 6.6 Ablauf und Sessionstruktur

### 6.6.1 Phasenübersicht

```
Datum                Aktivität
─────────────────────────────────────────────────────────────────────
Vor Studie           DPAs abgeschlossen (Anthropic, OpenAI) ✓
28. Juli 2026        Study-Lock: Prompt-Freeze
1. August 2026       Registrierung | KI-Disclosure | Multi-Step-Consent
                     MSLQ Prä (34 Items, ≈ 12 Min.) + GSE Prä (10 Items, ≈ 5 Min.)
                     Erste Session möglich
1.–29. August 2026   Strukturierte KAIA-Nutzung
                       Mindest-Sessions: 3 (Auswertbarkeitsgrenze)
                       Ziel-Sessions: 10 (für Verlaufsanalyse erforderlich)
                       Max. 1 Session pro Tag
                       EMA-Marker kontinuierlich verfügbar
29. August 2026      Letzte mögliche Session | Studienende
29. Aug.–5. Sep.     GSE Post (10 Items, ≈ 5 Min.) | optionaler Erfahrungsbericht
Nach Studie          Auswertung | 6-Monate-Löschfrist beginnt
```

### 6.6.2 Sessionstruktur

**Sessions 1–2: Foundation-Sessions (ca. 20–30 Minuten)**
- Motiv-Dialog: Probing nach dem Lernziel hinter dem Lernziel
- Learning Intention formulieren (nicht bloße Task-Benennung)
- Lernschritt + Implementation Intention: Wann, wo, wie (Gollwitzer, 1999)
- Evidenzanker definieren: "Woran würdest du merken, dass du es wirklich verstanden hast?"
- Lerntyp-Routing, Standortbestimmung

**KDG-Exploration als expliziter Bestandteil:** KAIA fragt früh, was die Person bereits über das Thema weiß und in welchen Situationen sie weiß, was zu tun wäre, es aber nicht tut. Dieser KDG-Spiegel bildet die Grundlage für alle Folge-Sessions.

**Sessions 3–10: Micro-Sessions (ca. 10–15 Minuten)**
- Cross-Session-Memory übernimmt Kontextaufbau (kein erneutes Onboarding)
- Erster-Schritt-Loop: Rückbezug auf Lernschritt + Evidenzanker-Abgleich
- EMA-Marker kontinuierlich nutzbar

**Mindestvorgabe für Auswertbarkeit:** Mindestens 3 abgeschlossene Chat-Sessions innerhalb der 4 Wochen. Teilnehmende mit weniger als 3 Sessions werden als Dropout klassifiziert und im Intent-to-Treat-Reporting ausgewiesen. Für die Verlaufsanalyse der EMA-Daten sind mindestens 5 Sessions erforderlich; der Zielwert von 10 Sessions ermöglicht erst eine sinnvoll interpretierbare Zeitreihe.

**Zeitaufwand für Teilnehmende (Schätzung):**
MSLQ Prä (12 Min.) + GSE Prä/Post (2 × 5 Min.) + Sessions 1–2 (2 × 25 Min.) + Sessions 3–10 (8 × 12 Min.) = 12 + 10 + 50 + 96 = **ca. 168 Minuten ≈ 2,8 Stunden** über 4 Wochen.

**Keine inhaltlichen Vorgaben:** Teilnehmende wählen selbst, welche Lernthemen sie mit KAIA bearbeiten. Das entspricht dem explorativen Charakter der Studie und der ökologischen Validität des Feldeinsatzes. Die Heterogenität der Lernthemen wird als Confounder dokumentiert.

### 6.6.3 LLM-Modell-Zuweisung (explorativ)

Die technische Infrastruktur ermöglicht eine per-User-Modell-Zuweisung. Für die Pilotstudie sind folgende Modelle verfügbar:
- Claude Sonnet 4.6 (Anthropic)
- GPT-4o (OpenAI)
- Mistral Large (Mistral AI)

**Methodische Einschränkung:** Mit N ≈ 20 Teilnehmenden ist kein statistisch robuster Gruppenvergleich nach LLM-Modell möglich. Selbst bei perfekter Aufteilung (N ≈ 7 pro Gruppe) wäre die Power für Gruppenunterschiede vernachlässigbar. LLM-spezifische Unterschiede können in dieser Pilotstudie nicht von KAIA-Design-Effekten, individuellen Unterschieden oder Themeneffekten getrennt werden. Der LLM-Vergleich ist daher rein explorativ-deskriptiv und dient der Vorbereitung des Hauptstudiendesigns für eine Folgestudie mit adäquater Power und echtem Gruppendesign.

---

## 6.7 Hypothesen

**H1 (primär, gerichtet):** Die GSE nach vier Wochen KAIA-Nutzung ist signifikant höher als vor der Nutzung (Wilcoxon-Vorzeichenrangtest, α = .05, zweiseitig).

*Methodische Anmerkung: Angesichts der bekannten Unterpower (Power ≈ 56 % bei d = 0.5, N = 20) ist ein statistisch nicht-signifikantes Ergebnis wahrscheinlich — auch wenn ein realer Effekt vorliegen sollte. Die Signifikanzentscheidung wird daher durch Effektgröße (r = z / √N) und deskriptive Statistik ergänzt und nicht isoliert interpretiert.*

**H2 (explorativ, ungerichtet):** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit (Anzahl abgeschlossener Sessions) und GSE-Veränderung (Spearman-Rho).

**H3 (explorativ, konstruktiv):** Die MSLQ-Selbstwirksamkeits-Subskala korreliert positiv mit der GSE-Prä-Messung (Konstruktkonvergenz; Spearman-Rho). Diese Hypothese dient ausschließlich der Plausibilitätsprüfung der MSLQ-Kurzversion — ein substantieller Zusammenhang zwischen zwei Selbstwirksamkeitsskalen ist theoretisch zu erwarten (Bandura, 1997).

**H4 (explorativ, prozessbezogen):** Die relative Häufigkeit von `transfer_marker`- und `wow`-EMA-Signalen (positive Indikatoren) nimmt über die Studienlaufzeit im Verhältnis zu `stuck`- und `unclear`-Signalen (Distress-Indikatoren) zu. Diese Hypothese wird ausschließlich deskriptiv ausgewertet.

**H5 (explorativ, KDG-spezifisch):** Die subjektiv wahrgenommene Häufigkeit, mit der Teilnehmende das Lernthema im Alltag aktiv anwenden, steigt über die Studienlaufzeit (Selbstbericht am Studienende im Vergleich zu Session 1). Diese Hypothese wird ausschließlich deskriptiv ausgewertet und dient der direkten Operationalisierung des Knowing-Doing Gaps.

---

## 6.8 Statistische Analysemethoden

- **Deskriptive Statistik:** M, SD, Median, IQR, Häufigkeitsverteilungen für alle Messzeitpunkte
- **Wilcoxon-Vorzeichenrangtest (H1):** Nonparametrisch wegen N < 30; Effektgröße r = z / √N; zweiseitig, α = .05
- **Spearman-Rho-Korrelation (H2, H3):** Nutzungshäufigkeit × GSE-Differenz; MSLQ-Selbstwirksamkeit × GSE-Prä; mit 95 %-Konfidenzintervall (Bootstrap)
- **MSLQ-Subskalen-Analyse:** Itemstatistiken, Cronbachs α post-hoc je Subskala, Interkorrelationsmatrix der Subskalen
- **EMA-Verlaufsanalyse (H4):** Absolute und relative Häufigkeiten der vier Marker-Typen pro Session und über den Studienverlauf (deskriptiv; keine Inferenzstatistik)
- **Qualitative Thematische Analyse:** Ausgewählte Transkripte und Session-Summaries (Braun & Clarke, 2006); induktive Kodierung; Triangulation mit quantitativen Befunden
- **Intent-to-Treat-Reporting:** Dropout-Analyse; Sensitivitätsanalyse mit und ohne Ausreißer

**Analysesoftware:** R 4.5.x (Pakete: `coin`, `rstatix`, `ggplot2`, `psych`, `corrplot`, `boot`)

**Transparenz:** Alle Analyseskripte werden auf GitHub veröffentlicht. Ergebnisse werden unabhängig ihrer Richtung und Signifikanz vollständig und ungekürzt berichtet.

---

## 6.9 Erwartete Ergebnisse

Angesichts des explorativen Charakters und der bekannten Unterpower werden folgende Ergebnismuster als methodisch plausibel eingeschätzt. Dies sind keine Prognosen, sondern Planungshilfen für die Ergebnisinterpretation.

**Quantitative Befunde:**
- GSE Prä-Post (H1): Eine Verbesserungstendenz ist möglich; statistisch signifikant wird sie angesichts Power ≈ 56 % wahrscheinlich nicht. Ein nicht-signifikantes Ergebnis schließt einen realen Effekt nicht aus.
- MSLQ-GSE-Konvergenz (H3): Eine moderate positive Korrelation zwischen MSLQ-Selbstwirksamkeit und GSE-Prä ist theoretisch begründet und konstruktvalide zu erwarten (r = .30–.50).
- Nutzungshäufigkeit × GSE-Differenz (H2): Hohe Variabilität in der Nutzungsintensität erwartet; Zusammenhang unsicher.

**Qualitative Befunde:**
- Identifikation von Nutzungsmustern und strukturellen Nutzungsbarrieren
- Hinweise auf Stärken und Schwächen der sokratischen Gesprächsführung in KAIA
- Deskriptive Unterschiede zwischen LLM-Modellen im Gesprächsstil (nicht statistisch belastbar)

**Zentraler Erkenntnisbeitrag:** Der Wert dieser Pilotstudie liegt nicht in statistischen Signifikanzentscheidungen. Er liegt in der Systemvalidierung, der Beschreibung realweltlicher Nutzungsmuster und der Generierung präziser Hypothesen für eine Folgestudie mit adäquater Power, echter Kontrollgruppe und repräsentativerer Stichprobe.

---

## 6.10 Limitationen

Die Limitationen dieser Studie sind substanziell. Sie werden vollständig und ohne Relativierung kommuniziert — nicht als Formsache, sondern weil die Interpretation der Ergebnisse ohne Kenntnis dieser Einschränkungen irreführend wäre.

**1. Statistische Unterpower**
N ≈ 20 ist für konfirmatorische Hypothesenprüfung unzureichend. Power für H1 bei d = 0.5 liegt bei ca. 56 %, bei d = 0.4 bei ca. 37 %. Statistisch nicht-signifikante Ergebnisse schließen reale Effekte nicht aus. Statistisch signifikante Ergebnisse sind bei dieser Stichprobengröße mit Vorsicht zu interpretieren (erhöhte Falsch-Positiv-Rate bei Multiple Testing).

**2. Convenience Sample — eingeschränkte externe Validität**
Die Stichprobe entstammt dem persönlichen Netzwerk der Forscherin. Soziodemografische Merkmale, Bildungsniveau, Technikaffinität und Lernmotivation dieser Gruppe weichen systematisch von einer Zufallsstichprobe der Zielpopulation ab. Generalisierbarkeit der Ergebnisse auf andere Nutzungsgruppen ist nicht gegeben.

**3. Social-Desirability-Bias**
Teilnehmende aus dem Bekanntenkreis der Forscherin sind strukturell motiviert, positiver zu bewerten als sie es bei einem anonymen System täten. Technische Gegenmaßnahmen (anonymisierte Dateneingabe) reduzieren diesen Bias, eliminieren ihn nicht.

**4. Dreifacher Interessenkonflikt**
Die Forscherin ist gleichzeitig Entwicklerin und potenzielle Kommerzialisiererin. Trotz Vorregistrierung und standardisierter Instrumente ist eine vollständige Neutralisierung dieses Konflikts nicht möglich. Alle Schlussfolgerungen dieser Studie sind vor diesem Hintergrund zu rezipieren.

**5. Fehlende Kontrollgruppe**
Ohne Kontrollgruppe können beobachtete GSE-Veränderungen nicht kausal auf KAIA zurückgeführt werden. Reifung, Regression zur Mitte, Hawthorne-Effekt, parallele Lernerfahrungen und andere Störvariablen sind nicht kontrolliert.

**6. Trait-Stabilität der GSE — Sensitivitätsproblem**
Als Trait-Instrument reagiert die GSE möglicherweise nicht sensitiv auf kurzfristige Interventionseffekte einer 4-wöchigen Nutzungsphase. Eine mangelnde Veränderung kann Systemversagen oder Instrumentensensitivität widerspiegeln — beides ist auf Basis dieser Studie nicht unterscheidbar.

**7. MSLQ-Adaptation ohne eigenständige Validierung**
Die eingesetzte 30-Item-Kurzversion ist ohne eigene Validierungsstudie. Interne Konsistenzwerte werden post-hoc berechnet; die Gütekriterien des Originalinstruments (81 Items) gelten nicht automatisch. Bei α < .70 in einzelnen Subskalen sind die entsprechenden Scores nicht sinnvoll interpretierbar.

**8. EMA-Marker ohne psychometrische Validierung**
Die vier Session-Feedback-Marker sind keine validierten Skalen. Ihre Konstruktbezüge sind theoretisch, nicht empirisch belegt. Auswertungen sind rein deskriptiv; inferenzstatistische Schlüsse sind nicht zulässig.

**9. LLM-Effekt nicht isolierbar**
Der Effekt des zugrundeliegenden Sprachmodells (Claude vs. GPT-4o vs. Mistral) ist bei N ≈ 20 nicht von KAIA-Design-Effekten, individuellen Unterschieden oder Themeneffekten zu trennen. LLM-bezogene Aussagen in dieser Studie haben rein explorativen und hypothesengenerierenden Charakter.

**10. Nur deutschsprachige Teilnehmende**
Alle Instrumente und KAIA selbst sind auf Deutsch. Generalisierbarkeit auf andere Sprachgruppen ist nicht gegeben.

**11. Keine Langzeit-Follow-up-Messung**
Mangels zeitlicher Ressourcen (Thesis-Deadline 1. September 2026) ist kein Follow-up nach Studienabschluss vorgesehen. Nachhaltigkeitseffekte und Transkriptionsverläufe sind nicht messbar.

---

## 6.11 Ergebnisse

*[Dieser Abschnitt wird nach Abschluss der Post-Befragung (5. September 2026) befüllt. Datenlage: frühestens ab 6. September 2026 vollständig.]*

### 6.11.1 Stichprobenbeschreibung

*Platzhalter: N, Altersverteilung, Geschlecht, Lernthemen, Dropout-Rate, Nutzungsintensität*

### 6.11.2 Deskriptive Statistik

*Platzhalter: GSE Prä/Post (M, SD, Median, IQR); MSLQ-Subskalen (M, SD, α); EMA-Marker-Häufigkeiten*

### 6.11.3 Hypothesenprüfung

*Platzhalter — H1 (Wilcoxon), H2 (Spearman-Rho), H3 (Konstruktkonvergenz MSLQ × GSE), H4 (EMA-Verlauf, deskriptiv)*

### 6.11.4 Qualitative Befunde

*Platzhalter: Thematische Analyse ausgewählter Transkripte; Nutzungsmuster; Systemstärken/-schwächen*

---

## 6.12 Diskussion

*[Wird nach Fertigstellung von Abschnitt 6.11 verfasst.]*

Geplante Abschnitte:
- 6.12.1 Interpretation der Ergebnisse (vor dem Hintergrund von H1–H4 und der DSR-Evaluation)
- 6.12.2 Kritische Reflexion: Limitationen, Positionality, Bias-Diskussion
- 6.12.3 Implikationen für die Praxis (KAIA-Weiterentwicklung)
- 6.12.4 Implikationen für die Forschung (Folgestudiendesign mit adäquater Power)
- 6.12.5 Gesamtfazit

---

## Literaturverzeichnis (Kapitel 6)

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology, 3*(2), 77–101. https://doi.org/10.1191/1478088706qp063oa

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354

Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2. Aufl.). Lawrence Erlbaum.

Craik, F. I. M., & Lockhart, R. S. (1972). Levels of processing: A framework for memory research. *Journal of Verbal Learning and Verbal Behavior, 11*(6), 671–684. https://doi.org/10.1016/S0022-5371(72)80001-X

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.

Dunlosky, J., & Metcalfe, J. (2009). *Metacognition*. SAGE.

Flavell, J. H. (1979). Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry. *American Psychologist, 34*(10), 906–911.

Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. *American Psychologist, 54*(7), 493–503.

Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69–119.

Gregor, S., & Hevner, A. R. (2013). Positioning and presenting design science research for maximum impact. *MIS Quarterly, 37*(2), 337–355.

Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Jerusalem, M., & Schwarzer, R. (1992). Self-efficacy as a resource factor in stress appraisal processes. In R. Schwarzer (Hrsg.), *Self-efficacy: Thought control of action* (S. 195–213). Hemisphere.

Jerusalem, M., & Schwarzer, R. (1999). *Allgemeine Selbstwirksamkeitserwartung*. In R. Schwarzer & M. Jerusalem (Hrsg.), *Skalen zur Erfassung von Lehrer- und Schülermerkmalen* (S. 13–14). Freie Universität Berlin.

Larson, R., & Csikszentmihalyi, M. (1983). The experience sampling method. *New Directions for Methodology of Social and Behavioral Science, 15*, 41–56.

Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation: A 35-year odyssey. *American Psychologist, 57*(9), 705–717.

Multon, K. D., Brown, S. D., & Lent, R. W. (1991). Relation of self-efficacy beliefs to academic outcomes: A meta-analytic investigation. *Journal of Counseling Psychology, 38*(1), 30–38.

Pintrich, P. R., & De Groot, E. V. (1990). Motivational and self-regulated learning components of classroom academic performance. *Journal of Educational Psychology, 82*(1), 33–40.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)* (ERIC Document ED338122). University of Michigan.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement, 53*(3), 801–813. https://doi.org/10.1177/0013164493053003024

Ryan, R. M., Legate, N., Weinstein, N., & Hemric, M. (2023). Self-determination theory as a macro-level theory of motivation and well-being: Review and meta-analysis across 486 samples. *Psychological Bulletin, 149*(9–10), 513–545.

Scherer, M., Maddux, J. E., Mercandante, B., Prentice-Dunn, S., Jacobs, B., & Rogers, R. W. (1982). The Self-Efficacy Scale: Construction and validation. *Psychological Reports, 51*(2), 663–671.

Schimpf, C., Voigt, S., & Bohné, T. (2026). AI-assisted goal setting improves goal achievement: A randomized controlled trial. *arXiv preprint arXiv:2603.17887*.

Schwarzer, R. (1992). Self-efficacy in the adoption and maintenance of health behaviors: Theoretical approaches and a new model. In R. Schwarzer (Hrsg.), *Self-efficacy: Thought control of action* (S. 217–243). Hemisphere.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4*, 1–32. https://doi.org/10.1146/annurev.clinpsy.3.022806.091415

Stanton, J. M., Sinar, E. F., Balzer, W. K., & Smith, P. C. (2002). Issues and strategies for reducing the length of self-report scales. *Personnel Psychology, 55*(1), 167–194.

Stöber, J. (1999). Die Soziale-Erwünschtheits-Skala-17 (SES-17): Entwicklung und erste Befunde zu Reliabilität und Validität. *Diagnostica, 45*(4), 173–177.

*[Weitere Quellen werden nach Durchführung der Studie ergänzt.]*
