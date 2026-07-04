# KAIA Release Notes

> Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert —
> vom ersten Commit bis heute. Pro Eintrag siehst du, was sich für Nutzer:innen
> konkret geändert hat, plus die realistische Gesamt-Aufwands-Zeit.
>
> **Zeit-Formel** — Commit-Tage: reine Chat-/Coding-Zeit + ⅓ Konzeptionierungs-Zeit
> + ⅓ Smoke-Test-Zeit = Chat × ⁵⁄₃.

---

**Stand heute:** Monday, 23. June 2026  
**131 Einträge insgesamt · 20 Release-Tage · ~79 h Gesamt-Aufwand**

---

## 2026-07-04 — Session-Architektur v3: Persistentes Nutzerprofil, kumulatives Gedächtnis, session-aware Prompt

**04.07.2026 · Session-Architektur-Redesign v0.9.0**

Vollständige Neugestaltung der KAIA-Session-Architektur auf Basis eines interdisziplinären Team-Reviews (Psychologe, Didaktiker, AI Engineer, UX Designer). KAIA war bisher session-blind — kein Zugriff auf Sitzungsnummer, kein kumulatives Gedächtnis, kein persistentes Lernenden-Profil. Das ist jetzt grundlegend behoben.

**Was sich für Nutzer:innen ändert:**

KAIA weiß ab jetzt in welcher Session sie sich befindet und verhält sich entsprechend. Die Gesprächsführung eskaliert systematisch von explorativem Erkunden (Sessions 1–2) über Transferarbeit und Analyse (Sessions 3–8) bis zur Synthese (Sessions 9–10). Session 5 enthält immer einen obligatorischen Halbzeit-Spiegel. Session 10 endet mit drei simultanen Aufgaben: Gegenüberstellung der eigenen Aussagen von Session 1 mit heute, Autonomisierungsfrage ("Wie lernst du ohne mich weiter?") und — bewusst — kein GSE-Priming vor der Post-Messung.

Im Chat-Header wird jetzt "Session N von 10" angezeigt. Ab Session 9 erscheint ein stiller Kontext-Satz ("Das ist deine vorletzte Session." / "Das ist deine letzte Session.") — ohne Fanfare, ohne UI-Element, als einfacher Hinweis.

**Technische Umsetzung (vollständig):**

*Zwei-Schichten-Profil-Modell:*
- Layer 1: Neue Tabelle `user_learning_profiles` — unveränderlicher Snapshot nach Pre-Survey (MSLQ + GSE). Speichert `gse_baseline`, `subscale_scores` (JSONB), `gse_items` (JSONB) und eine LLM-generierte `profile_interpretation` (Haiku, max. 120 Wörter). UNIQUE-Constraint verhindert Doppelanlagen auch unter paralleler BackgroundTask-Ausführung.
- Layer 2: `session_summary` in `chat_sessions` — kumulative Verhaltensdaten inkl. neu hinzugefügtem Feld `strongest_quote` (stärkster eigener Satz des Lernenden pro Session).

*PromptContext v3 — 7 neue Felder:*
`session_number`, `session_phase` (early/mid/late), `is_final_session`, `user_turns`, `learner_profile`, `gse_baseline`, `session_history_summary`, `historical_quotes`.

*Kumulatives Session-Gedächtnis:*
`load_all_session_contexts()` aggregiert alle Vorsessions kompakt (älteste zuerst). Inline-Re-Extraktion mit 12-Sekunden-Timeout entfernt — das war das größte Latenz-Risiko beim Session-Start.

*KAIA_PROMPT_V3_WARM (aktiv):*
Jinja2-Template mit session-aware Logik: Session-Kontext-Header, Lernenden-Profil-Block (Hintergrund, nie explizit zitieren), obligatorischer Session-5-Trigger, Historical-Quotes-Block (ab Session 6 für Widerspruchsarbeit Typ 3), Session-10-Drei-Aufgaben-Abschluss. V2 als Eval-Regression-Baseline erhalten.

*Profil-Trigger nach Pre-Survey:*
`maybe_create_learning_profile()` als `BackgroundTasks`-Task nach `/survey/mslq` und `/survey/gse` — idempotent, kein LLM-Call pro Session.

**Thesis-Relevanz:**
Das persistente Nutzerprofil ist ein Kernbaustein der neuroadaptiven Personalisierung (Forschungsfrage 2). Die regelbasierte MSLQ-Profil-Übersetzung (4 Kombinationen: Enthusiast / Kompetente-ohne-Antrieb / Gewissenhafte / Lernstarke) ist als Phase-3-Feature geplant — die Architektur ist vorbereitet. Wichtig für die LLM-Evaluation: V2 bleibt als Eval-Regression-Baseline für kontrollierte Vergleiche in der Pilotstudie erhalten. · `~12h Teamarbeit + Implementierung`

---

## 2026-06-22 — Survey-Fix, Masterthesis SSR, Auswertungsinterpretation, Lernthema-Fix

**22.06.2026 · `2184a31`** — Survey 500-Fehler behoben: Parametername-Mismatch (`mt` vs. `measurement_type`). MSLQ- und GSE-Items werden jetzt Fisher-Yates randomisiert. Fortschrittsleiste. Auswertungsansicht nach Abschluss des Fragebogens. · `30min`  
*fix: Survey 500-Fehler + Randomisierung + Auswertungsanzeige*

**22.06.2026 · `bfd5a6d`** — Masterthesis server-seitig gerendert: Markdown wird serverseitig zu HTML konvertiert — kein Client-JS für 170 KB Thesis-Text mehr nötig. CSS-Toggle ohne React-Reconciliation. Survey-Auth-Flow: Admin-Token in tokenStore. · `45min`  
*fix: Masterthesis server-side rendering + Survey-Auth-Flow*

**22.06.2026 · `744ce47`** — Fragebogen-Auswertung mit Interpretationstext und Farbkodierung (niedrig/mittel/hoch). GSE-Normdaten: M=2,97 dt. Stichprobe (Schwarzer & Jerusalem, 1995). ITC-Richtlinien / Psychometrik-Gate G11. Admin-Journey-Test kann Chat starten: `kaia_session`-Cookie-Middleware-Fix. · `1h 20min`  
*feat: Auswertungs-Interpretation + Chat-Auth-Fix für Admin-Journey-Test*

**22.06.2026 · `cd698a5`** — Kritischer Fix: `user.learning_topic` wurde gespeichert aber nie an den Prompt weitergegeben. PromptContext + alle vier Stream-Funktionen + DB-Migration aktualisiert. KAIA kennt das Lernthema jetzt von Anfang an. `is_simulation` + `simulation_run`-Felder für Crash-Test-Simulation ergänzt. · `1h`  
*fix: Lernthema wird jetzt in jeden KAIA-Prompt übergeben*

**22.06.2026 · `fc78293`** — "Session beenden" als sichtbarer Header-Button (DoorOpen-Icon, Border-Stil). Feedback-Buttons mit Kategoriezeile und Tooltips für bessere Erkennbarkeit. · `20min`  
*feat: Chat-UX — Session-beenden-Button in Header + Feedback-Erklärungen*

---

## 2026-06-21 — Admin Lerndesign + Messinfrastruktur (MSLQ/Journey)

**21.06.2026 · `c7af4dd`** — Session-2-Einstieg erinnert jetzt an Session 1. resetSession ruft POST /sessions/{id}/end auf bevor die neue Session startet — extract_session_summary läuft im Hintergrund und befüllt insight_for_next_session, last_first_step und observation für die Folgesession. · `20min`  
*fix: Session-Ende vor Reset aufrufen — Cross-Session-Gedächtnis aktiviert*

**21.06.2026 · `e7fda9f`** — Neue Admin-Seite /admin/lerndesign zeigt vollständige Session-Architektur (Sessions 1–10, Bloom-Progression, Sentiment-Signale, verbotene Muster, Feature-Status-Matrix, EMA-Referenz). EMA-Feedback-Buttons (Wow, Weiterdenken, Hänge fest, Unklar) im Chat-Test aktiv. SRL-Messung via MSLQ (Pintrich et al., 1991) — Instrumentenwahl auf Basis psychologischer Fachberatung. Relevant für Studien-Testing und Thesis-Messkonzept. · `2h 30min`  
*feat: Admin Lerndesign-Seite + EMA Feedback-Buttons im Chat-Test*

**21.06.2026 · `7466be6`** — Vollständige Studien-Journey implementiert: Pre-Befragung (MSLQ + GSE) vor erstem Chat, bis zu 10 Sitzungen, Post-Befragung danach — mit Chat-Gating (HTTP 403 wenn Fragebögen fehlen). Admin Instrumente-Seite: alle 30 MSLQ-Items, Auswertungslogik, APA-Zitate für Thesis-Anhang. Masterthesis-Navigation fix (useMemo). v0.8.0. · `6h`  
*feat: Journey-Infrastruktur (MSLQ/GSE Pre/Post) + Admin Instrumente + Masterthesis-Fix*

**21.06.2026 · `f6a5407`** — Admin "Journey testen"-Seite: kompletten Studienflow in einem Schritt, Reset-Button. `learning_topic` als DB-Feld (neue Migration). Masterthesis-Freeze: `React.memo` auf `ChapterContent`. · `1h 30min`  
*feat: Journey-Test-Seite (Admin) + learning_topic + Masterthesis-Freeze-Fix v2*

**21.06.2026 · `83a8ce3`** — JourneyTestClient nutzt Admin-Test-Token (wie chat-test): 401-Fehler auf Journey-Testseite behoben. · `15min`  
*fix: JourneyTestClient nutzt admin test-token (wie chat-test)*

**21.06.2026 · `8c0628a`** — JourneyTestClient korrekter api-Import: `apiFetch` existiert nicht — auf `api.get` + nativen `fetch` umgestellt. Build-Fehler behoben. · `10min`  
*fix: JourneyTestClient — korrekter api-Import (apiFetch → api.get + fetch)*

**21.06.2026 · `c4a71e6`** — Masterthesis lazy-mount in DOM. Survey-Formular sendet Auth-Header korrekt. · `40min`  
*fix: Masterthesis lazy-mount + Survey-Auth*

**21.06.2026 · `41e125b`** — Masterthesis-Navigation mit `startTransition` unterbrechbar. Journey-Auth-Fix (401). · `20min`  
*fix: Masterthesis startTransition + Journey authFetch (401)*

**21.06.2026 · `3baa6a5`** — Masterthesis-Navigation: alle sechs Kapitel werden einmalig gerendert, per CSS ein-/ausgeblendet. Kein Reconciliation-Overhead mehr. · `20min`  
*fix: Masterthesis-Navigation — alle Kapitel im DOM*

**21.06.2026 · `215187a`** — Ungenutzte Imports aus Lerndesign-Seite entfernt. Keine funktionale Änderung. · `2min`  
*chore: unused imports aus Lerndesign-Seite entfernen*

---

## 2026-06-20 — Prompt-Verbotslisten final + FK-Fix

**20.06.2026 · `e9bdea1`** — FK-Violation nach Von-vorne-Reset behoben (stream_opening verwirft Session-gone-Fehler statt zu crashen). Prompt-Verbotsliste um Affekt-Spiegeln-Muster erweitert + Strukturprinzip für emotionale Einstiege explizit gemacht. · `30min`  
*fix: IntegrityError bei Reset-Race + Affekt-Strukturprinzip im Prompt*

**20.06.2026 · `5b2608c`** — KAIA darf keine menschliche Gesprächsgeschichte behaupten ("das kenne ich aus vielen Gesprächen", "das höre ich oft") — solche Vergleiche sind fabricated und täuschend. · `5min`  
*fix: Erfahrungsvergleiche in KAIA-Verbotsliste*

---

## 2026-06-19 — Session-1-Design, Prompt-Verbotslisten, Thesis

**19.06.2026 · `2dda945`** — KAIAs erste Session hat jetzt einen vollständigen Lernziel-Flow: (1) offene Einladung, (2) Thema + Motiv, (3) Bestätigung, (4) Lernintention ("was könntest du in 4 Wochen können/verstehen?"), (5) erster Schritt + Evidenzanker ("woran würdest du merken, dass sich etwas bewegt hat?"). Wissenschaftlich fundiert durch Hattie & Timperley (2007, d=0.54), Knowles' evidence of accomplishment (1975), Gollwitzer & Sheeran (2006, d=.65) und RCT Schimpf et al. (2026) zur KI-gestützten Zielformulierung. · `30min`  
*feat: Session-1-Flow — Lernintention + Evidenzanker (Knowles/Hattie)*

**19.06.2026 · `0c62cf6`** — KAIAs erste Frage in Session 1 ist jetzt offen — "Was beschäftigt dich gerade — womit möchtest du heute anfangen?" statt der fehlerhaften Variante, die ein Thema voraussetzte das noch gar nicht da war. Im Admin-Chat-Test zeigt die Kopfzeile jetzt Session 1/2/3 (Lernzähler) statt der internen DB-ID. · `30min`  
*fix: Session-1-Prompt und Session-Nummer-Anzeige im Chat-Test*

**19.06.2026 · `a9f24ed`** — Kapitel 3 (Rahmenwerk) und 6 (Pilotstudie) der Masterthesis aktualisiert. Neue Abschnitte: konzeptuelle Trias Lernziel/Lernschritt/Erfolgskriterium (Knowles, 1975), Task vs. Learning Intention (Hattie & Timperley, 2007, d=0.54), Evidenzanker als Alternative zu "messbarem Erfolg", Implementation Intentions (Gollwitzer & Sheeran, 2006, d=.65). 11 neue Quellen in APA-7, darunter RCT zu KI-gestützter Zielformulierung (Schimpf et al., 2026). · `45min`  
*docs: Thesis Kap3+6 — Session-1-Design wissenschaftlich fundiert*

**19.06.2026 · `6a9ee28`** — KAIA sagt nicht mehr "Muss nichts Großes sein", "Kein Druck", "Das ist okay so" o.ä. — diese Sätze entlasten statt zu aktivieren und gehören in Therapie, nicht in Lernbegleitung. Bei "weiß nicht" scaffoldet KAIA jetzt mit drei konkreten Orientierungsrichtungen statt emotionaler Beruhigung. · `10min`  
*fix: Therapiesprache aus KAIA-Prompt verbannt*

**19.06.2026 · `75a8fe5`** — KAIA fragt nicht mehr nach innerer Wahrnehmung — kein "spürbar", kein "was taucht auf", keine Abend-/Morgenritual-Einstiege. Diese Muster sind Therapie-Sprache, keine Lernbegleitung. Bei Orientierungslosigkeit scaffoldet KAIA mit konkreten Beispielbereichen, nicht mit Innenschau-Einladungen. · `5min`  
*fix: Innenraum-Muster in KAIA-Prompt verboten*

**19.06.2026 · `a5d8bb7`** — KAIA bleibt bei negativem Affekt-Einstieg im Lern-Frame statt in den emotionalen Frame zu folgen. Wissenschaftliche Grundlage: D'Mello & Graesser (2012), Boekaerts (1993/2011), Pekrun (2006) — Thesis-Kapitel 3.3.10.4 mit 6 neuen APA-7-Quellen ergänzt. · `45min`  
*fix: Affekt-Pivot-Regel im Prompt + Thesis 3.3.10.4*

---

## 2026-06-14 — Admin Chat-Test: Von-vorne-Button

**14.06.2026 · `eb1525b`** — Im Admin-Chat-Test gibt es jetzt den Button "Von vorne" (mit Trash-Icon). Erster Klick: roter Bestätigungsbutton "Sicher löschen?", zweiter Klick: alle Chat-Sessions, Nachrichten und Memory-Chunks des admin_test-Users werden gelöscht. Die nächste Session startet wieder als Session 1 — inklusive frischer Eröffnungsfrage. Relevant für iterative Prompt-Tests ohne Datenbank-Zugriff. · `20min`  
*feat: Admin Chat-Test — Von-vorne-Button löscht alle Chat-Daten*

---

## 2026-06-12 — Chat Core V2: EMA-Buttons, Coverage-Gate, Docs

**12.06.2026 · `4bddc2b`** — Vier Feedback-Buttons erscheinen während einer Session: "Muss ich weiterdenken", "Wow — das trifft was", "Ich hänge gerade", "Das verstehe ich noch nicht". Passive Buttons speichern das Signal nur (kein LLM-Eingriff). Aktive Buttons ("Ich hänge gerade", "Das verstehe ich noch nicht") triggern zusätzlich eine kurze Metakognitions-Frage von KAIA. Technisch: session_feedback-Tabelle (Alembic-Migration f6a2b4c8d1e9), POST /feedback + POST /meta-question Endpoints, stream_meta_question() Service-Funktion. Wissenschaftlich: EMA/ESM-Paradigma (Csikszentmihalyi & Larson, 1987), Affect Labeling (Lieberman et al., 2007), Selbstregulations-Monitoring (Zimmermann, 2000). · `2h 30min`  
*feat: STORY-002 In-Session Feedback Buttons (EMA)*

**12.06.2026 · `7e1f83b`** — CI-Coverage-Gate war bei 59% (Schwelle 70%). Neue Testdateien: test_chat.py (45 Tests: Chat-Repository alle Methoden, Schemas-Validatoren, SSE-Helpers, Thinking-Strip, stream_closing und stream_meta_question mit gemocktem Anthropic-Client inkl. Debug-Mode, LLM-Error, malformed JSON, leerer Content) + test_observability.py (6 Tests: configure_logging debug/json-mode, init_sentry mit/ohne DSN). Coverage: 59% → 70%. · `30min`  
*test: Coverage-Gate auf 70% gebracht*

**12.06.2026 · `06d6a85`** — Dokumentation erweitert: AUSWERTUNG.md mit neuen SQL-Abfragen für Cross-Session-Gedächtnis (session_summary, first_step-Persistenz-Analyse). Neues UX-Designdokument für STORY-FUNKEN (Microcopy-Bewertung, vollständige Zustandsbeschreibung, Accessibility-Anforderungen). kaia_lerndesign_referenz.html bereinigt. .gitignore schließt *.local.md aus. · `30min`  
*docs: Auswertungs-SQL erweitert, UX-Spec Funken, .gitignore *.local.md*

---

## 2026-06-13 — Wochenbilanz KW24

**13.06.2026 · `138cde8`** — Erste Wochenbilanz des KAIA-Teams — KW24 zusammengefasst: Kernprinzip gerettet, Chat Core deployed, STORY-001 Closure + STORY-002 EMA-Buttons, Coverage-Gate 70%, Funken-Feature-Spec, Data Scientist ongeboardet. Enthält Agent-Konflikte, Entscheidungen, Retrospektive und Thesis-Timeline. · `30min`  
*docs: Wochenbilanz KW24 (06.06–12.06.2026)*

---

## 2026-06-09 — Chat Core live: SSE-Streaming, Claude-Integration, Admin-Test

**09.06.2026 · `179852c`** — Chat Core Backend: FastAPI SSE-Endpoint `/chat/stream`, Claude-Integration mit `claude-sonnet-4-5`, thinking-Strip (interne `<thinking>`-Blöcke nie an den Client), Conversation-History-Builder, PromptContext-Befüllung. KAIA erzeugt echten Gesprächsoutput. · `3h`  
*feat: Chat Core Backend — SSE-Streaming, Claude-Integration, thinking-strip*

**09.06.2026 · `d8d5c3c`** — Chat Core Frontend: SSE-Client mit EventSource, drei Charakter-Auswahl (warm/challenging/wild), Streaming-UI mit Tipp-Indikator, Nachrichtenhistorie. Erste vollständige Konversation zwischen User und KAIA möglich. · `2h`  
*feat: Chat Core Frontend — SSE-Client, 3-Charakter-Auswahl, Streaming-UI*

**09.06.2026 · `716af4f`** — KAIA eröffnet das Gespräch: `stream_opening()` Service-Funktion erzeugt die erste Nachricht der Session, bevor der User tippt. `character`-Feld in Session-Model ergänzt. · `30min`  
*feat: KAIA eröffnet das Gespräch + character-Feld im Model ergänzt*

**09.06.2026 · `5c22f25`** — Admin Chat-Test: JWT-gesicherter Testbereich für echten Produktions-Chat. POST `/admin/test-token` generiert kurzlebige Admin-Tokens. Split-Layout: links Chat, rechts Debug-Panel. · `1h`  
*feat: Admin Chat-Test — JWT-gesicherter Testbereich für echten Produktions-Chat*

**09.06.2026 · `db7cae8`** — Admin Chat-Test Split-Layout: Phase-Indicator zeigt aktuelle Session-Phase (Opening/Active/Closing), Fragetyp-Extraktion aus KAIA-Responses (Typen 1–6 sichtbar). · `30min`  
*feat: chat-test split layout fix + phase indicator + Fragetyp extraction*

**09.06.2026 · `9b0c6f0`** — Admin Analysis Panel: Live-Thinking-Block-Inspector zeigt KAIAs interne `<thinking>`-Prozesse in einem aufklappbaren Debug-Panel neben dem Chat. Nur im Admin sichtbar. · `1h`  
*feat: admin analysis panel — live thinking-block inspector*

**09.06.2026 · `e0bf40b`** — Thinking-Raw-Persistenz: jede KAIA-Antwort speichert `thinking_raw` in der DB. Ermöglicht retrospektive Analyse von KAIAs internen Entscheidungsprozessen für den LLM-Evaluationsbericht. · `20min`  
*feat: persist thinking_raw on every KAIA assistant message*

**09.06.2026 · `998fd86`** — Web wartet auf API-Healthcheck: Next.js-Startskript prüft `/api/v1/health` bevor die App hochkommt — kein 502 mehr bei zeitversetztem Container-Start. `test-token`-Route mit try-catch abgesichert. · `15min`  
*feat: Web wartet auf API-Healthcheck + test-token Route mit try-catch*

**09.06.2026 · `fa1c5cf`** — MAX_TOKENS erhöht und Schutz gegen unclosed thinking-Blöcke eingebaut — verhindert abgeschnittene Antworten bei langen KAIA-Turns. · `10min`  
*fix: increase MAX_TOKENS and guard against unclosed thinking blocks*

**09.06.2026 · `4a6e00d`** — thinkCounter-State durch Ref ersetzt: vermeidet Side-Effects im SSE-Updater, der bei State-Änderungen neu evaluiert würde. · `10min`  
*fix: replace thinkCounter state with ref to avoid side effects in updater*

**09.06.2026 · `3c32df9`** — `str()` für MessageRole in Conversation-History-Builder: Enum-Vergleich schlug fehl bei SQLAlchemy-Deserialisierung. · `5min`  
*fix: use str() for MessageRole in conversation history builder*

**09.06.2026 · `4d967a0`** — Roadmap- und Survey-ORM-Models beim App-Start registriert: verhindert `NoInspectionAvailable`-Fehler bei Alembic-Autogenerate. · `5min`  
*fix: register roadmap and survey ORM models at startup*

**09.06.2026 · `dac66ef`** — `detect_crisis` im Chat-Service korrekt importiert: falsche Import-Pfad führte zu `ImportError` beim ersten Chat-Request. · `5min`  
*fix: Crisis-Import — detect_crisis korrekt importiert in chat service*

**09.06.2026 · `d999d04`** — Migration c8f2e4b6d1a3: doppelter Index auf `prompt_templates.name` entfernt — verhinderte Alembic-Migrations-Fehler nach vorherigem partiellem Rollout. · `5min`  
*fix: Migration c8f2e4b6d1a3 — remove duplicate index on prompt_templates.name*

**09.06.2026 · `362f6eb`** — Admin Chat-Test: TypeScript-Fehler bei `authHeader`-Konstruktion behoben — `undefined`-Check fehlte im Header-Builder. · `5min`  
*fix: Admin Chat-Test — authHeader TypeScript-Fehler behoben*

**09.06.2026 · `37f6f59`** — Admin `test-token`-Route: doppeltes `/api`-Präfix in `INTERNAL_API_URL`-Konstruktion entfernt — führte zu 404 bei Token-Anfragen. · `5min`  
*fix: Admin test-token — INTERNAL_API_URL Pfad-Duplikat behoben*

**09.06.2026 · `33ace83`** — Admin-Layout `h-screen` gesetzt: Chat-Test Split-Panel füllt jetzt den gesamten Viewport — kein Scrollen mehr im Outer-Container. · `10min`  
*fix: admin layout h-screen so chat-test split panel fills viewport*

**09.06.2026 · `32110b9`** — `docs/AUSWERTUNG.md`: vollständige SQL-Referenz für die Studienauswertung — alle relevanten Queries für Session-Analyse, Feedback-Auswertung und LLM-Usage-Tracking. · `30min`  
*docs: Auswertung.md — vollständige SQL-Referenz für Studienauswertung*

---

## 2026-06-10 — Lerndesign-Fundament vollständig (Theorie-Sprint)

**Was sich verändert hat:** Das didaktische und psychologische Fundament von KAIA wurde heute in einem intensiven Theorie-Sprint vollständig überarbeitet und dokumentiert. Kein Code-Commit — aber die Grundlage für alles was als nächstes implementiert wird.

**Kernentscheidungen:**

- **10-Session-Design statt 3** — Bloom-Progression erfordert kumulativen Aufbau. 3 Sessions erreichen maximal Bloom 3; Transfer und Metakognition (Bloom 5–6) brauchen Sessions 9–10.
- **Session-Dauer**: Sessions 1–2: 20–30 Min. (Foundation); Sessions 3–10: 10–15 Min. (Micro-Sessions). Gesamtaufwand ~172 Min. in 4 Wochen.
- **Flow-Kurzskala (FKS)** als zusätzliches Messinstrument nach Session 2, 5, 8, 10 — Verlaufsanalyse neben GSE.
- **Kolb-konforme Phasenkorrektur**: Challenge NACH Konsolidierung (nicht davor).
- **Routing-Confidence "low" als Default** bis Session 2 — verhindert Routing-Lock-in nach nur 2–3 Turns.
- **KAIA bewertet nicht — 5 Sprachregeln**: Kein Lob, keine Typisierungen, keine Prognosen, keine Bewertungen, keine Ratschläge.
- **Session-Abschluss-Feature designed**: KAIA generiert Abschluss-Bubble vor echtem Session-End (Gagné's 9. Unterrichtsereignis). Max. 2 Exchanges. Kein Paternalismus (kein Early-Exit-Detektor).
- **In-Session Feedback Buttons designed**: Transfer-Marker ("Muss ich weiterdenken"), Engagement ("Wow"), Metacognitive ("Ich hänge gerade", "Das verstehe ich noch nicht"). Basiert auf EMA und Experience Sampling. Transfer-Marker werden als Cross-Session-Anker gespeichert.
- **Oliveira & Hamari (2024) richtig kontextualisiert**: Review über gameful environments, nicht KI-Konversationssysteme — Übertragbarkeit in Thesis argumentieren.

**Thesis-Relevanz:** Kapitel 3 (Rahmenwerk), 4 (Implementierung), 6 (Pilotstudie) aktualisiert. STUDIENPROTOKOLL aktualisiert. Vollständiges HTML-Referenzdokument erstellt (kaia_lerndesign_referenz.html v1.1). Feature-Spec für Chat-Core-V2 erstellt.

**Aufwand:** ~6h Theorie-Sprint (Teamdiskussion 5 Agenten)
**Kategorie:** Docs · Design

**10.06.2026 · `321a4cb`** — Session-Abschluss mit Closure-Phase: KAIA generiert eine Abschluss-Bubble wenn der User "Session beenden" klickt. 4-State-Machine (idle → loading → awaiting_confirm → ended), `stream_closing()` Service-Funktion, POST `/sessions/{id}/end` Endpoint. Max. 2 Exchanges, kein Paternalismus. Gagné's 9. Unterrichtsereignis (Transfer-Vorbereitung), Peak-End-Rule (Kahneman). · `1h 30min`  
*feat: STORY-001 Session-Abschluss mit Closure-Phase*

**10.06.2026 · `33e07a2`** — Session-Summary als BackgroundTask: Nach jeder Session analysiert KAIA mit `claude-haiku-4-5` das Transkript und extrahiert `first_step`, `observation`, `insight_for_next_session`, `mood`, `topics`, `strengths_observed`, `friction_points` als JSON in `session_summary`. KAIA erinnert sich in Session 2+ an Session 1. · `45min`  
*feat: extract_session_summary als BackgroundTask + insight_for_next_session*

**10.06.2026 · `cdc276b`** — mypy strict-mode Fehler in `main.py`, `prompts/repository` und `chat/service` behoben. · `10min`  
*fix: mypy-Fehler in main.py, prompts/repository, chat/service*

---

## Saturday, 07. June 2026 (Abend)
*22 Einträge · Tag-Summe ca. 10 h*

### 🆕 Neu

**07.06.2026 · `a69adf1`** — Voranmeldungs-Feature komplett: max. 50 Plätze mit Live-Counter, witziges Formular mit Inspiration-Button, Bestätigungsmail via Brevo, Slack-Notification, Danke-Seite mit Countdown, Abmelde-Link. Admin `/admin/vorregistrierung` mit Entfernen-Button. · `2h`  
*feat: Voranmeldung komplett (Backend + Frontend + Admin + E-Mails)*

**07.06.2026 · `653c14e`** — Kontaktformular `/kontakt`: "Liegt dir was auf der Seele?" — Name optional, Kontaktart wählbar (E-Mail/Telefon/Lieber nicht), Slack-Notification bei Absenden. Telefonnummer +49 176 61159403 eingetragen. · `30min`  
*feat: Kontaktformular + Telefonnummer*

**07.06.2026 · `4664036`** — Pre-Commit Hook: ruff + ESLint laufen jetzt lokal vor jedem Commit. Blockiert bei Fehlern, zeigt Fix-Anleitung. Einmalige Installation: `bash scripts/setup-hooks.sh`. · `20min`  
*feat: Pre-Commit Hook für ruff + ESLint*

**07.06.2026 · `805993b`** — Plausible Analytics eingebunden: datenschutzkonform, kein Cookie-Banner, DSGVO out-of-the-box, EU-Server. Eigene Aufrufe per `localStorage.setItem('plausible_ignore', 'true')` ausschließen. · `10min`  
*feat: Plausible Analytics*

**07.06.2026 · `32bd2df`** — Impressum nach § 5 TMG: Dagmar Rostek, Klosterstr. 12, 52511 Geilenkirchen. Verantwortlich nach § 18 Abs. 2 MStV, KI-Hinweis mit Krisentelefon. · `15min`  
*feat: Impressum — § 5 TMG*

**07.06.2026 · `6933f5c`** — Landing Page komplett neu: klare Botschaft, drei Informationskarten, primärer CTA "Jetzt vorregistrieren", kein kaputtes "Konto erstellen" mehr. Anmelden-Link unauffällig erhalten. · `20min`  
*feat: Landing Page neu*

**07.06.2026 · `76714cb`** — Migration `c8f2e4b6d1a3`: `llm_usage` (Token/Kosten-Tracking pro Session), `audit_events` (DSGVO append-only Audit-Log), `prompt_templates` (DB-managed Jinja2-Prompts). DB-Schema damit vollständig — alle 11 Tabellen live. · `20min`  
*feat: Migration — llm_usage, audit_events, prompt_templates*

### ⚡ Verbesserung

**07.06.2026 · `e0265f3`** — Impressum + Datenschutz auf jeder Seite: `LegalFooter`-Komponente in public und auth Layout, Impressum/Datenschutz-Links am Ende der Admin-Sidebar. · `15min`  
*fix: Impressum+Datenschutz auf jeder Seite*

**07.06.2026 · `b644da5`** — Session-Ablauf auf Mitmachen-Seite bewusst offen gelassen: Mechanismus nicht beschreiben, Neugier wecken. Wissenschaftlich sinnvoll — Teilnehmende die den Ablauf kennen, verhalten sich anders. · `10min`  
*feat: Session-Beschreibung offen lassen*

**07.06.2026 · `5e70086`** — "Was ist KAIA?": Sechs Fragetypen-Liste entfernt, Mechanismus nicht erklärt. "Was in einer Session passiert, lässt sich schwer vorausschreiben — das ist auch der Sinn der Sache." · `10min`  
*feat: KAIA-Beschreibung neugierig statt technisch*

**07.06.2026 · `4c6135b`** — "Voranmeldungen" in Admin-Sidebar ergänzt. · `5min`  
*feat: Voranmeldungen in Admin-Sidebar*

**07.06.2026 · `6c895d4`** — `docs/ANALYTICS.md`: Plausible-Tracking deaktivieren, Setup neuer Rechner, Pre-Commit Notfall-Bypass dokumentiert. · `10min`  
*docs: Analytics + Pre-Commit Anleitung*

### 🔧 Fix

**07.06.2026 · `feaf707`** — Voranmeldung: abgemeldete E-Mails können sich wieder anmelden (`create_or_reactivate`). Nur aktive werden als doppelt blockiert. Placeholder ohne Therapeutin-Satz. · `20min`  
*fix: Voranmeldung — Re-Registrierung, Lint, Placeholder*

**07.06.2026 · `04f3e91`** — Admin-Voranmeldung als Server Component: nutzt `INTERNAL_API_URL` + `ADMIN_PASSWORD` direkt statt Cookie-HMAC. Proxy-Route für Entfernen-Button. · `20min`  
*fix: Admin-Voranmeldung als Server Component*

**07.06.2026 · `52fb87d`** — Doppeltes `/api/api/v1/...` in Voranmeldungs-Requests: relative URLs statt `NEXT_PUBLIC_API_URL`. · `10min`  
*fix: relative URLs in Voranmeldung*

**07.06.2026 · `e0265f3`** — mypy: `get_db` direkt aus `app.db.session` importiert. SMTP- und `ADMIN_EMAIL`-Env-Vars in `docker-compose.prod.yml` ergänzt. · `10min`  
*fix: mypy get_db + docker-compose SMTP*

**07.06.2026 · `2bf799e`** — Ruff I001 + ESLint: unused vars (`MessageSquare`, `bqContent`, `CheckCircle2`, `Clock`, `AlertTriangle`) entfernt. `setState` in `abgemeldet/page.tsx` via `setTimeout(fn, 0)` deferred. · `10min`  
*fix: ruff + ESLint cleanup*

**07.06.2026 · `6714dd4`** — ruff format `email.py`. · `2min`  
*fix: ruff format email.py*

---

## Saturday, 07. June 2026
*10 Einträge · Tag-Summe ca. 4 h*

### 🆕 Neu

**07.06.2026 · `f1109c6`** — 404-Seite: KAIA stellt natürlich eine Gegenfrage zurück. Buttons zu Startseite und Mitmachen-Seite. · `15min`  
*feat: 404-Seite mit KAIA-Charakter*

**07.06.2026 · `f1109c6`** — Öffentliches Entwicklungs-Tagebuch unter `/tagebuch`: Liest `docs/DAILY_LOG.md` und rendert alle Einträge. In der öffentlichen Navigation verlinkt — der Entwicklungsprozess ist Teil des Projekts. · `30min`  
*feat: öffentliches Tagebuch unter /tagebuch*

**07.06.2026 · `4a3ca65`** — GSE-Fragebogen und Auswertungskonzept vollständig dokumentiert: alle 10 deutschen Items, Auswertungskonzept (Summenscore 10–40, Wilcoxon-Test, Effektgröße r), Normwerte (Hinz et al. 2006, M≈29), Gütekriterien (α .80–.90), Lizenznachweis (CC BY-NC-ND 3.0), 4 APA-7-Vollzitate. Projektbeschreibung Ethikkommission aktualisiert. · `20min`  
*docs: GSE-Fragebogen + Auswertungskonzept für Ethikvotum*

### ⚡ Verbesserung

**07.06.2026 · `f1109c6`** — Registrierung und Login gesperrt bis 16. Juli 2026: Beide Seiten zeigen rückwärtszählenden Countdown (Tage/Stunden/Minuten/Sekunden). Öffnet automatisch am 16.07.2026 00:00. · `30min`  
*feat: Registrierung + Login gesperrt mit Countdown bis 16. Juli*

**07.06.2026 · `f1109c6`** — Mitmachen-Seite: Countdown-Banner oben + CTA-Buttons deaktiviert bis 16. Juli. · `20min`  
*feat: Mitmachen-Seite mit Countdown + deaktivierten CTAs*

**07.06.2026 · `369583f`** — Mitmachen-Seite: "Was ist KAIA?" und Session-Ablauf auf v2-Prompt-Design aktualisiert. Kernprinzip direkt kommuniziert, 6 Fragetypen sichtbar, 4-Schritte-Onboarding mit Spiegel-Schritt, "Was KAIA niemals tut"-Box, Rupture-Repair sichtbar gemacht. · `30min`  
*feat: Mitmachen-Seite aktualisiert — KAIA v2-Beschreibung*

**07.06.2026 · `f1109c6`** — KAIA-Link in Auth-Layout: Login- und Registrierungsseiten haben jetzt Header mit KAIA-Link und Theme-Toggle. · `10min`  
*feat: KAIA-Header in Auth-Layout*

**07.06.2026 · `f1109c6`** — Öffentliche Navigation um "Tagebuch" erweitert. · `5min`  
*feat: Tagebuch in öffentliche Navigation*

### 🔧 Fix

**07.06.2026 · `3576924`** — ruff E501: Test-Assertion zu lang — auf mehrere Zeilen aufgeteilt. · `5min`  
*fix: ruff E501 — test assertion auf mehrere Zeilen aufgeteilt*

**07.06.2026 · `331acd6`** — Build-Fehler: deutsche Anführungszeichen in JS-String-Literalen verursachten Parsing-Fehler (exit code 1 beim Docker-Build). · `5min`  
*fix: Anführungszeichen in Fragetypen-Array — single quotes statt double*

---

## Friday, 06. June 2026
*8 Einträge · Tag-Summe ca. 7 h 45 min*

### 🆕 Neu

**06.06.2026 · `a512305`** — `KAIA_PROMPT_V2_WARM`: Alle 29 Erkenntnisse aus 6 Prompt-Engineering-Quellen integriert (Anthropic Tutorial, Real World Prompting, Prompt Evaluations, Red Teaming, Guardrails, Evaluating AI Agents). Neue Elemente: XML-Tags für Daten/Instruktions-Trennung, `<thinking>/<final_answer>`-Split mit 8 internen Klassifikationsschritten (Lazarus, Fragetyp, Crisis, Grenz, Grounded, Session-Phase, Rupture, Erwünschtheit), Few-Shot Kontrast-Paare für Fragetypen 3/4/5, Jailbreak-Schutz, Bias-Neutralitäts-Constraint, Halluzinations-Guard, Kontext-Referenz-Verbot, diskrete Eval-Targets, Convergence-Constraint (4–6 Turns), Soziale-Erwünschtheit-Intervention, Rupture-Repair-Protokoll. v1 bleibt als inaktive Regression-Baseline. 19 Tests grün. · `4h`  
*feat: KAIA_PROMPT_V2_WARM mit 29 Prompt-Engineering-Erkenntnissen*

**Wissenschaftlicher Impact:** Der v2-Prompt ist die erste vollständig aus der Fachliteratur abgeleitete Prompt-Architektur für KAIA — zitierfähig für Kap. 4.7 (Iterative Prompt-Entwicklung). `PROMPT_ENGINEERING_RESEARCH.md` dokumentiert alle 6 Quellen mit APA-7-Vollzitaten und KAIA-Relevanz-Markern.

**06.06.2026 · `a512305`** — Data Scientist als 14. Teammitglied ongeboardet: Rolle, Trigger-Bedingungen (LLM-Evaluationsbericht, Studienauswertung, Experiment-Framework), G13 Statistik-Gate (Eval-Methodik, Convergence-Score, Stichprobenqualität). · `15min`  
*feat: Data Scientist onboarded, G13 Statistik-Gate*

### ⚡ Verbesserung

**06.06.2026 · `dd70508`** — Sandbox-Kommunikation-Warm-Prompt auf v2 gehoben (identisch mit `KAIA_PROMPT_V2_WARM`, ohne Jinja2). Sandbox-Backend (`/admin/api/sandbox-chat`) strippt `<thinking>`-Blöcke vor der Ausgabe an den Nutzer — nur `<final_answer>`-Inhalt sichtbar. Rupture-Repair und Soziale-Erwünschtheit testbar in der Sandbox. · `30min`  
*feat: Sandbox v2-Prompt + thinking-stripping im Backend*

**06.06.2026 · `8a78b2c`** — Neue Prompt-Regel: Sobald Lernende eine eigene Formulierung, einen Plan oder eine Erkenntnis produzieren, fragt KAIA nach Wirkung — nicht nach Verbesserung. KAIA ersetzt niemals die Formulierung des Lernenden durch eine eigene. · `20min`  
*fix: neue Prompt-Regel — eigene Formulierung des Lernenden nie ersetzen*

### 🔧 Fix

**06.06.2026 · `b3f1fc2`** — Vier Fixes aus Live-Gesprächsanalyse: (1) Schritt 4 form-sensitiv — unterscheidet Verhaltensziele (erster Schritt) von inneren Zielen (erstes Zeichen). (2) Techniken-/Methoden-Vorschläge explizit verboten — auch als "Was wäre wenn..."-Frage verkleidet. (3) Rupture-Repair geht nicht zurück an den Anfang — pivotiert mit "Was wäre jetzt hilfreicher?". (4) React setState-in-useEffect-Lint-Fehler behoben — lazy useState-Initializer statt useEffect für localStorage-Restore. · `45min`  
*fix: Prompt-Korrekturen aus Live-Test + React setState-Lint-Fix*

**06.06.2026 · `dd70508`** — Sandbox-Motiv-Probing überarbeitet: keine Checkliste mehr — KAIA folgt dem echten Gesprächsfaden. Schritt 3 (Der Spiegel) mit explizitem Gewicht — KAIA geht nicht zu Schritt 4 bevor der Lernende den Spiegel bestätigt hat. Spiegel spiegelt das Motiv, nicht das Thema. Rupture-Repair um Kontraindikation erweitert: nach Rupture nie zurück an den Anfang. · `15min`  
*fix: Schritt 2 Motiv-Probing + Spiegel-Gewicht + Rupture-Repair*

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
