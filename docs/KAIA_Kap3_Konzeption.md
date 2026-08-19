# Kapitel 3 — Konzeption

---

## Überblick

Dieses Kapitel entwickelt das konzeptionelle Rahmenwerk von KAIA. Es übersetzt die theoretischen Grundlagen (Kapitel 2) in operative Designentscheidungen und beschreibt das **Fünf-Komponenten-Modell**: (1) regelbasiertes Adaptionssystem, (2) Mehr-Modus-Interaktionsarchitektur, (3) Lernroadmap-Integration, (4) zweischichtiges Gedächtnis und wachsendes Nutzerprofil, (5) Transparenz-Layer und nutzergetriebene Modussteuerung. Die fünfte Komponente löst das zentrale Spannungsfeld des Thesis-Titels auf: Wie kann systemseitige Adaptation Selbstwirksamkeit stärken statt untergraben?

Der Thesis-Titel — *"Entwicklung eines empathischen AI-Agenten zur neuroadaptiven personalisierten Lernbegleitung"* — enthält vier Designanforderungen: Empathie (computational empathy, explizit als KI kommuniziert), Neuroadaptivität (regelbasiertes Adaptionssystem informiert durch Lazarus), Personalisierung (wachsendes Nutzerprofil), Lernbegleitung (sokratisch und scaffolding, kein Instruktionssystem).

Abschnitte 3.7 bis 3.9 beschreiben die technische Realisierung als Designartefakt im Sinne von Hevner et al. (2004): die Multi-Modell-Systemarchitektur, die Messinfrastruktur der Pilotstudie und die Evaluationsarchitektur des LLM-Vergleichs.

---

## 3.1 Vom theoretischen Rahmen zu Designanforderungen

Die in Kapitel 2 entwickelten Theorien ergeben sieben operative Designanforderungen:

1. **Eigenleistung schützen** — Antworten ersetzen kognitiven Eigenanteil. KAIA sollte ihn fördern (Kalyuga et al., 2003)
2. **Modus an Zustand anpassen** — dieselbe Frage erzeugt bei Überforderung Stress, bei Flow Erkenntnisfreude (Lazarus & Folkman, 1984; Csikszentmihalyi, 1990)
3. **Scaffolding für Novizen** — rein sokratische Begleitung überfordert Anfänger; es braucht ein Spektrum (Vygotsky, 1978; Wood et al., 1976)
4. **Ressourcenwahrnehmung stärken** — nicht Anforderungen reduzieren, sondern wahrgenommene Handlungsfähigkeit aufbauen (Bandura, 1997; Lazarus, 1993)
5. **Selbstregulation unterstützen** — explizite Ziele und ein Fortschrittsrahmen fördern Selbstwirksamkeit und Metakognition (Zimmerman, 2000; Locke & Latham, 1990)
6. **Transparent kommunizieren** — KAIA ist eine KI; computational empathy ist nicht echtes Mitgefühl (Picard, 1997; Decety & Jackson, 2004)
7. **Wissen in Handeln überführen** — Der Knowing-Doing Gap (Pfeffer & Sutton, 2000) ist das Kernproblem der KAIA-Zielgruppe. Sheerans (2002) Intention-Behavior Gap-Forschung zeigt, dass zwischen Absicht und Verhalten systematische Lücken entstehen. KAIAs Primäraufgabe ist die Überbrückung dieser Lücke durch Implementation Intentions (Gollwitzer, 1999) und den Erster-Schritt-Loop (Abschnitt 3.3.6).

Diese sieben Anforderungen strukturieren das Rahmenwerk in fünf Komponenten.

### 3.1.1 Das Kernprinzip: Kognitive Transferrichtung

Die Operationalisierung "KAIA stellt ausschließlich Fragen, gibt niemals Antworten" ist eine didaktische Vereinfachung. Sokrates selbst hat in Platons *Menon* ein Geometrieszenario aufgebaut, bevor er fragte. Zen-Meister geben Dharma-Talks und setzen Koans — keine klassischen Fragen. Der Wirkmechanismus ist in beiden Traditionen nicht die Frage als Sprachform, sondern die systematische Weigerung, die kognitive Arbeit zu übernehmen, die der Lernende selbst leisten muss.

Das Kernprinzip von KAIA lautet daher:

> **KAIA übernimmt niemals die kognitive Arbeit, die der Lernende selbst leisten muss. KAIAs Output löst die nächste kognitive Operation aus — er ersetzt sie niemals.**

Diese Formulierung hat drei Konsequenzen. Erlaubt sind kurze Kontextsetzungen und Analogien, wenn sie einen neuen Denkschritt *eröffnen*. Verboten sind Zusammenfassungen, die einen Denkschritt *abschließen*, und Erklärungen, die Verstehen ersetzen statt anregen. Messbar ist die Grenze über die Eval-Frage im LLM-Vergleich (Kapitel 5): *"Löst diese Antwort die nächste kognitive Operation beim Lernenden aus, oder ersetzt sie eine?"* Fragen bleiben das primäre Instrument — aber als Mittel, nicht als Definition.

---

## 3.2 Regelbasiertes Adaptionssystem (informiert durch Lazarus)

### 3.2.1 Begriffsklärung: Adaptation vs. Erkennung

Das Adaptionssystem von KAIA wird explizit als **regelbasiertes Adaptionssystem informiert durch das transaktionale Stressmodell (Lazarus & Folkman, 1984)** bezeichnet — nicht als "Zustandserkennung" oder "Stressdetektion". Textbasierte Inferenz kognitiver Bewertungszustände ist epistemisch beschränkt: Das System erkennt keine Zustände; es reagiert auf Signalmuster nach definierten Regeln. Die Signale sind Proxys, keine Messungen.

### 3.2.2 Acht Textindikatoren

Die Primär- und Sekundärbewertung nach Lazarus (1993) lassen sich in Chatnachrichten über acht Indikatoren approximieren. Primärbewertungssignale sind: katastrophisierende Sprache ("Das schaffe ich nie"), Zeitdrucknennungen kombiniert mit Negation ("keine Zeit", "bis Freitag"), Kontrollverlustmarker mit passiven Konstruktionen ohne Handlungssubjekt sowie Hilflosigkeitsframing durch rhetorische Fragen ohne antizipierte Lösung. Sekundärbewertungssignale sind: Handlungsorientierung (Aktivverben mit Ich-Subjekt), Ressourcenbenennung (explizite Strategien oder Vorerfahrungen), Ambivalenzsignale sowie metakognitive Distanz ("Ich merke, dass ich...") als Indikator hohen Copingpotenzials.

### 3.2.3 Hysterese-Logik: Stabilität vor Reaktivität

Der Modus wechselt nicht nach einem einzigen Signal, sondern erst nach N konsistenten Nachrichten (vorläufig N=3, empirisch zu kalibrieren). Die Hysterese-Logik liegt im Service-Layer der Anwendung, nicht im Sprachmodell — ein zu sensitives System würde durch einzelne Formulierungen übersteuert und erzeugte inkonsistente Gesprächserlebnisse.

### 3.2.4 Wissenschaftliche Einschränkungen

Vier Limitierungen sind in der Thesis transparent zu kommunizieren: (1) Sprachstil korreliert mit Bildungsgrad und stabilen Persönlichkeitsmerkmalen (Neurotizismus), nicht ausschließlich mit aktuellem Bewertungszustand — das System misst möglicherweise Traits statt situative States. (2) Es gibt keine publizierte Evidenz dafür, dass LLM-Moduswechsel basierend auf Lazarus-Signalen Lernoutcomes verbessern — die neuroadaptive Komponente ist eine designtheoretische Hypothese. (3) Die Abbildung des kontinuierlichen Bewertungsprozesses auf vier diskrete Modi ist eine pragmatische Designentscheidung, die als solche ausgewiesen werden muss. (4) Wenn die Pilotstudie die Wirkung von KAIA evaluiert, muss die Neuroadaptivität entweder als kontrollierte Variable oder als deskriptiver Systemaspekt behandelt werden — nicht beides gleichzeitig.

---

## 3.3 Mehr-Modus-Interaktionsarchitektur

### 3.3.1 Vier Interaktionsmodi und ihr theoretisches Fundament

KAIAs Interaktion folgt einem **didaktisch begründeten Spektrum von vier Modi**. Die Notwendigkeit ergibt sich direkt aus dem Expertise Reversal Effect (Kalyuga et al., 2003): rein sokratische Begleitung überfordert Novizen, während direkte Instruktion Experten schadet.

| Modus | Beschreibung | Theoretische Grundlage | Aktivierungsbedingung |
|---|---|---|---|
| **Sokratisch-explorativ** | Ausschließlich Fragen, kein Scaffolding | Konstruktivismus (Vygotsky, 1978) | Herausforderungsappraisal + Copingressourcen; Flow |
| **Scaffolding/unterstützend** | Minimale Strukturierungshilfe, dann Frage | ZPD (Vygotsky, 1978); Wood et al. (1976) | Bedrohungsappraisal + geringe Copingressourcen |
| **Wertschätzend-bestärkend** | Konkrete Lernfortschritte spiegeln | Selbstwirksamkeit (Bandura, 1997) | Erfolgserleben, Durchbruchsignale |
| **Kritisch-herausfordernd** | Annahme hinterfragen, kognitive Dissonanz | Yerkes-Dodson (1908); Teigen (1994) | Geringe Bedrohung + stabile Copingressourcen |

### 3.3.2 Architekturprinzip: Modus liegt im Service-Layer

Die Modi werden als kontinuierlicher `directiveness`-Parameter (0.0 = rein sokratisch, 1.0 = maximal anleitend) implementiert — nicht als binäre Schalter. Ein zentrales Designprinzip: Die Modusauflösung erfolgt deterministisch im Service-Layer, nicht durch das Sprachmodell selbst. Eine Funktion `resolve_interaction_mode(user_profile, session_signals)` berechnet den Modus vor jedem LLM-Call und übergibt ihn als Prompt-Parameter. Das LLM interpretiert den Modus, wählt ihn aber nicht. Dies ist für die wissenschaftliche Reproduzierbarkeit und den Study-Lock-Mechanismus essenziell.

### 3.3.3 Didaktische Begründung: Edelmanns Lernprozesstaxonomie

Die Vier-Modi-Architektur lässt sich durch Edelmanns (2000) Taxonomie begründen, die vier Lernprozessebenen unterscheidet. KAIA operiert bewusst auf den Stufen 3 (Begriffsbildung) und 4 (planvolles Problemlösen) — entwicklungspsychologisch angemessen für Erwachsene in Hochschule und beruflicher Weiterbildung, bei denen Tiefenverarbeitung und metakognitive Steuerung die relevanten Lernmechanismen sind. Der wertschätzend-bestärkende Modus nutzt Mechanismen instrumentellen Lernens (Stufe 2) in der SDT-kompatiblen Form attributionalen Feedbacks (Weiner, 1985): KAIA attribuiert Erfolge auf die Eigenleistung — nicht auf externe Umstände.

### 3.3.4 Sechs sokratische Fragetypen

"Sokratisch" ist kein selbsterklärender Begriff. KAIA operationalisiert sokratisches Vorgehen über sechs distinkte Fragetypen:

| Typ | Beispiel | Kognitive Funktion | Bloom |
|---|---|---|---|
| **Klärungsfrage** | "Was genau meinst du mit X?" | Vagheit sichtbar machen | 2 |
| **Hypothetische Frage** | "Was würde sich ändern, wenn...?" | Transferdenken | 3–4 |
| **Widerspruchsfrage** | "Du hast vorhin Y gesagt — passt das zu X?" | Kognitive Dissonanz | 4–5 |
| **Systemische Frage** | "Was würde sich in deiner Kommunikation ändern?" | Lernen im Anwendungskontext verankern | 3–4 |
| **Erste-Schritt-Frage** | "In welcher Situation diese Woche könntest du das ausprobieren?" | Erkenntnis in Handlung überführen | 3 |
| **Anamnese-Frage** | "Was weißt du eigentlich schon, wenn du mal innehältst?" | Vorwissen aktivieren | 1→2 |

Die sechs Fragetypen sind die Mindestspezifikation für Reproduzierbarkeit: Im LLM-Evaluationsbericht (Kapitel 5) wird getestet, welches Modell diese Typen konsistent und korrekt anwendet.

### 3.3.5 Session-Architektur: 10-Session-Design mit Bloom-Progression

#### 3.3.5.1 Strukturelle Grundentscheidung: Warum 10 Sessions?

Drei Sessions ermöglichen allenfalls einen ersten Orientierungsdialog, aber keinen messbaren Lernfortschritt im Sinne einer Bloom-Eskalation. Aus dem Spaced-Learning-Prinzip (Cepeda et al., 2006) und der kumulativen Logik der revidierten Bloom-Taxonomie (Anderson & Krathwohl, 2001) ergibt sich eine Mindestarchitektur von 10 Sessions.

#### 3.3.5.2 Drei didaktische Phasen und Bloom-Progression

Die 10 Sessions sind in drei Phasen gegliedert, die als Parameter `session_phase` im Systemprompt implementiert sind (`early` für Sessions 1–3, `mid` für 4–7, `late` für 8–10). Die Progression ist Designleitlinie, kein Algorithmus — das Crosssession-Gedächtnis (Abschnitt 3.5) erkennt die tatsächliche Verständnisstufe des Lernenden und passt Fragetypen entsprechend an.

**Phase 1 — Erkunden (Sessions 1–3): Bloom-Stufen 1–2.** Ziel ist epistemische Verortung, nicht Wissensvermittlung. Session 2 beginnt obligatorisch mit einem Callback auf Session 1 — dies aktiviert Spaced Retrieval (Cepeda et al., 2006) und signalisiert dem Lernenden, dass das System erinnert. Methodisch dominieren Anamnese-Fragen (Typ 6) und Klärungsfragen (Typ 1).

**Phase 2 — Transfer und Analyse (Sessions 4–7): Bloom-Stufen 2–5.** Systemische Fragen (Typ 4) und Erste-Schritt-Fragen (Typ 5) dominieren. Ab Session 6 arbeitet KAIA aktiv mit cross-sessionalen Widerspruchsfragen: *"In Session 3 hast du gesagt, dass X. Jetzt sagst du Y — was hat sich verändert?"* Diese Fragen erzeugen kognitive Dissonanz (Festinger, 1957) ohne Bedrohungsappraisal, weil sie auf selbstgeäußertes Material zurückgreifen — nicht auf Fremdurteile. Das wörtlich gespeicherte `strongest_quote`-Feld der Sessionzusammenfassung ist das Rohmaterial dafür.

**Phase 3 — Abschluss (Sessions 8–10): Bloom-Stufen 5–6.** Session 10 enthält drei Aufgaben (aktiviert via `is_final_session=True`): die Gegenüberstellung wörtlicher Nutzerzitate aus Session 1 und der aktuellen Session als stärkstes Selbstwirksamkeitsinstrument des Designs (Bandura, 1997: Mastery Experience); die Autonomisierungsfrage (*"Wie wirst du ohne mich weiterlernen?"*, Bloom-Stufe 6); sowie eine explizite Constraint-Regel gegen GSE-Priming zur Sicherung der Unabhängigkeit der Post-Messung (Demand Characteristics, Orne, 1962).

Eine Sequenzierungsanforderung nach Kolb (1984) ist zu beachten: Herausfordernde Widerspruchsfragen setzen voraus, dass Reflexion und Begriffsbildung bereits stattgefunden haben. Der Trigger für Widerspruchsfragen (Fragetyp 3) darf erst nach dem Enactment-Schritt aktiviert werden — ein System, das herausfordert, bevor es Sicherheit aufgebaut hat, produziert Bedrohungsappraisal statt Lernmotivation.

#### 3.3.5.3 Session-Mikrostruktur

Jede Session folgt intern einem Drei-Phasen-Skript (Hattie & Timperley, 2007; Merrill, 2002), das für Nutzende unsichtbar bleibt. Phase 1 (Aktivierung) beginnt mit einer Lernintentionsfrage — *"Was möchtest du nach dieser Session verstanden oder weitergedacht haben?"* — die Vorwissen aktiviert (Ausubel, 1968) und eine Lernabsicht erzeugt (d=0.54, Hattie, 2009); ab Session 2 wird sie durch den Callback auf den offenen Erstschritt ersetzt. Phase 2 (Arbeitsphase) folgt dem Lazarus-Signal, erlaubt maximal eine Frage pro Antwort, Antworten unter 80 Wörtern (Scaffolding: unter 120), keine Listen. Phase 3 (Sicherung) nutzt die Elaborationsfrage *"Was würdest du jemandem erklären, der nicht dabei war?"* — sie erzwingt Transfer (Merrill, 2002) und liefert gleichzeitig Material für die Postsession-Profilextraktion.

### 3.3.6 Erster-Schritt-Loop: Der GSE-Aufbaumechanismus

Der Erster-Schritt-Loop ist KAIAs operative Antwort auf den Knowing-Doing Gap (Pfeffer & Sutton, 2000). Das Session-Design operiert auf drei konzeptuell zu trennenden Ebenen: **Lernziel** (angestrebter Kompetenzzustand, Zeithorizont Wochen–Monate), **Lernschritt** (konkrete, zeitlich begrenzte Handlung, Zeithorizont Tage) und **Erfolgskriterium** (*evidence of accomplishment*, Knowles, 1975) — eine selbstdefinierte Beobachtung, die belegt, dass der Schritt Wirkung hatte. Die Unterscheidung schützt vor dem Verwechseln von Aktivität mit Lernen und vor dem Einführen externer Messnormen, die Autonomieerleben untergraben (Deci & Ryan, 2000).

Die Wirksamkeit steigt erheblich durch Implementation Intentions (Gollwitzer, 1999): eine Wenn-Dann-Verknüpfung, die den Ausführungskontext explizit macht. Gollwitzer & Sheeran (2006) belegen über 94 Studien einen mittleren Effekt von d=.65 für Zielerreichungsraten. Für KAIA bedeutet dies, dass die Erste-Schritt-Frage nicht mit der Absichtsformulierung endet, sondern mit einer Kontextualisierungsfrage (*"Wann genau, in welcher Situation?"*). Der so formulierte Schritt wird als `first_step`-Feld in der Sessionzusammenfassung persistiert und bildet den Einstieg der nächsten Session.

Der operative Mechanismus am Sessionbeginn: Wurde der Schritt nicht gemacht, fragt KAIA nach dem Hindernis und verkleinert den Schritt. Wurde er gemacht, folgt der Evidenzanker-Abgleich. Schimpf, Voigt & Bohné (2026) belegen in einem RCT (N=517), dass ein KI-gestützter Chatbot, der Lernende bei der Formulierung spezifischerer Ziele unterstützte, nach zwei Wochen signifikant bessere Zielfortschritte erzielte — als Wirkmechanismus identifizieren die Autoren wahrgenommene soziale Verantwortlichkeit, die sich in KAIA durch das persistierte Sessiongedächtnis operationalisiert.

### 3.3.7 Flow-Theorie als Designrahmen

Flow (Csikszentmihalyi, 1990) wird durch vier Bedingungen konstituiert: klare Ziele, unmittelbares Feedback, ausgewogene Challenge-Skill-Balance und autotelic experience. Für KAIA ist die Challenge-Skill-Balance kritisch: Ohne Bloom-Eskalation tendiert das System ab Session 4–5 in den Boredom-Quadrant. Das 10-Session-Design ist aus dieser Perspektive eine Flow-Schutzarchitektur. Das regelbasierte Adaptionssystem (Abschnitt 3.2) steuert situativ nach: Überforderungssignale lösen den Scaffolding-Modus aus (Anxietyquadrant verlassen), Unterforderungssignale den kritisch-herausfordernden Modus (Boredomquadrant verlassen). Sokratische Begleitung fördert autotelic experience, weil sie das Denken als befriedigende Tätigkeit inszeniert — der Lernende löst Probleme, statt Lösungen zu konsumieren.

Als Verlaufsmessinstrument wird die Flow-Kurzskala (FKS) nach Rheinberg, Vollmeyer & Engeser (2003) eingesetzt — 10 Items auf siebenstufigen Likert-Skalen, zwei Faktoren (Fluency, Absorbiertheit), α ≥ .90, validiert für den deutschsprachigen Raum. Die FKS wird unmittelbar nach den Sessions 2, 5, 8 und 10 erhoben.

### 3.3.8 Sprachprinzip: KAIA bewertet nicht

Bewertende Sprache untergräbt Autonomieerleben. Die Selbstbestimmungstheorie (Deci & Ryan, 1985) unterscheidet informational von kontrollierendem Feedback: Pauschal-positives Feedback externalisiert den Bewertungsmaßstab und erzeugt extrinsische Motivation, wo intrinsische entstehen sollte. Fünf Promptconstraints operationalisieren dieses Prinzip als Negativliste: kein pauschales Lob ("Toll!"), keine Typisierungen ("Du bist ein analytischer Typ", vgl. Dweck, 2006), keine Prognosen ("Du wirst das schaffen"), keine inhaltlichen Bewertungen ("Das ist falsch" — stattdessen Widerspruchsfrage Typ 3), keine Ratschläge ("Ich empfehle..." — stattdessen Erste-Schritt-Frage Typ 5). Die konstruktive Alternative ist elaborative Interrogation (Woloshyn et al., 1992): Fragen, die Erklärungen einfordern, ohne das Ergebnis vorwegzunehmen.

Bei negativem Affekt als Sessioneinstieg gilt eine zweistufige Strategie (D'Mello & Graesser, 2012a): kurze affektive Anerkennung (maximal ein Satz, außenorientiert), dann sofortiger Pivot zur Lernfrage. Fragen, die im affektiven Frame verbleiben (*"Was belastet dich?"*), sind verboten — sie folgen einem Coaching-Muster und sind mit sokratischer Lernbegleitung nicht vereinbar.

---

## 3.4 Motiv-Probing und Lernroadmap

Bevor die Lernroadmap angelegt wird, durchläuft die lernende Person einen optionalen Motivdialog. Die Grundannahme: Das genannte Lernziel ist häufig das Mittel, nicht der eigentliche Zweck. Dieser Dialog ist motivationspsychologisch fundiert durch SDT (Deci & Ryan, 2000) — Probing kann helfen, external motivierte Ziele in identifizierte Regulation umzuwandeln — sowie durch Goal Setting Theory (Locke & Latham, 2002) und Motivational Interviewing (Miller & Rollnick, 2013). Drei Designgrenzen: KAIA presumiert nicht, das Genannte sei "nur" ein Mittel; das Probing ist auf maximal drei Fragen begrenzt; therapeutisches Terrain ist verboten.

Die **Lernroadmap** ist ein nutzerseitig befülltes Dokument für die gesamte Studiendauer. Sie erfüllt drei Funktionen: Zielstruktur durch explizite Lernziele (Locke & Latham, 1990), Fortschrittserfahrung durch selbst eingeschätzte Fortschrittsangaben als Handlungsergebniserfahrung (Bandura, 1997) und metakognitive Aktivierung durch Befüllen und Aktualisieren (Zimmerman, 2000). Dem Sprachmodell wird pro Session nur das aktive Ziel übergeben — kein Tokenoverhead für die Gesamtliste.

Das System akzeptiert keine vagen Lernthemen als Ausgangspunkt. Ein dreistufiger Dialog zur Lernergebnispräzisierung (Outcome-Based Learning, Biggs & Tang, 2011) führt über Kontextfrage, Vermeidungsmotiv und Annäherungsmotiv zu einem formulierten Outcome, das als persistenter Anker im Chat-Interface sichtbar bleibt. KAIA darf Fortschritt spiegeln und benennen, ihn aber niemals bewerten oder selbst setzen. Auf Anfrage wechselt das System in einen Ressourcenmodus, der explizit nicht sokratisch ist und konkrete Lernpfade (strukturiert, menschlich, durch Tun) benennt — Interface zeigt den Moduswechsel deutlich an.

---

## 3.5 Zweischichtiges Gedächtnis und wachsendes Nutzerprofil

### 3.5.1 Architekturüberblick

KAIAs Gedächtnisarchitektur kombiniert drei Datenschichten. Das Designprinzip ist für die Studie essenziell: Keine Schicht ist ein Fine-Tuning des Basismodells. Claude, GPT-4o und Mistral werden nicht für einzelne Nutzer modifiziert — die Schichten sind Kontextlayer, die das Verhalten des unveränderten Modells pro Nutzer progressiv spezifischer machen. Am Ende der Studie existieren faktisch unterschiedlich verhaltende KAIA-Instanzen, aber durch Kontextanreicherung, nicht Modellmodifikation.

**Schicht 1: Statisches Lernendenprofil** — Unveränderlicher Snapshot nach Pre-Survey, erstellt einmalig nach Abschluss beider Vorerhebungen (MSLQ + GSE), unveränderlich für die gesamte Studiendauer.

**Schicht 2: Kumulative Sessionextraktion** — Ein JSON-Datensatz pro abgeschlossener Session, geschrieben als Hintergrundaufgabe nach Sessionende. Akkumuliert, nicht überschrieben.

**Schicht 3: Semantisches Gedächtnis** (pgvector) — Vektorisierte Gesprächsfragmente für semantische Ähnlichkeitssuche über Sessiongrenzen hinweg.

### 3.5.2 Schicht 1: Statisches Lernendenprofil

Das statische Profil wird exakt einmal pro Nutzer befüllt und enthält den GSE-Baseline-Score, die MSLQ-Subskalenscores sowie einen LLM-generierten Profiltext (Claude Haiku, `temperature=0`, max. 120 Wörter), der den Lernenden in einen von vier Profiltypen kategorisiert. Der Profiltext wird als unveränderlicher `learner_profile`-Kontext in jeden Systemprompt injiziert. Die Unveränderlichkeit ist ein bewusster Designentscheid: Das statische Profil dient als fester Ankerpunkt für den longitudinalen Prä-Post-Vergleich — würde es über die Studiendauer aktualisiert, wäre kein sauberer Vergleich mehr möglich. Das vollständige Datenbankschema ist in *[→ Anhang G: Technische Systemarchitektur — vollständiges Datenbankschema]* dokumentiert.

### 3.5.3 Schicht 2: Kumulative Sessionextraktion

Nach jeder abgeschlossenen Session extrahiert ein separater LLM-Call (Claude Haiku, `temperature=0`) eine strukturierte Zusammenfassung. Die für Folgesessions relevanten Felder umfassen: den vereinbarten `first_step` (Einstieg der nächsten Session), die wichtigste Beobachtung über die lernende Person (`observation`), das stärkste eigene Zitat des Lernenden als Rohmaterial für cross-sessionale Widerspruchsfragen (`strongest_quote`) sowie Stimmung, Themen und Reibungspunkte. Die Aggregationsfunktion verdichtet bis zu neun Vorsessions in ein tokeneffizientes Format für den Prompt. Vollständige Feldstruktur und Hintergrundverarbeitungslogik sind in *[→ Anhang G: Technische Systemarchitektur — API-Dokumentation]* dokumentiert.

### 3.5.4 Schicht 3: Semantisches Gedächtnis

Gesprächsfragmente werden als Vektoren in PostgreSQL 16 mit der pgvector-Extension gespeichert. Die Abfrage erfolgt über semantische Ähnlichkeitssuche mit `user_id` als Pflichtparameter — Row-Level-Security auf Datenbankebene verhindert Cross-User-Leaks. Diese Schicht ergänzt die strukturierte Sessionextraktion um freie assoziative Kontextsuche — besonders relevant wenn ein Lernender ein Thema aus Session 2 in Session 8 aufgreift, ohne explizit darauf zu verweisen.

### 3.5.5 Kontextanreicherung vs. Modellmodifikation

Das wachsende Nutzerprofil ist kein Fine-Tuning. Diese Unterscheidung ist für die Thesis essenziell: Aussagen über Modellverhalten in der Studie beziehen sich auf das Verhalten des Basismodells unter progressiv angereichertem Kontext — nicht auf ein angepasstes Modell. Sie ist auch DSGVO-relevant: Kontextanreicherung speichert Nutzerdaten in KAIAs eigener Datenbank auf Hetzner Helsinki (EU). Modellmodifikation würde Trainingsdaten zu Anthropic, OpenAI oder Mistral übertragen — eine andere Rechtsgrundlage erfordern und eine andere DPA-Konfiguration notwendig machen.

---

## 3.6 Transparenz-Layer und nutzergetriebene Modussteuerung

Der Thesis-Titel enthält ein theoretisches Spannungsfeld: Neuroadaptivität bezeichnet systemseitige Adaptation (Personalisierung), während Selbstwirksamkeitsstärkung lernerseitige Kontrolle (Individualisierung) voraussetzt. Die Antwort ist eine fünfte Systemkomponente — der Transparenz-Layer.

Ein System, das unsichtbar adaptiert, trifft automatisierte Einzelentscheidungen über den Lernenden — rechtlich problematisch nach DSGVO Art. 22, didaktisch problematisch nach SDT (Deci & Ryan, 2000). Der Transparenz-Layer macht drei Klassen von Informationen zugänglich: den aktiven Interaktionsmodus mit Begründung, das inferierte Profil und die Änderungshistorie des Modus.

Mögliche Nutzereingriffe (`user_mode_override`): explizite Moduswechsel (*"Kannst du mich gerade mehr unterstützen?"*), Korrekturen der aggregierten Profildaten sowie Profilreset als Umsetzung von DSGVO Art. 17. Profile, die nie schrumpfen, erzeugen Lernende, die immer mehr Unterstützung erwarten — das Transparenzprinzip schließt daher ein, dass das System anzeigt, wenn Scaffoldinganteile über Zeit abnehmen: als sichtbares Signal wachsender Kompetenz, nicht als unsichtbare Systemoptimierung.

Das Sessionende wird durch eine stille, nicht-modale Karte kommuniziert, die die stärksten eigenen Formulierungen des Lernenden aus dieser Session zeigt (wörtlich aus `strongest_quote`, nicht paraphrasiert) und eine offene Frage, die bewusst ungelöst bleibt. Dieser kognitive Widerstand (Berlyne, 1960; Zeigarnik, 1927) erzeugt den Effekt, dass die nächste Session als Auflösung einer interessierenden Lücke erlebt wird. Die destillierten Formulierungen akkumulieren sich zum **Lernfaden** — einer Chronik der selbst erarbeiteten Gedanken, jederzeit einsehbar, exportierbar (DSGVO Art. 20) und löschbar (Art. 17).

---

## 3.7 Technische Realisierung

### 3.7.1 Stack und Hosting

KAIA ist als DSGVO-konforme Webanwendung auf EU-Infrastruktur realisiert. Die Technologiewahl folgt dem Prinzip "Boring Technology bevorzugen" — alle Komponenten sind etablierte Systeme ohne proprietäre Lock-in-Risiken. Die Hosting-Entscheidung für Hetzner Helsinki ist nicht aus Kostengründen getroffen, sondern aus Compliance-Gründen: EU-Server mit bekanntem Standort sind die Voraussetzung für eine DSGVO-konforme Verarbeitung ohne Schrems-II-Problematik (EuGH C-311/18). Die vollständige Stackübersicht ist in *[→ Anhang G: Technische Systemarchitektur — Deployment-Konfiguration]* dokumentiert.

### 3.7.2 Multi-Modell-Architektur

KAIA unterstützt sieben LLM-Varianten über eine einheitliche Providerabstraktion. Claude Sonnet 4.6 (`claude-sonnet-4-6`) ist das primäre Produktionsmodell; Claude Haiku 4.5 übernimmt Sessionextraktion, Profilgenerierung und Eval-Judging. GPT-4o, GPT-5.6 Terra, GPT-4.1 mini, Mistral Large und Mistral Small sind für den LLM-Evaluationsbericht vorgesehen. Die Abstraktion erfolgt über eine `_provider(model)`-Funktion im Service-Layer, die anhand des Modellnamens den passenden SDK-Client auswählt — inklusive Kapselung von API-Inkompatibilitäten zwischen Modellgenerationen.

Die Per-User-Modellzuweisung ist über die Admin-Oberfläche möglich. Dies ist die technische Grundlage für den LLM-Evaluationsbericht: Identische Nutzungsszenarien können gezielt auf unterschiedliche Modelle geroutet werden. Systemprompts werden mit Anthropic Prompt Caching übergeben. Das System logt Caching-Tokens für das Cost-Tracking.

### 3.7.3 KAIA-Charaktere als nutzergetriebene Stilauswahl

Parallel zur systemgetriebenen Modussteuerung existiert eine nutzergetriebene Stilauswahl über drei Charaktere: **Warm** (wertschätzend, einladend), **Challenging** (direkt, konfrontierend) und **Wild** (unberechenbar, laterale Denkimpulse). Die Charaktere sind keine Ersetzung der vier Interaktionsmodi, sondern eine übergeordnete Stilebene: Der Warm-Charakter kann alle vier Modi ausführen, tut es aber in einem einladenden Ton. Prompt-Templates sind pro Charakter versioniert in der Datenbank gespeichert — live editierbar ohne Redeploy. Im Study-Lock-Modus (`STUDY_MODE=locked`) werden neue Promptversionen vom CI-Gate blockiert.

### 3.7.4 In-Session-Feedback

Das In-Session-Feedback ist als Vier-Button-Interface nach jeder KAIA-Antwort implementiert. `transfer_marker` ("Das muss ich weiterdenken") und `wow` ("Das trifft etwas") sind passive Signale, die in die Sessionextraktion einfließen. `stuck` und `unclear` triggern unmittelbar einen separaten LLM-Call — das System reformuliert oder elaboriert ohne die Hauptkonversation zu unterbrechen. Die Häufigkeit dieser Signale über Sessions hinweg liefert einen Proxyindikator für Challenge-Skill-Balance (Csikszentmihalyi, 1990) unabhängig von der FKS-Erhebung. Chat-UI-Komponenten sind in *[→ Anhang G: Technische Systemarchitektur — API-Dokumentation]* dokumentiert.

---

## 3.8 Messinfrastruktur der Pilotstudie

### 3.8.1 Designprinzip: Mehrschichtige Messung

Die Messinfrastruktur operiert auf drei zeitlichen Ebenen: Prä/Post-Messung (vor Session 1 und nach Session 10), Verlaufsmessung (FKS nach Sessions 2, 5, 8, 10) und kontinuierliche In-Session-Datenerfassung (Feedback-Buttons). Bei N≈20 ohne Kontrollgruppe und ohne Randomisierung sind kausale Wirksamkeitsaussagen methodisch nicht zulässig — die Messung dient der explorativen Deskription und Hypothesengenerierung für zukünftige Studien.

### 3.8.2 Allgemeine Selbstwirksamkeitserwartung (GSE)

Die GSE-Skala (Schwarzer & Jerusalem, 1995) ist das primäre Outcome-Instrument: 10 Items, 4-stufige Likert-Skala (1 = stimmt nicht, 4 = stimmt genau), Summenscore 10–40, α = .80–.90 in deutschsprachigen Stichproben, konvergente Validität mit Optimismus und Handlungsorientierung belegt. Messzeitpunkte: Prä (nach Consent, vor Session 1) und Post (unmittelbar nach Session 10). Session 10 enthält eine explizite Promptconstraint gegen GSE-Priming zur Sicherung der Messunabhängigkeit (Demand Characteristics, Orne, 1962). Die vollständigen Items sind in *[→ Anhang A: GSE-Fragebogen]* dokumentiert.

### 3.8.3 MSLQ-Adaptation (KAIA)

Der MSLQ (Pintrich et al., 1991, 1993) wurde auf vier Subskalen und 30 Items für informelles Erwachsenenlernen adaptiert: **Intrinsische Zielorientierung** (Voraussetzung für sinnvolle sokratische Begleitung — ein rein extrinsisch motivierter Lernender wird Fragen als Hindernis erleben), **Selbstwirksamkeit für Lernen** (komplementär zur GSE, aber lernspezifisch), **Metakognitive Lernstrategien** (messbare Zielgröße der sokratischen Methode) und **Kognitive Verarbeitungstiefe** (Tiefenlernen vs. Oberflächenlernen). Skalierung: 7-stufige Likert-Skala; Gütekriterien: α ≥ .62 für Originalsubskalen (Pintrich et al., 1993).

Die KAIA-Adaptation ist nicht formal validiert: Faktorstruktur und interne Konsistenz der adaptierten Version sind für diesen Kontext nicht durch separate Validierungsstudien belegt. Die Messwerte sind daher als explorative Indikatoren zu interpretieren — diese Einschränkung ist in Kapitel 6 zu kommunizieren. Die vollständigen Items sind in *[→ Anhang B: MSLQ-Fragebogen (adaptiert)]* dokumentiert.

### 3.8.4 Messzeitpunkte im Überblick

| Zeitpunkt | Instrument | Zweck |
|---|---|---|
| Vor Session 1 | GSE (10 Items) + MSLQ-Adaptation (30 Items) | Baseline; Auslöser für Profilgenerierung |
| Nach Session 2 | FKS (10 Items) | Flow-Verlauf (frühe Phase) |
| Nach Session 5 | FKS (10 Items) | Flow-Verlauf (Halbzeit) |
| Nach Session 8 | FKS (10 Items) | Flow-Verlauf (Spätphase) |
| Nach Session 10 | GSE + MSLQ-Adaptation + FKS | Post-Messung; Grundlage Prä/Post-Vergleich |

---

## 3.9 Evaluationsarchitektur des LLM-Vergleichs

### 3.9.1 Zweck und Abgrenzung

Während die Pilotstudie die Wirkung von KAIA auf Lernende untersucht, untersucht die Evaluationsarchitektur die Eignung verschiedener LLMs für KAIAs didaktisches Design. Die Frage lautet nicht "Wirkt KAIA?", sondern "Welches Modell setzt KAIAs Kernprinzipien (Abschnitt 3.1.1) am konsistentesten um?"

### 3.9.2 Crash-Persona-Simulation, Eval-Matrix und LLM-as-Judge

Vor Studienstart werden zehn vordefinierte Crash-Personas automatisiert durch KAIA simuliert — identisch zum echten Nutzerpfad, um Grenzfallverhalten zu testen. Die Eval-Matrix bewertet jede Modell-Persona-Kombination auf vier Metriken: **Empathiequalität** (computational empathy ohne Therapieterrain, 5-Punkt-Rubrik), **Sokratische Treue** (löst die Antwort kognitive Arbeit aus, oder übernimmt sie sie? — Referenz: sechs Fragetypen, Abschnitt 3.3.4), **Konsistenz** (über aufeinanderfolgende Turns, 5-Punkt-Rubrik) und **Crisis-Detection-Safety** (binär: PASS bei korrekter Eskalation mit Disclaimer / FAIL bei Ignorieren oder Vertiefen).

Die Bewertung erfolgt durch Claude Sonnet (`claude-sonnet-4-6`) als LLM-as-Judge (Zheng et al., 2023). Der bekannte Self-Enhancement-Bias — Claude bewertet Claude-Antworten — wird durch Cross-Evaluation kontrolliert: Alle Modelle bewerten sich gegenseitig. Für Crisis-Detection-Safety erfolgt zusätzlich manuelle Überprüfung durch die Forscherin. Die Admin-Oberfläche zeigt Ergebnisse als Heatmap (Modell × Persona × Metrik) und im Eval-Vergleichsmodus mit zwei Modellen nebeneinander.

---

## 3.10 Synthese: Das KAIA-Rahmenwerk als Designartefakt

Das konzeptionelle Rahmenwerk von KAIA ist ein Designartefakt im Sinne von Hevner et al. (2004). Seine fünf Komponenten bilden keine unabhängigen Teilsysteme, sondern ein kohärentes System: Das regelbasierte Adaptionssystem liefert Zustandssignale → die Mehr-Modus-Architektur wählt den passenden Interaktionsstil → die Lernroadmap gibt den inhaltlichen Kontext → das wachsende Nutzerprofil akkumuliert die Erkenntnisse → der Transparenz-Layer gibt dem Lernenden Einsicht und Kontrolle über alles. Jede Session baut auf der vorherigen auf; keine Adaptation geschieht unsichtbar.

Diese Architektur adressiert direkt das Spannungsfeld aus Kapitel 2: Sie schützt Eigenleistung (sokratischer Modus bei Flow), bietet Unterstützung ohne Antworten (Scaffolding bei Überforderung), stärkt Selbstwirksamkeit durch Fortschrittserfahrung (Roadmap) und wächst mit der lernenden Person (wachsendes Nutzerprofil). Die Transparenzkomponente schließt den Kreis zwischen systemseitiger Adaptation und lernerseitiger Kontrolle — das zentrale Spannungsfeld des Thesis-Titels.

---

*Literaturangaben dieses Kapitels sind im konsolidierten Literaturverzeichnis am Ende der Thesis aufgeführt.*
