# KAIA Chat V2 — Feature-Spec

**Erstellt:** 2026-06-10
**Status:** Ready for Review
**Autor:** Product Owner (nach Team-Session mit Didaktiker, Psychologe, UX Designer, AI Engineer)
**Scope:** Zwei neue Chat-Features — Session-Abschluss mit Closure-Phase (STORY-001) + In-Session Feedback Buttons (STORY-002)

---

## Inhaltsverzeichnis

1. [STORY-001: Session-Abschluss mit Closure-Phase](#story-001)
2. [STORY-002: In-Session Feedback Buttons](#story-002)
3. [Backend Changes Summary](#backend-changes)
4. [Datenbankschema-Erweiterungen](#db-schema)
5. [Abhängigkeiten zwischen Stories](#dependencies)
6. [Offene Fragen](#open-questions)

---

## STORY-001: Session-Abschluss mit Closure-Phase {#story-001}

**Status:** Ready
**Priorität:** Must (Pre-Pilot — kein abrupter Session-Abbruch vor Studienstart akzeptabel)
**Geschätzter Aufwand:** L

### Wissenschaftliche Begründung

| Prinzip | Quelle | Implikation für KAIA |
|---|---|---|
| Retention and Transfer | Gagné (1985), 9. Unterrichtsereignis | Abschluss muss aktiv Retention fördern, nicht nur beenden |
| Peak-End Rule | Kahneman et al. (1993) | Das Ende der Session prägt die Erinnerung überproportional — schlechtes Ende = schlechte Session-Bewertung rückwirkend |
| Elaborative Encoding | Tulving (1983) | Aktive Verarbeitung am Ende vertieft Konsolidierung |
| Sokratisches Prinzip | KAIA-Designprinzip | Keine Bewertungen, keine Pflichtaussagen — nur elaborative Interrogation |

**Formulierungsregel (nicht verhandelbar):** KAIAs Closing-Frage enthält keine Bewertungen ("Das war toll"), keine Pflichtaussagen ("Du solltest..."), keine Zusammenfassungen die Deutungshoheit übernehmen. Erlaubt: "Gibt es etwas, das du heute mitnehmen möchtest?" oder "Was bleibt gerade bei dir hängen?"

---

### User Story

Als lernende Person möchte ich eine Session mit einem kurzen, respektvollen Abschluss beenden, damit das Gespräch nicht abrupt endet und ich die Möglichkeit bekomme, einen eigenen Gedanken mitzunehmen — oder sofort zu gehen, wenn ich es so möchte.

---

### Akzeptanzkriterien

**AC-001: Closure-Flow wird ausgelöst**

```
Given  ich befinde mich in einer aktiven Chat-Session
When   ich auf "Session beenden" klicke
Then   erscheint KEIN Modal/Dialog
And    KAIA generiert eine Abschluss-Bubble via POST /sessions/{id}/closing (SSE)
And    die Bubble wird als normale letzte Chat-Nachricht in der bestehenden Nachrichtenliste gerendert
And    unterhalb der Bubble erscheinen zwei Aktionen:
         - primär: [Antworten] — volle Breite auf Mobile, Standardbutton auf Desktop
         - sekundär: [Jetzt wirklich beenden] — Ghost-Link/Text-Button, keine visuelle Dominanz
```

**AC-002: Mobile Layout der Closing-Aktionen**

```
Given  ich nutze ein Gerät mit Viewport-Breite < 768px
When   die Closing-Bubble erscheint
Then   sind [Antworten] und [Jetzt wirklich beenden] vertikal gestackt
And    [Antworten] nimmt die volle verfügbare Breite ein
And    [Jetzt wirklich beenden] ist als Ghost-Link darunter platziert
And    beide Touch-Targets sind mindestens 44px hoch (WCAG 2.2 AA)
```

**AC-003: Exchange-Limit — max. 2 Exchanges nach Closing**

```
Given  KAIA hat die Closing-Bubble generiert
When   der User auf [Antworten] klickt und eine Nachricht schickt
Then   antwortet KAIA einmal (das ist Exchange 1)
And    erneut antworten → KAIA antwortet ein letztes Mal (Exchange 2)
And    nach Exchange 2 erscheinen die Closing-Aktionen erneut
And    ein 3. Antworten-Versuch ist nicht mehr möglich (Input disabled oder Hinweis)
And    das Exchange-Limit ist Backend-seitig enforced (nicht nur UI)
```

**AC-004: Sofortiges Beenden ohne Einschränkung**

```
Given  die Closing-Bubble ist sichtbar
When   der User auf [Jetzt wirklich beenden] klickt
Then   wird POST /sessions/{id}/end aufgerufen
And    die Session erhält ended_at
And   extract_session_summary() läuft als Background-Task (NACH dem Closing, nicht davor)
And    der User wird zur Session-Übersicht oder einer Danke-Seite weitergeleitet
And    es gibt KEINEN "Bist du sicher?"-Dialog (Autonomie)
```

**AC-005: Inaktivitäts-Timeout nach Closing**

```
Given  KAIA hat die Closing-Bubble generiert
And    der User hat 10 Minuten lang keine Aktion ausgeführt
When   der Timeout abläuft (Frontend-Timer)
Then   erscheint eine sichtbare Notification innerhalb des Chat-Containers (kein Toast außerhalb):
         "Session nach 10 Minuten Inaktivität automatisch beendet."
And    POST /sessions/{id}/end wird automatisch aufgerufen
And    der Session-State ist danach ended_at gesetzt
And    die Notification ist als aria-live="assertive" markiert (Screen Reader)
```

**AC-006: Accessibility — Nachrichten-Container**

```
Given  der Chat-Container ist gerendert
Then   hat der Nachrichten-Container aria-live="polite"
And    neue Nachrichten werden von Screen Readern automatisch vorgelesen
And    die Closing-Aktionen sind per Tastatur erreichbar (Tab-Reihenfolge korrekt)
And    [Antworten] hat aria-label="Auf KAIAs Abschlussfrage antworten"
And    [Jetzt wirklich beenden] hat aria-label="Session jetzt beenden"
```

**AC-007: KEIN Early-Exit-Detector**

```
Given  die Session ist aktiv
When  der User irgendwann auf "Session beenden" klickt
Then  erscheint kein Zwischenschritt der prüft ob "genug" besprochen wurde
And   es erscheint keine Warnung wie "Du hast erst X Minuten gesprochen"
And   der Abschluss-Flow startet ohne Bewertung der Session-Länge
```

**AC-008: extract_session_summary() — Timing**

```
Given  der User hat [Jetzt wirklich beenden] geklickt
When  POST /sessions/{id}/end ausgeführt wird
Then  extract_session_summary() wird als FastAPI BackgroundTask gestartet
And   der Background-Task läuft NACH dem Closing-Exchange (nicht während)
And   der Response des /end-Endpoints wartet NICHT auf den Background-Task
And   bei Background-Task-Fehler wird session_summary als null belassen (kein Crash)
```

---

### Out of Scope

- Kein Modal, kein Overlay, kein Drawer für den Closing-Flow
- Kein Early-Exit-Detector der den User bewertet oder zurückhält
- Keine automatische Zusammenfassung der Session die KAIA in der Closing-Bubble präsentiert (Deutungshoheit bleibt beim User)
- Kein "Speichere diese Erkenntnis"-Button in der Closing-Phase (Post-Thesis-Feature)
- Keine E-Mail nach Session-Ende (separater Backlog-Punkt)

---

### Erfolgskennzahlen

| Metrik | Ziel | Messung |
|---|---|---|
| Closing-Flow-Completion-Rate | > 60% der beendeten Sessions durchlaufen die Closing-Phase (kein sofortiger Skip) | `session_feedback`-Event `closing_shown` vs. `closing_completed` |
| Exchange-Nutzung | > 30% der User machen mindestens 1 Exchange nach Closing-Bubble | `closing_exchanges_used` im `session_summary` |
| Timeout-Rate | < 15% der Sessions enden via Inaktivitäts-Timeout | `ended_via_timeout`-Flag in `chat_sessions` |
| Accessibility-Fehler | 0 WCAG 2.2 AA Violations im Closing-Bereich | axe-core-Scan im CI |

---

### Abhängigkeiten

- `POST /sessions/{id}/opening` existiert — Closing folgt dem gleichen Muster (SSE ohne User-Input)
- `extract_session_summary()` existiert als Background-Task — wird wiederverwendet, aber Timing ändert sich
- Neues `session_summary`-JSON-Schema (siehe Backend Changes)
- Neuer `closing_exchange_count`-Counter nötig: entweder in `chat_sessions` oder als Session-State im Frontend

---

### Offene Fragen

1. **Exchange-Counter-Position:** Soll `closing_exchange_count` in `chat_sessions` (persistiert) oder nur im Frontend-State (verloren bei Refresh) gehalten werden? Empfehlung: Backend-persistent, damit Reload den Counter nicht resettet.
2. **Closing-Prompt-Variante:** Braucht der Closing-Prompt eine eigene `prompt_versions`-Zeile (eigener Charakter-Modus `closing`) oder wird er als Parameter an den bestehenden Charakter-Modus übergeben? Entscheidung liegt bei AI-Engineer + Architect.
3. **Weiterleitung nach Session-Ende:** Zur Session-Übersicht (`/app`) oder zu einer dedizierten Danke/Auswertungsseite? Klärung mit UX-Designer.

---

## STORY-002: In-Session Feedback Buttons {#story-002}

**Status:** Ready
**Priorität:** Should (Pre-Pilot — wertvoll für Studie, aber kein Blocker wenn zeitkritisch)
**Geschätzter Aufwand:** M

### Wissenschaftliche Begründung

| Prinzip | Quelle | Implikation für KAIA |
|---|---|---|
| Ecological Momentary Assessment (EMA) | Shiffman et al. (2008) | In-the-moment Erfassung ist valider als retrospektive Erinnerung |
| Experience Sampling Method (ESM) | Csikszentmihalyi & Larson (1987) | Echtzeit-Signale aus der Lernperson heraus, keine externen Störungen |
| Affect Labeling | Lieberman et al. (2007) | Das Benennen eines Zustands ("Ich hänge gerade") reduziert affektiven Distress und fördert Regulation |
| Selbstregulations-Monitoring | Flavell (1979); Zimmermann (2000) | Metakognitive Aktivierung ist eine Kernkompetenz — Buttons sind externalisiertes Monitoring |

**Abgrenzung zu Gamification:** Diese Buttons sind Forschungsinstrumente und Selbstregulations-Scaffolds — keine Rewards. Keine Animationen, keine Punkte, keine "Gut gemacht"-Rückmeldungen.

---

### User Story

Als lernende Person möchte ich während einer Session jederzeit und ohne Unterbrechung signalisieren können, in welchem Zustand ich mich befinde, damit ich KAIA implizit informieren und gleichzeitig meine eigene Metakognition aktivieren kann — ohne dazu verpflichtet zu sein.

---

### Button-Set (final)

| Button-Label | Typ | Systemreaktion | Datenpunkt |
|---|---|---|---|
| "Muss ich weiterdenken" | Positiv / Transfer-Marker | Kein Systemeingriff | `transfer_markers[]` in `session_summary` |
| "Wow — das trifft was" | Positiv / Engagement-Signal | Kein Systemeingriff | `FeedbackType.WOW` in `session_feedback` |
| "Ich hänge gerade" | Negativ / Metakognitiv | KAIA stellt Meta-Frage (Typ: Klärung) | `FeedbackType.STUCK` in `session_feedback` |
| "Das verstehe ich noch nicht" | Negativ / Klärungsbedarf | KAIA stellt Klärungsfrage | `FeedbackType.UNCLEAR` in `session_feedback` |

---

### Akzeptanzkriterien

**AC-001: Buttons sind immer sichtbar, ohne Session zu unterbrechen**

```
Given  eine Chat-Session ist aktiv
Then   sind alle vier Feedback-Buttons während der gesamten Session sichtbar
And    die Buttons befinden sich außerhalb des Nachrichten-Scrollbereichs (fixiert oder sticky)
         ODER am unteren Rand oberhalb des Eingabefelds
And    ein Klick auf einen Button unterbricht NICHT den Texteingabe-Fokus
And    die Buttons sind per Tastatur erreichbar (Tab-Reihenfolge: zuerst Eingabefeld, dann Buttons)
```

**AC-002: Transfer-Marker wird gespeichert**

```
Given  KAIA hat gerade eine Antwort gesendet (message_id ist bekannt)
When   der User auf "Muss ich weiterdenken" klickt
Then   wird POST /sessions/{id}/feedback aufgerufen
         Body: { feedback_type: "transfer_marker", message_id: <letzter KAIA-message_id> }
And    der Eintrag in session_feedback wird angelegt
And    kein sichtbares Feedback außer einer kurzen visuellen Bestätigung (z.B. Button kurz aktiv-State)
And    KAIA reagiert NICHT mit einer Nachricht (kein Systemeingriff)
```

**AC-003: Positiv-Buttons — kein Gamification**

```
Given  der User hat "Wow — das trifft was" geklickt
Then   erscheint KEINE Animation (kein Confetti, kein Puls)
And    erscheint KEIN Text wie "Gut gemacht!" oder "Super!"
And    der Button erhält höchstens einen kurzen Pressed-State (< 300ms) als visuelles Feedback
And    KAIA sendet keine Antwort
And    der Datenpunkt wird in session_feedback gespeichert
```

**AC-004: Negativer Button löst KAIA-Meta-Frage aus**

```
Given  der User klickt auf "Ich hänge gerade"
When  POST /sessions/{id}/feedback mit feedback_type="stuck" erfolgreich war
Then   löst das Backend automatisch eine KAIA-Meta-Frage aus (Fragetyp: Klärung)
         Beispiel: "Was hängt gerade bei dir?"
And    diese Meta-Frage erscheint als normale KAIA-Bubble im Chat-Verlauf (SSE)
And    es wird KEIN Modus-Switch ausgelöst (Hysterese-Logik bleibt intakt)
And    ein einzelner Klick reicht NICHT aus, um den Interaktionsmodus zu ändern
```

**AC-005: "Das verstehe ich noch nicht" löst Klärungsfrage aus**

```
Given  der User klickt auf "Das verstehe ich noch nicht"
When  POST /sessions/{id}/feedback mit feedback_type="unclear" erfolgreich war
Then   sendet KAIA eine Klärungsfrage (Fragetyp 1: Was genau ist unklar?)
And    die Klärungsfrage ist offen formuliert (kein Ratespiel, keine Multiple-Choice-Vorschläge)
And    kein Modus-Switch
```

**AC-006: Hysterese-Logik — kein Sofort-Modus-Switch**

```
Given  der User hat in den letzten 5 Minuten einmal "Ich hänge gerade" gedrückt
When   ein weiterer Klick auf "Ich hänge gerade" kommt
Then   wird erneut eine Meta-Frage gestellt
And    der Interaktionsmodus (InteractionMode in der DB) bleibt unverändert
And    eine Modus-Änderung erfordert weiterhin die bestehende Schwellenwert-Logik im Backend
```

**AC-007: Transfer-Marker als Cross-Session-Anker**

```
Given  der User hat in Session N "Muss ich weiterdenken" für eine KAIA-Antwort geklickt
And    extract_session_summary() hat für Session N die transfer_markers[] gefüllt
When   Session N+1 startet und KAIA die Opening-Message generiert
Then  können transfer_markers[] aus der Vorschau-Session über PromptContext.transfer_markers
       in den Jinja2-System-Prompt eingebettet werden
And    KAIA kann (optional) darauf Bezug nehmen: 
         "Du hast letzte Woche markiert, dass X dich beschäftigt — was ist daraus geworden?"
And    diese Referenz ist optional (KAIA entscheidet kontextabhängig ob sie passt)
```

**AC-008: Accessibility der Feedback-Buttons**

```
Given  die Feedback-Buttons sind gerendert
Then   hat jeder Button ein aria-label das die Funktion beschreibt
         z.B. aria-label="Markieren: Das möchte ich weiterdenken"
And    der Container hat role="group" mit aria-label="Lernzustand signalisieren"
And    die Buttons sind mit Tastatur (Tab + Enter/Space) bedienbar
And    der Pressed-State ist aria-pressed="true" für 300ms
```

---

### Out of Scope

- Keine Animationen, Punkte, Badges oder gamifizierte Belohnungen
- Kein obligatorisches Feedback-Ritual (Buttons können komplett ignoriert werden)
- Kein Modus-Switch als direkte Reaktion auf einen einzelnen Feedback-Klick
- Kein UI-Element das den Nutzer erinnert oder drängt, Buttons zu nutzen
- Auswertung der Feedback-Daten in der Studienauswertung: nur aggregierte Verwendungsrate, keine individuelle Bewertung ("User X nutzt Buttons nicht = Problem")
- Kein Vergleich von Feedback-Nutzung zwischen Studienteilnehmenden ohne explizite Einwilligung

---

### Erfolgskennzahlen

| Metrik | Ziel | Messung |
|---|---|---|
| Opt-in-Rate | > 40% der aktiven User nutzen mindestens einen Button pro Session | `session_feedback`-Einträge pro Session, distinct user |
| Transfer-Marker-Rate | > 20% der Sessions haben mindestens einen Transfer-Marker | `transfer_markers[]` nicht leer in `session_summary` |
| Meta-Frage-Akzeptanz | > 50% der Meta-Fragen nach "Ich hänge gerade" erhalten eine User-Antwort | Folge-Nachricht auf KAIA-Meta-Bubble vorhanden |
| Kein Modus-Switch durch Buttons | 0% der Feedback-Klicks lösen direkt einen `InteractionMode`-Wechsel aus | DB-Audit: `interaction_mode`-Änderungen niemals im selben TX wie ein `session_feedback`-Eintrag |

---

### Abhängigkeiten

- Neues DB-Model `SessionFeedback` (siehe Backend Changes)
- Neuer Endpoint `POST /sessions/{id}/feedback`
- `extract_session_summary()` muss `transfer_markers[]` aus `session_feedback`-Tabelle befüllen
- `PromptContext` muss `transfer_markers: list[str]` enthalten
- Jinja2-Template braucht optionalen `{% if transfer_markers %}`-Block

---

### Offene Fragen

1. **Button-Platzierung auf Desktop:** Seitlich neben dem Chat-Verlauf (Sidebar) oder unterhalb des Eingabefeldes? Abklärung mit UX-Designer. Empfehlung: unterhalb Eingabefeld, da Sidebar auf Mobile nicht skaliert.
2. **Meta-Frage-Generierung:** Generiert das Backend die Meta-Frage via LLM (Kontext-abhängig) oder ist sie statisch vordefiniert? Empfehlung: LLM-generiert mit kurzem dedicated Prompt — aber als Fallback statische Strings wenn LLM nicht erreichbar.
3. **Feedback-Button-Sichtbarkeit bei langen Sessions:** Sollen Buttons nach X Minuten ausgeblendet werden? Nein — sie sollen immer sichtbar sein (EMA-Prinzip: Messung zu beliebigem Zeitpunkt).
4. **Cross-Session-Anker in Opening:** Nur für Session 2+? Oder ab Session 5 (wenn ausreichend Transfer-Marker gesammelt wurden)? Klärung mit AI-Engineer.

---

## Backend Changes Summary {#backend-changes}

### 1. `session_summary` JSON-Schema — neue Felder

Das bestehende JSON-Schema in `extract_session_summary()` wird um vier neue Felder erweitert:

| Feld | Typ | Beschreibung |
|---|---|---|
| `transfer_markers` | `array[string]` | Texte der KAIA-Antworten auf die der User "Muss ich weiterdenken" geklickt hat (max. 5 Einträge) |
| `knowledge_type` | `string` | Wissensart die in der Session dominant war: `deklarativ` / `prozedural` / `metakognitiv` / `unklar` |
| `current_phase` | `int` | Didaktische Phase am Session-Ende: `1` (Exploration), `2` (Vertiefung), `3` (Transfer) |
| `routing_confidence` | `string` | Selbsteinschätzung des Extractors über die Qualität der Extraktion: `hoch` / `mittel` / `niedrig` |

**Rückwärtskompatibilität:** Bestehende `session_summary`-Einträge ohne neue Felder werden toleriert — `summary.get("transfer_markers", [])` in allen Consumers.

---

### 2. `PromptContext` Dataclass — neue Felder

Datei: `apps/api/app/domains/prompts/service.py`

Neue Felder in der `PromptContext`-Dataclass:

```python
knowledge_type: str = ""          # "deklarativ" | "prozedural" | "metakognitiv" | "unklar"
current_phase: int = 0            # 1 | 2 | 3 — didaktische Phase
routing_confidence: str = ""      # "hoch" | "mittel" | "niedrig"
transfer_markers: list[str] = field(default_factory=list)  # aus Vorschau-Session
```

`render_prompt()` muss die neuen Felder an `tmpl.render()` übergeben.

---

### 3. `extract_session_summary()` — Haiku-Prompt-Erweiterung

Datei: `apps/api/app/domains/chat/service.py`

Der `extraction_system`-Prompt wird um folgende Extraktions-Anweisungen erweitert:

```
- transfer_markers: Liste der KAIA-Antworten zu denen der User "Muss ich weiterdenken"
  geklickt hat — aus der session_feedback-Tabelle laden, NICHT aus dem Transkript ableiten
  (array of strings, max 5, leer wenn keine vorhanden)
- knowledge_type: Dominante Wissensart in dieser Session
  [deklarativ|prozedural|metakognitiv|unklar]
- current_phase: Didaktische Phase am Session-Ende [1|2|3]
  1=Exploration/Orientierung, 2=Vertiefung/Elaboration, 3=Transfer/Anwendung
- routing_confidence: Wie sicher ist die Extraktion dieser Phase-Einschätzung
  [hoch|mittel|niedrig]
```

Der Extractor muss vor dem LLM-Call die `session_feedback`-Tabelle nach `feedback_type='transfer_marker'` für diese Session abfragen und die zugehörigen KAIA-Antworten laden.

---

### 4. Jinja2-Template — neuer `routing_context`-Block

Neuer optionaler Block in allen Charakter-Templates:

```jinja2
{% if transfer_markers %}
<routing_context>
Aus der letzten Session hat der Lernende folgende Themen als "muss ich weiterdenken" markiert:
{% for marker in transfer_markers %}
- {{ marker }}
{% endfor %}
Beziehe dich ggf. organisch darauf — nur wenn es kontextuell passt.
</routing_context>
{% endif %}

{% if current_phase and routing_confidence != "niedrig" %}
<session_phase>
Aktuelle didaktische Phase: {{ current_phase }} ({{ routing_confidence }} Konfidenz)
</session_phase>
{% endif %}
```

---

### 5. Neuer Thinking-Block-Check 9 (Wissensart) + Check 10 (Routing-Konsistenz)

Im System-Prompt (Thinking-Instruktionen) wird KAIA angewiesen, zwei zusätzliche interne Checks durchzuführen:

| Check | Beschreibung |
|---|---|
| **Check 9 — Wissensart** | "Welche Art von Wissen steht gerade im Vordergrund? (deklarativ / prozedural / metakognitiv) — beeinflusst den Fragetyp" |
| **Check 10 — Routing-Konsistenz** | "Ist meine aktuelle Frage konsistent mit der erkannten didaktischen Phase? Wenn Phase=3 (Transfer) — stelle ich eine Transferfrage oder eine Wiederholungsfrage?" |

Diese Checks sind Teil des `<thinking>`-Blocks und werden vom Backend wie bestehende Checks behandelt (strip vor Ausgabe, `thinking_raw` für Audit-Trail).

---

### 6. Neuer Endpoint: `POST /api/v1/chat/sessions/{session_id}/closing`

**Pattern:** Analog zu `/opening` — kein User-Input, KAIA generiert eine Bubble.

```
POST /api/v1/chat/sessions/{session_id}/closing
Authorization: Bearer <access_token>
Query: ?debug=false

Response: text/event-stream (SSE)
  data: {"type": "delta", "content": "..."}
  data: {"type": "done", "message_id": 42, "input_tokens": ..., "output_tokens": ...}
  data: {"type": "error", "message": "..."}

Fehlerverhalten:
  404 — Session nicht gefunden
  409 — Session bereits beendet (ended_at is not null)
  409 — Session bereits im Closing-State (closing_started_at is not null)
```

**Session-State-Erweiterung:** `chat_sessions` bekommt zwei neue Felder:
- `closing_started_at: datetime | None` — gesetzt wenn /closing aufgerufen wird
- `closing_exchange_count: int` — zählt Exchanges nach dem Closing (max 2, Backend-enforced)

**Backend-Enforcement des Exchange-Limits:**
- `POST /sessions/{id}/messages` prüft: wenn `closing_started_at is not null` und `closing_exchange_count >= 2` → HTTP 409 "Closing-Phase abgeschlossen. Session beenden oder neustarten."

---

### 7. Neue DB-Tabelle: `session_feedback`

```sql
CREATE TABLE session_feedback (
    id              SERIAL PRIMARY KEY,
    session_id      INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type   VARCHAR(30) NOT NULL,  -- Enum: siehe unten
    message_id      INTEGER REFERENCES messages(id) ON DELETE SET NULL,
                    -- FK zur KAIA-Antwort die das Feedback ausgelöst hat
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_session_feedback_session ON session_feedback(session_id);
CREATE INDEX ix_session_feedback_user    ON session_feedback(user_id);
```

**FeedbackType Enum:**

```python
class FeedbackType(StrEnum):
    TRANSFER_MARKER = "transfer_marker"   # "Muss ich weiterdenken"
    WOW             = "wow"               # "Wow — das trifft was"
    STUCK           = "stuck"             # "Ich hänge gerade"
    UNCLEAR         = "unclear"           # "Das verstehe ich noch nicht"
```

**Wichtig:** `user_id` ist Pflichtfeld — kein Cross-User-Leak möglich. Alle Queries müssen `WHERE user_id = :user_id` enthalten (pgvector Row-Level-Security Prinzip analog).

---

### 8. Neuer Endpoint: `POST /api/v1/chat/sessions/{session_id}/feedback`

```
POST /api/v1/chat/sessions/{session_id}/feedback
Authorization: Bearer <access_token>
Content-Type: application/json

Body:
{
  "feedback_type": "stuck" | "unclear" | "transfer_marker" | "wow",
  "message_id": 42  // Optional: ID der letzten KAIA-Antwort
}

Response 201:
{
  "id": 7,
  "feedback_type": "stuck",
  "message_id": 42,
  "created_at": "2026-06-10T14:23:00Z",
  "kaia_response_triggered": true  // ob eine Meta-Frage ausgelöst wurde
}

Response 200 (wenn feedback_type = "wow" oder "transfer_marker"):
{
  "id": 8,
  "feedback_type": "transfer_marker",
  "message_id": 42,
  "created_at": "...",
  "kaia_response_triggered": false
}

Fehlerverhalten:
  404 — Session nicht gefunden
  409 — Session bereits beendet
  422 — Ungültiger feedback_type
```

**Seiteneffekte:**
- `feedback_type = "stuck"` oder `"unclear"` → Backend löst `stream_meta_question()` aus (neue Service-Funktion) — SSE-Response enthält sowohl das Feedback-Ack als auch die KAIA-Meta-Frage
- `feedback_type = "transfer_marker"` oder `"wow"` → kein LLM-Call, nur DB-Insert

**Hinweis zur SSE-Koordination:** Da der Feedback-Endpoint für negative Buttons eine LLM-Antwort auslöst, returned er einen `StreamingResponse`. Frontend muss unterscheiden: positiv = JSON 201, negativ = SSE-Stream.

---

## Datenbankschema-Erweiterungen {#db-schema}

### Übersicht aller Änderungen

| Tabelle | Änderung | Migration |
|---|---|---|
| `chat_sessions` | +`closing_started_at` (TIMESTAMPTZ, nullable) | neue Alembic-Migration |
| `chat_sessions` | +`closing_exchange_count` (INTEGER, default=0) | gleiche Migration |
| `session_feedback` | neue Tabelle (siehe oben) | gleiche Migration |

### Alembic-Migration (eine Migration für alle drei Änderungen)

Migration-Name-Konvention: `XXXX_chat_v2_closing_and_feedback.py`

Rollback (downgrade) muss implementiert sein:
- DROP TABLE session_feedback
- ALTER TABLE chat_sessions DROP COLUMN closing_started_at
- ALTER TABLE chat_sessions DROP COLUMN closing_exchange_count

---

## Abhängigkeiten zwischen Stories {#dependencies}

```
STORY-001 (Closure-Phase)
  └─ benötigt: closing_started_at, closing_exchange_count in chat_sessions
  └─ benötigt: POST /closing Endpoint
  └─ benötigt: exchange-limit enforcement in POST /messages
  └─ timing-änderung: extract_session_summary() erst nach Closing

STORY-002 (Feedback Buttons)
  └─ benötigt: session_feedback Tabelle
  └─ benötigt: POST /feedback Endpoint
  └─ benötigt: stream_meta_question() Service-Funktion
  └─ optional, aber empfohlen parallel: PromptContext.transfer_markers
  └─ optional für Cross-Session-Anker: STORY-001 muss deployed sein
     (weil extract_session_summary() transfer_markers befüllt)

Empfohlene Implementierungsreihenfolge:
  1. Alembic-Migration (beide Stories in einer Migration)
  2. session_feedback Model + Repository
  3. PromptContext-Erweiterung (rückwärtskompatibel)
  4. extract_session_summary() Erweiterung
  5. POST /feedback Endpoint
  6. stream_meta_question() Service-Funktion
  7. closing_started_at / closing_exchange_count Logic in chat_sessions
  8. POST /closing Endpoint
  9. exchange-limit in POST /messages
  10. Frontend: Feedback-Buttons
  11. Frontend: Closing-Flow
```

---

## Offene Fragen (globale, beide Stories betreffend) {#open-questions}

| Nr. | Frage | Verantwortlich | Priorität |
|---|---|---|---|
| OQ-1 | Meta-Frage für "Ich hänge gerade": LLM-generiert oder statische Fallback-Strings? | AI-Engineer | Hoch |
| OQ-2 | Closing-Prompt: eigener CharacterMode `closing` in `prompt_versions` oder Parameter? | AI-Engineer + Architect | Hoch |
| OQ-3 | Transfer-Marker in Opening: ab welcher Session-Nummer aktiviert? | Didaktiker + AI-Engineer | Mittel |
| OQ-4 | Feedback-Endpoint für negative Buttons: Zwei Response-Typen (JSON vs. SSE) — Frontend-Handling klar? | UX-Designer + AI-Engineer | Hoch |
| OQ-5 | `closing_exchange_count` bei Browser-Reload: Frontend holt aktuellen Count vom GET /sessions/{id} Endpoint? SessionResponse muss Feld enthalten | Architect | Mittel |
| OQ-6 | DSGVO: `session_feedback`-Daten müssen in Art. 15-Export (CSV-Download) enthalten sein — koordiniert mit Compliance-Gate | Compliance | Hoch |

---

## Definition of Done (beide Stories)

- [ ] **G1:** Alle Akzeptanzkriterien als Gherkin-Tests dokumentiert (diese Datei)
- [ ] **G2:** Compliance-Gate durchlaufen — DSGVO-Check für `session_feedback`-Tabelle, EU-AI-Act-Risikoklasse
- [ ] **G3:** ADR für Closing-Prompt-Architektur (eigener CharacterMode vs. Parameter)
- [ ] **G4:** Threat Model: Feedback-Endpoint auf Replay-Angriffe und Rate-Limiting geprüft
- [ ] **G5:** Unit-Tests Backend > 80% Coverage; Integration-Tests für exchange-limit und feedback-endpoint
- [ ] **G6:** WCAG 2.2 AA für Closing-Aktionen und Feedback-Buttons (axe-core-CI-Check)
- [ ] **G7:** LLM-Usage-Logging für `/closing` und Meta-Frage-Calls in `llm_usage`-Tabelle
- [ ] **G8:** ARCHITECTURE.md aktualisiert (neue Tabelle, neue Endpoints, neuer PromptContext)

---

**Nächster Schritt:** Dieses Dokument an `compliance`-Agenten übergeben zur DSGVO-Risikoeinstufung der `session_feedback`-Tabelle (EMA-Daten = Verhaltensdaten unter Artikel 9? Klärung nötig) und EU-AI-Act-Klassifizierung der automatischen Meta-Fragen-Triggerung.
