# KAIA – Systemarchitektur

> Diese Datei ist die einzige Quelle der Wahrheit für die Systemarchitektur.
> Jede strukturelle Änderung muss hier dokumentiert werden — CI prüft das.
> Die `/architektur`-Seite im Frontend rendert dieses Dokument direkt.

**Stand:** Juni 2026 · Version 0.6.0

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
│   │       │   └── users/
│   │       │       ├── models.py      User + RefreshToken ORM
│   │       │       ├── schemas.py     Pydantic I/O (Register, Login, …)
│   │       │       ├── repository.py  UserRepo + RefreshTokenRepo
│   │       │       ├── service.py     AuthService (login, refresh, logout)
│   │       │       ├── auth.py        POST /auth/* Endpoints
│   │       │       └── routes.py      GET /users/me
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
│           │   ├── (app)/      Chat, Auswertung, Selbstversuch (stub)
│           │   └── admin/      Passwortgeschützt via Server Component Layout
│           │       ├── page.tsx               Dashboard + API-Health
│           │       ├── login/
│           │       ├── users/                 User-Approval (pending/aktiv/gesperrt)
│           │       ├── production-readiness/  Deployment-Checkliste
│           │       ├── roadmap/               Feature-Roadmap (Filter, Agents, SHA)
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

### PostgreSQL (Relationale Daten)
- `users` — Profile, Auth, Consent, Status (pending/active/suspended/deleted)
- `sessions` — Chat-Sessions mit LLM-Metadaten
- `messages` — Einzelne Chat-Nachrichten
- `surveys` — GSE Pre/Post Messungen
- `observations` — Extrahierte Lernbeobachtungen
- `prompt_versions` — Versionierte Prompts (DB-gespeichert)
- `llm_usage` — Token-Verbrauch + Kosten pro Call
- `audit_events` — DSGVO-Audit-Log (append-only)
- `bug_reports` — Eingehende Bug-Reports

### pgvector (Semantisches Gedächtnis)
- User-spezifische Embeddings für Memory-Recall
- **Pflicht:** jede Query gefiltert nach `user_id` (Row-Level-Security aktiv)

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

## Prompt-Architektur (v2)

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
KAIA_PROMPT_V2_WARM (Jinja2-Template in DB)
    │   ├── 8 interne Klassifikationsschritte im <thinking>-Block
    │   │   (Lazarus, Fragetyp, Crisis, Grenz, Grounded, Phase, Rupture, Erwünschtheit)
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
    ▼
User-Output (SSE-Stream)
```

Prompt-Versionen: `kaia_system_v1_warm` (Regression-Baseline, inaktiv) · `kaia_system_v2_warm` (aktiv) · `kaia_system_v1_challenging` · `kaia_system_v1_wild`

---

## Aktueller Stand (v0.5.0)

**Live auf kaia.rostek-dagmar.eu:**
- Landing Page, /wissenschaft, /release-notes, /architektur, /datenschutz (öffentlich)
- Admin-Bereich: Dashboard, Production Readiness, Changelog, Architektur, Kosten, Tagebuch, Roadmap, User-Approval, Prompt-Sandbox (v2)
- Bug-Report-Widget → Slack
- Health-Endpoint GET /api/v1/health

**Backend — Auth + Crisis-Detection implementiert:**
- `POST /api/v1/auth/register` — Registrierung mit DSGVO-Pflichtconsent
- `POST /api/v1/auth/login` — JWT Access + Refresh-Token (httpOnly Cookie)
- `POST /api/v1/auth/refresh` — Token-Rotation mit Family-Reuse-Detection
- `POST /api/v1/auth/logout` — Alle Tokens revoken
- `POST /api/v1/auth/disclosure-ack` — KI-Disclosure bestätigt (Bearer Auth)
- `GET /api/v1/users/me` — Eigenes Profil
- `GET /api/v1/admin/users` — Alle Teilnehmenden (pending/aktiv/gesperrt) — Bearer Admin-Auth
- `POST /api/v1/admin/users/{id}/approve` — Teilnehmer:in freigeben — Bearer Admin-Auth
- `POST /api/v1/admin/users/{id}/reject` — Teilnehmer:in ablehnen (optionaler Grund) — Bearer Admin-Auth
- Crisis-Detection Pre-Filter (`app/core/crisis.py`) — vor allen LLM-Calls
- DB-Schema: `users` + `refresh_tokens` (Alembic Migration `c5fceead2dd4`)

**Frontend implementiert:**
- Login, Registrierung mit DSGVO-Zweifach-Consent, AuthContext, AuthGuard
- /ki-disclosure mit Bestätigungs-Button
- /datenschutz (DSGVO Art. 15–21, Schrems-II)
- /admin/users (User-Approval UI, Server Actions)
- /admin/roadmap (Filter-Bar, Agents, SHA)

**Prompt-System implementiert:**
- `KAIA_PROMPT_V2_WARM` — 29 Prompt-Engineering-Erkenntnisse, `<thinking>`-Split, Few-Shot Kontrast-Paare, Guardrails-Constraints
- Sandbox `/admin/prompts` — 3-Charakter-Vergleich, thinking-stripping, localStorage-Persistenz
- Prompt-Versionierung in DB (`kaia_system_v2_warm` aktiv, v1 als Regression-Baseline)
- Forschungsgrundlage: `docs/PROMPT_ENGINEERING_RESEARCH.md` (6 Quellen, APA-7)

**DB-Schema vollständig (v0.6.0):**
Alle 11 Tabellen live: `users` · `refresh_tokens` · `chat_sessions` · `messages` · `memory_chunks` · `gse_results` · `consent_logs` · `user_profiles` · `roadmap_goals` · `prompt_templates` · `llm_usage` · `audit_events` · `preregistrations`

**Voranmeldungs-System:**
- `/vorregistrierung` — max. 50 Plätze, Live-Counter, Bestätigungsmail (Brevo), Slack-Notification
- `/admin/vorregistrierung` — Server Component, Entfernen mit E-Mail-Benachrichtigung
- Abmelde-Link mit Token in jeder Bestätigungsmail

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
