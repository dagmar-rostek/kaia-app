# KAIA – Projekt-Backlog

> Alle identifizierten Aufgaben, geordnet nach Priorität.
> **Blocker** = muss vor Studienstart fertig sein.
> **Pre-Pilot** = vor der Pilotphase (n=3-5).
> **Pre-Study** = vor der Hauptstudie.
> **Post-Thesis** = nach der Verteidigung, für Produkt-Phase.

---

## 🔴 BLOCKER — Vor Studienstart zwingend

### Sicherheit & Ethik
- [ ] **Crisis-Detection-Modul** — Pre-Filter auf User-Input, NLP-Klassifikator für Krisensignale, statische Eskalations-Notice (Telefonseelsorge 0800 111 0 111), Banned-Topic-Liste
- [ ] **KI-Disclosure-Screen** — Expliziter Hinweis vor Onboarding: "Du sprichst mit einem KI-System. Antworten können fehlerhaft sein. KAIA ist kein Therapie-Ersatz."
- [ ] **Ethikvotum** — Antrag bei SRH Fernhochschule einreichen (Frist klären mit Betreuung)
- [ ] **Betreuungs-Approval** — Schriftliche Freigabe des Studiendesigns vom Thesis-Betreuer

### DSGVO
- [ ] **Separate Einwilligungserklärung** — Dokument für Forschungsteilnahme (≠ DSGVO-Consent): Studienzweck, Risiken, Freiwilligkeit, Right-to-Withdraw mit Datenlöschung
- [ ] **DPA Anthropic** — Data Processing Addendum unterzeichnen (privacy.anthropic.com)
- [ ] **DPA OpenAI** — Data Processing Addendum unterzeichnen (openai.com/privacy)
- [ ] **DPA Mistral** — Auftragsverarbeitungsvertrag (einfacher, EU-Anbieter)
- [ ] **Schrems-II-Dokumentation** — SCCs für US-Datenübermittlung in Datenschutzerklärung
- [ ] **Datenschutzerklärung** auf kaia.rostek-dagmar.eu (Art. 13/14 DSGVO-konform)
- [ ] **Impressum** auf kaia.rostek-dagmar.eu (TMG-Pflicht)
- [ ] **DSGVO Art. 16** — Berichtigungsrecht (User kann eigene Daten korrigieren)
- [ ] **DSGVO Art. 18** — Einschränkung der Verarbeitung
- [ ] **DSGVO Art. 20** — Datenübertragbarkeit (CSV-Download Self-Service)
- [ ] **DSGVO Art. 21** — Widerspruchsrecht

### Auth & User-Management
- [ ] **User-Registration mit E-Mail-Verifikation** — Token-basiert, verhindert Fake-Accounts
- [ ] **User-Approval-Flow** — Status: pending → active → suspended → deleted; Admin-UI
- [ ] **Password-Reset-Flow** — Token per E-Mail, 30min gültig
- [ ] **2FA für Admin-Account** — TOTP (z.B. via PyOTP)
- [ ] **JWT Auth** — Access-Token 15min + Refresh-Token 30d rotierend
- [ ] **Session-Timeout** — Nach 30 Tagen Inaktivität Logout
- [ ] **CAPTCHA / Bot-Schutz** — Cloudflare Turnstile bei Registrierung

### Datensicherheit
- [ ] **Postgres-Backup automatisiert** — Täglicher pg_dump → Hetzner Storage Box; 3-2-1-Regel
- [ ] **Backup-Restore-Test** — Einmal vor Studienstart üben
- [ ] **DB-Snapshot vor Studienstart** — Baseline für spätere Reproduzierbarkeit
- [ ] **Vector-DB User-Isolation** — Row-Level-Security in pgvector; Integrationstest mit 2 Test-Usern; mypy-enforced user_id Parameter

### Studien-Infrastruktur
- [ ] **Study-Lock-Modus** — DB-Flag `study_mode: locked`; Admin-UI sperrt Prompt-Änderungen; CI-Guard aktiv (bereits in CI.yml)
- [ ] **Prompt-Freeze-Dokumentation** — Exakte Prompt-Version-IDs zum Studienstart in Audit-Log
- [ ] **LLM Model-Pinning** — Versionierte Model-IDs (nie "claude", immer "claude-opus-4-7-20260301"); temperature=0 für Analyzer
- [ ] **Rate-Limiting** — Pro-User Tages-Limit; globaler Kosten-Alarm bei 80% Monatsbudget; Auto-Stop
- [ ] **Provider-Failover-Plan** — Dokumentiertes Vorgehen bei Anthropic-Ausfall (höfliche Fehlermeldung + Session-Resume)

---

## 🟠 PRE-PILOT — Vor n=3-5 Pilotnutzern

### Kern-Features
- [ ] **Chat-UI mit SSE-Streaming** — LLM-Antworten streamen; first-token < 3s; Mobile-optimiert
- [ ] **LLM-Provider-Auswahl** — User wählt Claude / GPT-4o / Mistral beim Onboarding
- [ ] **Dreiphasiges Onboarding** — Idempotent (Resume nach Refresh); alle Schritte server-persistent
- [ ] **GSE Pre-Messung** — Konversationell operationalisiert, keine kalten Fragebögen
- [ ] **GSE Post-Messung** — Trigger nach ≥3 Sessions; Banner im Chat
- [ ] **Auswertungsseite** — Radar-Chart Baseline vs. aktuelle Session

### Prompt-Management
- [ ] **Prompt-Management-System** — DB-gespeichert, Jinja2-Templates, versioniert
- [ ] **Admin-UI: Prompt-Editor** — Monaco-Editor, Variable-Picker, Draft/Active-Status
- [ ] **A/B-Routing** — Deterministisches Hash-basiertes Variant-Assignment; prompt_variant in llm_usage
- [ ] **Pedagogische Evaluations-Rubrik** — Stichprobe KAIA-Fragen codieren: Offenheit, Reflexionstiefe, Nicht-leitend

### Analytics
- [ ] **LLM-Usage-Logging** — Tabelle llm_usage: provider, model, tokens, cost_eur, latency_ms, prompt_variant
- [ ] **Pricing-Tabelle** — Pro Modell Input/Output-Kosten in EUR, in DB konfigurierbar
- [ ] **Learning-Analytics-Dashboard** — Funnel (Registrierung → Onboarding → Sessions → Post), Aktivität, Drop-Out
- [ ] **Kosten-Dashboard** — Gesamt, pro User, pro Provider, Hochrechnung auf 100 User

### Admin
- [ ] **Admin-Dashboard** — 5 Tabs: User / Sessions / Prompts / Analytics / System
- [ ] **User Hard-Delete** — Admin kann User ohne Einwilligung löschen (DSGVO Art. 17 Admin-Perspektive); Audit-Log-Pflicht
- [ ] **Audit-Log-Seite** — Alle DSGVO-relevanten Aktionen chronologisch

### Chat-Core-V2: Session-Abschluss mit Closure-Phase
- [ ] **Closing-Endpoint** — `POST /api/v1/chat/sessions/{id}/closing`: KAIA generiert Abschluss-Bubble via SSE (wie /opening) ohne User-Input. `extract_session_summary()` läuft erst danach.
- [ ] **Chat-UI Abschluss-Flow** — Neuer Frontend-State "pending_closure": KAIA's Abschluss-Bubble als normale Chat-Bubble, darunter [Antworten] (primär, volle Breite) · [Jetzt wirklich beenden] (Ghost-Link). Mobile: vertikal gestackt. Kein Modal/Overlay.
- [ ] **Timeout-Handling nach Closure** — Nach 10 Min. Inaktivität post-Closing → automatisches Session-End mit sichtbarer Notification im Chat. Client-seitig implementiert.
- [ ] **aria-live="polite" auf Nachrichten-Container** — Pflicht für Screen Reader. Muss gleichzeitig mit Closing-Feature implementiert werden.

### Chat-Core-V2: In-Session Feedback Buttons
- [ ] **session_feedback Tabelle** — Schema: `id, session_id, user_id, feedback_type ENUM('transfer_marker', 'engagement', 'stuck', 'unclear'), message_id FK NULLABLE, created_at`. Alembic-Migration.
- [ ] **Feedback-Endpoint** — `POST /api/v1/chat/sessions/{id}/feedback` — nimmt `feedback_type`, optional `message_id`. Speichert in DB.
- [ ] **Feedback-Buttons Frontend** — 4 Buttons neben Chat: "Muss ich weiterdenken" / "Wow — das trifft was" / "Ich hänge gerade" / "Das verstehe ich noch nicht". Kein Gamification (keine Animation, keine Punkte). Dezente Platzierung rechts neben Chat oder unter Eingabefeld.
- [ ] **KAIA-Reaktion auf metacognitive Buttons** — Bei "Ich hänge gerade" und "Das verstehe ich noch nicht": KAIA sendet Meta-Frage als Trigger-Message ins Chat ("Was hängt gerade?" — Fragetyp Klärung). KEIN Modus-Switch (Hysterese-Logik bleibt intakt).
- [ ] **Cross-Session Transfer-Anker** — "Muss ich weiterdenken"-Klicks werden in session_summary.transfer_markers[] gespeichert. Haiku-Extraktor: neue Felder `transfer_markers`, `knowledge_type`, `current_phase`, `routing_confidence`.

### Chat-Core-V2: Backend-Erweiterungen
- [ ] **session_summary JSON-Schema erweitern** — Neue Felder: `knowledge_type` (konzeptuell|prozedural|metakognitiv|faktisch|unklar), `current_phase` (1-7), `routing_confidence` (low|high). Default: routing_confidence="low" bis Session 2.
- [ ] **PromptContext + render_prompt erweitern** — Neue Felder `knowledge_type`, `current_phase`, `routing_confidence` + Jinja2-Block `routing_context`.
- [ ] **Thinking-Block Check 9 + 10** — Check 9: Wissensart-Klassifikation (welche der 4 Wissensarten nach Anderson & Krathwohl?). Check 10: Routing-Konsistenz-Check (passt aktuelle Frage zur routing_confidence?).

---

## 🟡 PRE-STUDY — Vor Hauptstudie

### Methodik (kein Code)
- [ ] **Pre-Registrierung auf OSF.io** — Hypothesen, Analyseplan, Stichprobengröße, Misserfolgskriterien
- [ ] **Power-Analyse** — G*Power, d=0.3, 80% Power → n berechnen
- [ ] **Lern-SWE-Skala ergänzen** — Bereichsspezifische Selbstwirksamkeit zusätzlich zur GSE
- [ ] **Statistischer Analyseplan** — Welche Tests, Assumptions, Confounder-Kontrolle — vor Datensicht
- [ ] **Conflict-of-Interest-Statement** — Im Thesis-Methodik-Kapitel offen deklarieren
- [ ] **Inter-Rater-Reliabilität** — Zweiten Codierer für qualitative Analyse identifizieren; Cohen's Kappa ≥ 0.70 anstreben
- [ ] **FKS-Integration** — Flow-Kurzskala (Rheinberg et al., 2003): 10 Items, 7-stufig, nach Session 2, 5, 8, 10. Frontend-Form, DB-Tabelle `fks_results`, API-Endpoint.
- [ ] **Teilnahmevereinbarung aktualisieren** — Mindestens 10 Sessions (nicht 3) als Anforderung, Session-Dauer-Empfehlung (Sessions 1–2: 20–30 Min., Sessions 3–10: 10–15 Min.), FKS als 3. Messinstrument erwähnen.
- [ ] **AUSWERTUNG.md aktualisieren** — Session-Mindestanzahl in SQL-Query von 3 auf 10 anpassen. FKS-Auswertungs-Queries ergänzen.

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
- [ ] **Dependency-Scanning** — Dependabot aktivieren; npm audit + pip-audit in CI
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
- [ ] **E-Mail-Versand** — Resend.com für Approval-Mails, Erinnerungen, Reset

### Wissenschaft & Open Science
- [ ] **Open Data auf OSF** — Anonymisierte Studie-Daten nach Thesis-Abgabe veröffentlichen
- [ ] **Open Code** — Analyse-Scripts auf GitHub (Quarto + renv.lock)
- [ ] **Replications Package** — DB-Snapshot + Scripts für unabhängige Reproduktion

### Selbstversuch-Seite
- [ ] **Wochenberichte-CMS** — Admin kann neue Woche-Einträge hinzufügen ohne Code-Änderung
- [ ] **Wimmelbild-Export** — Wöchentliche LinkedIn-Grafik

---

## 📊 Statistik

| Bereich | Offen | Kategorie |
|---|---|---|
| Blocker | 25 | Vor Studienstart |
| Pre-Pilot | 31 | Vor n=3-5 |
| Pre-Study | 21 | Vor Hauptstudie |
| Post-Thesis | 11 | Für Produkt |
| **Gesamt** | **88** | |
