# ADR 001: Monorepo mit FastAPI + Next.js

**Datum:** Mai 2026
**Status:** Akzeptiert

## Kontext
KAIA v1 war ein Streamlit-Monolith. Für die Produkt-Phase (nach Thesis-Verteidigung) wird
eine skalierbare, testbare und beobachtbare Architektur benötigt.

## Entscheidung
Monorepo mit zwei Apps:
- **FastAPI** (Python 3.12) als Backend — renutzt 90% der Kern-Logik aus KAIA v1
- **Next.js 14 App Router** (TypeScript) als Frontend — mobile-first, SSR, A11y

## Begründung
- Dagmar hat mit React + FastAPI bereits ein Produkt (SkillFit) produktiv gebracht
- `core/` aus KAIA v1 ist framework-agnostisch und wird 1:1 migriert
- Next.js App Router ermöglicht SSR für Release-Notes und Architektur-Seiten ohne separaten CMS
- FastAPI + Pydantic v2 + mypy --strict = typsicheres, testbares Backend

## Alternativen verworfen
- Streamlit: Zu begrenzt für Mobile, A/B-Testing, Prompt-Management-UI
- SvelteKit: Kleinere Community, weniger shadcn/ui-Support
- Django: Zu viel Boilerplate für API-only Backend
