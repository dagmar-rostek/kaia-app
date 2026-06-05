# Studienprotokoll — KAIA Pilotstudie

**Version:** 1.0  
**Datum:** Juni 2026  
**Status:** Entwurf für Ethikvotum SRH Fernhochschule Riedlingen

---

## 1. Titel und Kontext

**Titel:** KAIA (Kinetic AI Agent) — Explorative Pilotstudie zur neuroadaptiven, KI-gestützten Lernbegleitung und ihrer Wirkung auf die allgemeine Selbstwirksamkeitserwartung

**Einrichtung:** SRH Fernhochschule Riedlingen, Masterstudiengang Data Science & Analytics

**Verantwortliche Forscherin:** Dagmar Rostek  
**E-Mail:** dagmar.rostek@wbstraining.de  
**Betreuung:** [Name der Thesis-Betreuerin/des Thesis-Betreuers]

**Interessenkonflikt:** Die Forscherin ist gleichzeitig Entwicklerin des untersuchten Systems und potenzielle Kommerzialisiererin. Dieser Interessenkonflikt wird in der Thesis explizit deklariert. Zur Reduktion von Bias werden standardisierte Messinstrumente (GSE-Skala) und vorregistrierte Hypothesen (OSF.io, vor Datensicht) eingesetzt.

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

### Forschungsfrage

*Inwieweit beeinflusst die Nutzung eines sokratisch konfigurierten KI-Lernbegleiters (KAIA) über einen Zeitraum von vier Wochen die allgemeine Selbstwirksamkeitserwartung von Lernenden?*

Ergänzende Forschungsfrage: *Welche Konvergenz oder Divergenz zeigt sich zwischen der subjektiven Selbstwahrnehmung (GSE-Skala) und der KI-basierten Fremdwahrnehmung aus Gesprächstranskripten?*

---

## 3. Hypothesen (für Pre-Registration OSF.io)

Diese Hypothesen werden vor Beginn der Datenerhebung auf OSF.io registriert.

**H1 (primär, gerichtet):**  
Die allgemeine Selbstwirksamkeitserwartung der Teilnehmenden, gemessen mit der GSE-Skala (Schwarzer & Jerusalem, 1995), ist nach vier Wochen KAIA-Nutzung (Post-Messung) signifikant höher als vor der Nutzung (Prä-Messung).

**H2 (explorativ, ungerichtet):**  
Es besteht ein positiver Zusammenhang zwischen der Häufigkeit der KAIA-Nutzung (Anzahl Sessions) und der Veränderung der Selbstwirksamkeitserwartung (Prä-Post-Differenz).

**H3 (explorativ, methodisch):**  
Die durch LLM-Analyse aus Gesprächstranskripten abgeleiteten Indikatoren für Handlungskontrolle und Problemlösezuversicht konvergieren über die Studienlaufzeit mit den GSE-Selbstaussagen der Teilnehmenden.

*Hinweis: Aufgrund der kleinen Stichprobe (N ≈ 20) haben alle Hypothesen explorativen Charakter. Statistische Signifikanztests werden als ergänzend, nicht als primäres Erkenntnisziel betrachtet.*

---

## 4. Studiendesign

**Methodologischer Rahmen:** Design Science Research (Hevner et al., 2004) — iterative Entwicklung und Evaluation eines KI-Artefakts im wissenschaftlichen Kontext.

**Empirisches Design:** Einfaktorielle Prä-Post-Untersuchung ohne Kontrollgruppe (Pilotstudie). Die fehlende Kontrollgruppe ist begründet durch die explorative Natur und die kleine Stichprobe; konfirmatorische Aussagen sind explizit nicht beabsichtigt.

**Messinstrument:** Skala zur Allgemeinen Selbstwirksamkeitserwartung (GSE, Schwarzer & Jerusalem, 1995) — 10 Items, 4-stufige Likert-Skala (1 = stimmt nicht, 4 = stimmt genau), validiertes deutsches Instrument mit guten psychometrischen Gütekriterien (Cronbachs α > .80 in zahlreichen Studien).

**Analysemethoden:**  
- Deskriptive Statistik (Mittelwerte, Standardabweichungen, Verteilung)
- Wilcoxon-Vorzeichenrangtest für Prä-Post-Vergleich (bei N < 30 nonparametrisch)
- Korrelation Nutzungshäufigkeit × GSE-Differenz (Spearman-Rho)
- Qualitative Inhaltsanalyse ausgewählter Gesprächstranskripte
- Explorative LLM-Analyse (strukturierte Extraktion psychologischer Indikatoren)

---

## 5. Stichprobe

**Zielgröße:** N = 32 auswertbare Datensätze · Rekrutierungsziel: ~46 Personen

**Power-Analyse** (berechnet mit R, Paket `pwr` v1.3, Skript: `docs/power_analyse.R`):

| Parameter | Wert |
|---|---|
| Test | Wilcoxon-Vorzeichenrangtest, einstichprobenartig |
| Signifikanzniveau α | 0.05 (zweiseitig) |
| Erwartete Effektgröße | d = 0.5 (mittel; Cohen, 1988) |
| Minimales N für 80% Power | 32 (ARE-korrigiert) |
| Ziel-N | **32** |
| Power bei N=32 | **80.0%** |
| Dropout-Puffer | 30% → Rekrutierungsziel ~46 |
| Fallback bei N=20 | 56.5% Power (dokumentierte Limitation) |

**Begründung:** N=32 ist das Minimum für 80% Teststärke bei einem mittleren Effekt (d=0.5). Mit einem konservativen Dropout-Puffer von 30% (typisch für unvergütete Pilotstudien) ist ein Rekrutierungsziel von ~46 Personen erforderlich. Rekrutierung über das persönliche Netzwerk der Forscherin. Falls nur N=20 erreichbar sind, wird dies als Limitation deklariert und die Power (56.5%) explizit berichtet.

**Einschlusskriterien:**
- Volljährig (≥ 18 Jahre)
- Deutschsprachig (Muttersprache oder vergleichbare Kompetenz)
- Zugang zu einem Computer oder Tablet mit Internetverbindung
- Aktuelle Lernsituation (Studium, Weiterbildung, berufliches Lernen)
- Schriftliche informierte Einwilligung vor Studienstart

**Ausschlusskriterien:**
- Aktuelle oder anamnestische psychiatrische Diagnose (Selbstauskunft)
- Aktuelle psychotherapeutische Behandlung wegen einer Krise
- Keine hinreichende Schreib- und Lesefähigkeit auf Deutsch

**Rekrutierung:** Persönliches Netzwerk der Forscherin. Potenzielle Teilnehmende werden durch direkte Ansprache und Weiterleitungen rekrutiert. Die Forscherin-Teilnehmenden-Beziehung wird in der Thesis dokumentiert (Positionality Statement).

---

## 6. Ablauf der Studie

```
Woche 0   Registrierung, Einwilligung, KI-Disclosure, GSE Prä-Messung
Wochen 1–4  Freie KAIA-Nutzung (Empfehlung: ≥ 3 Sessions)
Woche 4/5  GSE Post-Messung, optionaler kurzer Erfahrungsbericht
Nach Ende  Datenlöschung nach 6 Monaten (automatisch)
```

**Mindestvorgabe:** Mindestens 3 Chat-Sessions innerhalb der 4 Wochen für Einschluss in die Auswertung.

**Keine Vorgaben** für Gesprächsthemen — die Teilnehmenden wählen selbst, womit sie KAIA nutzen. Das entspricht dem explorativen Charakter der Studie.

---

## 7. Technische Maßnahmen und Datenschutz

**Hosting:** Hetzner CX23, Helsinki, Finnland (EU) — DSGVO-konform, kein Datentransfer in Drittländer für Hostingdaten.

**LLM-Anbieter:** Anthropic (Claude), OpenAI (GPT-4o), Mistral AI. Data Processing Agreements werden vor Studienstart abgeschlossen. Chat-Inhalte werden an die jeweiligen APIs übermittelt; Anthropic und OpenAI sind US-Anbieter (Rechtsgrundlage: SCCs, Art. 46 DSGVO).

**Pseudonymisierung:** Teilnehmende werden ausschließlich über interne Benutzer-IDs identifiziert. Namen sind in keinem Analysedokument enthalten.

**Authentifizierung:** JWT-Token (Access 15min, Refresh 30 Tage), bcrypt-12 für Passwörter.

**Löschfrist:** 6 Monate nach Studienabschluss — automatisiert.

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
| Pre-Registration OSF.io | Bis 12.07.2026 (vor Datensicht) |
| DPAs Anthropic/OpenAI/Mistral abgeschlossen | Bis 12.07.2026 |
| Study-Lock aktivieren | 12.07.2026 |
| **Pilotstudie START** | **15. Juli 2026** |
| Pilotstudie ENDE (4 Wochen) | 15. August 2026 |
| Post-Messung + Interviews | 15.–31. August 2026 |
| Auswertung (Kap. 5 + 6) | September 2026 |
| Thesis-Abgabe | **01. Oktober 2026** |

---

*Dieses Studienprotokoll kann bis zur Ethikvotum-Einreichung aktualisiert werden. Änderungen nach Beginn der Datenerhebung sind nur mit Zustimmung des Ethikkomitees möglich.*
