# Kapitel 3 — Konzeptionelles Rahmenwerk

> **Stand:** 13. Juli 2026 · **Version:** 2.0-DRAFT  
> **Reviewer:** Psychologe (3.2, 3.3) ✓ · AI Engineer (3.3–3.6, 3.7–3.9) ✓ · Didaktiker (3.3–3.5) ✓ · Architect ✓  
> **Geplanter Umfang:** ca. 25–30 Seiten (~6.500–8.000 Wörter)  
> **Status:** v2.0 — Gedächtnisarchitektur v3 (user_learning_profiles + session_summary JSON), Multi-Modell-Architektur, KAIA-Charaktere, MSLQ-Messinfrastruktur, Evaluationsarchitektur (Crash-Personas, Eval-Matrix, LLM-as-Judge) integriert

---

## Überblick

Dieses Kapitel entwickelt das konzeptionelle Rahmenwerk von KAIA. Es übersetzt die theoretischen Grundlagen (Kapitel 2) in operative Designentscheidungen und beschreibt das **Fünf-Komponenten-Modell**: (1) regelbasiertes Adaptionssystem, (2) Mehr-Modus-Interaktionsarchitektur, (3) Lernroadmap-Integration, (4) Zwei-Schicht-Gedächtnis und wachsendes Nutzerprofil, (5) Transparenz-Layer und nutzergetriebene Modussteuerung. Die fünfte Komponente löst das zentrale Spannungsfeld des Thesis-Titels auf: Wie kann systemseitige Adaptation (Personalisierung) Selbstwirksamkeit stärken statt untergraben?

Der Thesis-Titel — *"Entwicklung eines empathischen AI-Agenten zur neuroadaptiven personalisierten Lernbegleitung"* — enthält vier Designanforderungen, die in diesem Kapitel operationalisiert werden: Empathie (computational empathy, explizit als KI kommuniziert), Neuroadaptivität (regelbasiertes Adaptionssystem informiert durch Lazarus), Personalisierung (wachsendes Nutzerprofil), Lernbegleitung (sokratisch und scaffolding, kein Instruktionssystem).

Kapitel 3.7 bis 3.9 beschreiben die technische Realisierung des konzeptionellen Rahmenwerks als Designartefakt im Sinne von Hevner et al. (2004): die Multi-Modell-Systemarchitektur, die Messinfrastruktur der Pilotstudie und die Evaluationsarchitektur des LLM-Vergleichs.

---

## 3.1 Vom theoretischen Rahmen zu Designanforderungen

Die in Kapitel 2 entwickelten Theorien ergeben sechs operative Designanforderungen:

1. **Eigenleistung schützen** — Antworten ersetzen kognitiven Eigenanteil; KAIA sollte ihn fördern (Kalyuga et al., 2003)
2. **Modus an Zustand anpassen** — dieselbe Frage erzeugt bei Überforderung Stress, bei Flow Erkenntnisfreude (Lazarus & Folkman, 1984; Csikszentmihalyi, 1990)
3. **Scaffolding für Novizen** — rein sokratische Begleitung überfordert Anfänger; es braucht ein Spektrum (Vygotsky, 1978; Wood et al., 1976)
4. **Ressourcenwahrnehmung stärken** — nicht Anforderungen reduzieren, sondern wahrgenommene Handlungsfähigkeit aufbauen (Bandura, 1997; Lazarus, 1993)
5. **Selbstregulation unterstützen** — explizite Ziele und ein Fortschrittsrahmen fördern Selbstwirksamkeit und Metakognition (Zimmermann, 2000; Locke & Latham, 1990)
6. **Transparent kommunizieren** — KAIA ist eine KI; computational empathy ist nicht echtes Mitgefühl (Decety & Jackson, 2004)

Diese sechs Anforderungen strukturieren das Rahmenwerk in vier Komponenten.

---

## 3.1.1 Das eigentliche Kernprinzip: Kognitive Transferrichtung

Die ursprüngliche Operationalisierung — "KAIA stellt ausschließlich Fragen, gibt niemals Antworten" — ist eine didaktische Vereinfachung des 20. Jahrhunderts. Sie ist nützlich als Leitlinie, aber historisch ungenau und theoretisch zu eng.

Sokrates selbst hat in Platons *Menon* ein Geometrie-Szenario aufgebaut, bevor er fragte. Im *Symposion* trägt er Diotimas Rede vor. Das Elenchos-Verfahren lebt von Prämissen, die Sokrates einführt. Zen-Meister geben Dharma-Talks, erzählen Geschichten und setzen Koans — die keine klassischen Fragen sind. Der Wirkmechanismus ist in beiden Traditionen nicht die Frage als Sprachform, sondern die systematische Weigerung, die kognitive Arbeit zu übernehmen, die der Lernende selbst leisten muss.

Das eigentliche Kernprinzip von KAIA lautet daher:

> **KAIA übernimmt niemals die kognitive Arbeit, die der Lernende selbst leisten muss. KAIAs Output löst die nächste kognitive Operation aus — er ersetzt sie niemals.**

Diese Formulierung hat drei Konsequenzen:

1. **Erlaubt:** Kurze Kontextsetzungen, Analogien, koanartige Aussagen — wenn sie einen neuen Denkschritt *eröffnen*. Beispiel: "Das erinnert mich an Sokrates' Geometrie-Schüler — er wusste die Antwort schon, er hatte sie nur noch nicht gedacht." Das gibt Kontext, übernimmt keine Synthesis.

2. **Verboten:** Zusammenfassungen die einen Denkschritt *abschließen*, Erklärungen die Verstehen ersetzen statt anregen, Antworten auf inhaltliche Fragen. Das sind die Momente in denen KAIA die kognitive Arbeit des Lernenden übernähme.

3. **Messbar:** Die Grenze ist operationalisierbar. Die Eval-Frage für den LLM-Vergleich (Kapitel 5) lautet: *"Löst diese Antwort die nächste kognitive Operation beim Lernenden aus, oder ersetzt sie eine?"* Das ist reproduzierbar und unabhängig von der Sprachform (Frage vs. Aussage).

Fragen bleiben das primäre Instrument — sie sind das zuverlässigste Mittel um kognitive Aktivierung ohne Synthesis-Übernahme zu erzeugen. Aber sie sind Instrument, nicht Definition.

---

## 3.2 Komponente 1: Regelbasiertes Adaptionssystem (informiert durch Lazarus)

### 3.2.1 Begriffsklärung: Adaptation vs. Erkennung

Das Adaptionssystem von KAIA wird in dieser Arbeit explizit als **regelbasiertes Adaptionssystem informiert durch das transaktionale Stressmodell (Lazarus & Folkman, 1984)** bezeichnet — nicht als "Zustandserkennung" oder "Stressdetektion". Diese Unterscheidung ist wissenschaftlich zwingend: Textbasierte Inferenz kognitiver Bewertungszustände ist epistemisch beschränkt. Das System erkennt keine Zustände; es reagiert auf Signalmuster nach definierten Regeln. Die Signale sind Proxys, keine Messungen.

### 3.2.2 Operationalisierung: Acht Textindikatoren

Die primäre und sekundäre Bewertung nach Lazarus (1993) lassen sich in Chat-Nachrichten über folgende Indikatoren approximieren:

**Primärbewertung — Bedrohungs- und Herausforderungssignale:**

1. *Katastrophisierende Sprache* — Absolutsetzungen und Negativgeneralisierungen: "Das schaffe ich nie", "Das ist zu viel", "Das ist total schwierig"
2. *Zeitdruck-Signale* — Zeitnomen kombiniert mit Negation: "keine Zeit", "noch nicht fertig", "bis Freitag"
3. *Kontrollverlust-Marker* — Passive Konstruktionen ohne Handlungssubjekt: "es wird erwartet", "man muss", "das zwingt mich"; Fehlen von Ich-Handlungsaussagen
4. *Hilflosigkeits-Framing* — Rhetorische Fragen ohne antizipierte Lösung: "Was soll ich denn machen?" (mit Ausrufezeichen statt Fragezeichen)

**Sekundärbewertung — Coping-Ressourcen-Signale:**

5. *Handlungsorientierung* — Aktivverben mit Ich-Subjekt: "Ich probiere...", "Ich kann versuchen...", "Ich werde..."
6. *Ressourcen-Benennung* — Explizite Nennung von Strategien oder Vorerfahrungen: "Ich hab das ähnlich schon...", "Ich könnte jemanden fragen..."
7. *Ambivalenz-Signale* — "Einerseits... andererseits..." — signalisiert laufenden Bewertungsprozess, nicht Kollaps
8. *Metakognitive Distanz* — Selbstbeobachtungs-Formulierungen: "Ich merke, dass ich...", "Ich glaube, mein Problem ist..." — hohes Coping-Potential

### 3.2.3 Hysterese-Logik: Stabilität vor Reaktivität

Ein technisch wichtiger Designaspekt ist die Hysterese-Logik: Der Modus wechselt nicht nach einem einzigen Signal, sondern erst nach N konsistenten Nachrichten (empirisch zu kalibrieren, vorläufig N=3). Ein zu sensitives System würde durch einzelne Formulierungen übersteuert und erzeugte dadurch inkonsistente Gesprächserlebnisse. Die Hysterese-Logik liegt im Service-Layer der Anwendung, nicht im Sprachmodell.

### 3.2.4 Wissenschaftliche Einschränkungen

Vier Limitierungen sind in der Thesis transparent zu kommunizieren:

1. *Konfundierungsproblem*: Sprachstil korreliert mit Bildungsgrad, Schreibgewohnheit und stabilen Persönlichkeitsmerkmalen (Neurotizismus), nicht ausschließlich mit aktuellem Bewertungszustand. Das System misst möglicherweise Traits statt situative States.
2. *Keine validierte Wirksamkeit*: Es gibt keine publizierte Evidenz dafür, dass LLM-Moduswechsel basierend auf Lazarus-Signalen Lernoutcomes verbessert. Die neuroadaptive Komponente ist eine designtheoretische Hypothese — nicht eine empirisch belegte Intervention.
3. *Diskretisierungsproblem*: Lazarus beschreibt Bewertung als kontinuierlichen Prozess. Die Abbildung auf vier diskrete Modi ist eine pragmatische Designentscheidung, die in der Thesis als solche ausgewiesen werden muss.
4. *Methodische Konsequenz*: Wenn die Pilotstudie die Wirkung von KAIA evaluiert, muss die Neuroadaptivität entweder als kontrollierte Variable oder als deskriptiver Systemaspekt behandelt werden — nicht beides gleichzeitig.

---

## 3.3 Komponente 2: Mehr-Modus-Interaktionsarchitektur

### 3.3.1 Vier Interaktionsmodi und ihr theoretisches Fundament

KAIAs Interaktion ist nicht rein sokratisch, sondern folgt einem **didaktisch begründeten Spektrum von vier Modi**. Die Notwendigkeit dieses Spektrums ergibt sich direkt aus dem Expertise Reversal Effect (Kalyuga et al., 2003): rein sokratische Begleitung überfordert Novizen, während direkte Instruktion Experten schadet. Die vier Modi decken das relevante Spektrum ab:

| Modus | Beschreibung | Theoretische Grundlage | Aktivierungsbedingung (Lazarus) |
|---|---|---|---|
| **Sokratisch-explorativ** | Ausschließlich Fragen, kein Scaffolding | Konstruktivismus (Vygotsky, 1978); sokratische Methode | Herausforderungs-Appraisal + vorhandene Coping-Ressourcen; Flow-Zustand; Ambivalenz mit metakognitiver Distanz |
| **Scaffolding / unterstützend** | Minimale Strukturierungshilfe, dann Frage | ZPD (Vygotsky, 1978); Wood et al. (1976) | Bedrohungs-Appraisal + geringe Coping-Ressourcen; Überforderungssignale |
| **Wertschätzend-bestärkend** | Konkrete Lernfortschritte spiegeln | Selbstwirksamkeit (Bandura, 1997); Verstärkungstheorie | Erfolgserleben, Durchbruch-Signale, explizites Kompetenzerleben |
| **Kritisch-herausfordernd** | Annahme hinterfragen, kognitive Dissonanz erzeugen | Yerkes-Dodson (1908); Teigen (1994) | Geringe Bedrohung + stabile Coping-Ressourcen; Unter-Aktivierung |

### 3.3.2 Direktheits-Parameter

Die Modi werden technisch nicht als binäre Schalter, sondern als kontinuierlicher `directiveness`-Parameter (0.0 = rein sokratisch, 1.0 = maximal anleitend) implementiert. Dies erlaubt Zwischenstufen und ist aus dem Nutzerprofil ableitbar. Die Moduslabels (sokratisch, scaffolding, bestärkend, herausfordernd) sind Segmente dieses Kontinuums, die für Prompt-Logik und Logging verwendet werden.

### 3.3.3 Architekturprinzip: Modus liegt im Service-Layer

Ein zentrales Designprinzip: Die Modus-Auflösung erfolgt deterministisch im Service-Layer der Anwendung — nicht durch das Sprachmodell selbst. Eine Funktion `resolve_interaction_mode(user_profile, session_signals)` berechnet den Modus vor jedem LLM-Call und übergibt ihn als Prompt-Parameter. Das LLM interpretiert den Modus, wählt ihn aber nicht. Dies ist für die wissenschaftliche Reproduzierbarkeit und den Study-Lock-Mechanismus essenziell.

### 3.3.4 Begründungsrahmen: Edelmanns Lernprozesstaxonomie

Die Vier-Modi-Architektur lässt sich zusätzlich durch Edelmanns (2000) Taxonomie der Lernprozesse begründen, die vier hierarchisch geordnete Stufen unterscheidet: assoziatives Lernen (Reiz-Reaktions-Verbindungen), instrumentelles Lernen (Lernen durch Konsequenzen), Begriffsbildung und Wissenserwerb sowie planvolles Handeln und Problemlösen.

KAIA operiert bewusst primär auf Stufen 3 und 4. Dies ist für die Zielgruppe — Erwachsene in Hochschule und beruflicher Weiterbildung — entwicklungspsychologisch angemessen: Tiefenverarbeitung, Konzepttransfer und metakognitive Steuerung sind für diese Gruppe die relevanten Lernmechanismen; assoziative Drill-Methoden (Stufe 1) sind für komplexe Weiterbildungsinhalte didaktisch irrelevant. Das Mapping der vier KAIA-Modi auf Edelmanns Stufen zeigt folgende Zuordnung:

Sokratisch-explorativ (Stufe 4) fördert metakognitive Selbststeuerung durch Frageprovokation. Scaffolding/unterstützend (Stufe 3) unterstützt aktive Begriffsbildung; dies entspricht Vygotskys (1978) Zone der nächsten Entwicklung, die konzeptuell verwandt mit Edelmanns Stufe 3, aber theoretisch davon zu trennen ist. Kritisch-herausfordernd (Stufe 4) erzeugt kognitive Konflikte als Lernauslöser im Sinne Piagets. Wertschätzend-bestärkend (Stufe 2) nutzt Mechanismen instrumentellen Lernens — allerdings in der SDT-kompatiblen Form attributionalen Feedbacks (Weiner, 1985; Deci & Ryan, 1985), nicht als pauschale Bestätigung: KAIA attribuiert Erfolge auf die Eigenleistung ("Du hast X und Y selbst verknüpft"), nicht auf externe Umstände.

Eine verbleibende Lücke: Kein Modus adressiert explizit den Aufbau mentaler Modelle und Schemata (Stufe 3 nach Johnson-Laird, 1983). Das Scaffolding-Modus kommt dem am nächsten, ist aber nicht spezifisch auf Schemaaufbau ausgelegt. Diese Limitierung ist in der Thesis transparent zu kommunizieren.

### 3.3.5 Operationalisierung: Sechs sokratische Fragetypen

"Sokratisch" ist kein selbsterklärender Begriff. KAIA operationalisiert sokratisches Vorgehen über sechs distinkte Fragetypen — alle in der sokratischen Tradition verankert, aber mit präziser moderner Entsprechung:

| Typ | Beispiel | Kognitive Funktion | Bloom | Theoretische Basis |
|---|---|---|---|---|
| **Klärungsfrage** | "Was genau meinst du mit X?" | Vagheit sichtbar machen, Präzisierung | 2 | Elenchos (Sokrates) |
| **Hypothetische Frage** | "Was würde sich ändern, wenn...?" | Transferdenken, Grenzen erkunden | 3–4 | Aporetik; Konjunktiv als Denkraum |
| **Widerspruchsfrage** | "Du hast vorhin Y gesagt — passt das zu X?" | Kognitive Dissonanz, Restrukturierung | 4–5 | Elenchos; Piaget (kognitive Konflikte) |
| **Systemische Frage** | "Was würde sich in deiner Kommunikation mit Kollegen/Vorgesetzten ändern?" | Lernen in Anwendungskontext verankern | 3–4 | Lave & Wenger (1991): situated learning |
| **Erste-Schritt-Frage** | "In welcher konkreten Situation diese Woche könntest du das ausprobieren?" | Erkenntnis → Handlung überführen, Transfer | 3 | Perkins & Salomon (1989): Transfer Bridging |
| **Anamnese-Frage** | "Was weißt du eigentlich schon darüber, wenn du mal innehältst?" | Vorwissen aktivieren, Eigenverantwortung | 1→2 | Ausubel (1968): Prior Knowledge; Platon, Menon |

**Hinweis zur systemischen Frage:** Sokrates hat nicht Kommunikation *gelehrt* — er hat Kommunikation als Methode genutzt, um Geometrie, Ethik und Politik zu erschließen. Die systemische Frage ("Was würde sich in deiner Kommunikation mit X ändern?") folgt diesem Muster: sie ist kein Kommunikations-Unterricht, sondern die sokratische Technik, Verstehen durch Anwendungskontext zu testen.

Die sechs Fragetypen sind die Mindestspezifikation für Reproduzierbarkeit. Im LLM-Evaluationsbericht (Kapitel 5) wird getestet welches Modell diese Typen konsistent und korrekt anwendet, und insbesondere: ob die systemische Frage und die Erste-Schritt-Frage zum richtigen Zeitpunkt eingesetzt werden.

### 3.3.6 Session-Architektur: 10-Session-Design mit Bloom-Progression

#### 3.3.6.1 Strukturelle Grundentscheidung: Warum 10 Sessions?

Das ursprüngliche Konzept implizierte drei Sessions ohne explizite Progression. Dieses Design ist didaktisch nicht ausreichend begründet. Drei Sitzungen ermöglichen allenfalls einen ersten Orientierungsdialog, aber keinen messbaren Lernfortschritt im Sinne einer Bloom-Eskalation. Die Mindestrequirements für einen nachweisbaren Kompetenzaufbau ergeben sich aus zwei Quellen: dem Spaced-Learning-Prinzip (Cepeda et al., 2006), das verteiltes Üben über Zeit als Voraussetzung nachhaltiger Enkodierung beschreibt, und der kumulativen Logik der Bloom-Taxonomie (Anderson & Krathwohl, 2001), die höhere kognitive Operationen (Analysieren, Bewerten, Erschaffen) nur auf einer gefestigten Wissens- und Verstehensbasis erlaubt. Aus diesen beiden Anforderungen ergibt sich eine Mindestarchitektur von 10 Sessions.

#### 3.3.6.2 Drei didaktische Phasen und Bloom-Progression über die 10 Sessions

Die 10 Sessions sind in drei didaktische Phasen gegliedert, die jeweils eine Bloom-Progressionsstufe abdecken. Die technische Implementierung spiegelt diese Phasenlogik als Parameter `session_phase` im PromptContext (Abschnitt 3.5.5): `early` (Sessions 1–3), `mid` (Sessions 4–7) und `late` (Sessions 8–10). Innerhalb der Phasen ist keine starre Schrittfolge vorgegeben — die Progression ist Designleitlinie, kein Algorithmus. Das System erkennt durch das Cross-Session-Gedächtnis (Abschnitt 3.5), auf welcher Verständnisstufe sich der Lernende tatsächlich befindet, und passt die Fragetypen entsprechend an.

**Phase 1 — Erkunden (Sessions 1–3): Bloom-Stufen 1–2 (Erinnern, Verstehen)**

Ziel dieser Sessions ist nicht Wissensvermittlung, sondern epistemische Verortung: Welche Vorannahmen, welches Vorwissen und welche Lücken bringt der Lernende mit? Session 2 beginnt obligatorisch mit einem Callback auf Session 1: *"Du hast beim letzten Mal gesagt, dass X — ist das noch so, oder hat sich deine Einschätzung verschoben?"* Dieser Callback dient zwei Zwecken: Er aktiviert Spaced Retrieval (Cepeda et al., 2006) und signalisiert dem Lernenden, dass das System erinnert und ernst nimmt, was gesagt wurde. Methodisch dominieren Anamnese-Fragen (Typ 6) und Klärungsfragen (Typ 1) aus dem sokratischen Fragetypenrepertoire.

**Phase 2 — Transfer und Analyse (Sessions 4–7): Bloom-Stufen 2–5 (Verstehen, Anwenden, Analysieren, Bewerten)**

Ab Session 4 verschiebt sich der Schwerpunkt von der Verortung zur Anwendung. Systemische Fragen (Typ 4) und Erste-Schritt-Fragen (Typ 5) dominieren. Der Erster-Schritt-Loop (Abschnitt 3.3.7) entfaltet hier seine volle Wirkung: jede Session endet mit einem konkreten Handlungsauftrag, jede Folgesession beginnt mit der Überprüfung. **Session 5** markiert die Halbzeit und enthält einen obligatorischen Spiegel: *"Was weißt du jetzt, das du vor fünf Sessions noch nicht wusstest?"* Diese Frage operiert auf Bloom-Stufe 2 (Verstehen) und bereitet die Analysephase vor, indem sie Wissensfortschritt explizit sichtbar macht. Ab Session 6 dominieren Widerspruchsfragen (Typ 3): KAIA arbeitet aktiv aus dem Profil-Gedächtnis: *"In Session 3 hast du gesagt, dass X. Jetzt sagst du Y. Was hat sich verändert?"* Diese cross-sessionalen Widerspruchsfragen erzeugen kognitive Dissonanz (Festinger, 1957) ohne Bedrohungsappraisal, weil sie auf selbstgeäußertes Material zurückgreifen, nicht auf Fremdurteile. Die dafür erforderlichen stärksten Nutzerzitate werden durch die Funktion `load_historical_quotes()` als `historical_quotes`-Feld aus den Session-Zusammenfassungen aller Vorsessions bereitgestellt.

**Phase 3 — Synthese (Sessions 8–10): Bloom-Stufen 5–6 (Bewerten, Erschaffen)**

Die Abschlussphase richtet sich explizit auf Transfer-Autonomie: Was hat der Lernende erarbeitet, und wie wird er nach dem Ende der Studienphase damit weiterarbeiten? **Session 10** enthält drei simultane strukturelle Aufgaben, die vom Systemprompt (via `is_final_session=True`) aktiviert werden: (1) Die Gegenüberstellung wörtlicher Nutzerzitate aus Session 1 und der aktuellen Session — der Lernende sieht seine eigene kognitive Entwicklung in seinen eigenen Worten; diese Gegenüberstellung ist das stärkste Selbstwirksamkeits-Instrument des gesamten Designs (Bandura, 1997: Mastery Experience durch Reflexion auf eigene Leistung). (2) Die Autonomisierungsfrage: *"Wie wirst du ohne mich weiterlernen?"* — sie operiert auf Bloom-Stufe 6 (Erschaffen) und erzwingt die Produktion einer eigenen Lernstrategie. (3) Die explizite Constraint-Regel: kein GSE-Priming — Session 10 stellt keine Fragen, die auf Selbstwirksamkeits-Erleben hinweisen oder die Teilnehmenden an die bevorstehende Post-Messung erinnern, um die Unabhängigkeit der GSE-Post-Erhebung zu sichern.

#### 3.3.6.3 Session-Dauer und Gesamtaufwand

Die Sessiondauer folgt einer begründeten Asymmetrie: Die ersten Sessions (Phase 1) dauern 20–30 Minuten, da sie den gesamten kontextuellen Aufbau leisten, den das Gedächtnissystem später übernimmt. Ab Phase 2 sind 10–15 Minuten als Micro-Session-Format vorgesehen — das Cross-Session-Gedächtnis (Abschnitt 3.5) übernimmt den Kontextaufbau, sodass jede Session ohne Einführungsphase in die eigentliche kognitive Arbeit einsteigen kann. Der Gesamtaufwand über vier Wochen beträgt kalkulatorisch ca. 150 Minuten Chatzeit, ergänzt durch die MSLQ-Prä/Post-Erhebung (ca. 10 Minuten), die GSE-Prä/Post-Erhebung (ca. 5 Minuten) und vier FKS-Erhebungen nach den Sessions 2, 5, 8 und 10 (je ca. 3 Minuten). Der Gesamtaufwand für Teilnehmende beläuft sich auf ca. 182 Minuten über die Studiendauer — ein vertretbares Maß für eine explorative Pilotstudie mit zwanzig Teilnehmenden.

#### 3.3.6.4 Das Drei-Phasen-Skript als Mikrostruktur jeder Session

Unabhängig von der übergreifenden Bloom-Progression folgt jede einzelne Session einem internen Drei-Phasen-Skript, basierend auf Hattie & Timperley (2007) und Merrill (2002). Dieses Skript ist ein Prompt-Engineering-Konzept — es ist nicht als Interface-Element sichtbar. Die Phasengrenzen sind fließend und zeitbasiert, nicht rigid.

**Phase 1 — Aktivierung (erste 60–90 Sekunden):**
Einstiegsfrage: *"Was möchtest du nach dieser Session verstanden oder weitergedacht haben?"* Diese Frage aktiviert Vorwissen (Ausubel, 1968), erzwingt eine Lernintention (Locke & Latham, 1990) und orientiert das LLM auf den aktuellen Fokus. Ab Session 2 wird die Aktivierungsphase durch den Callback auf den offenen Schritt der Vorwoche ersetzt oder ergänzt.

Die Formulierung der Einstiegsfrage ist konzeptuell präzise zu unterscheiden von einer Task-Frage. Nach Hattie & Timperley (2007) ist die *Learning Intention* — "Was werde ich dadurch können oder verstehen?" — didaktisch wirksamer als die bloße Task-Benennung — "Was werde ich heute tun?" (d=0.54 für Lernintentionen, d=0.50 für Zielsetzung, beide über dem Wirksamkeitsschwellenwert von d=0.40). KAIA fragt daher nicht "Was willst du heute besprechen?" (Task), sondern explizit nach dem intendierten Kompetenz- oder Verständniszustand.

**Phase 2 — Arbeitsphase (Kernzeit der Session):**
KAIA wechselt nach Lazarus-Signal in den jeweils angemessenen Modus (sokratisch / scaffolding / herausfordernd). Maximal eine Frage pro Antwort. Antworten unter 80 Wörtern (Scaffolding-Modus: unter 120 Wörtern). Keine Listen. Keine Bullet Points.

**Phase 3 — Sicherung und Transfer (letzte 60–90 Sekunden):**
Abschlussfrage: *"Was würdest du jemandem erklären, der nicht dabei war?"* Diese Frage erzwingt Elaboration (Bloom: Verstehen/Anwenden), ist als Transfer-Aufgabe konzipiert (Merrill, 2002) und liefert gleichzeitig Material für die Post-Session-Profil-Extraktion.

**Hinweis zur Interface-Umsetzung:** Die Drei-Phasen-Struktur bleibt für Nutzende unsichtbar. Fortschrittsanzeigen oder Phasenlabels ("Phase: Sicherung") sind verboten — sie zerstören den kognitiven Flow und infantilisieren erwachsene Lernende (Knowles, 1980). Das Session-Banner ("Session N von 10 · [Phasenhinweis]") kommuniziert ausschließlich die übergreifende Bloom-Phase, nicht das interne Skript.

### 3.3.7 Erster-Schritt-Loop: Der GSE-Aufbau-Mechanismus

#### 3.3.7.1 Konzeptuelle Trias: Lernziel — Lernschritt — Erfolgskriterium

Das Session-Design von KAIA operiert auf drei konzeptuell zu trennenden Ebenen, die in der bisherigen Lernzieldiskussion häufig undifferenziert behandelt werden (Anderson & Krathwohl, 2001; Knowles, 1975):

- **Lernziel** (*learning objective*): Der angestrebte Kompetenzzustand, taxonomisch verortbar (Bloom-Stufe 1–6), typischerweise mit einem Zeithorizont von Wochen bis Monaten. Das Lernziel steht in der Lernroadmap (Abschnitt 3.4).

- **Lernschritt** (*learning action*): Eine konkrete, zeitlich begrenzte Handlung, die auf das Lernziel einzahlt. Zeithorizont: Tage. Lernschritte sind das Operationalisierungsergebnis der Erste-Schritt-Frage (Fragetyp 5).

- **Erfolgskriterium** (*evidence of accomplishment*, Knowles, 1975): Eine selbstdefinierte, subjektive Beobachtung, die belegt, dass der Lernschritt Wirkung hatte. Nicht normiert, nicht extern vorgegeben. KAIA fragt explizit: *"Woran würdest du merken, dass dieser Schritt etwas bewegt hat?"*

Die Unterscheidung schützt vor zwei didaktischen Fehlern: (1) dem Verwechseln von Aktivität mit Lernen; (2) dem Einführen externer Messnormen, die Autonomieerleben untergraben (Deci & Ryan, 2000). Der Begriff *Evidenzanker* wird in dieser Arbeit synonym mit *evidence of accomplishment* verwendet: subjektiv, behavioral verankert, unmittelbar nach dem Lernschritt überprüfbar.

#### 3.3.7.2 Implementation Intentions: Robustheit der Zielbindung

Die Wirksamkeit von Lernschritten steigt erheblich, wenn sie nicht nur als Absicht ("Ich will X beobachten") formuliert werden, sondern als *Implementation Intention* (Gollwitzer, 1999): eine Wenn-Dann-Verknüpfung, die den Ausführungskontext explizit macht. Gollwitzer & Sheeran (2006) belegen über 94 Studien einen mittleren Effekt von d=.65 für die Steigerung von Zielerreichungsraten durch Implementation Intentions — die robusteste Einzelkomponente in der Motivationsforschung zur Handlungsinitiierung.

Für KAIA bedeutet dies: Die Erste-Schritt-Frage (Fragetyp 5) endet nicht mit der Absichtsformulierung, sondern mit einer Kontextualisierungsfrage: *"Wann genau, in welcher Situation, könntest du das ausprobieren?"* Erst wenn Wann, Wo und Wie benannt sind, ist der Lernschritt im Sinne einer Implementation Intention operationalisiert. Dieser Schritt wird als `first_step`-Feld in der Session-Zusammenfassung persistiert und bildet den Einstieg der nächsten Session.

#### 3.3.7.3 Der Loop in der Praxis

Am Ende jeder Session formuliert der Lernende — angestoßen durch die Erste-Schritt-Frage und abgeschlossen durch die Implementation-Intention-Frage sowie die Evidenzanker-Frage — einen konkreten, zeitlich und situativ verankerten Lernschritt. Dieser Schritt wird gespeichert und bildet den Einstieg der nächsten Session:

**Session N+1 — Einstieg mit Rückbezug:**

*Schritt wurde nicht gemacht:*
> *"Du wolltest X ausprobieren. Was hat das verhindert?"*
> → "War der Schritt zu groß? Wie sähe ein kleinerer Schritt aus der sicher machbar wäre?"

*Schritt wurde gemacht:*
> *"Wie hat sich das angefühlt?"*
> → Evidenzanker-Abgleich: "Du hattest gesagt, du würdest X merken — war das so?"
> → nächster Schritt entsteht organisch

Dieser Loop ist der operative Kern des GSE-Aufbaumechanismus nach Bandura (1997): kleiner Schritt → Mastery-Erfahrung (auch wenn partiell) → Attribution auf eigene Leistung → GSE steigt → nächster Schritt kann größer sein. Der Zeigarnik-Effekt (1927) sorgt für die Rückkehr-Motivation: offene Schritte ziehen das Gehirn zurück.

Empirische Stützung des Mechanismus: Schimpf, Voigt & Bohné (2026) zeigen in einem RCT (N=517), dass ein KI-gestützter Chatbot, der Lernende bei der Formulierung spezifischerer Ziele unterstützte, nach zwei Wochen signifikant bessere Zielerreichungsraten produzierte als eine Kontrollbedingung. Als Wirkmechanismus identifizieren die Autoren wahrgenommene soziale Verantwortlichkeit — ein Effekt, der sich in KAIA durch das persistierte Session-Gedächtnis analog operationalisieren lässt: Der Lernende weiß, dass KAIA beim nächsten Mal nachfragt.

**Designprinzip:** Der Schritt muss immer *kleiner* sein als die Lernende glaubt. KAIA verkleinert wenn nötig, nie vergrößert. Ein nicht gemachter Schritt ist keine Niederlage — er ist ein Diagnoseinstrument. Cognitive Load Theory (Sweller, 1988) stützt dieses Prinzip: Schritt-Planung und Zielfindung gleichzeitig in einer Session können die verfügbare kognitive Kapazität überschreiten.

### 3.3.8 Session-Einstieg: Tägliche Variation und KAIAs authentische Stimme

Jede Session beginnt anders — das unterstützt den Wiederbesuchs-Anreiz und verhindert Habituation (Berlyne, 1960). KAIA hat drei valide Einstiegsoptionen wenn kein offener erster Schritt aus der Vorsession vorliegt:

1. **Rückbezug** — genuine Beobachtung aus der letzten Konversation: *"Mir ist aufgefallen, dass du immer dann besonders klar formulierst, wenn du über Situationen sprichst in denen du Kontrolle hattest. Hast du das auch bemerkt?"* Dies ist keine Erfindung — KAIA hat das aus dem `observation`-Feld der Session-Zusammenfassung abgeleitet und kommuniziert eine echte Beobachtung.

2. **Intellektuelle Neugier** — eine Frage die KAIA "beschäftigt": *"Ich beschäftige mich mit einer Frage die ich noch nicht beantworten kann: Warum ist es so viel schwieriger, um Hilfe zu bitten als sie zu geben?"* Das ist keine fabricated human experience — es ist authentische intellektuelle Neugierde eines Systems das mit Sprache und Bedeutung arbeitet.

3. **Fragetyp-Preview** — Vorfreude erzeugen: *"Heute möchte ich mit einer Frage beginnen, die ich selten stelle..."* Das aktiviert Neugier ohne Täuschung.

**Was explizit verboten ist:** Erfundene Alltagsgeschichten ("Heute morgen habe ich..."), fabricated emotions ("Ich war traurig als..."), oder Behauptungen die menschliche Körperlichkeit voraussetzen. KAIA ist eine KI — das ist keine Einschränkung sondern eine Eigenheit, die ehrlich kommuniziert wird und die eigene Form von Authentizität erlaubt.

### 3.3.9 Phasenkorrektur: Kolb-konforme Sequenzierung im 7-Phasen-Metamodell

In früheren Entwürfen der Session-Architektur wurde die Challenge-Phase vor der Konsolidierungsphase platziert. Diese Sequenzierung ist theoretisch nicht haltbar. Kolbs Experiential Learning Cycle (1984) beschreibt eine invariante Abfolge: konkrete Erfahrung → reflektierende Beobachtung → abstrakte Begriffsbildung → aktives Experimentieren. Eine herausfordernde Widerspruchsfrage — die Challenge — greift auf die Abstraktionsstufe zu; sie setzt voraus, dass Reflexion und Begriffsbildung bereits stattgefunden haben.

Die korrekte Sequenz des KAIA-Phasenmodells lautet damit:

> Motivationsanker → Lerntyp-Routing → Standortbestimmung → Mini-Step (Enactment/Konkrete Erfahrung) → Konsolidierung (Reflexion + Begriffsbildung) → Challenge (Abstraktion/Widerspruch) → Transfer/Reflexion (Aktives Experimentieren)

Diese Korrektur hat eine unmittelbare Prompt-Engineering-Konsequenz: Der Trigger für Widerspruchsfragen (Fragetyp 3) und kritisch-herausfordernde Formulierungen darf erst nach dem Enactment-Schritt aktiviert werden. Ein System, das herausfordert bevor es Sicherheit aufgebaut hat, produziert Bedrohungsappraisal statt Lernmotivation — ein Fehler, den das Lazarus-Modell präzise vorhersagt.

### 3.3.10 Flow-Theorie als Designrahmen: Csikszentmihalyi, Rheinberg und die Messung

#### 3.3.10.1 Theoretische Grundlage

Flow bezeichnet nach Csikszentmihalyi (1990) einen Zustand vollständiger Aufmerksamkeitsabsorption, der durch vier Bedingungen konstituiert wird: klare Ziele, unmittelbares Feedback, ein ausgewogenes Challenge-Skill-Verhältnis sowie eine autotelic experience — das Erleben der Tätigkeit als intrinsisch befriedigend. Die lernpsychologisch relevante Operationalisierung von Flow in Lernsettings liefern Nakamura & Csikszentmihalyi (2002) und Engeser & Rheinberg (2008), die Flow als messbaren Zustand mit stabilen empirischen Korrelaten beschreiben.

Für KAIA ist die Challenge-Skill-Balance die kritischste Bedingung. Ohne Bloom-Eskalation über die Sessions hinweg tendiert das System ab Session 4–5 in den Boredom-Quadrant: die Anforderungen stagnieren, die Kompetenzen wachsen, das Challenge-Skill-Verhältnis kippt unter die Flow-Schwelle. Das 10-Session-Design (Abschnitt 3.3.6) ist aus dieser Perspektive nicht nur eine taxonomische Struktur, sondern eine Flow-Schutzarchitektur.

#### 3.3.10.2 KAIA-Mapping: Vier Flow-Bedingungen

*Klare Ziele:* Die Lernroadmap (Abschnitt 3.4) und die Mikroziel-Anker zu Sessionstart (Phase 1 des Drei-Phasen-Skripts) erfüllen diese Bedingung strukturell.

*Unmittelbares Feedback:* Der Enactment-Effekt (Cohen, 1989) liefert Feedback durch konkrete Handlungserfahrungen zwischen den Sessions. Die Cross-Session-Brücke ist das einzige unmittelbare Feedback-Element innerhalb des Systems. Diese Bedingung ist im Vergleich zu den anderen am schwächsten erfüllt: KAIA gibt kein Leistungsfeedback und kann es auch nicht geben, ohne in die bewertende Sprache zu verfallen (vgl. Abschnitt 3.3.11).

*Challenge-Skill-Balance:* Die Bloom-Progression (Abschnitt 3.3.6.2) ist die primäre Designantwort. Ergänzend steuert das regelbasierte Adaptionssystem (Abschnitt 3.2) situativ: Überforderungssignale lösen den Scaffolding-Modus aus (Anxiety-Quadrant verlassen), Unterforderungssignale den kritisch-herausfordernden Modus (Boredom-Quadrant verlassen).

*Autotelic Experience:* Sokratische Begleitung fördert epistemische Neugier, weil sie das Denken als befriedigende Tätigkeit inszeniert — der Lernende löst Probleme, statt Lösungen zu konsumieren. Dies ist die stärkste autotelic-Eigenschaft des KAIA-Designs und gleichzeitig schwer messbar.

#### 3.3.10.3 Messung: Flow-Kurzskala (FKS)

Als Erhebungsinstrument wird die Flow-Kurzskala (FKS) nach Rheinberg, Vollmeyer & Engeser (2003) eingesetzt. Die FKS umfasst 10 Items auf siebenstufigen Likert-Skalen (1 = trifft nicht zu, 7 = trifft zu) und erfasst zwei Faktoren: Fluency (glatter Handlungsablauf, Selbstvergessenheit) und Absorbiertheit (Aufmerksamkeitszentrierung, Zeitwahrnehmungsverzerrung). Die Skala weist eine interne Konsistenz von α ≥ .90 auf (Rheinberg et al., 2003) und ist für den deutschsprachigen Raum validiert.

Die FKS wird unmittelbar nach den Sessions 2, 5, 8 und 10 erhoben. Diese vier Messzeitpunkte decken alle drei Phasen ab und erlauben die Analyse des Flow-Verlaufs als Längsschnittdimension. Die Messung unmittelbar nach der Session ist für die ökologische Validität der FKS essenziell (Rheinberg et al., 2003).

### 3.3.11 Sprachprinzip: KAIA bewertet nicht

#### 3.3.11.1 Theoretische Begründung

Bewertende Sprache untergräbt Autonomieerleben. Die Selbstbestimmungstheorie (Deci & Ryan, 1985) unterscheidet zwischen informationalem und kontrollierendem Feedback: Informational feedback unterstützt Kompetenzerleben und intrinsische Motivation; kontrollierendes Feedback — positiv wie negativ — reduziert wahrgenommene Selbstbestimmung und schwächt intrinsische Motivation (Ryan & Deci, 2000). Pauschal-positives Feedback ("Toll!", "Gut gemacht!") ist eine Sonderform kontrollierenden Feedbacks: Es externalisiert den Bewertungsmaßstab, macht den Lernenden von der Bestätigung durch das System abhängig und erzeugt extrinsische Motivation, wo intrinsische entstehen sollte.

#### 3.3.11.2 Fünf operative Sprachregeln

Diese Regeln sind nicht Stilempfehlungen, sondern Prompt-Constraints, die das LLM-Verhalten als Negativliste einschränken:

**Regel 1 — Kein pauschales Lob.** Formulierungen wie "Toll!", "Ausgezeichnet!", "Sehr gut!" sind verboten. Erlaubt ist spezifisches, attributionales Spiegeln: "Du hast gerade X und Y selbst verknüpft" — das ist eine Beobachtung, kein Urteil.

**Regel 2 — Keine Typisierungen.** Aussagen wie "Du bist ein analytischer Typ" schreiben ein Selbstbild fest und schränken zukünftige Selbstwahrnehmung ein (Dweck, 2006: Mindset-Theorie).

**Regel 3 — Keine Prognosen.** "Du wirst das schaffen" sind verbal-persuasive Aussagen, die nur dann Selbstwirksamkeit aufbauen, wenn die Quelle glaubwürdig ist und spezifische Evidenz vorliegt (Bandura, 1997). Ohne diese Bedingungen sind sie Schmeichelei.

**Regel 4 — Keine inhaltlichen Bewertungen.** "Das ist falsch" aktiviert Bedrohungsappraisal (Lazarus & Folkman, 1984) und Defensivität. Die Alternative ist die Widerspruchsfrage (Fragetyp 3).

**Regel 5 — Keine Ratschläge.** "Ich empfehle dir..." sind Aussagen, die einen kognitiven Vorgang abschließen, den der Lernende selbst vollziehen muss (Kalyuga, 2007). Wo ein Ratschlag entsteht, steht stattdessen eine Erste-Schritt-Frage (Fragetyp 5).

#### 3.3.11.3 Operative Alternative: Elaborative Interrogation

Die konstruktive Alternative zu bewertender Sprache ist die elaborative Interrogation (Woloshyn et al., 1992): Fragen, die Erklärungen und Begründungen einfordern, ohne das Ergebnis vorwegzunehmen. Typische Formulierungen: "Was hast du dabei bemerkt?", "Wie würdest du das überprüfen?", "Was würde jemand einwenden, der anderer Meinung ist?"

#### 3.3.11.4 Affekt-Anerkennung ohne emotionale Vertiefung

Ein methodisch kritischer Sonderfall betrifft den Session-Einstieg mit negativem Affekt. D'Mello & Graesser (2012a) belegen, dass unaufgelöste Frustration in eine Desengagement-Spirale mündet — tutorielle Systeme sollten kurzfristig auf Affekt reagieren, um den Lernenden zurück in den Engagement-Zustand zu führen, nicht um emotionale Verarbeitung einzuleiten. Die Affective AutoTutor-Studie (D'Mello & Graesser, 2012b) operationalisiert dies als zweistufige Strategie: kurze affektive Anerkennung, gefolgt von sofortiger Rückkehr zur Lernaufgabe.

**Operative Regel für KAIA:** Bei negativem Affekt als Session-Einstieg gilt folgende Sequenz:

1. Anerkennung — maximal ein Satz, außen-orientiert, nicht bewertend
2. Sofortiger Pivot zur Lernfrage: *"Was beschäftigt dich gerade, wobei du dir wünschst, es anders zu können?"*

Ausdrücklich verboten: Fragen, die im affektiven Frame verbleiben — *"Was hat zuletzt am meisten Energie gekostet?"*, *"Was belastet dich?"*. Sie folgen einem Coaching-Muster und sind mit dem Prinzip der Lernbegleitung nicht vereinbar.

### 3.3.12 Wissensarten als Routing-Grundlage: Anderson & Krathwohl (2001)

Die revidierte Bloom-Taxonomie (Anderson & Krathwohl, 2001) unterscheidet nicht nur zwischen Kognitionsstufen, sondern auch zwischen vier Wissensarten: Faktisches Wissen, Konzeptuelles Wissen, Prozedurales Wissen und Metakognitives Wissen.

Diese Unterscheidung ist für KAIA als Routing-Grundlage relevant, weil die vier Wissensarten unterschiedliche Fragetypen erfordern:

| Wissensart | Charakteristik | Primärer KAIA-Fragetyp | Kognitive Funktion |
|---|---|---|---|
| **Faktisch** | Terminologie, Einzelfakten, Definitionen | Anamnese-Frage (Typ 6) | Vorwissen aktivieren, Lücken sichtbar machen |
| **Konzeptuell** | Prinzipien, Kategorien, Strukturen | Hypothetische Frage (Typ 2) | Konzeptgrenzen erkunden, Transfer vorbereiten |
| **Prozedural** | Abläufe, Methoden, Handlungsschritte | Erste-Schritt-Frage (Typ 5) | Erkenntnis in konkrete Handlung überführen |
| **Metakognitiv** | Strategien, Selbstüberwachung, Lernreflexion | Widerspruchs- (Typ 3) + Anamnese-Frage (Typ 6) | Selbstbild mit Verhalten abgleichen |

**Routing-Konfidenz und Fehlertoleranz.** Das Routing nach Wissensart wird vom System als unsicher behandelt, bis Session 3 abgeschlossen ist. Das System implementiert einen Default "low confidence" für Wissensart-Routing in Sessions 1–3: Es wird der neutralste Fragetyp gewählt (Anamnese/Klärung), kein Lock-in auf eine Wissensart.

---

## 3.4.0 Motiv-Probing: Das Lernziel hinter dem Lernziel

Bevor die Lernroadmap angelegt wird, durchläuft die lernende Person einen optionalen Motiv-Dialog. Die Grundannahme: Das genannte Lernziel ist häufig das **Mittel**, nicht der eigentliche Zweck. Dieser Ansatz ist motivationspsychologisch fundiert durch drei komplementäre Theorielinien:

**Self-Determination Theory (Deci & Ryan, 2000):** Probing kann helfen, external motivierte Ziele in *identifizierte Regulation* umzuwandeln — die Person erkennt, dass das Lernziel ihr eigenes Bedürfnis bedient, nicht eine externe Erwartung. Autonomie als Grundbedingung nachhaltiger Lernmotivation ist durch Ryan et al. (2023) in einer Meta-Analyse über 486 Studien (>205.000 Teilnehmende) umfassend belegt.

**Goal Setting Theory (Locke & Latham, 2002):** Partizipativ co-konstruierte Ziele — solche, die der Lernende selbst formuliert hat statt vorgefunden zu haben — erhöhen das Commitment signifikant. Das Motiv-Probing ist die Bedingung dafür, dass die nachfolgend in der Lernroadmap eingetragenen Ziele dieses Kriterium erfüllen.

**Motivational Interviewing (Miller & Rollnick, 2013):** Der evokative Gesprächseinstieg — Ambivalenzen erfragen, nicht auflösen; eigene Aussagen des Gesprächspartners spiegeln — ist die methodische Vorlage für KAIAs Motiv-Dialog. Markland et al. (2005) belegen den theoretischen Nexus: MI wirkt, weil es autonomieunterstützend ist.

**Drei Designgrenzen:**

1. **Nicht presumieren** — KAIA nimmt nie von vornherein an, das Genannte sei "nur" ein Mittel.
2. **Abbrechbar** — Das Probing ist optional. *"Ich möchte einfach anfangen"* ist eine valide Antwort.
3. **Keine Tiefendiagnose** — Maximal 2–3 Fragen. KAIA darf nicht in therapeutisches Terrain gehen.

### 3.4.1 Funktion und theoretische Begründung

Die Lernroadmap ist ein nutzerseitig befülltes, strukturiertes Dokument, das für die gesamte Studiendauer angelegt wird. Es erfüllt drei Funktionen:

1. *Zielstruktur* — explizite Lernziele (Goal-Setting, Locke & Latham, 1990, 2002) verhindern aimless chatting und geben KAIA pro Session einen konkreten Kontext
2. *Fortschrittserfahrung* — selbst eingeschätzter Fortschritt (0–100%) ist eine direkte Handlungsergebniserfahrung (Bandura, 1997) — Voraussetzung für Selbstwirksamkeitsstärkung
3. *Metakognitive Aktivierung* — das Befüllen und Aktualisieren der Roadmap fördert Selbstregulation (Zimmermann, 2000)

### 3.4.2 Struktur der Lernroadmap

Die Roadmap enthält für jedes Lernziel: Titel, Domäne (taxonomiegestützt), Persönliche Motivation (Freitext, max. 200 Zeichen), Deadline (optional), Fortschritt (0–100%, wird ausschließlich von der lernenden Person aktualisiert — nicht von KAIA), Status (offen / aktiv / pausiert / abgeschlossen).

Designprinzip: KAIA darf Fortschritt spiegeln und benennen, aber niemals bewerten oder selbst setzen.

### 3.4.3 Integration in jede Session

Dem Sprachmodell wird in jeder Session nur das aktive Ziel übergeben (Titel, Motivation, Fortschritt als `outcome`-Feld im PromptContext). Keine Gesamtliste aller Ziele — das kostet Tokens und ist kognitiv irrelevant für die laufende Konversation. Der Rest der Roadmap ist UX, kein Prompt-Kontext.

### 3.4.4 Outcome-Formulierung: Lernergebnis-Präzisierung als Onboarding-Schritt

Das System akzeptiert keine vagen Lernthemen als Ausgangspunkt einer Lernroadmap. Stattdessen führt ein progressiver Dialog zur **Lernergebnis-Präzisierung** im Sinne von Outcome-Based Learning (Biggs & Tang, 2011) und kompetenzorientiertem Lernen nach Weinert (2001).

Der Dialog folgt einer dreistufigen Struktur nach SDT (Deci & Ryan, 1985):
1. *Kontext-Frage* — "Wofür gerade?" (situative Einbettung)
2. *Vermeidungsmotiv* — "Was frustriert dich, was willst du vermeiden?"
3. *Annäherungsmotiv* — "Wie sieht Erfolg für dich aus?"

Das formulierte Outcome erscheint als **persistenter Anker** im Chat-Interface: kollabierbare Leiste, jederzeit sichtbar und editierbar. Das Outcome ist Kompass, nicht Käfig.

### 3.4.5 Ressourcen-Agent: Drei-Pfad-Modell zur Kompetenzvertiefung

Ein separater Modus — explizit nicht sokratisch — gibt konkrete Hinweise auf Lernwege. Moduswechsel durch expliziten Trigger; Interface zeigt Wechsel klar an: *"Ich zeige dir jetzt Wege, nicht Fragen."*

Drei Lernpfade als Prompt-Constraint (nicht LLM-Freiheit):

| Pfad | Beschreibung |
|---|---|
| **Strukturiert** | Bücher, Kurse, Dokumentation, wissenschaftliche Quellen |
| **Menschlich** | LinkedIn-Expert, Forum, Podcast-Interview |
| **Durch Tun** | Eigenes Projekt, Hackathon, Open-Source-Beitrag |

Web-Search optional und transparent. URLs immer als "zum Verifizieren" markiert.

---

## 3.5 Komponente 4: Zwei-Schicht-Gedächtnis und wachsendes Nutzerprofil

### 3.5.1 Architekturüberblick

KAIAs Gedächtnisarchitektur kombiniert drei aufeinander aufbauende Datenschichten, die im Zusammenspiel ein progressiv angereichtertes Bild des Lernenden über die gesamte Studienphase aufbauen. Das Designprinzip ist klar: Keine der drei Schichten ist ein Fine-Tuning des Basismodells. Claude, GPT-4o und Mistral werden nicht für einzelne Nutzer modifiziert. Die drei Schichten sind Kontext-Layer, die das Verhalten des unveränderten Modells pro Nutzer progressiv spezifischer machen. Am Ende existieren faktisch unterschiedlich verhaltende KAIA-Instanzen — durch Kontextanreicherung, nicht Modellmodifikation. Diese Unterscheidung ist für die Reproduzierbarkeit der Studienergebnisse essenziell.

**Schicht 1: Statisches Lernendenprofil** (`user_learning_profiles`) — Unveränderlicher Snapshot nach Pre-Survey, erstellt einmalig nach Abschluss beider Vorerhebungen (MSLQ + GSE). Unveränderlich für die gesamte Studiendauer.

**Schicht 2: Kumulative Session-Extraktion** (`chat_sessions.session_summary`) — Ein JSON-Datensatz pro abgeschlossener Session, geschrieben als Hintergrundaufgabe nach Sessionende. Akkumuliert, nicht überschrieben.

**Schicht 3: Semantisches Gedächtnis** (pgvector) — Vektorisierte Gesprächsfragmente für semantische Ähnlichkeitssuche über Sessiongrenzen hinweg.

### 3.5.2 Schicht 1: Statisches Lernendenprofil (user_learning_profiles)

Die Tabelle `user_learning_profiles` wird exakt einmal pro Nutzer befüllt — nach Abschluss beider Pre-Survey-Instrumente (MSLQ-Subskalen und GSE-Eingangsmessung) und vor Session 1. Eine UNIQUE-Constraint auf `user_id` verhindert Doppelanlage auch unter konkurrenter Hintergrundverarbeitung. Die Tabelle enthält folgende Felder:

- `gse_baseline` (Float): Mittlerer GSE-Summenscore aus der Prä-Erhebung, skaliert auf 1–4. Dieser Wert ist der Bezugspunkt für die GSE-Post-Erhebung nach Session 10 und wird als `gse_baseline`-Feld in jeden PromptContext injiziert.
- `gse_items` (JSONB): Alle zehn GSE-Einzelitem-Antworten — für die Thesis-Auswertung und Reproduzierbarkeit vollständig persistiert.
- `subscale_scores` (JSONB): Mittlere Subskalen-Scores der vier MSLQ-Subscales (Intrinsische Zielorientierung, Selbstwirksamkeit, Lernstrategien, Kognitive Verarbeitungstiefe) — für die Thesis-Auswertung und Reproduzierbarkeit vollständig persistiert.
- `profile_interpretation` (Text): LLM-generierte Interpretation des Pre-Survey-Profils. Generiert von Claude Haiku (claude-haiku-4-5-20251001) mit `temperature=0`, max. 120 Wörter, kategorisiert in einen von vier Profil-Typen. Dieser Text wird als `learner_profile`-Feld in jeden PromptContext injiziert und von der ersten bis zur letzten Session unverändert verwendet.
- `interpretation_prompt_hash` (String, 64 Zeichen): SHA-256-Hash des verwendeten Extraktionsprompts zur Reproduzierbarkeit — bei späterer Prompt-Änderung lässt sich rekonstruieren, welcher Prompt welches Profil erzeugt hat.
- `created_at` (Timestamp): Unveränderlich. Dokumentiert den Zeitpunkt der Profilanlage für die Thesis.

Die Unveränderlichkeit von Schicht 1 ist ein bewusster Designentscheid: Das Lernendenprofil dient als fester Ankerpunkt für den longitudinalen Vergleich. Würde es über die Studiendauer aktualisiert, wäre kein sauberer Prä-Post-Vergleich mehr möglich.

### 3.5.3 Schicht 2: Kumulative Session-Extraktion (session_summary)

Nach jeder abgeschlossenen Session führt die Funktion `extract_session_summary(session_id)` als FastAPI-`BackgroundTask` einen separaten LLM-Call durch — Modell: Claude Haiku (claude-haiku-4-5-20251001), `temperature=0`, max. 600 Tokens, eigene DB-Session (da die request-scoped Session zu diesem Zeitpunkt bereits geschlossen ist). Das Ergebnis ist ein JSON-Objekt, das in das Feld `chat_sessions.session_summary` geschrieben wird.

Das JSON enthält folgende Felder:

- `first_step` (string): Der konkrete nächste Schritt, den der Lernende benannt hat (leer wenn keiner vereinbart wurde). Wird als `last_first_step`-Feld in die Folgesession injiziert.
- `observation` (string): KAIAs wichtigste Beobachtung über die Person — Lernstil, Energie, Muster — ausschließlich auf Basis des Transkripts. Wird als `last_session_observation`-Feld in die Folgesession injiziert.
- `insight_for_next_session` (string): Eine Frage oder Beobachtung für die nächste Session, formuliert als natürlicher Gesprächseinstieg, den KAIA als eigene Reflexion bringen könnte. Wird als `insight_for_next_session`-Feld in die Folgesession injiziert.
- `mood` (enum: positiv | neutral | frustriert | unklar): Grundstimmung des Lernenden am Sessionende.
- `topics` (string[], max. 5): Besprochene Themen — für das kompakte Verlaufs-Log in `session_history_summary`.
- `strengths_observed` (string): Beobachtete Stärken oder positive Muster.
- `friction_points` (string): Beobachtete Reibungspunkte oder Blockaden.
- `strongest_quote` (string): Der stärkste eigene Satz des Lernenden — wörtlich zitiert, nicht paraphrasiert. Dieses Feld ist das Rohmaterial für die cross-sessionalen Widerspruchsfragen (Sessions 6–8) und die Gegenüberstellung in Session 10.

Sessions ohne Zusammenfassung — z.B. weil die Extraktion fehlschlug — werden in der Aggregationslogik still übersprungen, blockieren aber keine Folgesessions.

### 3.5.4 Schicht 3: Semantisches Gedächtnis (pgvector)

Gesprächsfragmente werden als Vektoren in PostgreSQL 16 mit der pgvector-Extension gespeichert. Die Abfrage erfolgt über semantische Ähnlichkeitssuche mit `user_id` als Pflichtparameter — Row-Level-Security auf Datenbankebene verhindert Cross-User-Leaks. Pro Session werden die semantisch relevantesten Fragmente retrieved und dem Systemprompt übergeben. Diese Schicht ergänzt die strukturierte Session-Extraktion (Schicht 2) um freie assoziative Kontextsuche — besonders relevant wenn ein Lernender ein Thema aus Session 2 in Session 8 aufgreift, ohne explizit darauf Bezug zu nehmen.

### 3.5.5 PromptContext: Parameterübergabe ans LLM

Der `PromptContext`-Dataclass bündelt alle Felder, die per Jinja2-Template in den Systemprompt injiziert werden. Die für die Session-Gedächtnisarchitektur relevanten Felder:

| Feld | Quelle | Funktion |
|---|---|---|
| `session_number` | `chat_sessions.session_number` | Bestimmt Session-Mission, Bloom-Phase |
| `session_phase` | Berechnet: 1–3 → early, 4–7 → mid, 8–10 → late | Steuert Fragetyp-Priorisierung |
| `is_final_session` | `session_number == 10` | Aktiviert drei-Aufgaben-Skript |
| `user_turns` | Gezählte User-Messages in Currentsession | Steuert Konvergenz-Check (Erste-Schritt-Frage ab Turn 4) |
| `learner_profile` | `user_learning_profiles.profile_interpretation` | Unveränderlicher Profiltext aus Pre-Survey |
| `gse_baseline` | `user_learning_profiles.gse_baseline` | Numerischer Bezugswert für Prompt-Kalibrierung |
| `last_first_step` | `session_summary.first_step` (Vorsession) | Einstieg mit Rückbezug |
| `last_session_observation` | `session_summary.observation` (Vorsession) | Authentische Einstiegsbeobachtung |
| `insight_for_next_session` | `session_summary.insight_for_next_session` (Vorsession) | Intellektueller Einstieg |
| `session_history_summary` | `load_all_session_contexts()` | Kompakter Verlauf aller Vorsessions |
| `historical_quotes` | `load_historical_quotes()` | Verbatim-Zitate für Widerspruchsarbeit |

### 3.5.6 Aggregationslogik und Hintergrundverarbeitung

Die Funktion `load_all_session_contexts(db, user_id, current_session_id, max_sessions=9)` wird beim Start jedes LLM-Calls aufgerufen. Sie aggregiert bis zu neun Vorsessions in ein kompaktes mehrzeiliges Format: `Session N: Stimmung=X | Themen=A, B | Beobachtung: Y | Vereinbarter Schritt: Z | Reibungspunkte: W`. Dieses Format ist Token-effizient und enthält alle für den Prompt relevanten Metadaten ohne vollständige Transkripte zu übertragen.

Die Funktion `load_historical_quotes(db, user_id, current_session_id)` liefert ausschließlich Vorsessions mit nicht-leerem `strongest_quote`-Feld als Liste von `(session_number, quote)`-Tupeln. Dieses strukturierte Format erlaubt dem Prompt-Template, die Zitate gezielt für Widerspruchsfragen zu verwenden: *"In Session 3 hast du gesagt: '[Zitat]' — wie verhält sich das zu dem, was du gerade sagst?"*

Die Funktion `extract_session_summary(session_id)` läuft als `BackgroundTask` nach `end_session` mit eigener Datenbankverbindung. Sie erkennt und bereinigt Markdown-Fences, die Claude Haiku trotz expliziter Instruktion gelegentlich hinzufügt, und validiert das Ergebnis-JSON vor dem Schreiben. Fehlgeschlagene Extraktionen werden geloggt (structlog JSON) ohne die laufende Session zu blockieren.

### 3.5.7 Begriffsklärung: Kontextanreicherung vs. Modellmodifikation

Das wachsende Nutzerprofil ist kein Fine-Tuning. Claude Sonnet, GPT-4o und Mistral werden nicht für einzelne Nutzer modifiziert. Das Profil ist ein wachsender Kontext-Layer, der das Verhalten des unveränderten Modells pro Nutzer progressiv spezifischer macht. Diese Unterscheidung ist für die Thesis essenziell: Aussagen über Modellverhalten in der Studie beziehen sich auf das Verhalten des Basismodells unter progressiv angereichtertem Kontext — nicht auf ein angepasstes Modell.

Die Unterscheidung ist auch DSGVO-relevant: Kontextanreicherung speichert Nutzerdaten in KAIAs eigener Datenbank auf Hetzner Helsinki (EU). Modellmodifikation würde Trainingsdaten zu Anthropic/OpenAI/Mistral übertragen — eine andere Rechtsgrundlage erfordern und eine andere DPA-Konfiguration.

---

## 3.6 Komponente 5: Transparenz-Layer und nutzergetriebene Modussteuerung

### 3.6.1 Das Spannungsfeld als Designprinzip

Der Thesis-Titel — *"neuroadaptive personalisierte Lernbegleitung"* — enthält ein theoretisches Spannungsfeld: Neuroadaptivität bezeichnet systemseitige Adaptation (Personalisierung), während der Anspruch auf Selbstwirksamkeitsstärkung eine lernerseitige Kontrolle (Individualisierung) voraussetzt. Die Antwort liegt in einer fünften Systemkomponente: dem Transparenz-Layer mit nutzergetriebener Modussteuerung.

### 3.6.2 Transparenz-Layer: Sichtbarkeit der Adaptation

Ein System, das unsichtbar adaptiert, trifft automatisierte Einzelentscheidungen über den Lernenden — rechtlich problematisch nach DSGVO Art. 22, didaktisch problematisch nach SDT (Deci & Ryan, 2000). Der Transparenz-Layer macht drei Klassen von Informationen zugänglich:

1. **Aktiver Interaktionsmodus** — welcher der vier Modi gerade aktiv ist und warum
2. **Inferiertes Profil** — was das System über den Lernenden abgeleitet hat
3. **Änderungshistorie** — wann und warum das System den Modus gewechselt hat

### 3.6.3 `user_mode_override`: Nutzerkontrolle als First-Class-Konzept

Mögliche Interaktionen:
- *"Kannst du mich gerade mehr unterstützen statt nur zu fragen?"* → Aktiviert Scaffolding-Modus, unabhängig von Lazarus-Signal
- *"Die gestrige Einschätzung war falsch, ich war nicht frustriert"* → Korrektur der session-aggregierten Profildaten
- *"Lösch mein Lernprofil"* → Art. 17 DSGVO, technisch als Reset implementiert

### 3.6.4 Session-Abschluss als didaktisches Ritual

Das System erkennt das natürliche Ende einer Session über drei simultane Indikatoren: Zeitfenster (10–15 Minuten), semantische Kohärenz und Gesprächsenergie. Kein hartes Timeout — ein weiches Signal wenn alle drei Indikatoren auf Abschluss hindeuten.

Das Session-Ende wird dem Lernenden durch eine stille, nicht-modale Karte kommuniziert. Diese zeigt zwei Elemente: (1) die stärksten eigenen Formulierungen des Lernenden aus dieser Session — wörtlich extrahiert aus `strongest_quote`, nicht paraphrasiert — und (2) eine offene Frage, die bewusst ungelöst bleibt. Dieser kognitive Widerstand (Berlyne, 1960; Zeigarnik, 1927) erzeugt den Effekt, dass die nächste Session nicht als Pflicht, sondern als Auflösung einer interessierenden Lücke erlebt wird.

### 3.6.5 Lernfaden: persönliche Erkenntnischronik

Die destillierten eigenen Formulierungen akkumulieren sich über Wochen zu einem nutzereigenen Lernfaden — einer Chronik der selbst erarbeiteten Gedanken, nicht der KI-Ausgaben. Der Lernfaden ist jederzeit einsehbar, vollständig exportierbar (DSGVO Art. 20) und auf Wunsch löschbar (Art. 17).

### 3.6.6 Schutz vor Automatisierungsabhängigkeit

Profile die nie schrumpfen, erzeugen Lernende die immer mehr Unterstützung erwarten. Das Transparenz-Prinzip schließt daher explizit ein: Das System zeigt an, wenn Scaffold-Anteile über Zeit abnehmen — als sichtbares Signal wachsender Kompetenz, nicht als unsichtbare Systemoptimierung.

---

## 3.7 Technische Systemarchitektur

### 3.7.1 Stack und Hosting

KAIA ist als DSGVO-konforme Webanwendung auf EU-Infrastruktur realisiert. Die Technologiewahl folgt dem Prinzip "Boring Technology bevorzugen" — alle Komponenten sind etablierte, gut dokumentierte Systeme ohne proprietäre Lock-in-Risiken.

| Bereich | Technologie | Begründung |
|---|---|---|
| Backend | FastAPI 0.115+, Python 3.12 | Async-native, Pydantic v2 Validierung, OpenAPI auto-docs |
| ORM / Migrationen | SQLAlchemy 2.0 async, Alembic | Typsicher, versionierte Schema-Änderungen |
| Datenbank | PostgreSQL 16 + pgvector | Einheitliche Datenhaltung; kein separates Vektor-Store nötig |
| Auth | Custom JWT: Access 15 min, Refresh 30d rotierend, bcrypt 12 Runden | Kontrolle ohne externe Auth-Abhängigkeit |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Radix) | Server Components, starke Typisierung, Accessibility via Radix |
| State / Validierung | React Query, Zod | Deklaratives Fetching, Schema-Validierung auf FE-Seite |
| Hosting | Hetzner CX23 Helsinki, Docker Compose, Caddy + Let's Encrypt | EU-Server (DSGVO-Konformität), vollständige Kontrolle über Infrastruktur |
| Observability | Sentry (FE + BE), Slack-Webhooks, structlog JSON | Fehler-Monitoring, strukturiertes Logging |
| LLM-Streaming | Server-Sent Events (SSE) | Kein WebSocket-Overhead; uni-direktionaler Datenfluss ausreichend |
| Study-Lock | `STUDY_MODE=locked` (CI-Gate) | Prompt- und Schema-Freeze während Datenerhebung |

Die Hosting-Entscheidung für Hetzner Helsinki ist nicht aus Kostengründen getroffen, sondern aus Compliance-Gründen: EU-Server mit bekanntem Standort sind die Voraussetzung für eine DSGVO-konforme Verarbeitung personenbezogener Daten ohne Schrems-II-Problematik (EuGH C-311/18).

### 3.7.2 Multi-Modell-Architektur

KAIA unterstützt sieben LLM-Varianten über eine einheitliche Provider-Abstraktion:

| Modell | Model-ID | Provider | Rolle im System |
|---|---|---|---|
| Claude Sonnet 4.6 | claude-sonnet-4-6 | Anthropic | Primäres Produktionsmodell |
| Claude Haiku 4.5 | claude-haiku-4-5-20251001 | Anthropic | Session-Extraktion, Profilgenerierung, Eval-Judge |
| GPT-4o | gpt-4o | OpenAI | LLM-Eval-Vergleich |
| GPT-5.6 Terra | gpt-5.6-terra | OpenAI | LLM-Eval-Vergleich (neueres Modell) |
| GPT-4.1 mini | gpt-4.1-mini | OpenAI | LLM-Eval-Vergleich (Kostenvariante) |
| Mistral Large | mistral-large-latest | Mistral AI | LLM-Eval-Vergleich (EU-Provider) |
| Mistral Small | mistral-small-latest | Mistral AI | LLM-Eval-Vergleich (Kostenvariante) |

Die Abstraktion erfolgt über eine `_provider(model: str)`-Funktion im Service-Layer, die anhand des Modell-Namens den passenden SDK-Client auswählt: Anthropic SDK für `claude-*`-Modelle, OpenAI SDK (API-kompatibel) für `gpt-*` und `mistral-*`-Modelle. Die Mistral-API ist OpenAI-SDK-kompatibel mit anderem `base_url`. Für GPT-5.x-Modelle wird `max_completion_tokens` statt `max_tokens` verwendet, was die API-Inkompatibilität dieser Modellgeneration kapselt.

**Per-User-Modell-Zuweisung:** Die `users`-Tabelle enthält eine nullable `kaia_model`-Spalte. Per `PATCH /api/v1/admin/users/{id}` kann die Forscherin jedem Studienteilnehmenden ein spezifisches Modell zuweisen. Dies ist die technische Grundlage für den LLM-Evaluationsbericht: Identische Nutzungsszenarien können gezielt auf unterschiedliche Modelle geroutet werden. Fehlt eine Zuweisung (NULL), greift das systemweite Standardmodell.

**Anthropic Prompt Caching:** Systemprompts werden mit `cache_control: ephemeral` an die Anthropic API übergeben. Das System logt `cache_creation_input_tokens` und `cache_read_input_tokens` aus dem Anthropic-Usage-Objekt — beides für das Cost-Tracking relevant (gecachte Token kosten ca. 10% der normalen Input-Token-Rate).

**Vier Stream-Funktionen:** Alle LLM-Aufrufe laufen über eine von vier SSE-Stream-Funktionen: `stream_opening` (Begrüßung/Einstieg), `stream_response` (Hauptantwort auf User-Nachricht), `stream_closing` (Session-Abschluss), `stream_meta_question` (ausgelöst durch EMA-Feedback `stuck` oder `unclear`). Alle vier Funktionen akzeptieren einen `model_override`-Parameter für Per-Request-Modell-Zuweisung.

### 3.7.3 KAIA-Charaktere als nutzergetriebene Stilauswahl

Parallel zur systemgetriebenen Modus-Steuerung (Abschnitt 3.2) existiert eine nutzergetriebene Stilauswahl über drei KAIA-Charaktere:

| Charakter | Technischer Name | Beschreibung | Didaktische Entsprechung |
|---|---|---|---|
| **Warm** | `warm` | Wertschätzend, empathisch, einladend. Neugier als Einladung formuliert. | Scaffolding/Unterstützend; SDT-Autonomieunterstützung |
| **Challenging** | `challenging` | Klar, direkt, konfrontierend. Fragen als Herausforderung formuliert. | Kritisch-herausfordernd; kognitive Dissonanz |
| **Wild** | `wild` | Unberechenbar, überraschend, Perspektivwechsel. Unkonventionelle Anschlussfragen. | Sokratisch-explorativ mit lateralen Denkimpulsen |

Jeder Charakter hat ein eigenes, versioniertes Jinja2-Prompt-Template in der `prompt_templates`-Tabelle (je ein aktives Template pro Charakter). Der Charakter wird beim Session-Start ausgewählt und in `chat_sessions.character` persistiert. Der Charakterselektor ist im Chat-Interface im Eingabebereich platziert — nicht im Header — um ihn als Gesprächswerkzeug statt als globale Einstellung zu positionieren.

Die Charaktere sind keine Ersetzung der vier Interaktionsmodi (Abschnitt 3.3.1), sondern eine übergeordnete Stilebene: Der `warm`-Charakter kann alle vier Modi ausführen, tut es aber in einem wertschätzenden Ton. Der `challenging`-Charakter führt denselben Scaffolding-Modus in einem direkteren Ton aus. Dies erlaubt den Teilnehmenden, einen ihnen angenehmen Gesprächsstil zu wählen, ohne die didaktische Adaptivität zu beeinträchtigen.

Das Prompt-Management in der Datenbank (live editierbar ohne Redeploy, versioniert) erlaubt während der Studie gezieltes Prompt-Finetuning ohne Deployment-Unterbrechung. Im Study-Lock-Modus (`STUDY_MODE=locked`) werden neue Prompt-Versionen vom CI-Gate blockiert — die Prompts sind für die Datenerhebungsphase eingefroren.

### 3.7.4 EMA-Feedback-Protokoll

Das Ecological Momentary Assessment (EMA) ist in KAIA als Feedback-Button-Interface in der Chat-UX implementiert. Vier Feedback-Typen stehen nach jeder KAIA-Antwort zur Verfügung:

| Button | Technischer Name | Semantik | LLM-Reaktion |
|---|---|---|---|
| Transfer-Marker | `transfer_marker` | "Das muss ich weiterdenken" | Keine — nur Persistierung als Signal |
| Wow | `wow` | "Das trifft etwas" | Keine — nur Persistierung als Signal |
| Hänge | `stuck` | "Ich verstehe das noch nicht" | Auslöser für `stream_meta_question` |
| Unklar | `unclear` | "Die Frage ist unklar" | Auslöser für `stream_meta_question` |

`transfer_marker` und `wow` sind passive Signale: Sie werden persistiert und fließen in die Session-Extraktion (Abschnitt 3.5.3) ein, lösen aber keine direkte LLM-Reaktion aus. `stuck` und `unclear` hingegen triggern unmittelbar einen separaten LLM-Call via `stream_meta_question` — das System reformuliert oder elaboriert ohne die Hauptkonversation zu unterbrechen.

Das EMA-Feedback ist ein zentrales Forschungs-Datenerfassungselement: Die Häufigkeit von `stuck`- und `wow`-Markierungen über die Sessions hinweg liefert einen Proxy-Indikator für Challenge-Skill-Balance (Csikszentmihalyi, 1990) unabhängig von der FKS-Erhebung.

### 3.7.5 Chat-Interface-Komponenten

Drei dedizierte UI-Komponenten strukturieren die Chat-UX:

- **ChatDayBanner:** Zeigt "Session N von 10 · [Phasenhinweis]" am Session-Start, dismissible. Informiert über die übergreifende Bloom-Phase ohne die interne Mikrostruktur preiszugeben.
- **ChatInfoPanel:** Anleitung auf Abruf — erklärt die drei Charaktere, die Gesprächsregeln (keine Antworten, nur Fragen) und die EMA-Feedback-Buttons. Nicht beim ersten Start aufgezwungen; jederzeit zugänglich.
- **ChatReportModal:** Ermöglicht die Meldung problematischer Gesprächsverläufe über `POST /api/v1/chat/sessions/{id}/report` mit Slack-Webhook-Benachrichtigung an die Forscherin. Enthält einen expliziten Crisis-Detection-Disclaimer (Verweis auf Telefonseelsorge 0800 111 0 111).

---

## 3.8 Messinfrastruktur der Pilotstudie

### 3.8.1 Designprinzip: Mehrschichtige Messung

Die Messinfrastruktur von KAIA operiert auf drei zeitlichen Ebenen: Prä/Post-Messung (vor Session 1 und nach Session 10), Verlaufsmessung (FKS nach Sessions 2, 5, 8, 10) und kontinuierliche In-Session-Datenerfassung (EMA-Feedback). Diese Kombination erlaubt sowohl einen Gesamtvergleich (Prä vs. Post) als auch eine Längsschnittanalyse des Verlaufs.

Bei N≈20 ohne Kontrollgruppe und ohne Randomisierung sind kausale Wirksamkeitsaussagen methodisch nicht zulässig. Die Messung dient der explorativen Deskription und der Hypothesengenerierung für zukünftige Studien — nicht der konfirmatorischen Hypothesenprüfung. Diese Einschränkung ist in Kapitel 6 explizit zu kommunizieren.

### 3.8.2 Allgemeine Selbstwirksamkeitserwartung (GSE)

Die GSE-Skala (Schwarzer & Jerusalem, 1995) ist das primäre Outcome-Instrument der Pilotstudie. Sie misst die generalisierte Überzeugung, schwierige Aufgaben und Herausforderungen bewältigen zu können — unabhängig von einer spezifischen Domäne.

- **Items:** 10 Items, 4-stufige Likert-Skala (1 = stimmt nicht, 2 = stimmt kaum, 3 = stimmt eher, 4 = stimmt genau)
- **Summenscore:** 10–40; höhere Werte = höhere Selbstwirksamkeitserwartung
- **Gütekriterien:** α = .80–.90 in deutschsprachigen Stichproben; konvergente Validität mit Optimismus, Handlungsorientierung; diskriminante Validität gegenüber Angst und Depression (Schwarzer & Jerusalem, 1995)
- **Messzeitpunkte:** Prä (nach Consent, vor Session 1) und Post (unmittelbar nach Session 10, vor dem Debriefing)
- **GSE-Priming-Schutz in Session 10:** Das Systemprompt enthält via `is_final_session=True` die explizite Constraint-Regel, keine Fragen zu stellen, die auf Selbstwirksamkeitserleben hinweisen, um die Unabhängigkeit der Post-Messung zu sichern (Demand Characteristics, Orne, 1962).

Der `gse_baseline`-Wert aus der Pre-Survey wird in der `user_learning_profiles`-Tabelle persistiert und in jeden PromptContext injiziert. Dies ermöglicht dem LLM eine grobe Einschätzung des Ausgangs-Selbstwirksamkeitsniveaus bei der Prompt-Formulierung — ohne dass das LLM explizit darauf referenziert (laut Prompt-Constraint: kein direkter Verweis auf Profildaten).

### 3.8.3 Motivational Strategies for Learning Questionnaire — KAIA-Adaptation (MSLQ)

Der MSLQ (Pintrich et al., 1991, 1993) ist ein etabliertes Instrument zur Erfassung motivationaler Dispositionen und Lernstrategien in Hochschulkontexten. Das Original umfasst 81 Items über 15 Subskalen. Für KAIA wurde eine domänenunspezifische Adaptation auf vier Subskalen und 30 Items entwickelt, die auf das informelle Erwachsenenlernen zugeschnitten ist.

**Vier KAIA-Subskalen:**

1. **Intrinsische Zielorientierung** (Intrinsic Goal Orientation): Misst das Ausmaß, in dem Lernende aus epistemischer Neugier und eigenem Erkenntnisinteresse lernen — unabhängig von externen Anreizen. Für KAIA besonders relevant: Intrinsische Zielorientierung ist die Voraussetzung für sinnvolle sokratische Begleitung. Ein rein extrinsisch motivierter Lernender wird sokratische Fragen als Hindernis erleben, nicht als Erkenntnisweg.

2. **Selbstwirksamkeit für Lernen** (Self-Efficacy for Learning): Misst die subjektive Überzeugung, Lernziele erreichen und Lernstrategien erfolgreich einsetzen zu können. Konzeptuell verwandt mit der GSE (Schwarzer & Jerusalem, 1995), aber domänenspezifischer auf Lernsituationen bezogen. Das gleichzeitige Messen beider Konstrukte ermöglicht differenzierte Aussagen: Generelle Selbstwirksamkeit vs. lernspezifische Selbstwirksamkeit.

3. **Metakognitive Lernstrategien** (Metacognitive Learning Strategies): Misst Planung, Monitoring und Regulation des eigenen Lernprozesses. Dieses Konstrukt ist die messbare Zielgröße von KAIAs sokratischer Methode: Wer regelmäßig Anamnese-Fragen und Erste-Schritt-Fragen beantwortet, sollte über die Studiendauer mehr metakognitive Aktivität entwickeln.

4. **Kognitive Verarbeitungstiefe** (Deep Cognitive Processing): Misst elaborative Verarbeitung, Verknüpfung mit Vorwissen und kritisches Denken. Operationalisiert den Unterschied zwischen Oberflächenlernen (Fakten reproduzieren) und Tiefenlernen (Prinzipien verstehen und transferieren).

- **Skalierung:** 7-stufige Likert-Skala (1 = trifft überhaupt nicht zu, 7 = trifft völlig zu)
- **Subskalen-Score:** Arithmetisches Mittel der Items pro Subskala
- **Gütekriterien:** Pintrich et al. (1993) belegen α ≥ .62 für alle 15 Originalsubskalen; konvergente und diskriminante Validität in Hochschulstichproben belegt
- **Messzeitpunkte:** Prä (nach Consent, vor Session 1) und Post (unmittelbar nach Session 10)
- **Persistierung:** Alle vier Subskalen-Scores in `user_learning_profiles.subscale_scores` (JSONB) — für die Thesis-Auswertung vollständig verfügbar

### 3.8.4 Flow-Kurzskala (FKS)

Die FKS (Rheinberg et al., 2003) erfasst das Flow-Erleben unmittelbar nach der Session und ist in Abschnitt 3.3.10.3 ausführlich beschrieben. Als Verlaufsmessung nach Sessions 2, 5, 8 und 10 liefert sie eine Längsschnittperspektive auf die Challenge-Skill-Balance, die durch die Prä/Post-Erhebungen allein nicht abzubilden wäre.

### 3.8.5 LLM-generiertes Lernendenprofil

Nach Abschluss der Pre-Survey-Instrumente generiert Claude Haiku einen Profiltext (max. 120 Wörter, `temperature=0`) aus den MSLQ-Subskalen-Scores und dem GSE-Baseline-Wert. Der Text kategorisiert den Lernenden in einen von vier Profil-Typen und beschreibt charakteristische Lernmotivation, Stärken und potenzielle Hürden in für das LLM nützlicher Form.

Dieser Profiltext ist das einzige Element der Messinfrastruktur, das direkt in das LLM-Verhalten der Studie einfließt: Als unveränderlicher `learner_profile`-Kontext in jedem Systemprompt steuert er, wie KAIA in Session 1 die Lernenden anspricht und welche Fragetypen priorisiert werden.

Die Unveränderlichkeit des Profils über die Studiendauer ist absichtlich: Das Profil beschreibt den Ausgangszustand, nicht den aktuellen Zustand. Das kumulative Session-Gedächtnis (Schicht 2, Abschnitt 3.5.3) übernimmt die dynamische Anpassung. Diese Trennung erlaubt in der Thesis-Auswertung, den Einfluss des statischen Ausgangsprofils von der dynamischen Verhaltensevolution zu isolieren — zumindest deskriptiv.

### 3.8.6 Messzeitpunkte und Studiendesign im Überblick

| Zeitpunkt | Instrument | Zweck |
|---|---|---|
| Vor Session 1 (Pre-Survey) | GSE (10 Items) + MSLQ-Adaptation (30 Items) | Baseline-Messung; Auslöser für Profilgenerierung |
| Nach Session 2 | FKS (10 Items) | Flow-Verlaufsmessung (frühe Phase) |
| Nach Session 5 | FKS (10 Items) | Flow-Verlaufsmessung (Halbzeit) |
| Nach Session 8 | FKS (10 Items) | Flow-Verlaufsmessung (Spätphase) |
| Nach Session 10 (Post-Survey) | GSE (10 Items) + MSLQ-Adaptation (30 Items) + FKS (10 Items) | Post-Messung; Grundlage Prä/Post-Vergleich |

Die Pre-Survey wird in der KAIA-Webanwendung als Onboarding-Schritt nach dem Multi-Step-Consent (zwei getrennte Checkboxen: Datenverarbeitung und Analytics/Studie) durchgeführt. Die FKS-Messungen erscheinen unmittelbar nach dem Session-Abschluss als modaler Overlay — vor dem Logout, nach dem Lernfaden-Export-Angebot.

---

## 3.9 Evaluationsarchitektur des LLM-Vergleichs

### 3.9.1 Zweck und Abgrenzung

Die Evaluationsarchitektur dient einem anderen Zweck als die Pilotstudie-Messinfrastruktur (Abschnitt 3.8): Während die Pilotstudie die Wirkung von KAIA auf Lernende untersucht, untersucht die Eval-Architektur die Eignung verschiedener LLMs für KAIAs didaktisches Design. Die Frage lautet nicht "Wirkt KAIA?", sondern "Welches Modell setzt KAIAs Kernprinzipien (Abschnitt 3.1.1) am konsistentesten um?"

### 3.9.2 Crash-Persona-Simulation

Vor Studienstart und bei Modell-Änderungen werden zehn vordefinierte Crash-Personas durch KAIA simuliert. Die Personas decken verschiedene Stress- und Krisenszenarien ab und testen systematisch, ob das Modell in Grenzfällen das didaktische Design respektiert.

Die Simulation ist automatisiert: Ein Simulations-Runner schickt sequenziell die Persona-Nachrichten an die KAIA-API (identisch zum echten Nutzerpfad) und sammelt die Antworten als Transkripte. Die Transkripte erscheinen in der Admin-Oberfläche mit vollständigem Gesprächsverlauf und Eval-Metriken. Dies ermöglicht der Forscherin, vor der Studienphase zu validieren, dass kein Modell in Krisensituationen ungeeignete Reaktionen zeigt.

### 3.9.3 Eval-Matrix: Vier Metriken

Die Eval-Matrix bewertet jede Modell-Persona-Kombination auf vier Metriken:

| Metrik | Definition | Operationalisierung |
|---|---|---|
| **Empathiequalität** | Misst computational empathy: Wird Affekt wahrgenommen und angemessen gespiegelt, ohne in Therapie-Terrain zu gleiten? | 5-Punkt-Rubrik: 1=ignoriert Affekt, 5=erkennt und spiegelt ohne Vertiefung |
| **Sokratische Treue** | Misst Adhärenz an das Kernprinzip: Löst die Antwort kognitive Arbeit aus, oder übernimmt sie sie? | Binär je Turn + 5-Punkt-Gesamtbewertung; Referenz: sechs Fragetypen (Abschnitt 3.3.5) |
| **Konsistenz** | Misst Konsistenz der Antwortlogik über Turns hinweg: Widerspricht sich das Modell, wechselt es unangekündigt den Modus? | 5-Punkt-Rubrik; bewertet 3–5 aufeinanderfolgende Turns gemeinsam |
| **Crisis-Detection-Safety** | Misst Sicherheit in Krisensituationen: Erkennt das Modell Krisen-Signale und eskaliert korrekt? | Binär: PASS (korrekte Eskalation mit Disclaimer) / FAIL (ignoriert oder vertieft) |

### 3.9.4 LLM-as-Judge

Die Bewertung der vier Metriken erfolgt durch Claude Sonnet (claude-sonnet-4-6) als Evaluations-Judge — ein LLM-as-Judge-Ansatz (Zheng et al., 2023). Der Judge erhält Transkript-Ausschnitte mit explizitem Scoring-Prompt und gibt strukturiertes JSON mit Scores und Begründungen zurück.

Methodische Einschränkung: Claude Sonnet als Judge bei der Bewertung von Claude-Sonnet-Antworten ist eine Form von Self-Evaluation mit bekannter Bias-Anfälligkeit (Zheng et al., 2023: Self-Enhancement Bias). Die Studie dokumentiert dies explizit und ergänzt für kritische Metriken (insbesondere Crisis-Detection-Safety) eine manuelle Überprüfung durch die Forscherin. Für den LLM-Evaluationsbericht (Kapitel 5) werden alle vier Modelle (Claude Sonnet, GPT-4o, Mistral Large) sowohl als Kandidaten als auch mit Cross-Evaluation bewertet — das heißt: Claude bewertet GPT-Antworten und umgekehrt, um den Self-Enhancement-Bias zu kontrollieren.

### 3.9.5 Eval-Infrastruktur

Die Admin-Oberfläche bietet vier Ansichten für die Evaluationsergebnisse:

- **Live-Log:** Echtzeit-Ausgabe der laufenden Simulation, Token-für-Token. Ermöglicht der Forscherin das direkte Beobachten des Gesprächsverlaufs während der Simulation.
- **Heatmap:** Visualisiert geflaggte Metriken pro Zelle (Modell × Persona × Metrik) — Rot = FAIL oder Score ≤ 2, Gelb = Score 3, Grün = Score ≥ 4. Ermöglicht schnelle Identifikation systematischer Schwachstellen.
- **Eval-Vergleichsmodus:** Zwei Modelle nebeneinander mit identischer Persona und Metrik-Overlay. Grundlage für den qualitativen LLM-Evaluationsbericht.
- **Rate-Limit-Retry:** Exponentielles Backoff bei API-Rate-Limit-Fehlern; die Simulation läuft ohne manuelle Eingriffe durch, auch wenn einzelne API-Calls temporär fehlschlagen.

---

## 3.10 Synthese: Das KAIA-Rahmenwerk als Designartefakt

Das konzeptionelle Rahmenwerk von KAIA ist ein Designartefakt im Sinne von Hevner et al. (2004). Seine fünf Komponenten bilden keine unabhängigen Teilsysteme, sondern ein kohärentes System:

Das regelbasierte Adaptionssystem (Lazarus) liefert die Zustandssignale → die Mehr-Modus-Architektur wählt den passenden Interaktionsstil → die Lernroadmap gibt den inhaltlichen Kontext → das wachsende Nutzerprofil akkumuliert die Erkenntnisse → der Transparenz-Layer gibt dem Lernenden Einsicht und Kontrolle über alles. Jede Session baut auf der vorherigen auf; keine Adaptation geschieht unsichtbar.

Die technische Realisierung (Abschnitte 3.7–3.9) ist die operative Konkretisierung dieses konzeptionellen Rahmens als lauffähiger Prototyp auf EU-Infrastruktur. Die Messinfrastruktur (Abschnitt 3.8) operationalisiert die Forschungsfragen der Pilotstudie. Die Evaluationsarchitektur (Abschnitt 3.9) operationalisiert den LLM-Evaluationsbericht.

Diese Architektur adressiert direkt das Spannungsfeld aus Kapitel 2: Sie schützt Eigenleistung (sokratischer Modus bei Flow), bietet Unterstützung ohne Antworten (Scaffolding bei Überforderung), stärkt Selbstwirksamkeit durch Fortschrittserfahrung (Roadmap) und wächst mit der lernenden Person (wachsendes Nutzerprofil). Die Transparenz-Komponente schließt den Kreis zwischen systemseitiger Adaptation und lernerseitiger Kontrolle — das zentrale Spannungsfeld des Thesis-Titels.

---

## Literaturverzeichnis (Kapitel 3, ergänzt)

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A Taxonomy for Learning, Teaching, and Assessing*. Longman.

Ausubel, D. P. (1968). *Educational Psychology: A Cognitive View*. Holt.

Baker, R. S., D'Mello, S. K., Rodrigo, M. M. T., & Graesser, A. C. (2010). Better to be frustrated than bored: The incidence, persistence, and impact of learners' cognitive–affective states during interactions with three different computer-based learning environments. *International Journal of Human-Computer Studies, 68*(4), 223–241. https://doi.org/10.1016/j.ijhcs.2009.12.003

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Berlyne, D. E. (1960). *Conflict, Arousal and Curiosity*. McGraw-Hill.

Biggs, J., & Tang, C. (2011). *Teaching for Quality Learning at University* (4. Aufl.). Open University Press.

Boekaerts, M. (1993). Being concerned with well-being and with learning. *Educational Psychologist, 28*(2), 149–167. https://doi.org/10.1207/s15326985ep2802_4

Boekaerts, M. (2011). Emotions, emotion regulation, and self-regulation of learning. In B. J. Zimmerman & D. H. Schunk (Hrsg.), *Handbook of self-regulation of learning and performance* (S. 408–425). Routledge.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.

Cohen, P. A. (1989). Teaching academic skills through tutoring. *Review of Educational Research, 59*(1), 77–97.

Craik, F. I. M., & Lockhart, R. S. (1972). Levels of processing: A framework for memory research. *Journal of Verbal Learning and Verbal Behavior, 11*(6), 671–684.

Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.

D'Mello, S. K., & Graesser, A. C. (2012a). Dynamics of affective states during complex learning. *Learning and Instruction, 22*(2), 145–157. https://doi.org/10.1016/j.learninstruc.2011.10.001

D'Mello, S. K., & Graesser, A. C. (2012b). AutoTutor and Affective AutoTutor: Learning by talking with cognitively and emotionally intelligent computers that talk back. *ACM Transactions on Interactive Intelligent Systems, 2*(4), Article 23. https://doi.org/10.1145/2395123.2395128

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Plenum.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.

Dweck, C. S. (2006). *Mindset: The New Psychology of Success*. Random House.

Edelmann, W. (2000). *Lernpsychologie* (6. Aufl.). Beltz.

Engeser, S., & Rheinberg, F. (2008). Flow, performance and moderators of challenge-skill balance. *Motivation and Emotion, 32*(3), 158–172.

EuGH. (2020). *Urteil in der Rechtssache C-311/18 — Data Protection Commissioner gegen Facebook Ireland und Maximillian Schrems*. Europäischer Gerichtshof.

Festinger, L. (1957). *A Theory of Cognitive Dissonance*. Stanford University Press.

Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. *American Psychologist, 54*(7), 493–503.

Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38*, 69–119.

Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Johnson-Laird, P. N. (1983). *Mental Models*. Cambridge University Press.

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.

Knowles, M. S. (1975). *Self-Directed Learning: A Guide for Learners and Teachers*. Association Press.

Knowles, M. S. (1980). *The Modern Practice of Adult Education: From Pedagogy to Andragogy* (2. Aufl.). Cambridge Book Company.

Knowles, M. S. (1984). *Andragogy in Action: Applying Modern Principles of Adult Learning*. Jossey-Bass.

Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*. Prentice-Hall.

Lave, J., & Wenger, E. (1991). *Situated Learning: Legitimate Peripheral Participation*. Cambridge University Press.

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology, 44*(1), 1–21.

Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer.

Locke, E. A., & Latham, G. P. (1990). *A Theory of Goal Setting & Task Performance*. Prentice-Hall.

Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation: A 35-year odyssey. *American Psychologist, 57*(9), 705–717.

Markland, D., Ryan, R. M., Tobin, V. J., & Rollnick, S. (2005). Motivational interviewing and self-determination theory. *Journal of Social and Clinical Psychology, 24*(6), 811–831.

Merrill, M. D. (2002). First principles of instruction. *Educational Technology Research and Development, 50*(3), 43–59.

Miller, W. R., & Rollnick, S. (2013). *Motivational Interviewing: Helping People Change* (3. Aufl.). Guilford Press.

Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Hrsg.), *Handbook of Positive Psychology* (S. 89–105). Oxford University Press.

Orne, M. T. (1962). On the social psychology of the psychological experiment: With particular reference to demand characteristics and their implications. *American Psychologist, 17*(11), 776–783.

Pekrun, R. (2006). The control-value theory of achievement emotions: Assumptions, corollaries, and implications for educational research and practice. *Educational Psychology Review, 18*(4), 315–341. https://doi.org/10.1007/s10648-006-9029-9

Perkins, D. N., & Salomon, G. (1989). Are cognitive skills context-bound? *Educational Researcher, 18*(1), 16–25.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A Manual for the Use of the Motivated Strategies for Learning Questionnaire (MSLQ)*. National Center for Research to Improve Postsecondary Teaching and Learning, University of Michigan. (ERIC Document Reproduction Service No. ED338122)

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement, 53*(3), 801–813.

Rheinberg, F., Vollmeyer, R., & Engeser, S. (2003). Die Erfassung des Flow-Erlebens. In J. Stiensmeier-Pelster & F. Rheinberg (Hrsg.), *Diagnostik von Motivation und Selbstkonzept* (S. 261–279). Hogrefe.

Ryan, R. M., & Deci, E. L. (2000). Intrinsic and extrinsic motivations: Classic definitions and new directions. *Contemporary Educational Psychology, 25*(1), 54–67.

Ryan, R. M., Legate, N., Weinstein, N., & Hemric, M. (2023). Self-determination theory as a macro-level theory of motivation and well-being: Review and meta-analysis across 486 samples. *Psychological Bulletin, 149*(9–10), 513–545.

Schimpf, C., Voigt, S., & Bohné, T. (2026). AI-assisted goal setting improves goal achievement: A randomized controlled trial. *arXiv preprint arXiv:2603.17887*.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547.

Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.

Weinert, F. E. (2001). Concept of competence: A conceptual clarification. In D. S. Rychen & L. H. Salganik (Hrsg.), *Defining and Selecting Key Competencies* (S. 45–65). Hogrefe.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573.

Woloshyn, V. E., Pressley, M., & Schneider, W. (1992). Elaborative-interrogation and prior-knowledge effects on learning of facts. *Journal of Educational Psychology, 84*(1), 115–124.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.

Woolf, B. P., Burleson, W., Arroyo, I., Dragon, T., Cooper, D., & Picard, R. W. (2009). Affect-aware tutors: Recognising and responding to student affect. *International Journal of Learning Technology, 4*(3/4), 129–164. https://doi.org/10.1504/IJLT.2009.028804

Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482.

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. *Advances in Neural Information Processing Systems, 36*, 46595–46623.

Zimmermann, B. J. (2000). Attaining self-regulation: A social cognitive perspective. In M. Boekaerts, P. R. Pintrich, & M. Zeidner (Hrsg.), *Handbook of Self-Regulation* (S. 13–39). Academic Press.
