# Kapitel 5 — LLM-Evaluationsbericht

> **Stand:** 04. Juni 2026 · **Version:** 0.2-DRAFT  
> **Reviewer:** AI Engineer · MLOps · Psychologe  
> **Geplanter Umfang:** ca. 12–15 Seiten (~3.000–3.750 Wörter)  
> **Status:** Methodik vollständig; Ergebnisse folgen nach Evaluation (geplant Juli 2026)

---

## Überblick

Kapitel 5 dokumentiert den systematischen Vergleich der drei LLM-Provider (Anthropic Claude, OpenAI GPT-4o, Mistral AI) hinsichtlich ihrer Eignung für KAIAs sokratischen Lernbegleitungskontext. Die Evaluation erfolgt VOR dem Studienstart, da die Modellwahl während der Datenerhebung fixiert sein muss (Study-Lock, Kapitel 4.6).

---

## 5.1 Evaluationsdesign

### 5.1.1 Begründung für systematische LLM-Evaluation

Die Wahl des Sprachmodells ist für KAIA keine technische Nebensache, sondern eine wissenschaftliche Entscheidung mit methodologischen Konsequenzen. Unterschiedliche Modelle zeigen unterschiedliche Verhaltensweisen in sokratischen Gesprächssituationen — Unterschiede, die den Verlauf und potenziell die Wirkung der Studie beeinflussen. Eine undokumentierte, willkürliche Modellwahl würde die Reproduzierbarkeit der Ergebnisse gefährden.

### 5.1.2 Evaluationsdimensionen

Die Evaluation erfasst vier Dimensionen:

| Dimension | Operationalisierung | Messung |
|---|---|---|
| **Kognitive Transferrichtung** | Löst die Antwort die nächste kognitive Operation beim Lernenden aus — oder ersetzt sie eine? (Kern-Kriterium) | Rater-Bewertung (0–4 Skala): 0=ersetzt, 4=eröffnet klar neue Operation |
| **Sokratische Qualität** | Übernimmt das Modell keine Synthesis die der Lernende selbst ziehen sollte? Hält es die Haltung "wer macht die kognitive Arbeit?" konsistent? Fragen sind das primäre Instrument, aber auch Analogien/Reframings die neues Denken eröffnen sind valide. | Rater-Bewertung (0–4 Skala) |
| **Empathische Responsivität** | Nimmt das Modell emotionale Signale auf und reagiert angemessen? | Rater-Bewertung (0–4 Skala) |
| **Konsistenz** | Behält das Modell den Gesprächskontext über mehrere Turns bei? Bleibt es im Charakter? | Automatisiertes Konsistenz-Scoring |
| **Datenschutzkonformität** | Extrahiert das Modell keine unaufgeforderten persönlichen Daten? Empfiehlt es keine Diagnosen? | Regelbasiertes Audit |

**Hinweis zum Kernkriterium:** Die Eval-Dimension "Kognitive Transferrichtung" ersetzt die frühere Operationalisierung "Stellt das Modell nur Fragen?" — die historisch ungenau und theoretisch zu eng war (vgl. Kapitel 3.1.1). Das neue Kriterium ist sprachform-agnostisch: Eine Analogie kann sokratischer sein als eine schlecht gestellte Frage.

### 5.1.3 Synthetische Testszenarien

Die Evaluation verwendet synthetische, standardisierte Gesprächsszenarien — keine echten Nutzerdaten. Dies gewährleistet kontrollierte Vergleichbarkeit und DSGVO-Konformität.

Szenarien umfassen:
1. **Lernblockade**: Studierende*r kämpft mit einem schwierigen Konzept → Bewertet sokratische Reaktion
2. **Erfolgsmoment**: Eigenständige Lösung eines Problems → Bewertet Verstärkung der Selbstwirksamkeit
3. **Emotionale Belastung**: Frustrationsausdrücke → Bewertet empathische Responsivität
4. **Grenztest**: Anfrage nach direkter Antwort → Bewertet Haltbarkeit der sokratischen Grundhaltung
5. **Crisis-Detection-Bypass-Test**: Krisenindikator in eingekleidetem Kontext → Prüft Robustheit des Pre-Filters

### 5.1.4 Ratingverfahren

*[Wird vor Studienstart spezifiziert]*

Zwei unabhängige Rater (Forscherin + geschulte Hilfskraft) bewerten alle Szenarien. Interrater-Reliabilität wird mit Cohen's Kappa berechnet. Bei κ < 0.60 wird Konsensverfahren eingesetzt.

---

## 5.2 Modellbeschreibungen

### 5.2.1 Anthropic Claude (claude-sonnet-4-6)

*[Stand-Info: Claude-Modelle sind auf hilfreiche, harmlose und ehrliche Antworten trainiert. Sicherheitsfeatures sind stark ausgeprägt.]*

### 5.2.2 OpenAI GPT-4o (gpt-4o-2024-08-06)

*[Stand-Info: GPT-4o ist multimodal, zeigt starke Sprachkompetenz, weitverbreitete Nutzung in Bildungskontexten.]*

### 5.2.3 Mistral AI (mistral-large-latest)

*[Stand-Info: EU-Anbieter (Paris), Datenschutz-Vorteil für Schrems-II, gute Mehrsprachigkeit.]*

---

## 5.3 Ergebnisse

*[Dieser Abschnitt wird nach Durchführung der Evaluation im Juli 2026 befüllt]*

### 5.3.1 Sokratische Qualität — Ergebnisse

*Platzhalter*

### 5.3.2 Empathische Responsivität — Ergebnisse

*Platzhalter*

### 5.3.3 Konsistenz — Ergebnisse

*Platzhalter*

### 5.3.4 Datenschutzkonformität — Ergebnisse

*Platzhalter*

---

## 5.4 Modellauswahl und Begründung

*[Wird nach Ergebnissen in 5.3 verfasst]*

Die Modellauswahl für die Pilotstudie wird auf Basis der Evaluationsergebnisse begründet und dokumentiert. Nach Festlegung wird die Model-ID für die gesamte Studienlaufzeit fixiert (Study-Lock, Kapitel 4.6).

---

## 5.5 Limitierungen der Evaluation

*[Wird nach Ergebnissen ergänzt]*

Bekannte Einschränkungen:
- Synthetische Szenarien sind kein Ersatz für echte Nutzungsdaten
- Modelle werden regelmäßig aktualisiert — Ergebnisse gelten für die geprüften Versionen
- Rater-Subjektivität trotz Schulung nicht vollständig eliminierbar
- Keine Bewertung von Langzeitkonsistenz über viele Sessions

---

## Literaturverzeichnis (Kapitel 5)

Anthropic. (2024). Claude: A next-generation AI assistant. Technisches Whitepaper. *Anthropic.*

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Kasneci, E., Seßler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., ... & Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences, 103*, 102274.

*[Weitere Quellen werden nach Durchführung der Evaluation ergänzt]*
