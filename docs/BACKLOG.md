# KAIA – Projekt-Backlog

> Alle identifizierten Aufgaben, geordnet nach Priorität.
> **Blocker** = muss vor Studienstart fertig sein.
> **Pre-Pilot** = vor der Pilotphase (n=3-5).
> **Pre-Study** = vor der Hauptstudie.
> **Post-Thesis** = nach der Verteidigung, für Produkt-Phase.

---

## 🔴 BLOCKER — Vor Studienstart zwingend

### Sicherheit & Ethik
- [x] **Crisis-Detection-Modul** ✅ Erledigt Juni/Juli 2026 — Pre-Filter auf User-Input, statische Eskalations-Notice (Telefonseelsorge 0800 111 0 111 + 0800 111 0 222), Banned-Topic-Liste, Bypass-Bug behoben. Goldset-Validierung in Eval-Pipeline. `b89d594` · `dd69ac6`
- [x] **KI-Disclosure-Screen** ✅ Erledigt Juni 2026 — Expliziter Hinweis vor Onboarding: "Du sprichst mit einem KI-System." KDG-Framing aktualisiert (20.07.). Journey-Guard serverseitig erzwungen. `b89d594` · `499b91e`
- [ ] **Ethikvotum** — Projektbeschreibung für SRH-Ethikkommission eingereicht (`d474cf6`). Status: ausstehend.
- [ ] **Betreuungs-Approval** — Schriftliche Freigabe des Studiendesigns vom Thesis-Betreuer

### DSGVO
- [x] **Separate Einwilligungserklärung** ✅ Erledigt Mai 2026 — Teilnahmevereinbarung mit Studienzweck, Risiken, Freiwilligkeit, Right-to-Withdraw + Datenlöschung. `7404aa3`
- [x] **DPA Anthropic** ✅ Erledigt 15. Juli 2026 — DPA war bei API-Vertragsschluss automatisch akzeptiert (Commercial ToS). SCCs Module Two (controller→processor), irisches Recht. PDF: `docs/legal/anthropic_dpa_2026-07-15.pdf`
- [x] **DPA OpenAI** ✅ Erledigt 15. Juli 2026 — Bestätigung von OpenAI Privacy Team erhalten. Gültig ab 1. Januar 2026, OpenAI Ireland Ltd. als Vertragspartner (EWR), SCCs Modul 2, irisches Recht. PDF: `docs/legal/openai_dpa_2026-07-15.pdf`
- [x] **DPA Mistral** ~~entfällt~~ — Mistral wird nach Pre-Test nicht in die Studie aufgenommen (Empathiequalität unzureichend). LLM-Eval: nur Anthropic Claude + OpenAI.
- [x] **Schrems-II-Dokumentation** ✅ Erledigt 15. Juli 2026 — SCCs für US-Datenübermittlung (Anthropic, OpenAI) in Datenschutzerklärung dokumentiert. `0aa22eb`
- [x] **Datenschutzerklärung** ✅ Erledigt (laufend aktualisiert) — Art. 13/14 DSGVO-konform auf kaia.rostek-dagmar.eu. Mistral entfernt, Schrems-II präzisiert. `b89d594` · `0aa22eb`
- [x] **Impressum** ✅ Erledigt Mai 2026 — § 5 TMG, Dagmar Rostek, Geilenkirchen. `32bd2df`
- [ ] **DSGVO Art. 16** — Berichtigungsrecht (User kann eigene Daten korrigieren)
- [ ] **DSGVO Art. 18** — Einschränkung der Verarbeitung
- [ ] **DSGVO Art. 20** — Datenübertragbarkeit (CSV-Download Self-Service)
- [ ] **DSGVO Art. 21** — Widerspruchsrecht

### Auth & User-Management
- [x] **User-Registration** ✅ Erledigt Juli 2026 — Registrierungsformular mit E-Mail + Art.-9-Consent + Lernthema bei Registrierung. `56ed9b7` · `169ce2b`
- [x] **User-Approval-Flow** ✅ Erledigt Juni 2026 — Status: pending → active; Admin-UI + E-Mail bei Freischaltung. `cd2a0d5` · `5687029`
- [x] **Password-Reset-Flow** ✅ Erledigt 16. Juli 2026 — Token per E-Mail via Brevo SMTP, 30min gültig. `fa569a6`
- [ ] **2FA für Admin-Account** — TOTP (z.B. via PyOTP)
- [x] **JWT Auth** ✅ Erledigt Mai 2026 — Access-Token 15min + Refresh-Token 30d rotierend. `7bc1929`
- [ ] **Session-Timeout** — Nach 30 Tagen Inaktivität Logout
- [ ] **CAPTCHA / Bot-Schutz** — Cloudflare Turnstile bei Registrierung

### Datensicherheit
- [ ] **Postgres-Backup automatisiert** — Täglicher pg_dump → Hetzner Storage Box; 3-2-1-Regel
- [ ] **Backup-Restore-Test** — Einmal vor Studienstart üben
- [ ] **DB-Snapshot vor Studienstart** — Baseline für spätere Reproduzierbarkeit
- [ ] **Vector-DB User-Isolation** — Row-Level-Security in pgvector; Integrationstest mit 2 Test-Usern; mypy-enforced user_id Parameter

### Studien-Infrastruktur
- [ ] **Study-Lock-Modus** — CI-Guard aktiv (CI.yml). Admin-UI + DB-Flag `study_mode: locked` noch ausstehend.
- [ ] **Prompt-Freeze-Dokumentation** — Exakte Prompt-Version-IDs zum Studienstart in Audit-Log
- [x] **LLM Model-Pinning** ✅ Erledigt — Alle Chat-Calls verwenden versionierte Model-IDs (claude-sonnet-4-6-20250514 etc.). Kein generisches "claude". Per-User-Zuweisung in Admin-UI. `20319f8`
- [x] **Rate-Limiting** ✅ Erledigt 26. Juli 2026 — Max. 1 Session/Tag (studienkonform). €5.00 Kostenlimit pro User. B3-Bug (orphaned Sessions) behoben. `e13f10b` · `860d6e9` · `79144ad`
- [ ] **Provider-Failover-Plan** — Dokumentiertes Vorgehen bei Anthropic-Ausfall (höfliche Fehlermeldung + Session-Resume)

---

## 🟠 PRE-PILOT — Vor n=3-5 Pilotnutzern

### Kern-Features
- [x] **Chat-UI mit SSE-Streaming** ✅ Erledigt 09. Juni 2026 — LLM-Antworten streamen, Tipp-Indikator, Mobile-optimiert. `179852c` · `d8d5c3c`
- [ ] **LLM-Provider-Auswahl durch User** — Admin kann pro User setzen (✅). User-facing Onboarding-Auswahl noch ausstehend.
- [x] **Dreiphasiges Onboarding** ✅ Erledigt — KI-Disclosure → Lernthema-Onboarding → Pre-Survey (MSLQ + GSE). Journey-Guard serverseitig (403). `7466be6` · `46c4a59` · `499b91e`
- [x] **GSE Pre-Messung** ✅ Erledigt — MSLQ + GSE Pre-Survey, randomisiert (Fisher-Yates), Interpretationstext + Normwerte. `7466be6` · `744ce47`
- [x] **GSE Post-Messung** ✅ Erledigt — Trigger nach Session 10, Auto-Redirect zur Post-Befragung. `f079f1f`
- [x] **Auswertungsseite** ✅ Erledigt — Pre/Post-Vergleich auf Celebration Screen nach Post-Messung (GSE-Scores). `519e195` · `744ce47`

### Prompt-Management
- [x] **Prompt-Management-System** ✅ Erledigt — DB-gespeichert, Jinja2-Templates, versioniert (V1–V7 aktiv). `7976d7e`
- [x] **Admin-UI: Prompt-Editor** ✅ Erledigt — Monaco-Editor, aktive Prompt-Version wählbar und editierbar. `7976d7e`
- [ ] **A/B-Routing** — Deterministisches Hash-basiertes Variant-Assignment; prompt_variant in llm_usage *(Post-Studie oder Evaluations-Feature)*
- [ ] **Pedagogische Evaluations-Rubrik** — Stichprobe KAIA-Fragen manuell codieren: Offenheit, Reflexionstiefe, Nicht-leitend

### Analytics
- [x] **LLM-Usage-Logging** ✅ Erledigt — Tabelle llm_usage mit provider, model, tokens, cost_eur, latency. Admin-Dashboard. `b14a8f9`
- [x] **Pricing-Tabelle** ✅ Erledigt — Kosten pro Modell (Sonnet, Haiku, GPT-4o, GPT-5.6 Terra, GPT-4.1 mini) in Admin-UI sichtbar. `73b05c4` + mehrere
- [x] **Learning-Analytics-Dashboard** ✅ Erledigt — Admin-Dashboard: User-Liste, Sessions, Kosten pro User, Status. `e7fda9f`
- [x] **Kosten-Dashboard** ✅ Erledigt — Live-Kostentransparenz: €/Turn, €/Session, €/User (Kostentabelle + Admin-Dashboard). `b14a8f9`

### Admin
- [x] **Admin-Dashboard** ✅ Erledigt — User / Sessions / Prompts / Eval / Kosten / Lerndesign / Tagebuch / Roadmap / Journey-Test. `8085cb7` + viele
- [x] **User Hard-Delete** ✅ Erledigt 06. Juli 2026 — Admin kann User löschen (DSGVO Art. 17 Kaskade aller Daten). `169ce2b`
- [ ] **Audit-Log-Seite** — Alle DSGVO-relevanten Aktionen chronologisch *(audit_events-Tabelle existiert, Seite fehlt)*

### Chat-Core-V2: Session-Abschluss mit Closure-Phase
- [x] **Closing-Endpoint** ✅ Erledigt — `POST /sessions/{id}/closing`: KAIA generiert Abschluss via SSE, `extract_session_summary()` danach. `321a4cb`
- [x] **Chat-UI Abschluss-Flow** ✅ Erledigt — "Sitzung abschließen"-Button, Session-Ende-State, Post-Session-Redirect. `321a4cb` · `5e784c3` · `158df16`
- [ ] **Timeout-Handling nach Closure** — Nach 10 Min. Inaktivität post-Closing → automatisches Session-End
- [ ] **aria-live="polite" auf Nachrichten-Container** — Pflicht für Screen Reader

### Chat-Core-V2: In-Session Feedback Buttons
- [x] **session_feedback Tabelle** ✅ Erledigt — Alembic-Migration f6a2b4c8d1e9. `4bddc2b`
- [x] **Feedback-Endpoint** ✅ Erledigt — `POST /feedback` + `POST /meta-question`. `4bddc2b`
- [x] **Feedback-Buttons Frontend** ✅ Erledigt — 4 Buttons aktiv. `4bddc2b`
- [x] **KAIA-Reaktion auf metacognitive Buttons** ✅ Erledigt — Meta-Frage bei "Hänge fest" + "Unklar". `4bddc2b`
- [ ] **Cross-Session Transfer-Anker** — Transfer-Markers in session_summary, Haiku-Extraktor *(Post-Studie)*

### Chat-Core-V2: Backend-Erweiterungen
- [x] **session_summary JSON-Schema erweitern** ✅ Erledigt — insight_for_next_session, first_step, strongest_quote, session_phase, historical_quotes, MSLQ-Subscores. `7d9a51d`
- [x] **PromptContext + render_prompt erweitern** ✅ Erledigt — session_number, session_phase, is_final_session, learner_profile, gse_baseline, session_history_summary. `7d9a51d`
- [ ] **Thinking-Block Check 9 + 10** — Wissensart-Klassifikation + Routing-Konsistenz *(für Eval, nicht Studienstart)*

### Funken-Feature (STORY-003 + STORY-004, verschoben auf Post-Thesis)
- [ ] **Funken: DB-Migration** — Neue Tabelle `funken`
- [ ] **Funken: Backend-Endpoints** — POST/GET/DELETE
- [ ] **Funken: PDF-Export-Endpoint** — DSGVO Art. 20
- [ ] **Funken: Frontend Closing-Integration** — Textarea nach Closing-Bubble
- [ ] **Funken: Frontend Liste (/funken)**
- [ ] **Funken: Datenschutzerklärung** — Neue Sektion

---

## 🟡 PRE-STUDY — Vor Hauptstudie

### Methodik (kein Code)
- [x] **Power-Analyse** ✅ Erledigt Mai 2026 — R-basierte Power-Analyse (d=0.3, 80% Power): Ziel-N=32, Rekrutierungsziel ~46. `bccc530` · `aa12bf9`
- [ ] **Lern-SWE-Skala ergänzen** — Bereichsspezifische Selbstwirksamkeit zusätzlich zur GSE
- [ ] **Statistischer Analyseplan** — Welche Tests, Assumptions, Confounder-Kontrolle — vor Datensicht
- [ ] **Conflict-of-Interest-Statement** — Im Thesis-Methodik-Kapitel offen deklarieren
- [ ] **Inter-Rater-Reliabilität** — Zweiten Codierer für qualitative Analyse identifizieren; Cohen's Kappa ≥ 0.70 anstreben
- [ ] **FKS-Integration** — Flow-Kurzskala (Rheinberg et al., 2003): 10 Items, 7-stufig, nach Session 2, 5, 8, 10. Frontend-Form, DB-Tabelle `fks_results`, API-Endpoint.
- [ ] **Teilnahmevereinbarung aktualisieren** — Mindestens 10 Sessions (nicht 3) als Anforderung, Session-Dauer-Empfehlung (Sessions 1–2: 20–30 Min., Sessions 3–10: 10–15 Min.), FKS als 3. Messinstrument erwähnen.
- [ ] **AUSWERTUNG.md aktualisieren** — Session-Mindestanzahl in SQL-Query von 3 auf 10 anpassen. FKS-Auswertungs-Queries ergänzen.
- [ ] **Teilnahmevereinbarung: Funken-Feature** — Funken als freiwilliges Reflexionstool erwähnen. Optionaler separater Consent: "Ich stimme zu, dass meine Funken-Inhalte als anonymisierte qualitative Daten in der Studie ausgewertet werden dürfen." (Nur wenn qualitative Auswertung gewünscht.)
- [ ] **AUSWERTUNG.md: Funken als Kovariate** — Funken-Nutzungsintensität (Anzahl Funken pro Session) und Häufigkeit als Kovariaten in GSE-Auswertung aufnehmen. SQL-Query für Funken-Nutzungsrate ergänzen. (Konfundierungsrisiko nach Psychologe 2026-06-10.)

### Technisch
- [ ] **Consent-Version-Tracking** — consent_version in DB; Re-Consent-Flow bei Formular-Updates
- [ ] **Right-to-Withdraw-Flow** — User kann mid-study austreten + alle Daten löschen lassen
- [ ] **Daten-Export für Auswertung** — Admin-CSV-Export: pseudonymisierte Survey/Session/Observations-Daten
- [ ] **Daten-Retention-Policy** — Schriftlich: Speicherdauer, Anonymisierungszeitpunkt, Archivierung
- [ ] **Business-Events in Slack** — "User X hat Post-Messung abgeschlossen 🎉", "User Y 14 Tage inaktiv ⚠️"
- [ ] **Idempotency-Tests** — Onboarding-Resume nach Browser-Refresh; E2E-Test des Studienflows
- [ ] **Drop-Out-Erinnerungen** — E-Mail nach 7 Tagen Inaktivität; "Noch 1 Session bis Post-Messung"

### Security
- [ ] **Prompt-Injection-Schutz** — User-Inputs in `<user_input>`-Delimitern; Jinja2-Auto-Escaping; Max-Length-Validation
- [ ] **Security-Headers** — HSTS, CSP, X-Frame-Options, Referrer-Policy (Caddy-Config bereits vorbereitet)
- [x] **Dependency-Scanning** ✅ Erledigt 29. Juli 2026 — `npm audit --audit-level=high --omit=dev` + `pip-audit` in CI. `package.json overrides` für postcss/sharp. Dependabot noch offen.
- [ ] **Secrets-Scan** — gitleaks pre-commit-hook aktivieren (bereits in .pre-commit-config.yaml)
- [ ] **CORS-Audit** — Allowlist verifizieren, kein `allow_origins=["*"]`

### Monitoring
- [ ] **Latency-Monitoring** — P95 first-token < 3s; Alert bei Überschreitung
- [ ] **Uptime-Monitoring** — UptimeRobot (kostenlos) auf /api/v1/health
- [ ] **Token-Limit-Strategie** — Rolling-Window oder Summarization bei langen Sessions; pro Provider konfiguriert

---

## 🟢 POST-THESIS — Für Produkt-Phase

### Technisch
- [ ] **Barrierefreiheit WCAG 2.1 AA** — Tastatur-Navigation, Screen-Reader-Labels, Kontrast ≥ 4.5:1, Touch-Targets ≥ 44px
- [ ] **Multi-Tenancy** — tenant_id in DB-Schema (jetzt nur vorbereiten); Companies/Workspaces
- [ ] **Feature-Flags** — feature_flags-Tabelle für A/B ohne Deploy
- [ ] **Self-Hosted LLM** — vLLM oder Ollama als Provider (DSGVO-Killer-Argument)
- [ ] **Replay-Funktion** — Kompletter Session-State reproduzierbar; voller rendered Prompt gespeichert
- [ ] **API-Dokumentation** — OpenAPI-Schema für externe Integration
- [x] **E-Mail-Versand** ✅ Erledigt 06. Juli 2026 — Brevo SMTP für Approval-Mails, Registrierungsbestätigung, Studienstart, Passwort-Reset. `5687029` · `fa569a6`

### Wissenschaft & Open Science
- [ ] **Open Data auf OSF** — Anonymisierte Studie-Daten nach Thesis-Abgabe veröffentlichen
- [ ] **Open Code** — Analyse-Scripts auf GitHub (Quarto + renv.lock)
- [ ] **Replications Package** — DB-Snapshot + Scripts für unabhängige Reproduktion

### Selbstversuch-Seite
- [ ] **Wochenberichte-CMS** — Admin kann neue Woche-Einträge hinzufügen ohne Code-Änderung
- [ ] **Wimmelbild-Export** — Wöchentliche LinkedIn-Grafik

---

## 📊 Statistik

| Bereich | Offen | Erledigt | Kategorie |
|---|---|---|---|
| Blocker | 11 | 17 | Vor Studienstart |
| Pre-Pilot | 11 | 23 | Abgeschlossen / in Produktion |
| Pre-Study | 12 | 1 | Vor Hauptstudie |
| Post-Thesis | 9 | 1 | Für Produkt-Phase |
| **Gesamt** | **43** | **42** | |

> Stand: 29. Juli 2026 — Studienstart 8. August 2026. Kern-Features alle deployed. Offene Blocker: DSGVO Art. 16/18/20/21, Backup, Ethikvotum-Status, Study-Lock Admin-UI.
