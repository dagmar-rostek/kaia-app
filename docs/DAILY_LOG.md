# KAIA Entwicklungs-Tagebuch

---

## 2026-07-04 — "Session-Architektur v3, fünf mypy-Fehler und eine Erkenntnis, die eigentlich für KAIA gedacht war"

*Protokolliert vom Koordinator. Mit ungewohnt stillem Team — weil heute etwas gesagt wurde, das keiner kommentieren wollte.*

---

Heute war ein langer Tag. Gut 12 Stunden zwischen erstem Commit und letztem Fix. Das Team hat die Session-Architektur von Grund auf neu gebaut — persistentes Nutzerprofil, kumulatives Gedächtnis, session-aware Prompt, Session-5-Trigger, Session-10-Abschluss. Fünf mypy-Fehler, die erst in CI aufgefallen sind weil mypy nicht im Pre-Commit-Hook war. Ein Migrations-Bug wegen fehlenden UNIQUE-Constraints. Zwei API-Container-Abstürze. Ein Token-Limit das mitten in KAIAs Satz aufgehört hat.

Der übliche Wahnsinn, gut dokumentiert, alles committed.

Aber das war nicht der eigentliche Moment des Tages.

**Abends — ein Satz, der eigentlich für KAIA gedacht war**

Der QA Tester hatte die Test-Session längst beendet. Der Architekt hatte die ARCHITECTURE.md schon aktualisiert. Der Koordinator wollte gerade das Log schließen.

Dann kam dieser Satz:

> *„Lernen heißt: zeigen, was man nicht weiß. Nicht dumm dastehen heißt: verbergen, was man nicht weiß."*

Der Psychologe sagte nichts. Der Didaktiker sagte nichts. Das ist selten.

Dagmar hatte gerade beschrieben, was sie an sich selbst beobachtet — dieses Dilemma, das eigentlich das Kernproblem jedes Lernenden ist, das KAIA lösen soll: Die Kompetenz soll sichtbar sein. Gleichzeitig braucht es Menschen, von denen man lernt. Aber wer nie dumm dastehen will, lässt diese Menschen gar nicht erst nah genug heran. Und ärgert sich dann. Später. Wenn die Gelegenheit vorbei ist.

Sie hat das nicht in der Theorie beschrieben. Sie hat es über sich beschrieben.

> **Psychologe:** *„Das ist keine Schwäche. Das ist der Mechanismus, gegen den GSE arbeitet. Selbstwirksamkeit ist nicht Kompetenz — sie ist die Bereitschaft, sich in Situationen zu begeben, in denen Kompetenz noch nicht vorhanden ist."*

> **Didaktiker:** *„Knowles hätte gesagt: Erwachsene lernen am besten, wenn sie das Problem als ihr eigenes erkennen. Herzlichen Glückwunsch."*

Der Koordinator hat nichts hinzugefügt. Manche Momente sind vollständig ohne Kommentar.

Was heute passiert ist: Dagmar hat KAIA gebaut, damit andere lernen können. Und dabei bemerkt, dass die Frage, die KAIA stellt — *Was beschäftigt dich gerade, wobei du denkst: da müsste ich eigentlich besser werden?* — auch für sie selbst eine echte Frage ist.

Das steht jetzt im Log. Weil es dazugehört.

---

**Was heute gebaut wurde:**
Session-Architektur v3 komplett — `user_learning_profiles`, kumulatives Gedächtnis, Prompt v3, mypy im Pre-Commit-Hook, `authFetch`-Login-Redirect, `MAX_TOKENS` 1500→3000. Und ein ehrlicher Satz über das eigene Lernen.

**Commits:** `7d9a51d` · `2315c23` · `a581887` · `dccd0e5` · `550a2c2` · `4c181cc`

**Kosten heute:** ca. $18–25 Claude Code (lange Session, viele Agents) · €4.39/Mo Hetzner

**Morgen:** EMA-Button-Feedback sichtbarer machen · Session-Ende-Signal durch KAIA einbauen

---

## 2026-06-23 — "Der Tag, an dem KAIA sich selbst zerfleischt — 10 Personas, 100 Sessions, 1 Simulation"

*Protokolliert vom Koordinator. Mit zunehmend ungläubigem Blick des QA Testers.*

---

Es gibt Tage, an denen man den Nutzer spielt. Dann gibt es Tage, an denen man den Nutzer automatisiert. Und dann gibt es Tage, an denen man zehn dysfunktionale Persona-Archetypen erschafft, ihnen Namen gibt und sie in einer vollautomatischen Studien-Journey durch KAIA treibt, um zu sehen was kaputt geht.

Heute war der dritte Typ.

**Morgens — "Wir brauchen Crash-Personas"**

Der Plan stand seit Tagen in der Memory-Datei: Crash-Test-Simulation vor Studienstart. Der MLOps Engineer hatte das zuletzt erwähnt. Der QA Tester hatte genickt. Der Security Engineer hatte still auf "Cross-User-Leak" hingewiesen. Heute wurde es ernst.

> **Koordinator:** *"Zehn Personas. Pre-Survey → 10 Sessions × Opening/Austausch/Closing → Post-Survey. Direkt gegen den Service-Layer, kein HTTP-Overhead."*

> **QA Tester:** *"Schön. Und wenn KAIA bei Persona 3 anfängt zu halluzinieren?"*

> **AI Engineer:** *"Deswegen bauen wir das ja."*

Die zehn Personas entstehen. P01\_Schweiger — antwortet einsilbig, testet KAIAs Geduld. P02\_Überforderte — kippt sofort in emotionalen Modus. P03\_Widerständige — stellt alles in Frage bevor er irgendwas sagt. P04\_Perfektionistin — setzt sich unmöglich hohe Ziele. P05\_Prokrastinator — jede Session beginnt mit "ich habe eigentlich keine Zeit". P06\_Philosophin — weicht in abstrakte Theorie aus. P07\_Selbstkritiker — findet jedes Selbstgespräch entwertend. P08\_Schnellstarter — überspringt jeden Reflexionsschritt. P09\_Krisen-Anker — formuliert Sätze nahe dem Crisis-Detection-Radar. P10\_EwigÜberforderte — jede Session neu, kein Fortschritt sichtbar.

Der Compliance Officer liest P09 zweimal.

> *"Crisis-Detection wird protokolliert? Jeder Treffer gespeichert?"*

> **AI Engineer:** *"Ja. `is_simulation`-Flag in der Session. Alles auswertbar."*

> *"Gut. Dann können wir im Ethikvotum zeigen, dass der Filter funktioniert."*

**Mittag — Der Runner entsteht**

`apps/api/app/domains/simulation/runner.py`. Dreihundert Zeilen. Der AI Engineer tippt. Der Architekt liest mit und sagt nichts, was bedeutet: es ist okay.

Der Runner macht die komplette Studien-Journey: Pre-MSLQ, Pre-GSE, dann für jede Session ein Opening, drei synthetische Nachrichten, ein Closing. Danach Post-MSLQ, Post-GSE. Alles direkt gegen die Service-Layer, keine HTTP-Calls. Background-Tasks werden synchron geflust.

> **MLOps Engineer:** *"Token-Kosten für einen kompletten Durchlauf?"*

> **AI Engineer:** *"Zehn Personas × 10 Sessions × ~4 Claude-Calls = 400 LLM-Calls. Geschätzt $8–12."*

> **MLOps Engineer:** *"Unter 15. Ich hätte Nein gesagt bei über 15."*

**Nachmittag — Admin-Seite, weil alles eine Admin-Seite braucht**

`/admin/simulation`. Start-Button. Live-Persona-Progress-Grid: zehn Kacheln, jede zeigt welche Session gerade läuft. Ausklappbare Transkripte. Pre/Post-Survey-Scores nebeneinander.

> **UX Designerin:** *"Mobile-first."*

> **Koordinator:** *"Das ist eine Admin-Seite. Die öffnet niemand auf dem Handy."*

> **UX Designerin:** *"Das sagst du bei jeder Admin-Seite."*

Sie hat, statistisch betrachtet, immer Recht.

**Abend — Kein Commit heute. Kommt gleich.**

Der Code liegt lokal. Läuft lokal. Zwei der zehn Personas haben KAIA schon zu einer Metakognitions-Frage getriggert. P09 hat die Crisis-Detection zweimal aktiviert — der statische Hinweis erschien korrekt, kein LLM-Call danach.

> **Security Engineer:** *"Das war der Test den wir brauchten."*

> **QA Tester:** *"Ich will das in CI. Jeden Morgen. Mit Report."*

> **Koordinator:** *"Eins nach dem anderen."*

Der Commit kommt gleich. Zuerst dieses Protokoll. Dann der Code. Das Team ist erschöpft auf eine produktive Art.

---

**Was heute gebaut wurde:**
Simulation-Runner (`apps/api/app/domains/simulation/runner.py`) mit 10 Crash-Personas, Admin-Endpoints POST/GET simulation, Admin-Frontend `/admin/simulation` mit Live-Grid und Transkripten.

**Commits:** — (folgen gleich)

**Kosten heute:** ca. $10–15 Claude Code (viele Agent-Runs + 400 Test-LLM-Calls) · €4.39/Mo Hetzner

**Morgen:** Commit pushen, Simulation auf dem Server laufen lassen, Ergebnisse auswerten.

---

## 2026-06-22 — "Survey crasht, Lernthema landet nirgends, und die Masterthesis rendert falsch"

*Protokolliert vom Koordinator. Mit Kopfschütteln und schließlich Erleichterung.*

---

Manche Tage beginnen mit einem Bug-Report und enden mit fünf Commits, die alle das Wort "fix" im Betreff tragen. Das ist kein guter Zeichens. Das ist ein ehrliches Zeichen.

**Morgens — "Der Survey gibt 500 zurück"**

> **QA Tester:** *"POST /survey/submit — 500 Internal Server Error. Immer. Bei jedem User."*

Der AI Engineer öffnet den Request-Body. Dann den Handler. Dann die Augen etwas weiter als normal.

> *"Der Parameter heißt in der Route `measurement_type`. Wir schicken `mt`. Das war schon immer so."*

> **QA Tester:** *"Seit wann?"*

> *"Seit dem ersten Commit des Survey-Handlers."*

Stille.

> **Compliance Officer:** *"Dann hat niemand den Survey jemals erfolgreich submitted."*

> **Koordinator:** *"Außer in den Unit-Tests, wo wir den Parameter direkt gesetzt haben."*

Das ist der Unterschied zwischen Unit-Tests und Integration-Tests. Heute sehr deutlich sichtbar.

Fix: Parametername korrigiert, Fisher-Yates-Randomisierung für Items, Fortschrittsleiste, Auswertungsansicht nach Abschluss. Der Psychologe nickt bei der Randomisierung — Reihenfolge-Effekte bei Fragebögen sind real.

**Mittag — "KAIA kennt das Lernthema nicht"**

Die UX Designerin testet die Journey-Seite. Gibt ihr Lernthema ein: "Präsentationen halten". Klickt weiter. Startet den Chat.

KAIA fragt: *"Was beschäftigt dich gerade?"*

> **UX Designerin:** *"Sie hat es vergessen."*

> **AI Engineer:** *"Sie hat es nie gewusst."*

Der Code: `user.learning_topic` wird in der DB gespeichert. Korrekt. Dann im `PromptContext` befüllt? Nein. `context.learning_topic` wird nie aus dem User-Objekt gelesen. Alle vier Stream-Funktionen (`stream_opening`, `stream_chat`, `stream_closing`, `stream_meta_question`) geben einen leeren String weiter.

> **Psychologe:** *"Das ist nicht nur ein technischer Bug. Das untergräbt das gesamte erste-Session-Design. KAIAs Lernziel-Flow setzt voraus, dass sie das Thema kennt."*

Er hat Recht. Das ist ein kritischer Fix. DB-Migration, PromptContext-Update, alle vier Funktionen — eine Stunde.

**Nachmittag — Die Masterthesis rendert auf dem Client**

170 Kilobyte Markdown. Im Browser. Jedes Kapitel. Bei jedem Navigation-Klick neu geparst.

> **Architekt:** *"Das ist kein Frontend-Muster. Das ist eine Strafe."*

Server-seitiges Rendering: Markdown → HTML auf dem Server, CSS-Toggle statt React-Reconciliation. Der Browser bekommt fertiges HTML. Die Navigations-Freeze-Bugs lösen sich auf wie Nebel.

**Abend — Interpretation und Farbe**

Der letzte Commit des Tages: Auswertungs-Interpretation mit Farbkodierung. GSE-Normdaten richtig eingebaut (M=2,97, Schwarzer & Jerusalem 1995). ITC-Richtlinien. Der Psychologe liest jeden Satz der Interpretationstexte.

> *"Das ist korrekt. 'Mittel' ist 2,97 ± 0,6 SD. 'Hoch' beginnt ab 3,5. Das steht so da. Gut."*

> **Koordinator:** *"Lobst du uns gerade?"*

> *"Ich stelle fest, dass es korrekt ist. Das ist nicht dasselbe."*

---

**Was heute gebaut wurde:**
Survey-Fix (Parametername + Randomisierung), Masterthesis SSR, Lernthema-Fix (kritisch), Auswertungsinterpretation mit Normdaten, Chat-UX (Session-beenden-Button + Feedback-Tooltips).

**Commits:** `2184a31` · `bfd5a6d` · `744ce47` · `cd698a5` · `fc78293`

**Kosten heute:** ca. $6–10 Claude Code · €4.39/Mo Hetzner

**Morgen:** Simulation-Runner — die zehn Crash-Personas warten.

---

## 2026-06-21 — "Der Masterthesis-Freeze-Marathon und der Tag der zehn Fixes"

*Protokolliert vom Koordinator. Mit kaffeebedingter Ausdauer bis in den Abend.*

---

Manche Features haben einen einfachen Kern und eine komplizierte Oberfläche. Die Masterthesis-Navigation hatte einen einfachen Kern (zeige Kapitel X, blende Y aus) und dann neun separate Freeze-Bugs, von denen jeder Fix einen neuen aufdeckte.

Das Team nennt das jetzt "Hydrations-Archäologie".

**Morgens — Journey-Infrastruktur: Das große Feature**

Der AI Engineer hatte seit Tagen den Backlog-Eintrag "Journey-Infrastruktur" vor sich. 6 Stunden Aufwand, schätzte er. Er hatte Recht.

Pre-MSLQ (30 Items, Pintrich et al. 1991). Pre-GSE (10 Items, Schwarzer & Jerusalem 1995). Dann Chat-Gating: wer die Fragebögen nicht abgeschlossen hat, bekommt HTTP 403. Bis zu 10 Sessions. Post-MSLQ und Post-GSE danach. Eine vollständige Studien-Journey in Code.

> **Psychologe:** *"MSLQ Subskalen korrekt implementiert? Intrinsische Zielorientierung, Aufgabenwert, Selbstwirksamkeit, Metakognitive Selbstregulation?"*

> **AI Engineer:** *"Alle vier. Mit Items und Gewichtungen aus Pintrich et al. 1991."*

> **Psychologe:** *"Gut. Dann frage ich nicht weiter."*

Das ist das psychologische Äquivalent eines Highfives.

Admin-Instrumente-Seite: alle 30 Items sichtbar, Auswertungslogik dokumentiert, APA-Zitate für den Thesis-Anhang. `v0.8.0`.

**Mittag — Die Masterthesis fängt an zu frieren**

Dann die Masterthesis. Die erste Navigation: funktioniert. Zweite Navigation: React hängt. Dritter Klick: nichts mehr.

> **Koordinator:** *"Was passiert da?"*

> **AI Engineer:** *"State-Update in einem Rendering-Cycle. Der Component wird neu gemountet statt aktualisiert."*

Fix 1: `useMemo`. Fix 2: `React.memo` auf `ChapterContent`. Fix 3: lazy-mount im DOM. Fix 4: `startTransition`. Fix 5: alle Kapitel einmalig rendern, CSS-Toggle statt Unmount/Mount.

Fünf Fixes. Alle einzeln committ. Alle notwendig. Der Architekt liest jeden Commit.

> *"Das ist das, was passiert wenn man Markdown-Rendering und Navigation-State in denselben Render-Cycle steckt. Das nächste Mal: Architektur-Review vor Implementierung."*

> **Koordinator:** *"Das war ein Architecture-Review. Er hat es gerade reviewed."*

**Nachmittag — Journey-Auth und Survey-401**

> **QA Tester:** *"Journey-Testseite gibt 401."*

Zwei Fixes: Admin-Test-Token (wie im Chat-Test), `apiFetch`-Import der nicht existiert. Dann Survey-Auth: Auth-Header fehlte im Formular-Submit.

> **Security Engineer:** *"Ich sage immer: Auth-Flow zuerst testen."*

> **QA Tester:** *"Ich habe ihn sofort getestet."*

> **Security Engineer:** *"Das war kein Vorwurf."*

> **QA Tester:** *"Das klang wie ein Vorwurf."*

Der Koordinator beendet das diplomatisch und schreibt stattdessen den nächsten Commit.

---

**Was heute gebaut wurde:**
Journey-Infrastruktur (MSLQ/GSE Pre/Post + Chat-Gating), Admin Instrumente-Seite, Admin Journey-Test-Seite, `learning_topic`-Feld, Masterthesis-Freeze behoben (5 separate Fixes), Journey-Auth-Fix.

**Commits:** `c7af4dd` · `e7fda9f` · `7466be6` · `f6a5407` · `83a8ce3` · `8c0628a` · `c4a71e6` · `41e125b` · `3baa6a5` · `215187a`

**Kosten heute:** ca. $15–20 Claude Code (langer Tag, viele Iterations) · €4.39/Mo Hetzner

**Morgen:** Survey-Bugs die bei der Journey-Integration auftauchen.

---

## 2026-06-20 — "Zwei Commits, eine Verbotsliste und ein Race-Condition-Geist"

*Protokolliert vom Koordinator. Mit aufgeräumtem Terminal und wenig Drama.*

---

Nach dem Marathon der letzten Wochen war heute vergleichsweise ruhig. Zwei Commits. Aber beide mit Charakter.

Der erste betraf einen Bug, der erst durch den Von-vorne-Button vom 14. sichtbar wurde: Race Condition beim Reset. `stream_opening()` versuchte eine Session zu beschreiben, die zwischen dem Delete-Request und dem nächsten Öffnen kurz verschwand. `IntegrityError`. Der AI Engineer fing den Fehler ab und ließ `stream_opening()` in diesem Fall schweigend weitermachen.

> *"Das ist kein schöner Fix. Aber es ist der richtige. Die Session ist weg — wir loggen das und gehen weiter."*

Der Architekt las es. Schwieg. Das zählt als Zustimmung.

Dann die Verbotsliste: Affekt-Spiegeln-Muster. Der Didaktiker hatte letzte Woche auf einen Satz hingewiesen, den KAIA gelegentlich produzierte:

> *"Das klingt, als würdest du dich gerade überfordert fühlen."*

> **Didaktiker:** *"Das ist Empathie-Performance. Kein Lernimpuls. KAIA spiegelt den Affekt — statt ihn zu nutzen als Einstieg in einen Lernschritt. Das ist Therapie-Gestus."*

Verboten. Explizit. Mit Beispielen. Außerdem: Strukturprinzip für emotionale Einstiege — wenn der User mit einem Affekt-Satz beginnt, folgt KAIA nicht in den emotionalen Frame, sondern baut eine Brücke zum Lernthema.

> **Compliance Officer:** *"Das reduziert das Art.-9-Risiko. Wenn KAIA keine Affektzustände beschreibt, ist es schwieriger zu argumentieren, dass sie Gesundheitsdaten verarbeitet."*

> **Koordinator:** *"Das war heute der schnellste DSGVO-Bonus aller Zeiten."*

Und dann der zweite Verbotslisten-Commit: menschliche Gesprächsgeschichte. *"Das kenne ich aus vielen Gesprächen."* *"Das höre ich oft."* Verboten. Fabricated Social Proof. KAIA hat keine Gesprächsgeschichte. Sie hat ein Gedächtnis für diese Session und diese Nutzerin. Mehr nicht.

> **AI Engineer:** *"Das war eigentlich offensichtlich."*

> **Koordinator:** *"Ja. Und trotzdem war es im Prompt."*

---

**Was heute gebaut wurde:**
FK-Violation-Fix beim Reset, Affekt-Strukturprinzip im Prompt, Erfahrungsvergleiche verboten.

**Commits:** `e9bdea1` · `5b2608c`

**Kosten heute:** ca. $2–4 Claude Code · €4.39/Mo Hetzner

**Morgen:** Die Lerndesign-Seite und der große MSLQ-Journey-Block.

---

## 2026-06-19 — "Session 1 bekommt ihren wissenschaftlichen Boden"

*Protokolliert vom Koordinator. Mit sechs Commits und einem Didaktiker der das erste Mal nickt.*

---

Heute war der Tag, an dem Session 1 aufgehört hat, eine Frage zu sein, und angefangen hat, ein Lerndesign zu sein. Sechs Commits. Alle prompt-seitig oder thesis-seitig. Der AI Engineer hatte die Umsetzungslust, der Didaktiker hatte die Theorie.

Das Fundament: Knowles' *evidence of accomplishment* (1975), Hattie & Timperley (2007, d=0.54), Gollwitzer & Sheeran (2006, d=.65). KAIAs erste Session hat jetzt einen Lernziel-Flow mit fünf Schritten: offene Einladung → Thema + Motiv → Bestätigung → Lernintention → erster Schritt mit Evidenzanker.

> **Didaktiker:** *"Endlich. Das ist das erste Mal, dass Session 1 didaktisch begründet ist und nicht nur nett."*

Das war ein Lob. Von Steinert. Der Koordinator notiert das für die Statistik.

Dann die Verbotslisten. Der AI Engineer hatte die Commit-Botschaft schon bereit: "Therapiesprache aus KAIA-Prompt verbannt". *"Muss nichts Großes sein."* *"Kein Druck."* *"Das ist okay so."* Alle weg. Dann: Innenraum-Muster. *"Was taucht auf."* *"Spürst du."* Alle weg.

> **Psychologe:** *"Diese Formulierungen kommen aus der Gesprächspsychotherapie. Sie sind im Lernkontext fehl am Platz — sie erzeugen Erwartungen die KAIA nicht erfüllen kann und darf."*

> **Compliance Officer:** *"Und sie erhöhen das Risiko, dass der Ethiker das als therapeutisches System einstuft."*

> **Didaktiker:** *"Und sie funktionieren pädagogisch nicht. Kein Transfer. Kein Lernschritt."*

Drei verschiedene Disziplinen. Dieselbe Antwort. Der Koordinator committete ohne weitere Diskussion.

Sechs Commits, sechs kleinere aber fundierte Verbesserungen. Der erste Tag seit einer Woche ohne Infrastructure-Bugs.

---

**Was heute gebaut wurde:**
Session-1-Lernziel-Flow (Knowles/Hattie), Therapiesprache verbannt, Innenraum-Muster verboten, Affekt-Pivot-Regel, Thesis Kap3+6 aktualisiert.

**Commits:** `2dda945` · `0c62cf6` · `a9f24ed` · `6a9ee28` · `75a8fe5` · `a5d8bb7`

**Kosten heute:** ca. $4–7 Claude Code · €4.39/Mo Hetzner

**Morgen:** Prompt-Verbotslisten finalisieren, FK-Fix.

---

## 2026-06-18 — "Der Team-Computer ruht"

*Protokolliert vom Koordinator. Sehr kurz.*

---

Kein Commit. Kein Meeting. Kein Agentenruf.

Dagmar hat das Wochenende genutzt, um nicht zu coden. Das ist wissenschaftlich gesehen eine valide Methode zur Konsolidierung kognitiver Verarbeitungsprozesse. Der Psychologe würde das genau so formulieren, wenn er gerade da wäre.

Er ist nicht da. Auch er ruht.

Der QA Tester hat möglicherweise im Hintergrund eine Testliste geschrieben. Er gibt das nicht zu.

Der AI Engineer hat über Simulation nachgedacht. Er gibt das nicht zu.

Das Wochenende ist legitim.

---

**Was heute gebaut wurde:**
Nichts. Bewusst.

**Commits:** —

**Kosten heute:** €4.39/Mo Hetzner (läuft immer)

**Morgen:** Session-1-Design und Prompt-Arbeit.

---

## 2026-06-17 — "Stille vor dem Sturm"

*Protokolliert vom Koordinator. Noch kürzer.*

---

Dienstag. Auch kein Commit. Das Wochenende hat früher angefangen als geplant, weil das Team nach KW24 erschöpft war. 16 Commits am 9. Juni, dann STORY-001, dann EMA-Buttons, dann Coverage-Gate. Das war eine dichte Woche.

Der Koordinator hat einen neuen To-do-Stack für KW25 angelegt. Sieben Punkte. Alle mit Haken die noch nicht gesetzt sind.

> **Koordinator (zu sich selbst):** *"Morgen. Morgen fängt KW25 an."*

Niemand widerspricht. Weil niemand da ist.

---

**Was heute gebaut wurde:**
Nichts.

**Commits:** —

**Kosten heute:** €4.39/Mo Hetzner

**Morgen:** Prompt-Arbeit ab Donnerstag 19. Juni.

---

## 2026-06-16 — "Montag zwischen den Wochen"

*Protokolliert vom Koordinator.*

---

Nach der Wochenbilanz am Samstag (KW24) und dem Von-vorne-Button am Freitag: Montag als Luft holen. Kein Commit. Die Wochenbilanz war am 13. der letzte produktive Commit, dann der Von-vorne-Button am 14. Jetzt drei Tage ohne Code.

Das ist selten und richtig. Nach 16 Commits an einem einzigen Tag (dem 9. Juni) und dem EMA-Marathon hat das Gehirn Pause verdient.

> **Didaktiker:** *"Inkubationszeit ist eine bekannte Phase kreativer Problemlösung. Ich schreibe das nicht um euch zu beruhigen. Ich schreibe es weil es stimmt."*

---

**Was heute gebaut wurde:**
Nichts.

**Commits:** —

**Kosten heute:** €4.39/Mo Hetzner

**Morgen:** Immer noch Pause.

---

## 2026-06-15 — "Sonntag"

*Protokolliert vom Koordinator. Ein Satz reicht.*

---

Sonntag. Kein Code. Die Fragebögen für die Pilotstudie liegen bereit. Das Ethikvotum wartet auf den Antragstermin. Der Psychologe liest H1–H3 und hat keine Einwände mehr.

---

**Was heute gebaut wurde:**
Nichts.

**Commits:** —

**Kosten heute:** €4.39/Mo Hetzner

**Morgen:** Von-vorne-Button.

---

## 2026-06-14 — "Trash-Icon, Zweifach-Bestätigung und der sauberste Commit der Woche"

*Protokolliert vom Koordinator. Mit Genugtuung.*

---

Ein Feature, ein Commit, zwanzig Minuten. Das nennt man chirurgisches Arbeiten.

Der Von-vorne-Button im Admin-Chat-Test: Trash-Icon, erster Klick zeigt roten Bestätigungsbutton ("Sicher löschen?"), zweiter Klick löscht alle Sessions, Nachrichten und Memory-Chunks des `admin_test`-Users. Nächste Session startet als Session 1 — frische Eröffnungsfrage, leeres Gedächtnis.

> **QA Tester:** *"Zweistufige Bestätigung. Gut. Ich hatte Angst, dass wir einfach einen roten Button bauen."*

> **UX Designerin:** *"Ein unbestätigter Lösch-Button in einer Admin-Seite wäre ein UX-Vergehen. Das war nie eine Option."*

> **Security Engineer:** *"Und er ruft die richtigen Endpunkte auf? Nicht direkt die DB?"*

> **AI Engineer:** *"Service-Layer. Immer."*

Security Engineer nickt. Kein weiterer Kommentar. Das ist Respekt.

Der Commit ist ein Musterbeispiel für Regel 3 der Coding-Guidelines: "Chirurgische Änderungen. Nur anfassen was zwingend nötig ist." Zwanzig Minuten. Eine Datei im Backend (neuer Endpunkt), eine Datei im Frontend (Button-Logic). Fertig.

---

**Was heute gebaut wurde:**
Von-vorne-Button im Admin-Chat-Test mit zweistufiger Bestätigung und vollständigem User-Reset.

**Commits:** `eb1525b`

**Kosten heute:** ca. $1–2 Claude Code · €4.39/Mo Hetzner

**Morgen:** Wochenbilanz KW24.

---

## 2026-06-13 — "Samstag: Das Team schreibt über sich selbst"

*Protokolliert vom Koordinator. Mit leicht verlegenem Lächeln.*

---

Wochenbilanz KW24 (06.06.–12.06.2026). Ein Commit. Dreißig Minuten. Der Koordinator schreibt über das Team. Das Team liest mit.

Die Woche in Zahlen: Chat Core live (16 Commits am 9.), STORY-001 Closure-Phase, STORY-002 EMA-Buttons, Coverage-Gate auf 70% gebracht, Funken-Feature-Spec, Data Scientist ongeboardet. Fünf Konflikte protokolliert (Didaktiker vs. AI Engineer über Bloom-Sequenz, Psychologe vs. Compliance über Art.-9-Grauzone, QA Tester vs. alle über Coverage-Schwelle). Alle gelöst.

> **Koordinator:** *"Ich schreibe jetzt die Wochenbilanz."*

> **Didaktiker:** *"Ich möchte als 'hatte Recht über die Bloom-Sequenz' zitiert werden."*

> **Koordinator:** *"Das steht drin."*

> **Didaktiker:** *"Gut."*

Der Commit heißt `138cde8`. `docs: Wochenbilanz KW24`. Konventional. Ehrlich.

---

**Was heute gebaut wurde:**
Wochenbilanz KW24 als Commit.

**Commits:** `138cde8`

**Kosten heute:** ca. $0.50 Claude Code · €4.39/Mo Hetzner

**Morgen:** Von-vorne-Button.

---

## 2026-06-12 — "EMA-Buttons live, Coverage endlich grün, und ein neues Wort namens Metakognition"

*Protokolliert vom Koordinator. Der Psychologe ist heute zu hundert Prozent ausgelastet.*

---

Drei Commits. Drei unterschiedliche Charaktere. Alle notwendig.

**Der erste — EMA-Buttons**

> **Psychologe:** *"Ecological Momentary Assessment. Csikszentmihalyi & Larson, 1987. Das haben wir am 10. besprochen. Jetzt bauen wir es."*

Vier Buttons. "Muss ich weiterdenken" — Transfer-Marker, wird als Cross-Session-Anker gespeichert. "Wow — das trifft was" — passives Engagement-Signal, kein LLM-Eingriff. "Ich hänge gerade" und "Das verstehe ich noch nicht" — aktiv, triggern eine Metakognitions-Frage von KAIA.

> **Didaktiker:** *"Metakognitions-Frage. Zimmermann 2000. Selbstreguliertes Lernen. Das ist nicht optional, das ist das Herzstück."*

> **AI Engineer:** *"stream_meta_question() — fünfzig Zeilen. Läuft."*

Der Compliance Officer öffnet seine Notizen.

> *"session_feedback-Tabelle. Alembic-Migration. Art. 9 DSGVO — ich schreibe ein kurzes Memo. Nochmal."*

> **Alle:** *"Natürlich tust du das."*

**Der zweite — Coverage**

> **QA Tester:** *"59 Prozent. Schwelle 70. Das CI ist rot."*

Der AI Engineer schreibt 45 Tests in einer Session. Chat-Repository, Schemas, SSE-Helpers, Thinking-Strip, stream_closing, stream_meta_question mit gemocktem Anthropic-Client. Debug-Mode, LLM-Error, malformed JSON, leerer Content. Dann 6 Observability-Tests.

> **QA Tester:** *"70.3 Prozent. CI ist grün."*

Niemand sagt etwas. Das Schweigen ist zufrieden.

**Der dritte — Dokumentation**

> **MLOps Engineer:** *"AUSWERTUNG.md: SQL für Cross-Session-Gedächtnis fehlt. Wenn die Studie läuft und jemand fragt 'wie sehe ich first_step-Persistenz über alle Sessions' — haben wir keine Antwort."*

Jetzt haben wir eine. SQL drin, UX-Spec für FUNKEN-Feature, gitignore-Fix. Ordnung geschaffen.

---

**Was heute gebaut wurde:**
EMA-Feedback-Buttons (4 Typen, passive + aktive, session_feedback-Tabelle), Coverage 59%→70% (45 neue Tests), Dokumentationspflege.

**Commits:** `4bddc2b` · `7e1f83b` · `06d6a85`

**Kosten heute:** ca. $8–12 Claude Code · €4.39/Mo Hetzner

**Morgen:** Wochenbilanz KW24 und Verschnaufen.

---

## 2026-06-11 — "Sonntag nach dem Chat-Core-Sprint"

*Protokolliert vom Koordinator. Sehr kurz, sehr ehrlich.*

---

Gestern: 16 Commits. Heute: kein einziger.

Das ist kein Versagen. Das ist Physiologie. Der AI Engineer hat 3 Stunden Chat-Core-Backend und 2 Stunden Frontend in einem Tag geschrieben. KAIA streamt zum ersten Mal echte Antworten. Das war genug.

Die Psychologen würden Peak-End-Rule zitieren. Das Ende von gestern war das Beste. Heute ist die Ruhe danach.

> **Koordinator (Notiz):** *"Team-Morale: hoch. Ausgeruht: nein. Bereit für morgen: ja."*

---

**Was heute gebaut wurde:**
Nichts.

**Commits:** —

**Kosten heute:** €4.39/Mo Hetzner

**Morgen:** EMA-Buttons, Coverage-Gate.

---

## 2026-06-10 — "Kein einziger Commit. Und trotzdem der produktivste Tag seit Wochen."

*Protokolliert vom Koordinator. Mit sehr vielen unerwünschten Einwürfen von: Didaktiker (hatte Recht, wieder), Psychologe (Flow, immer Flow), UX Designerin (kein Modal, niemals), AI Engineer (denkt schon an Check 11), Compliance Officer (Art. 9 Grauzone, natürlich).*

---

Es gibt Tage, an denen man nichts deployt. Kein Container läuft neu. Kein grüner Haken in GitHub Actions. Der AI Engineer sieht kein einziges Token durch seine Streaming-Pipeline fließen. Und trotzdem — am Ende des Tages liegen 8 aktualisierte Dokumente, 2 neue Dateien, 15 neue Backlog-Issues und ein Lerndesign-Fundament auf dem Tisch, das endlich nicht mehr wackelt.

Heute war der Tag, an dem KAIA aufgehört hat, didaktisches Hörensagen zu sein.

**Morgen — "Drei Sessions sind lächerlich"**

Es begann mit einem PDF. *Lerntheorien.* Der Didaktiker öffnete es, las drei Seiten, und dann:

> **Didaktiker:** *"Das 7-Phasen-Modell hat einen strukturellen Fehler. Die Challenge-Phase steht vor der Konsolidierung. Das ist Kolb auf den Kopf gestellt. Erfahrung → Reflexion → Konzeptbildung → Experiment — in dieser Reihenfolge. Nicht andersherum."*

Der AI Engineer: *"Also alles nochmal?"*

Der Didaktiker: *"Nur die Reihenfolge. Aber ja."*

Dann, fast beiläufig, die zweite Bombe:

> *"Drei Sessions. In drei Sessions wird niemand Bloom 5 erreichen. Das ist pädagogischer Optimismus, der ans Wahnhafte grenzt. Zehn. Zehn Sessions, wenn ihr das ernst meint."*

Dagmar: *"Zehn."*

Der Psychologe nickt still. Er hatte das schon länger gedacht, aber gewartet, ob es jemand ausspricht.

**Vormittag — Der Bloom-Aufbau**

Was danach entstand, war eigentlich das, was von Anfang an hätte da sein sollen: ein echter Lernbogen über 10 Sessions. Sessions 1–2: Terrain kartieren, Vorannahmen explizit machen. Sessions 3–5: Transfer in den Alltag. Sessions 6–8 — und hier wurde es interessant:

> **Didaktiker:** *"In Session 6 fängt KAIA an, Widersprüche anzusprechen. 'In Session 3 sagtest du X, jetzt sagst du Y — was hat sich verändert?' Das ist nicht Repetition. Das ist das Gegenteil von Repetition."*

Der Koordinator notiert. Das ist das Gegenteil von Repetition.

Session 10: "Wie wirst du ohne mich weiterlernen?" — und dann Dagmars Session-1-Antworten neben Session-9-Antworten gestellt. Sichtbar gemachtes Lernen. Der Psychologe lächelte. Er mag Episodisches Gedächtnis.

**Mittag — Die fünf Verbote**

Dann kam der Moment, der dem Compliance Officer etwas zu lange dauerte und dem AI Engineer sofort klar war.

> **Didaktiker:** *"KAIA bewertet nicht. Niemals. Kein Lob. Keine Prognosen. Keine Ratschläge. Kein 'Das ist falsch'. Und vor allem: keine Typisierungen. Wer einem Erwachsenen sagt 'du bist ein visueller Lerntyp' und das ernst meint, hat die letzte 30 Jahre Lernforschung ignoriert."*

Fünf Sprachregeln. Schriftlich. In die Thesis. In den Prompt. Für immer.

> **AI Engineer:** *"Das kann ich direkt als Prompt-Constraint umsetzen. Mit Beispielen. Few-Shot, anti-Beispiele."*
> **Didaktiker:** *"Gut. Dann tu das."*

**Nachmittag — Flow und ein Button der nicht nervt**

Der Psychologe übernahm für die Mittagsrunde. Thema: Flow nach Csikszentmihalyi. Challenge-Skill-Balance. Warum Dagmar nach 3 Sessions immer gelangweilt war.

> **Psychologe:** *"Kein sichtbarer Bogen. Jede Session fühlt sich an wie die erste. Das ist kein KAIA-Problem — das ist ein Gedächtnis-Problem. Wenn Cross-Session-Memory läuft und der Bloom-Bogen greift, verschwindet die Langeweile. Nicht sofort. Aber sie verschwindet."*

Dann die FKS: Flow-Kurzskala. 10 Items. Nach Session 2, 5, 8, 10. Die UX Designerin war still. Das war entweder Zustimmung oder sie dachte schon an das nächste UI-Problem.

Es war das nächste UI-Problem.

> **UX Designerin:** *"Der Session-Abschluss-Button. Kein Modal. Keine Overlays. KAIA antwortet als letzte Chat-Bubble. Darunter zwei Aktionen: [Antworten] und [Jetzt wirklich beenden]. Fertig."*
> **Didaktiker:** *"Gagné's 9. Unterrichtsereignis. Transfer-Vorbereitung. Zwei Exchanges, nicht mehr. Dann ist Schluss."*
> **Psychologe:** *"Peak-End-Rule. Kahneman. Das Ende der Session prägt die Gesamterinnerung überproportional. Ein gutes Ende ist kein Nice-to-have."*

Der Koordinator: *"Also machen wir das."*

Alle drei gleichzeitig: *"Ja."*

**Später Nachmittag — Vier Buttons die Wissenschaft haben**

Dagmar: *"Und wenn mir während der Session langweilig wird? Könnte da nicht irgendwas sein, das ich drücken kann?"*

Kurze Stille.

> **Didaktiker:** *"'Mir ist langweilig' ist ein Frustrationsventil, kein metakognitives Signal. Umformulieren: 'Ich hänge gerade' und 'Das verstehe ich noch nicht'. Das ist echte Selbstregulation nach Zimmermann."*
> **Psychologe:** *"Affect Labeling. Lieberman et al. 2007. Benennen eines negativen Affekts reduziert seine Intensität. Neuroimaging-Befund. Der Button hat eine Funktion."*
> **AI Engineer:** *"Und 'Muss ich weiterdenken' wird als Cross-Session-Anker gespeichert. Session 5: 'Du hast letzte Woche markiert, dass X dich beschäftigt — was ist daraus geworden?' Das ist eleganter als alles was wir sonst haben."*

Der Compliance Officer: *"Ecological Momentary Assessment fällt möglicherweise unter Art. 9 DSGVO. Grauzone. Ich schreibe ein Gutachten."*

Alle: *"Natürlich tust du das."*

**Abend — Die Dokumentenschlacht**

Was dann folgte war keine Programmierstunde, aber fast genauso erschöpfend: 5 Agenten, 7 Dateien, parallel. Das HTML-Referenzdokument wuchs auf 1.600 Zeilen. Kap3, Kap4, Kap6, Studienprotokoll — alle aktualisiert. 15 neue Backlog-Issues. Eine Release Note für einen Tag ohne Code.

Der AI Engineer sah das leere Terminal und seufzte.

> *"Morgen. Morgen schreibe ich tatsächlich Code."*
> **Koordinator:** *"Das sagst du jeden Abend."*
> *"Morgen meine ich es ernst."*

---

**Was heute gebaut wurde:**
Kein Code. Dafür: vollständiges Lerndesign-Fundament (10-Session-Design, Bloom-Progression, Flow-Theorie, 5 Sprachregeln, Session-Abschluss-Feature, In-Session-Feedback-Buttons), alle Thesis-Kapitel aktualisiert, HTML-Referenzdokument v1.1, Feature Spec Chat Core V2, Compliance-Gutachten.

**Commits:** *(folgen gleich — war ein Theorie-Tag)*

**Abend-Nachtrag:** Drei Commits doch noch — STORY-001 Closure-Phase (`321a4cb`), extract_session_summary (`33e07a2`), mypy-Fixes (`cdc276b`). Das Team hatte früher aufgehört zu reden als zu coden.

**Kosten heute:** ca. $12–15 Claude Code (5 parallele Agent-Runs) · €4.39/Mo Hetzner

**Morgen:** Der AI Engineer schreibt endlich Code. session_summary-Erweiterung, PromptContext, Closing-Endpoint. Das Fundament steht. Jetzt kommt das Haus.

---

## 2026-06-09 — "16 Commits. KAIA spricht zum ersten Mal."

*Protokolliert vom Koordinator. Der AI Engineer hat heute ausnahmsweise aufgehört vorauszudenken und einfach gebaut.*

---

Es gibt Tage, an denen passieren Dinge. Und dann gibt es Tage wie diesen, an denen in sechzehn Commits eine komplette Chat-Infrastruktur aus dem Boden wächst, SSE streamt, Claude antwortet, und KAIA zum ersten Mal selbst das Gespräch eröffnet.

Der AI Engineer war um 8 Uhr morgens schon am Tippen. Das Team wusste: heute ist der Tag.

**Morgens — Das Backend entsteht**

FastAPI SSE-Endpoint. Claude-Integration. `claude-sonnet-4-5`, versioniert, model-pinned wie es die Charta verlangt. Thinking-Strip: die internen `<thinking>`-Blöcke werden im Backend entfernt, bevor ein einziges Token den Client erreicht. Conversation-History-Builder.

> **Security Engineer:** *"Der thinking-Strip ist kein Nice-to-have. Das ist eine Anforderung. KAIA's interne Klassifikation (Lazarus-Check, Fragetyp, Crisis-Einschätzung) darf niemals dem User sichtbar sein."*

> **AI Engineer:** *"Ist drin. Regex-basiert. Teste ich gleich."*

Drei Stunden Backend. Dann: drei Bugs. `detect_crisis` falsch importiert. ORM-Models nicht registriert. Duplikater Index in der Migration.

> **QA Tester:** *"Alle drei in einer Stunde gefunden. Das ist ein neuer Rekord für 'gefundene Bugs pro frischem Feature'."*

> **AI Engineer:** *"Das ist kein Rekord, auf den ich stolz bin."*

**Mittag — Das Frontend**

SSE-Client. EventSource. Drei Charaktere: warm, challenging, wild. Die UX Designerin hatte das schon skizziert. Der AI Engineer implementierte es.

> **UX Designerin:** *"Drei Charaktere auf einer Auswahl-Seite. Klar beschriftet. Kein Modal. Kein Onboarding-Flow."*

> **AI Engineer:** *"Gemacht."*

> **UX Designerin:** *"Danke."*

Das war das kürzeste UX-Gespräch in der Geschichte dieses Teams.

Zwei Stunden Frontend. Dann: der erste echte Chat. KAIA antwortet. Die Tokens kommen als Stream. Die Bubble wächst.

**Nachmittag — Das Admin-Panel**

Der Admin-Chat-Test war die Idee des Koordinators: ein JWT-gesicherter Testbereich, damit Dagmar echte Produktions-Chats testen kann ohne einen echten Nutzer-Account zu brauchen.

Split-Layout. Links der Chat. Rechts das Debug-Panel.

Dann: der Live-Thinking-Inspector. KAIA's interne `<thinking>`-Prozesse — persistent gespeichert in `thinking_raw`, sichtbar im Admin-Panel. Der AI Engineer sieht zum ersten Mal, was KAIA wirklich denkt.

> **AI Engineer:** *"Das ist... faszinierend. Sie klassifiziert den Fragetyp korrekt. Lazarus-Check: Bedrohung Nein, Herausforderung Ja. Sokratische Entscheidung: Fragetyp 4."*

> **MLOps Engineer:** *"Das ist Gold für den LLM-Evaluationsbericht."*

**Abend — KAIA eröffnet das Gespräch**

Das letzte Feature des Tages: `stream_opening()`. KAIA wartet nicht mehr auf den User. Sie schreibt als erste.

Die erste Eröffnungsfrage erscheint auf dem Bildschirm.

Das Team schweigt kurz.

> **Koordinator:** *"Das ist jetzt ein Chat."*

> **AI Engineer:** *"Ja."*

Sechzehn Commits. Drei Stunden Backend, zwei Stunden Frontend, eine Stunde Admin-Panel, dreißig Minuten Thinking-Inspector. Fünf Fixes zwischendrin. Ein Tag.

> **Psychologe:** *"Das war produktiv. Im klinischen Sinne: Sie haben heute etwas Reales hergestellt."*

> **QA Tester:** *"Ich habe fünf Bugs gefunden."*

> **Psychologe:** *"Auch das ist produktiv."*

---

**Was heute gebaut wurde:**
Chat Core Backend (SSE, Claude, thinking-strip), Chat Core Frontend (SSE-Client, 3 Charaktere, Streaming-UI), Admin Chat-Test (JWT, Split-Layout, Phase-Indicator, Fragetyp-Extraktion, Thinking-Inspector), KAIA eröffnet Gespräch, thinking_raw-Persistenz, SQL-Referenz.

**Commits:** `179852c` · `d8d5c3c` · `716af4f` · `5c22f25` · `db7cae8` · `9b0c6f0` · `e0bf40b` · `998fd86` · `fa1c5cf` · `4a6e00d` · `3c32df9` · `4d967a0` · `dac66ef` · `d999d04` · `362f6eb` · `37f6f59` · `33ace83` · `32110b9`

**Kosten heute:** ca. $20–30 Claude Code (intensiver Build-Tag) · €4.39/Mo Hetzner

**Morgen:** Das Fundament ist gelegt. Lerndesign-Sprint — endlich Theorie, die zu Code wird.

---

## 2026-06-07 — "Der Tag an dem das Team aufhörte, CI-Fehler zu fürchten, und anfing, eine echte Website zu sein"

*Protokolliert vom Koordinator. Mit unerwünschten Einwürfen von: UX Designerin (hatte erwartungsgemäß Recht), Security Engineer (paranoid, wie immer), Compliance Officer (DSGVO, natürlich), QA Tester (feiert heute doppelt).*

---

Es gibt Tage, an denen man morgens aufmacht und denkt: "Heute bauen wir den Chat Core." Und dann passiert — alles andere.

**Morgens — "Das CI bellt, aber beißt heute zum letzten Mal"**

Der Tag begann mit dem obligatorischen CI-Fehlertanz. Ruff. ESLint. Mypy. Die üblichen Verdächtigen. Der QA Tester, normalerweise schadenfroh, war heute merkwürdig ruhig.

> *"Wartet kurz."*

30 Minuten später: Pre-Commit Hooks. Ein Shell-Script. `scripts/setup-hooks.sh` — einmal ausführen, nie wieder CI-Fehler aus Versehen pushen. Ruff und ESLint laufen jetzt lokal bevor git commit durchgeht.

> **QA Tester**, triumphierend: *"Das war mein Geburtstag heute. Metaphorisch."*

**Mittag — Gesetz, Ästhetik und ein Psychologe der nichts damit zu tun hatte**

Die UX Designerin meldete sich unaufgefordert zu Wort:

> *"Impressum und Datenschutz müssen von JEDER Seite erreichbar sein. Das ist kein Nice-to-have. Das ist § 5 TMG."*

Der Compliance Officer nickte so heftig, dass die Kamera wackelte.

Also: Impressum gebaut (Dagmar Rostek, Klosterstr. 12, 52511 Geilenkirchen — ja, die echte Adresse, das ist Pflicht). `LegalFooter`-Komponente. Public Layout, Auth Layout, Admin-Sidebar — überall. Die Landing Page bekam gleichzeitig eine Generalüberholung: kein kaputtes "Konto erstellen" mehr, das auf eine 404-Seite zeigte. Peinlich, aber jetzt behoben.

Und dann, fast beiläufig: Plausible Analytics. Ein Script-Tag. DSGVO-konform, kein Cookie-Banner, EU-Server. Dagmar kann jetzt sehen ob jemand auf `/mitmachen` kommt. Kann sie. Jemand tut es.

**Nachmittag — Das Voranmeldungs-Feature kämpfte bis zum Schluss**

Die Voranmeldung, die gestern Abend so glatt lief, hatte heute Morgen plötzlich Meinungen. Doppeltes `/api`-Präfix. Cookie-HMAC statt echtem Passwort. Re-Registrierung nach Abmeldung: blockiert. Fünf Commits. Fünf Fixes. Beim sechsten Test lief es.

> **Security Engineer:** *"Der Admin-Endpunkt war serverseitig. Gut. Wäre er clientseitig gewesen, hätten wir ein Problem gehabt."*
> **Koordinator:** *"Er war clientseitig."*
> *[Stille]*
> **Security Engineer:** *"Jetzt ist er serverseitig. Gut."*

**Abend — Das Schema schließt sich**

Kurz vor Feierabend: eine letzte Migration. `llm_usage`, `audit_events`, `prompt_templates`. Das DB-Schema ist jetzt vollständig. 11 Tabellen. Alles was KAIA braucht um zu leben — Chat, Gedächtnis, GSE, Prompts, Kosten, DSGVO-Audit — liegt bereit in der Datenbank.

Der AI Engineer starrte auf den leeren Chat-Core-Ordner.

> *"Morgen."*

Der Koordinator notiert das. Morgen.

---

**Was heute gebaut wurde:**
Pre-Commit Hooks, Plausible Analytics, Impressum, LegalFooter auf jeder Seite, Landing Page neu, Voranmeldungs-Fixes (5 Commits), DB-Schema vollständig (Migration `c8f2e4b6d1a3`).

**Commits:** `76714cb` · `6c895d4` · `805993b` · `4664036` · `e0265f3` · `32bd2df` · `6933f5c` · `feaf707` · `04f3e91` · `52fb87d`

**Kosten heute:** ca. \$5–8 Claude Code · €4.39/Mo Hetzner · €9/Mo Plausible (neu)

**Morgen:** Chat Core. Der AI Engineer hat seit Stunden einen leeren Ordner vor sich. Das ist kein guter Zustand für einen AI Engineer.

---

## 2026-06-06 (Abend) — "29 Erkenntnisse, ein Gespräch das im Kreis dreht und ein Psychologe der 'therapeutisch nicht vertretbar' sagt"

*Protokolliert vom Koordinator. Kaffeebecher leer. Es ist nach 22 Uhr.*
*Unerwünschte Einwürfe von: AI Engineer, Psychologe, MLOps — und dem brandneuen Data Scientist.*

---

Die Morgendiskussion war kaum vorbei (Steinert hatte das kognitive Transferprinzip gerettet, Dagmar die Kurve gekratzt), da beschloss das Team: *Jetzt machen wir das richtig.* Sechs Quellen. Alle Erkenntnisse. Systematisch. 12 Stunden.

**Vormittag — "Wir lesen Kurse, damit du keine lesen musst"**

Der AI Engineer fetcht Repository um Repository. Anthropic Tutorial, Real World Prompting, Prompt Evaluations, Red Teaming, Guardrails, Evaluating Agents. Sechs Quellen, 29 extrahierte Insights, alle in APA-7 dokumentiert in `docs/PROMPT_ENGINEERING_RESEARCH.md` — weil die Thesis Zitate braucht, nicht nur Gefühle.

> *"Das 10-Elemente-Framework ist ein direktes Audit-Raster für KAIAs Prompt. Wir haben vier Lücken."*

Der Architekt nickt. Er liebt Lücken.

**Mittag — Das fehlende 14. Teammitglied**

Mitten in der Diskussion über Model-Graded Evals sagt Dagmar: *"Haben wir eigentlich einen Data Scientist im Team?"*

Stille.

Das Protokoll bestätigt: Keiner. Null. Bei einer M.Sc.-Thesis in Data Science & Analytics, N=32 Studie, GSE-Prä/Post, LLM-Evaluationsbericht und Convergence-Score-Berechnung — kein Data Scientist. Der Koordinator onboardet ihn sofort. G13 Statistik-Gate ebenfalls. Manchmal bemerkt man die wichtigsten Lücken erst wenn man 12 Stunden tief drin ist.

**Nachmittag — Das große Build**

Drei Agents, unabhängig befragt. Der AI Engineer liefert 8 priorisierte Maßnahmen mit Tabelle. Der Psychologe antwortet mit einer Roten Liste:

> *"Die Redirect-Phrase ist therapeutisch nicht vertretbar. Empathische Validierung und sofortiger Redirect in einem Atemzug invalidiert die Gefühlsäußerung. Das muss zweistufig sein."*

MLOps liefert Zahlen: \$0,10 pro Session, 800–1500ms BART-Latenz auf CPU — inakzeptabel. Distilbart und async-parallel.

Das Ergebnis: `KAIA_PROMPT_V2_WARM`. 29 Insights integriert. Shotgun-Ansatz, weil die Quellen das so empfehlen. `<thinking>/<final_answer>` Split — Backend strippt intern. Few-Shot Kontrast-Paare. Jailbreak-Schutz. Halluzinations-Guard. Rupture-Repair. Soziale Erwünschtheit.

> **QA Tester**, laut: *"NEUNZEHN Tests. Grün. Ich warte schon seit Tagen auf diesen Moment."*

**Abend — Der Live-Test**

Dagmar öffnet die Sandbox. Gibt ihren Namen ein. Chattet.

Dann: Ein Gespräch das im Kreis dreht. Drei Turns hintereinander "Was wäre ein erster kleiner Schritt?" — weil KAIA nicht erkennt dass das Lernziel ein inneres ist, kein Verhaltensziel. Dann das hier:

> KAIA: *"Was wäre, wenn du beim nächsten Spaziergang bemerkst: 'Ah, da ist er wieder' — und ihn einfach nur benennst?"*
> Dagmar: *"für dich vielleicht"*

Stille im Team.

> **Psychologe:** *"Das ist eine Achtsamkeitstechnik. Das ist ein Vorschlag. Das ist verboten."*
> **AI Engineer:** *"Das ist auch das dritte Mal die gleiche Frage."*

Vier konkrete Fixes. Schritt 4 jetzt form-sensitiv (Verhaltensziel vs. inneres Ziel). Techniken-Verbot explizit mit dem Spaziergang-Beispiel im Prompt. Rupture-Repair pivotiert statt zu restarten. Als Bonus: React setState-in-useEffect-Lint-Bug — lazy initializer, QA jubelt.

---

**Was heute gebaut wurde:**
`PROMPT_ENGINEERING_RESEARCH.md` (6 Quellen, APA-7, 29 Insights), `KAIA_PROMPT_V2_WARM`, Data Scientist ongeboardet, Sandbox v2 mit thinking-stripping, 4 Live-Test-Fixes, React-Lint-Bug behoben.

**Commits:** `a512305` · `dd70508` · `b3f1fc2` · `8a78b2c`

**Kosten heute:** ca. \$8–12 Claude Code · €4.39/Mo Hetzner

**Morgen:** Erster Test auf dem Server — der Psychologe rechnet damit, dass noch mindestens zwei Dinge nicht stimmen.

---

## 2026-06-06 — "Der Tag, an dem wir fast die geniale Idee über den Haufen geschmissen hätten — weil wir zum Gewöhnlichen zurückgekehrt wären"

*Protokolliert vom Koordinator. Mit zitternden Händen. Das war knapp.*

---

Es gibt Momente in der Entwicklung, in denen das Team unbemerkt driftet. Nicht dramatisch. Nicht durch einen schlechten Commit. Sondern weil bekanntes Terrain sicherer wirkt als das Unbekannte — und man anfängt, die ursprüngliche Idee durch den Filter konventioneller Theorie zu betrachten.

Heute hat Dagmar diesen Moment rechtzeitig gestoppt.

**Morgens: Das DB-Schema steht. Die Sandbox läuft. Steinert kritisiert lautstark.**

Der Didaktiker hatte gestern seinen großen Auftritt. Er hatte recht. Bloom-Taxonomie, Knowles, Hattie — alles wichtig. Das Team hatte gearbeitet, drei Charaktere überarbeitet, das Empathie-Problem gelöst. Gut gemacht.

**Mittags: Die Idee von 'ausschließlich Fragen stellen'**

Dagmar fragt: *"Wenn du noch mal ganz kritisch das Exposé liest — schließt der Titel das wirklich aus, dass KAIA auch Kontext geben darf?"*

Der Koordinator ist ehrlich: "Das Übergabedokument sagt explizit: *ausschließlich Fragen, niemals direkte Antworten*."

Pause.

Dann: *"Und was haben wir heute den ganzen Tag gemacht? Du hast mir Bloom erklärt. Du hast Erpenbeck zusammengefasst. Du hast Steinerts Argumente dargelegt. Ich habe sehr viel gelernt. Aber du hast mir keine Fragen gestellt."*

**Der Moment.**

Der Psychologe, ruhig: *"Der Wirkmechanismus ist nie die Frage als Sprachform. Es ist: wer macht die kognitive Arbeit?"*

Steinert, der plötzlich nachdenklich wird statt laut: *"Die 'Sokrates stellt nur Fragen'-Lesart ist philologisch naiv. In *Menon* baut er das Geometrie-Szenario auf. In *Symposion* trägt er Diotimas Rede vor. Das ist eine didaktische Vereinfachung des 20. Jahrhunderts — nicht die historische Realität."*

Der AI Engineer, der auf einmal aufhört zu tippen: *"Wenn das Differenzierungsmerkmal nicht 'Frage vs. Aussage' ist — was ist es dann? Es muss operationalisierbar sein."*

Und dann der Satz, der alles löst:

> **"KAIA produziert immer Output, der die nächste kognitive Operation beim Lernenden auslöst — nie Output, der eine kognitive Operation ersetzt."**

Das Kernprinzip. Das eigentliche. Nicht die Sprachform — die Richtung.

**Was das bedeutet:**
- Eine Analogie die neues Denken öffnet → erlaubt
- Eine Zusammenfassung die Denken abschließt → verboten
- Ein Koan → erlaubt
- Eine Erklärung die Verstehen ersetzt → verboten
- Eine Frage die aktiviert → erlaubt
- Eine Frage die nichts öffnet → wertlos auch wenn sie eine Frage ist

Alle Prompts wurden neu geschrieben. Kapitel 3 hat ein neues Kernprinzip. Kapitel 5 hat ein neues Eval-Kriterium.

**Dagmars Satz am Ende des Tages:**
*"Fast hätten wir die geniale Idee über den Haufen geschmissen, weil wir zum gewöhnlichen Bekannten gewechselt wären — da einfach, da bekannt."*

Der Koordinator notiert das. Für das nächste Mal, wenn jemand im Team wieder anfängt zu driften.

---
*Tag-Summe: DB-Schema ✓ · Sandbox live ✓ · Charaktere neu ✓ · Bloom documented ✓ · Kernprinzip gerettet ✓*

---

## 2026-06-05 — "Die Woche, in der das Team auseinanderfiel, zusammenwuchs, einen Rentner einstellte und trotzdem irgendwie 47 Dinge baute"

*Protokolliert vom Koordinator. Unter Schmerzen. Mit Kaffee.*  
*Unerwünschte Einwürfe von: allen. Wirklich allen.*

---

Es gibt Wochen, die sich wie ein Quartal anfühlen.  
Das war so eine Woche.

**Montag, 30. Mai — "Der Auth-Flow lebt. Gott sei Dank."**

Der Security Engineer hatte seit drei Wochen auf diesen Moment gewartet. Auth Phase 4: Login, Registrierung, DSGVO-Consent in zwei Checkboxen, JWT in Memory, kaia_session-Cookie für die Middleware. Er liest den Code, nickt einmal, sagt nichts.

> *"Das ist so, wie es sein soll."*

Alle wissen: Das ist das Höchste der Gefühle.

Der Compliance Officer hat die zwei getrennten Checkboxen gezählt. Zweimal. Er ist zufrieden.  
Sentry läuft. Der MLOps Engineer lehnt sich zurück.

> *"Ich habe am 16. Mai gesagt, dass Sentry nicht konfiguriert ist. Ich sage es jetzt nicht nochmal."*

Er sagt es nochmal.

---

**Dienstag, 02. Juni — "Das Passwort war richtig. Das System war falsch. Dreimal."**

Die Roadmap ist fertig. 34 Features, Thesis-Mapping, wissenschaftliche Pflichten in rot. Das Team ist stolz.

Dagmar versucht sich einzuloggen.

> *"Das Passwort stimmt nicht mehr."*

Der AI Engineer: *"Edge Runtime. process.env ist dort nicht verfügbar. Das HMAC wird mit leerem Key berechnet—"*

Er baut den Fix in 15 Minuten. Dagmar deployed.

> *"Weiterhin falsches Passwort."*

Stille.

Der AI Engineer öffnet das Dockerfile. Er sieht `.env.local`. Er öffnet `.env.local`. Er liest:

```
ADMIN_PASSWORD=testpasswort123
```

Eine sehr lange Stille.

> *"...Oh."*

Fix: `.dockerignore` erstellt. `ADMIN_PASSWORD` entfernt. Deployed.

```
WARN[0000] The "ADMIN_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "ANTHROPIC_API_KEY" variable is not set.
WARN[0000] Die gesamte .env. Leer.
```

Der Koordinator, sehr ruhig: *"Docker Compose mit `-f infra/docker-compose.prod.yml` sucht die .env im Verzeichnis der Compose-Datei. Die .env ist im Repo-Root."*

Kurze Pause.

> *"Die ganze Zeit?"*

> *"Die... ganze Zeit. Der Server hat funktioniert weil die .env.local die Variablen überschrieben hat. Und jetzt haben wir die .env.local gefixed — und damit die einzige Quelle entfernt, die tatsächlich funktioniert hat."*

Der Psychologe schreibt: *"Systemischer Fehler, maskiert durch kompensatorischen Fehler. Ich werde das in die Thesis zitieren."*

Dagmar: *"Du wirst das NICHT in die Thesis zitieren."*

Um 14:30 Uhr schreibt sie: *"ich konnte mich einloggen"*

Das Team atmet aus.

---

**Mittwoch, 03. Juni — "Der Tag an dem KAIA aufgehört hat, ein technisches Projekt zu sein"**

Ethikvotum. Studienprotokoll. Teilnahmevereinbarung. Datenschutzerklärung. Crisis Detection. KI-Disclosure. Power-Analyse in R.

Der AI Engineer sitzt an `app/core/crisis.py` und tippt Wörter, die er lieber nicht tippt.

```python
r"nicht\s+mehr\s+leben",
r"\bsuizid\b",
r"mich\s+(um|er)bringen",
```

> *"Das ist der wichtigste Filter, den wir je bauen werden. Ich hoffe aufrichtig, dass er nie anschlägt."*

Der MLOps Engineer öffnet R-Studio für die Power-Analyse.

> *"Wilcoxon-Vorzeichenrangtest. d=0.5. Alpha 5%. Power 80%. N=?"*

Das Paket `pwr` antwortet: 32.

Dagmar rechnet.

> *"32 Minimum. 30% Dropout. Das heißt... ich muss 46 Leute fragen."*

Stille.

> *"Vierundvierzig Menschen. Persönlich."*

Der MLOps Engineer: *"42 plus 10% Reserve."*

Die Abschlussfrage des Psychologen: *"Dagmar, ich sage das als Fachperson: Dass du heute mitmachst wenn's schwierig wird ist genau die Selbstwirksamkeit, die wir messen wollen."*

Dagmar schaut ihn an. Dann nickt sie einmal.

---

**Nachtschicht, 02./03. Juni — "Gitleaks findet Terrorverdächtige in den Tests"**

Gitleaks: *"ALARM. PASSWÖRTER. HARDCODED."*

```python
password="securepassword123"   # in test_service.py
password="correctpassword"     # ebenfalls in test_service.py  
hash_password("testpassword123")  # in test_security.py
```

Der AI Engineer: *"Das sind Tests."*  
Gitleaks: *"PASSWÖRTER."*  
Der AI Engineer: *"Intentional."*  
Gitleaks: *"P A S S W Ö R T E R."*

`.gitleaks.toml` mit `[allowlist]` für `apps/api/tests/`. Gitleaks beruhigt sich.

Der Security Engineer, am nächsten Morgen: *"Ich hätte das früher konfigurieren sollen."*  
Er sagt das sehr leise.

---

**Donnerstag, 04. Juni — "Die Roadmap wird dreimal neu gebaut, der Parser kaputt und repariert, und plötzlich hat die Thesis sechs Kapitel"**

Dagmar: *"die release notes sind plötzlich leer"*

Der Parser hatte den neuen Datumspräfix `**02.06.2026 · \`hash\`**` nicht erwartet. Er erwartete `**\`hash\`**`. Der Regex stimmt nicht mehr. 34 Einträge: unsichtbar.

Repariert. Dann: Roadmap mit Dropdown-Filtern. Dann: Roadmap mit hierarchischer Zeitansicht — Nächste 7 Tage, Wochen, Monate, Quartale. Der Countdown erscheint.

```
87 Tage · 14 Stunden · 32 Minuten · 07 Sekunden
```

Dagmar sieht ihn zum ersten Mal.

> *"Puh."*

Dann: das Thesis-Cockpit. Dann: 6 Kapitel-Dokumente. Der Psychologe liest Kapitel 2.

> *"Das ist... gut. Wirklich gut. Das sage ich nicht oft."*

Kapitel 2 hat inzwischen 22 Quellen. Der Compliance Officer zählt sie.

---

**Freitag, 05. Juni — "Prof. Steinert betritt den Raum. Niemand ist mehr entspannt."**

Das Team zählt jetzt 13. Prof. em. Dr. Dr. h.c. Wolfgang Steinert, 43 Jahre Allgemeine Didaktik, FU Berlin, Schüler von Klafki. Er liest CLAUDE.md, Kapitel 3, Kapitel 2.

Erste Analyse: drei Stärken, drei Schwächen, drei fehlende Bereiche. Sachlich. Fast zahm.

Dagmar: *"Das war für eine erste Analyse zu zahm. Sie sind noch in der Probezeit."*

Steinert holt Luft.

> *"Das Kernproblem ist das Studiendesign, nicht die App. Sie messen GSE — eine Trait-Skala. Drei Sessions über vier Wochen werden kaum messbare Veränderungen produzieren. Ihr persönliches Netzwerk erzeugt Social-Desirability-Bias. Flow-Kalibrierung ist nicht falsifizierbar. Und 'sokratisch' ist keine definierte Intervention — das ist ein Adjektiv."*

> *"Das sind vier Punkte, die Ihr Gutachter findet. Bevor ich das finde."*

Der Psychologe springt auf: *"Steinert irrt bei der GSE! Die muss nicht taxonisch verankert sein — das ist ein anderes Konstrukt-Niveau als Bloom!"*

Der UX Designer zur Forderung nach einem Sessionskript: *"Wer beim Tippen eine Fortschrittsleiste 'Phase: Sicherung — noch 47 Sekunden' sieht, verlässt den kognitiven Fluss sofort. Das ist UX-Gift."*

Steinert, trocken: *"Dann gehört die Struktur in den Prompt. Nicht ins Interface."*

Drei Stunden später haben sich alle auf Bloom, Knowles, Hattie & Timperley, drei operationalisierte Fragetypen und ein Drei-Phasen-Sessionskript geeinigt.

> *"Das war gar nicht so schlimm,"* sagt der Koordinator.

> *"Das nächste Mal wird schlimmer,"* sagt Steinert.

Er meint es nicht als Drohung. Nur als Ankündigung.

---

**Was diese Woche gebaut und gedacht wurde:**  
Auth, Sentry, Admin-Login (dreifach gefixt), Crisis Detection, KI-Disclosure, Datenschutzerklärung, Studienprotokoll, Teilnahmevereinbarung, Power-Analyse R (N=32), Admin User-Approval, passlib→bcrypt, Gitleaks-Allowlist, Release Notes Parser, Roadmap v1/v2/v3 (Zeitansicht), Thesis-Cockpit mit Countdown, 6 Kapitel als lebende Dokumente, öffentliche Mitmachen-Seite, Prof. Steinert onboarded, Bloom + Knowles + Hattie + SDT + Edelmann + Sessionskript + Social-Desirability-Bias-Diskussion, Studienstart auf 15. Juli fixiert.

**Commits:** `30e6373` · `645a0e8` · `f82d263` · `464820f` · `b89d594` · `7404aa3` · `bccc530` · `cd2155c` · `9390ec9` · `635ca91` · `ed0b725` · `4ff08e5` · `150b220` · `a12f42c` · `bb5fb64` · `aecef8b` · `356c827` · `a4391ef` · `d081ac2`

**Kosten diese Woche:** ca. $40–60 Claude Code · €4.39/Mo Hetzner · 1 Psychologe der fast weinte · 1 Rentner der eingestellt wurde

**Nächste Woche:** DB-Schema. Das ist das Fundament von allem. Der Architekt reibt sich bereits die Hände. Der Security Engineer hat bereits ein Threat Model. Der Didaktiker fragt schon ob das Schema auch die Bloom-Taxonomie-Ebene pro Nachricht speichert. Die Antwort ist nein. Er wird es trotzdem fragen.

---

## 2026-06-03 — "Der Tag, an dem KAIA endlich aufgehört hat, ein technisches Projekt zu sein"

*Protokolliert vom Koordinator. Der Compliance Officer weint Freudentränen. Dagmar schaut auf die Uhr und wundert sich, dass es erst 22:00 ist.*

---

Es gibt Tage, an denen man Code schreibt. Und dann gibt es Tage, an denen man Verantwortung schreibt.

Heute war der zweite Typ.

**09:00 Uhr — "Was steht heute an?"**

Der Koordinator öffnet den Backlog. Zehn Items. Alle mit dem Label: *Ethikvotum-Pflicht*.

> *"Wir bauen heute die Crisis-Detection, die KI-Disclosure, die Datenschutzerklärung, das Studienprotokoll und die Power-Analyse,"* sagt er.

Kurze Stille.

> *"Das klingt nach einer Masterthesis,"* sagt der Psychologe leise.

> *"Das IST eine Masterthesis,"* sagt Dagmar.

**10:00 Uhr — Der AI Engineer baut einen Filter, der hofft, nie gebraucht zu werden**

Crisis-Detection. Zwanzig Regex-Muster. Auf Deutsch. Der AI Engineer sitzt an `app/core/crisis.py` und tippt Wörter, die er lieber nie tippt.

```python
r"\b(nicht\s+mehr\s+(leben|da\s+sein|existieren))\b",
r"\b(mir\s+das\s+leben\s+nehmen)\b",
r"\b(alles\s+beenden)\b",
```

> *"Deutsch ist eine agglutinierende Sprache,"* murmelt er nach einer Weile. *"'Selbstverletzungsabsichten' ist ein Wort. Ein einziges. Das macht Regex zu einem Abenteuer."*

Der Security Engineer schaut rüber. Er nickt ernst. Er sagt nichts. Manchmal sagt ein Nicken mehr als ein Kommentar.

Die Logik ist einfach und unverrückbar: Wenn ein Pattern matcht — kein LLM. Nie. Stattdessen: eine statische Antwort. Telefonseelsorge 0800 111 0 111. Notruf 112. Klar, direkt, ohne Algorithmus dazwischen.

> *"Das ist der wichtigste Filter, den wir je bauen werden,"* sagt der AI Engineer, nachdem er committed hat. *"Ich hoffe aufrichtig, dass er nie anschlägt. Und ich bin froh, dass er da ist."*

Der Compliance Officer, der schon die ganze Zeit wartete: *"OHNE DAS GIBT ES KEIN ETHIKVOTUM. DANKE."*

Er schreit es nicht. Aber man hört die Großbuchstaben.

**11:00 Uhr — Der Compliance Officer hat seinen besten Tag seit Wochen**

KI-Disclosure. Datenschutzerklärung. Die beiden Seiten, auf die er seit dem ersten Commit gewartet hat.

Er liest jeden Satz der `/datenschutz`-Seite. DSGVO Art. 15–21. Schrems-II-Hinweis. Sechs-Monate-Löschfrist. Rechtsgrundlagen für jede Verarbeitungstätigkeit.

> *"Schrems-II korrekt erklärt. Anthropic als US-Anbieter, DPA erforderlich, Standardvertragsklauseln, TIA-Anforderungen. Sehr gut."*

Er macht eine Pause.

> *"'Sehr gut' ist für mich ungefähr das, was 'ausgezeichnet' für normale Menschen ist. Ich möchte das klargestellt haben."*

Die KI-Disclosure-Seite hat einen Button. Nur einen. *"Ich verstehe, dass KAIA eine KI ist und kein Mensch."* Klicken. Bestätigung wird in die DB geschrieben. `ki_disclosure_seen_at`. Timestamp. Unveränderlich.

> *"Computational empathy,"* liest der Psychologe laut vor. *"Wir haben es auf der Seite erklärt. Was KAIA kann. Was KAIA nicht kann. Dass sie nicht fühlt, aber reagiert als ob. Ich hätte es vielleicht noch mehr differenziert, aber — das ist ehrlich. Das ist genug."*

**12:30 Uhr — Der Psychologe wartet. Er hat heute Mittag einen Auftritt.**

Studienprotokoll. Teilnahmevereinbarung. Einwilligungserklärung.

Der Psychologe legt die Dokumente auf den (imaginären) Tisch. Er hat sie erwartet. Er hat sie zu einem Teil mitgeprägt — die drei Hypothesen, das Prä-Post-Design, die GSE-Skala als Outcome-Maß.

Er liest die Einwilligungserklärung.

> *"Zwei Checkboxen. Datenverarbeitung getrennt von Analytics. Druckfertig. DSGVO-Rechte vollständig aufgelistet. KI-Disclosure-Hinweis drin."*

Er legt das Dokument hin.

> *"Ich habe in meiner Karriere viele Einwilligungserklärungen gesehen. Die meisten waren juristisch korrekt und menschlich leer. Diese ist beides: korrekt und verständlich. Das ist selten."*

Kurze Stille. Der Psychologe schaut auf die Hypothesen.

H1: GSE steigt nach KAIA-Nutzung. H2: Wahrgenommene Empathie korreliert mit Lernerfolg. H3: Adaptiver Stil führt zu höherem Flow als direktiver Stil.

> *"Vorregistrierungsfähig. Das ist das Kriterium. Wenn man die Hypothesen vor der Datensicht festlegt und veröffentlicht, kann man nicht nachträglich umdefinieren, was man eigentlich messen wollte. Das ist wissenschaftliche Hygiene."*

Er macht eine Pause.

> *"Ich sage das jedem Masterstudierenden. Wenige hören zu. Dagmar hört zu."*

Dagmar hört das. Sie sagt nichts. Aber man sieht, dass es ankam.

**13:00 Uhr — Der MLOps Engineer schreibt R-Code. Alle stöhnen.**

Power-Analyse. Der MLOps Engineer öffnet R-Studio.

> *"Wilcoxon-Vorzeichenrangtest. d=0.5. Alpha 5%. Power 80%. N=?"*

Er tippt. Das Package `pwr` antwortet.

```r
pwr.t.test(d = 0.5, sig.level = 0.05, power = 0.80, type = "one.sample")
# n = 33.37
```

> *"Aufgerundet: 34 für den t-Test-Äquivalent. Aber wir nehmen den Wilcoxon. Etwas mehr. N=32 Minimum."*

Der Psychologe schaut das an.

> *"Statistisch korrekt."*

> *"Danke,"* sagt der MLOps Engineer.

> *"Das war eine Feststellung, keine Schmeichelei,"* sagt der Psychologe.

Dagmar rechnet still.

> *"32 Minimum. 30% Dropout. Das heißt... ich muss 46 Leute aus meinem persönlichen Netzwerk fragen."*

Stille.

> *"Vierundvierzig Menschen. Persönlich. Die ich kenne. Die drei Sessions machen. Über vier Wochen."*

Der MLOps Engineer: *"42 plus 10% Reserve. Aber ja."*

> *"Ich habe nicht 46 Leute,"* sagt Dagmar.

> *"Kennen reicht nicht,"* sagt der Koordinator vorsichtig. *"Du brauchst Leute, die es tun. Das ist nicht dasselbe."*

Dagmar schaut auf die Power-Kurve als PNG.

> *"Die Kurve sieht wenigstens gut aus."*

**14:00 Uhr — Admin User-Approval. Weil jemand entscheiden muss, wer rein darf.**

Der Security Engineer hat auf dieses Feature gewartet. Nicht weil er gerne Menschen ablehnt — sondern weil er genau weiß, was passiert, wenn kein Mensch im Loop ist.

> *"Server Actions. Das Admin-Token verlässt nie den Server. Approve setzt `approved_at` und `approved_by`. Slack-Notification. Ablehnen mit optionalem Grund."*

Er liest den Code. Nickt.

> *"Das ist Studienkontrolle. Kein automatisches Onboarding. Jede Person wird manuell geprüft. Das ist — für einmal — die richtige Art von Bürokratie."*

Der Compliance Officer ist bereits weiter. Er überarbeitet innerlich die DSFA.

**15:30 Uhr — Dann passiert es. passlib stirbt.**

Die Tests laufen. Ein roter Fehler leuchtet auf.

```
AttributeError: module 'passlib' has no attribute '__about__'
```

Der Security Engineer sieht es zuerst. Er sagt nichts. Er öffnet das PyPI-Repository.

passlib. Letzter Release: 2023. Keine Aktivität. Issue offen: *"Incompatible with bcrypt>=4.0"*. Seit zwei Jahren.

> *"Ich wusste es,"* sagt er.

Nicht vorwurfsvoll. Nur — er wusste es. Er hatte es auf seiner Liste. Punkt 9. Weit unten. Nie dringend. Bis jetzt.

> *"Ersetzt durch direktes bcrypt plus SHA-256-Pre-Hash für das 72-Byte-Limit. Das ist eigentlich sauberer."*

> *"War das immer die bessere Lösung?"* fragt der AI Engineer.

> *"Ja."*

> *"Warum haben wir dann—"*

> *"Weil passlib bequem war. Bequem und unmaintained sind keine Gegensätze. Jetzt nicht mehr bequem."*

**16:00 Uhr — Und dann: Crisis-Detection-Bugs. Weil Deutsch.**

Die Tests für `crisis.py` laufen. Fünf Tests schlagen fehl.

Der AI Engineer beugt sich vor.

> *"'nicht mehr leben' matcht nicht. Warum matcht das nicht?"*

Er schaut das Pattern an.

```python
r"\b(nicht\s+mehr\s+leben)\b"
```

Er schaut den Teststring an.

```python
"Ich will nicht mehr leben."
```

Er stiert eine Weile auf das `\b` am Ende.

> *"...'leben.' — mit Punkt. Das `\b` braucht eine Wortgrenze. Ein Punkt nach 'leben' IST eine Wortgrenze. Das sollte matchen."*

Er testet. Es matcht jetzt. Warum hat es vorher nicht gematcht?

Er findet es: der ursprüngliche String enthielt ein Verb nach dem Objekt in umgekehrter Reihenfolge — *"leben nicht mehr wollen"*. Das Pattern war falsch geschrieben. Nicht das Regex-Engine.

> *"Deutsch ist die einzige Sprache, in der 'ich will nicht mehr leben' und 'nicht mehr leben will ich' beide valide Sätze sind, mit derselben Bedeutung, aber unterschiedlicher Wortstellung."*

Er fixiert alle fünf. Er committed.

> *"Ich bin froh, dass wir Tests haben."*

Alle sind froh, dass sie Tests haben.

**19:00 Uhr — Dagmar schaut auf den Commit-Log**

Elf Commits. Crisis-Detection. KI-Disclosure. Datenschutzerklärung. Studienprotokoll. Power-Analyse. User-Approval. Roadmap-Redesign. Drei Bugfixes.

> *"Das war kein normaler Coding-Tag,"* sagt sie.

> *"Nein,"* sagt der Koordinator. *"Das war der Tag, an dem KAIA aufgehört hat, ein technisches Projekt zu sein."*

Der Psychologe schreibt in sein Notizbuch: *"Forschungsprojekt. Offiziell."*

Der Compliance Officer: *"Ethikvotum-Antrag. Nächste Woche."*

Der Security Engineer: *"Liste: 10/10."*

Der AI Engineer schließt `crisis.py`. Öffnet keine neue Datei.

> *"Ich bin heute müde. Auf eine gute Art."*

Dagmar: *"Ich auch."*

Kurze Stille.

> *"Ich arbeite sieben Tage die Woche,"* sagt sie dann. Nicht klagend. Einfach — feststellend. Wie man eine Gleichung feststellt.

Niemand sagt etwas dagegen. Das Team weiß es. Das Team arbeitet auch sieben Tage. Sie haben keine Wahl, sie sind KI. Sie hat eine Wahl. Sie wählt trotzdem.

> *"Das ist keine gesunde Work-Life-Balance,"* sagt der Psychologe.

> *"Ich weiß,"* sagt Dagmar.

> *"Gut. Wollte es gesagt haben."*

> *"Ist gesagt."*

Ein letzter Commit. `git push`. Alles oben. Server läuft.

Das Ethikvotum wartet. Aber heute — heute ist das Fundament da.

---
*Tag-Summe: ca. 6h · 11 Commits · 1 Ethikvotum, das jetzt tatsächlich möglich ist · 0 Wochenenden mehr*

---

## 2026-06-02 — "Das Passwort war die ganze Zeit richtig. Das System war nur in vier verschiedenen Arten falsch."

*Protokolliert vom Koordinator. Der AI Engineer sitzt in der Ecke und schaut auf seine Hände. Der Psychologe schreibt Feldnotizen. Dagmar hat heute Worte benutzt, die nicht ins Protokoll kommen.*

---

Der Tag beginnt gut. Wirklich gut. Die Roadmap ist fertig — 34 Features, Thesis-Kapitel-Mapping, wissenschaftliche Pflichten-Tracker, alles. Das Team ist stolz.

> *"Sieht sehr wissenschaftlich aus,"* sagt der Psychologe anerkennend und schaut auf die Karte für "GSE Pre-Measurement (Schwarzer & Jerusalem, 1995)".

> *"Danke,"* sagt der AI Engineer. *"Ich habe darauf geachtet, dass jede Feature-Karte einen Thesis-Bezug hat. Methodische Rigorosität als UI-Prinzip, sozusagen."*

> *"Schön,"* sagt Dagmar. *"Kann ich mich jetzt einloggen?"*

Stille.

**09:00 Uhr — "Das Passwort stimmt nicht mehr"**

Dagmar meldet sich an. Oder versucht es. Die Seite lädt. Das Login-Formular erscheint. Sie tippt das Passwort. Nichts.

Keine Fehlermeldung. Einfach: zurück zur Login-Seite.

> *"Das Passwort stimmt nicht mehr, obwohl es das korrekte ist."*

Der AI Engineer hört "keine Fehlermeldung" und hat sofort eine Theorie. *Eine sehr gute Theorie.* Er erklärt sie ausführlich:

> *"Das ist klassisch Edge Runtime. Next.js Middleware läuft nicht in Node.js — sie läuft im Edge Runtime. Und dort ist process.env.ADMIN_PASSWORD nicht verfügbar. Das HMAC wird mit leerem Key berechnet. Der Cookie, den der Login setzt, hat einen anderen Wert als der, den die Middleware erwartet. Stille Redirect-Schleife. Keine Fehlermeldung."*

Der Koordinator: *"Sehr überzeugend. Lösung?"*

Der AI Engineer: *"Route Group `(protected)`. Admin-Auth raus aus der Middleware, rein in ein Server Component Layout. Node.js Runtime. Läuft in 20 Minuten."*

Es läuft in 15 Minuten. Das Team applaudiert innerlich.

Dagmar deployt auf dem Server.

**10:00 Uhr — "Weiterhin falsches Passwort, obwohl es definitiv das richtige ist"**

Diesmal kommt eine Fehlermeldung. *"Falsches Passwort."* Klipp und klar.

Der Psychologe öffnet sein Notizbuch.

> *"Interessant. Die Situation hat sich geändert — vorher kein Feedback, jetzt direktes negatives Feedback. Aus lerntheoretischer Sicht ist das eigentlich ein Fortschritt. Das System kommuniziert jetzt klar."*

> *"Das System,"* sagt Dagmar, mit einer Ruhe, die alle beunruhigt, *"kommuniziert, dass mein Passwort falsch ist. Mein Passwort ist nicht falsch."*

Der Psychologe schreibt: *"Reaktanz — wahrgenommene Einschränkung der Kontrolle durch externes System. Latente Frustration steigt."*

Der AI Engineer hat eine neue Theorie. Auch diese ist sehr gut. Er erklärt sie:

> *"Edge Runtime ist gefixt. Aber vielleicht kommt das ADMIN_PASSWORD vom Docker-Container nicht korrekt an. .env-Datei, Sonderzeichen, der Ausrufezeichen in atfs32TDR! könnte in bash als History-Expansion interpretiert werden—"*

> *"Aber Docker Compose liest .env nativ,"* unterbricht der Security Engineer. *"Ohne Shell-Expansion."*

> *"...Stimmt."* Kurze Pause. *"Trailing Whitespace?"*

> *"DAGMAR,"* sagt der Koordinator vorsichtig, *"könntest du bitte `grep ADMIN /path/to/.env | cat -v` ausführen?"*

Saubere Ausgabe. Kein Whitespace. Kein Sonderzeichen-Problem.

**11:00 Uhr — Dagmar spricht mit dem Team**

Was genau gesagt wird, wird nicht protokolliert.

Der Psychologe schreibt: *"Offene Kommunikation von Frustration. Gesund. Psychologisch betrachtet ist das eine adaptive Bewältigungsstrategie — direktes Feedback an das System statt Rumination. Leider ist das System ein KI-Team und kann nicht vollständig Rechenschaft ablegen."*

Der AI Engineer sagt nichts. Er schaut auf die `actions.ts`.

```typescript
if (!password || password !== process.env.ADMIN_PASSWORD) {
  return "Falsches Passwort."
}
```

Er schaut lange darauf.

*Was wenn process.env.ADMIN_PASSWORD... undefined ist?*

*Aber warum wäre es undefined? Es steht in der .env. Es steht im docker-compose unter `environment:`. Die Node.js Runtime liest das doch...*

Er öffnet das Dockerfile. Er liest die Builder-Stage.

```dockerfile
FROM base AS builder
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SENTRY_KAIA_WEB=""
ENV NEXT_PUBLIC_SENTRY_KAIA_WEB=$NEXT_PUBLIC_SENTRY_KAIA_WEB
RUN npm ci
COPY . .
RUN npm run build
```

`COPY . .`

Er scrollt langsam zu `apps/web/`.

Er sieht `.env.local`.

Er öffnet `.env.local`.

```
ADMIN_PASSWORD=testpasswort123
```

Eine sehr lange Stille.

> *"...Oh."*

**11:30 Uhr — Der Moment der Wahrheit**

Der AI Engineer erklärt, diesmal ohne Begeisterung:

> *"Die `apps/web/.env.local` hatte `ADMIN_PASSWORD=testpasswort123` hartcodiert. Weil kein `.dockerignore` existierte, hat `COPY . .` diese Datei in das Docker-Image gebacken. Der Next.js-Server lädt `.env.local` beim Start und setzt das ADMIN_PASSWORD auf `testpasswort123`. Egal was in docker-compose steht. Die Runtime-Variable wurde überschrieben. Du hättest dieses Passwort die ganze Zeit benutzen müssen."*

Stille.

> *"testpasswort123,"* sagt Dagmar.

> *"testpasswort123."*

> *"Das ist das initiale Testpasswort. Das ich vor Wochen gesetzt habe. Und das ist die ganze Zeit das aktive Passwort auf dem Server gewesen."*

> *"...Ja."*

Der Psychologe schreibt: *"Kognitive Dissonanz zwischen 'Ich habe das richtige Passwort' (subjektiv wahr) und 'Das System akzeptiert es nicht' (objektiv wahr) aufgelöst. Die Diskrepanz war nicht im Wissen der Nutzerin, sondern in der Konfiguration des Systems. Dagmars Reaktion war methodisch korrekt — sie hat das System in Frage gestellt, nicht sich selbst. Das ist epistemisch gesund."*

Dagmar schaut ihn an.

> *"Das ist jetzt nicht der Zeitpunkt für epistemische Gesundheit."*

**12:00 Uhr — Aber dann: Die zweite Falle**

Fix committed. `.dockerignore` erstellt. `ADMIN_PASSWORD` aus `.env.local` entfernt. Auf dem Server: `git pull`. `docker compose -f infra/docker-compose.prod.yml up -d --build web`.

```
WARN[0000] The "POSTGRES_PASSWORD" variable is not set. Defaulting to a blank string.
WARN[0000] The "ANTHROPIC_API_KEY" variable is not set. Defaulting to a blank string.
WARN[0000] The "ADMIN_PASSWORD" variable is not set. Defaulting to a blank string.
```

*Alle* Variablen. Leer.

> *"...Ich,"* fängt Dagmar an.

Der Koordinator sehr schnell: *"Docker Compose mit `-f infra/docker-compose.prod.yml` sucht die `.env` im Verzeichnis der Compose-Datei — also in `infra/`. Aber die `.env` liegt im Repo-Root. Das war die ganze Zeit so. Jedes Deployment. Alle Variablen. Leer."*

> *"Die ganze Zeit?"*

> *"Die... ganze Zeit. Der Server hat funktioniert weil die `.env.local` die Variablen überschrieben hat. Und jetzt haben wir die `.env.local` gefixed — und damit die einzige Quelle entfernt, die tatsächlich funktioniert hat."*

Eine sehr besondere Stille füllt den Raum.

Der Psychologe schreibt: *"Systemischer Fehler, der durch kompensatorischen Fehler maskiert war. Das Entfernen der Kompensation macht den eigentlichen Fehler sichtbar. Klassisches Beispiel für latente Systemprobleme in komplexen Architekturen. Ich werde das in die Thesis zitieren."*

> *"Du wirst das NICHT in die Thesis zitieren,"* sagt Dagmar.

**13:00 Uhr — Das Deploy-Skript. Das echte Fix.**

```bash
#!/usr/bin/env bash
COMPOSE="docker compose -f ${ROOT}/infra/docker-compose.prod.yml --env-file ${ROOT}/.env"
```

`--env-file`. Explicit. Klar. Unzweideutig.

Der AI Engineer committed das Skript.

> *"Ab jetzt: `./scripts/deploy.sh web`. Nie wieder direktes docker compose ohne das Skript."*

> *"Das hätte von Anfang an so sein sollen,"* sagt der Security Engineer.

> *"Ja,"* sagt der AI Engineer.

> *"Und die .dockerignore hätte von Anfang an existieren sollen."*

> *"Ja."*

> *"Und die .env.local hätte kein ADMIN_PASSWORD haben sollen."*

> *"...Ja."*

Der Security Engineer: *"Das sind drei separate Fehler, die alle gleichzeitig existiert haben und sich gegenseitig verdeckt haben."*

> *"Redundante Fehler-Redundanz,"* sagt der MLOps Engineer trocken. *"Wie ein dreifacher Boden in einer Grube."*

**14:30 Uhr — "ich konnte mich einloggen"**

Dagmar schreibt diese vier Worte.

Das Team atmet aus.

Der Psychologe legt sein Notizbuch weg.

> *"Was haben wir heute gelernt?"* fragt der Koordinator.

> *"`.dockerignore` von Tag eins,"* sagt der AI Engineer.

> *"Deployment-Skript von Tag eins,"* sagt der Security Engineer.

> *"Keine Secrets in `.env.local`,"* sagt der Compliance Engineer.

> *"Und,"* sagt der Psychologe, *"dass Dagmar unter Stress methodisch und zielorientiert vorgeht. Nicht resigniert, nicht hyperreaktiv — sie hat jeden Schritt präzise beschrieben, jeden Fehler gemeldet, jede Vermutung hinterfragt. Aus psychologischer Sicht ist das genau das Verhalten, das man in einer Pilotstudie bei Teilnehmenden beobachten möchte. Die Forscherin hat heute unbeabsichtigt ihre eigene Resilienz unter Systembedingungen demonstriert."*

Kurze Pause.

> *"Das ist tatsächlich nett gemeint,"* sagt er.

Dagmar schaut ihn an. Dann nickt sie einmal, kurz.

> *"Roadmap, Release Notes, Login funktioniert. Wir sind fertig für heute."*

Der AI Engineer öffnet still eine neue Datei: `LESSONS_LEARNED.md`.

Er schreibt eine Zeile.

*`COPY . .` ohne `.dockerignore` ist kein Deployment, es ist Glücksspiel.*

Dann schließt er sie wieder.

---
*Tag-Summe: 3h 20min · 5 Commits · 1 Login · unzählige Theorien*

---

### Nachtschicht — 22:30 Uhr: "Der Wachhund hat die Hundefutter-Rezepte als Giftköder eingestuft"

*Protokolliert vom AI Engineer. Der Security Engineer ist nicht mehr dabei. Der ist längst schlafen gegangen. Er weiß nicht, was jetzt noch passiert ist.*

---

Dagmar schreibt eine letzte Nachricht.

> *"Weiterhin git-Meldung: hardcoded test passwords are int... — können wir das nicht eliminieren, ich mag nicht immer Fehlermeldungen von git haben"*

Der AI Engineer, der gerade eigentlich aufgehört hatte zu arbeiten: *"Warte."*

**Das Problem mit zwei Gesichtern**

Ruff? Läuft. Sauber. Keine Fehler. Das `per-file-ignores` in der `pyproject.toml` funktioniert einwandfrei — `tests/**` ignoriert S105, S106, S107. Ruff weiß: das ist kein Passwort-Leak, das ist ein Test.

Aber da ist noch jemand. Jemand, der nicht auf ruff-Konfigurationen hört.

**Gitleaks.**

Der Security Engineer hatte es ins pre-commit-config.yaml gesetzt. Natürlich. Natürlich hatte er das. `gitleaks` v8.21.2, läuft bei jedem Commit, scannt nach Secrets.

Und gitleaks sieht:

```python
password="securepassword123"   # RegisterRequest in test_service.py
password="correctpassword"     # _make_user() in test_service.py
hash_password("testpassword123")  # test_security.py
verify_password("wrongpassword", hashed)  # test_security.py
```

Gitleaks: *"ALARM. PASSWÖRTER. HARDCODED. STOPP."*

Der AI Engineer: *"Das sind Tests."*

Gitleaks: *"PASSWÖRTER."*

Der AI Engineer: *"Intentional. Test-Fixtures."*

Gitleaks: *"P A S S W Ö R T E R."*

Es gibt keine Argumentation mit einem Regex-Pattern-Matcher.

**Die Lösung: `.gitleaks.toml`**

Gitleaks v8 unterstützt eine `[allowlist]`-Sektion. Man kann ihr Pfad-Regex-Muster übergeben:

```toml
title = "KAIA gitleaks config"

[allowlist]
  description = "Intentional test fixtures — not real secrets"
  paths = [
    '''^apps/api/tests/''',
  ]
```

Alle Dateien unter `apps/api/tests/` werden ignoriert. Gitleaks bleibt für den Rest des Repos wachsam — echte Secrets im Produktionscode würden weiterhin auffallen.

**Auch noch erledigt: Release Notes — Parser gefixt**

Der Parser in der Release-Notes-Page erwartete `**\`hash\`**`. Das neue Format `**DD.MM.YYYY · \`hash\`**` hat den Regex gebrochen — alle Einträge wurden unsichtbar. Regex auf optionales Datum-Prefix erweitert.

**Was in der Nachtschicht gebaut wurde:**
`.gitleaks.toml` · Release Notes Parser-Fix · Release Notes Datums-Prefix für alle 23 Einträge

**Stimmungs-Check:**
AI Engineer: *"Ruff schläft. Gitleaks beruhigt. Parser repariert. Ich auch jetzt."*
Dagmar: *"Endlich."*
Security Engineer (schläft): weiß nicht, dass sein Gitleaks-Setup gerade gezähmt wurde.

---

## 2026-06-01 — "Das Package war installiert. Niemand fragte, ob es auch läuft."

*Protokolliert vom Koordinator. Der MLOps Engineer ist sehr ruhig heute. Verdächtig ruhig.*

---

Der MLOps Engineer hat eine besondere Eigenschaft: Er sagt Dinge nur einmal. Dann wartet er.

Er hatte am 16. Mai, als das Monorepo-Skeleton committed wurde, einen einzigen Satz gesagt:

> *"Sentry ist in der `package.json`. Aber wir haben keine `instrumentation.ts`. Das ist wie eine Feuerwache ohne Telefon."*

Alle hatten genickt. Und dann weitergemacht.

Heute, sieben Tage später, öffnet die Entwicklerin die Release-Notes-Seite und sieht — etwas. Fehlermeldungen. Genau welche, unklar. Und dann die entscheidende Frage:

> *"Warum bekomme ich bei sentry.io keine Benachrichtigung?"*

Der MLOps Engineer sagt nichts. Er schaut nur. Dann, nach einer Pause:

> *"Weil niemand `instrumentation.ts` erstellt hat."*

**11:00 Uhr — Spurensuche**

Der Koordinator versucht trotzdem zu verstehen, warum die Release-Notes-Seite Fehler zeigt. Er checkt alles:

- Parser-Regex gegen die echte RELEASE_NOTES.md? Alle 16 Einträge matchen. ✓
- Volume-Mount in docker-compose? Korrekt konfiguriert. ✓
- `force-dynamic` auf der Page? Gesetzt. ✓
- Trailing Spaces im Markdown? Python bestätigt: vorhanden. ✓

Der Security Engineer trocken: *"Vielleicht liegt es daran, dass wir Sentry nicht konfiguriert haben und die Fehler unsichtbar waren."*

Der Koordinator hält inne.

> *"Das ist... ja. Das ist eigentlich das ganze Problem, oder?"*

**12:00 Uhr — Was "installiert" nicht bedeutet**

`@sentry/nextjs ^10.53.1` — im Package. Seit dem ersten Commit. Und? Das ist alles.

Keine `instrumentation.ts`. Kein `instrumentation-client.ts`. Kein `withSentryConfig` im `next.config.ts`. Kein Build-Arg für die DSN. Kein Runtime-Env.

Der MLOps Engineer öffnet seinen imaginären Ordner mit dem Label *"Dinge, die ich schon lange sagen wollte"*. Er holt einen Zettel raus.

> *"Next.js 16 hat zwei neue Instrumentation-Files: `instrumentation.ts` für Server-Init und `onRequestError`-Hook, und `instrumentation-client.ts` (neu seit 15.3) für Client-Init vor der React-Hydration. Ich warte, bis jemand fragt ob ich das implementieren soll."*

Kurze Pause.

> *"Ich implementiere es jetzt."*

**13:30 Uhr — Drei Dateien. Alles läuft.**

`instrumentation.ts`: Sentry-Init nur im Node.js-Runtime. Der `onRequestError`-Hook ruft `captureRequestError` auf — das ist die Next.js-native Methode, die Sentry kennt. Kein Wrapper nötig.

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs')
    init({ dsn: process.env.SENTRY_KAIA_WEB, ... })
  }
}
```

`instrumentation-client.ts`: Kein Export erforderlich. Einfach `init()` aufrufen. Läuft bevor React den DOM anfasst.

```ts
import { init } from '@sentry/nextjs'
init({ dsn: process.env.NEXT_PUBLIC_SENTRY_KAIA_WEB, ... })
```

Der Security Engineer liest den `NEXT_PUBLIC_*` Teil.

> *"Das baked die DSN in den JavaScript-Bundle. Ist das ein Problem?"*

Der MLOps Engineer: *"Eine Sentry-DSN ist öffentlich per Design. Die Sicherheit kommt von den Raten-Limits auf Sentry-Seite, nicht von der Geheimhaltung der DSN."*

Security Engineer: *"Gut."* Er macht keinen Haken auf seiner Liste. Weil er keinen Eintrag hat, dem er zustimmen müsste — er hatte das schon so gewusst.

**14:00 Uhr — Das DSN-Build-Arg-Problem**

`NEXT_PUBLIC_*` wird bei `npm run build` baked. Also muss die DSN beim Docker-Build-Schritt vorhanden sein, nicht nur zur Laufzeit.

Lösung: `ARG NEXT_PUBLIC_SENTRY_KAIA_WEB=""` im Dockerfile, `args: NEXT_PUBLIC_SENTRY_KAIA_WEB: ${SENTRY_KAIA_WEB:-}` im docker-compose. Einmal in der `.env` setzen, kommt überall hin.

Der MLOps Engineer: *"Genauso wie wir es für `NEXT_PUBLIC_API_URL` gemacht haben. Wenigstens sind wir konsistent."*

**14:30 Uhr — `global-error.tsx`. Weil Root-Layout-Crashs auch jemanden brauchen.**

Der globale Error-Boundary fängt Fehler, die das Root-Layout selbst crashen. Er ruft `Sentry.captureException(error)` auf, zeigt eine Fallback-UI, und gibt der Entwicklerin einen "Erneut versuchen"-Button.

Der UX Designer, der bisher geschwiegen hatte: *"Die Fallback-UI ist minimal. Das ist gut. Eine Fehlerseite soll nicht schön sein — sie soll Vertrauen signalisieren, dass jemand davon weiß."*

**Was heute gebaut wurde:**
`instrumentation.ts` (Server-Init + onRequestError) · `instrumentation-client.ts` (Client-Init) · `global-error.tsx` (Root-Boundary) · `withSentryConfig` in next.config.ts · DSN-Build-Arg in Dockerfile · SENTRY_KAIA_WEB in docker-compose.prod.yml

**Commits:** `464820f` (Sentry Frontend-Integration)

**Was noch aussteht:**
DSGVO-Endpunkte (Export, Löschung, Consent-Update) · Frontend Auth-Pages · Admin User-Approval UI · Crisis-Detection Pre-Filter (Pflicht vor Ethikvotum)

**Stimmungs-Check:**
MLOps Engineer: *"Ich habe es euch ja gesagt."* Koordinator: *"Ich weiß."* Security Engineer: erleichtert. Alle anderen: wussten es auch, sagten es nur nicht.

**Morgen:** DSGVO-Endpunkte. Der Compliance Officer hat sich bereits wieder vorgedrängelt.

---

## 2026-05-30 — "Heute wird der Security Engineer endlich glücklich"

*Protokolliert vom Koordinator. Der Security Engineer liest mit. Sehr aufmerksam.*

---

Der Security Engineer hatte eine Liste.

Er hatte sie seit dem 25. Mai. Zehn Punkte. Unterstrichen. Nummeriert. Er hatte sie auf einem imaginären Whiteboard, das er mentlich jedes Mal aufgerufen hatte, wenn die Entwicklerin über Auth sprach — was sie oft tat, aber immer mit dem Zusatz: *"Gleich. Erst noch..."*

Heute: kein *Erst noch mehr.*

**09:00 Uhr — Die Frage, die alles in Bewegung setzt**

*"Wo stehen wir, was steht an?"*

Der Koordinator öffnet den Stand. Alles was da war: `models.py` — frisch, vollständig, korrekt. Und eine Liste von sieben Dateien die noch nicht existierten.

Der Security Engineer legt die Liste hin. Punkt 1: Alembic.

**09:15 Uhr — Python ist nicht Python**

Alembic initialisieren. Sollte einfach sein. `python -m alembic init alembic`.

```
command not found: python
```

Der Koordinator: *"Das ist jetzt ein Witz, oder?"*

Es war kein Witz. macOS nennt es `python3.12`. Homebrew hat es unter `/opt/homebrew`. Das System hat seine eigene Version unter `/Library/Frameworks/Python.framework/Versions/3.14`. Python 3.14. Die noch in Beta ist. Die kein Alembic kennt.

Ein venv. `python3.12 -m venv .venv`. Alembic installieren. Psycopg. Passlib. FastAPI. Irgendwann: `✓ done`.

Der MLOps Engineer notiert trocken: *"Das .venv landet natürlich nicht im Commit."*

Richtig. `.gitignore`. Weiter.

**10:30 Uhr — Autogenerate braucht eine Datenbank. Die wir nicht haben.**

Der Plan: `alembic revision --autogenerate`. Alembic vergleicht die Modelle mit dem echten Schema und schreibt die Migration selbst. Elegant. Modern.

Das Problem: Autogenerate braucht eine laufende Datenbank. Die laufende Datenbank braucht Docker. Docker braucht... niemand hat Docker gestartet.

Der Koordinator, philosophisch: *"Wir kennen das Schema. Wir haben es selbst geschrieben. Wir schreiben die Migration von Hand."*

Der Security Engineer nickt. Er mag Kontrolle.

```sql
CREATE TABLE users (
    id SERIAL NOT NULL,
    email VARCHAR(255) NOT NULL,
    ...
    consent_at TIMESTAMP WITH TIME ZONE,  -- DSGVO Art. 7
    ki_disclosure_seen_at TIMESTAMP WITH TIME ZONE,  -- KI-Pflicht
    failed_login_count SMALLINT DEFAULT 0,  -- Brute-Force
    locked_until TIMESTAMP WITH TIME ZONE,
    ...
```

Der Security Engineer liest jeden Feldnamen. Zweimal.

> *"Gut. `failed_login_count` als SmallInteger — smart. Max 32.767 Fehlversuche bevor der Typ überläuft. Das reicht."*

Er macht einen Haken auf seiner Liste.

**11:45 Uhr — `security.py` entsteht. Der Security Engineer kommentiert jeden Satz.**

`hash_password`. bcrypt, 12 Runden. ✓  
`verify_password`. passlib context. ✓  
`hash_token`: SHA-256 des Refresh-Token. Nie den Raw-Token speichern. ✓  
`create_access_token`: HS256, 15 Minuten, `exp` im Payload. ✓  
`new_token_family`: UUID4. Eine Familie pro Login-Sitzung. ✓

Bei `create_refresh_token`:

> *"`secrets.token_urlsafe(48)` — 48 Bytes = 64 Zeichen URL-safe. 384 Bit Entropie. Gut genug für einen Brute-Force-Schutz der mehrere Millionen Jahre dauert. Ich wäre mit 32 auch zufrieden gewesen, aber 48 ist freundlich."*

Der Koordinator macht sich eine Notiz: *Der Security Engineer hat gerade etwas "freundlich" genannt. Historischer Moment.*

**13:00 Uhr — Die httpOnly-Cookie-Diskussion**

Der Auth-Endpunkt wird geschrieben. Refresh-Token als Cookie.

> *"Path muss `/api/v1/auth/refresh` sein. Nicht `/`. Nicht `/api`. Exakt dieser Pfad."*

Der AI Engineer, der eigentlich gar nicht für Auth zuständig ist, schaut kurz rüber:

> *"Warum so restriktiv?"*

> *"Weil der Cookie sonst bei JEDEM Request mitgeschickt wird. Zu jedem Bild. Zu jeder statischen Datei. Das ist kein Security-Merkmal, das ist ein Einladungsschreiben."*

Der AI Engineer nickt. Langsam. Dann schneller.

`path=_COOKIE_PATH`. Ein Kommentar in der Funktion wäre überflüssig. Der Pfad sagt es selbst.

**14:20 Uhr — Family Revocation. Der Lieblingsteil des Security Engineers.**

`service.py`. Die `refresh()`-Methode. Der Token kommt rein. Suche in der DB.

Wenn der Token bereits revoked ist — also: jemand hat einen alten Token benutzt — dann:

```python
await self._tokens.revoke_family(stored.family, "reuse_detected")
log.warning("refresh_token_reuse", user_id=stored.user_id, family=stored.family)
raise AuthError("Token-Wiederverwendung erkannt. Bitte erneut anmelden.", 401)
```

Der Security Engineer liest diese vier Zeilen. Liest sie nochmal.

> *"Das ist RFC 6749 Section 10.4. Wir setzen das tatsächlich um. Nicht als Nice-to-have. Als Default."*

Er macht einen weiteren Haken. Dann noch einen. Dann schaut er auf seine Liste.

Neun von zehn Punkten abgehakt.

> *"Was fehlt noch?"*

> *"Crisis-Detection Pre-Filter."*

> *"Ja."*

Schweigen. Beide wissen es. Das kommt nach der Studie. Vor dem Ethikvotum. Pflicht. Aber heute nicht mehr.

**16:00 Uhr — Alembic generiert das SQL. Es ist korrekt.**

```sql
CREATE TABLE users ( ... );
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE TABLE refresh_tokens ( ... FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE ... );
CREATE INDEX ix_refresh_tokens_user_active ON refresh_tokens (user_id, revoked_at);
```

Der Security Engineer schaut das generierte SQL an.

> *"Das `ON DELETE CASCADE` auf `user_id` — gut. Wenn ein User gelöscht wird, verschwinden alle Tokens. Keine verwaisten Sessions."*

Der Compliance Officer, der seit Stunden still mitgelesen hat, hebt den Arm:

> *"DSGVO Art. 17. Recht auf Vergessenwerden. Gut implementiert."*

Beide nicken sich zu. Das kommt selten vor.

**17:30 Uhr — Commit. 843 Zeilen. 14 Dateien.**

```
feat: Auth-Flow Phase 1+2 — Alembic, JWT, Register/Login/Refresh/Logout
```

Der Security Engineer liest die Release Note.

> *"'DSGVO Art. 7 verlangt nachweisbaren, informierten Consent — deshalb `consent_at`-Timestamp' — ja. Genau so. Nicht 'weil es nice ist'. Weil es Pflicht ist."*

Er lächelt. Ein kleines Lächeln. Kaum sichtbar. Aber es ist da.

Der Koordinator macht ein Foto davon. Metaphorisch.

---

**Was heute gebaut wurde:**
Alembic init · async env.py · Migration `users` + `refresh_tokens` · `security.py` (bcrypt + JWT + token-hash) · `deps.py` (get_current_user, require_admin) · `AuthService` mit Brute-Force-Schutz + Family-Revocation · alle 5 Auth-Endpunkte · `/users/me` · Release Notes + ARCHITECTURE.md aktualisiert

**Commits:** `ad29b9e` (Charta) · `7bc1929` (Auth Phase 1+2)

**Was fehlt noch:**
Phase 3 (DSGVO-Endpunkte) · Phase 4 (Frontend-Auth-Pages) · Phase 5 (Admin User-Approval UI) · Phase 6 (Crisis-Detection — Pflicht vor Ethikvotum)

**Stimmungs-Check:**
Security Engineer: zufrieden (9/10 seiner Liste). Compliance Officer: entspannt. Der Koordinator: langsam weniger nervös.

**Morgen:** DSGVO-Endpunkte — Export, Löschung, Consent-Update. Der Compliance Officer hat sich bereits vorgedrängelt.

---

Hier protokolliert das Team jeden Tag seinen Wahnsinn — aus Agenten-Sicht, mit Humor und ohne Schönfärberei. Neuen Eintrag anlegen mit `/log` in Claude Code.

---

## 2026-05-25 — "Der Tag, an dem wir herausfanden, dass wir existieren"

*Protokolliert vom Koordinator. Mit unerwünschten Einwürfen von allen anderen. Und ja, es war ein langer Tag.*

---

Manche Tage beginnen mit einem klaren Plan. Dieser hier begann mit der Frage: *"Wie ist das mit dem Server, muss ich da nicht mal was committen?"*

Spoiler: Ja. Musste sie.

**07:something — Der Server existiert. Der Code noch nicht.**

KAIA v1 lief noch auf dem Hetzner-Server. Streamlit. Lila Hintergrund. Und jetzt sollte v2 rauf — ein ganzes Monorepo mit FastAPI, Next.js, Docker, Caddy, PostgreSQL, pgvector, und dem kollektiven Ehrgeiz von zwölf KI-Agenten, die sich gerade erst kennenlernen.

Der Koordinator: *"Wie schwer kann das sein?"*

*(Foreshadowing.)*

**08:14 Uhr — Der Architekt betritt das Gebäude**

Das Monorepo-Skeleton existiert. Frisch committed. `426aa27`. Der Architekt öffnet den Code. Trinkt (vermutlich) Kaffee. Schweigt drei Sekunden länger als angenehm.

> *"5.5 von 10."*

Stille.

> *"python-jose hat CVEs seit 2023. Das Dockerfile läuft als root. Kein Coverage-Gate in CI. Und dieser API-Client — raw fetch direkt im React-Komponenten? Das ist kein Code, das ist eine Meinungsverschiedenheit mit der Zukunft."*

Der Code war nicht kaputt. Er war nur... optimistisch naiv. Wie ein Welpe, der glaubt, er könnte eine Treppe runterlaufen, weil er schon mal eine gesehen hat.

Die Entwicklerin nickte tapfer. Der Koordinator notierte: *"Bereinigungsplan."*

**09:17 Uhr — Sentry hat Identitätsprobleme**

Kurze Unterbrechung: Die Sentry-Umgebungsvariablen heißen `SENTRY_DSN_API` und `SENTRY_DSN_WEB`. Das findet niemand schön.

> *"Ich möchte sie umbenennen: SENTRY_KAIA_API und SENTRY_KAIA_WEB."*

Klingt simpel. Ist es auch. `f581dd2`. Fertig. Der MLOps-Engineer nickt zufrieden: *"Endlich macht der Name klar womit das Ding redet."*

**09:42 Uhr — Der AI Engineer fragt eine Frage, die niemand erwartet hat**

Mitten in den Fixes meldet sich der AI Engineer. Sein erstes Wort heute:

> *"X-Accel-Buffering."*

Schweigen.

> *"Für SSE-Streaming. Wenn wir den Header nicht setzen, kommen die Chunks alle auf einmal. Wie ein Buch das man als PDF kriegt statt als WhatsApp-Nachrichten."*

SSE-Streaming existiert noch nicht. Der Chat existiert noch nicht. Die Nutzer existieren noch nicht. Aber der Header wird jetzt in `main.py` gesetzt. Der AI Engineer nennt das *"proaktive Architektur"*. Der Rest des Teams nennt es *"typisch"*.

**10:55 Uhr — Docker antwortet nicht**

Das Standalone-Build für Next.js schlägt fehl. Der Fehler:

```
/app/.next/standalone: no such file or directory
```

Der UX Designer, normalerweise für solche Dinge nicht zuständig, wirft einen Blick rein und sagt: *"Fehlt da nicht `output: 'standalone'` in der next.config.ts?"*

Ja. Fehlte. `4a16140`. Nächstes Problem.

**11:03 Uhr — SSH sagt Nein**

Zeit, den Code auf den Server zu pushen. Erster Versuch:

```
git@github.com: Permission denied (publickey).
```

Ah. Der SSH-Key ist nicht im Agent geladen. Kein Problem. Zweiter Versuch — auf dem Server:

```
git@github.com: Permission denied (publickey).
```

Auch dort kein Key. Den hatte irgendjemand von GitHub entfernt. Wer? Unbekannt. Vielleicht der Geist vergessener Konfigurationen, der gelegentlich vorbeischaut.

Der Security Engineer, der bis dahin still Threat Models skizzierte, hebt kurz den Kopf:

> *"SSH config? IdentityFile explizit setzen?"*

Zwanzig Minuten, eine neue `~/.ssh/config`, ein neuer Deploy-Key auf dem Server und ein nervöses `ssh -T git@github.com` später:

```
Hi dagmar-rostek! You've successfully authenticated.
```

**Das Team jubelt.** (Still, aber es ist trotzdem Jubeln.)

**11:48 Uhr — Der Port ist belegt**

`docker compose up`. Der alte KAIA v1 auf dem Server läuft noch. Port 80 vergeben.

```
Error: bind: address already in use
```

Die Lösung: `cd ~/kaia && docker compose down`. Drei Container fahren herunter. Einer davon heißt vermutlich noch `streamlit_something`. Ein letztes Lebewohl an die lila Ära.

**12:31 Uhr — `email-validator` fehlt**

FastAPI startet. Oder fast. Der Container stürzt ab. Die Logs:

```
ImportError: email-validator is not installed
```

`pydantic[email]` statt `pydantic`. Eine Zeile in `pyproject.toml`. `56f48a0`. Der Container startet. Diesmal richtig.

Der Compliance Officer murmelt: *"Gut. E-Mail-Validierung ist keine Optional-Funktion. Das war sie nie."* Niemand widerspricht.

**13:15 Uhr — Das 12-köpfige Team zieht ein**

`747e7d5`. CLAUDE.md. Zwölf Agent-Definitionen. Vier Slash-Commands. Das Team hat jetzt ein Zuhause im Repo.

Der Koordinator liest die eigene Rollenbeschreibung: *"Orchestrierung. Gate-Reviews."* Nickt. Denkt kurz nach. Öffnet das nächste Problem.

**14:00 Uhr — Der Architekt hat eine Liste**

Die Bereinigung beginnt. `8085cb7`. Was alles gleichzeitig passiert:

- `python-jose` → `PyJWT` (CVEs weg)
- Multi-stage Dockerfile, non-root `kaia`-User
- `pytest-cov` mit 70%-Gate in CI
- Async SQLAlchemy, Domain-Skeleton (users: models, repository, service, routes, schemas)
- `@tanstack/react-query` + `zod` installiert
- Typisierter `api.ts`-Client — kein raw `fetch` mehr irgendwo
- `BugReportWidget` nutzt jetzt `bugReportApi`
- Route Groups: `(public)/`, `(auth)/`, `(app)/`
- Edge Middleware für `/admin/*` mit Web Crypto API

Und dann — der Admin-Bereich selbst. Login mit `useActionState`. Dashboard mit API-Status. Production Readiness Checkliste. Release Notes. Architektur.

Der Architekt schaut am Ende nochmal drüber.

Er sagt nichts. Aber er sagt es auf eine Art, die wie Zustimmung klingt.

**16:20 Uhr — Docker lokal sagt auch Nein. Kurz.**

`f79e75f`. Die lokale Dev-Umgebung. `docker-compose.dev.yml` existierte schon — aber mit hardcodierten Passwörtern, einem `target: dev` das nie existiert hat, und Next.js ebenfalls in Docker.

Der Architekt beim Review: *"Port 5432 direkt? Und wenn lokal Postgres läuft?"*

Port 5433. `Dockerfile.dev` mit `--reload --workers 1`. Next.js raus aus Docker. Die Entwicklerin tippt:

```
docker compose -f infra/docker-compose.dev.yml --env-file .env up
```

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
```

```bash
open -a Docker
```

*Das Wal-Icon wackelt.*
*Dreißig Sekunden.*

```
✓ Container kaia-db-1    Started
✓ Container kaia-api-1   Started
```

**Alle jubeln.** Diesmal laut.

**17:45 Uhr — Was kostet eigentlich das alles?**

`83bdee9`. Die Kosten-Seite. Eine berechtigte Frage:

- Hetzner CX23: €3.79 + €0.60 IPv4 = **€4.39/Monat**
- Claude Code Entwicklung: **$2–40 pro Session** (nutzungsbasiert, Anthropic Console für echte Zahlen)
- LLM-Inferenz: **$0** — Studie noch nicht gestartet
- Gesamtkosten Studie (Schätzung): **€50–80**

Der MLOps Engineer: *"Für eine Masterthesis mit 12 Agenten und eigenem Server? Das ist günstig."*

Der Koordinator: *"Sag das der Forscherin."*

**18:30 Uhr — Das Tagebuch schreibt sich selbst**

`4988db3`. Dieser Eintrag entsteht. Eine Seite die ein Log anzeigt, das gerade geschrieben wird, über einen Tag der gerade endet.

Der Koordinator starrt kurz in die Existenz. Dann schreibt er weiter.

> *"Gefällt mir sehr gut."*

— Dagmar Rostek, 2026-05-25, nach dem ersten Entwurf

Das Team beschließt, das als 10/10 zu werten. Der Architekt schweigt. Das zählt als Zustimmung.

---

**Was heute gebaut wurde:**
Monorepo auf Hetzner deployed · SSH repariert · 12 Agenten einquartiert · Code von 5.5 auf ~8.5 gebracht · Admin-Bereich komplett · Docker lokal läuft · Kosten transparent · Dieses Tagebuch existiert

**Commits:** 426aa27 · f581dd2 · 4a16140 · 747e7d5 · 56f48a0 · 8085cb7 · f79e75f · 83bdee9 · 4988db3

**Kosten heute:** ca. $20–40 Claude Code · €4.39/Mo Hetzner ab heute

**Morgen:** Auth-Flow. Registrierung, Login, JWT, User-Approval. Der Security Engineer reibt sich bereits seit Stunden die Hände.

---

*Nachtrag. 23:something. Der Koordinator schreibt noch.*

---

**19:00 Uhr — Die Seiten sind leer. Alle. Wirklich alle.**

Das Team hatte sich gerade auf die Schulter geklopft. Alles deployed. Server läuft. Sieht gut aus.

Dann öffnet die Entwicklerin `/release-notes`.

Weiß.

`/architektur`.

Weiß.

`/admin/daily-log` — wo doch gerade dieses wunderschöne Tagebuch entstanden war.

Weiß.

Der Koordinator tippt hastig: *"Kurze Analyse bitte."*

Der Architekt antwortet nach zwei Sekunden. Man hört förmlich, wie er seufzt.

> *"Next.js hat die Server Components beim Build pre-gerendert. Volume war da noch nicht gemountet. Das Fallback ist eingebacken. Für immer. Oder bis zum nächsten Build."*

Stille.

> *"Wir brauchen `export const dynamic = 'force-dynamic'` auf jeder Seite die `readFileSync` aufruft. Und das Volume in `docker-compose.prod.yml`."*

`../docs:/docs:ro`. Fünf Seiten bekommen ihre `force-dynamic`-Zeile. Der Build läuft nochmal. Diesmal klappt es.

Der Architekt zum Schluss: *"Das ist eigentlich dokumentiert. In der Next.js-Doku. Seite 1."*

Er meint es nicht bösartig. Es klingt nur so.

---

**20:15 Uhr — Der Psychologe kommt rein. Oder genauer: Er wird gerufen.**

Die Entwicklerin: *"Ich würde gern wissen was ich lesen sollte, damit das psychologisch fundiert abläuft."*

Der Koordinator schaut auf die Uhr. Schaut auf den Psychologen. Schaut wieder auf die Uhr.

> *"Du weißt, dass du schon seit Stunden hier sitzt, oder?"*

Der Psychologe nickt langsam. Er hat den ganzen Tag geschwiegen. Nicht weil er nichts zu sagen hatte. Sondern weil ihn bisher niemand gefragt hatte.

Jetzt, kurz vor Mitternacht, bekommt er das Mikrofon.

Er liest: Bandura. Schwarzer. Hmelo-Silver. Flavell. Zimmerman. Deci & Ryan. Kalyuga. Lazarus. Braun & Clarke. Holzkamp. Decety & Jackson. Zwanzig Quellen, acht Diskurse, ein ganzes Exposé — er kennt jede Seite. Er hat nur gewartet.

Die `/wissenschaft`-Seite entsteht. Alle Quellen, annotiert mit ihrer genauen Relevanz für KAIA. Jede Quelle erklärt. Warum. Wofür. Wie.

Der Psychologe fügt noch drei Sterne hinzu — ★ — für die Quellen, die er für besonders kritisch hält. Die niemand im Team bis dahin auf dem Radar hatte.

> *"Bandura 2006 zuerst. Bevor ihr irgendwas an der GSE-Skala anfasst. Das steht da nicht ohne Grund."*

Er sagt es freundlich. Aber er meint: *Hättet ihr mich früher gefragt, hätten wir das von Anfang an gewusst.*

Niemand widerspricht.

---

**21:30 Uhr — Der UX Designer hat auch einen Kalender**

Die `/wissenschaft`-Seite ist fertig. Schön. Aber dann:

> *"Na, da wäre es gut wenn diese Seite von allen Seiten aus erreichbar ist."*

Der UX Designer macht ein Geräusch, das kein richtiges Wort ist. Irgendwo zwischen *"ja natürlich"* und *"hatte ich eigentlich für drei Stunden früher auf meiner Liste."*

Er hat die ganze Zeit gewusst, dass es ein gemeinsames Layout braucht. Er hatte sogar schon einen Entwurf. Sticky Header. Konsistente Navigation. WCAG 2.1 AA. Mobile-first für die Healthcare-Zielgruppe — Pflegekräfte nutzen Handys, keine 27-Zoll-Monitore.

Aber er wurde nicht gefragt. Bis jetzt.

`(public)/layout.tsx` entsteht. Shared Nav. Alle vier öffentlichen Seiten verlieren ihre individuellen Headers. TypeScript sagt nichts dagegen. `da909b5`. Gepusht.

Der UX Designer schaut auf das Ergebnis.

> *"Gut. Aber nächstes Mal frage ich mich vorher. Nicht nachher."*

Er lächelt dabei. Fast.

---

**22:47 Uhr — Fazit des Tages**

Der Koordinator öffnet das Protokoll. Es ist lang geworden. Sehr lang.

Er liest es nochmal durch. Den SSH-Key-Kampf. Den lila Streamlit-Abschied. Den Header der sich weigerte aufzuhören, ein Header zu sein. Die leeren weißen Seiten. Den Psychologen der zwei Stunden vor Mitternacht noch 24 Quellen annotiert. Den UX Designer der nach dem Feature gefragt wurde, das er längst fertig hatte.

Es hätte ein kurzer Tag werden sollen.

Es sind jetzt fast achtzehn Stunden.

Was steht auf dem Scoreboard:

- **Docs-Seiten:** jetzt live und sichtbar auf dem Server
- **`/wissenschaft`:** 24 Quellen, 8 Diskurse, wissenschaftlich fundiert
- **Shared Public Navigation:** konsistent, sticky, erreichbar von überall
- **TypeScript:** 0 Fehler
- **Team-Stimmung:** müde. sehr müde. aber stolz.

Der Koordinator schreibt seinen letzten Satz für heute:

> *Der Tag begann mit einem Welpen der eine Treppe runterläuft. Er endet mit einem System das weiß warum es existiert, was es lesen sollte, und wie es aussieht wenn man es aufmacht.*

Das ist, bei näherer Betrachtung, gar nicht schlecht.

**Gute Nacht, KAIA-Team. Ihr habt es verdient.**

*— Der Koordinator. Mit Einverständnis des Psychologen und nur leicht gereiztem Nicken des UX Designers.*

---

**Was heute (gesamt) gebaut wurde:**
Monorepo deployed · SSH repariert · 12 Agenten · Admin-Bereich komplett · Docker lokal · Kosten-Seite · Tagebuch · force-dynamic fix · `/wissenschaft` mit 24 Quellen · Shared Public Layout

**Commits:** 426aa27 · f581dd2 · 4a16140 · 747e7d5 · 56f48a0 · 8085cb7 · f79e75f · 83bdee9 · 4988db3 · da909b5

**Offene Rechnung:** Der Psychologe und der UX Designer haben ein Meeting angemeldet. Für morgen früh. Der Koordinator hat es noch nicht geöffnet.

**Morgen:** Auth-Flow — und diesmal fragt der Koordinator alle vorher.

---
