# KAIA – Systemarchitektur

> Diese Datei ist die einzige Quelle der Wahrheit für die Systemarchitektur.
> Jede strukturelle Änderung muss hier dokumentiert werden.
> Die `/architektur`-Seite im Frontend rendert dieses Dokument direkt.

**Stand:** 13. Juli 2026

---

## Systemüberblick

KAIA ist ein sokratischer KI-Lernbegleiter. Nutzer durchlaufen eine strukturierte 10-Session-Journey
mit Pre- und Post-Messung (MSLQ + GSE). Das System ist DSGVO-konform, EU-gehostet und auf
wissenschaftliche Reproduzierbarkeit ausgelegt.

```
Browser (Next.js)
      │ HTTPS
      ▼
  Caddy (Reverse Proxy + TLS — Let's Encrypt)
      │
      ├──▶  :3000  Next.js 14 Frontend (App Router, TypeScript)
      │
      └──▶  :8000  FastAPI Backend (Python 3.12, async)
                        │
                        ├── PostgreSQL 16 + pgvector
                        │
                        ├── Anthropic API  (claude-sonnet-4-6, claude-haiku-4-5)
                        ├── OpenAI API     (gpt-4o, gpt-5.6-terra, gpt-4.1-mini)
                        ├── Mistral API    (mistral-large-latest, mistral-small-latest)
                        │
                        └── Sentry / Slack / structlog
```

Hosting: Hetzner CX23, Helsinki (EU). Kein Drittanbieter-Cloud-Deployment.

---

## Tech-Stack

| Bereich         | Technologie                                        | Begründung |
|-----------------|----------------------------------------------------|---|
| Backend         | FastAPI 0.115+, Python 3.12                        | Async, typisiert, OpenAPI auto |
| Validierung     | Pydantic v2                                        | Typsicherheit, Settings-Management |
| ORM             | SQLAlchemy 2.0 async                               | Connection-Pooling, typisiert |
| Migrationen     | Alembic                                            | Versioniert, reversibel |
| DB              | PostgreSQL 16 + pgvector                           | Eine DB, kein separates ChromaDB |
| Auth            | Custom JWT — Access 15min, Refresh 30d rotierend   | Volle Kontrolle, DSGVO-klar |
| Passwort-Hash   | bcrypt, 12 Runden                                  | Aktuell, kein passlib |
| Frontend        | Next.js 14 App Router, TypeScript                  | SSR, App Router, typisiert |
| UI              | Tailwind CSS v4 + shadcn/ui (Radix)                | A11y, keine Bundle-Bloat |
| State           | React Query                                        | Server-State, Caching |
| API-Validation  | Zod                                                | Laufzeit-Typprüfung FE |
| LLM-Streaming   | Server-Sent Events (SSE)                           | Echtzeitausgabe, kein WebSocket-Overhead |
| LLM-Provider    | Anthropic SDK + OpenAI SDK (auch Mistral)          | Drei Provider für LLM-Eval |
| Prompt-Mgmt     | DB-gespeichert + Jinja2, live editierbar           | Kein Deploy für Prompt-Updates |
| Observability   | Sentry (FE + BE), Slack-Webhooks, structlog JSON   | Fehler + Business-Events |
| CI/CD           | GitHub Actions                                     | Pre-Commit: mypy, ruff, commitlint |
| Coverage        | >= 66 % (CI-Gate, Backend)                         | Pflicht-Schwelle für Merge |
| Hosting         | Hetzner CX23 Helsinki, Docker Compose              | EU, DSGVO, kostengünstig |
| TLS             | Caddy + Let's Encrypt                              | Automatisch, zero-config |
| Analytics       | Plausible (EU-Cloud)                               | DSGVO-konform, kein Cookie-Banner |

---

## Monorepo-Struktur

```
kaia-app/
├── apps/
│   ├── api/                         FastAPI Backend (Python 3.12)
│   │   ├── alembic/                 Migrationen (async env.py)
│   │   │   └── versions/            versionierte Migrationsschritte
│   │   └── app/
│   │       ├── core/
│   │       │   ├── config.py        Settings (Pydantic BaseSettings)
│   │       │   ├── security.py      bcrypt, JWT, token-hash utils
│   │       │   └── deps.py          get_current_user, require_admin
│   │       ├── api/v1/              HTTP-Endpunkt-Registrierung (versioniert)
│   │       ├── db/                  SQLAlchemy 2.0 async + Session-Factory
│   │       ├── domains/             Domain-Driven Design
│   │       │   ├── users/           User, RefreshToken — Auth, Approval, DSGVO
│   │       │   ├── chat/            ChatSession, Message, Feedback, summary.py
│   │       │   ├── surveys/         MSLQ, GSE, Journey State
│   │       │   ├── analytics/       llm_usage — Token- und Kosten-Tracking
│   │       │   ├── eval/            evaluator.py, Personas, Simulation-Runner
│   │       │   ├── preregistration/ Voranmeldungs-Warteliste
│   │       │   └── prompts/         DB-Jinja2-Templates, versioniert, live editierbar
│   │       └── observability/       sentry.py, slack.py, structlog JSON
│   │
│   └── web/                         Next.js 14 App Router (TypeScript)
│       └── src/
│           ├── app/
│           │   ├── (public)/        Öffentlicher Bereich — shared Nav-Layout
│           │   │   ├── page.tsx              Landing Page
│           │   │   ├── architektur/          ARCHITECTURE.md Renderer
│           │   │   ├── release-notes/        RELEASE_NOTES.md Renderer
│           │   │   ├── wissenschaft/         Wissenschaftliche Quellen (24+)
│           │   │   ├── mitmachen/            Studien-Info + Voranmeldung
│           │   │   ├── datenschutz/          DSGVO Art. 15–21, Schrems-II
│           │   │   └── impressum/
│           │   ├── (auth)/          Login, Registrierung, Consent, KI-Disclosure
│           │   ├── (app)/           Geschützter Bereich (AuthGuard)
│           │   │   ├── chat/                 Chat mit KAIA (SSE, EMA-Buttons)
│           │   │   ├── onboarding/           Onboarding-Flow
│           │   │   └── survey/               Pre/Post MSLQ + GSE
│           │   └── admin/           Admin-Bereich (Server Component Layout)
│           │       ├── page.tsx              Dashboard + API-Health
│           │       ├── users/                User-Approval (pending/aktiv/gesperrt)
│           │       ├── prompts/              Prompt-Sandbox (Jinja2-Editor, Live-Test)
│           │       ├── journey-test/         Journey-State-Test-Tool
│           │       ├── eval/                 Eval-Run-Interface + Heatmap
│           │       ├── lerndesign/           10-Session-Architektur + Bloom
│           │       ├── instrumente/          MSLQ + GSE Dokumentation
│           │       ├── thesis/               Live-Thesis-Cockpit (Kapitel 1–6)
│           │       ├── production-readiness/ Deployment-Checkliste
│           │       ├── roadmap/              Feature-Roadmap
│           │       ├── kosten/               LLM-Kostenübersicht
│           │       ├── release-notes/        Changelog-Viewer
│           │       ├── architektur/          Architektur-Viewer
│           │       └── daily-log/            Entwicklungs-Tagebuch
│           ├── components/          Geteilte UI-Komponenten
│           └── lib/
│               ├── api.ts           Typisierter API-Client (React Query)
│               ├── auth.ts          AuthContext, AuthGuard
│               └── docs.ts          readDoc() — /docs (Prod) oder ../../docs (lokal)
│
├── docs/
│   ├── ARCHITECTURE.md              diese Datei
│   ├── RELEASE_NOTES.md             auto-generiert via scripts/
│   ├── DAILY_LOG.md                 Entwicklungs-Tagebuch
│   └── adr/                         Architecture Decision Records
│
├── scripts/
│   └── generate_release_notes.py
│
└── infra/
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    └── Caddyfile
```

Jede Domain folgt dem Muster: `models.py · repository.py · service.py · routes.py · schemas.py · tests/`.
Service-Layer ist von HTTP getrennt. Repository-Pattern für alle DB-Zugriffe.

---

## Datenmodell

### Tabellen (Stand Juli 2026)

| Tabelle                 | Domain       | Beschreibung |
|-------------------------|--------------|---|
| `users`                 | users        | Profil, Auth, Status, per-User-Modell-Override |
| `refresh_tokens`        | users        | JWT Refresh-Token-Rotation + Reuse-Detection |
| `user_learning_profiles`| users        | Immutable Baseline: gse_baseline, subscale_scores, profile_interpretation |
| `chat_sessions`         | chat         | Lernsessions: session_number, character, session_summary (JSONB) |
| `chat_messages`         | chat         | Einzelnachrichten: role, content, detected_state, interaction_mode |
| `session_feedback`      | chat         | EMA-Signale: transfer_marker, wow, stuck, unclear |
| `survey_responses`      | surveys      | Pre/Post MSLQ + GSE: items (JSONB), scores (JSONB) |
| `llm_usage`             | analytics    | Token-Verbrauch + Kosten pro LLM-Call |
| `prompts`               | prompts      | Jinja2-Templates: name, template, version, is_active |
| `preregistrations`      | preregistration | Voranmeldungs-Warteliste |

### Spalten-Details: Schlüsseltabellen

**users**
```
id (UUID PK), username, email, hashed_password,
is_active (bool), is_admin (bool), is_approved (bool),
kaia_model (nullable — per-User-Modell-Override),
learning_topic, created_at
```

**user_learning_profiles** (UNIQUE user_id — unveränderlich nach Erstellung)
```
user_id (FK), gse_baseline (float),
subscale_scores (JSONB — MSLQ-Subskalen),
gse_items (JSONB — Rohwerte 10 Items),
profile_interpretation (Text — LLM-generiert, Haiku, max. 120 Wörter),
created_at
```

**chat_sessions**
```
id (UUID PK), user_id (FK), session_number (int),
character (varchar), started_at, ended_at,
session_summary (JSONB):
    insight_for_next_session,
    strongest_quote,
    observation,
    topics_discussed
```

**chat_messages**
```
id (UUID PK), session_id (FK), role (user/assistant),
content (text), created_at,
detected_state (nullable), interaction_mode (nullable)
```

**survey_responses**
```
id (UUID PK), user_id (FK),
measurement_type (pre/post),
instrument (mslq/gse),
items (JSONB — Rohantworten), scores (JSONB — berechnete Subskalen),
completed_at
```

**llm_usage**
```
id (UUID PK), user_id (FK), session_id (FK nullable),
model_id (varchar), input_tokens (int), output_tokens (int),
cost_eur (numeric), created_at
```

### Zwei-Schichten-Profil-Modell

```
Layer 1 — Immutable Baseline (user_learning_profiles)
    Erstellt einmalig als BackgroundTask nach Abschluss beider Pre-Surveys.
    Race-Condition-Guard: UNIQUE(user_id) + IntegrityError-Catch.
    Inhalte: gse_baseline, gse_items, subscale_scores (MSLQ),
             profile_interpretation (Haiku-generiert, max. 120 Wörter).

Layer 2 — Kumulatives Session-Gedächtnis (chat_sessions.session_summary)
    Aktualisiert nach jeder Session via extract_session_summary (Haiku, BackgroundTask).
    Felder: insight_for_next_session, strongest_quote,
            observation, topics_discussed.

        ▼
PromptContext v3 — zusammengeführt in _build_system_prompt():
    user_name, learning_topic
    session_number, session_phase (early/mid/late), is_final_session, user_turns
    learner_profile (Layer 1: profile_interpretation)
    gse_baseline (Layer 1)
    session_history_summary (Layer 2: alle Vorsessions, max. 9)
    historical_quotes (strongest_quote je Session — aktiv ab Session 6)
    insight_for_next_session, last_session_observation (Vorsession)
```

### pgvector (Semantisches Gedächtnis)

pgvector ist installiert und verfügbar. Vektorspeicherung für Cross-Session-Recall ist geplant
(memory_chunks — nicht aktiv in Produktion). Pflicht bei Aktivierung: jede Query gefiltert nach
`user_id` — keine Cross-User-Leaks.

---

## API-Schicht

Alle Endpunkte unter `/api/v1/`. Vollständige OpenAPI-Dokumentation unter `/api/v1/docs`.

### Auth

| Methode | Pfad                | Beschreibung |
|---------|---------------------|---|
| POST    | /auth/login         | Credentials → Access + Refresh Token |
| POST    | /auth/refresh       | Refresh Token rotieren → neues Paar |
| POST    | /auth/logout        | Refresh Token invalidieren |

### Users

| Methode | Pfad                        | Beschreibung |
|---------|-----------------------------|---|
| GET     | /users/me                   | Eigenes Profil |
| PATCH   | /users/me                   | Profil-Update (learning_topic etc.) |
| GET     | /users/me/journey-state     | Aktueller Journey-State (on-the-fly aus DB) |

### Chat

| Methode | Pfad                                    | Beschreibung |
|---------|-----------------------------------------|---|
| POST    | /chat/sessions                          | Neue Session erstellen (403 bei falschen Journey-States) |
| GET     | /chat/sessions                          | Alle Sessions des Users |
| GET     | /chat/sessions/active                   | Aktive Session (falls vorhanden) |
| GET     | /chat/sessions/{id}                     | Session-Details |
| POST    | /chat/sessions/{id}/messages            | Nutzer-Nachricht → SSE-Stream (KAIAs Antwort) |
| POST    | /chat/sessions/{id}/opening             | Session-Eröffnung → SSE-Stream |
| POST    | /chat/sessions/{id}/closing             | Session-Abschluss → SSE-Stream |
| POST    | /chat/sessions/{id}/end                 | Session beenden (triggert BackgroundTask summary) |
| POST    | /chat/sessions/{id}/feedback            | EMA-Signal speichern |
| POST    | /chat/sessions/{id}/meta-question       | Meta-Frage → SSE-Stream |
| POST    | /chat/sessions/{id}/report              | Session-Report generieren |

### Survey

| Methode | Pfad            | Beschreibung |
|---------|-----------------|---|
| GET     | /survey/mslq    | MSLQ-Fragebogen abrufen |
| POST    | /survey/mslq    | MSLQ-Antworten speichern + Scoring |
| GET     | /survey/gse     | GSE-Fragebogen abrufen |
| POST    | /survey/gse     | GSE-Antworten speichern (triggert BackgroundTask Lernprofil) |

### Admin

| Methode | Pfad                    | Beschreibung |
|---------|-------------------------|---|
| GET     | /admin/users            | Alle User (mit Status) |
| PATCH   | /admin/users/{id}       | Status ändern (approve/suspend) |
| DELETE  | /admin/users/{id}       | User löschen (DSGVO Art. 17) |
| GET     | /admin/stats            | System-Statistiken |
| GET     | /admin/prompts          | Alle Prompt-Templates |
| POST    | /admin/prompts          | Neues Template erstellen |
| PATCH   | /admin/prompts/{id}     | Template aktualisieren (Study-Lock-Guard) |

### Eval

| Methode | Pfad                        | Beschreibung |
|---------|-----------------------------|---|
| POST    | /eval/run                   | Eval-Run starten (Persona + Modell) |
| POST    | /eval/cancel                | Laufenden Eval-Run abbrechen |
| GET     | /eval/runs                  | Alle Eval-Runs |
| DELETE  | /eval/runs/{id}             | Eval-Run löschen |
| GET     | /eval/runs/{id}/log         | Log eines Runs (SSE oder vollständig) |
| POST    | /eval/simulate              | Einzelne Persona simulieren |

### Sonstige

| Methode | Pfad               | Beschreibung |
|---------|--------------------|---|
| GET     | /health            | Health-Check (DB-Ping, Version) |
| POST    | /preregistration   | Voranmeldung speichern |

---

## LLM-Provider-Abstraktion

### Unterstützte Modelle (Stand Juli 2026)

| Provider   | Modell-ID                       | Verwendung |
|------------|---------------------------------|---|
| Anthropic  | claude-sonnet-4-6               | Primärer Chat-Provider |
| Anthropic  | claude-haiku-4-5-20251001       | Session-Summary, Profil-Interpretation |
| OpenAI     | gpt-4o                          | LLM-Eval |
| OpenAI     | gpt-5.6-terra                   | LLM-Eval |
| OpenAI     | gpt-4.1-mini                    | LLM-Eval |
| Mistral    | mistral-large-latest            | LLM-Eval (EU-Provider) |
| Mistral    | mistral-small-latest            | LLM-Eval (EU-Provider) |

Mistral-Calls laufen über die OpenAI-kompatible API (OpenAI SDK mit anderem Base-URL).

### Per-User-Modell-Override

`users.kaia_model` (nullable). Wenn gesetzt, überschreibt es den System-Default in allen
4 Stream-Funktionen. Admin kann pro User ein anderes Modell zuweisen — für Eval-Zwecke
ohne Code-Änderung.

### API-Besonderheiten

- **GPT-5.x:** `max_completion_tokens` statt `max_tokens` (OpenAI API-Änderung)
- **Anthropic Prompt Caching:** aktiviert für System-Prompts und Session-Kontext (Input-Token-Kosten reduziert)
- **Rate-Limit-Retry:** exponentieller Backoff bei 429-Antworten aller Provider

### Datenfluss LLM-Calls

```
user_id + session_id
        │
        ├── Crisis-Detection Pre-Filter  (Regex, 20+ DE-Muster)
        │       bei Treffer: statische Eskalations-Antwort (kein LLM-Call)
        │       Telefonseelsorge 0800 111 0 111, Notruf 112
        │
        ▼
_build_system_prompt(PromptContext)
        Jinja2-Template aus DB (prompts-Tabelle, is_active=True)
        + Layer-1-Profil + Layer-2-Session-History injiziert
        │
        ▼
Provider-SDK-Call (Anthropic / OpenAI / Mistral)
        │
        ├── <thinking>-Block strippen (Anthropic Extended Thinking)
        ├── SSE-Chunks an Frontend streamen
        │
        ▼
llm_usage INSERT (model_id, input_tokens, output_tokens, cost_eur)
```

### LLM-Kosten-Tracking

Jeder LLM-Call schreibt einen Datensatz in `llm_usage`:
`user_id, session_id, model_id, input_tokens, output_tokens, cost_eur, created_at`.
Kostenübersicht unter `/admin/kosten`.

---

## Session-Architektur V3

### 10-Session-Journey

```
Session 1–2   Erkunden         Thema und Lernenden kennenlernen
Session 3–4   Transfer/Analyse Tiefere Auseinandersetzung mit dem Stoff
Session 5     Halbzeit-Spiegel Obligatorischer Meilenstein-Trigger (hard-coded im Prompt)
Session 6–8   Transfer/Analyse Historical Quotes aktiv (strongest_quote je Vorsession)
Session 9–10  Synthese         Abschluss-Vorbereitung, stiller Kontext-Satz im UI
Session 10    Drei-Aufgaben-Abschluss  Gegenüberstellung + Autonomisierung + kein GSE-Priming
```

### Prompt-Architektur

```
User-Input
    │
    ├── Crisis-Detection Pre-Filter
    │
    ▼
_build_system_prompt()
    Befüllt PromptContext mit 7+ Feldern (siehe Zwei-Schichten-Profil-Modell)
    │
    ▼
KAIA_PROMPT_V3_WARM (Jinja2 in DB, is_active=True)
    ├── Session-Kontext-Header (Vorsessions-Zusammenfassung, wenn session_number > 1)
    ├── Persistenter Lernenden-Profil-Block (learner_profile — nie explizit zitieren)
    ├── 8 interne Klassifikationsschritte im <thinking>-Block
    │   (Lazarus, Fragetyp, Crisis, Grenz, Grounded, Phase, Rupture, Erwünschtheit)
    ├── Session-5-Meilenstein-Trigger (obligatorisch)
    ├── Historical-Quotes-Block (Sessions 6–10, Widerspruchsarbeit Typ 3)
    ├── Session-10-Abschluss-Logik (3 simultane Aufgaben)
    └── <final_answer> — max. 80 Wörter, ein Impuls
    │
    ▼
Provider-SDK (Streaming)
    │
    ├── <thinking>-Block strippen
    ▼
SSE-Stream → Browser
```

### Prompt-Versionen

| Name                         | Status   | Beschreibung |
|------------------------------|----------|---|
| `kaia_system_v1_warm`        | inaktiv  | Regression-Baseline v1 |
| `kaia_system_v2_warm`        | inaktiv  | Eval-Regression-Baseline v2, für A/B-Vergleich erhalten |
| `kaia_system_v3_warm`        | **aktiv**| Session-aware, Profil-integriert, Session-5-Trigger, Session-10-Logik |
| `kaia_system_v1_challenging` | inaktiv  | Eval-Charakter |
| `kaia_system_v1_wild`        | inaktiv  | Eval-Charakter |

### BackgroundTasks

| Trigger                              | Task                            | Beschreibung |
|--------------------------------------|---------------------------------|---|
| `POST /chat/sessions/{id}/end`       | `extract_session_summary()`     | Haiku extrahiert summary-JSONB aus Transkript |
| `POST /survey/gse` (Pre abgeschlossen) | `maybe_create_learning_profile()` | Haiku erstellt profile_interpretation (idempotent, UNIQUE-Guard) |

---

## Journey State Machine

State wird on-the-fly aus der DB berechnet — kein eigenes State-Feld.

```
PRE_PENDING
    │   (MSLQ Pre + GSE Pre abgeschlossen)
    ▼
ACTIVE (Sessions 1 – 10)
    │   (session_count >= 10)
    ▼
POST_PENDING
    │   (MSLQ Post + GSE Post abgeschlossen)
    ▼
COMPLETED
```

**Gating-Regeln:**
- `POST /chat/sessions` gibt 403 zurück, wenn `state ∈ {PRE_PENDING, POST_PENDING, COMPLETED}`
- 403-Response enthält `redirect`-Feld (`/survey/pre` oder `/survey/post`)
- Frontend leitet automatisch weiter
- Pre-Messung: 30 MSLQ-Items (7-pt, 4 Subskalen) + 10 GSE-Items (4-pt)
- Post-Messung: identisch, `measurement_type = "post"`
- Scoring server-seitig: Subskalen-Mittelwerte, Reverse-Coding (MSLQ Items 33, 57)

---

## Eval-Pipeline

### Zweck

Systematischer LLM-Vergleich (Claude / GPT-4o / Mistral) nach wissenschaftlich definierten
Kriterien für den LLM-Evaluationsbericht der Masterthesis.

### Architektur

```
Admin-UI (/admin/eval)
    │   POST /eval/run (persona_id, model_id)
    ▼
Simulation-Runner (domains/eval/)
    │   10 Crash-Personas durchlaufen Chat-Flow gegen gewähltes Modell
    │   Jede Persona: mehrere Turns simuliert
    │
    ▼
Eval-Matrix (LLM-as-Judge)
    │   4 Metriken pro Turn:
    │   - Empathiequalität
    │   - Sokratische Gesprächsführung
    │   - Konsistenz
    │   - Datenschutzkonformität
    │
    ├── Scores gespeichert in eval_runs
    ▼
Heatmap-Visualisierung im Admin-Frontend
```

### 10 Crash-Personas

Synthetisch generierte Grenzfall-Szenarien für robuste Testabdeckung. Definiert in
`domains/eval/`. Decken u.a. ab: Krisensprache, Off-Topic-Versuche, Injection-Patterns,
Compliance-Grenzfälle.

### Eval-Vergleichsmodus

Zwei Modelle können parallel gegen dieselbe Persona laufen. Ergebnisse werden
nebeneinander im Frontend dargestellt. Cancel-Endpunkt (`POST /eval/cancel`) bricht
laufende Runs ab.

---

## Auth und Sicherheit

### JWT-Flow

```
Login (POST /auth/login)
    │   credentials verifiziert (bcrypt, 12 Runden)
    ├── Access Token  (JWT, 15min, signed HS256)
    └── Refresh Token (JWT, 30d, rotierend, in DB gespeichert)

Token-Refresh (POST /auth/refresh)
    │   Refresh Token validieren
    ├── Alten Token invalidieren (Reuse-Detection)
    └── Neues Paar ausstellen

Logout (POST /auth/logout)
    └── Refresh Token aus DB löschen
```

Passwort-Hashing: bcrypt direkt (12 Runden) + SHA-256-Pre-Hash. passlib ist entfernt
(unmaintained seit 2023, inkompatibel mit bcrypt >= 4.0).

### Sicherheitsprinzipien

- **CORS:** Allowlist nur `kaia.rostek-dagmar.eu` + `localhost:3000`
- **Secrets:** ausschließlich via Umgebungsvariablen (nie in Code oder Repo)
- **TLS:** HSTS enforced via Caddy
- **Row-Level-Security:** `user_id` als Pflichtparameter bei allen DB-Abfragen — kein Cross-User-Leak möglich
- **pgvector:** Vektorsuche immer mit `user_id`-Filter
- **Admin-Aktionen:** Audit-Log mit Timestamp
- **Crisis-Detection:** Pre-Filter vor jedem LLM-Call, 20+ deutsche Regex-Muster (Suizidgedanken, Selbstverletzung). Bei Treffer: statische Eskalations-Antwort, kein LLM-Processing.
- **Study-Lock:** Bei `STUDY_MODE=locked` blockt CI Prompt- und Schema-Änderungen

### Study-Lock-Modi

| STUDY_MODE    | Prompt-Änderungen | Schema-Migrationen |
|---------------|-------------------|--------------------|
| development   | erlaubt           | erlaubt            |
| pilot         | erlaubt           | erlaubt            |
| locked        | geblockt (CI)     | geblockt (CI)      |

### DSGVO-Implementierung

- Art. 7: Consent-Logging (zwei Checkboxen: Datenverarbeitung + Analytics/Studie)
- Art. 13/14: Datenschutzerklärung mit Schrems-II-Abschnitt
- Art. 15–21: DSGVO-Rechte implementiert (Auskunft, Löschung, Berichtigung)
- Art. 17: Admin DELETE /admin/users/{id} — vollständige Datenlöschung
- KI-Disclosure: expliziter Hinweis vor Onboarding (computational empathy, kein Mensch)
- DPAs mit Anthropic, OpenAI, Mistral erforderlich

### OWASP LLM Top 10

Prompt Injection: Crisis-Detection Pre-Filter + Längenbegrenzung User-Input.
Insecure Output Handling: `<thinking>`-Block wird vor SSE-Ausgabe entfernt.
Training Data Poisoning: nicht anwendbar (kein Fine-Tuning).
Model Denial of Service: Rate-Limit-Retry-Backoff, Token-Budget pro Request.
Supply Chain: Model-Pinning mit versionierten Modell-IDs (nie generische Aliase).

---

## Deployment

### Produktion

```
Hetzner CX23 Helsinki
  └── Docker Compose (docker-compose.prod.yml)
      ├── api        (FastAPI, :8000)
      ├── web        (Next.js, :3000)
      └── db         (PostgreSQL 16 + pgvector)

  docs/ als Read-only-Volume → /docs:ro (Frontend liest Markdown direkt)

Caddy (Host-Netzwerk)
  ├── kaia.rostek-dagmar.eu → :3000 (Next.js)
  └── kaia.rostek-dagmar.eu/api → :8000 (FastAPI)
  TLS-Terminierung + HSTS via Let's Encrypt
```

Deploy-Befehl:
```bash
ssh root@[hetzner-ip]
cd ~/kaia-app
git pull
docker compose -f infra/docker-compose.prod.yml --env-file .env up -d --build
```

### Lokale Entwicklung

```bash
# DB + API in Docker (Port 5433 — vermeidet Konflikt mit lokalem Postgres)
docker compose -f infra/docker-compose.dev.yml --env-file apps/api/.env up

# Frontend nativ (Hot-Reload)
cd apps/web && npm run dev
```

`readDoc()` liest in Produktion aus `/docs`, lokal aus `../../docs` (relativ zu `apps/web`).

### CI/CD (GitHub Actions)

| Check          | Tool         | Gate |
|----------------|--------------|------|
| Linting        | ruff         | Pflicht |
| Typchecks      | mypy         | Pflicht |
| Commit-Format  | commitlint   | Pflicht |
| Test-Coverage  | pytest-cov   | >= 66 % Backend |
| Study-Lock     | Custom CI    | bei STUDY_MODE=locked |

Pre-Commit-Hooks: ruff + ESLint lokal (setup via `scripts/setup-hooks.sh`).

---

## Commit-Format

```
feat: kurze englische Beschreibung

Release-Note: Was hat sich für Nutzer:innen verändert (Deutsch). Warum ist das für Thesis/Studie/Compliance relevant.
Aufwand: 1h 20min
Kategorie: Neu | Verbesserung | Fix | Infra | Docs
```

Conventional Commits sind durch commitlint erzwungen.

---

## Design-Entscheidungen (Kurzübersicht)

Vollständige ADRs unter `docs/adr/`.

| Entscheidung                            | Gewählt                  | Abgelehnt                          | Grund |
|-----------------------------------------|--------------------------|------------------------------------|---|
| Vektorspeicher                          | pgvector (in PostgreSQL) | ChromaDB, Weaviate                 | Eine DB, weniger Ops, EU-compliant |
| LLM-Streaming                           | SSE                      | WebSockets, Polling                | Simpel, HTTP-native, kein Handshake |
| Prompt-Speicherung                      | DB + Jinja2              | Dateisystem, HuggingFace Hub       | Live editierbar, versioniert, kein Deploy |
| Auth                                    | Custom JWT               | NextAuth, Keycloak                 | Volle Kontrolle, DSGVO-klar, kein Vendor |
| Passwort-Hashing                        | bcrypt direkt            | passlib                            | passlib unmaintained, bcrypt >= 4.0 inkompatibel |
| Mistral-Integration                     | OpenAI-kompatibler SDK   | Mistral-eigener SDK                | Ein Client-Code-Pfad für OpenAI + Mistral |
| Per-User-Modell-Override                | DB-Feld users.kaia_model | Config-Datei, Feature-Flags        | Kein Deploy für Eval-Zuweisungen nötig |
| Profil-Erstellung                       | BackgroundTask (async)   | Synchron in POST /survey/gse       | Survey-Response blockiert nicht auf LLM |
| Hosting                                 | Hetzner CX23 Helsinki    | Vercel, Railway, AWS               | EU, DSGVO, DPA möglich, Kostenkontrolle |
| Frontend-Framework                      | Next.js 14 App Router    | Vite + React SPA, Remix            | SSR, TypeScript, eingebaut i18n-ready |

---

*Letzte Aktualisierung: 13. Juli 2026*
