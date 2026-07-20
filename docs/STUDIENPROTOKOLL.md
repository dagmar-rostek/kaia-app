# Studienprotokoll — KAIA Pilotstudie

**Version:** 1.1  
**Datum:** 10. Juni 2026  
**Status:** Entwurf für Ethikvotum SRH Fernhochschule

---

## 1. Titel und Kontext

**Titel:** KAIA (Kinetic AI Agent) — Explorative Pilotstudie zur neuroadaptiven, KI-gestützten Lernbegleitung und ihrer Wirkung auf die allgemeine Selbstwirksamkeitserwartung

**Einrichtung:** SRH Fernhochschule, Masterstudiengang Data Science & Analytics

**Verantwortliche Forscherin:** Dagmar Rostek  
**E-Mail:** Dagmar.Rostek@stud.mobile-university.de  
**Betreuung:** [Name der Thesis-Betreuerin/des Thesis-Betreuers]

**Interessenkonflikt:** Die Forscherin ist gleichzeitig Entwicklerin des untersuchten Systems und potenzielle Kommerzialisiererin. Dieser Interessenkonflikt wird in der Thesis explizit deklariert. Zur Reduktion von Bias werden standardisierte Messinstrumente (GSE-Skala) eingesetzt.

---

## 2. Wissenschaftlicher Hintergrund und Forschungsfrage

### Hintergrund

Adaptives Lernen unter KI-Begleitung gewinnt an Bedeutung, ist jedoch wenig systematisch untersucht — insbesondere hinsichtlich der Wirkung auf psychologische Konstrukte wie Selbstwirksamkeit. Gleichzeitig besteht das Risiko, dass stark instruktionale KI-Systeme die Selbstlernkompetenz reduzieren (Kalyuga, 2007). Ein sokratischer Ansatz — Fragen statt Antworten — adressiert dieses Spannungsfeld.

Relevante theoretische Grundlagen:
- Selbstwirksamkeit nach Bandura (1977) und Schwarzer & Jerusalem (1995)
- Situatives Stresserleben und kognitive Bewertung (Lazarus, 1993)
- Flow-Theorie und optimale Aktivierung (Teigen, 1994; Oliveira & Hamari, 2024)
- Computational Empathy (Decety & Jackson, 2004)
- Kalyuga's (2007) Befunde zur Instruktionsredundanz
- Knowing-Doing Gap (Pfeffer & Sutton, 2000): Das systematische Auseinanderfallen von Wissen und Handeln als primäres Zielgruppenproblem
- Intention-Behavior Gap (Sheeran, 2002): Verhaltensintentionen erklären nur ~28% der Verhaltensvarianz
- Implementation Intentions als KDG-Schlussmechanismus (Gollwitzer, 1999; Gollwitzer & Sheeran, 2006)

### Forschungsfrage

„*Inwieweit unterstützt ein sokratisch konfigurierter KI-Lernbegleiter (KAIA) Menschen dabei, vorhandenes Wissen in konkretes Alltagshandeln zu überführen (Knowing-Doing Gap; Pfeffer & Sutton, 2000) — und in welchem Ausmaß steigt dabei die allgemeine Selbstwirksamkeitserwartung?*"

Ergänzende Forschungsfrage 1: *Welche Konvergenz oder Divergenz zeigt sich zwischen der subjektiven Selbstwahrnehmung (GSE-Skala) und der KI-basierten Fremdwahrnehmung aus Gesprächstranskripten?*

Ergänzende Forschungsfrage 2 (hinzugefügt 10.06.2026): *Verändert sich das Flow-Erleben der Teilnehmenden (operationalisiert mit der Flow-Kurzskala; Rheinberg et al., 2003) über die 10 Sessions und korreliert es mit der GSE-Veränderung?*

---

## 3. Hypothesen

**H1 (primär, gerichtet):**  
Die allgemeine Selbstwirksamkeitserwartung der Teilnehmenden, gemessen mit der GSE-Skala (Schwarzer & Jerusalem, 1995), ist nach vier Wochen KAIA-Nutzung (Post-Messung) signifikant höher als vor der Nutzung (Prä-Messung).

**H2 (explorativ, ungerichtet):**  
Es besteht ein positiver Zusammenhang zwischen der Häufigkeit der KAIA-Nutzung (Anzahl Sessions) und der Veränderung der Selbstwirksamkeitserwartung (Prä-Post-Differenz).

**H3 (explorativ, methodisch):**  
Die durch LLM-Analyse aus Gesprächstranskripten abgeleiteten Indikatoren für Handlungskontrolle und Problemlösezuversicht **sowie konkrete Umsetzungshandlungen (first_step-Felder aus Session-Summaries)** konvergieren über die Studienlaufzeit mit den GSE-Selbstaussagen und signalisieren eine Schließung des Knowing-Doing Gaps.

**H4 (explorativ, ergänzend, hinzugefügt 10.06.2026):**  
Das Flow-Erleben, gemessen mit der Flow-Kurzskala (FKS; Rheinberg et al., 2003), verändert sich über die vier Messzeitpunkte (nach Session 2, 5, 8, 10) und korreliert positiv mit der GSE-Prä-Post-Differenz.

*Hinweis: Aufgrund der kleinen Stichprobe (N ≈ 20) haben alle Hypothesen explorativen Charakter. Statistische Signifikanztests werden als ergänzend, nicht als primäres Erkenntnisziel betrachtet.*

---

## 4. Studiendesign

**Methodologischer Rahmen:** Design Science Research (Hevner et al., 2004) — iterative Entwicklung und Evaluation eines KI-Artefakts im wissenschaftlichen Kontext.

**Empirisches Design:** Einfaktorielle Prä-Post-Untersuchung ohne Kontrollgruppe (Pilotstudie). Die fehlende Kontrollgruppe ist begründet durch die explorative Natur und die kleine Stichprobe; konfirmatorische Aussagen sind explizit nicht beabsichtigt.

**Messinstrumente:**

1. *Skala zur Allgemeinen Selbstwirksamkeitserwartung* (GSE; Schwarzer & Jerusalem, 1995) — 10 Items, 4-stufige Likert-Skala; Prä-Messung (Woche 0) und Post-Messung (nach Woche 4). Cronbachs α > .80 in zahlreichen Validierungsstudien.

2. *Flow-Kurzskala* (FKS; Rheinberg, Vollmeyer & Engeser, 2003) — 10 Items, 7-stufige Likert-Skala, Cronbachs α = .90; Erhebung nach Session 2, 5, 8 und 10 (vier Messzeitpunkte). Frei verfügbar in PsychArchives (ZPID). Hinzugefügt am 10.06.2026.

3. *In-Session Feedback* (qualitativ-indikativ) — Zwei diskrete Buttons ("Muss ich weiterdenken", "Ich hänge gerade") zur Erfassung von Transfer-Momenten und kognitivem Overloading. Gespeichert in `session_feedback`. Hinzugefügt am 10.06.2026.

**Analysemethoden:**  
- Deskriptive Statistik (Mittelwerte, Standardabweichungen, Verteilung)
- Wilcoxon-Vorzeichenrangtest für Prä-Post-Vergleich (bei N < 30 nonparametrisch); Effektgröße r = z/√N
- Korrelation Nutzungshäufigkeit × GSE-Differenz (Spearman-Rho) — H2
- Friedman-Test (Messwiederholung, nonparametrisch) für FKS-Verlauf über MZP 1–4; Kendall's W als Effektgröße; Post-hoc nach Dunn-Bonferroni — H4
- Spearman-Rho: FKS-Gesamtwert × GSE-Differenz — H4
- Qualitative Inhaltsanalyse ausgewählter Gesprächstranskripte — H3
- Explorative LLM-Analyse (strukturierte Extraktion psychologischer Indikatoren) — H3
- Qualitativ-interpretative Analyse der In-Session Feedback-Daten

---

## 5. Stichprobe

**Zielgröße:** N = 32 auswertbare Datensätze · Rekrutierungsziel: ~46 Personen

**Power-Analyse** (berechnet mit R, Paket `pwr` v1.3, Skript: `docs/power_analyse.R`):

| Parameter | Wert |
|---|---|
| Test | Wilcoxon-Vorzeichenrangtest, einstichprobenartig |
| Signifikanzniveau α | 0.05 (zweiseitig) |
| Ursprüngliche Effektschätzung | d = 0.5 (mittel; Cohen, 1988) |
| Revidierte Effektschätzung (10.06.2026) | d = 0.4 (konservativ; s. Begründung unten) |
| Minimales N für 80% Power bei d=0.5 | 32 (ARE-korrigiert) |
| Minimales N für 80% Power bei d=0.4 | **51** (ARE-korrigiert) |
| Ziel-N (dokumentiertes Studienziel) | **32** |
| Power bei N=32, d=0.4 | ca. 60% |
| Power bei N=20, d=0.4 | ca. 37% (dokumentierte Limitation) |
| Dropout-Puffer | 30% → Rekrutierungsziel ~46 |

**Begründung der revidierten Effektschätzung (10.06.2026):** Mit der Anhebung der Mindest-Sessions-Anforderung auf 10 und einem Gesamtzeitaufwand von ca. 150 Minuten Chatzeit in 4 Wochen (statt ursprünglich unklar definierter ≥3 Sessions) erscheint eine konservativere Schätzung von d = 0.4 methodisch besser begründet. Kürzere Gesamtinterventionszeiten erzeugen im Mittel geringere Selbstwirksamkeitsveränderungen als intensivere Interventionen (Bandura, 1997; Scherer et al., 1982). Bei d = 0.4 ergibt sich ein Mindest-N von 51 für 80% Power — ein Wert, der mit dem Rekrutierungsziel von ~46 ohnehin nicht erreichbar war und der die bekannte Unterpower-Problematik weiter unterstreicht.

**Konsequenz:** Die Studie bleibt in jedem Szenario unterpowert für konfirmatorische Zwecke. Die explorative Natur wird explizit kommuniziert; statistische Signifikanztests dienen der Hypothesengenerierung für eine Folgestudie, nicht dem Hypothesentest im strengen Sinne. Dies entspricht dem angemessenen Umgang mit Pilotstudien (Thabane et al., 2010).

**Einschlusskriterien:**
- Volljährig (≥ 18 Jahre)
- Deutschsprachig (Muttersprache oder vergleichbare Kompetenz)
- Zugang zu einem Computer oder Tablet mit Internetverbindung
- Aktuelle Lernsituation (Studium, Weiterbildung, berufliches Lernen) **bei der grundlegendes Vorwissen zum gewählten Thema vorhanden ist und die primäre Herausforderung in der Umsetzung liegt** (kein reiner Wissensneustart erforderlich)
- Schriftliche informierte Einwilligung vor Studienstart

**Ausschlusskriterien:**
- Aktuelle oder anamnestische psychiatrische Diagnose (Selbstauskunft)
- Aktuelle psychotherapeutische Behandlung wegen einer Krise
- Keine hinreichende Schreib- und Lesefähigkeit auf Deutsch

**Rekrutierung:** Persönliches Netzwerk der Forscherin. Potenzielle Teilnehmende werden durch direkte Ansprache und Weiterleitungen rekrutiert. Die Forscherin-Teilnehmenden-Beziehung wird in der Thesis dokumentiert (Positionality Statement).

---

## 6. Ablauf der Studie

```
Woche 0     Registrierung, Einwilligung, KI-Disclosure, GSE Prä-Messung
Wochen 1–4  Strukturierte KAIA-Nutzung (Mindest: ≥ 10 Sessions)
              Sessions 1–2: Foundation-Sessions, 20–30 Min.
                (Motivationsanker, Lerntyp-Routing, Standortbestimmung)
              Sessions 3–10: Micro-Sessions, 10–15 Min.
                (Cross-Session-Memory übernimmt Kontextaufbau)
            FKS nach Session 2, 5, 8, 10 (je ~3 Min.)
Woche 4/5   GSE Post-Messung, FKS MZP 4 (falls nicht nach S10 erfolgt),
            optionaler kurzer Erfahrungsbericht
Nach Ende   Datenlöschung: spätestens 1 Jahr nach Abschlussnote
```

**Mindestvorgabe (aktualisiert 10.06.2026):** Mindestens **10** abgeschlossene Chat-Sessions innerhalb der 4 Wochen für Einschluss in die Auswertung. Teilnehmende mit weniger als 10 Sessions werden als Dropout ausgewiesen (Intent-to-Treat-Reporting). Die frühere Vorgabe von ≥ 3 Sessions war wissenschaftlich unzureichend begründet (s. Begründung in Kapitel 6.4 des Thesis-Manuskripts).

**Zeitaufwand für Teilnehmende:** ca. 168 Minuten über 4 Wochen (Sessions + FKS + GSE).

**Keine Vorgaben** für Gesprächsthemen — die Teilnehmenden wählen selbst, womit sie KAIA nutzen. Das entspricht dem explorativen Charakter der Studie und der ökologischen Validität des Feldeinsatzes.

---

## 7. Technische Maßnahmen und Datenschutz

**Hosting:** Hetzner CX23, Helsinki, Finnland (EU) — DSGVO-konform, kein Datentransfer in Drittländer für Hostingdaten.

**LLM-Anbieter:** Anthropic (Claude), OpenAI (GPT-4o), Mistral AI. Data Processing Agreements werden vor Studienstart abgeschlossen. Chat-Inhalte werden an die jeweiligen APIs übermittelt; Anthropic und OpenAI sind US-Anbieter (Rechtsgrundlage: SCCs, Art. 46 DSGVO).

**Pseudonymisierung:** Teilnehmende werden ausschließlich über interne Benutzer-IDs identifiziert. Namen sind in keinem Analysedokument enthalten.

**Authentifizierung:** JWT-Token (Access 15min, Refresh 30 Tage), bcrypt-12 für Passwörter.

**Löschfrist:** Spätestens 1 Jahr nach Bekanntgabe der Abschlussnote (SRH-Vorgabe); Anonymisierung in der Regel früher.

**Datenportabilität:** Teilnehmende können ihre Daten jederzeit als JSON exportieren (Art. 20 DSGVO).

**Recht auf Löschung:** Jederzeit selbst auslösbar über das Profil (Art. 17 DSGVO).

---

## 8. Krisenprävention und Sicherheitsprotokoll

### Automatischer Pre-Filter

Jede Texteingabe vor der LLM-Verarbeitung wird durch einen deterministischen Keyword-Filter geprüft (Crisis Detection). Der Filter erkennt ~20 deutsche Ausdrucksmuster für Suizidgedanken, Selbstverletzung und akute Hoffnungslosigkeit.

**Bei Treffer:**  
- Die Eingabe wird **nicht** an das LLM weitergeleitet
- KAIA zeigt eine statische Antwort mit:
  - Telefonseelsorge: 0800 111 0 111 (kostenlos, anonym, 24/7)
  - Telefonseelsorge: 0800 111 0 222 (Alternative)
  - Notruf: 112
- Der Vorfall wird ohne Inhalt protokolliert (Zeitstempel, pseudonymisierte User-ID)

### Hinweise in der Einwilligungserklärung

Alle Teilnehmenden werden explizit darauf hingewiesen, dass KAIA kein Therapeut ist und keine psychologische Krisenintervention anbietet. Der Krisenfilter und die Notfallnummern sind in der KI-Disclosure und der Datenschutzerklärung dokumentiert.

### Eskalation

Bei wiederholten Krisen-Treffern für eine Benutzer-ID wird die Forscherin via Slack-Benachrichtigung informiert (ohne Inhalte) und kann den Zugang deaktivieren und die Person direkt kontaktieren.

---

## 9. Risikobewertung

| Risiko | Wahrscheinlichkeit | Schwere | Maßnahme |
|---|---|---|---|
| Psychische Belastung durch Studie | Gering | Mittel | Crisis Detection, Recht auf Abbruch, Nachbefragungsmöglichkeit |
| Datenleck | Sehr gering | Hoch | Pseudonymisierung, bcrypt, httpOnly-Cookies, EU-Server |
| Bias durch Forscherin-Teilnehmenden-Beziehung | Mittel | Mittel | Vorregistrierte Hypothesen, standardisiertes Instrument |
| KI-Fehlfunktion / halluzinierte Inhalte | Gering | Mittel | Explizite KI-Disclosure, sokratischer Modus reduziert faktische Aussagen |
| Dependency-Effekt (Überabhängigkeit von KAIA) | Sehr gering | Gering | Sokratischer Ansatz fördert Eigenständigkeit; 4-Wochen-Limit |
| Erhöhter Dropout durch 10-Sessions-Anforderung (hinzugefügt 10.06.2026) | Mittel | Mittel | Transparente Kommunikation des Aufwands bei Rekrutierung; Reminder-Mechanismus im System; Dropout-Puffer von 30% bereits eingerechnet; Intent-to-Treat-Reporting |

---

## 10. Ethische Grundsätze

- **Freiwilligkeit:** Teilnahme ist vollständig freiwillig. Kein Nachteil bei Abbruch oder Ablehnung.
- **Informierte Einwilligung:** Schriftlich, vor Beginn, mit explizitem KI-Disclosure.
- **Transparenz:** Teilnehmende wissen vollständig, was mit ihren Daten geschieht.
- **Datensparsamkeit:** Es werden nur Daten erhoben, die für die Forschungsfrage notwendig sind.
- **Interessenkonflikt:** Offen deklariert (s. Abschnitt 1).
- **Keine Täuschung:** Es gibt keine Verdeckung von Studienzielen oder Bedingungen.
- **Kein Deception Design:** Alle Teilnehmenden wissen, dass sie mit einer KI kommunizieren.

---

## 11. Zeitplan

| Meilenstein | Geplant |
|---|---|
| Ethikvotum Antrag einreichen | **Diese Woche** — spätestens 06.06.2026 |
| DPAs Anthropic/OpenAI abgeschlossen | Abgeschlossen ✓ |
| Study-Lock aktivieren | 28.07.2026 |
| **Pilotstudie START** | **1. August 2026** |
| Pilotstudie ENDE (4 Wochen) | 29. August 2026 |
| Post-Messung + Interviews | 29. August – 05. September 2026 |
| Auswertung (Kap. 5 + 6) | September 2026 |
| Thesis-Abgabe | **01. Oktober 2026** |

---

*Dieses Studienprotokoll kann bis zur Ethikvotum-Einreichung aktualisiert werden. Änderungen nach Beginn der Datenerhebung sind nur mit Zustimmung des Ethikkomitees möglich.*
