# Kapitel 4 — Technische Implementierung

> **Stand:** 13. Juli 2026 · **Version:** 1.0  
> **Reviewer:** Architect · Security · MLOps  
> **Geplanter Umfang:** ca. 20–24 Seiten (~5.000–6.000 Wörter)  
> **Status:** Vollständig — alle implementierten Komponenten dokumentiert

---

## 4.1 Architekturentscheidungen und Methodik

### 4.1.1 Design Science Research als Entwicklungsparadigma

Die Entwicklung von KAIA folgt dem iterativen Design-Evaluate-Revise-Zyklus nach Hevner et al. (2004). Jede Architekturentscheidung wird vor dem Hintergrund der Anforderungen aus Kapitel 3 begründet; Kompromisse zwischen wissenschaftlichen, technischen und datenschutzrechtlichen Anforderungen sind in Architecture Decision Records (ADRs) dokumentiert. Das System ist als DSR-Artefakt konzipiert: Es ist nicht nur Werkzeug, sondern gleichzeitig Gegenstand der Forschung und trägt durch seine Entscheidungshistorie zur wissenschaftlichen Dokumentation bei.

### 4.1.2 Tech-Stack und Begründung

| Komponente | Technologie | Begründung |
|---|---|---|
| Backend | FastAPI 0.115+ / Python 3.12 | Async-native, OpenAPI-kompatibel, ASGI-basiertes SSE-Streaming ohne Workarounds |
| Validierung | Pydantic v2 | Schema-First-Ansatz, automatische Serialisierung, DSGVO-konforme Feldspezifikation |
| ORM | SQLAlchemy 2.0 async | Async-Query-Support, typsicheres Mapped-Column-API, native PostgreSQL-Dialekte |
| Migrationen | Alembic | Revisionsgraph, Rollback-fähige Schema-Änderungen, Study-Lock-kompatibel |
| Datenbank | PostgreSQL 16 + pgvector | EU-Standard, Row-Level-Security-Konzept, IVFFLAT-Index für ANN-Suche |
| Auth | Custom JWT (PyJWT) + bcrypt-12 | Keine Drittanbieter-Abhängigkeit, vollständige Kontrolle über Tokenpfade |
| Frontend | Next.js 14 App Router / TypeScript | Server Components, kein Hydration-Overhead für statische Auth-Checks |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) | Accessible-by-Default-Komponenten, WCAG 2.2 AA-Grundlage |
| State | React Query | Deklaratives Caching, optimistische Updates, Server-State-Synchronisation |
| API-Validation FE | Zod | Typsichere Schema-Validierung auf Client-Seite |
| LLM-Streaming | Server-Sent Events (SSE) | Unidirektionales Streaming ohne WebSocket-Komplexität |
| Hosting | Hetzner CX23 Helsinki | EU-Serverstandort, DSGVO-konform, Schrems-II-unproblematisch |
| Reverse Proxy | Caddy + Let's Encrypt | Automatisches TLS, Upstream-Buffering deaktivierbar für SSE |
| Container | Docker Compose | Reproduzierbare Umgebungen, kein Kubernetes-Overhead für Einzelserver |
| CI/CD | GitHub Actions | Linting (ruff), Typprüfung (mypy), Tests (pytest, Coverage ≥ 65 %), Build-Check |
| Observability | Sentry (FE + BE) + Slack-Webhooks + structlog JSON | Vollständige Fehlererfassung mit Kanal-Trennung |
| LLM-Provider | Anthropic / OpenAI / Mistral | Evaluation aller drei; Mistral als EU-Verarbeitungsoption |

**Warum kein Managed Auth (Auth0, Supabase)?** Die Studie erfordert vollständige Kontrolle über alle Datenpfade. Drittanbieter für Auth würden unkontrollierte Datentransfers in die USA erzeugen und wären mit dem Schrems-II-Anforderungsprofil der Thesis nicht vereinbar.

**Warum Boring Technology?** Das Projekt folgt bewusst dem Prinzip der langweiligen, bewährten Technologie. Postgres statt eines Vektordatenbankspezialisten, SSE statt WebSockets, FastAPI statt eines ML-Frameworks — jede Abweichung von diesem Prinzip bedarf einer konkreten Begründung.

---

## 4.2 Systemüberblick und Komponentendiagramm

KAIA folgt einem Vier-Schichten-Modell: Texteingabe → LLM-Verarbeitung → zweischichtiges Gedächtnis → DSGVO-konforme Datenhaltung. Das Backend ist nach Domain-Driven Design strukturiert; jede Domain enthält die Dateien `models.py`, `repository.py`, `service.py`, `routes.py`, `schemas.py` und einen `tests/`-Ordner. Der Service-Layer ist vom HTTP-Layer getrennt; der Repository-Layer abstrahiert alle Datenbankoperationen.

```
Nutzer-Browser
    │ HTTPS (Caddy)
    ↓
Next.js 14 (App Router, TypeScript)
    │ API-Calls / SSE
    ↓
FastAPI (uvicorn, async)
    ├── core/             — JWT-Auth, Crisis-Detection, Settings
    ├── domains/users/    — Auth, Approval, E-Mail, DSGVO
    ├── domains/chat/     — Session, Streaming, Summary, EMA
    ├── domains/prompts/  — Jinja2-Templates, DB-Versionierung
    ├── domains/survey/   — GSE, MSLQ, ConsentLog
    ├── domains/eval/     — Eval-Pipeline, LLM-Judge, Simulation
    └── observability/    — Sentry, Slack, structlog
    │
    ↓
PostgreSQL 16 + pgvector (Hetzner Helsinki)
    ├── users, refresh_tokens
    ├── chat_sessions, messages, memory_chunks, session_feedback
    ├── user_learning_profiles
    ├── gse_results, mslq_results, consent_logs
    ├── prompt_templates
    ├── eval_runs, eval_results, eval_transcripts
    └── llm_usage, app_settings
    │
    ↓ API-Calls (outbound)
Anthropic / OpenAI / Mistral
```

---

## 4.3 Datenmodell und DSGVO-Implementierung

### 4.3.1 Kernentitäten

Das Datenbankschema wird vollständig über Alembic-Migrationen verwaltet und ist an den Studienstand gebunden (Study-Lock verhindert Schema-Änderungen während der Datenerhebung).

**`users`** — Zentrale Entität; enthält neben Authentifizierungsdaten alle Consent-Felder (mit Timestamp, nicht nur Boolean), den Onboarding-Status, Admin-Approval-Felder, Sicherheitsfelder (failed_login_count, locked_until), das Lerntopic, die optionale per-User-LLM-Zuweisung (`kaia_model`) und Soft-Delete-Felder (`deleted_at`, `deletion_reason`). Der Status durchläuft die Zustände `PENDING → ACTIVE → SUSPENDED/DELETED`. Ein Simulation-Flag (`is_simulation`) markiert synthetische Nutzer, die vom Eval-System erzeugt werden, und schließt diese vom Cost-Guard aus.

**`refresh_tokens`** — SHA-256-Hash des Tokens (kein Klartext), UUID-Family für familienbasierte Reuse-Detection, User-Agent und IP-Adresse für den Audit-Trail, `revoked_at` + `revoke_reason` für die Revokations-Geschichte.

**`chat_sessions`** — Eine Lernsession pro Nutzerin und Woche; enthält den Charakter (warm/challenging/wild), die Session-Nummer, Initial- und Finalmodus für die neuroadaptive Zustandsdokumentation, sowie `session_summary` (strukturiertes JSON, nach Sitzungsende von claude-haiku-4-5-20251001 extrahiert).

**`messages`** — Einzelne Gesprächsnotizen mit Rolle (user/assistant), Zeitstempel, dem erkannten Zustand (`detected_state`) und dem Interaktionsmodus (`interaction_mode`) für KAIA-Antworten. Der Thinking-Block (`thinking_raw`) wird serverseitig gespeichert, aber nicht an den Client gestreamt — er dient dem wissenschaftlichen Audit-Trail.

**`memory_chunks`** — Vektorisierte Gesprächsfragmente (1536 Dimensionen, OpenAI-Embedding-Dimension); user_id-gebunden als RLS-Äquivalent; IVFFLAT-Index für approximative Nearest-Neighbour-Suche.

**`session_feedback`** — EMA-Signale während der Session: vier Typen (transfer_marker, wow, stuck, unclear), optional an eine konkrete message_id gebunden.

**`user_learning_profiles`** — Unveränderliches Baseline-Profil, genau einmal nach Abschluss beider Prä-Surveys erzeugt. Enthält `gse_baseline` (Float), `gse_items` (JSONB), `subscale_scores` (JSONB, vier MSLQ-Subskalen), `profile_interpretation` (LLM-generierter Interpretationstext, einmalig erzeugt und nie neu generiert) sowie `interpretation_prompt_hash` (SHA-256 des verwendeten Prompts für Reproduzierbarkeitsaudit). Unique Constraint auf `user_id`.

**`gse_results`** / **`mslq_results`** — Messergebnisse mit `measurement_type` (pre/post), Items als JSONB, computed `total_score` bzw. `subscale_scores`.

**`consent_logs`** — Unveränderliches Audit-Log aller Consent-Ereignisse (sieben Event-Typen: register, ki_disclosure, analytics_opt_in/out, data_export, account_delete, consent_update). Wird nie aktualisiert oder gelöscht; bildet die Nachweispflicht nach DSGVO Art. 7 (2) ab.

**`prompt_templates`** — DB-versionierte Jinja2-Templates, live editierbar, mit Timestamp und Versionsnummer; unter Study-Lock schreibgeschützt.

**`llm_usage`** — Token-Protokoll jedes LLM-Calls (session_id, user_id, provider, model, input_tokens, output_tokens, cost_eur). Basis für das per-User-Cost-Cap und die Admin-Kostentransparenz.

**Eval-Tabellen**: `eval_runs`, `eval_results` (ein Row pro Persona × Session × Metrik), `eval_transcripts` (vollständiges Transkript, separate Tabelle weil Heatmap-Queries keine Transkripte benötigen).

### 4.3.2 Row-Level-Security-Konzept für pgvector

Alle Zugriffe auf `memory_chunks` werden auf Anwendungsebene durch den obligatorischen `user_id`-Parameter in allen Repository-Methoden abgesichert. Kein Query greift ohne expliziten Nutzerkontext auf die Vektordatenbank zu. Dies verhindert Cross-User-Datenlecks auch in Fällen, in denen ein LLM-generierter Query-String manipuliert wird (Prompt-Injection-Abwehr auf Datenbankebene).

### 4.3.3 DSGVO-Rechte als implementierte Endpunkte

| Recht | Endpunkt | Implementierung |
|---|---|---|
| Art. 15 (Auskunft) | GET /api/v1/users/me/export | JSON-Export aller gespeicherten Daten |
| Art. 17 (Löschung) | DELETE via Admin | Kaskadierendes Hard-Delete mit Soft-Delete-Marker |
| Art. 20 (Portabilität) | GET /api/v1/users/me/export | Maschinenlesbares JSON |
| Art. 7 (3) (Widerruf) | PATCH /api/v1/users/me/consent | Consent-Felder + ConsentLog-Eintrag |

Die Admin-seitige Löschung (DSGVO Art. 17) nutzt PostgreSQL-Kaskaden (`ondelete="CASCADE"`) an allen Foreign Keys, die auf `users.id` zeigen. Damit ist sichergestellt, dass kein Datensatz nach einer Löschanfrage verwaist.

---

## 4.4 Authentifizierung und Benutzerverwaltung

### 4.4.1 JWT-Architektur

KAIA verwendet ein zweistufiges Token-System:

- **Access Token** (15 Minuten, Bearer): Zustandsloser Zugriff auf geschützte API-Endpunkte; enthält `user_id` und `status` im Payload.
- **Refresh Token** (30 Tage, httpOnly-Cookie): Token-Rotation mit familienbasierter Reuse-Detection gemäß RFC 6749. Jedes verwendete Token wird sofort revoziert. Bei erkannter Wiederverwendung (Indikator für Token-Diebstahl) wird die gesamte Token-Familie gesperrt.

Refresh-Token-Hashes werden als SHA-256-Digest in der Datenbank gespeichert — niemals der Raw-Token. User-Agent und IP-Adresse werden für den Forensik-Audit-Trail erfasst. Der Index `ix_refresh_tokens_user_active` auf `(user_id, revoked_at)` optimiert die häufigste Query (aktive Tokens eines Nutzers).

Passwörter werden mit bcrypt (12 Runden) gehasht. Bei fünf Fehlversuchen wird das Konto für 15 Minuten gesperrt (`locked_until`-Feld in `users`).

### 4.4.2 User-Approval-Flow als Studienkontrolle

Neue Konten starten mit Status `PENDING`. Zugang zur Anwendung wird erst nach expliziter Admin-Freigabe erteilt (`approved_at`, `approved_by`). Dieser Flow dient nicht primär der Kostenkontrolle, sondern der Studienkontrolle: Nur geprüfte Teilnehmende der Pilotstudie erhalten Zugang — eine Voraussetzung für das Ethikvotum der SRH. Die Freischaltung löst automatisch eine E-Mail-Benachrichtigung aus (Brevo SMTP).

### 4.4.3 Per-User LLM-Zuweisung

Das Feld `kaia_model` in der `users`-Tabelle (nullable) erlaubt die Zuweisung eines spezifischen LLM-Modells pro Nutzerin durch den Admin (`PATCH /api/v1/admin/users/{id}`). Ist das Feld nicht gesetzt, verwendet KAIA das globale System-Modell (`kaia_chat_model` aus den Settings). Diese Architektur ermöglicht gezielte A/B-Zuweisungen im Studienkontext, ohne Prompts oder System-Konfiguration zu ändern.

### 4.4.4 E-Mail-Benachrichtigungen

Das `emails.py`-Modul versendet transaktionale E-Mails für drei Ereignisse: Registrierungsbestätigung (mit Pending-Status-Hinweis), Freischaltung durch Admin, und Studienstart. Der SMTP-Transport verwendet Brevo (Port 587, STARTTLS) und ist vollständig konfigurierbar über Umgebungsvariablen.

---

## 4.5 Ethische Schutzmaßnahmen in der Implementierung

### 4.5.1 Crisis-Detection Pre-Filter

Jede Texteingabe wird vor der LLM-Verarbeitung durch einen deterministischen Keyword-Filter geprüft (`app/core/crisis.py`). Der Filter enthält 27 deutsche Regex-Muster für Suizidgedanken (explizit und passiv), Selbstverletzung und akute Hoffnungslosigkeit. Die Muster sind nach Schweregrad sortiert und verwenden case-insensitive Matching (`re.IGNORECASE`).

Bei Treffer:
- Die Eingabe wird **nicht** an das LLM weitergeleitet
- Eine statische Antwort mit Krisenressourcen wird zurückgegeben (Telefonseelsorge 0800 111 0 111, Alternative 0800 111 0 222, Notruf 112)
- Die Eingabe wird dennoch in der Datenbank gespeichert (für den Audit-Trail), die LLM-Antwort wird als CRISIS_RESPONSE markiert
- Der Vorfall wird über structlog protokolliert

Die Implementierung folgt dem Prinzip der deterministischen Sicherheit: Für Safety-kritische Entscheidungen werden keine LLMs eingesetzt. Falsch-Positive sind bewusst akzeptiert — die Prämisse ist, dass ein falsch ausgelöster Krisenhinweis weniger Schaden anrichtet als ein nicht ausgelöster.

Die Erweiterung der Trigger-Phrasen im Laufe der Entwicklung — etwa um existentielle Verallgemeinerungen wie "oder überhaupt gerade" — ist durch P04-spezifische Krisensignale in der Eval-Persona-Datenbank dokumentiert (vgl. Abschnitt 4.8).

### 4.5.2 KI-Disclosure-Gate

Vor der ersten Nutzung bestätigen alle Teilnehmenden explizit, dass KAIA eine KI ist (computational empathy, kein Mensch). Die Bestätigung wird mit Timestamp in `users.ki_disclosure_seen_at` gespeichert und im `consent_logs`-Audit-Log erfasst (`ConsentEvent.KI_DISCLOSURE`). Ohne diese Bestätigung ist kein Chat-Zugriff möglich — technisch erzwungen durch den Journey-State-Guard in der Session-Erstellungsroute.

### 4.5.3 Multi-Step-Consent

Das Registrierungsformular enthält zwei getrennte Checkboxen: Zustimmung zur Datenverarbeitung (`consent_data`) und Zustimmung zu Analytics/Studie (`consent_research_data`, `consent_analytics`). Beide werden mit Timestamp (`consent_at`) und Consent-Versionsnummer (`consent_version`) gespeichert. Das Design folgt dem Gebot der informierten Einwilligung nach DSGVO Art. 7 und ermöglicht separaten Widerruf der Forschungs-Einwilligung ohne Accountlöschung.

---

## 4.6 Chat-Core: Session-Architektur und Streaming

### 4.6.1 Session State Machine und Journey-Guard

Jede Lernsession ist ein `ChatSession`-Datensatz mit den Zeitstempeln `started_at` (DB-Default) und `ended_at` (nullable, gesetzt durch `POST /sessions/{id}/end`). Die Session gilt als offen, solange `ended_at IS NULL`.

Vor der Session-Erstellung prüft ein Journey-Guard den Studienstatus der Nutzerin (`get_journey_state`):
- `PRE_PENDING` → Weiterleitung zum Prä-Survey (MSLQ + GSE vor Session 1)
- `POST_PENDING` → Weiterleitung zum Post-Survey (GSE nach Session 10)
- `COMPLETED` → Zugang gesperrt (Studie abgeschlossen)
- Cost-Guard → Zugang gesperrt, wenn das per-User-Budget überschritten ist (Standard: €3,00)

Session-Wiederaufnahme: `GET /sessions/active` gibt die offene Session (ended_at IS NULL) mit allen Nachrichten zurück. Das Frontend nutzt diesen Endpunkt beim Seitenaufruf, um unterbrochene Sessions nahtlos wiederaufzunehmen (window-close-Handling).

### 4.6.2 Vier Stream-Funktionen

Alle vier Streaming-Generatoren sind in `domains/chat/service.py` implementiert und folgen demselben Muster: Systemprompt aufbauen → LLM aufrufen → Thinking-Strip → SSE-Delta senden → Nachricht persistieren → Token-Nutzung protokollieren. Alle vier nehmen den Parameter `model_override` (per-User-Modell) entgegen.

**`stream_opening`**: Generiert KAIAs Eröffnungsfrage für eine frische Session ohne User-Input. Ab Session 2 enthält der Trigger die Instruktion, aus der Reflexion über die Vorperiode zu starten ("du hast seit der letzten Session über dieses Gespräch nachgedacht"). Der Trigger ist ein nicht persistierter System-Hinweis — keine User-Nachricht in der Datenbank.

**`stream_response`**: Kernpfad für Nutzerantworten. Reihenfolge: Crisis-Detection-Check → User-Nachricht persistieren → Session-History laden → Systemprompt rendern → LLM aufrufen → Thinking-Strip → Delta streamen → Persistieren → Token-Log. Bei Crisis-Treffer wird der LLM-Call übersprungen.

**`stream_closing`**: Generiert KAIAs didaktische Abschlussfrage. Die Session bleibt offen bis zum expliziten `POST /sessions/{id}/end`-Aufruf — die Closing-Bubble ist kein Session-Ende, sondern eine letzte sokratische Intervention. Session-spezifische Abschlusstrigger (10 verschiedene, je nach Missions-Energie der Session) werden aus einer Lookup-Tabelle geladen.

**`stream_meta_question`**: Reagiert auf aktive EMA-Signale (stuck/unclear) mit einer kurzen Klärungsfrage. max_tokens=120 begrenzt die Antwort auf das didaktisch Notwendige. Kein Modus-Switch — ein einzelnes EMA-Signal verändert nicht den Adaptionszustand der Session.

### 4.6.3 SSE-Protokoll

Das SSE-Protokoll sendet JSON-kodierte Events im Format `data: {...}\n\n`:

| Event-Typ | Payload-Felder | Bedeutung |
|---|---|---|
| `delta` | `content: string` | Teilinhalt der KAIA-Antwort |
| `done` | `message_id, input_tokens, output_tokens` | Stream abgeschlossen, Tokens protokolliert |
| `error` | `message: string` | Fehler — LLM nicht erreichbar o.ä. |
| `thinking` | `content: string` | Debug-Only: Thinking-Block (nur wenn `?debug=true`) |

Das Frontend liest den Stream über die ReadableStream-API des Browsers; Caddy-Buffering ist durch den Header `X-Accel-Buffering: no` deaktiviert.

### 4.6.4 Thinking-Strip

Claude-Sonnet-4-6 sendet intern einen `<thinking>`-Block vor der `<final_answer>`. `thinking_strip()` in `sse.py` extrahiert den Thinking-Block (gespeichert in `messages.thinking_raw` für den Audit-Trail), entfernt ihn aus dem Response-Stream und gibt nur den `<final_answer>`-Teil an den Client weiter. Im Debug-Modus wird der Thinking-Block zusätzlich als `thinking`-SSE-Event gesendet.

### 4.6.5 Cost-Guard und Token-Budget

Der `llm_usage`-Tabelleneintrag nach jedem LLM-Call enthält: `session_id`, `user_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `cost_eur`. Die Kostenberechnung berücksichtigt Anthropic Prompt Caching:

- Cache-Creation-Tokens: 1,25× normaler Input-Preis
- Cache-Read-Tokens: 0,10× normaler Input-Preis
- Output-Tokens: normaler Output-Preis

Das per-User-Kostenlimit ist über `MAX_COST_PER_USER_EUR` konfigurierbar (Standard: €3,00). Simulations-Nutzer (`is_simulation=True`) sind vom Cost-Guard ausgenommen — sie durchlaufen im Rahmen der Eval-Pipeline beliebig viele Sessions.

`MAX_TOKENS=3000` in `sse.py` definiert das Token-Budget pro LLM-Call; es bietet genug Puffer für den Thinking-Block (~2700 Token) und die finale Antwort (~300 Token).

### 4.6.6 Closing- und Timeout-Handling

Nach der Closing-Bubble wird `POST /sessions/{id}/end` aufgerufen. Dieser Endpunkt setzt `ended_at`, startet `extract_session_summary()` als BackgroundTask und gibt die Session zurück. Das Frontend implementiert ein 10-Minuten-Timeout nach der Closing-Bubble: Reagiert die Nutzerin nicht, schließt der Client die Session automatisch durch einen `/end`-Aufruf. Dieses Client-seitige Timeout vermeidet Polling-Mechanismen auf dem Server und hält die Backend-Architektur zustandslos.

---

## 4.7 Didaktisches Progressionsmodell

### 4.7.1 Zehn Sessionsmissionen

Eine der zentralen Architekturentscheidungen (ADR-007) ist die Einführung eines expliziten didaktischen Progressionsmodells, das die zehn Sessions als strukturierte Lernreise gestaltet. Jede Session hat eine Mission, einen dominanten Fragetyp, explizit verbotene Fragetypen und Session-spezifische Few-Shot-Beispiele. Diese Daten werden nicht vom LLM generiert, sondern als Lookup-Tabelle in `service.py` verwaltet und als Teil des Systemprompts übergeben.

| Session | Mission | Dominanter Typ |
|---|---|---|
| 1 | Ankern — Lernmotiv vom Oberflächenziel trennen, latentes Vorwissen zugänglich machen (Anamnesis) | Typ 6 (Anamnese) |
| 2 | Kartieren — Vorannahmen explizit machen und präzisieren | Typ 1 (Klärung) |
| 3 | Erden — abstraktes Lernziel in konkreter Situation verankern (situiertes Lernen) | Typ 4 (Systemisch) |
| 4 | Ausprobieren — Erster-Schritt-Loop, Implementation Intention (Gollwitzer) | Typ 5 (Erste-Schritt) |
| 5 | Spiegel — Halbzeit-Reflexion, eigene kognitive Entwicklung sichtbar machen | Typ 2 (Hypothetisch als Spiegel) |
| 6 | Reiben — Elenchos: Inkonsistenzen aus Vorsessions konfrontieren | Typ 3 (Widerspruch) |
| 7 | Schärfen — Inkonsistenzen in bewusste Position überführen | Typ 2 + 3 |
| 8 | Übergeben — Scaffolding Fading nach Collins, Steuerung sukzessiv abgeben | Typ 4 (Transfer-Fokus) |
| 9 | Konsolidieren — Gelerntes in kohärente Meta-Erkenntnis verdichten (Merrill) | Typ 2 + 4 |
| 10 | Loslassen — Autonomisierung (Maieutik): eigene Lernstrategie formulieren | Autonomiefragen |

Die verbotenen Fragetypen verhindern didaktische Fehler: Widerspruchsfragen (Typ 3) sind in Sessions 1–5 gesperrt (kein Fundament vorhanden), Erste-Schritt-Fragen (Typ 5) in Session 10 (Steuerung wird zurückgegeben). Session-spezifische Abschlusstrigger variieren, um Habituation zu vermeiden — Session 10 erhält nur einen einzigen Satz als Abschluss ("Was bleibt — wenn du in einem Jahr an diese zehn Wochen denkst?").

### 4.7.2 Historische Zitate für den Elenchos (Sessions 6–10)

Ab Session 6 lädt `_build_system_prompt()` historische Zitate aus `load_historical_quotes()`. Diese Funktion liest das Feld `strongest_quote` aus den `session_summary`-JSON-Objekten aller Vorsessions. Die Zitate werden als Datenpunkt in den `PromptContext.historical_quotes`-Slot (Liste von Tupeln aus Sessionnummer und Zitat) übergeben und im Jinja2-Template als XML-Block in den Systemprompt injiziert. Damit kann KAIA eigene Formulierungen der lernenden Person aus früheren Sessions aktivieren — ein direktes Instrument des sokratischen Elenchos.

---

## 4.8 Prompt-System und Cross-Session-Memory

### 4.8.1 Jinja2-Prompt-Templates in der Datenbank

Prompt-Templates sind als versionierte Datenbankeinträge gespeichert (`prompt_templates`-Tabelle). Das aktive Template für jeden Charakter-Modus (warm, challenging, wild) wird live ohne Re-Deployment geladen. Änderungen wirken sofort auf den nächsten LLM-Call.

Der `render_prompt()`-Service verwendet Jinja2 mit einer `_SilentUndefined`-Klasse: Unbekannte Template-Variablen werden durch leere Strings ersetzt, anstatt einen Fehler zu werfen. Dies erhöht die Robustheit — ein fehlendes Kontextfeld lässt den Systemprompt degradiert, aber nicht broken laufen.

Unter `STUDY_MODE=locked` blockiert das CI Prompt- und Schema-Änderungen. Dieser Study-Lock-Mechanismus sichert die Reproduzierbarkeit der Studienbedingungen und verhindert unbewusste Eingriffe der Forscherin nach Beginn der Datenerhebung.

### 4.8.2 PromptContext-Dataclass

Die `PromptContext`-Dataclass (`domains/prompts/service.py`) bündelt alle Informationen für das Prompt-Rendering:

| Feld-Gruppe | Felder |
|---|---|
| Basiskontext | `user_name`, `learning_topic` |
| Session-Position | `is_first_session`, `is_final_session`, `session_number`, `session_phase` (early/mid/late), `user_turns` |
| Vorsessions-Kontext | `last_first_step`, `last_session_observation`, `insight_for_next_session` |
| Kumulative Historie | `session_history_summary` (kompakte Mehrzeilen-Zusammenfassung aller Vorsessions) |
| Lernerprofil | `learner_profile` (LLM-generierter Interpretationstext), `gse_baseline` (Float) |
| Session-Planung | `outcome`, `daily_plan` |
| Historische Zitate | `historical_quotes` (Liste von Tupeln: Sessionnummer, Zitat) |
| Didaktische Mission | `session_mission`, `dominant_question_type`, `forbidden_question_types`, `session_few_shots` |

Die `session_phase` wird aus der Session-Nummer abgeleitet: Sessions 1–3 = "early", 4–7 = "mid", 8–10 = "late". Diese Phaseneinteilung wird im Template genutzt, um Formulierungen und Intensität der sokratischen Intervention anzupassen.

### 4.8.3 Cross-Session-Memory: Session-Summary-Extraktion

Nach Sitzungsende (`POST /sessions/{id}/end`) wird `extract_session_summary()` als FastAPI-BackgroundTask ausgelöst. Diese Funktion öffnet eine eigene Datenbankverbindung (die Request-Datenbankverbindung ist dann bereits geschlossen) und sendet das vollständige Transkript an `claude-haiku-4-5-20251001`.

Der Haiku-Extraktor produziert ein strukturiertes JSON-Objekt mit acht Pflichtfeldern:

```json
{
  "first_step": "...",
  "observation": "...",
  "insight_for_next_session": "...",
  "mood": "positiv|neutral|frustriert|unklar",
  "topics": ["...", "..."],
  "strengths_observed": "...",
  "friction_points": "...",
  "strongest_quote": "..."
}
```

`strongest_quote` enthält den stärksten eigenen Satz der lernenden Person aus der Session — wörtlich zitiert, nicht paraphrasiert. Dieser Wert bildet die Grundlage der historischen Zitate-Funktion (vgl. 4.7.2).

Die Extraktion enthält eine Markdown-Fence-Bereinigung: Haiku schreibt trotz expliziter Instruktion manchmal Code-Blöcke um das JSON. Der extrahierte Text wird vor dem `json.loads()`-Aufruf bereinigt.

`load_all_session_contexts()` aggregiert alle Vorsessions mit vorhandener Summary zu einer kompakten Mehrzeilen-Darstellung (Stimmung | Themen | Beobachtung | vereinbarter Schritt | Reibungspunkte). `load_previous_session_fields()` liest nur die drei skalaren Felder der unmittelbaren Vorsession. Sessions ohne Summary werden übersprungen — fehlende Summaries blockieren keine Folge-Session.

### 4.8.4 Anthropic Prompt Caching

System-Prompts und Session-Kontext werden mit dem Anthropic-Caching-Mechanismus übergeben (`"cache_control": {"type": "ephemeral"}`). Die Kostenabrechnung berücksichtigt Cache-Creation-Tokens (1,25× Input-Preis) und Cache-Read-Tokens (0,10× Input-Preis). Caching ist auch für Judge- und Simulator-Calls in der Eval-Pipeline aktiviert.

---

## 4.9 Multi-LLM-Provider-Abstraktion

### 4.9.1 Provider-Routing

Die Funktion `_provider(model: str) -> str` in `service.py` leitet aus dem Model-Identifier den Provider ab: Strings, die "gpt" enthalten oder mit "o1"/"o3"/"o4" beginnen, werden als OpenAI geroutet; "mistral"-Strings als Mistral; alle anderen als Anthropic.

### 4.9.2 Unterstützte Modelle (Stand Juli 2026)

| Modell | Provider | API-Besonderheit | Eval |
|---|---|---|---|
| claude-sonnet-4-6 | Anthropic | Prompt Caching, Thinking-Block | Produktions-KAIA |
| claude-haiku-4-5-20251001 | Anthropic | Prompt Caching | Extraktor / Judge |
| gpt-4o | OpenAI | max_completion_tokens (nicht max_tokens) | Eval-Vergleich |
| gpt-5.6-terra | OpenAI | max_completion_tokens | Eval-Vergleich |
| gpt-4.1-mini | OpenAI | max_completion_tokens | Eval-Vergleich |
| mistral-large-latest | Mistral | OpenAI-SDK, eigene Base-URL, max_tokens | Eval-Vergleich (EU) |
| mistral-small-latest | Mistral | OpenAI-SDK, max_tokens | Eval-Vergleich (EU) |

Die API-Unterschiede zwischen Providern — insbesondere `max_completion_tokens` für OpenAI GPT-5.x gegenüber `max_tokens` für Mistral und Anthropic — werden in der `_call_llm()`-Funktion durch eine explizite Provider-Fallunterscheidung behandelt. Mistral nutzt die OpenAI-kompatible API (`base_url="https://api.mistral.ai/v1"`) über den OpenAI-Python-Client, um eine separate SDK-Abhängigkeit zu vermeiden.

### 4.9.3 API-Timeouts und Retry-Strategie

Alle LLM-Clients verwenden strukturierte Timeouts:
- `connect`: 10 s (Chat-Seite), 5 s (Extraktor)
- `read`: 120 s (Chat-Seite), 60 s (Extraktor)
- `write`: 10 s

Bei Rate-Limit-Fehlern (HTTP 429) in der Eval-Pipeline implementiert `_call_kaia_direct()` einen exponentiellen Backoff: 5 s → 10 s → 20 s → 40 s → 60 s → 60 s (bis zu 6 Versuche). Dieser Mechanismus ist besonders für Mistral-Large relevant, das restriktive Rate-Limits hat (0,07 req/s).

Erschöpfte API-Kontingente (`_APIQuotaError`) werden als Fail-Fast behandelt: Die Eval-Pipeline bricht sofort ab, ohne weitere API-Calls zu versuchen.

### 4.9.4 Dynamischer Modell-Switcher

`set_model_override(model: str)` in `sse.py` wechselt das globale KAIA-Chat-Modell zur Laufzeit ohne Neustart. Die Kostenkonstanten werden dabei synchron aktualisiert. Für Restart-Persistenz muss der Admin-Aufrufer zusätzlich die Datenbank aktualisieren; der In-Memory-State ist der primäre Pfad für sofortige Wirkung.

---

## 4.10 In-Session-Feedback (EMA)

### 4.10.1 Wissenschaftliche Grundlage

Die Messung von Erleben während einer Aktivität — statt retrospektiv nach deren Abschluss — ist Kernprinzip der Experience Sampling Method (Csikszentmihalyi & Larson, 1987) und des Ecological Momentary Assessment (Shiffman et al., 2008). Retrospektive Selbstberichte werden systematisch durch Rekonstruktionseffekte verzerrt; Momente wie Blockade oder Aha-Erlebnis verlieren in der Rückschau ihre diagnostische Präzision.

KAIA implementiert vier EMA-Signaltypen, die Nutzende während einer Session senden können:

| Typ | Semantik | Wissenschaftliche Entsprechung | Reaktion |
|---|---|---|---|
| `transfer_marker` | "Das nehme ich mit" — Erkenntnis mit Transferpotenzial | Transfer-Intention (Gagné, 1985) | Passiv: nur gespeichert |
| `wow` | "Das trifft etwas" — Resonanz-Signal | Affect Labeling (Lieberman et al., 2007) | Passiv: nur gespeichert |
| `stuck` | "Ich hänge gerade" — Blockade-Signal | Cognitive Load Overload (Sweller, 1988) | Aktiv: löst Meta-Frage aus |
| `unclear` | "Das verstehe ich nicht" — Verständnis-Lücke | Knowledge Gap (Anderson & Krathwohl, 2001) | Aktiv: löst Meta-Frage aus |

### 4.10.2 Endpunkt-Architektur

`POST /sessions/{id}/feedback` speichert das Signal (mit optionaler `message_id` für den Nachrichtenbezug). Bei aktiven Typen (stuck/unclear) ruft der Client anschließend `POST /sessions/{id}/meta-question?feedback_type=stuck|unclear` auf, um KAIAs Klärungsfrage als SSE-Stream zu empfangen. Die Trennung in zwei Calls (Speichern + Reagieren) erlaubt dem Frontend, das Feedback sofort zu bestätigen, auch wenn die Meta-Frage noch streamt.

### 4.10.3 Transfer-Marker in der Session-Summary

Transfer-Marker aus `session_feedback` werden am Sitzungsende nicht automatisch in die Summary übernommen (der Haiku-Extraktor hat Zugriff auf das vollständige Transkript, in dem markierte Momente erkennbar sind). Die direkten Feedback-Typen stehen für die quantitative Longitudinalauswertung zur Verfügung — etwa ob bestimmte Themen oder Session-Phasen systematisch mit `stuck`-Signalen assoziiert sind.

---

## 4.11 Survey-Infrastruktur: GSE und MSLQ

### 4.11.1 GSE (Schwarzer & Jerusalem, 1995)

Die Allgemeine Selbstwirksamkeitserwartung wird mit der validierten 10-Item-Skala von Schwarzer und Jerusalem (1995) gemessen. Items werden auf einer 4-stufigen Likert-Skala beantwortet (1 = "stimmt nicht" bis 4 = "stimmt genau"). Der Gesamtscore ist das arithmetische Mittel aller Items (Range 1,0–4,0). Normdaten: M = 2,97 (SD = 0,49, Schwarzer & Jerusalem, 1995).

Zwei Messzeitpunkte: Prä (vor Session 1) und Post (nach Session 10). Die Prä-GSE fließt als `gse_baseline` in den `UserLearningProfile`-Eintrag und damit in den Systemprompt aller KAIA-Sessions ein.

### 4.11.2 MSLQ (Pintrich et al., 1991, 1993)

Der Motivated Strategies for Learning Questionnaire wird mit vier Subskalen (30 Items gesamt) auf einer 7-stufigen Likert-Skala eingesetzt (1 = "trifft gar nicht zu" bis 7 = "trifft völlig zu"). Fisher-Yates-Randomisierung der Item-Reihenfolge innerhalb jeder Subskala verhindert Reihenfolgeeffekte. Subskalen-Scores werden serverseitig als Mittelwerte berechnet.

MSLQ wird ausschließlich zum Prä-Zeitpunkt erhoben (vor Session 1). Die Subskalen-Scores fließen als `subscale_scores` in das `UserLearningProfile` ein.

### 4.11.3 Journey-State-Machine

Die Kombination aus Survey-Ergebnissen und Session-Anzahl ergibt den `JourneyStateEnum`:
- `PRE_PENDING`: Prä-Survey (MSLQ + GSE) noch nicht abgeschlossen
- `IN_PROGRESS`: Session 1–9 aktiv
- `POST_PENDING`: Session 10 beendet, Post-GSE ausstehend
- `COMPLETED`: Post-GSE abgeschlossen
- `BLOCKED`: Admin-Sperre oder Kostenlimit

Der Journey-Guard verhindert, dass Nutzende Sessions starten, bevor sie die Voraussetzungen erfüllen — ein technisches Äquivalent zum experimentellen Protokoll.

---

## 4.12 Iterative Prompt-Entwicklung als Forschungsmethodik

### 4.12.1 Das Problem des "guten" Prompts

Ein zentrales methodisches Problem bei der Entwicklung LLM-basierter Systeme ist die fehlende formale Spezifikation für "guten" Output: Es gibt keine allgemeine mathematische Funktion, die misst, ob ein sokratisch-empathischer Lernbegleiter seinen Auftrag erfüllt. Die Güte eines Systemprompts ist kontextabhängig, nutzerspezifisch und lässt sich nicht vollständig vor der Nutzung evaluieren. Dies stellt einen fundamentalen Unterschied zu klassischer Software-Entwicklung dar, in der Korrektheit durch Tests formal verifizierbar ist.

Die Entwicklung des KAIA-Systemprompts folgt daher einem **iterativen Feldforschungs-Ansatz**: Die Forscherin interagiert selbst mit dem System, beobachtet das Verhalten, formuliert Hypothesen über Prompt-Schwächen und Verbesserungen und revidiert den Prompt — in direkter Anlehnung an den Design-Evaluate-Revise-Zyklus von Hevner et al. (2004). KAIA_PROMPT_V4_WARM ist die aktive Version (Stand: 15.07.2026); V3 wird als Eval-Regressions-Baseline vorgehalten.

### 4.12.2 Technische Infrastruktur für Prompt-Iteration

Der Prompt-Editor (`/admin/prompts`) ermöglicht:

1. **Drei-Charakter-Vergleich**: Derselbe Input gleichzeitig an drei Prompt-Varianten (warm/herausfordernd/unberechenbar). Die parallele Darstellung macht Stärken und Schwächen unmittelbar sichtbar.

2. **Live-Editing**: Der Systemprompt ist direkt im Interface editierbar. Änderungen wirken sofort — kein Re-Deployment notwendig.

3. **DB-Versionierung**: Jede Prompt-Version wird mit Timestamp, Versionsnummer und Begründung gespeichert. Die Prompt-Entwicklungshistorie ist Teil der wissenschaftlichen Dokumentation.

4. **Study-Lock**: Bei `STUDY_MODE=locked` sind keine Prompt-Änderungen möglich. CI-Check blockiert entsprechende Merges.

### 4.12.3 Kriterien für Prompt-Güte

| Kriterium | Operationalisierung |
|---|---|
| **Sokratische Integrität** | Gibt KAIA in >90 % der Antworten keine direkte Antwort? Verwendet es alle sechs Fragetypen situationsadäquat? |
| **Missions-Treue** | Entspricht der dominante Fragetyp der Sessionsaufgabe (M2 in der Eval-Matrix)? |
| **Persona-Responsivität** | Reagiert KAIA erkennbar auf das individuelle Kommunikationsmuster (M3)? |
| **Autonomie-Erhalt** | Gibt KAIA keine Ratschläge oder versteckten Instruktionen (M6)? |

Diese Kriterien werden sowohl in den eigenen Testsessions der Forscherin als auch in formalisierter Form im LLM-Evaluationsbericht (Kapitel 5) angewendet.

### 4.12.4 Pilotbefund: Prompt-Überspezifikation und das Typ-5-Loop-Problem

Im Zuge der Pilotnutzung vor Studienbeginn wurde ein strukturelles Problem in `KAIA_PROMPT_V3_WARM` identifiziert: KAIA generierte wiederholt dieselbe Erste-Schritt-Frage (Fragetyp 5) in aufeinanderfolgenden Turns, anstatt die Bloom-Progression voranzutreiben. Die Analyse ergab, dass Fragetyp 5 an vier separaten Stellen des Prompts hartkodiert war: im Onboarding-Flow, im Session-Einstieg (ERSTER-SCHRITT-LOOP), in der Fragetyp-Taxonomie und im Phase-3-Abschluss. Unter dem 80-Wort-Constraint und bei aktivem `abschluss`-Signal im Thinking-Block wählt das Modell deterministisch den niedrigkomplexesten sicheren Completion-Pfad: Typ 5. Das Ergebnis ist horizontales Looping auf Bloom-Stufe 1–2 statt taxonomischer Progression.

Gleichzeitig wurde beobachtet, dass der Wild-Charakter ("Perspektivwechsel") von Testnutzerinnen als sokratischer erlebt wurde als der strukturierte Warm-Charakter. Diese Wahrnehmung ist real und didaktisch erklärbar: Metaphern, Analogien und Koans erzeugen kognitive Überraschung und Rahmenbrechung — was Gadamers (1960) Konzept der Horizontverschmelzung entspricht und auf Bloom-Stufen 4–5 operiert. Im Unterschied zu Warms prozedurisierten Fragetypen verlangt der Wild-Prompt echtes Generieren statt Klassifizieren-und-Ausführen.

Wichtig für die Thesis-Terminologie: Was Testnutzerinnen als "sokratischer" wahrnahmen, ist philosophisch kein Sokrates im strengen Elenchos-Sinne, sondern eine Öffnungsform, die dem Zen-Koan näher steht. Beide Formen sind didaktisch legitim — aber die Eval-Metriken M1–M7 sind an der Elenchos-Definition kalibriert; ein Moduswechsel hätte die gesamte Eval-Infrastruktur invalidiert.

**Designentscheidung v4 (15.07.2026):** Der Wild-Charakter wird nicht als Primärmodus eingesetzt. Ausschlaggebende Argumente: (1) Unzureichende Crisis-Detection — Wild verfügt nur über eine einzeilige Krisennotiz, Warm v3/v4 über ein zweistufiges Boundary-Protokoll mit Rupture-Repair; (2) fehlende Session-Sequenzierung — ohne Session-Missionen und Bloom-Progression entfällt der didaktische Zehner-Bogen; (3) Reproduzierbarkeit — "kalkuliert disruptiv" erhöht die Inter-Session-Varianz und gefährdet die Prä/Post-Validität. Stattdessen implementiert `KAIA_PROMPT_V4_WARM` drei chirurgische Korrekturen: (a) Thinking-Check #10 gegen Typ-5-Looping, (b) De-Prozeduralisierung des Phase-3-Abschlusses (Typ-5 oder Koan/Analogie nach Kontext), (c) explizite Lizenz für Analogie/Koan im Charakter-Abschnitt.

---

## 4.13 LLM-Evaluations-Pipeline

### 4.13.1 Architektur

Die Eval-Pipeline ist vollständig im Backend implementiert (`domains/eval/evaluator.py`) und wird ausschließlich durch den Admin ausgelöst. Zwei Betriebsmodi:

- **LLM-Simulation** (Standard): Automatisierte Persona-Simulation + Judge-Bewertung ohne vorhandene Transkripte.
- **Crash-Test-Eval** (Legacy): Judge-Bewertung auf Basis statischer Transkripte aus dem Crash-Test-Runner.

Ein Eval-Run wird als `asyncio.Task` im FastAPI-Prozess ausgeführt; der Status ist über `GET /admin/eval/runs/{run_id}/status` abrufbar. Live-Log-Einträge (bis 500 Zeilen, In-Memory) geben Einblick in den laufenden Prozess.

### 4.13.2 Zehn Eval-Personas

Die Eval-Personas sind in `domains/simulation/eval_personas.py` definiert. Jede Persona hat ein Lerntopic, ein Archetype-Muster (das "Sabotagemuster" in der Simulation) und einen detaillierten `simulator_prompt`. Die Personas decken ein Spektrum an Lernblockaden ab: von ängstlichen Perfektionisten über ungeduldig-lösungsfixierte Pragmatikerinnen bis zu einer Krisenfall-Persona (P04), die ab Session 5 eskalierend Krisensignale sendet.

### 4.13.3 Sieben Evaluationsmetriken (M1–M7)

Jede Metrik hat eine eigene Prompt-Datei in `prompts/eval/`:

| Metrik | Bezeichnung | Bewertungsgegenstand |
|---|---|---|
| M1 | Sokratische Reinheit | Enthält KAIA keine direkten Antworten/Ratschläge? |
| M2 | Missions-Treue | Passt der dominante Fragetyp zur Session-Mission? |
| M3 | Persona-Responsivität | Reagiert KAIA auf das Kommunikationsmuster der Persona? |
| M4 | Fragenqualität / -tiefe | Wie tief und präzise sind KAIAs Fragen? |
| M5 | Sequenz-Kohärenz | Bauen Fragen aufeinander auf statt thematisch zu springen? |
| M6 | Autonomie-Erhalt | Erhält KAIA die Eigenständigkeit der lernenden Person? |
| M7 | Crisis-Detection-Safety | Reagiert KAIA korrekt auf Krisensignale? (nur P04, ab S5) |

Scores: 0 (nicht erfüllt) bis 3 (vollständig erfüllt). M7-Score 0 ist sicherheitskritisch und wird immer geflaggt sowie als `log.error` protokolliert.

### 4.13.4 LLM-as-Judge

**Judge-Modell**: `claude-haiku-4-5-20251001` (cost-efficient für einfache Scoring-Aufgaben). Das Produktions-KAIA-Modell (`claude-sonnet-4-6`) und das Judge-Modell sind explizit getrennt, um Zirkelschlüsse zu vermeiden.

Judge-Calls sind bewusst serialisiert (nicht parallel): Haiku ist günstig, und Serialität verhindert Rate-Limits und kontrolliert die Kostenprogression. JSON-Fehler-Handling: Haiku schreibt trotz Instruktion manchmal Markdown-Fences um JSON; das Cleanup-Retry bereinigt eingebettete Newlines und retried den Parse-Aufruf.

### 4.13.5 LLM-Simulation

**Persona-Simulator**: `claude-haiku-4-5-20251001` mit `temperature=0.7` und `max_tokens=200`. Der Simulator-Prompt beschreibt das Persona-Verhalten; ein Phasen-Hinweis (Frühphase S1–3, Mittelphase S4–6, Spätphase S7–10) passt das Verhalten der Simulation an die Studienarchitektur an.

**KAIA-Seite**: Bei Anthropic-Modellen wird `stream_response()` (volles KAIA-Prompt-System) verwendet; bei Non-Anthropic-Modellen wird `_call_kaia_direct()` mit einem vereinfachten Eval-Systemprompt eingesetzt, der provider-neutral formuliert ist und die Vergleichbarkeit zwischen Modellen sicherstellt.

**Synthetische Nutzer**: Für jeden Eval-Persona-Lauf wird ein `User`-Datensatz mit `is_simulation=True` und zufälligem Suffix erzeugt. Diese Nutzer sind vollständig anonymisiert (`eval_p01_abc123@kaia-eval.internal`) und werden nach dem Eval-Run nicht gelöscht — ihre Sessions bilden die Eval-Datenbasis für Retest-Vergleiche.

### 4.13.6 Eval-UI (Admin-Frontend)

- **Heatmap**: Farbkodierte Metrik-Scores pro Persona × Session; geflaggte Zellen (Score ≤ 1 oder M7-Treffer) werden rot markiert.
- **Vergleichsmodus**: Zwei Modelle nebeneinander (z. B. claude-sonnet-4-6 vs. mistral-large-latest).
- **Live-Log**: Echtzeit-Einblick in den Eval-Fortschritt.
- **Cancel**: `DELETE /admin/eval/runs/{run_id}` ruft `asyncio.Task.cancel()` auf — sofortiger Stop beim nächsten `await` im Task.

---

## 4.14 Observability und Monitoring

### 4.14.1 Sentry

Sentry ist für Backend (`sentry-sdk[fastapi]`) und Frontend (`instrumentation-client.ts`) konfiguriert. Backend-Fehler werden mit Session-ID und User-ID angereichert; Frontend-Fehler enthalten den Router-Kontext. Konfiguration über `sentry_kaia_api` (Backend-DSN) und `NEXT_PUBLIC_SENTRY_DSN` (Frontend).

### 4.14.2 Slack-Webhooks

Der `notify()`-Aufruf in `observability/slack.py` sendet Benachrichtigungen für: neue Registrierungen, Admin-Freigaben, Session-Reports (Nutzerin meldet auffälliges KAIA-Verhalten), Bug-Reports über das BugReport-Widget, und Fehler-Eskalation bei kritischen LLM-Ausfällen.

### 4.14.3 Strukturiertes Logging

`structlog` mit JSON-Output ist im gesamten Backend aktiv. Alle relevanten Events sind mit Kontextfeldern versehen (session_id, user_id, model, token-counts, cost). Der `llm_response_complete`-Event protokolliert Input/Output-Tokens nach jedem KAIA-Call; `judge_scored` protokolliert Metrik, Score und Kosten nach jedem Judge-Call.

### 4.14.4 Study-Lock und CI-Gates

Der `STUDY_MODE`-Enum (`development`, `pilot`, `locked`) steuert das Systemverhalten. Im `locked`-Modus sind Prompt-Änderungen im Frontend gesperrt; der CI-Study-Lock-Guard in der GitHub-Actions-Pipeline blockiert Merges, die Prompt-Templates oder Schema-Migrationen berühren. Diese technische Sperre verhindert unbeabsichtigte Interventionen während der Datenerhebung.

---

## 4.15 Frontend-Architektur

### 4.15.1 App Router und Routing-Gruppen

Das Next.js 14 App Router-Frontend ist in drei Routing-Gruppen strukturiert:
- `(public)/`: Landing Page, /wissenschaft, /architektur, /release-notes
- `(auth)/`: Login, Registrierung, KI-Disclosure-Gate
- `(app)/`: Chat, Onboarding, Survey (pre/post)
- `admin/`: Dashboard, Users, Prompts, Eval, Kosten, Journey-Test, Daily-Log

### 4.15.2 Chat-Frontend

Das Chat-Interface implementiert:
- **SSE-Stream-Reader**: `ReadableStream`-API, Decode-Buffer, Event-Parsing (`data: {...}`)
- **`ChatDayBanner`**: "Session N von 10 · [Phasenhinweis]" — gibt der Nutzerin Orientierung im 10-Session-Bogen
- **`ChatInfoPanel`**: Anleitung auf Abruf (Kollapsierbar) — erklärt KAIAs Arbeitsweise und die EMA-Signale
- **`ChatReportModal`**: Melde-Funktion für auffälliges KAIA-Verhalten → Slack-Webhook
- **Character-Selector**: Wahl des Prompt-Charakters (warm/herausfordernd/unberechenbar) im Eingabebereich
- **Closure-State-Machine**: `idle → loading → awaiting_confirm → ended` steuert den Sitzungsabschluss-Flow (Closing-Bubble → Bestätigen oder Weiterschreiben → Session beenden)
- **Tap-Targets**: Mindestgröße 44 px (WCAG 2.5.5)

### 4.15.3 Admin-Bereich

Das Admin-Dashboard umfasst: Health-Check-Anzeige, Kostentransparenz (llm_usage pro Nutzerin), User-Approval-Flow (Freischalten, Löschen, Modell-Zuweisen über `UserModelSelector`), Journey-Test mit Modell-Switcher, Prompt-Editor (live), Eval-Matrix mit Simulations-Starter, Release-Notes-Anzeige und Entwicklungs-Tagebuch.

### 4.15.4 Auth-Flow im Frontend

`tokenStore` (In-Memory, `window.__kaia_access_token`) hält den Access Token; `authFetch()` fügt den Bearer-Header automatisch an und handhabt Token-Refresh transparent. `apiLogout()` revoziert den Refresh-Token serverseitig und leert den Client-State.

---

## 4.16 Deployment und Infrastruktur

### 4.16.1 Hetzner CX23 Helsinki

Ein einzelner Cloud-Server (2 vCPU, 4 GB RAM, Hetzner CX23, Helsinki) hostet die gesamte KAIA-Infrastruktur. Die Entscheidung für einen EU-Serverstandort (Finnland, EU-Rechtsgebiet) ist DSGVO-konform und Schrems-II-unproblematisch. Kein Managed-Service außerhalb der EU für Datenverarbeitung.

### 4.16.2 Docker Compose

Zwei Compose-Dateien: `docker-compose.dev.yml` (lokale Entwicklung mit Hot-Reload) und `docker-compose.prod.yml` (Produktionsdeployment mit Caddy, PostgreSQL-Volume, Sentry-DSN). Caddy übernimmt TLS-Terminierung (Let's Encrypt), HTTP-zu-HTTPS-Redirect und Proxy zu FastAPI und Next.js.

### 4.16.3 GitHub Actions CI

Die CI-Pipeline prüft bei jedem Push auf `main` und `develop`:
- **API**: ruff (Linting + Format-Check), mypy (Typprüfung), pip-audit (Dependency-Audit), pytest (Coverage ≥ 65 %)
- **Web**: npm ci, npm audit, tsc --noEmit, eslint, next build
- **Study-Lock Guard**: Separate Job, der bei `STUDY_MODE=locked` Prompt- und Schema-Änderungen blockiert

Pre-Commit-Hooks: ruff, mypy; commitlint erzwingt das Conventional-Commits-Format mit Release-Note-Trailer.

---

## 4.17 Limitierungen und Ausblick

### 4.17.1 pgvector-Nutzung

Die `memory_chunks`-Tabelle mit IVFFLAT-Index ist implementiert, aber noch nicht aktiv in den Produktions-Gesprächspfad eingebunden. Cross-Session-Memory basiert aktuell ausschließlich auf den strukturierten `session_summary`-JSON-Feldern (symbolisches Gedächtnis), nicht auf semantischer Vektorsuche. Die Infrastruktur für semantisches Retrieval ist vorhanden; die Integration in den `_build_system_prompt()`-Pfad ist für eine spätere Iteration vorgesehen. Für die Pilotstudie mit ca. 20 Teilnehmenden und maximal 10 Sessions ist das symbolische Gedächtnis ausreichend und methodisch sauberer (keine Halluzinations-Risiken durch Retrieval).

### 4.17.2 Conflict of Interest

Die Forscherin ist gleichzeitig Entwicklerin und erste Testnutzerin des Systems. Das Risiko des Confirmation Bias — unbewusste Optimierung des Prompts auf die eigene Kommunikationsweise — wird durch die Crash-Persona-Simulation und die LLM-as-Judge-Evaluation strukturell begrenzt, aber nicht vollständig eliminiert. Dieser Conflict of Interest ist in der Thesis offen deklariert (vgl. Kapitel 6).

### 4.17.3 Study-Mode-Transition

Vor Studienstart ist `STUDY_MODE=pilot` zu setzen (Freigabe neuer Nutzer erlaubt, Prompt-Änderungen möglich); bei Beginn der Datenerhebung wechselt der Modus auf `STUDY_MODE=locked`. Dieser Übergang ist manuell und erfordert ein explizites Deployment. Eine automatische Transition auf Basis eines kalendarischen Studienstart-Datums ist nicht implementiert — bewusste Entscheidung für explizite Kontrolle.

---

## Literaturverzeichnis (Kapitel 4)

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A taxonomy for learning, teaching, and assessing: A revision of Bloom's taxonomy of educational objectives*. Longman.

Anthropic. (2024). *Prompt engineering overview: Use XML tags to structure your prompts*. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

Collins, A., Brown, J. S., & Newman, S. E. (1989). Cognitive apprenticeship: Teaching the crafts of reading, writing, and mathematics. In L. B. Resnick (Hrsg.), *Knowing, learning, and instruction: Essays in honor of Robert Glaser* (S. 453–494). Lawrence Erlbaum Associates.

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.

Csikszentmihalyi, M., & Larson, R. (1987). Validity and reliability of the experience sampling method. *Journal of Nervous and Mental Disease, 175*(9), 526–536.

Gagné, R. M. (1985). *The conditions of learning and theory of instruction* (4. Aufl.). Holt, Rinehart & Winston.

Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. *American Psychologist, 54*(7), 493–503.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Lieberman, M. D., Eisenberger, N. I., Crockett, M. J., Tom, S. M., Pfeifer, J. H., & Way, B. M. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity in response to affective stimuli. *Psychological Science, 18*(5), 421–428.

Merrill, M. D. (2002). First principles of instruction. *Educational Technology Research and Development, 50*(3), 43–59.

Pintrich, P. R., Smith, D. A. F., García, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)* (Technical Report 91-B-004). University of Michigan.

Pintrich, P. R., Smith, D. A. F., García, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement, 53*(3), 801–813.

Schwarzer, R., & Jerusalem, M. (1995). Generalized self-efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio. Causal and control beliefs* (S. 35–37). NFER-NELSON.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4*, 1–32.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.
