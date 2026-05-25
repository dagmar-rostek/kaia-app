# KAIA Entwicklungs-Tagebuch

Tägliche Protokollierung: Was wurde gemacht, wie lange, was hat's gekostet.
Einträge werden mit dem `/log` Command in Claude Code erstellt.

---

## 2026-05-25 (Sonntag)

**Schwerpunkt:** Monorepo-Aufbau, 12-köpfiges Agenten-Team, Admin-Bereich, Docker Dev-Setup

**Abgeschlossen:**
- Monorepo-Skeleton aufgebaut (Next.js 14 + FastAPI, Docker Compose, Caddy)
- Hetzner CX23 Server aufgesetzt und kaia-app v2 deployed (ersetzt Streamlit v1)
- SSH-Zugang für Mac + Server zu GitHub eingerichtet
- Sentry-Integration (SENTRY_KAIA_API / SENTRY_KAIA_WEB) + Slack-Webhook
- 12-köpfiges Agenten-Team integriert (CLAUDE.md, .claude/agents/, .claude/commands/)
- Kritische Code-Evaluation durch Architect + AI Engineer (5.5/10 → Bereinigungsplan)
- Code-Review-Fixes: PyJWT, multi-stage Dockerfile, nicht-root User, async SQLAlchemy, Domain-Skeleton, React Query, typisierter API-Client, Route Groups
- Admin-Bereich vollständig (Login, Dashboard, Production Readiness, Release Notes, Architektur) — passwortgeschützt via Edge Middleware
- Lokale Docker Dev-Umgebung (docker-compose.dev.yml, Dockerfile.dev, hot-reload)
- Kosten-Tracking Seite + Zeittracker

**Commits:** 426aa27, f581dd2, 4a16140, 8085cb7, f79e75f

**Claude Code Session:** ca. $20–40 (Schätzung — echte Zahl in Anthropic Console)
**Hetzner laufend:** ca. €4.39/Monat

**Offen → nächste Session:**
- Auth-Flow: Registrierung, Login, JWT, User-Approval durch Admin
- Alembic-Migrationen laufen lassen
- GSE-Fragebogen-Konzept
