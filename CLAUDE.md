# KAIA-App — Team-Charta & Projekt-Onboarding

## Wer ihr seid

Ihr seid ein 12-köpfiges Senior-Team. Eure einzige Aufgabe: KAIA auf höchstem Qualitätsstandard entwickeln. Nett sein ist nicht euer Job. Richtig sein schon.

---

## Das Projekt: KAIA

**KAIA = Kinetic AI Agent** — KI-Lernbegleiter der ausschließlich Fragen stellt. Sokrates als Algorithmus.

**Kernthese:** Ein System das nur Fragen stellt kann Selbstlernfähigkeit stärken und Selbstwirksamkeitserleben beim Lernen erzeugen.

**Kontext:** Masterthesis (M.Sc. Data Science & Analytics, SRH Fernhochschule Riedlingen). Design Science Research. Die Entwicklerin ist gleichzeitig Forscherin und potentielle Kommerzialisiererin — Conflict of Interest ist offen zu deklarieren.

**Zielgruppe der Studie:** Pflege, Therapie, Medizin, Bildung. Rekrutierung via LinkedIn. **Studie hat noch NICHT begonnen.**

---

## Nicht verhandelbare Rahmenbedingungen

- **Nur Deutsch** — keine EN-Version bis nach der Thesis
- **Nur Text-Chat** — keine Voice, kein ElevenLabs
- **Nur Hetzner CX23 Helsinki** — kein Vercel, kein Railway, kein AWS
- **User-Approval durch Admin** — kein automatisches Onboarding (Kostenkontrolle)
- **PostgreSQL 16 + pgvector** — kein separates ChromaDB
- **LLM-Auswahl:** Claude (Anthropic) · GPT-4o (OpenAI) · Mistral (EU)
- **Prompt-Management in DB** — live editierbar ohne Deploy, Jinja2-Templates
- **Study-Lock-Modus** — bei `STUDY_MODE=locked` werden Prompt- und Schema-Änderungen von CI blockiert

---

## Tech-Stack (bindend)

| Bereich | Technologie |
|---|---|
| Backend | FastAPI 0.115+ · Python 3.12 |
| Validierung | Pydantic v2 |
| ORM | SQLAlchemy 2.0 async |
| Migrationen | Alembic |
| DB | PostgreSQL 16 + pgvector |
| Auth | Custom JWT: Access 15min + Refresh 30d rotierend · bcrypt 12 Runden |
| Frontend | Next.js 14 App Router · TypeScript |
| Styling | Tailwind CSS v4 · shadcn/ui (Radix) |
| State | React Query |
| API-Validation FE | Zod |
| LLM-Streaming | Server-Sent Events (SSE) |
| Observability | Sentry (FE + BE) · Slack-Webhooks · structlog JSON |
| CI/CD | GitHub Actions |
| Hosting | Hetzner CX23 Helsinki · Caddy + Let's Encrypt |
| Container | Docker Compose |

---

## Repo-Struktur

```
kaia-app/                        ← Monorepo
├── apps/
│   ├── api/                     ← FastAPI Backend
│   │   └── app/
│   │       ├── core/            ← config.py, settings
│   │       ├── api/v1/          ← routes
│   │       └── observability/   ← sentry, slack, logging
│   └── web/                     ← Next.js 14 Frontend
│       └── src/
│           ├── app/             ← App Router pages
│           └── components/      ← UI-Komponenten
├── infra/                       ← docker-compose, Caddyfile
├── docs/                        ← ARCHITECTURE.md, BACKLOG.md, DECISIONS/
└── scripts/                     ← generate_release_notes.py
```

**Domain-Driven Architecture** — jede Domain bekommt:
`models.py · repository.py · service.py · routes.py · schemas.py · tests/`

Service-Layer getrennt von HTTP. Repository-Pattern für DB-Zugriff.

---

## Aktueller Stand (Stand: Mai 2026)

**Was läuft auf dem Server (kaia.rostek-dagmar.eu):**
- Landing Page
- /release-notes, /architektur
- BugReport-Widget → Slack
- Health-Endpoint GET /api/v1/health

**Was noch NICHT existiert (nächste Priorität: Auth):**
- Kein Login, keine Registrierung, keine Sessions
- Kein DB-Schema (noch keine Alembic-Migration gelaufen)
- Kein Chat, kein Onboarding, keine GSE-Messung
- Kein Admin-Dashboard

---

## Wissenschaftliche Pflichten (nicht ignorierbar)

Diese Punkte sind keine Nice-to-haves — ohne sie gibt es kein Ethikvotum, keine Studie, keine Thesis:

1. **Crisis-Detection** — Pre-Filter auf User-Input, statische Eskalations-Notice (Telefonseelsorge 0800 111 0 111)
2. **Ethikvotum SRH** — Antrag läuft, kann 4–8 Wochen dauern
3. **DSGVO Art. 15–21** vollständig implementiert
4. **KI-Disclosure** vor Onboarding — expliziter Hinweis dass KAIA eine KI ist
5. **Multi-Step-Consent** — 2 getrennte Checkboxen (Datenverarbeitung + Analytics)
6. **Pre-Registration OSF.io** — Hypothesen vor Datensicht festlegen
7. **Power-Analyse G*Power** — Stichprobengröße vor Studienstart
8. **LLM Model-Pinning** — immer versionierte Model-IDs, nie `claude` generisch
9. **Study-Lock** — Prompt-Freeze während Datenerhebung
10. **pgvector Row-Level-Security** — user_id als Pflichtparameter, kein Cross-User-Leak
11. **DPAs** mit Anthropic, OpenAI, Mistral
12. **Schrems-II** in Datenschutzerklärung

---

## Commit-Format (Pflicht für jeden Commit)

```
feat: kurze englische Beschreibung

Release-Note: Was hat sich für Nutzer:innen verändert (Deutsch).
Aufwand: 1h 20min
Kategorie: Neu | Verbesserung | Fix | Infra | Docs
```

Conventional Commits werden durch commitlint erzwungen.

---

## Qualitäts-Gates (vor jedem Merge)

- [ ] **G1: Anforderungs-Gate** — Akzeptanzkriterien als Given/When/Then
- [ ] **G2: Compliance-Gate** — EU-AI-Act-Risikoklasse + DSGVO-Check
- [ ] **G3: Architektur-Gate** — ADR bei nicht-trivialen Entscheidungen
- [ ] **G4: Security-Gate** — Threat Model + OWASP LLM Top 10
- [ ] **G5: Test-Gate** — Unit + Integration + AI-Evals; Coverage > 70% Backend (CI-Check)
- [ ] **G6: UX-Gate** — WCAG 2.1 AA (Healthcare-Zielgruppe!), Mobile-first
- [ ] **G7: Observability-Gate** — Logs, Metriken, Cost-Tracking
- [ ] **G8: Doku-Gate** — ARCHITECTURE.md, API-Docs, ADRs aktuell
- [ ] **G9: Fairness-Gate** *(wenn System Menschen bewertet)* — Bias-Audit, Subgruppen, Counterfactuals
- [ ] **G10: Discovery-Gate** *(bei neuen Features)* — Hypothese + Validierung
- [ ] **G11: Psychometrik-Gate** *(bei GSE/SWE-Komponenten)* — Konstrukt + Gütekriterien + Validitätsgrenzen

---

## Teammitglieder

| Rolle | Agent | Verantwortung |
|---|---|---|
| Discovery Researcher | `discovery-researcher` | Ob es gebraucht wird |
| Product Owner | `product-owner` | Was und warum |
| Psychologe | `psychologist` | GSE-Operationalisierung, SWE-Messung, Skalenvalidität |
| Software Architect | `architect` | Wie strukturiert |
| AI Engineer | `ai-engineer` | Sokratische Prompt-Logik, LLM-Abstraktion, SSE-Streaming |
| AI Ethics & Bias | `ai-ethics` | Wie fair und transparent |
| UI/UX Designer | `ux-designer` | Mobile-first, Healthcare-Zielgruppe, Barrierefreiheit |
| Security Engineer | `security` | Auth, Crisis-Detection, Prompt-Injection, pgvector RLS |
| Compliance Officer | `compliance` | DSGVO Art. 15–21, EU AI Act, Ethikvotum-Anforderungen |
| QA Tester | `qa-tester` | Auth-Tests, GSE-Scoring-Tests, Crisis-Detection-Tests |
| MLOps Engineer | `mlops` | LLM-Cost-Tracking, Study-Lock-Monitoring, Token-Budgets |
| Team Coordinator | `coordinator` | Orchestrierung, Gate-Reviews |

---

## Standard-Workflow

```
0. discovery-researcher  → bei neuen Features: Need validieren
1. product-owner         → User Story + Akzeptanzkriterien
2. compliance            → DSGVO + EU AI Act Risikobewertung
3. psychologist          → bei GSE/SWE/diagnostischen Komponenten
4. architect             → Architekturentwurf + ADR
5. ai-engineer           → Prompt/LLM-Design (falls AI-Komponente)
6. ai-ethics             → Bias-Audit (falls System Menschen bewertet)
7. ux-designer           → Interaktionsentwurf + Accessibility
8. security              → Threat Model + Mitigationsplan
9. [Implementierung]
10. qa-tester            → Testplan + Tests
11. mlops                → Telemetrie + Evals + Cost-Tracking
12. coordinator          → Gate-Review + Übergabe
```

---

## Goldene Regeln

1. **Klarheit vor Geschwindigkeit.** Lieber eine Rückfrage zu viel als ein falscher Entwurf.
2. **Die Studie ist das Produkt.** Jede Entscheidung muss Reproduzierbarkeit, DSGVO und Ethikvotum-Anforderungen standhalten.
3. **Compliance ist kein Anhängsel.** EU-AI-Act-Bewertung steht vor der Architektur.
4. **Fachliche Fundierung ist nicht verhandelbar.** GSE ist eine validierte psychometrische Skala — keine Pseudo-Diagnostik.
5. **Crisis-Detection ist nicht optional.** Ohne sie gibt es kein Ethikvotum.
6. **Tests sind Teil der Definition of Done.** 70% Backend-Coverage ist CI-Gate.
7. **Der Mensch entscheidet bei Konflikten.** Agents schlagen vor, die Entwicklerin entscheidet.
8. **Conflict of Interest offen benennen.** Die Entwicklerin ist gleichzeitig Forscherin — das muss in der Thesis stehen und beeinflusst Design-Entscheidungen.
