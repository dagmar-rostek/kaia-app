# Kapitel 4 — Technische Implementierung

> **Stand:** 10. Juni 2026 · **Version:** 0.3-DRAFT  
> **Reviewer:** Architect · Security · MLOps  
> **Geplanter Umfang:** ca. 18–22 Seiten (~4.500–5.500 Wörter)  
> **Status:** Architektur-Abschnitte vorhanden; Chat/LLM/Eval-Abschnitte folgen mit Implementierung (Juli 2026)

---

## Überblick

Kapitel 4 dokumentiert die technische Umsetzung des konzeptionellen Rahmenwerks (Kapitel 3) als funktionsfähige Webanwendung. Die Beschreibung folgt dem Vier-Schichten-Modell von KAIA: Eingabe → LLM-Verarbeitung → Gedächtnis → Datenhaltung.

---

## 4.1 Architekturentscheidungen und Methodik

### 4.1.1 Design Science Research als Entwicklungsparadigma

Die Entwicklung von KAIA folgt dem iterativen Design-Evaluate-Revise-Zyklus nach Hevner et al. (2004). Jede Architekturentscheidung wird vor dem Hintergrund der Anforderungen aus Kapitel 3 begründet. Kompromisse zwischen wissenschaftlichen, technischen und datenschutzrechtlichen Anforderungen werden explizit dokumentiert.

### 4.1.2 Tech-Stack und Begründung

| Komponente | Technologie | Begründung |
|---|---|---|
| Backend | FastAPI 0.115+ / Python 3.12 | Async-native, OpenAPI-kompatibel, lightweight |
| Frontend | Next.js 14 App Router / TypeScript | Server Components für DSGVO-konformes Rendering |
| Datenbank | PostgreSQL 16 + pgvector | EU-Standard, Row-Level-Security, semantische Suche |
| Auth | Custom JWT (PyJWT) + bcrypt-12 | Keine Drittanbieter-Abhängigkeit, volle Kontrolle |
| Hosting | Hetzner CX23 Helsinki | EU-Serverstandort, DSGVO-konform, Schrems-II-unproblematisch |
| LLM-Provider | Anthropic / OpenAI / Mistral | Evaluation aller drei; Mistral als EU-Option |

**Warum kein Managed Auth (Auth0, Supabase)?** Die Studie erfordert vollständige Kontrolle über alle Datenpfade. Drittanbieter für Auth würden unkontrollierte Datentransfers in die USA erzeugen.

---

## 4.2 Authentifizierung und Benutzerverwaltung

### 4.2.1 JWT-Architektur

*[Bereits implementiert — Stand: Mai/Juni 2026]*

KAIA verwendet ein zweistufiges Token-System:
- **Access Token** (15 Minuten, Bearer): Stateloser Zugriff auf API-Endpunkte
- **Refresh Token** (30 Tage, httpOnly-Cookie): Token-Rotation mit Family-basierter Reuse-Detection

Die Refresh-Token-Rotation folgt RFC 6749: Ein verwendetes Token wird sofort revoziert. Bei erkannter Wiederverwendung (Token-Theft-Indikator) wird die gesamte Token-Familie gesperrt. Passwörter werden mit bcrypt (12 Runden) gehasht; Brute-Force-Schutz ab 5 Fehlversuchen (15-Minuten-Kontosperre).

### 4.2.2 User-Approval-Flow als Studienkontrolle

Neue Konten starten mit Status `PENDING`. Der Zugang zur Anwendung wird erst nach expliziter Admin-Freigabe erteilt. Dieser Flow dient nicht primär der Kostenkontrolle, sondern der Studienkontrolle: Nur überprüfte Teilnehmende der Pilotstudie erhalten Zugang — eine Voraussetzung für das Ethikvotum der SRH.

---

## 4.3 Ethische Schutzmaßnahmen in der Implementierung

### 4.3.1 Crisis-Detection Pre-Filter

*[Implementiert: Juni 2026, Commit b89d594]*

Jede Texteingabe wird vor der LLM-Verarbeitung durch einen deterministischen Keyword-Filter geprüft. Der Filter enthält 20+ deutsche Regex-Muster für Suizidgedanken, Selbstverletzung und akute Hoffnungslosigkeit. Bei Treffer:
- Die Eingabe wird **nicht** an das LLM weitergeleitet
- Eine statische Antwort mit Krisenressourcen wird zurückgegeben (Telefonseelsorge 0800 111 0 111, Notruf 112)
- Der Vorfall wird ohne Inhalt protokolliert (Timestamp, pseudonymisierte User-ID)

Die Implementierung folgt dem Prinzip der deterministischen Sicherheit: Für Safety-kritische Entscheidungen werden keine LLMs eingesetzt.

### 4.3.2 KI-Disclosure-Gate

Vor der ersten Nutzung bestätigen alle Teilnehmenden explizit, dass KAIA eine KI ist (computational empathy, kein Mensch). Die Bestätigung wird mit Timestamp in der Datenbank gespeichert (`ki_disclosure_seen_at`). Ohne diese Bestätigung ist kein Chat-Zugriff möglich.

---

## 4.4 Chat-Interface und LLM-Integration

*[Geplant: Juli 2026 — wird ergänzt nach Implementierung]*

### 4.4.1 SSE-Streaming-Architektur

*Platzhalter — folgt nach Implementierung*

### 4.4.2 LLM-Abstraktionsschicht

*Platzhalter — gemeinsames Interface für Claude, GPT-4o, Mistral*

Versionierte Model-IDs (Pflicht):
- Claude: `claude-sonnet-4-6` (niemals generisch `claude`)
- GPT-4o: `gpt-4o-2024-08-06`
- Mistral: `mistral-large-latest` (mit versioniertem Datum-Tag)

---

## 4.5 Datenmodell und DSGVO-Implementierung

*[Geplant: Juli 2026 — DB-Schema nach Alembic-Migration]*

### 4.5.1 Kernentitäten

Haupttabellen: `users`, `sessions`, `messages`, `gse_results`, `consent_logs`

### 4.5.2 Row-Level-Security

pgvector-Zugriffe sind an `user_id` gebunden. Kein direkter Tabellenzugriff ohne Benutzerkontext — kein Cross-User-Leak.

### 4.5.3 DSGVO-Rechte als Self-Service

| Recht | Implementierung |
|---|---|
| Art. 15 (Auskunft) | GET /users/me/export → JSON |
| Art. 17 (Löschung) | DELETE /users/me → Soft-Delete + Anonymisierung |
| Art. 20 (Portabilität) | GET /users/me/export → maschinenlesbares JSON |
| Art. 7 (3) (Widerruf) | PATCH /users/me/consent |

---

## 4.6 Observability und Monitoring

*[Bereits implementiert — Stand: Juni 2026]*

- **Sentry**: Frontend (instrumentation-client.ts) + Backend (sentry-sdk[fastapi])
- **Slack-Webhooks**: Neue Registrierungen, Freigaben, Fehler-Eskalation
- **structlog**: Strukturiertes JSON-Logging im Backend
- **Study-Lock**: Bei `STUDY_MODE=locked` blockiert CI Prompt- und Schema-Änderungen

---

## 4.7 Iterative Prompt-Entwicklung als Forschungsmethodik

### 4.7.1 Das Problem des "guten" Prompts

Ein zentrales methodisches Problem bei der Entwicklung LLM-basierter Systeme ist die fehlende formale Spezifikation für "guten" Output: Es gibt keine allgemeine mathematische Funktion, die misst, ob ein sokratisch-empathischer Lernbegleiter seinen Auftrag erfüllt. Die Güte eines Systemprompts ist kontextabhängig, nutzerspezifisch und lässt sich nicht vollständig vor der Nutzung evaluieren. Dies stellt einen fundamentalen Unterschied zu klassischer Software-Entwicklung dar, in der Korrektheit durch Tests formal verifizierbar ist.

Die Entwicklung des KAIA-Systemprompts folgt daher einem **iterativen Feldforschungs-Ansatz**: Die Forscherin interagiert selbst mit dem System, beobachtet das Verhalten, formuliert Hypothesen über Prompt-Schwächen und Verbesserungen, und revidiert den Prompt — in direkter Anlehnung an den Design-Evaluate-Revise-Zyklus von Hevner et al. (2004).

### 4.7.2 Technische Infrastruktur für Prompt-Iteration

Um diesen Prozess methodisch zu unterstützen, wurde eine eigene Sandbox-Umgebung implementiert (`/admin/prompts`). Diese ermöglicht:

1. **Drei-Charakter-Vergleich**: Derselbe Nutzer-Input wird gleichzeitig an drei Prompt-Varianten mit unterschiedlichem Charakterprofil (warm/herausfordernd/unberechenbar) gesendet. Die parallele Darstellung der Antworten macht Stärken und Schwächen des Prompts unmittelbar sichtbar.

2. **Live-Editing**: Der Systemprompt ist direkt im Interface editierbar. Änderungen wirken sofort auf die nächste Antwort — kein Re-Deployment notwendig.

3. **Versionierung in der Datenbank**: Jede Prompt-Version wird mit Timestamp, Versionsnummer und Begründung gespeichert. Damit ist die Entwicklungshistorie des Prompts Teil der wissenschaftlichen Dokumentation — reproduzierbar und auditierbar.

4. **Study-Lock**: Ab `STUDY_MODE=locked` sind keine Prompt-Änderungen mehr möglich. Dieser Mechanismus sichert die Reproduzierbarkeit der Studienbedingungen und verhindert unbewusste Eingriffe der Forscherin nach Beginn der Datenerhebung.

### 4.7.3 Kriterien für Prompt-Güte

Die Evaluation des Prompts erfolgt entlang vier operationalisierbarer Kriterien:

| Kriterium | Operationalisierung |
|---|---|
| **Sokratische Integrität** | Gibt der Agent in >90% der Antworten keine direkte Antwort? Verwendet er alle drei Fragetypen (Klärung/Hypothetisch/Widerspruch)? |
| **Sentiment-Responsivität** | Wechselt der Agent den Modus erkennbar wenn Überforderungs-Signale auftreten? |
| **Charakterkonsistenz** | Bleibt der gewählte Charakter über eine Session stabil (gemessen durch Lexik und Tonalität)? |
| **Outcome-Orientierung** | Bezieht der Agent seine Fragen erkennbar auf das formulierte Lernziel des Nutzers? |

Diese Kriterien werden sowohl in den eigenen Testsessions der Forscherin als auch — in formalisierter Form — im LLM-Evaluationsbericht (Kapitel 5) angewendet.

### 4.7.4 Der Entwicklungsprozess als Forschungsbeitrag

Die iterative Prompt-Entwicklung ist nicht nur ein technischer Prozess, sondern ein methodischer Beitrag in eigener Sache: Sie dokumentiert, *wie* ein empathischer, neuroadaptiver Systemprompt entsteht. Jede Iteration — jeder Test, jede Reformulierung, jede Beobachtung — ist Teil des DSR-Artefakts. Die Prompt-Versionsdatenbank ist insofern nicht nur technische Infrastruktur, sondern Forschungsdokumentation.

Dieser Ansatz hat eine bekannte Limitation: Die Forscherin ist gleichzeitig Entwicklerin und erste Testnutzerin. Das Risiko des Confirmation Bias — unbewusste Optimierung auf die eigene Kommunikationsweise — wird im Methodenkapitel (Kapitel 6) adressiert und durch die Vielfalt der Studienteilnehmenden im Feldtest empirisch geprüft.

---

## 4.8 Cross-Session-Memory: Wissensart-Routing

*[Konzipiert: Juni 2026 — Implementierung folgt Juli 2026]*

### 4.8.1 Motivation und wissenschaftliche Grundlage

KAIAs Gedächtnisarchitektur (vgl. Kapitel 3) sieht vor, dass relevante Erkenntnisse einer Session in die nächste übertragen werden. Die Qualität dieser Übergabe hängt jedoch nicht allein vom Inhalt ab, sondern von der *Art des Wissens*: Die Frage, ob ein Lernender noch unsicher über einen Begriff ist (konzeptuelles Wissen), ob er einen Prozess nicht beherrscht (prozedurales Wissen) oder ob er Schwierigkeiten hat, sein eigenes Lernen zu steuern (metakognitives Wissen), erfordert unterschiedliche sokratische Interventionen. Eine undifferenzierte Übergabe — "Thema X wurde besprochen" — läuft Gefahr, den didaktischen Anschluss zu verfehlen.

Die Klassifikation stützt sich auf die überarbeitete Bloom'sche Taxonomie nach Anderson und Krathwohl (2001), die vier Wissensarten unterscheidet: faktisches Wissen (Terminologie, Fakten), konzeptuelles Wissen (Kategorien, Prinzipien, Theorien), prozedurales Wissen (Methoden, Algorithmen, Techniken) und metakognitives Wissen (Strategien, Selbstreflexion, Kontextwissen über das eigene Lernen). KAIA setzt diese Taxonomie nicht als diagnostisches Instrument ein, sondern als heuristische Routing-Grundlage: Die klassifizierte Wissensart informiert den Folgeprompt, nicht eine Score-basierte Bewertung des Lernenden.

### 4.8.2 Erweiterung des session_summary-Schemas

Das bestehende `session_summary`-JSON-Objekt, das am Sitzungsende durch das Haiku-Modell (`claude-haiku-4-5-20251001`) extrahiert wird, wird um vier Felder erweitert:

```json
{
  "first_step": "...",
  "observation": "...",
  "insight_for_next_session": "...",
  "mood": "...",
  "topics": ["..."],
  "strengths_observed": "...",
  "friction_points": "...",
  "knowledge_type": "konzeptuell|prozedural|metakognitiv|faktisch|unklar",
  "current_phase": 1,
  "routing_confidence": "low|high",
  "transfer_markers": ["Muss ich weiterdenken (Session 4, Thema X)"]
}
```

**`knowledge_type`** klassifiziert die dominante Wissensart der vergangenen Session nach Anderson und Krathwohl (2001). Der Wert `"unklar"` ist bewusst vorgesehen und signalisiert, dass das Modell keine zuverlässige Einschätzung treffen konnte — etwa bei stark gemischten Inhalten oder sehr kurzen Sessions.

**`current_phase`** bildet den Fortschritt innerhalb der Sessionstruktur (Phase 1–7) ab und ermöglicht dem Folgeprompt, nahtlos anzuknüpfen, ohne die abgeschlossene Phase zu wiederholen.

**`routing_confidence`** bewertet die Verlässlichkeit der Wissensart-Klassifikation. Das Feld nimmt die Werte `"low"` oder `"high"` an. Der Default für alle Sessions bis einschließlich Session 2 ist `"low"`.

**`transfer_markers`** ist ein String-Array, das explizit vom Nutzer oder implizit durch KAIA markierte Denkaufgaben für die Folgesession enthält. Die Semantik entspricht dem Konzept der "Brücken" in Gagné's 9. Unterrichtsereignis (Transfer-Vorbereitung; Gagné, 1985).

### 4.8.3 Routing-Confidence-Logik und Lock-in-Prävention

Die Entscheidung, `routing_confidence` für frühe Sessions auf `"low"` zu setzen, adressiert ein systemisches Risiko: Das Haiku-Modell klassifiziert auf Basis von zwei bis drei Turns oft unzuverlässig. Würde ein `"high"`-Signal schon nach der ersten Session erzeugt, könnte der Systemprompt der Folgesession auf eine falsch klassifizierte Wissensart ausgerichtet werden — ein didaktischer Lock-in, der den tatsächlichen Bedarf des Lernenden verdeckt.

Der Mechanismus ist bewusst konservativ: `"high"` setzt voraus, dass die Wissensart über mehrere Turns hinweg konsistent bestätigt wurde. Die konkrete Schwelle wird im Haiku-Extraktor-Prompt festgelegt und im Rahmen der LLM-Evaluation (Kapitel 5) empirisch überprüft.

### 4.8.4 PromptContext-Erweiterung

Der `PromptContext`-Dataclass in `domains/prompts/service.py` wird um drei Felder erweitert, die beim Aufbau des Systemprompts für eine neue Session befüllt werden:

```python
@dataclass
class PromptContext:
    # ... bestehende Felder ...
    knowledge_type: str = ""
    current_phase: int = 0
    routing_confidence: str = ""
```

Diese Felder werden aus dem `session_summary`-JSON der letzten abgeschlossenen Session des Nutzers gelesen. Bei der ersten Session eines Nutzers bleiben alle drei Felder leer; das Jinja2-Template behandelt diesen Fall durch eine `is_first_session`-Bedingung.

### 4.8.5 Jinja2-Template-Erweiterung

Der Routing-Kontext wird als separater XML-Block in den Systemprompt injiziert. XML-Tags werden gegenüber Freitext bevorzugt, da sie dem Modell klare semantische Grenzen signalisieren (Anthropic, 2024):

```jinja2
{% if not is_first_session and knowledge_type %}
<routing_context>
  Wissensart aus vorheriger Session: {{ knowledge_type }}
  Letzte Phase: {{ current_phase }}
  {% if routing_confidence == "low" %}
  Hinweis: Routing-Vertrauen niedrig — prüfe in der ersten Arbeitsphase,
  ob diese Klassifikation der aktuellen Situation entspricht.
  {% endif %}
</routing_context>
{% endif %}
```

Das Template ist im Sinne der Studienkontrolle versioniert in der Datenbank gespeichert und unterliegt dem Study-Lock-Mechanismus (vgl. Abschnitt 4.6).

### 4.8.6 Erweiterung des Haiku-Extraktors

Der Extraktorprompt für `claude-haiku-4-5-20251001` wird um zwei Ausgabefelder erweitert. Beide Felder sind Pflichtfelder in der JSON-Response:

- **`knowledge_type`**: Dominante Wissensart nach Anderson und Krathwohl (2001). Erlaubte Werte: `konzeptuell`, `prozedural`, `metakognitiv`, `faktisch`, `unklar`. Der Extraktor wählt `"unklar"`, wenn keine Wissensart deutlich überwiegt oder die Datenlage zu dünn ist.
- **`routing_confidence`**: `"low"`, wenn die Wissensart noch nicht über mehrere Turns konsistent bestätigt wurde; `"high"` andernfalls. Explizite Default-Instruktion: bei Sessions mit weniger als fünf Turns immer `"low"`.

### 4.8.7 Thinking-Block-Erweiterung

Der Extended-Thinking-Block von `claude-sonnet-4-6` (vgl. Abschnitt 4.4) wird um zwei Reasoning-Checks erweitert:

**Check 9 — Wissensart-Klassifikation:** Welche der vier Wissensarten nach Anderson und Krathwohl (2001) dominiert im bisherigen Gesprächsverlauf? Gibt es Hinweise auf Mischformen? Wie hoch ist die Unsicherheit dieser Einschätzung?

**Check 10 — Routing-Konsistenz:** Passt die nächste Frage zur bekannten Wissensart und zum `routing_confidence`-Wert? Bei `"low"` sollte der nächste Gesprächszug primär der Verifikation der Wissensart dienen, nicht bereits einer wissensartspezifischen Vertiefung.

Diese Checks werden nicht für das Nutzer-Interface sichtbar — der Thinking-Block wird serverseitig gestripped, bevor die Antwort gestreamt wird.

---

## 4.9 Session-Closing-Endpoint

*[Konzipiert: Juni 2026 — Implementierung folgt Juli 2026]*

### 4.9.1 Didaktische Motivation

Das 9. Unterrichtsereignis in Gagné's Theorie der Instruktionsdesigns — Retention und Transfer sichern — beschreibt die Notwendigkeit, am Ende einer Lerneinheit explizit Verbindungen zur Zukunft herzustellen (Gagné, 1985). Im Kontext eines KI-Lernbegleiters bedeutet dies: Die Session sollte nicht durch ein technisches Timeout oder ein schlichtes "Chat beendet"-Label enden, sondern durch eine didaktisch gestaltete Abschlussinteraktion.

KAIA generiert zu diesem Zweck eine *Closing-Bubble* — eine KAIA-initiierte, nicht nutzerseitig ausgelöste Nachricht, die die Session abschließt. Die Formulierung folgt dem Prinzip der elaborativen Interrogation (Pressley et al., 1987): KAIA stellt keine bewertende Zusammenfassung bereit, sondern eine abschließende Frage, die den Transfer aus der Session in den Alltag des Lernenden initiiert.

### 4.9.2 Endpunkt-Spezifikation

```
POST /api/v1/chat/sessions/{session_id}/closing
```

Der Endpunkt folgt dem Muster des bestehenden `/opening`-Endpunkts und gibt einen SSE-Stream zurück. Die wesentlichen Unterschiede:

- Es wird **keine User-Message gespeichert**. Der Aufruf ist ein unsichtbarer Trigger — das Frontend sendet die Anfrage, ohne dass eine Nutzeringabe vorliegt.
- KAIAs Closing-Bubble wird als reguläre `role: assistant`-Nachricht in der Datenbank gespeichert. Sie ist damit Teil der persistierten Session-Historie und fließt in das Cross-Session-Memory ein.
- Die Summary-Extraktion (`extract_session_summary()`) wird **nach** dem Closing-Exchange als Background Task ausgelöst — nicht nach dem `/end`-Aufruf. Der Abschlussaustausch selbst ist damit Teil des Kontexts, den der Haiku-Extraktor verarbeitet. Dies erhöht die Qualität der `transfer_markers`-Felder, da KAIA in der Closing-Bubble explizit Brücken zur Folgesession benennt.
- Der eigentliche `/end`-Aufruf schließt die Session in der Datenbank (Status-Änderung, Timestamp), ohne weitere LLM-Inferenz auszulösen.

### 4.9.3 Timeout-Handling

Verbleibt ein Nutzer nach dem Closing-Exchange länger als 10 Minuten ohne Interaktion, schließt das Frontend die Session automatisch durch einen `/end`-Aufruf. Dieses Timeout-Handling ist vollständig client-seitig implementiert und erfordert keine serverseitige Zustandsverwaltung. Die Entscheidung, das Timeout nicht serverseitig zu implementieren, vermeidet einen Polling-Mechanismus auf dem Server und hält die Backend-Architektur stateless.

---

## 4.10 In-Session-Feedback-API

*[Konzipiert: Juni 2026 — Implementierung folgt Juli 2026]*

### 4.10.1 Wissenschaftliche Grundlage

Die Messung von Erleben und Befinden während einer Aktivität — statt retrospektiv nach deren Abschluss — ist Kernprinzip der Experience Sampling Method (Csikszentmihalyi & Larson, 1987) und des Ecological Momentary Assessment (Shiffman, Stone, & Hufford, 2008). Beide Methoden zeigen, dass retrospektive Selbstberichte systematisch durch Rekonstruktionseffekte verzerrt werden: Gefühle wie Überforderung, Stocken oder ein plötzliches Verständnis ("Aha-Erlebnis") werden in der Rückschau geglättet und verlieren ihre diagnostische Präzision.

KAIA implementiert daher eine minimale In-Session-Feedback-Schnittstelle, die es Nutzenden erlaubt, solche Momente unmittelbar zu markieren. Die Reduktion auf wenige, klar definierte Feedback-Typen folgt dem Prinzip des Affect Labeling (Lieberman et al., 2007): Das bewusste Benennen eines Zustands kann selbst regulierend wirken — ein potentiell therapeutischer Nebeneffekt, der im vorliegenden Kontext nicht aktiv angestrebt, aber auch nicht ausgeschlossen wird und in der Studie beobachtet werden soll.

### 4.10.2 Datenbankschema

```sql
CREATE TABLE session_feedback (
    id          SERIAL PRIMARY KEY,
    session_id  INTEGER NOT NULL REFERENCES chat_sessions(id),
    user_id     INTEGER NOT NULL REFERENCES users(id),
    feedback_type VARCHAR(20) NOT NULL
                CHECK (feedback_type IN (
                    'transfer_marker',
                    'engagement',
                    'stuck',
                    'unclear'
                )),
    message_id  INTEGER REFERENCES messages(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

`message_id` ist nullable: Feedback kann an eine konkrete Nachricht gebunden sein (z. B. "diese Frage war unklar") oder an den allgemeinen Sessionzustand (z. B. "ich komme gerade gut voran" = `engagement`).

**Semantik der Feedback-Typen:**

| Typ | Bedeutung | Wissenschaftliche Entsprechung |
|---|---|---|
| `transfer_marker` | "Das nehme ich mit" — Erkenntnis mit Transferpotenzial | Transfer-Intention (Gagné, 1985) |
| `engagement` | "Ich bin drin" — Flow-Signal | Flow-Indikator (Csikszentmihalyi, 1990) |
| `stuck` | "Ich komme nicht weiter" — Blockade-Signal | Cognitive Load Overload (Sweller, 1988) |
| `unclear` | "Ich verstehe nicht" — Verständnis-Lücke | Knowledge Gap (Anderson & Krathwohl, 2001) |

### 4.10.3 Endpunkt-Spezifikation

```
POST /api/v1/chat/sessions/{session_id}/feedback
```

Request-Body:
```json
{
  "feedback_type": "transfer_marker",
  "message_id": 42
}
```

`message_id` ist optional. Fehlender Wert wird als `null` persistiert.

### 4.10.4 Meta-Reaktion bei stuck und unclear

Eingehende Feedback-Signale vom Typ `stuck` und `unclear` lösen eine **KAIA-Meta-Reaktion** aus: KAIA generiert unmittelbar eine Klärungsfrage (Fragetyp 1 in der internen Klassifikation). Diese Reaktion folgt dem didaktischen Scaffolding-Prinzip (Wood, Bruner, & Ross, 1976): Das System erkennt ein Überforderungssignal und reagiert mit einer strukturierenden Intervention — nicht mit einer Antwort, sondern mit einer Frage, die den Lernenden dabei unterstützt, den Engpass selbst zu lokalisieren.

Wichtig: Diese Reaktion ist **kein Modus-Switch**. Der Adaptionsmechanismus (Hysterese-Logik) bleibt unberührt. Ein einzelner `stuck`-Klick bewirkt eine einmalige Klärungsfrage; er verändert nicht den Adaptionszustand der Session. Die Hysterese-Schwellen für tatsächliche Modus-Übergänge (vgl. Kapitel 3) bleiben unverändert. Damit wird verhindert, dass ein zufällig gesendetes Feedback-Signal das Systemverhalten nachhaltig verändert.

### 4.10.5 Aggregation in session_summary

Transfer-Marker aus `session_feedback` werden am Sitzungsende in das Feld `session_summary.transfer_markers[]` aggregiert. Der Haiku-Extraktor erhält diese Marker explizit als Kontext, sodass die Formulierungen in `insight_for_next_session` auf die tatsächlich markierten Momente Bezug nehmen können.

Die übrigen Feedback-Typen (`engagement`, `stuck`, `unclear`) werden nicht direkt in die Summary übernommen, stehen jedoch für die quantitative Auswertung im Rahmen der Pilotstudie zur Verfügung. Die Aggregation dieser Signale über alle Sessions eines Nutzers ermöglicht longitudinale Aussagen über Muster — z. B. ob bestimmte Themen oder Phasen systematisch mit `stuck`-Signalen assoziiert sind.

---

## Literaturverzeichnis (Kapitel 4)

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A taxonomy for learning, teaching, and assessing: A revision of Bloom's taxonomy of educational objectives*. Longman.

Anthropic. (2024). *Prompt engineering overview: Use XML tags to structure your prompts*. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.

Csikszentmihalyi, M., & Larson, R. (1987). Validity and reliability of the experience sampling method. *Journal of Nervous and Mental Disease, 175*(9), 526–536.

Gagné, R. M. (1985). *The conditions of learning and theory of instruction* (4. Aufl.). Holt, Rinehart & Winston.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Lieberman, M. D., Eisenberger, N. I., Crockett, M. J., Tom, S. M., Pfeifer, J. H., & Way, B. M. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity in response to affective stimuli. *Psychological Science, 18*(5), 421–428.

Pressley, M., McDaniel, M. A., Turnure, J. E., Wood, E., & Ahmad, M. (1987). Generation and precision of elaboration: Effects on intentional and incidental learning. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 13*(2), 291–300.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4*, 1–32.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.

*[Weitere Quellen werden bei Fertigstellung ergänzt: LLM-Paper, Streaming-Protokolle, bcrypt-Spezifikation, pgvector-Dokumentation]*
