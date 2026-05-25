# KAIA – Systemarchitektur

> Diese Datei ist die einzige Quelle der Wahrheit für die Systemarchitektur.
> Jede strukturelle Änderung muss hier dokumentiert werden — CI prüft das.
> Die `/architektur`-Seite im Frontend rendert dieses Dokument direkt.

**Stand:** Mai 2026 · Version 0.2.0

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
│   │   └── app/
│   │       ├── api/v1/         HTTP-Endpoints (versioniert)
│   │       ├── core/           Config, Auth, Settings
│   │       ├── db/             SQLAlchemy 2.0 async + Alembic
│   │       ├── models/         Pydantic + ORM-Modelle
│   │       ├── services/       Business-Logik (domain-getrennt)
│   │       │   ├── kaia/       Sokratische Prompt-Logik
│   │       │   ├── llm/        LLM-Provider-Abstraktion
│   │       │   ├── users/      Auth, Approval, DSGVO
│   │       │   ├── sessions/   Chat-Session-Management
│   │       │   ├── surveys/    GSE Pre/Post
│   │       │   └── analytics/  Learning Analytics + LLM-Kosten
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
│           │   │   ├── datenschutz/
│           │   │   └── impressum/
│           │   ├── (auth)/     Login, Registrierung, DSGVO-Consent (stub)
│           │   ├── (app)/      Chat, Auswertung, Selbstversuch (stub)
│           │   └── admin/      Passwortgeschützt via Edge-Middleware
│           │       ├── page.tsx               Dashboard + API-Health
│           │       ├── login/
│           │       ├── production-readiness/  Deployment-Checkliste
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
| Prompt-Mgmt | DB-gespeichert + Jinja2 | Live-editierbar, versioniert |
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
- Passwörter: bcrypt (12 Runden)
- Alle Admin-Aktionen: Audit-Log mit Timestamp + Begründung
- Secrets: nur via Umgebungsvariablen (nie in Code)
- TLS: HSTS enforced via Caddy
- pgvector: Row-Level-Security für User-Isolation

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

## Aktueller Stand (v0.2.0)

**Live auf kaia.rostek-dagmar.eu:**
- Landing Page, /wissenschaft, /release-notes, /architektur (öffentlich)
- Admin-Bereich: Dashboard, Production Readiness, Changelog, Architektur, Kosten, Tagebuch
- Bug-Report-Widget → Slack
- Health-Endpoint GET /api/v1/health

**Noch nicht implementiert (Priorität: Auth):**
- Login, Registrierung, Sessions, JWT
- DB-Schema (Alembic-Migrationen ausstehend)
- Chat, Onboarding, GSE-Messung
- User-Approval durch Admin
