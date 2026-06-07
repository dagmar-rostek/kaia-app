# Skala zur Allgemeinen Selbstwirksamkeitserwartung (SWE / GSE)

**Instrument:** Schwarzer & Jerusalem (1995)  
**Verwendung in KAIA-Studie:** Prä-Post-Messung (vor Studienstart + nach Woche 4)  
**Lizenz:** CC BY-NC-ND 3.0 (PsychArchives, DOI: 10.23668/psycharchives.307)  
**Nutzungsbedingung Thesis:** In der Druckfassung nur ein Beispiel-Item — Vollskala im Anhang oder via DOI referenzieren (gemäß FU-Berlin-FAQ).

---

## Die 10 Items (deutscher Originalwortlaut)

**Instruktion:** *"Bitte geben Sie an, wie sehr die folgenden Aussagen auf Sie zutreffen."*

| Nr. | Item |
|-----|------|
| 1 | Wenn sich Widerstände auftun, finde ich Mittel und Wege, mich durchzusetzen. |
| 2 | Die Lösung schwieriger Probleme gelingt mir immer, wenn ich mich darum bemühe. |
| 3 | Es bereitet mir keine Schwierigkeiten, meine Absichten und Ziele zu verwirklichen. |
| 4 | In unerwarteten Situationen weiß ich immer, wie ich mich verhalten soll. |
| 5 | Auch bei überraschenden Ereignissen glaube ich, dass ich gut mit ihnen umgehen kann. |
| 6 | Schwierigkeiten sehe ich gelassen entgegen, weil ich meinen Fähigkeiten immer vertrauen kann. |
| 7 | Was auch immer passiert, ich werde schon klarkommen. |
| 8 | Für jedes Problem kann ich eine Lösung finden. |
| 9 | Wenn eine neue Sache auf mich zukommt, weiß ich, wie ich damit umgehen kann. |
| 10 | Wenn ein Problem auftaucht, kann ich es aus eigener Kraft meistern. |

*Anmerkung: Item 5 enthält im Original die alte Rechtschreibung ("daß") — in der Web-Implementierung wird die neue Schreibweise ("dass") verwendet.*

---

## Antwortkategorien

| Wert | Label |
|------|-------|
| 1 | stimmt nicht |
| 2 | stimmt kaum |
| 3 | stimmt eher |
| 4 | stimmt genau |

---

## Auswertungskonzept

### Skalierung und Berechnung

- **Keine Umpolung** — alle 10 Items sind positiv formuliert
- **Summenscore:** Addition aller 10 Items → Wertebereich **10–40 Punkte**
- **Alternativ:** Mittelwert = Summenscore / 10 → Bereich **1,0–4,0**
- Höherer Wert = höhere allgemeine Selbstwirksamkeitserwartung

### Normwerte (bevölkerungsrepräsentativ, Deutschland)

Hinz et al. (2006), N = 2.019, Alter 16–95 Jahre:
- Gesamtstichprobe: **M ≈ 29, SD ≈ 4**
- Frauen: geringfügig niedrigere Werte (kleiner Effekt)
- Alterseffekt: leicht fallende Tendenz mit zunehmendem Alter
- Internationaler Vergleich westlicher Stichproben: M ≈ 29,5 (SD ≈ 5)

### Auswertung in der KAIA-Studie (Prä-Post, N = 32)

**Statistisches Verfahren:** Wilcoxon-Vorzeichen-Rangtest (bereits in `power_analyse.R` implementiert)
- Gepaarter Test: Prä-Summenscore vs. Post-Summenscore pro Teilnehmende:r
- Signifikanzniveau: α = 0,05 (zweiseitig)
- Effektgröße: r = Z / √N

**Deskriptive Auswertung:**
- Mittelwert + Standardabweichung Prä / Post
- Differenz (Post − Prä) pro Person
- Boxplot Prä vs. Post

**Interpretation:**
- Signifikanter Anstieg: Hinweis auf positive Wirkung der KAIA-Nutzung auf Selbstwirksamkeit
- Kein Effekt: Pilotstudie war möglicherweise zu kurz / Effekt zu klein für N=32

**Power-Kalkulation:** Bei d = 0,5, α = 0,05, Power = 80% → N = 32 (siehe `docs/power_analyse.R`)

---

## Gütekriterien

| Kriterium | Wert | Quelle |
|---|---|---|
| Interne Konsistenz (Cronbach's α) | .76–.90 (23 Länder); deutsch .80–.90 | Scholz et al. (2002) |
| Test-Retest-Reliabilität (6 Mon.) | r = .75 | Jerusalem & Schwarzer (1999) |
| Struktur | Eindimensional (konfirmatorisch bestätigt) | Scholz et al. (2002) |
| Konvergente Validität | r = .52–.68 mit Optimismus, Selbstesteem | Schwarzer et al. |
| Diskriminante Validität | r = −.40 bis −.55 mit Depressivität, Angst | Schwarzer et al. |
| Konstruktvalidität | Prädiziert Genesungsverläufe, akad. Leistung | Hinz et al. (2006) |

---

## Vollständige Literaturverweise (APA 7)

**Primärquelle (Skala):**
> Schwarzer, R., & Jerusalem, M. (1995). Generalized self-efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), *Measures in health psychology: A user's portfolio. Causal and control beliefs* (pp. 35–37). NFER-NELSON.

**Normierung (bevölkerungsrepräsentativ, Deutschland):**
> Hinz, A., Schumacher, J., Albani, C., Schmid, G., & Brähler, E. (2006). Bevölkerungsrepräsentative Normierung der Skala zur Allgemeinen Selbstwirksamkeitserwartung. *Diagnostica, 52*(1), 26–32. https://doi.org/10.1026/0012-1924.52.1.26

**Psychometrische Dokumentation (dt. Gütekriterien, PsychArchives):**
> Jerusalem, M., & Schwarzer, R. (1999). *SWE. Skala zur Allgemeinen Selbstwirksamkeitserwartung*. Freie Universität Berlin. https://doi.org/10.23668/psycharchives.307

**Multikulturelle Validierung (Cronbach α, 23 Länder):**
> Scholz, U., Doña, B. G., Sud, S., & Schwarzer, R. (2002). Is general self-efficacy a universal construct? *European Journal of Psychological Assessment, 18*(3), 242–251.

---

## Hinweis für die Web-Implementierung (KAIA)

Die 10 Items werden in der KAIA-Webanwendung als Prä- und Post-Messung implementiert:
- 4-stufige Likert-Skala mit Radiobuttons
- Pflichtfelder — kein Weiter ohne Beantwortung aller Items
- Summenscore wird berechnet und in `gse_results`-Tabelle gespeichert (neben `user_id`, `session_type = "pre"|"post"`, `timestamp`)
- Keine Anzeige des Scores an Teilnehmende während der Studie (verhindert Response Bias in Post-Messung)
- DSGVO: Summenscore wird pseudonymisiert gespeichert — kein Klarname in der Tabelle

---

*Quellen verifiziert am 2026-06-07 · Dagmar Rostek + Claude Code*
