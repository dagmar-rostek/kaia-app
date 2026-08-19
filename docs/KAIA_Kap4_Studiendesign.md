# Kapitel 4 — Abschnitte 4.2.3–4.4 — Studiendesign, Datenerhebung und Auswertungsverfahren

> **Stand:** 13. Juli 2026 · **Version:** 0.9-DRAFT
> **Reviewer:** Psychologe · Compliance · Data Scientist · Discovery Researcher
> **Status:** Vollständige Überarbeitung — Messmodell finalisiert (MSLQ 34 Items + GSE 10 Items + EMA 4 Typen); FKS aus Messmodell entfernt; Studienstart korrigiert (8. August 2026); Timeline-Sektion erstellt; Limitationen eigenständig ausgegliedert. Studie hat noch NICHT begonnen (Stand: 13. Juli 2026).

---

## Überblick

Dieser Abschnitt beschreibt Design, Durchführung und — soweit zum aktuellen Zeitpunkt möglich — die geplanten Auswertungsschritte der explorativen Pilotstudie mit KAIA. Die methodische Grundlage entspricht dem Studienprotokoll (v2.0, docs/STUDIENPROTOKOLL.md). Die Datenerhebung beginnt am 8. August 2026 und endet am 1. September 2026.

---

## 4.2.3.1 Forschungsdesign

### 4.2.3.1.1 Studientyp und methodologischer Rahmen

Design: Einfaktorielle Prä-Post-Untersuchung ohne Kontrollgruppe, eingebettet in einen explorativen Mixed-Methods-Ansatz (qualitativ-quantitativ).

Die Studie ist im Design Science Research-Paradigma (Hevner et al., 2004) verankert: KAIA ist das zu evaluierende Artefakt. Die empirische Pilotierung dient als Evaluation-Schritt des DSR-Zyklus — sie prüft nicht primär theoretische Hypothesen, sondern liefert explorative Erkenntnisse über Nutzbarkeit, subjektive Wirksamkeitserfahrung und technische Robustheit des Systems. Die Unterscheidung zwischen Artefakt-Evaluation und hypothesenprüfender Forschung ist für die Interpretation der Ergebnisse konstitutiv (Gregor & Hevner, 2013).

### 4.2.3.1.2 Begründung des Designs ohne Kontrollgruppe

Die fehlende Kontrollgruppe ist systematisch begründet: Bei N ≈ 20 Teilnehmenden würde eine Aufteilung in Experimental- und Kontrollgruppe (N ≈ 10 pro Bedingung) zu statistisch nicht interpretierbaren Gruppenvergleichen führen. Die Power wäre selbst für mittlere Effekte (d = 0.5) unter 30 %. Das Design verzichtet daher bewusst auf konfirmatorische Gruppenvergleiche und setzt auf explorative Verlaufs- und Prozessanalyse. Konfirmatorische Schlüsse sind explizit nicht intendiert; die Studie dient der Hypothesengenerierung für eine Folgestudie mit adäquater Power.

---

## 4.2.3.2 Stichprobe

### 4.2.3.2.1 Rekrutierung und Einschlusskriterien

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

### 4.2.3.2.2 Stichprobengröße und Power-Analyse

| Parameter | Wert |
|---|---|
| Ziel-N (auswertbar) | ≈ 20 |
| Rekrutierungsziel | ≈ 25–28 (25 % Dropout-Puffer) |
| Untergrenze Auswertung | 15 (darunter: deskriptive Fallbeschreibungen statt Inferenzstatistik) |
| Power bei N = 20, d = 0.5, α = .05, einseitig (H1) | ≈ 69 % |
| Power bei N = 20, d = 0.4, α = .05 | ≈ 37 % |
| Primäre Analysemethode (H1) | Wilcoxon-Vorzeichenrangtest |

Power-Analyse durchgeführt mit R (Paket `pwr` v1.3, Skript: `docs/power_analyse.R`). Details: Studienprotokoll v2.0, Kapitel 3.

**Bewertung — bewusste Unterpower:**
Bei d = 0.5 und N = 20 beträgt die Power ca. 69 %; bei d = 0.4 sinkt sie auf ca. 37 %. Das bedeutet: Auch bei realem Effekt ist ein statistisch nicht-signifikantes Ergebnis wahrscheinlich. Das ist kein methodischer Fehler, sondern eine strukturelle Realität dieser Pilotstudie — ihr Erkenntnisbeitrag liegt in der qualitativen Exploration und Systemvalidierung, nicht in der Hypothesenbestätigung.

### 4.2.3.2.3 Positionality Statement und Bias-Kontrolle

Die Forscherin ist gleichzeitig Entwicklerin von KAIA und potenzielle Kommerzialisiererin des Systems. Dieser dreifache Interessenkonflikt (Forscherin — Entwicklerin — Kommerzinteressentin) wird offen deklariert und ist ein methodisch bedeutsames Merkmal dieser Studie, das ihre gesamte epistemische Reichweite begrenzt.

**Maßnahmen zur Bias-Minimierung:**
1. Standardisiertes Outcome-Maß (GSE-Skala) mit etablierten, unabhängig validierten Gütekriterien
2. Anonymisierte Dateneingabe im System — kein direkter Kontakt zwischen Forscherin und Teilnehmenden während der Fragebogenerhebung
3. Expliziter Hinweis in der Einwilligungserklärung auf die Erwünschtheit ehrlicher, auch negativer Rückmeldungen
4. Zurückhaltende und explizit selbstkritische Ergebnisinterpretation gemäß APA 7 Reporting Standards

**Social-Desirability-Bias:** Teilnehmende aus dem Bekanntenkreis könnten Selbstberichte unbewusst an wahrgenommenen Erwartungen der Forscherin ausrichten. Die Maßnahmen in Punkt 3 und 4 reduzieren diesen Bias, eliminieren ihn nicht. Auf eine Skala zur sozialen Erwünschtheit wird verzichtet (Fragebogenökonomie); vgl. Abschnitt 4.2.3.10.

---

## 4.2.3.3 Messinstrumente

### 4.2.3.3.1 Motivierte Lernstrategien — MSLQ (Kurzversion, Prämessung)

**Instrument:** Motivated Strategies for Learning Questionnaire, KAIA-Kurzversion (Pintrich et al., 1991, 1993)
**Fassung:** 34-Item-Adaptation mit 5 Subskalen, dokumentiert in docs/STUDIENPROTOKOLL.md
**Skalierung:** 7-stufige Likert-Skala (1 = gar nicht zutreffend, 7 = sehr zutreffend)
**Erhebungszeitpunkt:** Einmalig als Prämessung vor der ersten Session; kein Post-MSLQ

**Subskalen:**

| Subskala | Konstrukt | Items (Adaptation) | α (Original) |
|---|---|---|---|
| Intrinsische Zielorientierung | Motivation durch Interesse, Verstehen und Kompetenzentwicklung | 4 | .74 (Pintrich et al., 1993) |
| Selbstwirksamkeit für Lernen und Leistung | Überzeugung, Lernaufgaben erfolgreich bewältigen zu können | 8 | .93 (Pintrich et al., 1993) |
| Lernstrategien (Elaboration) | Aktive Verknüpfung neuen Wissens mit vorhandenen Wissensstrukturen | 10 | .76 (Pintrich et al., 1993) |
| Kognitive Verarbeitungstiefe | Tiefenorientierte Informationsverarbeitung, kritisches Denken | 8 | .80 (Pintrich et al., 1993) |
| **Kontrollüberzeugungen für Lernen** | Glaube, dass Anstrengung und Lernstrategien den Lernerfolg bestimmen (internale Attribution) | 4 | .68 (Pintrich et al., 1993) |

**Gütekriterien:** Cronbachs α .62–.93 je Subskala; Skalenstruktur durch konfirmatorische Faktorenanalyse bestätigt; prädiktive Validität belegt (Pintrich et al., 1993; Pintrich & De Groot, 1990). Keine deutschsprachige Normstichprobe. Frei verfügbar für Forschungszwecke; Quellenangabe Pflicht. *[→ Anhang B: MSLQ-Items]*

**Kritische psychometrische Einschränkungen der KAIA-Adaptation:**
Die 34-Item-Version ist eine Selektion des 81-Item-Originals ohne eigenständige Validierungsstudie. Gütekriterien des Originalinstruments sind nicht automatisch übertragbar (Stanton et al., 2002); bei Kürzungen können Faktorstruktur und Reliabilität abweichen. Subskalen-Cronbachs-Alphas werden post-hoc aus den Pilotdaten berechnet; bei α < .70 ist die Aussagekraft des jeweiligen Subskalen-Scores stark eingeschränkt.

**Funktionen in dieser Studie:**
- Deskriptive Stichprobencharakterisierung: Lernmotivationsprofil der Teilnehmenden zu Studieneintritt
- Confounder-Kontrolle: MSLQ-Profil als potentieller Moderator des GSE-Prä-Post-Effekts
- Konstruktkonvergenz-Prüfung: MSLQ-Selbstwirksamkeits-Subskala × GSE-Prä (H3)

**Was MSLQ-Werte nicht leisten:** Auf Basis von MSLQ-Scores lassen sich keine Vorhersagen über individuelle Lernerfolge, Kompetenzniveaus oder Potenziale ableiten, die über die durch Validierungsstudien belegte Korrelationsstruktur hinausgehen.

### 4.2.3.3.2 Allgemeine Selbstwirksamkeitserwartung — GSE (Prä- und Postmessung)

**Instrument:** General Self-Efficacy Scale, deutschsprachige Originalversion (Schwarzer & Jerusalem, 1995)
**Items:** 10 (Beispielitem: "Wenn ich mit einem Problem konfrontiert werde, habe ich meist mehrere Ideen, wie ich damit fertig werde.")
**Skalierung:** 4-stufige Likert-Skala (1 = stimmt nicht, 4 = stimmt genau)
**Erhebungszeitpunkte:** Prämessung (vor erster Session, ab 8. August 2026) und Postmessung (1.–4. September 2026)

**Gütekriterien:** Cronbachs α = .80–.90 (Schwarzer & Jerusalem, 1995); Test-Retest-Reliabilität r = .55–.75 (Schwarzer, 1992); konvergente und diskriminante Validität nachgewiesen. Deutschsprachige Normstichprobe verfügbar (Jerusalem & Schwarzer, 1999). Frei verfügbar für Forschungszwecke; ITC-konform für digital selbst-administrierte Erhebung. *[→ Anhang A: GSE-Items]*

**Methodische Diskussion — Trait-Stabilität als Sensitivitätsproblem:**
Die GSE erfasst stabile Überzeugungen über die eigene Handlungsfähigkeit, keine situativen Zustände (Bandura, 1997). Eine 4-wöchige Intervention erzeugt möglicherweise nicht hinreichend starke Mastery Experiences, um diese Überzeugungen zu verschieben — obwohl Trait-Selbstwirksamkeit grundsätzlich auf intensive Mastery-Erfahrungen reagiert (Jerusalem & Schwarzer, 1992; Bandura, 1997). Die allgemeine GSE wurde gegenüber domänenspezifischen Skalen bevorzugt, weil KAIA als bereichsübergreifender Lernbegleiter konzipiert ist. Das Sensitivitätsproblem wird als bekannte Limitation ausgewiesen (Abschnitt 4.2.3.10).

**Wichtige Abgrenzung:** Die GSE misst Selbstwirksamkeitserwartungen — keine Kompetenz, keine Leistung, kein Lernpotenzial. Aus GSE-Werten lassen sich keine Leistungsprognosen ableiten, die über den durch Meta-Analysen belegten Zusammenhang hinausgehen (r ≈ .38; Multon et al., 1991).

### 4.2.3.3.3 In-Session-Feedback (Sessionfeedbackmarker)

Innerhalb jeder Session stehen Teilnehmenden vier diskrete Feedback-Marker zur Verfügung. Diese sind keine EMA im methodologischen Sinne (Stone & Shiffman, 1994) — die Voraussetzungen zeitrandomisierter Messung im Feld sind nicht erfüllt. Es handelt sich um verhaltensnahe In-situ-Prozessindikatoren.

| Marker | Kürzel | Konstruktnähe |
|---|---|---|
| Transfer-Marker | `transfer_marker` | Subjektiv bedeutsamer Transfermoment; Indikator für tiefe Verarbeitung (Craik & Lockhart, 1972) |
| Aha-Erlebnis | `wow` | Subjektives Verständnisdurchbruchserlebnis; Indikator für elaborative Verknüpfung (Craik & Lockhart, 1972) |
| Stecken-Geblieben | `stuck` | Metakognitiver Distress, kognitives Overloading; Indikator für mögliches Kalibrierungsversagen |
| Verständnislücke | `unclear` | Inhaltliche Unklarheit; Indikator für Verstehenshemmung (Dunlosky & Metcalfe, 2009) |

**Speicherung:** Zeitstempel, Session-ID, Marker-Typ, pseudonymisierte User-ID → Tabelle `session_feedback`

**Wissenschaftliche Grundlage:** Metacognitive Monitoring als Lernprozessvariable (Flavell, 1979; Dunlosky & Metcalfe, 2009); In-situ-Signale als Ergänzung zu Post-hoc-Selbstberichten (Larson & Csikszentmihalyi, 1983).

**Kritische methodische Einschränkung:** Die vier Marker sind keine validierten psychometrischen Skalen; ihre Konstruktbezüge sind theoretisch begründet, nicht empirisch belegt. Auswertungen sind rein explorativ-deskriptiv; inferenzstatistische Schlüsse sind nicht zulässig.

### 4.2.3.3.4 Qualitative Daten

**Sessiontranskripte:** Vollständige Chat-Verläufe jeder KAIA-Session, pseudonymisiert gespeichert. Basis für die qualitative Thematische Analyse (Braun & Clarke, 2006) ausgewählter Verläufe.

**Session-Summaries:** Von KAIA nach jeder Session automatisch generierte Zusammenfassungen; ergänzend zu Transkripten für die qualitative Analyse, generativer Ursprung bei der Interpretation berücksichtigt.

**Triangulation:** Qualitative Befunde aus Transkripten und Summaries werden mit quantitativen EMA- und GSE-Daten trianguliert. Im optionalen Erfahrungsbericht am Studienende wird der KDG-Effekt qualitativ operationalisiert: "Gab es Bereiche, in denen du durch KAIA etwas in deinen Alltag übertragen hast, das vorher wissenstheoretisch klar, aber praktisch nicht umgesetzt war?"

### 4.2.3.3.5 Nutzungsstatistiken (Kovariaten)

Sofern `consent_analytics = true`: Anzahl abgeschlossener Sessions, Gesamtnutzungsdauer, Zeitpunkte der Nutzung. Werden als deskriptive Kovariaten in explorative Analysen einbezogen und ermöglichen die Beschreibung der Nutzungsintensität.

---

## 4.2.3.4 Ethische Anforderungen und Datenschutz

### 4.2.3.4.1 Informierte Einwilligung (Multi-Step-Consent)

Die Einwilligung erfolgt in zwei getrennten, unabhängigen Schritten:

1. **Checkbox 1 — Datenverarbeitung:** Einwilligung in die DSGVO-konforme Verarbeitung personenbezogener Daten (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO)
2. **Checkbox 2 — Studienteilnahme:** Einwilligung in die Nutzung der Daten für Studienzwecke (Analytics, Auswertung, Thesis, Publikation)

Beide Checkboxen sind inhaltlich und technisch voneinander unabhängig. Eine Verweigerung von Checkbox 2 schließt die KAIA-Nutzung nicht aus, führt jedoch zum Ausschluss aus der Studienauswertung. Die Einwilligung ist jederzeit widerrufbar (DSGVO Art. 7 Abs. 3).

### 4.2.3.4.2 KI-Disclosure

Vor dem Onboarding erhalten alle Teilnehmenden einen expliziten, persistent sichtbaren Hinweis, dass KAIA ein KI-System ist — kein Mensch, keine psychologische Fachkraft (computational empathy im Sinne von Picard, 1997; Decety & Jackson, 2004). Dieser Hinweis muss aktiv bestätigt werden und ist nicht überspringbar.

### 4.2.3.4.3 Crisis-Detection

Ein automatisierter Pre-Filter analysiert jeden User-Input auf Krisensignale (psychologische Notlage, Suizidalität). Bei Detektion wird eine statische, nicht-interaktive Eskalations-Notice angezeigt:

> **Telefonseelsorge: 0800 111 0 111 (kostenlos, 24 Stunden, 7 Tage)**

Die KAIA-Session wird nicht fortgeführt. Diese Maßnahme ist nicht optional — sie entspricht den berufsethischen Mindeststandards der DGPs/BDP für digitale psychologische Angebote und ist gemäß den wissenschaftlichen Pflichten der Thesis nicht verhandelbar.

### 4.2.3.4.4 DSGVO-Konformität

- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- **Betroffenenrechte:** DSGVO Art. 15–21 vollständig implementiert (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch)
- **Serverstandort:** Hetzner CX23, Helsinki (EU) — kein US-Datentransfer für Nutzerdaten
- **LLM-Training:** Nutzerdaten werden nicht für LLM-Training verwendet (Data Processing Agreements; s. 6.4.5)
- **Löschfrist:** Pseudonymisierte Studiendaten werden 6 Monate nach Studienabschluss gelöscht. Löschprotokoll wird geführt.
- **Schrems-II:** Risikoabschätzung für Drittlanddatenübermittlung (LLM-API-Calls) in der Datenschutzerklärung dokumentiert

### 4.2.3.4.5 Data Processing Agreements (DPAs)

DPAs mit Anthropic und OpenAI sind abgeschlossen (Stand: Juli 2026). Mistral AI ist aus dem Studienscope ausgeschlossen (vgl. Abschnitt 4.2.1.2.5), daher ist kein Mistral-DPA erforderlich.
- Anthropic (Claude Sonnet 4.6, Eval-Pipeline)
- OpenAI (GPT-4.1-mini, Pilotstudie)

Kein Studienbeginn ohne unterzeichnete DPAs — dies ist eine nicht verhandelbare Voraussetzung.

### 4.2.3.4.6 Conflict of Interest — Deklaration

Die Forscherin ist gleichzeitig Entwicklerin von KAIA und potenzielle Kommerzialisiererin. Dieser Konflikt ist in der Thesis offen deklariert (Positionality Statement, s. 6.2.3), im Studienprotokoll dokumentiert und in der Einwilligungserklärung für Teilnehmende kommuniziert. Die Deklaration folgt den Anforderungen der DGPs-Richtlinien für gute wissenschaftliche Praxis.

---

## 4.2.3.5 Timeline

| Datum | Meilenstein | Status (13.07.2026) |
|---|---|---|
| Laufend | DPAs abgeschlossen (Anthropic, OpenAI) | Abgeschlossen ✓ |
| **28. Juli 2026** | **Study-Lock: Prompt-Freeze** — keine Prompt- oder Schema-Änderungen ab diesem Datum | Geplant |
| **8. August 2026** | **Studienstart** — Registrierung, KI-Disclosure, Multi-Step-Consent, Prä-Befragung (MSLQ + GSE) + erste Sessions möglich | Geplant |
| 8. August – 1. September 2026 | Aktive Studienphase (3 Wochen, max. 1 Session pro Tag) | Geplant |
| **1. September 2026** | **Studienende** — letzte Session, Studienphase abgeschlossen | Geplant |
| 1.–4. September 2026 | Post-Befragung (GSE Post, 10 Items) + Abschlussinterviews (~15–20 Min, persönlich) | Geplant |
| September – Oktober 2026 | Datenauswertung, qualitative Analyse, Ergebniskapitel | Geplant |
| **3. Oktober 2026** | **Abgabe Masterthesis** (SRH Fernhochschule Riedlingen) | Deadline |

**Stand August 2026:** Study-Lock aktiv seit 28. Juli 2026. Studienstart erfolgte planmäßig am 8. August 2026. Aktive Studienphase läuft.

---

## 4.2.3.6 Ablauf und Sessionstruktur

### 4.2.3.6.1 Phasenübersicht

Meilensteine und Termine: vgl. Timeline 4.2.3.5. Zum Studienstart (8. August 2026) durchlaufen Teilnehmende Registrierung, KI-Disclosure und Multi-Step-Consent, gefolgt von MSLQ-Prämessung (34 Items, ≈ 12 Min.) und GSE-Prämessung (10 Items, ≈ 5 Min.).

### 4.2.3.6.2 Sessionstruktur

**Sessions 1–2: Foundation-Sessions (ca. 20–30 Minuten).** Motiv-Dialog (Lernziel hinter dem Lernziel), Learning Intention, Implementation Intention (Gollwitzer, 1999), Evidenzanker ("Woran würdest du merken, dass du es wirklich verstanden hast?") und Standortbestimmung. KAIA fragt explizit, in welchen Situationen die Person weiß, was zu tun wäre, es aber nicht tut — dieser KDG-Spiegel bildet die Grundlage für alle Folgesessions.

**Sessions 3–10: Micro-Sessions (ca. 10–15 Minuten).** Cross-Session-Memory übernimmt den Kontextaufbau; EMA-Marker sind kontinuierlich verfügbar.

**Auswertbarkeitsgrenze:** Mindestens 3 abgeschlossene Sessions (sonst Dropout, Intent-to-Treat-Reporting); für EMA-Verlaufsanalyse mindestens 5 Sessions; Zielwert 10 Sessions für interpretierbare Zeitreihe. Gesamtaufwand für Teilnehmende: ≈ 168 Minuten über 3 Wochen. Lernthemen werden von Teilnehmenden selbst gewählt (ökologische Validität; Themen-Heterogenität als Confounder dokumentiert).

### 4.2.3.6.3 LLM-Modellwahl für die Pilotstudie

Die Pilotstudie wird als Single-Arm-Design mit **GPT-4.1-mini** (OpenAI) durchgeführt; die Modellwahl ist in 4.2.1.2.6 begründet (Latenzkriterium). LLM-spezifische Unterschiede können bei N ≈ 20 nicht von KAIA-Design-Effekten getrennt werden; der Modellvergleich (FF3) wird als separater Evidenzstrang über die Eval-Pipeline adressiert (Abschnitt 4.2.1).

---

## 4.2.3.7 Hypothesen

**H1 (primär, gerichtet):** Die GSE nach drei Wochen KAIA-Nutzung ist signifikant höher als vor der Nutzung (Wilcoxon-Vorzeichenrangtest, einseitig, α = .05, Power ≈ 69 %).

*Angesichts der Unterpower wird die Signifikanzentscheidung durch Effektgröße (r = z / √N) und deskriptive Statistik ergänzt und nicht isoliert interpretiert.*

**H2 (explorativ, ungerichtet):** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit (Anzahl abgeschlossener Sessions) und GSE-Veränderung (Spearman-Rho).

**H3 (explorativ, konstruktiv):** Die MSLQ-Selbstwirksamkeits-Subskala korreliert positiv mit der GSE-Prämessung (Konstruktkonvergenz; Spearman-Rho). Dient ausschließlich der Plausibilitätsprüfung der MSLQ-Kurzversion (Bandura, 1997).

**H4 (explorativ, prozessbezogen):** Die relative Häufigkeit von `transfer_marker`- und `wow`-EMA-Signalen (positive Indikatoren) nimmt über die Studienlaufzeit im Verhältnis zu `stuck`- und `unclear`-Signalen (Distress-Indikatoren) zu. Diese Hypothese wird ausschließlich deskriptiv ausgewertet.

**H5 (explorativ, KDG-spezifisch):** Die subjektiv wahrgenommene Alltagsanwendungshäufigkeit steigt über die Studienlaufzeit (Selbstbericht Studienende vs. Session 1). Ausschließlich deskriptiv; operationalisiert den Knowing-Doing Gap.

---

## 4.2.3.8 Statistische Analysemethoden

- **Deskriptive Statistik:** M, SD, Median, IQR, Häufigkeitsverteilungen für alle Messzeitpunkte
- **Wilcoxon-Vorzeichenrangtest (H1):** Nonparametrisch wegen N < 30; Effektgröße r = z / √N; einseitig, α = .05
- **Spearman-Rho-Korrelation (H2, H3):** Nutzungshäufigkeit × GSE-Differenz; MSLQ-Selbstwirksamkeit × GSE-Prä; mit 95 %-Konfidenzintervall (Bootstrap)
- **MSLQ-Subskalen-Analyse:** Itemstatistiken, Cronbachs α post-hoc je Subskala, Interkorrelationsmatrix der Subskalen
- **EMA-Verlaufsanalyse (H4):** Absolute und relative Häufigkeiten der vier Marker-Typen pro Session und über den Studienverlauf (deskriptiv; keine Inferenzstatistik)
- **Deskriptive KDG-Analyse (H5):** Selbstberichtete Alltagsanwendungshäufigkeit am Studienende im Vergleich zu Session 1 — rein deskriptiv, keine Inferenzstatistik
- **Qualitative Thematische Analyse:** Ausgewählte Transkripte und Session-Summaries (Braun & Clarke, 2006); induktive Kodierung; Triangulation mit quantitativen Befunden
- **Intent-to-Treat-Reporting:** Dropout-Analyse; Sensitivitätsanalyse mit und ohne Ausreißer

**Analysesoftware:** R 4.5.x (Pakete: `coin`, `rstatix`, `ggplot2`, `psych`, `corrplot`, `boot`)

**Transparenz:** Alle Analyseskripte werden auf GitHub veröffentlicht. Ergebnisse werden unabhängig ihrer Richtung und Signifikanz vollständig und ungekürzt berichtet.

---

## 4.2.3.9 Erwartete Ergebnisse

Angesichts des explorativen Charakters und der bekannten Unterpower sind konfirmatorische Befunde nicht intendiert. Plausible Muster: eine GSE-Verbesserungstendenz ohne zwingend signifikantes Ergebnis (Power ≈ 69 %, einseitig; H1); moderate positive MSLQ-GSE-Konvergenz (r = .30–.50; H3); hohe Variabilität in Nutzungshäufigkeit × ΔGSE (H2). Qualitativ sind Nutzungsmuster, Systemstärken und -schwächen sowie strukturelle Nutzungsbarrieren zu erwarten.

**Zentraler Erkenntnisbeitrag:** Der Wert dieser Pilotstudie liegt in der Systemvalidierung, der Beschreibung realweltlicher Nutzungsmuster und der Generierung präziser Hypothesen für eine Folgestudie mit adäquater Power, echter Kontrollgruppe und repräsentativerer Stichprobe — nicht in statistischen Signifikanzentscheidungen.

---

## 4.2.3.10 Limitationen

Die Limitationen dieser Studie sind substanziell. Sie werden vollständig und ohne Relativierung kommuniziert — nicht als Formsache, sondern weil die Interpretation der Ergebnisse ohne Kenntnis dieser Einschränkungen irreführend wäre.

**1. Statistische Unterpower**
N ≈ 20 ist für konfirmatorische Hypothesenprüfung unzureichend. Power für H1 bei d = 0.5 liegt bei ca. 69 % (einseitig), bei d = 0.4 bei ca. 37 %. Statistisch nicht-signifikante Ergebnisse schließen reale Effekte nicht aus; signifikante Befunde sind bei dieser Stichprobengröße mit Vorsicht zu interpretieren (erhöhte Falsch-Positiv-Rate bei Multiple Testing).

**2. Convenience Sample — eingeschränkte externe Validität**
Die Stichprobe entstammt dem persönlichen Netzwerk der Forscherin und weicht in Bildungsniveau, Technikaffinität und Lernmotivation systematisch von einer Zufallsstichprobe ab. Generalisierbarkeit ist nicht gegeben.

**3. Social-Desirability-Bias**
Bekannte der Forscherin bewerten strukturell positiver. Anonymisierte Dateneingabe reduziert diesen Bias, eliminiert ihn nicht.

**4. Dreifacher Interessenkonflikt**
Die Forscherin ist gleichzeitig Entwicklerin und potenzielle Kommerzialisiererin. Eine vollständige Neutralisierung ist nicht möglich; alle Schlussfolgerungen sind vor diesem Hintergrund zu rezipieren.

**5. Fehlende Kontrollgruppe**
Ohne Kontrollgruppe können GSE-Veränderungen nicht kausal auf KAIA zurückgeführt werden. Reifung, Regression zur Mitte, Hawthorne-Effekt und parallele Lernerfahrungen sind nicht kontrolliert.

**6. Trait-Stabilität der GSE — Sensitivitätsproblem**
Als Trait-Instrument reagiert die GSE möglicherweise nicht sensitiv auf eine 4-wöchige Intervention. Ausbleibende Veränderung kann Systemversagen oder Instrumentensensitivität widerspiegeln — auf Basis dieser Studie nicht unterscheidbar.

**7. MSLQ-Adaptation ohne eigenständige Validierung**
Die 34-Item-Kurzversion liegt ohne Validierungsstudie vor; Gütekriterien des Originals gelten nicht automatisch. Bei α < .70 in einzelnen Subskalen sind die Scores nicht interpretierbar.

**8. Sessionfeedbackmarker ohne psychometrische Validierung**
Keine validierten Skalen; Konstruktbezüge theoretisch, nicht empirisch belegt; Auswertungen rein deskriptiv.

**9. LLM-Effekt nicht isolierbar**
Der Effekt des zugrundeliegenden Sprachmodells ist bei N ≈ 20 nicht von KAIA-Design-Effekten oder individuellen Unterschieden zu trennen. LLM-bezogene Aussagen in dieser Studie haben rein hypothesengenerierenden Charakter.

**10. Nur deutschsprachige Teilnehmende**
Alle Instrumente und KAIA selbst sind auf Deutsch. Generalisierbarkeit auf andere Sprachgruppen ist nicht gegeben.

**11. Keine Langzeit-Follow-up-Messung**
Mangels zeitlicher Ressourcen (Thesis-Deadline 3. Oktober 2026) ist kein Follow-up nach Studienabschluss vorgesehen. Nachhaltigkeitseffekte und Transferverläufe sind nicht messbar.

---

## 4.2.3.11 Ergebnisse

*[Wird nach Abschluss der Post-Befragung (September 2026) befüllt.]*

**Geplante Unterabschnitte:** 4.2.3.11.1 Stichprobenbeschreibung (N, Altersverteilung, Lernthemen, Dropout-Rate) · 4.2.3.11.2 Deskriptive Statistik (GSE Prä/Post, MSLQ-Subskalen, In-Session-Marker-Häufigkeiten) · 4.2.3.11.3 Hypothesenprüfung (H1–H5) · 4.2.3.11.4 Qualitative Befunde (Thematische Analyse ausgewählter Transkripte)

---

## 4.2.3.12 Diskussion

*[Wird nach Fertigstellung von Abschnitt 4.2.3.11 verfasst. Geplante Inhalte: Ergebnisinterpretation vor DSR-Hintergrund (H1–H5), Limitationen- und Positionality-Reflexion, Implikationen für Praxis und Forschung, Gesamtfazit.]*

---

*Literaturangaben dieses Kapitels sind im konsolidierten Literaturverzeichnis am Ende der Thesis aufgeführt.*
