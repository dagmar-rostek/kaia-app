# Kapitel 4 — Technische Implementierung

> **Stand:** 04. Juni 2026 · **Version:** 0.2-DRAFT  
> **Reviewer:** Architect · Security · MLOps  
> **Geplanter Umfang:** ca. 18–22 Seiten (~4.500–5.500 Wörter)  
> **Status:** Architektur-Abschnitte vorhanden; Chat/LLM/Eval-Abschnitte folgen mit Implementierung (Juli 2026)

---

## Überblick

Kapitel 4 dokumentiert die technische Umsetzung des konzeptionellen Rahmenwerks (Kapitel 3) als funktionsfähige Webanwendung. Die Beschreibung folgt dem Vier-Schichten-Modell von KAIA: Eingabe → LLM-Verarbeitung → Gedächtnis → Datenhaltung.

---

## 4.1 Architekturentscheidungen und Methodik

### 4.1.1 Design Science Research als Entwicklungsparadigma

Die Entwicklung von KAIA folgt dem iterativen Design-Evaluate-Revise-Zyklus nach Hevner et al. (2004). Jede Architekturentscheidung wird vor dem Hintergrund der Anforderungen aus Kapitel 3 begründet. Kompromisse zwischen wissenschaftlichen, technischen und datenschutzrechtlichen Anforderungen werden explizit dokumentiert.

### 4.1.2 Tech-Stack und Begründung

| Komponente | Technologie | Begründung |
|---|---|---|
| Backend | FastAPI 0.115+ / Python 3.12 | Async-native, OpenAPI-kompatibel, lightweight |
| Frontend | Next.js 14 App Router / TypeScript | Server Components für DSGVO-konformes Rendering |
| Datenbank | PostgreSQL 16 + pgvector | EU-Standard, Row-Level-Security, semantische Suche |
| Auth | Custom JWT (PyJWT) + bcrypt-12 | Keine Drittanbieter-Abhängigkeit, volle Kontrolle |
| Hosting | Hetzner CX23 Helsinki | EU-Serverstandort, DSGVO-konform, Schrems-II-unproblematisch |
| LLM-Provider | Anthropic / OpenAI / Mistral | Evaluation aller drei; Mistral als EU-Option |

**Warum kein Managed Auth (Auth0, Supabase)?** Die Studie erfordert vollständige Kontrolle über alle Datenpfade. Drittanbieter für Auth würden unkontrollierte Datentransfers in die USA erzeugen.

---

## 4.2 Authentifizierung und Benutzerverwaltung

### 4.2.1 JWT-Architektur

*[Bereits implementiert — Stand: Mai/Juni 2026]*

KAIA verwendet ein zweistufiges Token-System:
- **Access Token** (15 Minuten, Bearer): Stateloser Zugriff auf API-Endpunkte
- **Refresh Token** (30 Tage, httpOnly-Cookie): Token-Rotation mit Family-basierter Reuse-Detection

Die Refresh-Token-Rotation folgt RFC 6749: Ein verwendetes Token wird sofort revoziert. Bei erkannter Wiederverwendung (Token-Theft-Indikator) wird die gesamte Token-Familie gesperrt. Passwörter werden mit bcrypt (12 Runden) gehasht; Brute-Force-Schutz ab 5 Fehlversuchen (15-Minuten-Kontosperre).

### 4.2.2 User-Approval-Flow als Studienkontrolle

Neue Konten starten mit Status `PENDING`. Der Zugang zur Anwendung wird erst nach expliziter Admin-Freigabe erteilt. Dieser Flow dient nicht primär der Kostenkontrolle, sondern der Studienkontrolle: Nur überprüfte Teilnehmende der Pilotstudie erhalten Zugang — eine Voraussetzung für das Ethikvotum der SRH.

---

## 4.3 Ethische Schutzmaßnahmen in der Implementierung

### 4.3.1 Crisis-Detection Pre-Filter

*[Implementiert: Juni 2026, Commit b89d594]*

Jede Texteingabe wird vor der LLM-Verarbeitung durch einen deterministischen Keyword-Filter geprüft. Der Filter enthält 20+ deutsche Regex-Muster für Suizidgedanken, Selbstverletzung und akute Hoffnungslosigkeit. Bei Treffer:
- Die Eingabe wird **nicht** an das LLM weitergeleitet
- Eine statische Antwort mit Krisenressourcen wird zurückgegeben (Telefonseelsorge 0800 111 0 111, Notruf 112)
- Der Vorfall wird ohne Inhalt protokolliert (Timestamp, pseudonymisierte User-ID)

Die Implementierung folgt dem Prinzip der deterministischen Sicherheit: Für Safety-kritische Entscheidungen werden keine LLMs eingesetzt.

### 4.3.2 KI-Disclosure-Gate

Vor der ersten Nutzung bestätigen alle Teilnehmenden explizit, dass KAIA eine KI ist (computational empathy, kein Mensch). Die Bestätigung wird mit Timestamp in der Datenbank gespeichert (`ki_disclosure_seen_at`). Ohne diese Bestätigung ist kein Chat-Zugriff möglich.

---

## 4.4 Chat-Interface und LLM-Integration

*[Geplant: Juli 2026 — wird ergänzt nach Implementierung]*

### 4.4.1 SSE-Streaming-Architektur

*Platzhalter — folgt nach Implementierung*

### 4.4.2 LLM-Abstraktionsschicht

*Platzhalter — gemeinsames Interface für Claude, GPT-4o, Mistral*

Versionierte Model-IDs (Pflicht):
- Claude: `claude-sonnet-4-6` (niemals generisch `claude`)
- GPT-4o: `gpt-4o-2024-08-06`
- Mistral: `mistral-large-latest` (mit versioniertem Datum-Tag)

---

## 4.5 Datenmodell und DSGVO-Implementierung

*[Geplant: Juli 2026 — DB-Schema nach Alembic-Migration]*

### 4.5.1 Kernentitäten

Haupttabellen: `users`, `sessions`, `messages`, `gse_results`, `consent_logs`

### 4.5.2 Row-Level-Security

pgvector-Zugriffe sind an `user_id` gebunden. Kein direkter Tabellenzugriff ohne Benutzerkontext — kein Cross-User-Leak.

### 4.5.3 DSGVO-Rechte als Self-Service

| Recht | Implementierung |
|---|---|
| Art. 15 (Auskunft) | GET /users/me/export → JSON |
| Art. 17 (Löschung) | DELETE /users/me → Soft-Delete + Anonymisierung |
| Art. 20 (Portabilität) | GET /users/me/export → maschinenlesbares JSON |
| Art. 7 (3) (Widerruf) | PATCH /users/me/consent |

---

## 4.6 Observability und Monitoring

*[Bereits implementiert — Stand: Juni 2026]*

- **Sentry**: Frontend (instrumentation-client.ts) + Backend (sentry-sdk[fastapi])
- **Slack-Webhooks**: Neue Registrierungen, Freigaben, Fehler-Eskalation
- **structlog**: Strukturiertes JSON-Logging im Backend
- **Study-Lock**: Bei `STUDY_MODE=locked` blockiert CI Prompt- und Schema-Änderungen

---

## Literaturverzeichnis (Kapitel 4)

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

*[Weitere Quellen werden bei Fertigstellung ergänzt: LLM-Paper, Streaming-Protokolle, bcrypt-Spezifikation, pgvector-Dokumentation]*
