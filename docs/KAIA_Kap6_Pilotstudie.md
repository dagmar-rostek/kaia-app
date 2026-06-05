# Kapitel 6 — Pilotstudie und Evaluation

> **Stand:** 04. Juni 2026 · **Version:** 0.3-DRAFT  
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

### 6.3.2 Nutzungsstatistiken

Sofern consent_analytics=true: Anzahl Sessions, Gesamtnutzungsdauer, aktiver Charakter. Werden als Kovariaten in die Analyse einbezogen (H2-Test).

### 6.3.3 LLM-Transcript-Analyse (explorativ)

Automatisierte Extraktion psychologischer Indikatoren aus Gesprächstranskripten: Handlungskontrolle, Problemlösezuversicht, Bewältigungserwartung. Methodik wird vor Studienstart spezifiziert und auf OSF.io registriert (H3-Test).

---

## 6.4 Ablauf

```
Zeitraum        Aktivität
────────────────────────────────────────────────────────────
Vor Studie      Ethikvotum SRH | Pre-Registration OSF.io | DPAs
Woche 0         Registrierung | Einwilligung | KI-Disclosure | GSE Prä
Woche 1–4       Freie KAIA-Nutzung (Empfehlung: ≥3 Sessions)
Woche 4–5       GSE Post | optionaler Erfahrungsbericht
Nach Studie     Auswertung | 6-Monate-Löschfrist startet
```

---

## 6.5 Hypothesen (vorregistriert auf OSF.io)

**H1 (primär, gerichtet):** Die GSE nach vier Wochen KAIA-Nutzung ist signifikant höher als vor der Nutzung (Wilcoxon-Vorzeichenrangtest, α=.05, zweiseitig).

**H2 (explorativ, ungerichtet):** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit und GSE-Veränderung (Spearman-Rho).

**H3 (explorativ, methodisch):** LLM-abgeleitete Indikatoren für Handlungskontrolle konvergieren über die Studienlaufzeit mit GSE-Selbstaussagen.

---

## 6.6 Statistische Analysemethoden

- Deskriptive Statistik (M, SD, Verteilung Prä/Post)
- Wilcoxon-Vorzeichenrangtest (H1) — nonparametrisch wegen N<30
- Spearman-Rho-Korrelation (H2)
- Qualitative Inhaltsanalyse ausgewählter Transkripte (H3)
- Effektgröße r = z/√N (für Wilcoxon)

Analysesoftware: R 4.5.x (Pakete: `coin`, `rstatix`, `ggplot2`, `psych`)

---

## 6.7 Ergebnisse

*[Dieser Abschnitt wird nach Abschluss der Datenerhebung (August 2026) befüllt]*

### 6.7.1 Stichprobenbeschreibung

*Platzhalter*

### 6.7.2 Deskriptive Statistik

*Platzhalter*

### 6.7.3 Hypothesenprüfung

*Platzhalter — H1, H2, H3*

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

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

*[Weitere Quellen werden nach Durchführung der Studie ergänzt]*
