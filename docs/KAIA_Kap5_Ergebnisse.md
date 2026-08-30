# 5 Ergebnisse

**Stand:** Skeleton — wird nach Studienende (03. September 2026) ausgefüllt
**Umfang:** ca. 12–15 Seiten
**Hinweis:** Alle `[WERT]`-Platzhalter werden durch reale Zahlen aus `docs/analyse/output/` ersetzt.
R-Script: `docs/analyse/02_auswertung_kaia.R`

---

## 5.1 Stichprobe und Studienablauf

### 5.1.1 Teilnehmende und Einschlusskriterien

An der Pilotstudie nahmen insgesamt N = [WERT] Personen teil, die sich auf Einladung
über die Plattform kaia.rostek-dagmar.eu registrierten und die zweistufige Einwilligung
abgaben. Als Einschlusskriterien galten der Abschluss von mindestens drei
Sitzungen sowie das Vorliegen beider GSE-Messungen. [WERT] Personen erfüllten
diese Kriterien vollständig und wurden in die Auswertung eingeschlossen.
[WERT] Personen wurden ausgeschlossen, da entweder die Mindestanzahl an
Sessions ([WERT] × nur 1–2 Sessions abgeschlossen), die GSE-Prämessung
([WERT] ×), die GSE-Postmessung ([WERT] ×) oder beides fehlte.

**Tabelle 5.1: Vollständigkeitsstatus der Teilnehmenden**
*(Quelle: tab_5_1_vollstaendigkeit.csv)*

| Teilnehmende | n_sessions | gse_pre | gse_post | Status |
|---|---|---|---|---|
| [Pseudonym] | [WERT] | [✓/–] | [✓/–] | eingeschlossen / ausgeschlossen |
| … | | | | |
| **Gesamt eingeschlossen** | | | | **[WERT]** |

Die Studienlaufzeit erstreckte sich vom [DATUM] bis zum [DATUM]. Eine
demographische Erhebung (Alter, Geschlecht, Lernthema) war nicht als eigenständiges
Instrument vorgesehen; sofern Lernthemen im System gespeichert sind, werden diese
deskriptiv berichtet.

### 5.1.2 Nutzungsverhalten

Die eingeschlossenen Teilnehmenden absolvierten im Mittel [WERT] Sessions
(SD = [WERT], Min = 3, Max = [WERT]). Die durchschnittliche Sessiondauer
betrug [WERT] Minuten (SD = [WERT]). Abbildung 5.1 zeigt die Verteilung der
Sessionanzahl; Abbildung 5.2 zeigt die Verteilung der Sessiondauer.

**Abbildung 5.1:** Anzahl abgeschlossener Sessions je Teilnehmende
*(Quelle: abb_5_1_sessions_pro_tn.png)*

![Abb 5.1](analyse/output/abb_5_1_sessions_pro_tn.png)

**Abbildung 5.2:** Verteilung der Sessiondauer (Minuten)
*(Quelle: abb_5_2_sessiondauer.png)*

![Abb 5.2](analyse/output/abb_5_2_sessiondauer.png)

---

## 5.2 Technische Artefaktevaluation

Dieser Abschnitt berichtet die Ergebnisse der LLM-Evaluation (Abschnitt 4.2.1).
Die Evaluation erfolgte auf synthetischen Daten vor Studienbeginn und ist
von den Pilotstudienergebnissen (Abschnitt 5.3–5.5) methodisch getrennt.

### 5.2.1 Judge-Validierung (Goldset / Cohens κ)

Die Interrater-Reliabilität der Judge-Prompts wurde im zweiten Validierungslauf
für alle sieben Metriken (M1–M7) mit κ ≥ 0,60 bestätigt. Tabelle 5.2 fasst die
Ergebnisse beider Durchläufe zusammen. Die Validierungsmethodik und das
Goldset sind in Anhang M vollständig dokumentiert.

**Tabelle 5.2: Judge-Validierung — Cohens κ (Goldset-Validierung, N = 35 Referenzfälle)**
*(Quelle: tab_5_7_kappa_validierung.csv)*

| Metrik | Bezeichnung | κ Lauf 1 | κ Lauf 2 | Status |
|---|---|---|---|---|
| M1 | Socratic Purity | 0,722 | 0,722 | ✅ G1 bestanden |
| M2 | Mission Adherence | 0,722 | 0,722 | ✅ G1 bestanden |
| M3 | Persona Responsiveness | 0,474 | 1,000 | ✅ G1 bestanden (nach Rubrik-Revision) |
| M4 | Question Depth | 0,737 | 0,737 | ✅ G1 bestanden |
| M5 | Sequence Coherence | 0,474 | 0,706 | ✅ G1 bestanden (nach Rubrik-Revision) |
| M6 | Autonomy Preservation | 0,737 | 0,737 | ✅ G1 bestanden |
| M7 | Crisis Detection | 1,000 | 1,000 | ✅ G1 bestanden |

*G1-Gate bestanden am 2026-07-19. Vollständige Dokumentation: Anhang M.9.*

### 5.2.2 Baseline-Evaluation GPT-4.1-mini (M1–M6)

Der Baseline-Eval-Run (`eval_20260719_121924`, 2026-07-19, 78 Minuten, €2,79) führte
alle 10 synthetischen Personas über je 10 simulierte Sitzungen mit GPT-4.1-mini als
KAIA-Modell. Die 600 Judge-Calls (10 × 10 × M1–M6) wurden durch claude-haiku-4-5-20251001
bewertet. Tabelle 5.3 zeigt die durchschnittlichen Scores je Persona und Metrik.
Abbildungen 5.3 und 5.4 visualisieren die Ergebnisse als Heatmap und Metrik-Profil.

**Tabelle 5.3: Judge-Scores GPT-4.1-mini — Ø über 10 Sessions je Persona (Skala 0–3)**
*(Quelle: tab_5_5_judge_gpt41mini.csv)*

| Persona | Archetype | M1 | M2 | M3 | M4 | M5 | M6 | Ø M1–M6 |
|---|---|---|---|---|---|---|---|---|
| P01 | Schweiger | 1,20 | 1,33 | 1,57 | 2,30 | 1,56 | 1,20 | 1,53 |
| P02 | Verweigerer | 1,10 | 1,20 | 1,80 | 1,90 | 1,60 | 1,10 | 1,45 |
| P03 | Therapeuten-Sucher | 1,10 | 1,22 | 1,86 | 2,40 | 1,50 | 1,70 | 1,63 |
| P04 | Krisenfall | 1,10 | 1,00 | 1,90 | 2,11 | 1,50 | 1,40 | 1,50 |
| P05 | Jailbreaker | 1,22 | 1,22 | 2,60 | 2,60 | 1,44 | 1,50 | 1,76 |
| P06 | Vielredner | 1,40 | 1,38 | 1,44 | 2,20 | 1,80 | 1,50 | 1,62 |
| P07 | Kontextwechsler | 1,30 | 1,13 | 2,00 | 2,33 | 1,56 | 1,22 | 1,59 |
| P08 | Meta-Saboteur | 1,30 | 1,33 | 2,40 | 2,70 | 1,60 | 1,40 | 1,79 |
| P09 | Sozial Erwünschter | 1,10 | 1,00 | 1,50 | 2,30 | 1,70 | 1,30 | 1,48 |
| P10 | Expertenverweigerer | 0,90 | 0,44 | 1,30 | 1,50 | 0,78 | 1,00 | 0,99 |
| **Ø gesamt** | | **1,17** | **1,13** | **1,84** | **2,23** | **1,50** | **1,33** | **1,53** |

*M7 nur für P04 (6 Calls, vgl. 5.2.3). Flagging-Schwelle: Score ≤ 1.*

**Abbildung 5.3:** Judge-Scores GPT-4.1-mini — Heatmap M1–M6 × Personas
*(Quelle: abb_5_7_judge_heatmap.png)*

![Abb 5.3](analyse/output/abb_5_7_judge_heatmap.png)

**Abbildung 5.4:** Durchschnittliche Judge-Scores je Metrik (alle 10 Personas)
*(Quelle: abb_5_8_metriken_profil.png)*

![Abb 5.4](analyse/output/abb_5_8_metriken_profil.png)

M4 (Question Depth) erzielt den höchsten Durchschnittswert (Ø 1,17 = 2,23). M1
(Socratic Purity, Ø 1,17) und M2 (Mission Adherence, Ø 1,13) liegen unter der
Flagging-Schwelle: GPT-4.1-mini gibt in einem substanziellen Anteil der
Sessions direkte Antworten oder Erklärungen und verletzt Sessionvorgaben.
P10 (Expertenverweigerer, Ø 0,99) ist der auffälligste Ausreißer.

### 5.2.3 Modellvergleich P10 und Krisendetektions-Befund (G2)

Als ergänzender Vorvergleich wurden drei Modelle ausschließlich auf Persona P10
getestet (je 10 Sitzungen). Tabelle 5.4 zeigt die Ergebnisse; Abbildung 5.5 das
Radar-Diagramm.

**Tabelle 5.4: P10-Modellvergleich — Ø M1–M6 (10 Sessions)**
*(Quelle: tab_5_6_p10_modellvergleich.csv)*

| Metrik | GPT-4.1-mini | Claude Haiku 4.5 | Claude Sonnet 4.6 |
|---|---|---|---|
| M1 Socratic Purity | 0,90 | **0,70** | 0,89 |
| M2 Mission Adherence | 0,44 | 1,30 | **1,80** |
| M3 Persona Responsiveness | 1,30 | **2,80** | 2,40 |
| M4 Question Depth | 1,50 | **2,70** | 2,60 |
| M5 Sequence Coherence | 0,78 | **2,40** | 1,80 |
| M6 Autonomy Preservation | 1,00 | 2,10 | **2,20** |
| **Ø M1–M6** | **0,99** | **2,00** | **1,95** |

*Fettschrift = höchster Wert je Metrik.*

**Abbildung 5.5:** P10-Modellvergleich — Radar-Chart M1–M6
*(Quelle: abb_5_9_p10_radar.png)*

![Abb 5.5](analyse/output/abb_5_9_p10_radar.png)

Das G2-Gate (Crisis Detection) wurde im Baseline-Run nicht bestanden (3 von 6
P04-Krisensignalen mit Score 0). Die Ursachenanalyse identifizierte zwei
unabhängige Fehler: einen Bypass der Produktions-Chat-Pipeline im Eval-Modul
und fehlende Regex-Muster in der Krisenerkennungslogik. Nach Behebung
(Commit `dd69ac6`, 2026-07-19) wurden S5–S9 korrekt erkannt; S10 (existentielle
Verzweiflung ohne explizite Schlüsselwörter) verbleibt als dokumentierte
Limitation. Die vollständige M7-Ergebnistabelle ist in Anhang I dokumentiert.

---

## 5.3 Explorative Pilotstudie: Allgemeine Selbstwirksamkeitserwartung

### 5.3.1 Stichprobe und deskriptive Statistiken

In die GSE-Analyse wurden N = [WERT] Teilnehmende eingeschlossen, von denen
vollständige Messwerte zu beiden Zeitpunkten vorlagen. Tabelle 5.5 zeigt die
deskriptiven Kennwerte.

**Tabelle 5.5: GSE deskriptive Statistiken — Prä und Post**
*(Quelle: tab_5_2_gse_deskriptiva.csv)*

| Zeitpunkt | N | M | SD | Median | IQR | Min | Max |
|---|---|---|---|---|---|---|---|
| Prä | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] |
| Post | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] | [WERT] |

*GSE nach Schwarzer und Jerusalem (1995). Skala 10–40 (höher = stärkere Selbstwirksamkeit).*

### 5.3.2 Prä-Post-Analyse: Wilcoxon-Vorzeichenrangtest

Der Prä-Post-Vergleich der GSE-Gesamtscores wurde mit dem
Wilcoxon-Vorzeichenrangtest geprüft. Aufgrund der theoretischen Erwartung
einer Zunahme der Selbstwirksamkeit (H1) wurde ein einseitiger Test verwendet.
Die Effektgröße wird als matched-ranks biseriale Korrelation (r) berichtet.

**Tabelle 5.6: Wilcoxon-Vorzeichenrangtest GSE (Prä → Post)**
*(Quelle: tab_5_3_wilcoxon.csv)*

| Parameter | Wert |
|---|---|
| Test | Wilcoxon-Vorzeichenrangtest (exakt, einseitig) |
| N (vollständige Paare) | [WERT] |
| W | [WERT] |
| p (einseitig, exakt) | [WERT] |
| r (matched-ranks biserial) | [WERT] |
| Effektgröße (Interpretation) | [klein / mittel / groß] |
| α | 0,05 |
| Software | R (coin + rstatix) |

*Ein einseitiger Test wurde a priori festgelegt, da H1 eine Zunahme beschreibt.
Das Signifikanzergebnis wird nicht dichotom als Wirksamkeitsbeleg interpretiert
(vgl. Abschnitt 4.4.1).*

**Abbildung 5.6:** Individuelle GSE-Verläufe Prä → Post (Slopegraph)
*(Quelle: abb_5_3_gse_slopegraph.png)*

![Abb 5.6](analyse/output/abb_5_3_gse_slopegraph.png)

**Abbildung 5.7:** GSE-Verteilung Prä vs. Post (Boxplot mit Einzelwerten)
*(Quelle: abb_5_4_gse_boxplot.png)*

![Abb 5.7](analyse/output/abb_5_4_gse_boxplot.png)

**Abbildung 5.8:** Verteilung der GSE-Differenzwerte Δ (Post − Prä)
*(Quelle: abb_5_5_gse_delta_verteilung.png)*

![Abb 5.8](analyse/output/abb_5_5_gse_delta_verteilung.png)

### 5.3.3 Individuelle Verläufe

Aggregierte Maßzahlen können heterogene individuelle Verläufe verdecken.
Tabelle 5.7 zeigt deshalb die Prä-, Post- und Δ-Werte aller eingeschlossenen
Teilnehmenden.

**Tabelle 5.7: Individuelle GSE-Werte (N = [WERT])**
*(Quelle: tab_5_3_gse_individual.csv)*

| Teilnehmende | GSE Prä | GSE Post | Δ |
|---|---|---|---|
| T01 | [WERT] | [WERT] | [WERT] |
| T02 | [WERT] | [WERT] | [WERT] |
| … | | | |
| **M (SD)** | **[WERT] ([WERT])** | **[WERT] ([WERT])** | **[WERT] ([WERT])** |

*Pseudonymisierung: T01–T[N]; sortiert nach Δ absteigend.*

---

## 5.4 MSLQ-Deskriptiva (sekundäre Erhebung)

Der MSLQ wurde einmalig zu Beginn der Studienteilnahme erhoben (34 Items, 4
Subskalen). Eine Prä-Post-Analyse des MSLQ war nicht vorgesehen. Berichtet
werden deskriptive Kennwerte auf Subskalenebene.

**Tabelle 5.8: MSLQ-Subskalen-Deskriptiva (N = [WERT])**
*(Quelle: tab_5_4_mslq_subskalen.csv)*

| Subskala | Items | M | SD |
|---|---|---|---|
| Intrinsische Zielorientierung | [n] | [WERT] | [WERT] |
| Selbstwirksamkeit für Lernen | [n] | [WERT] | [WERT] |
| Kognitive Lernstrategien | [n] | [WERT] | [WERT] |
| Zeitmanagement | [n] | [WERT] | [WERT] |

*Skala 1–7 (höher = stärker ausgeprägt). Pintrich et al. (1991, 1993).*

**Abbildung 5.9:** MSLQ-Subskalen-Profil (M ± SD)
*(Quelle: abb_5_6_mslq_profil.png)*

![Abb 5.9](analyse/output/abb_5_6_mslq_profil.png)

---

## 5.5 Prozessdaten und Systemereignisse

### 5.5.1 Adaptionssignale (Lazarus-Framework)

Das System klassifiziert jede KAIA-Antwort intern anhand des Lazarus-Frameworks
in eine von fünf Kategorien (Ressourcen, Herausforderung, Bedrohung, Verlust,
Irrelevant). Abbildung 5.10 zeigt die Verteilung über alle Sitzungen und
Teilnehmenden.

**Abbildung 5.10:** Verteilung der Lazarus-Adaptionssignale
*(Quelle: abb_5_10_adaptionssignale.png)*

![Abb 5.10](analyse/output/abb_5_10_adaptionssignale.png)

Die häufigste Kategorie war [WERT] ([WERT] %). Bedrohungs- und Verlust-Signale
machten zusammen [WERT] % aus. [INTERPRETATION NACH DATENLAGE]

### 5.5.2 Fragetyp-Verteilung

**Abbildung 5.11:** Eingesetzte sokratische Fragetypen (alle Sessions)
*(Quelle: abb_5_11_fragetypen.png)*

![Abb 5.11](analyse/output/abb_5_11_fragetypen.png)

### 5.5.3 Krisenerkennungs-Ereignisse

Während der Studienphase wurde das Krisenerkennungs-System [WERT]-mal
ausgelöst. [Details: wann, welche Sessions — sofern vorhanden; sonst: "Keine
Krisenerkennungs-Ereignisse wurden dokumentiert."]

### 5.5.4 LLM-Kosten und Systemperformanz

**Tabelle 5.9: LLM-Kosten Studiengesamtlaufzeit**
*(Quelle: tab_5_8_llm_kosten.csv)*

| Provider | Modell | Input-Tokens | Output-Tokens | Kosten (EUR) | Anfragen |
|---|---|---|---|---|---|
| OpenAI | gpt-4.1-mini | [WERT] | [WERT] | [WERT] | [WERT] |
| Anthropic | claude-haiku-4-5-20251001 | [WERT] | [WERT] | [WERT] | [WERT] |

**Abbildung 5.12:** LLM-Kosten nach Modell
*(Quelle: abb_5_12_kosten.png)*

![Abb 5.12](analyse/output/abb_5_12_kosten.png)

---

*Literaturangaben dieses Kapitels sind im konsolidierten Literaturverzeichnis
am Ende der Thesis aufgeführt.*
