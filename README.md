# KAIA – Kinetic AI Agent

> **K**een · **A**daptive · **I**ntelligent · **A**ware

Masterthesis | SRH Fernhochschule Riedlingen | M.Sc. Data Science & Analytics
Dagmar Rostek · 2025/2026

---

## Schnellstart (lokal)

```bash
# 1. Repository klonen
git clone git@github.com:dagmar-rostek/kaia-app.git
cd kaia-app

# 2. Umgebungsvariablen
cp .env.example .env
# .env öffnen und Keys eintragen

# 3. Dev-Stack starten
docker compose -f infra/docker-compose.dev.yml up -d

# 4. Alternativ: ohne Docker
cd apps/api && pip install -e ".[dev]" && uvicorn app.main:app --reload
cd apps/web  && npm install && npm run dev
```

**Lokal:**
- Frontend: http://localhost:3000
- API:      http://localhost:8000
- API-Docs: http://localhost:8000/api/docs (nur DEBUG=true)

---

## Release Notes generieren

```bash
python scripts/generate_release_notes.py
```

Commit-Format (Pflicht):
```
feat: kurze englische Beschreibung

Release-Note: Was hat sich für Nutzer:innen geändert (Deutsch).
Aufwand: 1h 30min
Kategorie: Neu | Verbesserung | Fix | Infra | Docs
```

---

## Deployment (Produktion)

```bash
ssh root@[hetzner-ip]
cd ~/kaia-app
git pull
docker compose -f infra/docker-compose.prod.yml up -d --build
```

---

## Projektstruktur

Siehe [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Offene Aufgaben

Siehe [docs/BACKLOG.md](docs/BACKLOG.md) — 73 Issues, priorisiert nach Studienphase.
