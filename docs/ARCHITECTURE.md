# KAIA – Systemarchitektur

> Diese Datei ist die einzige Quelle der Wahrheit für die Systemarchitektur.
> Jede strukturelle Änderung muss hier dokumentiert werden — CI prüft das.
> Die `/architektur`-Seite im Frontend rendert dieses Dokument direkt.

**Stand:** Juni 2026 · Version 0.8.0

---

## Überblick

KAIA ist ein sokratischer KI-Lernbegleiter für Studierende. Die Architektur ist
**produktionstauglich von Tag 1** — modular, beobachtbar, DSGVO-konform.

```
Browser (Next.js)
      │ HTTPS
      ▼
  Caddy (Reverse Proxy + TLS)
      │
      ├──▶  :3000  Next.js Frontend (SSR)
      │
      └──▶  :8000  FastAPI Backend (REST + SSE)
                        │
                        ├── PostgreSQL 16 + pgvector
                        └── Sentry / Slack
```

---

## Monorepo-Struktur

```
kaia-app/
├── apps/
│   ├── api/                    FastAPI Backend (Python 3.12)
│   │   ├── alembic/            Migrationen (async env.py)
│   │   │   └── versions/       0001: users + refresh_tokens
│   │   └── app/
│   │       ├── api/v1/         HTTP-Endpoints (versioniert)
│   │       ├── core/
│   │       │   ├── config.py   Settings (Pydantic BaseSettings)
│   │       │   ├── security.py bcrypt, JWT, token-hash utils
│   │       │   └── deps.py     get_current_user, require_admin
│   │       ├── db/             SQLAlchemy 2.0 async + Alembic
│   │       ├── domains/        Domain-Driven Design
│   │       │   ├── users/         User, RefreshToken — Auth, Approval, DSGVO-Deletion
│   │       │   ├── chat/          ChatSession, Message, MemoryChunk, SessionFeedback
│   │       │   ├── survey/        GseResult, MslqResult, ConsentLog — Pre/Post + Journey State
│   │       │   ├── roadmap/       RoadmapGoal, UserProfile — Lernziele + Profil
│   │       │   ├── prompts/       PromptTemplate — DB-Jinja2, versioniert, live editierbar
│   │       │   └── preregistration/ PreRegistration — Voranmeldungs-Warteliste
│   │       └── observability/  Sentry, Slack, Structured Logging
│   │
│   └── web/                    Next.js 14 App Router (TypeScript)
│       └── src/
│           ├── app/            Seiten (App Router)
│           │   ├── (public)/   Öffentlicher Bereich — shared layout mit Nav
│           │   │   ├── page.tsx            Landing Page
│           │   │   ├── architektur/        ARCHITECTURE.md Renderer
│           │   │   ├── release-notes/      RELEASE_NOTES.md Renderer
│           │   │   ├── wissenschaft/       24 wissenschaftliche Quellen
│           │   │   ├── datenschutz/        DSGVO-Erklärung (Art. 15–21, Schrems-II)
│           │   │   └── impressum/
│           │   ├── (auth)/     Login, Registrierung, DSGVO-Consent
│           │   │   └── ki-disclosure/      KI-Disclosure + Bestätigungs-Button
│           │   ├── (app)/      Chat, Survey Pre/Post (journey-gated)
│           │   │   ├── chat/           Chat mit KAIA (Session-Handling, SSE, EMA-Buttons)
│           │   │   ├── survey/pre/     Pre-Messung: MSLQ (30 Items) + GSE (10 Items)
│           │   │   └── survey/post/    Post-Messung: identisch, measurement_type="post"
│           │   └── admin/      Passwortgeschützt via Server Component Layout
│           │       ├── page.tsx               Dashboard + API-Health
│           │       ├── login/
│           │       ├── chat-test/             Split-View Prompt-Testing + EMA-Buttons
│           │       ├── lerndesign/            10-Session-Architektur + Bloom + Sentiment
│           │       ├── instrumente/           MSLQ + GSE Dokumentation (Thesis-Anhang)
│           │       ├── users/                 User-Approval (pending/aktiv/gesperrt)
│           │       ├── thesis/                Live-Thesis-Cockpit (Kapitel 1–6)
│           │       ├── production-readiness/  Deployment-Checkliste
│           │       ├── roadmap/               Feature-Roadmap (Filter, Agents, SHA)
│           │       ├── prompts/               Prompt-Sandbox (Jinja2-Editor, Live-Test)
│           │       ├── release-notes/         Changelog-Viewer
│           │       ├── architektur/           Architektur-Viewer
│           │       ├── kosten/                Kostenübersicht
│           │       └── daily-log/             Entwicklungs-Tagebuch
│           ├── components/     Geteilte UI-Komponenten
│           └── lib/
│               ├── api.ts      Typisierter API-Client (React Query)
│               └── docs.ts     readDoc() — /docs (Prod) oder ../../docs (lokal)
│
├── docs/
│   ├── ARCHITECTURE.md         ← diese Datei
│   ├── RELEASE_NOTES.md        ← auto-generiert via scripts/
│   ├── BACKLOG.md              GitHub-Issue-Backlog
│   └── DECISIONS/              Architecture Decision Records (ADRs)
│
├── scripts/
│   └── generate_release_notes.py
│
└── infra/
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    └── Caddyfile
```

---

## Tech-Stack

| Bereich | Technologie | Begründung |
|---|---|---|
| Backend | FastAPI 0.115+ | Async, typisiert, OpenAPI auto |
| ORM | SQLAlchemy 2.0 async | Connection-Pooling, Migrations |
| Migrationen | Alembic | Versioniert, reversibel |
| Vektorspeicher | pgvector | Eine DB, kein separates ChromaDB |
| Frontend | Next.js 14 App Router | SSR, TypeScript, eingebaut i18n-ready |
| UI | Tailwind CSS + shadcn/ui | Dark/Light, A11y, keine Bundle-Bloat |
| Auth | JWT (Access 15min + Refresh 30d) | Volle Kontrolle, DSGVO-klar |
| Observability | Sentry + Slack-Webhook | Fehler + Business-Events |
| Logging | structlog (JSON) + Correlation IDs | Debuggable in Produktion |
| LLM | Claude (Anthropic) · GPT (OpenAI) · Mistral | A/B-testbar via Prompt-Variants |
| Prompt-Mgmt | DB-gespeichert + Jinja2 + `<thinking>`-Split | Live-editierbar, versioniert, Backend strippt Reasoning-Block |
| Hosting | Hetzner CX23 + Docker Compose | EU, DSGVO, kostengünstig |
| TLS | Caddy + Let's Encrypt | Automatisch, zero-config |

---

## Datenspeicher

### PostgreSQL — 14 Tabellen (Stand v0.9.0)

| Tabelle | Domain | Beschreibung |
|---|---|---|
| `users` | users | Profile, Auth, Consent, Status (pending/active/suspended/deleted) |
| `refresh_tokens` | users | JWT Refresh-Token-Rotation + Reuse-Detection |
| `user_learning_profiles` | users | **Neu (v0.9.0)** Persistenter Layer-1-Snapshot: gse_baseline, gse_items, subscale_scores (MSLQ), LLM-generierte profile_interpretation (Haiku, max. 120 Wörter). UNIQUE(user_id) — unveränderlich nach Erstellung. |
| `chat_sessions` | chat | Lernsessions: Character, session_number, Modus, session_summary (Layer 2 kumulative Daten inkl. strongest_quote) |
| `messages` | chat | Einzelne Nachrichten inkl. detected_state, thinking_raw |
| `memory_chunks` | chat | Vectorized Insights (pgvector 1536-dim) für Cross-Session-Recall |
| `session_feedback` | chat | EMA-Signale (transfer_marker, wow, stuck, unclear) |
| `gse_results` | survey | GSE Pre/Post Messungen (Schwarzer & Jerusalem, 1995, 10 Items, 4-pt) |
| `mslq_results` | survey | MSLQ Pre/Post Messungen (Pintrich et al., 1991, 30 Items, 7-pt, 4 Subskalen) |
| `consent_logs` | survey | DSGVO Art. 7 Audit-Log (immutable append-only) |
| `roadmap_goals` | roadmap | Lernziele mit Status + Deadline |
| `user_profiles` | roadmap | Versioniertes Nutzerprofil (stable + dynamic + session-aggregated) |
| `prompt_templates` | prompts | Jinja2-Prompts versioniert, live editierbar, Character-spezifisch |
| `llm_usage` | (core) | Token-Verbrauch + Kosten pro LLM-Call (Cost-Tracking) |

**Alembic-Migrationen:** 9 versionierte Schritte, vollständig reversibel.

### Zwei-Schichten-Profil-Modell (v0.9.0)

```
Layer 1 — Immutable Baseline (user_learning_profiles)
    │   Erstellt einmalig als BackgroundTask nach Abschluss beider Pre-Surveys
    │   Inhalt: gse_baseline (float), gse_items (JSONB), subscale_scores (JSONB),
    │           profile_interpretation (Text, Haiku-generiert, max. 120 Wörter),
    │           interpretation_prompt_hash (SHA-256, für Reproduzierbarkeit)
    │   Race-Condition-Guard: UNIQUE(user_id) + IntegrityError-Catch
    │
Layer 2 — Kumulative Session-Daten (chat_sessions.session_summary JSONB)
    │   Aktualisiert nach jeder Session via extract_session_summary (Haiku)
    │   Felder: last_first_step, last_session_observation, insight_for_next_session,
    │           strongest_quote (neu: stärkster eigener Satz des Lernenden)
    │
    ▼
PromptContext — zusammengeführt in _build_system_prompt():
    session_number, session_phase, is_final_session, user_turns,
    learner_profile, gse_baseline, session_history_summary (alle Vorsessions),
    historical_quotes (strongest_quote je Session, für Sessions 6–10)
```

### pgvector (Semantisches Gedächtnis)
- `memory_chunks.embedding`: Vector(1536) für Approximate Nearest-Neighbour (IVFFLAT)
- **Pflicht:** jede Query gefiltert nach `user_id` — keine Cross-User-Leaks

---

## Sicherheits-Prinzipien

- CORS: Allowlist nur `kaia.rostek-dagmar.eu` + `localhost:3000`
- JWT: Access-Token 15min, Refresh-Token 30d rotierend
- Passwörter: bcrypt direkt (12 Runden) + SHA-256-Pre-Hash (passlib entfernt — unmaintained seit 2023, inkompatibel mit bcrypt>=4.0)
- Alle Admin-Aktionen: Audit-Log mit Timestamp + Begründung
- Secrets: nur via Umgebungsvariablen (nie in Code)
- TLS: HSTS enforced via Caddy
- pgvector: Row-Level-Security für User-Isolation
- Crisis-Detection: Pre-Filter vor jedem LLM-Call — 20+ deutsche Regex-Muster (Suizidgedanken, Selbstverletzung); bei Treffer statische Eskalations-Antwort (Telefonseelsorge 0800 111 0 111, Notruf 112), kein LLM-Processing

---

## Journey State Machine (Studienablauf)

Jeder Nutzer durchläuft eine definierte Journey. Der State wird on-the-fly aus der DB berechnet:

```
PRE_PENDING  ──(MSLQ Pre + GSE Pre abgeschlossen)──▶  ACTIVE (Session 1…10)
                                                           │
                                                  (session_count >= 10)
                                                           │
                                                           ▼
                                                     POST_PENDING
                                                           │
                                                  (MSLQ Post + GSE Post)
                                                           │
                                                           ▼
                                                       COMPLETED
```

**Gating-Regeln:**
- `POST /api/v1/chat/sessions` gibt 403 zurück, wenn `state ∈ {PRE_PENDING, POST_PENDING, COMPLETED}`
- Frontend leitet bei 403 mit `redirect`-Feld automatisch weiter (`/survey/pre` oder `/survey/post`)
- Pre-Messung: 30 MSLQ-Items (7-pt) + 10 GSE-Items (4-pt) — `GET /api/v1/survey/journey`
- Post-Messung: identisch, aber `measurement_type = "post"`
- Scoring server-seitig: Subskalen-Mittelwerte, Reverse-Coding (Items 33, 57)

---

## Studie-Modus

```
STUDY_MODE=development   # Alles erlaubt, Prompt-Änderungen möglich
STUDY_MODE=pilot         # Wie development, aber mit Metriken-Logging
STUDY_MODE=locked        # Prompt-Änderungen geblockt, Schema-Migrations geblockt
```

Während `locked`: CI lehnt PRs mit Prompt- oder Schema-Änderungen ab.

---

## LLM-Provider-Abstraktion

Alle LLM-Calls laufen durch einen einheitlichen Interface:
```
LLMProvider (Abstract)
├── ClaudeProvider    (Anthropic, USA — primärer Provider)
├── OpenAIProvider    (OpenAI, USA — A/B-Vergleich)
└── MistralProvider   (Mistral AI, EU — Datensouveränität)
```

Jeder Call loggt: `provider`, `model`, `input_tokens`, `output_tokens`,
`cost_eur`, `prompt_variant_id`, `latency_ms` in `llm_usage`.

---

## Deployment (Produktion)

```bash
ssh root@[hetzner-ip]
cd ~/kaia-app
git pull
docker compose -f infra/docker-compose.prod.yml --env-file .env up -d --build
```

Caddy übernimmt TLS-Terminierung und Routing zu Port 3000 (Web) und 8000 (API).

---

## Lokale Entwicklung

```bash
# DB + API in Docker (Port 5433 vermeidet Konflikt mit lokalem Postgres)
docker compose -f infra/docker-compose.dev.yml --env-file apps/api/.env up

# Frontend nativ (Hot-Reload)
cd apps/web && npm run dev
```

`docs/` wird in Produktion als Read-only-Volume gemountet (`../docs:/docs:ro`).
In der lokalen Entwicklung liest `readDoc()` aus `../../docs` relativ zum `apps/web`-Verzeichnis.

---

## Prompt-Architektur (v3)

Alle Prompt-Templates sind versioniert in der DB gespeichert und über `/admin/prompts` live editierbar.

```
User-Input
    │
    ├── [INPUT GUARD — geplant]
    │   ├── PII-Anonymisierung (Microsoft Presidio)
    │   ├── Topic-Constraint (BART zero-shot, verbotene Themen)
    │   ├── Injection-Detection (Regex-Patterns)
    │   └── Längenbegrenzung
    │
    ▼
_build_system_prompt() — PromptContext befüllen:
    │   ├── user_name, learning_topic (DB: users)
    │   ├── session_number, session_phase (early/mid/late), is_final_session (DB: chat_sessions)
    │   ├── user_turns (aus Message-History gezählt)
    │   ├── learner_profile (DB: user_learning_profiles.profile_interpretation)
    │   ├── gse_baseline (DB: user_learning_profiles.gse_baseline)
    │   ├── session_history_summary (load_all_session_contexts: alle Vorsessions, max. 9)
    │   ├── historical_quotes (load_historical_quotes: strongest_quote je Session, ab Session 6)
    │   └── last_first_step, last_session_observation, insight_for_next_session (Vorsession)
    │
    ▼
KAIA_PROMPT_V3_WARM (Jinja2-Template in DB — aktiv seit v0.9.0)
    │   ├── Session-Kontext-Header (session_number > 1: Vorsessions-Zusammenfassung)
    │   ├── Persistenter Lernenden-Profil-Block (learner_profile, nie explizit zitieren)
    │   ├── 8 interne Klassifikationsschritte im <thinking>-Block
    │   │   (Lazarus, Fragetyp, Crisis, Grenz, Grounded, Phase, Rupture, Erwünschtheit)
    │   ├── Session-5-Meilenstein-Trigger (obligatorisch, nicht optional)
    │   ├── Historical-Quotes-Block (Sessions 6–10: Widerspruchsarbeit Typ 3)
    │   ├── Session-10-Abschluss-Logik (3 simultane Aufgaben)
    │   └── <final_answer> — max. 80 Wörter, ein Impuls
    │
Claude API (claude-sonnet-4-6)
    │
    ├── Backend: <thinking>-Block strippen vor SSE-Ausgabe
    │
    ├── [OUTPUT GUARD — geplant]
    │   ├── Wort-Limit-Check (80 Wörter)
    │   ├── Kontext-Referenz-Check (Regex)
    │   └── Direkte-Lösung-Check (LLM-as-Judge)
    │
    ├── extract_session_summary (Haiku, BackgroundTask nach Session-Ende)
    │   ├── last_first_step, last_session_observation, insight_for_next_session
    │   └── strongest_quote (neu: stärkster eigener Satz des Lernenden)
    │
    ▼
User-Output (SSE-Stream)
```

**Prompt-Versionen:**
- `kaia_system_v1_warm` — Regression-Baseline, inaktiv
- `kaia_system_v2_warm` — Eval-Regression-Baseline (v2), inaktiv, erhalten für A/B-Vergleich
- `kaia_system_v3_warm` — **aktiv (seit v0.9.0)** — session-aware, Profil-integriert, Session-5-Trigger, Session-10-Logik
- `kaia_system_v1_challenging` · `kaia_system_v1_wild` — Eval-Charaktere, inaktiv

---

## Aktueller Stand (v0.9.0)

**Live auf kaia.rostek-dagmar.eu:**
- Landing Page, /wissenschaft, /release-notes, /architektur, /datenschutz, /impressum (öffentlich)
- Admin-Bereich: Dashboard, Chat-Test, Lerndesign (inkl. Nutzerprofil-Tab), Instrumente, Production Readiness, Changelog, Architektur, Kosten, Tagebuch, Roadmap, User-Approval, Prompt-Sandbox (v3), Thesis-Cockpit
- Bug-Report-Widget → Slack · Plausible Analytics (datenschutzkonform)
- Health-Endpoint GET /api/v1/health

**API-Endpunkte (vollständig):**
- Auth: register, login, refresh, logout, disclosure-ack
- Users: me, admin CRUD (approve/reject/delete)
- Chat: sessions CRUD, messages (SSE), opening/closing (SSE), end, feedback, meta-question
- Survey: `GET /journey`, `POST /mslq`, `POST /gse` (triggern BackgroundTask für Lernenden-Profil)
- Preregistration: submit, list, remove
- Prompts: list, get, update (Study-Lock-Guard)
- Crisis-Detection Pre-Filter vor allen LLM-Calls

**DB-Schema:** 14 Tabellen, 9 Alembic-Migrationen (vollständig reversibel)

**Journey State Machine:** PRE_PENDING → ACTIVE (1–10 Sessions) → POST_PENDING → COMPLETED
- Chat-Gating aktiv: 403 bei PRE_PENDING / POST_PENDING / COMPLETED
- Frontend-Redirect zu /survey/pre bzw. /survey/post
- Nach Pre-Survey: BackgroundTask erstellt `user_learning_profiles` (idempotent)

**Session-Architektur (v0.9.0 — vollständig implementiert):**
- `session_number`, `session_phase` (early/mid/late), `is_final_session`, `user_turns` im PromptContext
- Kumulatives Session-Gedächtnis: alle Vorsessions aggregiert (`load_all_session_contexts`)
- `strongest_quote` Extraktion pro Session (Basis für Widerspruchsarbeit und Session-10-Gegenüberstellung)
- Persistentes Lernenden-Profil (Layer 1): MSLQ + GSE → LLM-Interpretation einmalig erstellt
- Session-5 Meilenstein-Trigger (obligatorischer Halbzeit-Spiegel, hard-coded im Prompt)
- Session-10 Drei-Aufgaben-Abschluss (Gegenüberstellung + Autonomisierung + kein GSE-Priming)
- UI: "Session N von 10" im Header, stiller Kontext-Satz für Sessions 9+10

**Nächste Milestones:**
- MSLQ regelbasiertes Profil-Routing (4 Kombinationen → deterministischer Code-Pfad)
- Profil-Briefing-Panel vor Session 1 (einmaliges Transparenz-Panel)
- LLM-Evaluation-Framework (Claude vs. GPT-4o vs. Mistral)
- Studienstart: geplant Q3 2026

**Frontend implementiert:**
- Login, Registrierung mit DSGVO-Zweifach-Consent, AuthContext, AuthGuard
- /ki-disclosure mit Bestätigungs-Button
- /datenschutz (DSGVO Art. 15–21, Schrems-II)
- /admin/users (User-Approval UI, Server Actions)
- /admin/lerndesign (Sessions 1–10 + Nutzerprofil-MSLQ-Tab + Sentiment + Features)

**Prompt-System implementiert:**
- `KAIA_PROMPT_V3_WARM` — session-aware, Profil-integriert, Session-5-Trigger, Session-10-Logik
- `KAIA_PROMPT_V2_WARM` — erhalten als Eval-Regression-Baseline (inaktiv)
- Sandbox `/admin/prompts` — 3-Charakter-Vergleich, thinking-stripping, localStorage-Persistenz
- Forschungsgrundlage: `docs/PROMPT_ENGINEERING_RESEARCH.md` (6 Quellen, APA-7)

**Voranmeldungs-System:**
- `/vorregistrierung` — max. 50 Plätze, Live-Counter, Bestätigungsmail (Brevo), Slack-Notification
- `/admin/vorregistrierung` — Server Component, Entfernen mit E-Mail-Benachrichtigung

**Analytics:**
- Plausible Analytics (EU-Cloud) — datenschutzkonform, kein Cookie-Banner, DSGVO-konform
- Dashboard: https://plausible.io/kaia.rostek-dagmar.eu

**Observability (lokal):**
- Pre-Commit Hook: ruff + ESLint vor jedem Commit (`scripts/setup-hooks.sh`)
- Anleitung: `docs/ANALYTICS.md`

**Noch nicht implementiert:**
- Input/Output Guards (Presidio PII, BART Topic-Constraint, Injection-Detection)
- DSGVO-Endpunkte: Datenexport, Konto löschen, Consent-Update
- **Chat Core (SSE-Streaming) — nächster Schritt**
- LLM-Provider-Integration (Claude/GPT-4o/Mistral)
- GSE Pre-Messung Frontend
- Study-Lock (STUDY_MODE=locked)
