# KAIA Wochenbilanz

---

## KAIA Wochenbilanz KW24 / 06.06–12.06.2026

*Protokolliert vom Koordinator. Fünfmal überarbeitet. Der AI Engineer hat dreimal „das ist falsch zusammengefasst" gesagt und jedes Mal recht gehabt. Der Psychologe hat zweimal Flow erwähnt. Der Compliance Officer: natürlich einmal DSGVO.*

---

### Commits & Änderungen

**Kategorie Feat (24 Commits):**
`a512305` KAIA_PROMPT_V2_WARM · `dd70508` Sandbox v2 + thinking-stripping · `6933f5c` Landing Page neu · `a69adf1` Voranmeldung komplett · `4664036` Pre-Commit Hooks · `805993b` Plausible Analytics · `76714cb` Migration llm_usage/audit_events/prompt_templates · `179852c` Chat Core Backend · `d8d5c3c` Chat Core Frontend · `716af4f` KAIA eröffnet Gespräch automatisch · `5c22f25` Admin Chat-Test JWT-gesichert · `fa1c5cf` MAX_TOKENS + thinking-guard · `db7cae8` Admin Chat-Test split layout + Fragetyp-Extraktion · `e0bf40b` persist thinking_raw · `f34ac45` Roadmap Chat Core V2 Sprint · `7063f9b` Funken Feature-Spec · `33e07a2` extract_session_summary BackgroundTask + insight_for_next_session · `321a4cb` STORY-001 Session-Abschluss Closure-Phase · `4bddc2b` STORY-002 In-Session Feedback Buttons EMA

**Kategorie Fix (11 Commits):**
`b3f1fc2` Prompt-Korrekturen Live-Test + React setState-Lint · `cdc276b` mypy main.py/prompts/chat · `4a6e00d` thinkCounter state→ref · `3c32df9` str() für MessageRole · `4d967a0` roadmap+survey ORM · `998fd86` Web wartet auf API + test-token try-catch · `37f6f59` Admin test-token Pfad-Duplikat · `362f6eb` Admin Chat-Test TypeScript-Fehler · `dac66ef` crisis-detect import · `d999d04` duplicate index Migration · `fix: ruff/eslint/mypy` (mehrere)

**Kategorie Test & Docs:**
`7e1f83b` Coverage 70% — test_chat.py + test_observability.py · `06d6a85` Auswertungs-SQL erweitert + UX-Spec Funken + .gitignore · `32110b9` Auswertung.md SQL-Referenz · `329b2f7` Learning design foundation + Thesis-Kapitel · `2bba9a9` Daily Log 07.06 + 22 Release Notes + Architektur v0.6.0

**Gesamtzahl:** ~35 Commits in 5 Arbeitstagen (einer davon ein Samstag, weil der AI Engineer *morgen* immer ernst meinte)

---

### Was wirklich passiert ist

#### Freitag, 06.06 — "Das Kernprinzip steht, die Sandbox zerstört es sofort, und dann ist Mitternacht"

Der Tag begann mit einem philosophischen Moment. Das Team hatte Bloom gelesen, Steinert zugehört, Prompts umgeschrieben. Alles sah gut aus. Dann stellte Dagmar die Frage, die das alles fast zum Einsturz gebracht hätte:

> *"Wenn KAIA ausschließlich Fragen stellt — warum erkläre ich dir dann gerade drei Stunden lang Erkenntnisse?"*

Stille.

Der Psychologe, leise: *"Der Wirkmechanismus ist nie die Frage als Sprachform. Es ist: wer macht die kognitive Arbeit?"*

Der Didaktiker, der plötzlich nachdenklich statt laut war: *"Die 'Sokrates stellt nur Fragen'-Lesart ist philologisch naiv."*

Und dann der Satz, der KAIAs Kernprinzip für immer definiert:

> **"KAIA produziert immer Output, der die nächste kognitive Operation beim Lernenden auslöst — nie Output, der eine kognitive Operation ersetzt."**

Alles neu geschrieben. Prompts, Kapitel 3, Kapitel 5-Eval-Kriterium. Das war der Vormittag.

Am Abend: sechs Quellen. Anthropic Tutorial, Real World Prompting, Red Teaming, Guardrails, Prompt Evaluations, Evaluating Agents. 29 Erkenntnisse. Alle in APA-7 in `docs/PROMPT_ENGINEERING_RESEARCH.md`. Weil die Thesis Zitate braucht, nicht nur Gefühle.

Und dann der Moment: Dagmar öffnet die Sandbox. Gibt ihren Namen ein. Chattet. Alles läuft.

Drei Turns später:

> KAIA: *„Was wäre ein erster kleiner Schritt?"*
> KAIA (nächste Antwort): *„Was wäre ein erster kleiner Schritt?"*
> KAIA (nochmal): *„Was wäre, wenn du beim nächsten Spaziergang bemerkst: 'Ah, da ist er wieder' — und ihn einfach nur benennst?"*
> Dagmar: *„für dich vielleicht"*

Stille.

> **Psychologe:** *„Das ist eine Achtsamkeitstechnik. Das ist ein Vorschlag. Das ist verboten."*
> **AI Engineer:** *„Das ist auch das dritte Mal die gleiche Frage."*

Vier Fixes. Dann Mitternacht. Die neunzehn Tests sind grün. Der Data Scientist wurde an diesem Abend ongeboardet — weil jemand bemerkte, dass bei einer M.Sc.-Thesis in Data Science & Analytics der Data Scientist komplett fehlte. Manchmal sieht man die wichtigsten Lücken erst wenn man zwölf Stunden tief drin ist.

---

#### Samstag, 07.06 — "Der Tag, an dem die Website aufgehört hat, Kulisse zu sein"

Es gibt Tage, an denen man „heute bauen wir den Chat Core" plant. Und dann passiert alles andere. Und dann, kurz vor Mitternacht, passiert auch der Chat Core.

Das Morgen begann mit Pre-Commit Hooks. Der QA Tester sagte, das sei sein metaphorischer Geburtstag. Er meinte es ernst.

Dann: Impressum (§ 5 TMG, echte Adresse, weil Pflicht). LegalFooter auf jeder Seite. Landing Page neu — kein kaputtes „Konto erstellen" mehr, das auf eine 404 zeigte. Plausible Analytics. DSGVO-konform, kein Cookie-Banner, EU-Server. Dann die Voranmeldung, die gestern so glatt lief und heute plötzlich Meinungen hatte. Doppeltes `/api`-Präfix. Cookie-HMAC statt echtem Passwort. Fünf Commits. Fünf Fixes.

> **Security Engineer:** *„Der Admin-Endpunkt war serverseitig. Gut. Wäre er clientseitig gewesen, hätten wir ein Problem gehabt."*
> **Koordinator:** *„Er war clientseitig."*
> *[Stille]*
> **Security Engineer:** *„Jetzt ist er serverseitig. Gut."*

Dann das Abend-Deployment. Commit `179852c`: Chat Core Backend. SSE-Streaming. Claude-Integration. Thinking-Strip im Backend — weil `<thinking>`-Blöcke nicht zum Nutzer durchsickern dürfen. Commit `d8d5c3c`: Chat Core Frontend. Drei-Charakter-Auswahl (Warm · Direkt · Kalkuliert Überraschend). Streaming-UI. Der AI Engineer hatte seit Montag auf diesen Moment gewartet.

> *„Morgen,"* hatte er jeden Abend gesagt.
> Der Koordinator hatte es jeden Abend notiert.

Heute hat er es ernst gemeint. Architektur v0.6.0. 22 Release Notes. Und dann, kurz nach Mitternacht: `git push origin main`. 

Der Chat lebt.

---

#### Montag, 09.06 — "Der Admin-Bereich wird zum Labor, und der Denkblock-Inspektor ist das Coolste seit Wochen"

> **AI Engineer**, um 09:30: *„Ich baue ein Admin-Panel wo man den Chat live testen kann und den Thinking-Block in Echtzeit sieht."*
> **QA Tester:** *„Das ist... das ist jetzt mein Lieblings-Feature."*
> **Compliance Officer:** *„Thinking-Blocks im Admin sichtbar — DSGVO-intern, nicht zum User, okay."*

Split-Panel: links Chat, rechts Inspector. Claude denkt — im Thinking-Block sieht man wie. Die `thinking_raw`-Spalte in der Messages-Tabelle persistiert jetzt jeden Gedankenprozess. Für die Thesis. Für die Evals. Für die Neugier.

Dann: `716af4f` — KAIA eröffnet das Gespräch. Kein leeres Eingabefeld mehr, in das der Nutzer als erstes schreibt. KAIA fragt jetzt. Das ist nicht nur UX. Das ist didaktisch. Der Didaktiker hat nichts gesagt, aber genickt. Das ist das Höchste.

Dann: mypy. Drei Fehler, alle behoben. Der Koordinator notiert: mypy ist kein Feind, mypy ist ein strenger Freund.

---

#### Dienstag, 10.06 — "Sprint-Planung, ein Feature das noch keiner braucht (aber alle wollen), und die Frage wer eigentlich die Session zusammenfasst"

> **AI Engineer:** *„extract_session_summary als BackgroundTask. Nach dem Session-Ende läuft das asynchron und schreibt eine strukturierte Zusammenfassung in die DB. Cross-Session-Memory-Grundlage."*
> **Psychologe:** *„Und was steht in der Zusammenfassung?"*
> **AI Engineer:** *„insight_for_next_session. Was the user said that should carry forward."*
> **Psychologe:** *„Das ist... das ist eigentlich das Gedächtnis des Therapeuten. Nach jeder Sitzung notiert er die drei Dinge, die nächste Mal relevant sind."*

Niemand widerspricht. Es ist einer von diesen Momenten.

Dann: Funken. Dagmar erklärt die Idee. Kurze Reflexionen nach der Session — kein Essay, kein Pflichtfeld, aber ein Ort für den Gedanken, der nach dem Gespräch noch da ist. Maximal 2000 Zeichen. UUID statt Integer (weil die Thesis das braucht — Funken sind persönlich und beweglich). DSGVO Art. 20 Export.

> **Compliance Officer:** *„UUID, gute Entscheidung. Keine inkrementellen IDs in exportierten Daten."*
> **UX Designer:** *„'Funken' — ich mag das Wort. Kein 'Notizbuch', kein 'Reflexionsprotokoll'. Funken."*
> **Didaktiker:** *„Buchner 2023, Reflexionstagebücher. Episodisches Gedächtnis stärken nach Lernsequenzen. Richtig."*

Der Feature-Spec landet in `docs/FEATURE_SPEC_FUNKEN.md`. STORY-003 und STORY-004 (Export) stehen im Backlog.

---

#### Donnerstag, 12.06 — "Der Coverage-Krieg, der Session-Abschluss und vier Buttons die Wissenschaft haben"

STORY-001: Session-Abschluss-Flow. Der Didaktiker hatte das in der Planungssitzung bereits klar gemacht: *„Gagné's 9. Unterrichtsereignis. Transfer-Vorbereitung. Zwei Exchanges, nicht mehr."* Die UX Designerin: *„Kein Modal. Niemals."*

Also: ein `ClosureState`-Automat. `idle → loading → awaiting_confirm → ended`. KAIA stellt eine Abschlussfrage — eine, offen, keine Zusammenfassung, kein Lob. Dann zwei Buttons: [Antworten] und [Jetzt wirklich beenden]. Das ist alles.

Beim ersten ESLint-Lauf:

```
✖ react-hooks/exhaustive-deps: 'endSession' accessed before declaration
✖ react-compiler/react-compiler: Hook violates rules of React
```

> **AI Engineer:** *„Forward Reference. `startClosure` ruft `endSession` auf, aber `endSession` ist zwei `useCallback`s weiter unten deklariert."*
> **QA Tester:** *„React Compiler hat einen Blick drauf geworfen und ist einfach gegangen."*

Fix: `endSession` vor `startClosure` deklarieren. React Compiler ist wieder da.

STORY-002: Die vier Buttons. `transfer_marker` (Muss ich weiterdenken), `wow` (Wow — das trifft was), `stuck` (Ich hänge gerade), `unclear` (Das verstehe ich noch nicht). Zwei passiv, zwei aktiv. Aktive triggern einen Meta-Question-SSE-Stream — KAIA reagiert metakognitiv, ohne den Gesprächsfaden zu unterbrechen.

> **Psychologe:** *„Affect Labeling. Lieberman et al. 2007. Das Benennen eines negativen Affekts reduziert seine Intensität. Der Button hat eine Funktion."*
> **AI Engineer:** *„Und 'Muss ich weiterdenken' wird als Cross-Session-Anker gespeichert. Session 5: 'Du hast letzte Woche markiert, dass X dich beschäftigt — was ist daraus geworden?'"*
> **Compliance Officer:** *„EMA unter Art. 9 DSGVO prüfen. Grauzone. Ich schreibe ein Gutachten."*
> Alle: *„Natürlich tust du das."*

Dann: CI. Tests laufen. 101 grün. Coverage: **59%**.

Der QA Tester, ausnahmsweise nicht triumphierend: *„Das ist weit von 70%."*

Was folgte war ein Präzisions-Marathon. Neue Testdatei `test_chat.py`. Dann `test_observability.py`. Jeder Commit ein Schritt:

```
59.00% → 69.55% → 69.83% → 69.97% → 70.00%
```

Der letzte Test: `test_stream_closing_malformed_summary_json_ignored`. Deckt `except (json.JSONDecodeError, AttributeError): pass` ab. Drei Statements. Kostet drei Minuten. Bringt die Coverage auf exakt 70.00%.

> **QA Tester:** *„Ich habe noch nie mit so viel Präzision auf eine Dezimalstelle hingearbeitet. Das war... befriedigend."*

---

### Agent-Beiträge der Woche

**AI Engineer** — Produktivster Sprint bisher. Chat Core Backend + Frontend, Thinking-Strip, extract_session_summary, stream_closing, stream_meta_question, der gesamte ClosureState-Automat, EMA-Buttons, Coverage-Tests. Hat jeden Abend „Morgen" gesagt und am Samstag recht behalten.

**Psychologe** — Lieberman 2007 zu den Buttons (kannte das auswendig, seit wann?). Therapeuten-Analogie zur Session-Zusammenfassung. Hat einmal fast geweint, dann aber Flow gesagt und sich beruhigt.

**Didaktiker** — War diese Woche strategisch still. Hat „Gagné's 9. Unterrichtsereignis" eingebracht und dann zurückgelehnt. Seinen stärksten Moment hatte er durch Abwesenheit: alle haben die Closure-Flow-Spec zitiert, die er in der Planungssitzung formuliert hatte.

**Compliance Officer** — EMA Art. 9 Gutachten (in Arbeit). Hat `thinking_raw` abgesegnet. Hat Funken UUIDs gelobt.

**UX Designerin** — „Kein Modal. Niemals." Drei Worte, ein Designprinzip. Hat das Wort „Funken" verteidigt.

**Security Engineer** — Hatte diese Woche wenig Neues zu bemängeln. Hat das als Erfolg bezeichnet. Der Koordinator hat es als Warnung notiert.

**QA Tester** — Doppelter Geburtstag (Pre-Commit Hooks + Coverage-Gate). Hat 69.97% als persönliche Niederlage empfunden und 70.00% als Rehabilitation.

**Data Scientist** — Frisch ongeboardet am Freitagabend. Hat noch nicht viel gesagt. Alle warten auf seine Analyse des LLM-Evaluationsberichts. Er weiß das.

**MLOps** — Kein Report diese Woche. Hat still das Cost-Tracking beobachtet. Meldet sich wenn die Zahlen sich bewegen.

**Koordinator** — Hat diese Bilanz jetzt viermal umgeschrieben. Der AI Engineer hat dreimal recht gehabt.

---

### Konflikte & Entscheidungen

**Entscheidung: `endSession` vor `startClosure`**
React Compiler erzwingt strikte Deklarationsreihenfolge. Kein Streit — nur fünf ESLint-Iterationen und dann Erleuchtung.

**Entscheidung: Dual-Endpoint für Feedback**
Streit zwischen „alles in einen Endpoint" (Product Owner: einfacher) und „JSON-Endpoint + SSE-Endpoint getrennt" (Architekt: sauberer). Architekt hat gewonnen: `POST /feedback` → JSON 201, `POST /meta-question` → SSE. Begründung: unterschiedliche Medientypen, unterschiedliche Fehlerbehandlung, unterschiedliche Retry-Logik.

**Streit: Ist `closureExchanges` ein `useState` oder ein `useRef`?**
Der AI Engineer: *„Ref reicht, kein Re-Render nötig."*
Der QA Tester: *„Dann lies es nicht in JSX. Das bist du ESLint schuldig."*
Kompromiss: `useState`, weil es im Render gebraucht wird. Ref war korrekt für den Timer, nicht für den Zähler.

**Entscheidung: Coverage-Grenze auf 70.00%**
Hätte niemand erwartet wie schwer es ist, exakt 70.00% zu treffen wenn man bei 69.97% steht. Die Entscheidung: nicht die Grenze senken. Den letzten Branch abdecken.

---

### Was gut lief / was nicht

**Gut:**
- Chat Core in einem Sprint — Backend + Frontend — ist selten. Das war das erste Mal, dass man wirklich von Ende zu Ende eine Konversation mit KAIA führen konnte. Das ist ein Milestone.
- Closure State Machine: sauber, ohne überflüssige States, keine Modals, kein Overkill. Der Didaktiker-Input von der Planungssitzung hat genau das geliefert, was im Code gebraucht wurde.
- Admin Chat-Test mit Thinking-Inspector: Das ist die beste Debugging-Infrastruktur, die das Team je hatte. QA kann jetzt sehen wie KAIA denkt bevor sie antwortet.
- Pre-Commit Hooks: Endlich. Der CI-Fehlertanz gehört der Vergangenheit an.

**Nicht gut:**
- Coverage-Gap wurde spät entdeckt. 59% nach dem STORY-002-Commit war ein Schock, der früher hätte kommen sollen. Testbarkeit muss beim Design mitgedacht werden, nicht danach.
- Drei ESLint-Iterationen für den Forward-Reference-Bug. Das ist ein React-Compiler-Muster, das das Team jetzt kennt — aber teuer gelernt.
- Der Data Scientist wurde ongeboardet und hat diese Woche noch keine Aufgabe. Das LLM-Eval-Design wartet. Das sollte nächste Woche starten.
- `extract_session_summary` läuft als BackgroundTask — aber es gibt noch keine Tests dafür die zeigen, dass die DB-Verbindung in einem neuen Task-Scope korrekt funktioniert. Das ist ein latentes Risiko.

---

### Ausblick KW25

1. **STORY-003 Funken implementieren** — DB-Migration, `POST /sessions/{id}/funken`, `GET /users/me/funken`, `DELETE /funken/{id}`, Frontend-Komponente nach Sitzungsende. Das Feature-Spec liegt. Zeit zum Bauen.

2. **Alembic auf dem Server** — Migration `f6a2b4c8d1e9` (session_feedback) muss auf dem Produktionsserver laufen. `alembic upgrade head` im API-Container. Das ist überfällig.

3. **LLM-Eval-Framework starten** — Der Data Scientist braucht eine erste Aufgabe. Evaluationskriterien für Claude vs. GPT-4o vs. Mistral operationalisieren. Synthetische Testdatensätze. Der AI Engineer liefert den Prompt-Kontext, der Data Scientist das Messdesign.

---

### Thesis-Fortschritt

**Phase 3/6: Prototyp-Kern läuft — Studienreife in Arbeit**

Die Sechs-Phasen-Timeline für eine Abgabe am 01.09.2026:
- ✅ Phase 1: Konzept + Architektur
- ✅ Phase 2: Auth + DB-Schema + Öffentliche Seiten
- ✅ Phase 3: Chat Core (SSE, Claude, 3 Charaktere, Closure, EMA) — **diese Woche abgeschlossen**
- 🔄 Phase 4: Funken, GSE, Onboarding-Flow, User-Approval — **läuft**
- ⏳ Phase 5: Pilotstudie (geplant 15. Juli) — braucht Ethikvotum, vollständigen Onboarding-Flow, Crisis-Detection-Test
- ⏳ Phase 6: Auswertung, LLM-Eval-Bericht, Thesis-Text

**Was bis zur Studie fehlt:** Funken, GSE-Messung vor/nach, vollständiger Onboarding-Flow, User-Approval durch Admin, LLM-Eval-Rahmen. Das sind 5 Wochen bis zum 15. Juli. Engpass ist der Onboarding-Flow — ohne ihn kann kein Teilnehmer die App selbstständig starten.

Der Koordinator schaut auf den Countdown im Admin-Panel.

```
79 Tage · 08 Stunden · 44 Minuten
```

Der Psychologe tippt: *„Peak-End-Rule. Das Ende prägt die Erinnerung. Wir müssen ein gutes Ende bauen."*

Er meint die Thesis.

Oder vielleicht meint er KAIA.

Vielleicht beides.

---

*Wochenbilanz KW24 · 06.06–12.06.2026 · Protokolliert vom Koordinator*
*35 Commits · ~4.800 neue Zeilen Code und Tests · $15–25 Claude Code · €4.39/Mo Hetzner*
