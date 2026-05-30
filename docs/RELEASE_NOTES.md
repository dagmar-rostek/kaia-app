# KAIA Release Notes

> Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert —
> vom ersten Commit bis heute. Pro Eintrag siehst du, was sich für Nutzer:innen
> konkret geändert hat, plus die realistische Gesamt-Aufwands-Zeit.
>
> **Zeit-Formel** — Commit-Tage: reine Chat-/Coding-Zeit + ⅓ Konzeptionierungs-Zeit
> + ⅓ Smoke-Test-Zeit = Chat × ⁵⁄₃.

---

**Stand heute:** Friday, 30. May 2026  
**16 Einträge insgesamt · 4 Release-Tage · 15 h 25 min Gesamt-Aufwand**

---

## Friday, 30. May 2026
*2 Einträge · Tag-Summe 4 h 30 min*

### 🆕 Neu

**`7bc1929`** — Auth-Flow implementiert: Registrierung mit DSGVO-Pflichtconsent (zwingend True, kein Opt-out), Login/Logout, JWT Access-Token (15 min, Bearer) + Refresh-Token (30 d, httpOnly-Cookie). Token-Rotation mit Family-basierter Reuse-Detection — gestohlener Token sperrt die gesamte Familie (RFC 6749). Brute-Force-Schutz (5 Versuche → 15 min Kontosperre). Konten starten als `pending`, Admin-Freigabe erforderlich. KI-Disclosure-Gate als eigener Endpunkt. Alembic async konfiguriert, erstes DB-Schema live.  · `3h 30min`  
*feat: Auth-Flow Phase 1+2 — Alembic, JWT, Register/Login/Refresh/Logout*

**Wissenschaftlicher/regulatorischer Impact:** DSGVO Art. 7 verlangt nachweisbaren, informierten Consent — deshalb `consent_at`-Timestamp (nicht nur Boolean) und `Literal[True]`-Validierung in Pydantic. DSGVO Art. 5 (1)(f) + Art. 32 verlangen technische Schutzmaßnahmen: bcrypt mit 12 Runden, Token-Hashes statt Klartext, httpOnly-Cookie verhindert XSS-Zugriff. Die Admin-Freigabe ist kein UI-Komfort, sondern Studienkontrolle: nur geprüfte Teilnehmende der Pilotstudie erhalten Zugang — Voraussetzung für das Ethikvotum der SRH.

### ⚙️ Infra

**`ad29b9e`** — Team-Charta auf Exposé-Stand gebracht: drei wissenschaftliche Spannungsfelder, vier Thesis-Deliverables, WCAG 2.2 AA (statt 2.1), 80% Coverage-Gate. Diskussions-Kultur-Sektion (ehrliche Kritik, kein Pseudo-Konsens) und Code-Verhalten-Regeln (Einfachheit, chirurgische Änderungen) hinzugefügt. Drei neue Slash-Commands: `/morning`, `/evening`, `/weekly` mit Thesis-Fortschritt-Tracking.  · `1h`  
*chore: update team charter + add morning/evening/weekly commands*

---

## Monday, 25. May 2026
*11 Einträge · Tag-Summe 7 h 55 min*

### 🆕 Neu

**`8085cb7`** — Admin-Bereich gebaut (Production Readiness, Changelog, Architektur, Dashboard) — passwortgeschützt via Edge-Middleware. Code auf Produktionsstandard gebracht: PyJWT statt python-jose (CVE), Non-Root-Docker, 70%-Coverage-Gate in CI, React Query + Zod, typisierter API-Client, BugReportWidget sauber refaktoriert.  · `3h`  
*feat: admin area + code review fixes (towards 10/10)*

**`83bdee9`** — Kosten-Übersichtsseite im Admin-Bereich — Infrastruktur, Claude Code Entwicklungskosten und zukünftige LLM-Inferenzkosten auf einen Blick. Tages-Zeittracker mit /log Command.  · `30min`  
*feat: cost overview page, daily log tracker, /log command*

**`4988db3`** — Entwicklungs-Tagebuch im Admin-Bereich — tägliche Einträge als witzige Stories aus Agenten-Sicht, erstellbar mit /log Command.  · `20min`  
*feat: daily log page + story-style /log command*

**`f54371c`** — Neue öffentliche Seite /wissenschaft — alle 24 wissenschaftlichen Quellen der Masterthesis mit Erklärung warum jede Quelle für KAIA relevant ist. Aus dem Exposé + Empfehlungen des Psychologen.  · `45min`  
*feat: public wissenschaft page with all theoretical foundations*

### ⚡ Verbesserung

**`b32cd99`** — Entwicklungs-Tagebuch jetzt mit Monats-Navigation und Accordion — der neueste Eintrag ist sofort sichtbar, ältere per Klick aufklappbar.  · `45min`  
*feat: daily log UX — accordion + month index navigation*

**`da909b5`** — Alle öffentlichen Seiten (Release Notes, Architektur, Wissenschaft) haben jetzt eine gemeinsame Navigation — von jeder Seite aus erreichbar.  · `45min`  
*feat: shared public layout with nav for all public pages*

### 🔧 Fix

**`56f48a0`** — API-Startfehler behoben (fehlende email-validator Dependency); Caddy DNS-Konfiguration korrigiert für Let's Encrypt.  · `10min`  
*fix: add email-validator dependency and remove Caddy DNS override*

**`32a2766`** — Tagebuch, Release Notes und Architektur sind jetzt auch auf dem Server sichtbar — docs/-Ordner wird als Volume in den Web-Container gemountet.  · `20min`  
*fix: mount docs/ volume in prod + unified readDoc helper*

**`b1ff04c`** — Tagebuch, Release Notes und Architektur zeigen jetzt tatsächlich Inhalte auf dem Server.  · `10min`  
*fix: force-dynamic on all doc-reading pages*

### ⚙️ Infra

**`747e7d5`** — Spezialisiertes 12-köpfiges Sub-Agent-Team integriert (Architect, Security, Compliance, Psychologist, AI Engineer, AI Ethics, UX, QA, MLOps, Product Owner, Discovery Researcher, Coordinator) mit vollständigem KAIA-Projekt-Kontext.  · `30min`  
*chore: add 12-agent development team with KAIA onboarding*

**`f79e75f`** — Lokale Entwicklungsumgebung mit Docker eingerichtet — Backend und Datenbank starten per docker compose, Frontend läuft nativ für schnellen Hot-Reload.  · `25min`  
*feat: local dev environment with Docker (DB + API)*

---

## Monday, 18. May 2026
*2 Einträge · Tag-Summe 15 min*

### 🔧 Fix

**`4a16140`** — Docker-Build-Fehler behoben – Next.js produziert jetzt das für den Container benötigte standalone-Verzeichnis.  · `5min`  
*fix: enable standalone output for Next.js Docker build*

### ⚙️ Infra

**`f581dd2`** — Sentry-Umgebungsvariablen von SENTRY_DSN_API/WEB zu SENTRY_KAIA_API/WEB umbenannt.  · `10min`  
*refactor: rename Sentry env vars to SENTRY_KAIA_API/WEB*

---

## Saturday, 16. May 2026
*1 Einträge · Tag-Summe 3 h 00 min*

### ⚙️ Infra

**`426aa27`** — KAIA v2 startet — komplett neu aufgebaut als FastAPI + Next.js Monorepo. Ab diesem Commit wird jede Änderung hier dokumentiert. Bereits enthalten: Release-Notes-Seite, Architektur-Seite, Bug-Report-Widget (→ Slack), Dark/Light-Mode, CI/CD mit Study-Lock-Guard, Docker Compose für Lokal und Produktion, Projekt-Backlog mit 73 priorisierten Issues.  · `3h`  
*chore: initial monorepo skeleton (KAIA v2)*
