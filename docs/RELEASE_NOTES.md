# KAIA Release Notes

> Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert —
> vom ersten Commit bis heute. Pro Eintrag siehst du, was sich für Nutzer:innen
> konkret geändert hat, plus die realistische Gesamt-Aufwands-Zeit.
>
> **Zeit-Formel** — Commit-Tage: reine Chat-/Coding-Zeit + ⅓ Konzeptionierungs-Zeit
> + ⅓ Smoke-Test-Zeit = Chat × ⁵⁄₃.

---

**Stand heute:** Monday, 25. May 2026  
**14 Einträge insgesamt · 3 Release-Tage · 10 h 55 min Gesamt-Aufwand**

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
