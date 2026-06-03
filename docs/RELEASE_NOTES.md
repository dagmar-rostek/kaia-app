# KAIA Release Notes

> Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert —
> vom ersten Commit bis heute. Pro Eintrag siehst du, was sich für Nutzer:innen
> konkret geändert hat, plus die realistische Gesamt-Aufwands-Zeit.
>
> **Zeit-Formel** — Commit-Tage: reine Chat-/Coding-Zeit + ⅓ Konzeptionierungs-Zeit
> + ⅓ Smoke-Test-Zeit = Chat × ⁵⁄₃.

---

**Stand heute:** Wednesday, 03. June 2026  
**34 Einträge insgesamt · 7 Release-Tage · ~27 h 45 min Gesamt-Aufwand**

---

## Wednesday, 03. June 2026
*11 Einträge · Tag-Summe ca. 6 h*

### 🆕 Neu

**03.06.2026 · `cd2155c`** — Admin User-Approval UI (/admin/users): Übersicht aller pending/aktiven/gesperrten Teilnehmenden. Freigabe-Button setzt Status ACTIVE + trägt `approved_at`/`approved_by` ein + Slack-Notification. Ablehnen-Button mit optionalem Grund-Eingabefeld. Aktive Teilnehmende mit Login-Datum, Reaktivierung gesperrter Accounts. Server Actions — Admin-Token verlässt den Server nie.  · `1h 30min`  
*feat: Admin User-Approval UI — Teilnehmende freigeben/ablehnen*

**03.06.2026 · `b89d594`** — Crisis-Detection-Pre-Filter (`app/core/crisis.py`): 20+ deutsche Regex-Muster für Suizidgedanken und Selbstverletzung. Bei Treffer: keine LLM-Verarbeitung, statische Antwort mit Telefonseelsorge 0800 111 0 111 und Notruf 112. KI-Disclosure-Seite (`/ki-disclosure`) mit Bestätigungs-Button der POST `/auth/disclosure-ack` auslöst. Datenschutzerklärung (`/datenschutz`) DSGVO-konform mit allen Art. 15–21 Rechten, Schrems-II-Hinweis, 6-Monate-Löschfrist.  · `1h 30min`  
*feat: crisis detection + KI-disclosure + Datenschutzerklärung*

**Wissenschaftlicher/regulatorischer Impact:** Crisis-Detection ist Pflicht für das Ethikvotum SRH — ohne sie keine Studie. Der KI-Disclosure-Flow stellt sicher, dass alle Teilnehmenden explizit bestätigen, dass KAIA eine KI ist (computational empathy, kein Mensch) — DSGVO-Transparenzpflicht und ethische Mindestanforderung. Die Datenschutzerklärung ist das Kerndokument für den Ethikvotum-Antrag.

### 📄 Docs

**03.06.2026 · `7404aa3`** — Studienprotokoll (v1.0) + Teilnahmevereinbarung/Einwilligungserklärung erstellt: Forschungsfrage, drei vorregistrierungsfähige Hypothesen (H1–H3), Prä-Post-Design mit GSE-Skala, Krisenprotokoll, Risikobewertung. Einwilligungserklärung druckfertig mit DSGVO-Rechten und KI-Disclosure-Hinweis.  · `45min`  
*docs: Studienprotokoll + Teilnahmevereinbarung für Ethikvotum SRH*

**03.06.2026 · `bccc530`** — R-basierte Power-Analyse (`docs/power_analyse.R`): Wilcoxon-Vorzeichenrangtest, d=0.5, α=0.05, Power=80%. Ergebnis: N=32 Minimum. Power-Kurve als PNG. Reproduzierbar und thesis-zitierfähig.  · `20min`  
*docs: R-basierte Power-Analyse*

**03.06.2026 · `aa12bf9`** — Ziel-N auf 32 angehoben: Studienprotokoll mit exakten Power-Werten aktualisiert (N=32 → 80%, N=20 → 56.5%). Rekrutierungsziel ~46 mit 30% Dropout-Puffer.  · `10min`  
*docs: Ziel-N auf 32 angehoben (80% Power)*

### ⚡ Verbesserung

**03.06.2026 · `635ca91`** — Admin-Roadmap komplett überarbeitet: Filter-Bar (Status/Tags/Agents kombinierbar), Feature-Karten mit beteiligten Agents (12 Typen farbkodiert), Aufwand-Schätzung und Git-Hash bei fertigen Features. Wissenschaftliche Pflichten als einklappbares Accordion.  · `1h`  
*feat: redesign admin roadmap — filters, agents, time, sha*

**03.06.2026 · `7f5b0a4`** — Roadmap-Filter von Inline-Pills auf Dropdown-Boxen umgestellt (Status/Tags/Agents mit Checkbox-Listen). Spaltenreihenfolge: Backlog → Juni → Juli → August → Fertig.  · `20min`  
*feat: roadmap filter as dropdowns + column order*

### 🔧 Fix

**03.06.2026 · `9390ec9`** — passlib (unmaintained seit 2023) mit bcrypt>=4.0 inkompatibel: `__about__`-Attribut fehlt, 72-Byte-Limit strict. Ersetzt durch direktes bcrypt + SHA-256-Pre-Hash. Fünf Crisis-Detection-Patterns korrigiert (Wortstellungsfehler: 'nicht mehr leben' ohne Trailing-Verb, 'rItze' statt 'ritzen', Verb-vor-Objekt-Fälle).  · `20min`  
*fix: passlib → bcrypt direkt + crisis-Patterns korrigiert*

**03.06.2026 · `a01be4b`** — `INTERNAL_API_URL` in docker-compose war `http://api:8000` statt `http://api:8000/api` — Admin User-Approval API-Calls wären fehlgeschlagen.  · `5min`  
*fix: INTERNAL_API_URL mit /api-Prefix in docker-compose*

**03.06.2026 · `336ab0a`** — ruff E501 (Zeile zu lang in crisis.py), A003 global ignoriert (SQLAlchemy `id`-Attribute — Standard), I001 auto-fixed. `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` im CI-Workflow.  · `15min`  
*fix: ruff E501/A003/I001 + Node.js 24 in CI*

**03.06.2026 · `af559c8`** — ruff format auf crisis.py, test_crisis.py, test_service.py angewendet.  · `5min`  
*style: ruff format crisis.py + test files*

---

## Tuesday, 02. June 2026
*5 Einträge · Tag-Summe 3 h 20 min*

### 🆕 Neu

**02.06.2026 · `1c0aaa1`** — Produktroadmap im Admin-Bereich (/admin/roadmap): Feature-Timeline Juni–August 2026 mit 34 Features in 4 Spalten (Fertig / Juni / Juli / August). Jede Karte zeigt Status-Badge, Beschreibung, Thesis-Kapitel-Mapping und farbkodierte Tags (DSGVO, Ethik, Psychometrie, LLM-Eval). Wissenschaftliche-Pflichten-Tracker listet alle 13 Pflichtpunkte — Blocker für das Ethikvotum rot hervorgehoben. Studienziel-Übersicht (20 Teilnehmende, 6-Monate-Datenlöschung, Token-Budget). Seite ist passwortgeschützt im Admin-Bereich.  · `1h 30min`  
*feat: add admin roadmap page with thesis chapter mapping*

**Wissenschaftlicher/regulatorischer Impact:** Die Roadmap macht den Forschungsprozess transparent und erzwingt die explizite Planung wissenschaftlicher Pflichtpunkte (Crisis-Detection, Ethikvotum, Pre-Registration OSF.io) vor dem Studienstart. Das Thesis-Kapitel-Mapping stellt sicher, dass jede technische Entscheidung mit dem wissenschaftlichen Rahmenwerk (Hevner et al., 2004) verbunden bleibt — Designentscheidungen ohne Thesis-Bezug werden sichtbar und hinterfragbar.

### 🔧 Fix

**02.06.2026 · `0f271d6`** — Admin-Login war wegen falscher Runtime-Annahme dauerhaft defekt: `process.env.ADMIN_PASSWORD` ist im Next.js Edge Runtime (Middleware) nicht erreichbar — das HMAC wurde mit leerem Key berechnet, der Cookie nie akzeptiert. Fix: Admin-Authentifizierung aus der Middleware in ein Server Component Layout (Node.js Runtime, `admin/(protected)/layout.tsx`) verschoben, wo `process.env` korrekt funktioniert. Gleichzeitig: 3 neue Backend-Test-Dateien (security.py, service.py, slack.py) bringen CI-Coverage von 60 % auf über 70 %.  · `1h`  
*fix: move admin auth from Edge Runtime middleware to Server Component layout*

**02.06.2026 · `30e6373`** — Kritischer Deployment-Bug: `apps/web/.env.local` enthielt `ADMIN_PASSWORD=testpasswort123` und wurde durch `COPY . .` im Dockerfile in das Docker-Image gebacken. Next.js lud diese Datei beim Server-Start und überschrieb den korrekten Runtime-Wert aus docker-compose — Admin-Login war auf dem Server dauerhaft mit dem falschen Passwort gesperrt. Fix: `.dockerignore` erstellt (schließt alle `.env.local`-Dateien aus dem Build aus), `ADMIN_PASSWORD` aus `.env.local` entfernt.  · `30min`  
*fix: exclude .env.local from Docker image, remove hardcoded ADMIN_PASSWORD*

### ⚙️ Infra

**02.06.2026 · `645a0e8`** — Deploy-Skript `scripts/deploy.sh` erstellt: Docker Compose mit `-f infra/docker-compose.prod.yml` suchte die `.env` im Verzeichnis der Compose-Datei (`infra/`) statt im Repo-Root — alle Variablen (ADMIN_PASSWORD, JWT_SECRET, DB-Credentials, API-Keys) wurden als leer interpretiert. Das Script übergibt `--env-file` explizit. Verwendung: `./scripts/deploy.sh [web|api|all]`.  · `15min`  
*fix: add deploy script that correctly passes --env-file to docker compose*

**02.06.2026 · `9eabd2b`** — Unbenutzter `RefreshToken`-Import in `test_service.py` entfernt (ruff F401 nach Refaktor).  · `5min`  
*fix: remove unused RefreshToken import (ruff F401)*

---

## Monday, 01. June 2026
*2 Einträge · Tag-Summe 3 h 00 min*

### 🆕 Neu

**01.06.2026 · `f82d263`** — Auth Phase 4 abgeschlossen: Login-Seite (`/login`), Registrierung (`/registrierung`) mit DSGVO-Zweifach-Consent (Pflichtfeld + freiwillige Analytics), `AuthContext` mit `loading/authenticated/unauthenticated`-States, `AuthGuard` in `(app)/layout.tsx`, `kaia_session`-Cookie als Middleware-lesbarer Session-Indikator (Access-Token bleibt In-Memory, nie in Storage). Slack-Benachrichtigung bei Neuregistrierung. Middleware schützt `/chat`, `/onboarding`, `/gse`.  · `2h`  
*feat: Auth Phase 4 — Frontend Login, Registrierung, geschützte Routen*

**Wissenschaftlicher/regulatorischer Impact:** DSGVO Art. 7 verlangt nachweisbaren, getrennten Consent für verschiedene Verarbeitungszwecke — deshalb zwei explizite Checkboxen (Datenverarbeitung als Literal[True], Analytics als opt-in). Der User-Approval-Flow (kein automatisches Onboarding) ist Voraussetzung für die Studienkontrolle: nur geprüfte Teilnehmende der Pilotstudie erhalten Zugang. Der `kaia_session`-Cookie enthält keine sensiblen Daten und ermöglicht Middleware-Schutz ohne Edge-Runtime-Probleme (Separation of Concerns zwischen Auth-Cookies).

### ⚙️ Infra

**01.06.2026 · `464820f`** — Sentry vollständig ins Next.js-Frontend integriert: `instrumentation.ts` mit `onRequestError`-Hook fängt alle Server-Component-Fehler, `instrumentation-client.ts` (Next.js 15.3-Feature) initialisiert Sentry clientseitig vor React-Hydration, globaler `global-error.tsx`-Boundary sendet Root-Layout-Crashs. DSN via Build-Arg in Bundle baked + Runtime-Env für Server. War nicht konfiguriert, obwohl das Package installiert war.  · `1h`  
*feat: Sentry Frontend-Integration (instrumentation.ts + client)*

**Wissenschaftlicher/regulatorischer Impact:** DSGVO Art. 5 (1)(f) verlangt Integrität und Vertraulichkeit — das schließt Ausfallsicherheit und Fehlermonitoring ein. Für das Ethikvotum müssen kritische Systemfehler während der Studie dokumentiert und nachvollziehbar sein. Ohne Sentry-Frontend-Integration wären Client-seitige Fehler unsichtbar gewesen — die Datenerhebungsphase hätte unter unbekannten Fehlerbedingungen laufen können, ohne dass die Forscherin davon wüsste.

---

## Friday, 30. May 2026
*2 Einträge · Tag-Summe 4 h 30 min*

### 🆕 Neu

**30.05.2026 · `7bc1929`** — Auth-Flow implementiert: Registrierung mit DSGVO-Pflichtconsent (zwingend True, kein Opt-out), Login/Logout, JWT Access-Token (15 min, Bearer) + Refresh-Token (30 d, httpOnly-Cookie). Token-Rotation mit Family-basierter Reuse-Detection — gestohlener Token sperrt die gesamte Familie (RFC 6749). Brute-Force-Schutz (5 Versuche → 15 min Kontosperre). Konten starten als `pending`, Admin-Freigabe erforderlich. KI-Disclosure-Gate als eigener Endpunkt. Alembic async konfiguriert, erstes DB-Schema live.  · `3h 30min`  
*feat: Auth-Flow Phase 1+2 — Alembic, JWT, Register/Login/Refresh/Logout*

**Wissenschaftlicher/regulatorischer Impact:** DSGVO Art. 7 verlangt nachweisbaren, informierten Consent — deshalb `consent_at`-Timestamp (nicht nur Boolean) und `Literal[True]`-Validierung in Pydantic. DSGVO Art. 5 (1)(f) + Art. 32 verlangen technische Schutzmaßnahmen: bcrypt mit 12 Runden, Token-Hashes statt Klartext, httpOnly-Cookie verhindert XSS-Zugriff. Die Admin-Freigabe ist kein UI-Komfort, sondern Studienkontrolle: nur geprüfte Teilnehmende der Pilotstudie erhalten Zugang — Voraussetzung für das Ethikvotum der SRH.

### ⚙️ Infra

**30.05.2026 · `ad29b9e`** — Team-Charta auf Exposé-Stand gebracht: drei wissenschaftliche Spannungsfelder, vier Thesis-Deliverables, WCAG 2.2 AA (statt 2.1), 80% Coverage-Gate. Diskussions-Kultur-Sektion (ehrliche Kritik, kein Pseudo-Konsens) und Code-Verhalten-Regeln (Einfachheit, chirurgische Änderungen) hinzugefügt. Drei neue Slash-Commands: `/morning`, `/evening`, `/weekly` mit Thesis-Fortschritt-Tracking.  · `1h`  
*chore: update team charter + add morning/evening/weekly commands*

---

## Monday, 25. May 2026
*11 Einträge · Tag-Summe 7 h 55 min*

### 🆕 Neu

**25.05.2026 · `8085cb7`** — Admin-Bereich gebaut (Production Readiness, Changelog, Architektur, Dashboard) — passwortgeschützt via Edge-Middleware. Code auf Produktionsstandard gebracht: PyJWT statt python-jose (CVE), Non-Root-Docker, 70%-Coverage-Gate in CI, React Query + Zod, typisierter API-Client, BugReportWidget sauber refaktoriert.  · `3h`  
*feat: admin area + code review fixes (towards 10/10)*

**25.05.2026 · `83bdee9`** — Kosten-Übersichtsseite im Admin-Bereich — Infrastruktur, Claude Code Entwicklungskosten und zukünftige LLM-Inferenzkosten auf einen Blick. Tages-Zeittracker mit /log Command.  · `30min`  
*feat: cost overview page, daily log tracker, /log command*

**25.05.2026 · `4988db3`** — Entwicklungs-Tagebuch im Admin-Bereich — tägliche Einträge als witzige Stories aus Agenten-Sicht, erstellbar mit /log Command.  · `20min`  
*feat: daily log page + story-style /log command*

**25.05.2026 · `f54371c`** — Neue öffentliche Seite /wissenschaft — alle 24 wissenschaftlichen Quellen der Masterthesis mit Erklärung warum jede Quelle für KAIA relevant ist. Aus dem Exposé + Empfehlungen des Psychologen.  · `45min`  
*feat: public wissenschaft page with all theoretical foundations*

### ⚡ Verbesserung

**25.05.2026 · `b32cd99`** — Entwicklungs-Tagebuch jetzt mit Monats-Navigation und Accordion — der neueste Eintrag ist sofort sichtbar, ältere per Klick aufklappbar.  · `45min`  
*feat: daily log UX — accordion + month index navigation*

**25.05.2026 · `da909b5`** — Alle öffentlichen Seiten (Release Notes, Architektur, Wissenschaft) haben jetzt eine gemeinsame Navigation — von jeder Seite aus erreichbar.  · `45min`  
*feat: shared public layout with nav for all public pages*

### 🔧 Fix

**25.05.2026 · `56f48a0`** — API-Startfehler behoben (fehlende email-validator Dependency); Caddy DNS-Konfiguration korrigiert für Let's Encrypt.  · `10min`  
*fix: add email-validator dependency and remove Caddy DNS override*

**25.05.2026 · `32a2766`** — Tagebuch, Release Notes und Architektur sind jetzt auch auf dem Server sichtbar — docs/-Ordner wird als Volume in den Web-Container gemountet.  · `20min`  
*fix: mount docs/ volume in prod + unified readDoc helper*

**25.05.2026 · `b1ff04c`** — Tagebuch, Release Notes und Architektur zeigen jetzt tatsächlich Inhalte auf dem Server.  · `10min`  
*fix: force-dynamic on all doc-reading pages*

### ⚙️ Infra

**25.05.2026 · `747e7d5`** — Spezialisiertes 12-köpfiges Sub-Agent-Team integriert (Architect, Security, Compliance, Psychologist, AI Engineer, AI Ethics, UX, QA, MLOps, Product Owner, Discovery Researcher, Coordinator) mit vollständigem KAIA-Projekt-Kontext.  · `30min`  
*chore: add 12-agent development team with KAIA onboarding*

**25.05.2026 · `f79e75f`** — Lokale Entwicklungsumgebung mit Docker eingerichtet — Backend und Datenbank starten per docker compose, Frontend läuft nativ für schnellen Hot-Reload.  · `25min`  
*feat: local dev environment with Docker (DB + API)*

---

## Monday, 18. May 2026
*2 Einträge · Tag-Summe 15 min*

### 🔧 Fix

**18.05.2026 · `4a16140`** — Docker-Build-Fehler behoben – Next.js produziert jetzt das für den Container benötigte standalone-Verzeichnis.  · `5min`  
*fix: enable standalone output for Next.js Docker build*

### ⚙️ Infra

**18.05.2026 · `f581dd2`** — Sentry-Umgebungsvariablen von SENTRY_DSN_API/WEB zu SENTRY_KAIA_API/WEB umbenannt.  · `10min`  
*refactor: rename Sentry env vars to SENTRY_KAIA_API/WEB*

---

## Saturday, 16. May 2026
*1 Einträge · Tag-Summe 3 h 00 min*

### ⚙️ Infra

**16.05.2026 · `426aa27`** — KAIA v2 startet — komplett neu aufgebaut als FastAPI + Next.js Monorepo. Ab diesem Commit wird jede Änderung hier dokumentiert. Bereits enthalten: Release-Notes-Seite, Architektur-Seite, Bug-Report-Widget (→ Slack), Dark/Light-Mode, CI/CD mit Study-Lock-Guard, Docker Compose für Lokal und Produktion, Projekt-Backlog mit 73 priorisierten Issues.  · `3h`  
*chore: initial monorepo skeleton (KAIA v2)*
