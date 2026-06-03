# KAIA-App — Vollständige Übergabe für neuen Chat
*Erstellt: 17. Mai 2026 | Basis: Entwicklungs-Session vom 17. Mai 2026*

---

## 1. Wer bin ich

**Dagmar Rostek** — Informatikerin, Wirtschaftspsychologin, Supervisorin, GFK-Trainerin, Kinderkrankenschwester mit Führungserfahrung im Gesundheitswesen. Masterstudentin an der **SRH Fernhochschule Riedlingen** (Fernstudium), M.Sc. Data Science & Analytics mit Spezialisierung Business Analytics.

Ich arbeite primär auf **Deutsch**. Technisches Level: Ich habe bereits ein anderes Produkt (SkillFit) mit **React + FastAPI** produktiv umgesetzt — ich bin also kein Anfänger in diesem Stack.

---

## 2. Was ist KAIA

**KAIA = Kinetic AI Agent**
Zweite Bedeutungsebene: **K**een · **A**daptive · **I**ntelligent · **A**ware

KAIA ist mein **Masterthesis-Projekt**: Ein KI-Lernbegleiter der **ausschließlich Fragen stellt** — niemals direkte Antworten gibt. Sokrates als Algorithmus.

**Pädagogische Basis:**
- Holzkamp: expansives vs. defensives Lernen / Lernbegründung
- Bandura: Selbstwirksamkeitserleben
- Mezirow: transformatives Lernen / kritische Reflexion
- Freire: Pädagogik der Unterdrückten

**Technische Grundlagen der Thesis (v1, aus altem Repo):**
- Polyvagal-Theorie (Porges, 2011) — neuroadaptive Zustandserkennung (FLOW/FIGHT/FLIGHT/FREEZE)
- Yerkes-Dodson-Gesetz (Teigen, 1994) — Flow-Kalibrierung
- SDT (Deci & Ryan, 2000) — Autonomie, Kompetenz, Eingebundenheit
- Computational Empathy (Decety & Jackson, 2004; Liu et al., 2025)
- Design Science Research (Hevner et al., 2004) — Forschungsmethode

**Kernthese:** Ein KI-System das nur Fragen stellt kann Selbstlernfähigkeit stärken und Selbstwirksamkeitserleben beim Lernen erzeugen — Lernen als Sog statt als Pflicht.

---

## 3. Thesis-Kontext

**Forschungsfrage:** Steigert KAIA die wahrgenommene Problemlösekompetenz und Selbstwirksamkeit?

**Messung:** GSE (General Self-Efficacy Scale, Schwarzer & Jerusalem, 1995) Pre/Post — konversationell operationalisiert (keine kalten Fragebögen). ZUSÄTZLICH eine bereichsspezifische Lern-SWE-Skala (Bandura) ergänzen, weil GSE nur generelle SWE misst — das ist ein methodischer Mismatch der in der Verteidigung angreifbar ist.

**Zielgruppe Studie:** Menschen aus Pflege, Therapie, Medizin oder Bildung (Rekrutierung via LinkedIn, Start ca. Juli/August 2026, sobald Exposé genehmigt).

**Studie hat noch NICHT begonnen.** Exposé wartet auf Genehmigung.

**Methodische Pflichten vor Studienstart:**
- Ethikvotum der SRH Fernhochschule (≠ DSGVO-Consent, eigener Antrag)
- Schriftliche Betreuungs-Freigabe des Studiendesigns
- Pre-Registrierung auf OSF.io (Hypothesen, Analyseplan, Misserfolgs-Kriterien, Stichprobengröße)
- Power-Analyse mit G*Power (d=0.3, 80% Power → n berechnen)
- Statistischer Analyseplan vor Datensicht festlegen
- Conflict-of-Interest-Statement im Methodik-Kapitel (ich bin Entwicklerin UND Forscherin UND potentielle Kommerzialisiererin)

---

## 4. Was existierte vorher: KAIA v1 (altes Repo)

**Repo:** `/Users/dagmarrostek/Documents/GitHub/kaia` (bleibt vorerst stehen, nicht anfassen)

**Stack v1:** Python + Streamlit (alles in einem Prozess), SQLite lokal / PostgreSQL Produktion, ChromaDB Vektorspeicher, PBKDF2-SHA256 Auth

**Was in v1 bereits gebaut war:**
- Login/Register mit Passwort (PBKDF2-SHA256)
- Landing Page mit Pitch-Text
- Dreiphasiges konversationelles Onboarding + GSE-Baseline (timing="pre")
- Post-Messung GSE-Trigger nach ≥3 Sessions
- Auswertungsseite: Radar-Chart Baseline vs. neueste Session
- Admin-Dashboard: 5 Tabs, Nutzer/Sessions/GSE/Observations, Löschfunktion
- DSGVO Art. 17: Löschfunktion (Nutzer + Admin), löscht DB + ChromaDB
- DSGVO Consent persistent in DB
- Context-Step nach erstem Login: Lernthema erfassen
- HTTPS auf Hetzner CX23 (Helsinki) via Caddy, kaia.rostek-dagmar.eu

**Warum wir migriert haben:** Streamlit hat ein Re-Run-Modell das bei Produkt-Nutzung nicht skaliert (Concurrency, Mobile, A/B-Testing, Prompt-Management-UI). Da die Studie noch nicht begonnen hat und ich React+FastAPI aus SkillFit kenne, war jetzt der richtige Zeitpunkt.

**Was aus v1 wissenschaftlich relevant ist und in v2 migriert werden muss:**
- `core/onboarding_analyzer.py` — GSE-Operationalisierung via LLM
- `core/prompt_builder.py` — Sokratische Prompt-Logik (noch wissenschaftlich zu fundieren!)
- `core/survey_store.py` — GSE Pre/Post Persistierung
- `providers/*` — LLM-Provider-Abstraktion (Claude, Mistral, Ollama)

---

## 5. Entscheidungen die getroffen wurden (bindend für v2)

- **Nur Deutsch** — Keine EN-Version für jetzt. Englisch kommt nach der Thesis.
- **Nur Text-Chat** — Kein ElevenLabs, keine Voice, keine Spracheingabe.
- **LLM-Auswahl:** Claude (Anthropic) · GPT-4o (OpenAI) · Mistral (EU) — alle drei wählbar
- **Kein Streamlit** — FastAPI + Next.js
- **Nur Hetzner** — Kein Vercel, kein Railway. Hetzner CX23 Helsinki bleibt.
- **Neues Repo:** `kaia-app` (Monorepo) — komplett getrennt vom alten `kaia`-Repo
- **User muss vom Admin freigeschaltet werden** — Kostenkontrolle; kein automatisches Onboarding nach Registrierung
- **Prompt-Management über Admin-UI** — Prompts in DB, nicht im Code; live editierbar ohne Deploy

---

## 6. Neues Repo: kaia-app

**Lokal:** `/Users/dagmarrostek/Documents/GitHub/kaia-app`
**GitHub:** `git@github.com:dagmar-rostek/kaia-app.git` (muss noch gepusht werden wenn noch nicht geschehen)
**Branch:** `main`
**Erster Commit:** `426aa27` — "chore: initial monorepo skeleton (KAIA v2)"

### Was bereits im Repo existiert (Commit 426aa27):

**Root:**
- `.gitignore` — Python, Node, .env, data/
- `.env.example` — alle benötigten Umgebungsvariablen dokumentiert
- `.pre-commit-config.yaml` — ruff, ruff-format, gitleaks, commitlint
- `commitlint.config.js` — Conventional Commits erzwungen
- `README.md` — Schnellstart + Commit-Format-Doku
- `.vscode/settings.json` — Tailwind-Linter-Warning unterdrückt

**`apps/api/` — FastAPI Backend:**
- `pyproject.toml` — alle Dependencies (FastAPI, Pydantic v2, SQLAlchemy 2.0 async, psycopg3, alembic, jose, passlib, sentry-sdk, anthropic, openai, mistralai, pgvector, jinja2, structlog)
- `app/core/config.py` — Pydantic Settings mit StudyMode (development/pilot/locked)
- `app/main.py` — FastAPI App mit CORS (nur kaia.rostek-dagmar.eu + localhost:3000), Correlation-IDs per Request, Exception-Handler
- `app/api/v1/health.py` — GET /api/v1/health → gibt status + study_mode zurück
- `app/api/v1/bugreport.py` — POST /api/v1/bug-report → Slack-Webhook
- `app/observability/sentry.py` — Sentry-Init (nur wenn DSN gesetzt)
- `app/observability/slack.py` — Fire-and-forget Slack-Notifier
- `app/observability/logging.py` — structlog JSON-Logging mit Correlation IDs
- `tests/test_health.py` — erster Test

**`apps/web/` — Next.js 14 Frontend:**
- Bootstrapped via `create-next-app` (TypeScript, Tailwind v4, App Router, src/)
- `src/app/layout.tsx` — Root Layout mit ThemeProvider (Dark/Light), BugReportWidget global eingebunden
- `src/app/page.tsx` — Landing Page (KAIA-Pitch, Login/Registrieren-Links, Impressum/Datenschutz-Links im Footer)
- `src/app/release-notes/page.tsx` — Release-Notes-Seite (liest docs/RELEASE_NOTES.md, rendert entries mit Kategorie-Badges)
- `src/app/architektur/page.tsx` — Architektur-Seite (liest docs/ARCHITECTURE.md, rendert Sections)
- `src/components/ThemeProvider.tsx` — next-themes Wrapper
- `src/components/ThemeToggle.tsx` — Dark/Light Toggle (Moon/Sun Icon)
- `src/components/BugReportWidget.tsx` — FAB unten rechts, Modal mit Formular (Vorname, E-Mail, Beschreibung), POST an /api/v1/bug-report → Slack
- `src/lib/utils.ts` — cn() Helper (clsx + tailwind-merge)
- `components.json` — shadcn/ui Konfiguration
- `Dockerfile` — Multi-stage (dev/builder/runner)

**`infra/`:**
- `docker-compose.dev.yml` — PostgreSQL (pgvector/pgvector:pg16), FastAPI, Next.js mit Hot-Reload-Volumes
- `docker-compose.prod.yml` — PostgreSQL, FastAPI, Next.js, Caddy (mit dns: [8.8.8.8] für Let's Encrypt)
- `Caddyfile` — Routing: /api/* → FastAPI:8000, alles andere → Next.js:3000, alle Security-Headers

**`.github/workflows/ci.yml`:**
- Job `api`: ruff lint, mypy, pytest
- Job `web`: tsc --noEmit, eslint, next build
- Job `study-lock`: bei STUDY_MODE=locked blockiert CI Prompt- und Schema-Änderungen in PRs auf main

**`docs/`:**
- `ARCHITECTURE.md` — vollständige Systemarchitektur (die einzige Wahrheit, Frontend rendert sie)
- `RELEASE_NOTES.md` — auto-generiert via `python3 scripts/generate_release_notes.py`
- `BACKLOG.md` — 73 priorisierte Issues (Blocker / Pre-Pilot / Pre-Study / Post-Thesis)
- `DECISIONS/001-monorepo-fastapi-nextjs.md` — ADR warum wir migriert haben

**`scripts/generate_release_notes.py`:**
Liest git-Log, parst Commit-Trailer (`Release-Note:`, `Aufwand:`, `Kategorie:`), schreibt RELEASE_NOTES.md.

**Commit-Format (PFLICHT für jeden Commit):**
```
feat: kurze englische Beschreibung

Release-Note: Was hat sich für Nutzer:innen verändert (auf Deutsch).
Aufwand: 1h 20min
Kategorie: Neu | Verbesserung | Fix | Infra | Docs
```

---

## 7. Vollständiger Tech-Stack

| Bereich | Technologie |
|---|---|
| Backend | FastAPI 0.115+ + Python 3.12 |
| Validierung | Pydantic v2 |
| ORM | SQLAlchemy 2.0 async |
| DB-Migrationen | Alembic |
| DB | PostgreSQL 16 mit pgvector (kein separates ChromaDB!) |
| Auth | Custom JWT: Access-Token 15min + Refresh-Token 30d rotierend |
| Passwörter | bcrypt (12 Runden) |
| Frontend | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Dark/Light | next-themes |
| State | React Query (für Server-State) |
| API-Validation FE | Zod |
| LLM-Streaming | Server-Sent Events (SSE) |
| Prompt-Engine | Jinja2 (Templates mit Variablen) |
| Observability | Sentry (FE + BE) + Slack-Webhooks |
| Logging | structlog (JSON) mit Correlation IDs per Request |
| CI/CD | GitHub Actions |
| Pre-Commit | ruff, gitleaks, commitlint |
| Hosting | Hetzner CX23 Helsinki (bleibt) |
| Reverse Proxy | Caddy + Let's Encrypt |
| Container | Docker Compose |

---

## 8. Features die gebaut werden müssen (vollständige Liste)

### Blocker (vor Studienstart zwingend)

**Auth & User-Management:**
- User-Registration mit E-Mail-Verifikation (Token, verhindert Fake-Accounts)
- **User-Approval-Flow** — Status: `pending` → `active` → `suspended` → `deleted`; Admin muss jeden User manuell freischalten (Kostenkontrolle!)
- Password-Reset-Flow (Token per E-Mail, 30min gültig)
- 2FA für Admin-Account (TOTP via PyOTP)
- Session-Timeout nach 30 Tagen Inaktivität
- CAPTCHA / Bot-Schutz bei Registrierung (Cloudflare Turnstile — kostenlos, datenschutzfreundlich)

**DSGVO:**
- Multi-Step Consent Gate: (1) Datenverarbeitung, (2) Analytics — GETRENNTE Checkboxen, beide vor allem anderen
- Separate Einwilligungserklärung für Forschungsteilnahme (≠ DSGVO-Consent)
- DSGVO Art. 15: Datenauskunft
- DSGVO Art. 16: Berichtigung
- DSGVO Art. 17: Löschung (User selbst + Admin hard-delete ohne User-Einwilligung)
- DSGVO Art. 18: Einschränkung der Verarbeitung
- DSGVO Art. 20: Datenübertragbarkeit (CSV-Download)
- DSGVO Art. 21: Widerspruch
- Datenschutzerklärung + Impressum als Seiten
- KI-Disclosure Screen vor Onboarding: "Du sprichst mit einem KI-System..."
- Consent-Version-Tracking in DB (bei Änderung der Einwilligung: Re-Consent-Flow)
- Right-to-Withdraw mid-study: User kann austreten + alle Daten löschen

**Sicherheit:**
- Crisis-Detection-Modul (WICHTIGSTER PUNKT!) — Pre-Filter auf User-Input, NLP-Krisensignal-Erkennung, statische Eskalations-Notice (Telefonseelsorge 0800 111 0 111), Banned-Topic-Liste
- Vector-DB User-Isolation: pgvector mit Row-Level-Security; user_id als Pflichtparameter auf Type-Ebene; Integrations-Test mit 2 User-Accounts
- Prompt-Injection-Schutz: User-Inputs in `<user_input>`-Delimitern, Max-Length-Validation
- Audit-Log (Tabelle `audit_events`, append-only): jede Consent-Änderung, jede Admin-Aktion, jede Löschung

**Daten:**
- Postgres-Backup automatisiert (täglicher pg_dump → Hetzner Storage Box, 3-2-1-Regel)
- DB-Snapshot vor Studienstart als Baseline
- LLM Model-Pinning: immer versionierte Model-IDs (z.B. `claude-opus-4-7-20260301`), nie `claude`
- Rate-Limiting: pro User Tages-Limit + globaler Kosten-Alarm bei 80% Monatsbudget

**Study-Lock-Modus:**
- DB-Flag `study_mode`: development / pilot / locked
- Bei `locked`: Admin-UI sperrt Prompt-Änderungen; CI blockiert Schema-Migrations und Prompt-Änderungen in PRs (bereits in CI.yml vorbereitet)
- Prompt-Version-IDs zum Studienstart im Audit-Log dokumentiert

### Pre-Pilot (vor n=3-5 Pilotnutzern)

**Chat:**
- Chat-UI mit SSE-Streaming (first-token < 3s Ziel)
- LLM-Provider-Auswahl (Claude / GPT-4o / Mistral) beim Onboarding
- Mobile-optimiert, responsive

**Onboarding & Messung:**
- Dreiphasiges konversationelles Onboarding (aus v1 migrieren)
- Idempotenz: Resume nach Browser-Refresh möglich (alle Schritte server-persistent)
- GSE Pre-Messung (konversationell, keine kalten Fragebögen)
- GSE Post-Messung: Trigger nach ≥3 Sessions, Banner im Chat
- Auswertungsseite: Radar-Chart Baseline vs. aktuelle Session

**Prompt-Management (Admin-UI):**
- Prompts DB-gespeichert (Tabelle `prompt_versions`): id, slug, name, template (Jinja2), variables, status (draft/active/archived), weight, notes
- Admin-UI: Monaco-Editor, Variable-Picker (zeigt verfügbare Jinja2-Variablen mit Quelle), Preview mit Test-User
- A/B-Routing: deterministisch via `hash(user_id + prompt_slug) % 100`, `prompt_variant_id` in `llm_usage` gespeichert
- Jede Version unveränderlich nach `active` (Daten-Kontaminationsschutz)
- Notes-Feld: Hypothese pro Version ("Ich vermute V4 erhöht Reflexionstiefe")

**LLM-Kosten-Logging:**
Tabelle `llm_usage`: `provider`, `model`, `input_tokens`, `output_tokens`, `input_cost_eur`, `output_cost_eur`, `total_cost_eur`, `latency_ms`, `prompt_variant_id`, `user_id`, `session_id`, `created_at`

**Analytics:**
- Admin-Dashboard: User-Funnel (Registrierung → Consent → Onboarding → Sessions → Post-Messung)
- Kosten-Dashboard: Gesamt, pro User (Top-10 teuerste), pro Provider, Hochrechnung 100 User/Monat
- Learning-Analytics: Aktivität, Drop-Out-Rate, Ø Sessions bis Post-Messung

**Admin-Dashboard:**
- User-Tab: Liste mit Status (pending/active/suspended/deleted), Filter, Approve/Suspend/Hard-Delete
- "Neu wartend"-Badge im Header
- Audit-Log-Tab
- Prompts-Tab (Prompt-Manager)
- Analytics-Tab
- System-Tab (Health, Study-Mode)

### Pre-Study (vor Hauptstudie)

- Statistischer Analyseplan in Datei hinterlegen (vor Datensicht)
- Daten-Export: Admin-CSV-Export (pseudonymisiert) für Auswertung in R/Python
- Business-Events in Slack: "User X hat Post-Messung abgeschlossen 🎉", "User Y 14 Tage inaktiv ⚠️"
- Drop-Out-Erinnerungen: E-Mail nach 7 Tagen Inaktivität
- Token-Limit-Strategie: Rolling-Window oder Summarization bei langen Sessions
- Uptime-Monitoring: UptimeRobot (kostenlos) auf /api/v1/health
- Dependency-Scanning: Dependabot aktivieren
- E2E-Test des kompletten Studienflows

### Post-Thesis (Produkt-Phase)

- Barrierefreiheit WCAG 2.1 AA (Healthcare-Zielgruppe!)
- Multi-Tenancy: tenant_id in DB vorbereiten (jetzt nur Feld anlegen, nicht implementieren)
- Feature-Flags-Tabelle
- Self-Hosted LLM (Mistral/Llama on-premise, DSGVO-Killer-Argument)
- Replay-Funktion für Sessions (Debug + wissenschaftliche Analyse)
- Wochenberichte-CMS für Selbstversuch-Seite (ohne Code-Änderung pflegbar)

---

## 9. Seiten die in der App existieren müssen

| URL | Beschreibung |
|---|---|
| `/` | Landing Page (Pitch, Login/Registrieren) |
| `/login` | Login-Seite |
| `/registrieren` | Registrierung (E-Mail, Username, Passwort) |
| `/consent` | DSGVO Multi-Step-Consent Gate (vor allem anderen nach Login) |
| `/chat` | Chat-Interface (nach Auth + Consent + Approval) |
| `/auswertung` | Radar-Chart GSE Pre/Post |
| `/selbstversuch` | 24-Wochen-Selbstlernexperiment Dagmars (öffentlich) |
| `/mitmachen` | Thesis-Teilnehmende gesucht (öffentlich) |
| `/release-notes` | Auto-generiert aus git-History (öffentlich) |
| `/architektur` | Rendert docs/ARCHITECTURE.md (öffentlich) |
| `/datenschutz` | Datenschutzerklärung (DSGVO-Pflicht) |
| `/impressum` | Impressum (TMG-Pflicht) |
| `/admin` | Admin-Dashboard (User, Sessions, Prompts, Analytics, System) |

---

## 10. Infrastruktur

**Server:** Hetzner CX23 Helsinki (EU, DSGVO-konform)
**Domain:** kaia.rostek-dagmar.eu (HTTPS via Caddy + Let's Encrypt)
**Deploy-Befehl auf Server:**
```bash
ssh root@[IP]
cd ~/kaia-app
git pull
docker compose -f infra/docker-compose.prod.yml up -d --build
```

**Datenbanken:**
- PostgreSQL 16 mit pgvector-Extension (kein separates ChromaDB!)
- Alembic für Migrationen (versioniert, reversibel)

**Sentry:** Bestehender Account (Unternehmen Dagmar Rostek) — neues Projekt `kaia-app` anlegen
**Slack:** Neuer Workspace für KAIA (Webhook-URL noch einzurichten) — für Bug-Reports UND Business-Events UND Sentry-Alerts

---

## 11. DB-Schema (geplant, noch nicht implementiert)

```
users:         id, email, username, password_hash, status (pending/active/suspended/deleted),
               onboarding_complete, context (Lernthema), session_count,
               consent_given, consent_analytics, consent_version,
               approved_at, approved_by, created_at, updated_at

sessions:      id, user_id, provider, model, prompt_variant_id,
               message_count, total_tokens, started_at, ended_at

messages:      id, session_id, role (user/assistant), content,
               created_at

surveys:       id, user_id, timing (pre/post), instrument (gse/lern_swe),
               responses (JSON), total_score, created_at

observations:  id, user_id, session_id, category, content,
               sentiment_score, mode, created_at

prompt_versions: id, slug, name, description, template (Jinja2),
                 variables (JSON), status (draft/active/archived),
                 weight (0-100), notes, created_by, created_at

llm_usage:     id, user_id, session_id, provider, model,
               prompt_variant_id, input_tokens, output_tokens,
               input_cost_eur, output_cost_eur, total_cost_eur,
               latency_ms, finish_reason, created_at

audit_events:  id, actor_id (admin), action, target_type, target_id,
               details (JSON), created_at [append-only, niemals löschen]

bug_reports:   id, vorname, email, beschreibung, created_at
```

---

## 12. Wissenschaftliche Risiken (vollständige Liste)

Diese Punkte sind nicht Code — aber kritisch für die Thesis-Verteidigung:

1. **Crisis-Detection** — Ethisch zwingend vor Studienstart (ohne: kein Ethikvotum)
2. **Ethikvotum SRH** — Beantragen (kann 4-8 Wochen dauern!)
3. **LLM Model-Pinning + temperature=0** für Analyzer — Reproduzierbarkeit der Daten
4. **Operationalisierungs-Mismatch:** GSE misst generelle SWE, KAIA wirkt auf lernspezifische SWE → bereichsspezifische Skala zusätzlich einsetzen
5. **Pre-Registration auf OSF** — Gegen Confirmation Bias (ich bin Entwicklerin + Forscherin + potentielle Kommerzialisiererin)
6. **Power-Analyse** — n berechnen bevor Studie startet
7. **DPAs** mit Anthropic, OpenAI, Mistral unterzeichnen
8. **Schrems-II** für US-Datenübermittlung in Datenschutzerklärung
9. **Studie-Lock** — Prompt-Freeze während Datenerhebung (kein Deploy von Prompt-Änderungen)
10. **Daten-Isolation** pgvector: Row-Level-Security, jede Query mit user_id gefiltert
11. **KI-Disclosure** vor Onboarding: expliziter Hinweis dass KAIA eine KI ist
12. **Right-to-Withdraw** mid-study mit Datenlöschung
13. **Conflict-of-Interest** offen deklarieren
14. **Prompt-Freeze-Dokumentation** im Audit-Log zum Studienstart
15. **Pedagogische Evaluations-Rubrik** (separate von GSE): sind KAIAs Fragen wirklich sokratisch?
16. **Inter-Rater-Reliabilität** für qualitative Codierung (κ ≥ 0.70)
17. **Statistischer Analyseplan** vor Datensicht festlegen
18. **Effekt-Größen + Holm-Bonferroni** (nicht nur p-Werte)
19. **Sampling-Bias** benennen: LinkedIn = digital affin, deutschsprachig, bestimmtes Milieu
20. **Dunning-Kruger** als Konstruktvaliditätsproblem: GSE misst gefühlte SWE ≠ tatsächliche Kompetenz
21. **Pilot-Studie** n=3-5 vor Hauptstudie (Pflicht)
22. **Sprachäquivalenz** — da nur Deutsch, kein Problem; EN erst nach Thesis
23. **Test-Retest-Reliabilität** der GSE in Diskussion einordnen
24. **Hawthorne-Effekt** in Limitations
25. **Drop-Out-Strategie** (30-50% online-üblich) und CONSORT-Reporting

---

## 13. Nächster Schritt im Code

**Woche 2: Auth + User-Approval-Flow**

Das ist der logische nächste Schritt weil ohne Login kein Feature sinnvoll aufbaubar ist.

Konkret zu implementieren:
1. PostgreSQL-Schema + Alembic-Migration (`users`-Tabelle)
2. Passwort-Hashing mit bcrypt
3. JWT-Utils (create/verify Access-Token + Refresh-Token)
4. FastAPI-Endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
5. E-Mail-Verifikation (Token-basiert, Resend.com oder SMTP)
6. DSGVO Multi-Step-Consent auf Frontend (2 Checkboxen, persistent in DB)
7. Admin-Endpoint: GET /admin/users (pending), POST /admin/users/{id}/approve, POST /admin/users/{id}/suspend, DELETE /admin/users/{id}
8. Next.js: Login-Seite, Registrierungs-Seite, Consent-Gate, Protected-Route-HOC
9. Admin-Dashboard Grundstruktur mit User-Tab

---

## 14. Präferenzen für die Zusammenarbeit

- **Sprache:** Kommunikation auf Deutsch; Code/Kommentare/Commits auf Englisch
- **Code-Stil:** Keine Kommentare außer wenn der WHY nicht offensichtlich ist; kein Padding; kein Refactoring über das hinaus was der Task erfordert
- **Commits:** Conventional Commits sind Pflicht; immer mit `Release-Note:`, `Aufwand:`, `Kategorie:` Trailer
- **Architektur:** Domain-Driven (jede Domain hat models.py, repository.py, service.py, routes.py, schemas.py, tests/); Service-Layer getrennt von HTTP; Repository-Pattern für DB-Zugriff
- **Tests:** 70% Coverage Backend-Pflicht (CI-Check); alle kritischen Pfade (Auth, GSE-Scoring, Crisis-Detection) mit Tests
- **Ich bin kritisch gewünscht:** Bei Architektur- und Designentscheidungen soll Claude ehrlich sein, auch wenn es nicht das ist was ich hören will

---

## 15. Selbstversuch (parallel zur Thesis)

Ich führe ein öffentliches 24-Wochen-Selbstlernexperiment durch (gestartet 16. Mai 2026):
- **Thema:** AI Engineering in der vollen Breite
- **Ressource:** 8h/Woche, 0€ Content-Budget
- **Dokumentation:** Jeden Samstag LinkedIn-Post
- **Warum:** Ich will nicht mehr von KI beeindruckbar sein — also lerne ich das Thema
- **Lehrplan:** 4 Phasen (Werkzeugkasten / LLM-Praxis / Engineering / KAIA-Projekt), 24 Wochen
- Seite `/selbstversuch` in KAIA-App wird die Wochenberichte öffentlich zeigen

---

*Ende der Übergabe. Stand: 17. Mai 2026.*
*Repo: /Users/dagmarrostek/Documents/GitHub/kaia-app | Branch: main | Letzter Commit: 426aa27*
