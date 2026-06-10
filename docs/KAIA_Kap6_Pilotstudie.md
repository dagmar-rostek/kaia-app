# Kapitel 6 — Pilotstudie und Evaluation

> **Stand:** 10. Juni 2026 · **Version:** 0.4-DRAFT  
> **Reviewer:** Psychologe · Compliance · Discovery Researcher  
> **Geplanter Umfang:** ca. 20–25 Seiten (~5.000–6.250 Wörter)  
> **Status:** Methodik vollständig (= Studienprotokoll v1.0); Ergebnisse folgen nach Studie (Aug/Sep 2026)

---

## Überblick

Kapitel 6 beschreibt Design, Durchführung und Ergebnisse der explorativen Pilotstudie mit KAIA. Die methodische Grundlage entspricht dem Studienprotokoll (v1.0, docs/STUDIENPROTOKOLL.md), das vor Studienbeginn auf OSF.io vorregistriert wird.

---

## 6.1 Forschungsdesign

### 6.1.1 Studientyp und Begründung

Design: Einfaktorielle Prä-Post-Untersuchung ohne Kontrollgruppe (explorative Pilotstudie).

Die fehlende Kontrollgruppe ist begründet: Bei einer N=32-Pilotstudie wäre eine Kontrollgruppe (N=16 pro Bedingung) statistisch zu schwach für reliable Gruppenvergleiche. Der explorative Charakter erlaubt es, Tendenzen zu identifizieren und Hypothesen für eine Folgestudie mit adäquater Power zu präzisieren. Konfirmatorische Schlüsse sind explizit nicht intendiert.

### 6.1.2 Methodologischer Rahmen

Die Studie ist im Design Science Research-Paradigma (Hevner et al., 2004) verankert: KAIA ist das zu evaluierende Artefakt. Die empirische Studie dient als Evaluation-Schritt des DSR-Zyklus und liefert gleichzeitig explorative Erkenntnisse über die Wirkungsmechanismen.

---

## 6.2 Stichprobe

### 6.2.1 Rekrutierung und Einschlusskriterien

**Rekrutierung:** Persönliches Netzwerk der Forscherin (Einschränkung: Positionality Statement, s. 6.2.3)

**Einschlusskriterien:**
- Volljährig (≥ 18 Jahre)
- Deutschsprachig (Muttersprache oder vergleichbare Kompetenz)
- Aktive Lernsituation (Studium, Weiterbildung, berufliches Lernen)
- Zugang zu Computer/Tablet mit Internetverbindung
- Schriftliche informierte Einwilligung

**Ausschlusskriterien:**
- Aktuelle oder anamnestische psychiatrische Diagnose (Selbstauskunft)
- Aktuelle Krisenintervention/-therapie
- Unzureichende Schreib-/Lesefähigkeit auf Deutsch

### 6.2.2 Stichprobengröße und Power-Analyse

| Parameter | Wert |
|---|---|
| Ziel-N (auswertbar) | 32 |
| Rekrutierungsziel | ~46 (30% Dropout-Puffer) |
| Power bei N=32, d=0.5, α=0.05 | 80% |
| Power bei N=20 (Fallback) | 56.5% |
| Analysemethode | Wilcoxon-Vorzeichenrangtest |

Power-Analyse durchgeführt mit R (Paket `pwr` v1.3, Skript: `docs/power_analyse.R`). Details: Kapitel 3 des Studienprotokolls.

**Aktualisierung (Stand: 10. Juni 2026) — konservative Effektschätzung:**  
Mit der Anhebung der Mindest-Sessions-Anforderung auf 10 und der daraus resultierenden Gesamtinterventionsdauer von ca. 150 Minuten Chatzeit über 4 Wochen erscheint eine konservativere Effektschätzung von d = 0.4 (statt d = 0.5) angemessener. Bei d = 0.4 ergibt sich ein Mindest-N von 51 für 80% Power (ARE-korrigiert). Dies verschärft die bekannte Unterpower-Problematik bei N ≈ 20 (Power dann ca. 37%). Die Studie bleibt explorativer Natur; konfirmatorische Schlüsse sind explizit nicht beabsichtigt. Diese Einschränkung wird in Kapitel 6.8 und im Positionality Statement vollständig kommuniziert.

### 6.2.3 Positionality Statement und Bias-Kontrolle

Die Forscherin ist gleichzeitig Entwicklerin von KAIA und potenzielle Kommerzialisiererin. Dieser Interessenkonflikt wird offen deklariert. Maßnahmen zur Bias-Minimierung: (1) Vorregistrierung der Hypothesen auf OSF.io vor Datensicht, (2) standardisiertes Outcome-Maß (GSE-Skala) mit etablierten Gütekriterien, (3) zurückhaltende und selbstkritische Interpretation der Ergebnisse.

**Social-Desirability-Bias:** Die Rekrutierung aus dem persönlichen Netzwerk der Forscherin birgt das Risiko systematischer Verzerrung durch soziale Erwünschtheit — Teilnehmende könnten Selbstberichte unbewusst an wahrgenommenen Erwartungen der Forscherin ausrichten. Dies ist eine bekannte Limitation von Convenience Samples in Forscher-Bekanntenkreis-Studien. Gegenmaßnahmen: (a) anonymisierte Dateneingabe im System (kein direkter Kontakt bei Fragebogen-Ausfüllung), (b) expliziter Hinweis in der Einwilligungserklärung auf Erwünschtheit ehrlicher Antworten auch bei negativen Erlebnissen, (c) transparente Diskussion dieser Limitation in Kapitel 6.8. Eine zusätzliche Soziale-Erwünschtheits-Skala (z.B. Stöber, 1999, Kurzform) wird erwogen.

---

## 6.3 Messinstrumente

### 6.3.1 Allgemeine Selbstwirksamkeitserwartung (GSE)

**Instrument:** Schwarzer & Jerusalem (1995), deutschsprachige Originalversion  
**Items:** 10 (Beispiel: "Wenn ich mit einem Problem konfrontiert werde, habe ich meist mehrere Ideen, wie ich damit fertig werde.")  
**Skalierung:** 4-stufige Likert-Skala (1 = stimmt nicht, 4 = stimmt genau)  
**Durchführung:** Digital, eingebettet im KAIA-Frontend; Prä-Messung vor erster Session, Post-Messung nach Abschluss der Studienphase  
**Gütekriterien:** Cronbachs α .80–.90 (mehrere Studien); Test-Retest-Reliabilität hinreichend stabil (Schwarzer & Jerusalem, 1995)

**Methodische Diskussion — Trait-Stabilität der GSE:**  
Die GSE nach Schwarzer und Jerusalem (1995) ist konzeptionell als generalisierende Trait-Skala angelegt: Sie erfasst stabile Überzeugungen über die eigene Handlungsfähigkeit, nicht situative Zustandsschwankungen. Dies wirft die Frage auf, ob eine 4-wöchige Intervention wie KAIA hinreichend Veränderungspotenzial erzeugen kann. Empirisch ist festzustellen, dass Trait-Selbstwirksamkeit durchaus auf intensive Lernerfahrungen reagiert: Jerusalem und Schwarzer (1992) dokumentieren signifikante Veränderungen nach akademischen Interventionen; Scherer et al. (1982) zeigen Sensitivität bei Kompetenzerfahrungen. Die Wahl der allgemeinen GSE (statt einer domänenspezifischen Skala) ist methodisch dadurch begründet, dass KAIA als bereichsübergreifender Lernbegleiter konzipiert ist — eine domänenspezifische Skala würde nur den gewählten Lerninhalt erfassen, nicht die allgemeine Lernkompetenzüberzeugung. Ergänzend wird die Hinzunahme einer **domänenspezifischen akademischen Selbstwirksamkeitsskala** (Jerusalem & Schwarzer, 1999, Subscala "Akademische Selbstwirksamkeit") erwogen, um Sensitivitätsprobleme zu reduzieren. Diese Entscheidung wird vor Studienstart im Studienprotokoll (v2.0) und auf OSF.io dokumentiert.

### 6.3.2 Flow-Kurzskala (FKS)

**Instrument:** Flow-Kurzskala nach Rheinberg, Vollmeyer und Engeser (2003)  
**Items:** 10 (Beispiel: "Ich bin ganz vertieft in das, was ich tue.")  
**Skalierung:** 7-stufige Likert-Skala (1 = trifft nicht zu, 7 = trifft zu)  
**Gütekriterien:** Cronbachs α = .90 (Rheinberg et al., 2003); für wiederholte Erhebungen im selben Kontext geeignet (Engeser & Rheinberg, 2008)  
**Verfügbarkeit:** Deutschsprachige Originalversion, frei verfügbar in PsychArchives (ZPID)  
**Lizenz:** Keine kommerziellen Lizenzkosten (public-domain-nah, akademische Nutzung); Quellenangabe Pflicht

**Erhebungszeitpunkte:** Nach Session 2, 5, 8 und 10 (= vier Messzeitpunkte, MZP 1–4). Die Wahl nach Session 2 als erstem Messzeitpunkt vermeidet Bodeneffekte in der Orientierungsphase; der letzte Messpunkt nach Session 10 korrespondiert mit der Post-GSE-Erhebung.

**Zweck:** (1) Verlaufsanalyse des Flow-Erlebens über die Studienlaufzeit, (2) Korrelation mit GSE-Veränderung (H4), (3) Detektion von Boredom- oder Overload-Episoden im Sinne des Aufmerksamkeitsmodells nach Csikszentmihalyi (1990) als Indikator für Kalibrierungsversagen des neuroadaptiven Systems.

**Methodische Begründung:** Die FKS ist gegenüber der vollständigen Flow State Scale (FSS; Jackson & Marsh, 1996; 36 Items) deutlich kürzer und damit für wiederholte In-situ-Erhebungen zumutbar. Die 10-Item-Fassung erfasst die Kernfacetten Absorbiertheit und fließendes Erleben mit hinreichender psychometrischer Güte. Ihre Verortung im Ecological Momentary Assessment-Paradigma (Shiffman, Stone & Hufford, 2008) ist theoretisch konsistent mit dem Experience Sampling-Ansatz der Flow-Forschung (Csikszentmihalyi & Larson, 1987).

**Einschränkung:** Die FKS misst Flow als Zustandskonstrukt unmittelbar nach der Session. Retrospektiver Bias über mehrere Stunden ist nicht auszuschließen, wird durch zeitnah eingeblendete Abfrage (< 5 Minuten nach Session-Ende) minimiert.

### 6.3.3 In-Session Feedback (qualitativ-indikativ)

Innerhalb jeder Session stehen Teilnehmenden zwei diskrete Feedback-Buttons zur Verfügung:

- **"Muss ich weiterdenken"** — Transfer-Marker: signalisiert einen subjektiv als bedeutsam wahrgenommenen Gesprächsmoment
- **"Ich hänge gerade"** — Metakognitiver Distress-Indikator: signalisiert kognitives Overloading oder Verständnishemmung

Diese Eingaben werden in der Tabelle `session_feedback` gespeichert (Zeitstempel, Session-ID, Typ, pseudonymisierte User-ID) und dienen ausschließlich als explorative Zusatzdaten. Sie ersetzen keine standardisierten Messinstrumente. Ihre Auswertung folgt dem Paradigma des Ecological Momentary Assessment (Shiffman et al., 2008) und wird qualitativ-interpretativ in Kapitel 6.7.4 behandelt.

**Wissenschaftliche Grundlage:** Metacognitive Monitoring als Lernprozessvariable (Flavell, 1979; Dunlosky & Metcalfe, 2009) und In-situ-Signale als Ergänzung zu Post-hoc-Selbstberichten (Larson & Csikszentmihalyi, 1983).

### 6.3.4 Nutzungsstatistiken

Sofern consent_analytics=true: Anzahl Sessions, Gesamtnutzungsdauer, aktiver Charakter. Werden als Kovariaten in die Analyse einbezogen (H2-Test).

### 6.3.5 LLM-Transcript-Analyse (explorativ)

Automatisierte Extraktion psychologischer Indikatoren aus Gesprächstranskripten: Handlungskontrolle, Problemlösezuversicht, Bewältigungserwartung. Methodik wird vor Studienstart spezifiziert und auf OSF.io registriert (H3-Test).

---

## 6.4 Ablauf

```
Zeitraum        Aktivität
────────────────────────────────────────────────────────────
Vor Studie      Ethikvotum SRH | Pre-Registration OSF.io | DPAs
Woche 0         Registrierung | Einwilligung | KI-Disclosure | GSE Prä
Woche 1–4       Strukturierte KAIA-Nutzung (Mindest: ≥10 Sessions)
                  Sessions 1–2: Foundation-Sessions (20–30 Min.)
                    – Motivationsanker, Lerntyp-Routing, Standortbestimmung
                  Sessions 3–10: Micro-Sessions (10–15 Min.)
                    – Cross-Session-Memory übernimmt Kontextaufbau
                FKS nach Session 2, 5, 8, 10 (~3 Min. je Erhebung)
Woche 4–5       GSE Post | FKS MZP 4 (falls nicht bereits nach S10) |
                optionaler Erfahrungsbericht
Nach Studie     Auswertung | 6-Monate-Löschfrist startet
```

**Zeitaufwand für Teilnehmende (Schätzung):**  
Sessions 1–2 (2 × 25 Min.) + Sessions 3–10 (8 × 12 Min.) + FKS (4 × 3 Min.) + GSE Pre/Post (2 × 5 Min.) = 50 + 96 + 12 + 10 = **ca. 168 Minuten ≈ 3 Stunden** über 4 Wochen.

**Mindestvorgabe für Auswertbarkeit:** Mindestens 10 abgeschlossene Chat-Sessions innerhalb der 4 Wochen. Teilnehmende mit weniger als 10 Sessions werden als Dropout klassifiziert und in der Analyse als solche ausgewiesen (Intent-to-Treat-Reporting). Diese Anhebung von vormals 3 auf 10 Sessions ist begründet durch: (1) Bloom-Progression erfordert kumulativen Kompetenzaufbau — 3 Sessions erreichen maximal Bloom-Stufe 3 (Anwenden), nicht aber Analyse und Evaluation; (2) Spaced-Learning-Effekte (Cepeda, Pashler, Vul, Wixted & Rohrer, 2006) setzen verteilte Übungsepisoden voraus, die erst ab ca. 10 Touchpoints in 4 Wochen zuverlässig wirksam werden; (3) Mastery Experiences als zentraler Selbstwirksamkeits-Mechanismus (Bandura, 1997) akkumulieren mit steigender Sitzungsanzahl.

**Keine inhaltlichen Vorgaben:** Teilnehmende wählen selbst, welche Lernthemen sie mit KAIA bearbeiten. Das entspricht dem explorativen Charakter der Studie und der ökologischen Validität des Feldeinsatzes.

---

## 6.5 Hypothesen (vorregistriert auf OSF.io)

**H1 (primär, gerichtet):** Die GSE nach vier Wochen KAIA-Nutzung ist signifikant höher als vor der Nutzung (Wilcoxon-Vorzeichenrangtest, α=.05, zweiseitig).

**H2 (explorativ, ungerichtet):** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit und GSE-Veränderung (Spearman-Rho).

**H3 (explorativ, methodisch):** LLM-abgeleitete Indikatoren für Handlungskontrolle konvergieren über die Studienlaufzeit mit GSE-Selbstaussagen.

**H4 (explorativ, ergänzend):** Das Flow-Erleben (FKS-Mittelwert) verändert sich über die vier Messzeitpunkte (nach Session 2, 5, 8, 10) und korreliert positiv mit der GSE-Prä-Post-Differenz.

---

## 6.6 Statistische Analysemethoden

- Deskriptive Statistik (M, SD, Verteilung Prä/Post)
- Wilcoxon-Vorzeichenrangtest (H1) — nonparametrisch wegen N<30
- Spearman-Rho-Korrelation (H2 und H4: Nutzungshäufigkeit × GSE-Differenz; FKS × GSE-Differenz)
- Friedman-Test für Messwiederholung (H4: FKS-Verlauf über MZP 1–4, nonparametrisch) mit Post-hoc-Tests nach Dunn-Bonferroni
- Qualitative Inhaltsanalyse ausgewählter Transkripte (H3); ergänzend: qualitativ-interpretative Analyse der In-Session Feedback-Daten (6.3.3)
- Effektgröße r = z/√N (für Wilcoxon); Kendall's W (für Friedman-Test)

Analysesoftware: R 4.5.x (Pakete: `coin`, `rstatix`, `ggplot2`, `psych`, `PMCMRplus`)

---

## 6.7 Ergebnisse

*[Dieser Abschnitt wird nach Abschluss der Datenerhebung (August 2026) befüllt]*

### 6.7.1 Stichprobenbeschreibung

*Platzhalter*

### 6.7.2 Deskriptive Statistik

*Platzhalter*

### 6.7.3 Hypothesenprüfung

*Platzhalter — H1, H2, H3, H4*

### 6.7.4 Qualitative Befunde

*Platzhalter*

---

## 6.8 Diskussion

*[Wird nach Ergebnissen in 6.7 verfasst]*

Geplante Abschnitte:
- 6.8.1 Interpretation der Ergebnisse (vor dem Hintergrund von H1–H3)
- 6.8.2 Kritische Reflexion des Vorgehens (Limitierungen, Positionality)
- 6.8.3 Implikationen für die Praxis
- 6.8.4 Implikationen für die Forschung (Folgestudien)
- 6.8.5 Gesamtfazit

---

## Literaturverzeichnis (Kapitel 6)

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.

Csikszentmihalyi, M., & Larson, R. (1987). Validity and reliability of the experience-sampling method. *Journal of Nervous and Mental Disease, 175*(9), 526–536.

Dunlosky, J., & Metcalfe, J. (2009). *Metacognition*. SAGE.

Engeser, S., & Rheinberg, F. (2008). Flow, performance and moderators of challenge-skill balance. *Motivation and Emotion, 32*(3), 158–172. https://doi.org/10.1007/s11031-008-9102-4

Flavell, J. H. (1979). Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry. *American Psychologist, 34*(10), 906–911.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Jackson, S. A., & Marsh, H. W. (1996). Development and validation of a scale to measure optimal experience: The Flow State Scale. *Journal of Sport & Exercise Psychology, 18*(1), 17–35.

Larson, R., & Csikszentmihalyi, M. (1983). The experience sampling method. *New Directions for Methodology of Social and Behavioral Science, 15*, 41–56.

Rheinberg, F., Vollmeyer, R., & Engeser, S. (2003). Die Erfassung des Flow-Erlebens [The assessment of flow experience]. In J. Stiensmeier-Pelster & F. Rheinberg (Hrsg.), *Diagnostik von Motivation und Selbstkonzept* (S. 261–279). Hogrefe.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4*, 1–32. https://doi.org/10.1146/annurev.clinpsy.3.022806.091415

*[Weitere Quellen werden nach Durchführung der Studie ergänzt]*
