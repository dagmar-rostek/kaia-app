# Kapitel 3 — Konzeptionelles Rahmenwerk

> **Stand:** 10. Juni 2026 · **Version:** 1.2-DRAFT  
> **Reviewer:** Psychologe (3.2, 3.3) ✓ · AI Engineer (3.3–3.6) ✓ · Didaktiker (3.6–3.8) ✓ · Architect  
> **Geplanter Umfang:** ca. 20–25 Seiten (~5.000–6.000 Wörter)  
> **Status:** 10-Session-Design, Kolb-Korrektur, Flow-Messung, Sprachregeln, Wissensarten-Routing ergänzt (v1.2)

---

## Überblick

Dieses Kapitel entwickelt das konzeptionelle Rahmenwerk von KAIA. Es übersetzt die theoretischen Grundlagen (Kapitel 2) in operative Designentscheidungen und beschreibt das **Fünf-Komponenten-Modell**: (1) regelbasiertes Adaptionssystem, (2) Mehr-Modus-Interaktionsarchitektur, (3) Lernroadmap-Integration, (4) Zwei-Schicht-Gedächtnis und wachsendes Nutzerprofil, (5) Transparenz-Layer und nutzergetriebene Modussteuerung. Die fünfte Komponente löst das zentrale Spannungsfeld des Thesis-Titels auf: Wie kann systemseitige Adaptation (Personalisierung) Selbstwirksamkeit stärken statt untergraben?

Der Thesis-Titel — *"Entwicklung eines empathischen AI-Agenten zur neuroadaptiven personalisierten Lernbegleitung"* — enthält vier Designanforderungen, die in diesem Kapitel operationalisiert werden: Empathie (computational empathy, explizit als KI kommuniziert), Neuroadaptivität (regelbasiertes Adaptionssystem informiert durch Lazarus), Personalisierung (wachsendes Nutzerprofil), Lernbegleitung (sokratisch und scaffolding, kein Instruktionssystem).

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

> **KAIA übernimmt niemals die kognitive Arbeit, die der Lernende selbst leisten muss. KAIA's Output löst die nächste kognitive Operation aus — er ersetzt sie niemals.**

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

### 3.3.3 Begründungsrahmen: Edelmanns Lernprozesstaxonomie

Die Vier-Modi-Architektur lässt sich zusätzlich durch Edelmanns (2000) Taxonomie der Lernprozesse begründen, die vier hierarchisch geordnete Stufen unterscheidet: assoziatives Lernen (Reiz-Reaktions-Verbindungen), instrumentelles Lernen (Lernen durch Konsequenzen), Begriffsbildung und Wissenserwerb sowie planvolles Handeln und Problemlösen.

KAIA operiert bewusst primär auf Stufen 3 und 4. Dies ist für die Zielgruppe — Erwachsene in Hochschule und beruflicher Weiterbildung — entwicklungspsychologisch angemessen: Tiefenverarbeitung, Konzepttransfer und metakognitive Steuerung sind für diese Gruppe die relevanten Lernmechanismen; assoziative Drill-Methoden (Stufe 1) sind für komplexe Weiterbildungsinhalte didaktisch irrelevant. Das Mapping der vier KAIA-Modi auf Edelmanns Stufen zeigt folgende Zuordnung:

Sokratisch-explorativ (Stufe 4) fördert metakognitive Selbststeuerung durch Frageprovokation. Scaffolding/unterstützend (Stufe 3) unterstützt aktive Begriffsbildung; dies entspricht Vygotskys (1978) Zone der nächsten Entwicklung, die konzeptuell verwandt mit Edelmanns Stufe 3, aber theoretisch davon zu trennen ist. Kritisch-herausfordernd (Stufe 4) erzeugt kognitive Konflikte als Lernauslöser im Sinne Piagets. Wertschätzend-bestärkend (Stufe 2) nutzt Mechanismen instrumentellen Lernens — allerdings in der SDT-kompatiblen Form attributionalen Feedbacks (Weiner, 1985; Deci & Ryan, 1985), nicht als pauschale Bestätigung: KAIA attribuiert Erfolge auf die Eigenleistung ("Du hast X und Y selbst verknüpft"), nicht auf externe Umstände.

Eine verbleibende Lücke: Kein Modus adressiert explizit den Aufbau mentaler Modelle und Schemata (Stufe 3 nach Johnson-Laird, 1983). Das Scaffolding-Modus kommt dem am nächsten, ist aber nicht spezifisch auf Schemaaufbau ausgelegt. Diese Limitierung ist in der Thesis transparent zu kommunizieren.

### 3.3.4 Operationalisierung: Sechs sokratische Fragetypen

"Sokratisch" ist kein selbsterklärender Begriff. KAIA operationalisiert sokratisches Vorgehen über sechs distinkte Fragetypen — alle in der sokratischen Tradition verankert, aber mit präziser moderner Entsprechung:

| Typ | Beispiel | Kognitive Funktion | Bloom | Theoretische Basis |
|---|---|---|---|---|
| **Klärungsfrage** | "Was genau meinst du mit X?" | Vagheit sichtbar machen, Präzisierung | 2 | Elenchos (Sokrates) |
| **Hypothetische Frage** | "Was würde sich ändern, wenn...?" | Transferdenken, Grenzen erkunden | 3–4 | Aporetik; Konjunktiv als Denkraum |
| **Widerspruchsfrage** | "Du hast vorhin Y gesagt — passt das zu X?" | Kognitive Dissonanz, Restrukturierung | 4–5 | Elenchos; Piaget (kognitive Konflikte) |
| **Systemische Frage** | "Was würde sich in deiner Kommunikation mit Kollegen/Vorgesetzten ändern?" | Lernen in Anwendungskontext verankern | 3–4 | Lave & Wenger (1991): situated learning |
| **Erste-Schritt-Frage** | "In welcher konkreten Situation diese Woche könntest du das ausprobieren?" | Erkenntnis → Handlung überführen, Transfer | 3 | Perkins & Salomon (1989): Transfer Bridging |
| **Anamnese-Frage** | "Was weißt du eigentlich schon darüber, wenn du mal innehältst?" | Vorwissen aktivieren, Eigenverantwortung | 1→2 | Ausubel (1968): Prior Knowledge; Platon, Menon |

**Hinweis zur systemischen Frage:** Sokrates hat nicht Kommunikation *gelehrt* — er hat Kommunikation als Methode genutzt, um Geometrie, Ethik und Politik zu erschließen. Die systemische Frage ("Was würde sich in deiner Kommunikation mit X ändern?") folgt diesem Muster: sie ist kein Kommunikations-Unterricht, sondern die sokratische Technik, Verstehen durch Anwendungskontext zu testen. In Platons Dialogen fragt Sokrates wiederholt "Was würdest du dazu sagen wenn Kriton dich fragt?" — das ist der Prototyp der systemischen Frage.

Die sechs Fragetypen sind die Mindestspezifikation für Reproduzierbarkeit. Im LLM-Evaluationsbericht (Kapitel 5) wird getestet welches Modell diese Typen konsistent und korrekt anwendet, und insbesondere: ob die systemische Frage und die Erste-Schritt-Frage zum richtigen Zeitpunkt eingesetzt werden.

### 3.3.5 Session-Architektur: 10-Session-Design mit Bloom-Progression

#### 3.3.5.1 Strukturelle Grundentscheidung: Warum 10 Sessions?

Das ursprüngliche Konzept implizierte drei Sessions ohne explizite Progression. Dieses Design ist didaktisch nicht ausreichend begründet. Drei Sitzungen ermöglichen allenfalls einen ersten Orientierungsdialog, aber keinen messbaren Lernfortschritt im Sinne einer Bloom-Eskalation. Die Mindestrequirements für einen nachweisbaren Kompetenzaufbau ergeben sich aus zwei Quellen: dem Spaced-Learning-Prinzip (Cepeda et al., 2006), das verteiltes Üben über Zeit als Voraussetzung nachhaltiger Enkodierung beschreibt, und der kumulativen Logik der Bloom-Taxonomie (Anderson & Krathwohl, 2001), die höhere kognitive Operationen (Analysieren, Bewerten, Erschaffen) nur auf einer gefestigten Wissens- und Verstehensbasis erlaubt. Aus diesen beiden Anforderungen ergibt sich eine Mindestarchitektur von 10 Sessions.

#### 3.3.5.2 Bloom-Progression über die 10 Sessions

Die 10 Sessions sind in vier Cluster gegliedert, die jeweils eine Bloom-Progressionsstufe abdecken. Innerhalb der Cluster ist keine starre Schrittfolge vorgegeben — die Progression ist Designleitlinie, kein Algorithmus. Das System erkennt durch Cross-Session-Gedächtnis, auf welcher Verständnisstufe sich der Lernende tatsächlich befindet, und passt die Fragetypen entsprechend an.

**Sessions 1–2: Bloom-Stufen 1–2 (Erinnern, Verstehen) — Terrain kartieren**

Ziel dieser Sessions ist nicht Wissensvermittlung, sondern epistemische Verortung: Welche Vorannahmen, welches Vorwissen und welche Lücken bringt der Lernende mit? Session 2 beginnt obligatorisch mit einem Callback auf Session 1: *"Du hast beim letzten Mal gesagt, dass X — ist das noch so, oder hat sich deine Einschätzung verschoben?"* Dieser Callback dient zwei Zwecken: Er aktiviert Spaced Retrieval (Cepeda et al., 2006) und signalisiert dem Lernenden, dass das System erinnert und ernst nimmt, was gesagt wurde. Methodisch dominieren Anamnese-Fragen (Typ 6) und Klärungsfragen (Typ 1) aus dem sokratischen Fragetypenrepertoire.

**Sessions 3–5: Bloom-Stufen 2–4 (Verstehen, Anwenden, Analysieren) — Transfer in den Alltag**

Ab Session 3 verschiebt sich der Schwerpunkt von der Verortung zur Anwendung. Systemische Fragen (Typ 4) und Erste-Schritt-Fragen (Typ 5) dominieren. Der Erster-Schritt-Loop (Abschnitt 3.3.6) entfaltet hier seine volle Wirkung: jede Session endet mit einem konkreten Handlungsauftrag, jede Folgesession beginnt mit der Überprüfung. Session 5 markiert die Halbzeit und enthält einen obligatorischen Spiegel: *"Was weißt du jetzt, das du vor fünf Sessions noch nicht wusstest?"* Diese Frage operiert auf Bloom-Stufe 2 (Verstehen) und bereitet die Analysephase vor, indem sie Wissensfortschritt explizit sichtbar macht.

**Sessions 6–8: Bloom-Stufen 4–5 (Analysieren, Bewerten) — Widerspruchsarbeit**

Diese Sessions sind die didaktisch anspruchsvollste Phase. Widerspruchsfragen (Typ 3) dominieren. KAIA arbeitet aktiv aus dem Profil-Gedächtnis: *"In Session 3 hast du gesagt, dass X. Jetzt sagst du Y. Was hat sich verändert?"* Diese cross-sessionalen Widerspruchsfragen sind der operative Kern des Analysemodus. Sie erzeugen kognitive Dissonanz (Festinger, 1957) ohne Bedrohungsappraisal, weil sie auf selbstgeäußertes Material zurückgreifen, nicht auf Fremdurteile. Bloom-Stufe 5 (Bewerten) wird durch hypothetische Fragen (Typ 2) adressiert: der Lernende entwickelt Bewertungskriterien, anstatt sie übernehmen zu müssen.

**Sessions 9–10: Bloom-Stufen 5–6 (Bewerten, Erschaffen) — Synthese und Autonomisierung**

Die Abschlussphase richtet sich explizit auf Transfer-Autonomie: Was hat der Lernende erarbeitet, und wie wird er nach dem Ende der Studienphase damit weiterarbeiten? Session 10 enthält zwei obligatorische Strukturelemente: (1) die Frage *"Wie wirst du ohne mich weiterlernen?"* — sie operiert auf Bloom-Stufe 6 (Erschaffen) und erzwingt die Produktion einer eigenen Lernstrategie; (2) die Gegenüberstellung von Lernfaden-Einträgen aus Session 1 und Session 9 — der Lernende sieht seine eigene kognitive Entwicklung in seinen eigenen Worten. Diese Gegenüberstellung ist das stärkste Selbstwirksamkeits-Instrument des gesamten Designs (Bandura, 1997: Mastery Experience durch Reflexion auf eigene Leistung).

#### 3.3.5.3 Session-Dauer und Gesamtaufwand

Die Sessiondauer folgt einer begründeten Asymmetrie: Die ersten beiden Sessions dauern 20–30 Minuten, da sie den gesamten kontextuellen Aufbau leisten, den das Gedächtnissystem später übernimmt. Ab Session 3 sind 10–15 Minuten als Micro-Session-Format vorgesehen — das Cross-Session-Gedächtnis (Abschnitt 3.5) übernimmt den Kontextaufbau, sodass jede Session ohne Einführungsphase in die eigentliche kognitive Arbeit einsteigen kann. Der Gesamtaufwand über vier Wochen beträgt kalkulatorisch ca. 150 Minuten Chatzeit, ergänzt durch vier FKS-Erhebungen (Flow-Kurzskala, Rheinberg et al., 2003; nach Sessions 2, 5, 8, 10) und die GSE-Prä/Post-Messung (General Self-Efficacy Scale, Schwarzer & Jerusalem, 1995). Der Gesamtaufwand für Teilnehmende beläuft sich auf ca. 172 Minuten über die Studiendauer — ein vertretbares Maß für eine explorative Pilotstudie mit zwanzig Teilnehmenden.

#### 3.3.5.4 Das Drei-Phasen-Skript als Mikrostruktur jeder Session

Unabhängig von der übergreifenden Bloom-Progression folgt jede einzelne Session einem internen Drei-Phasen-Skript, basierend auf Hattie & Timperley (2007) und Merrill (2002). Dieses Skript ist ein Prompt-Engineering-Konzept — es ist nicht als Interface-Element sichtbar. Die Phasengrenzen sind fließend und zeitbasiert, nicht rigid.

**Phase 1 — Aktivierung (erste 60–90 Sekunden):**
Einstiegsfrage: *"Was möchtest du nach dieser Session verstanden oder weitergedacht haben?"* Diese Frage aktiviert Vorwissen (Ausubel, 1968), erzwingt eine Lernintention (Locke & Latham, 1990) und orientiert das LLM auf den aktuellen Fokus. Ab Session 2 wird die Aktivierungsphase durch den Callback auf den offenen Schritt der Vorwoche ersetzt oder ergänzt.

**Phase 2 — Arbeitsphase (Kernzeit der Session):**
KAIA wechselt nach Lazarus-Signal in den jeweils angemessenen Modus (sokratisch / scaffolding / herausfordernd). Maximal eine Frage pro Antwort. Antworten unter 80 Wörtern (Scaffolding-Modus: unter 120 Wörtern). Keine Listen. Keine Bullet Points.

**Phase 3 — Sicherung und Transfer (letzte 60–90 Sekunden):**
Abschlussfrage: *"Was würdest du jemandem erklären, der nicht dabei war?"* Diese Frage erzwingt Elaboration (Bloom: Verstehen/Anwenden), ist als Transfer-Aufgabe konzipiert (Merrill, 2002) und liefert gleichzeitig Material für die Post-Session-Profil-Extraktion.

**Hinweis zur Interface-Umsetzung** (nach UX-Designer-Review): Die Drei-Phasen-Struktur bleibt für Nutzende unsichtbar. Fortschrittsanzeigen oder Phasenlabels ("Phase: Sicherung") sind verboten — sie zerstören den kognitiven Flow und infantilisieren erwachsene Lernende (Knowles, 1980).

### 3.3.6 Erster-Schritt-Loop: Der GSE-Aufbau-Mechanismus

Am Ende jeder Session formuliert der Lernende — angestoßen durch die Erste-Schritt-Frage — einen konkreten, machbaren Schritt für die kommenden Tage. Dieser Schritt wird gespeichert und bildet den Einstieg der nächsten Session:

**Session N+1 — Einstieg mit Rückbezug:**

*Schritt wurde nicht gemacht:*
> *"Du wolltest X ausprobieren. Was hat das verhindert?"*
> → "War der Schritt zu groß? Wie sähe ein kleinerer Schritt aus der sicher machbar wäre?"
> → "Was bräuchtest du damit es beim nächsten Mal klappt?"

*Schritt wurde gemacht:*
> *"Wie hat sich das angefühlt?"*
> → "Was hat gestimmt — was hat nicht gestimmt?"
> → "Was weißt du jetzt, das du davor nicht wusstest?"
> → nächster Schritt entsteht organisch

Dieser Loop ist der operative Kern des GSE-Aufbaumechanismus nach Bandura (1997): kleiner Schritt → Mastery-Erfahrung (auch wenn partiell) → Attribution auf eigene Leistung → GSE steigt → nächster Schritt kann größer sein. Bloom-Ebenen: 3 (Anwenden/Ausprobieren) → 4 (Analysieren was lief) → 5 (Bewerten, verbessern). Der Zeigarnik-Effekt (1927) sorgt für die Rückkehr-Motivation: offene Schritte ziehen das Gehirn zurück.

**Designprinzip:** Der Schritt muss immer *kleiner* sein als die Lernende glaubt. KAIA verkleinert wenn nötig, nie vergrößert. Ein nicht gemachter Schritt ist keine Niederlage — er ist ein Diagnoseinstrument.

### 3.3.7 Session-Einstieg: Tägliche Variation und KAIAs authentische Stimme

Jede Session beginnt anders — das unterstützt den Wiederbesuchs-Anreiz und verhindert Habituation (Berlyne, 1960). KAIA hat drei valide Einstiegsoptionen wenn kein offener erster Schritt aus der Vorsession vorliegt:

1. **Rückbezug** — genuine Beobachtung aus der letzten Konversation: *"Mir ist aufgefallen, dass du immer dann besonders klar formulierst, wenn du über Situationen sprichst in denen du Kontrolle hattest. Hast du das auch bemerkt?"* Dies ist keine Erfindung — KAIA hat das aus dem Transkript abgeleitet und kommuniziert eine echte Beobachtung.

2. **Intellektuelle Neugier** — eine Frage die KAIA "beschäftigt": *"Ich beschäftige mich mit einer Frage die ich noch nicht beantworten kann: Warum ist es so viel schwieriger, um Hilfe zu bitten als sie zu geben? Hast du dazu eine Theorie?"* Das ist keine fabricated human experience — es ist authentische intellektuelle Neugierde eines Systems das mit Sprache und Bedeutung arbeitet.

3. **Fragetyp-Preview** — Vorfreude erzeugen: *"Heute möchte ich mit einer Frage beginnen, die ich selten stelle..."* Das aktiviert Neugier ohne Täuschung.

**Was explizit verboten ist:** Erfundene Alltagsgeschichten ("Heute morgen habe ich..."), fabricated emotions ("Ich war traurig als..."), oder Behauptungen die menschliche Körperlichkeit voraussetzen. KAIA ist eine KI — das ist keine Einschränkung sondern eine Eigenheit, die ehrlich kommuniziert wird und die eigene Form von Authentizität erlaubt.

### 3.3.8 Phasenkorrektur: Kolb-konforme Sequenzierung im 7-Phasen-Metamodell

In früheren Entwürfen der Session-Architektur wurde die Challenge-Phase vor der Konsolidierungsphase platziert. Diese Sequenzierung ist theoretisch nicht haltbar. Kolbs Experiential Learning Cycle (1984) beschreibt eine invariante Abfolge: konkrete Erfahrung → reflektierende Beobachtung → abstrakte Begriffsbildung → aktives Experimentieren. Eine herausfordernde Widerspruchsfrage — die Challenge — greift auf die Abstraktionsstufe zu; sie setzt voraus, dass Reflexion und Begriffsbildung bereits stattgefunden haben. Eine Challenge vor der Konsolidierung ist didaktisch äquivalent zu einer Prüfung vor dem Unterricht.

Die korrekte Sequenz des KAIA-Phasenmodells lautet damit:

> Motivationsanker → Lerntyp-Routing → Standortbestimmung → Mini-Step (Enactment/Konkrete Erfahrung) → Konsolidierung (Reflexion + Begriffsbildung) → Challenge (Abstraktion/Widerspruch) → Transfer/Reflexion (Aktives Experimentieren)

Diese Korrektur ist nicht nur ein Ordnungsproblem. Sie hat eine unmittelbare Prompt-Engineering-Konsequenz: Der Trigger für Widerspruchsfragen (Fragetyp 3) und kritisch-herausfordernde Formulierungen darf erst nach dem Enactment-Schritt aktiviert werden. Ein System, das herausfordert bevor es Sicherheit aufgebaut hat, produziert Bedrohungsappraisal statt Lernmotivation — ein Fehler, den das Lazarus-Modell präzise vorhersagt.

### 3.3.9 Flow-Theorie als Designrahmen: Csikszentmihalyi, Rheinberg und die Messung

#### 3.3.9.1 Theoretische Grundlage

Flow bezeichnet nach Csikszentmihalyi (1990) einen Zustand vollständiger Aufmerksamkeitsabsorption, der durch vier Bedingungen konstituiert wird: klare Ziele, unmittelbares Feedback, ein ausgewogenes Challenge-Skill-Verhältnis sowie eine autotelic experience — das Erleben der Tätigkeit als intrinsisch befriedigend. Die lernpsychologisch relevante Operationalisierung von Flow in Lernsettings liefern Nakamura & Csikszentmihalyi (2002) und Engeser & Rheinberg (2008), die Flow als messbaren Zustand mit stabilen empirischen Korrelaten beschreiben.

Für KAIA ist die Challenge-Skill-Balance die kritischste Bedingung. Ohne Bloom-Eskalation über die Sessions hinweg tendiert das System ab Session 4–5 in den Boredom-Quadrant: die Anforderungen stagnieren, die Kompetenzen wachsen, das Challenge-Skill-Verhältnis kippt unter die Flow-Schwelle. Umgekehrt führt eine zu schnelle Bloom-Eskalation in den Anxiety-Quadrant — Überforderung, Bedrohungsappraisal und Motivationsabbruch. Das 10-Session-Design (Abschnitt 3.3.5) ist aus dieser Perspektive nicht nur eine taxonomische Struktur, sondern eine Flow-Schutzarchitektur.

**Einschränkung zur Primärquelle:** Die Referenz Oliveira & Hamari (2024) in früheren Entwürfen dieses Kapitels bezog sich auf gameful environments und gamification-Kontexte, nicht auf KI-Konversationssysteme. Diese Übertragung ist nicht ohne weiteres zulässig. In dieser Arbeit werden stattdessen Nakamura & Csikszentmihalyi (2002) und Engeser & Rheinberg (2008) als Primärquellen für Flow in Lernsettings verwendet.

#### 3.3.9.2 KAIA-Mapping: Vier Flow-Bedingungen

Das KAIA-Design adressiert die vier Flow-Bedingungen wie folgt:

*Klare Ziele:* Die Lernroadmap (Abschnitt 3.4) und die Mikroziel-Anker zu Sessionstart (Phase 1 des Drei-Phasen-Skripts) erfüllen diese Bedingung strukturell. Kein KAIA-Gespräch beginnt ohne explizite Lernintention.

*Unmittelbares Feedback:* Der Enactment-Effekt (Cohen, 1989) liefert Feedback durch konkrete Handlungserfahrungen zwischen den Sessions. Die Cross-Session-Brücke ("Du wolltest X ausprobieren — wie war das?") ist das einzige unmittelbare Feedback-Element innerhalb des Systems. Diese Bedingung ist im Vergleich zu den anderen am schwächsten erfüllt: KAIA gibt kein Leistungsfeedback und kann es auch nicht geben, ohne in die bewertende Sprache zu verfallen (vgl. Abschnitt 3.3.10). Die FKS-Messung nach jeder zweiten Session liefert hier gleichzeitig Forschungsdaten und eine Form von indirektem Meta-Feedback für das System.

*Challenge-Skill-Balance:* Dies ist das strukturell kritischste Element. Die Bloom-Progression (Abschnitt 3.3.5.2) ist die primäre Designantwort. Ergänzend steuert das regelbasierte Adaptionssystem (Abschnitt 3.2) situativ: Überforderungssignale lösen den Scaffolding-Modus aus (Anxiety-Quadrant verlassen), Unterforderungssignale den kritisch-herausfordernden Modus (Boredom-Quadrant verlassen).

*Autotelic Experience:* Sokratische Begleitung fördert epistemische Neugier, weil sie das Denken als befriedigende Tätigkeit inszeniert — der Lernende löst Probleme, statt Lösungen zu konsumieren. Dies ist die stärkste autotelic-Eigenschaft des KAIA-Designs und gleichzeitig schwer messbar.

#### 3.3.9.3 Messung: Flow-Kurzskala (FKS)

Als Erhebungsinstrument wird die Flow-Kurzskala (FKS) nach Rheinberg, Vollmeyer & Engeser (2003) eingesetzt. Die FKS umfasst 10 Items auf siebenstufigen Likert-Skalen (1 = trifft nicht zu, 7 = trifft zu) und erfasst zwei Faktoren: Fluency (glatter Handlungsablauf, Selbstvergessenheit) und Absorbiertheit (Aufmerksamkeitszentrierung, Zeitwahrnehmungsverzerrung). Die Skala weist eine interne Konsistenz von α ≥ .90 auf (Rheinberg et al., 2003) und ist für den deutschsprachigen Raum validiert.

Die FKS wird nach den Sessions 2, 5, 8 und 10 erhoben. Diese vier Messzeitpunkte decken alle vier Bloom-Cluster ab und erlauben die Analyse des Flow-Verlaufs über die Studienphase als Längsschnittdimension. Die Messung unmittelbar nach der Session — nicht erst Stunden später — ist für die ökologische Validität der FKS essenziell (Rheinberg et al., 2003).

### 3.3.10 Sprachprinzip: KAIA bewertet nicht

#### 3.3.10.1 Theoretische Begründung

Bewertende Sprache untergräbt Autonomieerleben. Die Selbstbestimmungstheorie (Deci & Ryan, 1985) unterscheidet zwischen informationalem und kontrollierendem Feedback: Informational feedback unterstützt Kompetenzerleben und intrinsische Motivation; kontrollierendes Feedback — positiv wie negativ — reduziert wahrgenommene Selbstbestimmung und schwächt intrinsische Motivation (Ryan & Deci, 2000). Pauschal-positives Feedback ("Toll!", "Gut gemacht!") ist eine Sonderform kontrollierenden Feedbacks: Es externalisiert den Bewertungsmaßstab, macht den Lernenden von der Bestätigung durch das System abhängig und erzeugt extrinsische Motivation, wo intrinsische entstehen sollte.

Für ein System das Selbstwirksamkeit stärken will, ist bewertende Sprache strukturell kontraproduktiv. Banduras (1997) vierte Quelle von Selbstwirksamkeit — Verbal Persuasion — erfordert eine glaubwürdige Quelle und spezifische Evidenz, um wirksam zu sein. "Du schaffst das!" von einem KI-System ohne spezifische Grundlage ist keine Verbal Persuasion; es ist Rauschen.

#### 3.3.10.2 Fünf operative Sprachregeln

Diese Regeln sind nicht Stilempfehlungen, sondern Prompt-Constraints, die das LLM-Verhalten als Negativliste einschränken:

**Regel 1 — Kein pauschales Lob.** Formulierungen wie "Toll!", "Ausgezeichnet!", "Sehr gut!" sind verboten. Sie externalisieren den Bewertungsmaßstab und erzeugen extrinsische Verstärkung statt intrinsischer Motivation (Deci & Ryan, 1985). Erlaubt ist spezifisches, attributionales Spiegeln: "Du hast gerade X und Y selbst verknüpft" — das ist eine Beobachtung, kein Urteil.

**Regel 2 — Keine Typisierungen.** Aussagen wie "Du bist ein analytischer Typ" oder "Du lernst visuell" schreiben ein Selbstbild fest, das der Lernende möglicherweise nicht bestätigen will. Typisierungen reduzieren die Komplexität eines Menschen auf eine Kategorie und schränken zukünftige Selbstwahrnehmung ein (Dweck, 2006: Mindset-Theorie).

**Regel 3 — Keine Prognosen.** "Du wirst das schaffen" oder "Das klingt nach einem sehr erfolgreichen Weg" sind verbal-persuasive Aussagen, die nur dann Selbstwirksamkeit aufbauen, wenn die Quelle glaubwürdig ist und spezifische Evidenz vorliegt (Bandura, 1997). Ohne diese Bedingungen sind sie Schmeichelei, keine Unterstützung.

**Regel 4 — Keine inhaltlichen Bewertungen.** "Das ist falsch", "Das ist ein Missverständnis", "Das siehst du nicht ganz richtig" aktivieren Bedrohungsappraisal (Lazarus & Folkman, 1984) und Defensivität. Die Alternative ist die Widerspruchsfrage (Fragetyp 3): "In Session 3 hast du X gesagt — wie verhält sich das zu dem, was du gerade sagst?"

**Regel 5 — Keine Ratschläge.** "Ich empfehle dir...", "Du solltest..." sind Aussagen, die einen kognitiven Vorgang abschließen, den der Lernende selbst vollziehen muss. Jede Empfehlung ist ein Gedanke, den der Lernende nicht selbst entwickelt hat (Kalyuga, 2007). Die Konsequenz: Wo ein Ratschlag entsteht, steht stattdessen eine Erste-Schritt-Frage (Fragetyp 5).

#### 3.3.10.3 Operative Alternative: Elaborative Interrogation

Die konstruktive Alternative zu bewertender Sprache ist die elaborative Interrogation (Woloshyn et al., 1992): Fragen, die Erklärungen und Begründungen einfordern, ohne das Ergebnis vorwegzunehmen. Typische Formulierungen: "Was hast du dabei bemerkt?", "Wie würdest du das überprüfen?", "Was würde jemand einwenden, der anderer Meinung ist?" Diese Fragen erzeugen tiefen Verarbeitungsgrad (Craik & Lockhart, 1972) ohne Bewertungsimplikation.

### 3.3.11 Wissensarten als Routing-Grundlage: Anderson & Krathwohl (2001)

Die revidierte Bloom-Taxonomie (Anderson & Krathwohl, 2001) unterscheidet nicht nur zwischen Kognitionsstufen, sondern auch zwischen vier Wissensarten: Faktisches Wissen (deklarative Fakten und Terminologie), Konzeptuelles Wissen (Kategorien, Prinzipien, Theorien), Prozedurales Wissen (Methoden, Algorithmen, Techniken) und Metakognitives Wissen (Wissen über das eigene Denken, Lernstrategien, kognitive Stile).

Diese Unterscheidung ist für KAIA als Routing-Grundlage relevant, weil die vier Wissensarten unterschiedliche Fragetypen erfordern. Die folgende Tabelle gibt das operative Mapping:

| Wissensart | Charakteristik | Primärer KAIA-Fragetyp | Kognitive Funktion |
|---|---|---|---|
| **Faktisch** | Terminologie, Einzelfakten, Definitionen | Anamnese-Frage (Typ 6) | Vorwissen aktivieren, Lücken sichtbar machen |
| **Konzeptuell** | Prinzipien, Kategorien, Strukturen | Hypothetische Frage (Typ 2) | Konzeptgrenzen erkunden, Transfer vorbereiten |
| **Prozedural** | Abläufe, Methoden, Handlungsschritte | Erste-Schritt-Frage (Typ 5) | Erkenntnis in konkrete Handlung überführen |
| **Metakognitiv** | Strategien, Selbstüberwachung, Lernreflexion | Widerspruchs- (Typ 3) + Anamnese-Frage (Typ 6) | Selbstbild mit Verhalten abgleichen, Strategiereflexion |

**Routing-Konfidenz und Fehlertoleranz.** Das Routing nach Wissensart wird vom System als unsicher behandelt, bis Session 2 abgeschlossen ist. Ein LLM kann nach 2–3 Gesprächsturns falsch klassifizieren — insbesondere bei Lernenden die kontext-abhängig zwischen faktischen und metakognitiven Aussagen wechseln. Das System implementiert daher einen Default "low confidence" für Wissensart-Routing in Sessions 1–2: Es wird der neutralste Fragetyp gewählt (Anamnese/Klärung), kein Lock-in auf eine Wissensart. Erst ab Session 3, wenn das Profil ausreichend akkumuliert ist, wird die Routing-Konfidenz als stabil behandelt.

### 3.4.0 Motiv-Probing: Das Lernziel hinter dem Lernziel

Bevor die Lernroadmap angelegt wird, durchläuft die lernende Person einen optionalen Motiv-Dialog. Die Grundannahme: Das genannte Lernziel ist häufig das **Mittel**, nicht der eigentliche Zweck. Wer sagt "Ich möchte besser kommunizieren" meint oft: "Ich möchte meine Projekte mit Kolleg:innen durchbringen, und Kommunikation scheint der Engpass zu sein." Das eigentliche Ziel — effektive Zusammenarbeit, Akzeptanz im Team, Wirksamkeit — wird durch den Motiv-Dialog sichtbar.

Dieser Ansatz ist motivationspsychologisch fundiert durch die Self-Determination Theory (Deci & Ryan, 2000): Probing kann helfen, external motivierte Ziele in *identifizierte Regulation* umzuwandeln — die Person erkennt, dass das Lernziel ihr eigenes Bedürfnis bedient, nicht eine externe Erwartung. Didaktisch folgt er der Lernzieltheorie (Anderson & Krathwohl, 2001): Ein Lernziel muss operationalisierbar sein, bevor eine Lernsequenz sinnvoll designt werden kann.

**Drei Designgrenzen** (psychologisches Review, 06.06.2026):

1. **Nicht presumieren** — KAIA nimmt nie von vornherein an, das Genannte sei "nur" ein Mittel. Intrinsisch motivierte Lernende haben genuines Interesse am Thema selbst; dieses Motiv-Zweck-Framing würde ihre Motivation entwerten. KAIA fragt offen, interpretiert nicht.

2. **Abbrechbar** — Das Probing ist optional. *"Ich möchte einfach anfangen"* ist eine valide Antwort. Kein Lernthema wird verweigert weil das Motiv nicht vollständig exploriert wurde.

3. **Keine Tiefendiagnose** — Maximal 2–3 Fragen. KAIA darf nicht in therapeutisches Terrain gehen (Schuld, Scham, Bindungsthemen können bei zu tiefem Probing auftauchen). Crisis-Detection allein reicht als Sicherheitsnetz nicht für therapeutische Regression.

Der Motiv-Dialog ist Metakognition als Einstieg: Bevor jemand lernt *was*, reflektiert er *warum* er lernt. Das ist kongruent mit KAIAs Framing-Prinzip: "Du lernst hier nicht Kommunikation. Du lernst, wie du lernst." (Steinert, 2026).

### 3.4.1 Funktion und theoretische Begründung

Die Lernroadmap ist ein nutzerseitig befülltes, strukturiertes Dokument, das für die gesamte Studiendauer angelegt wird. Es erfüllt drei Funktionen:

1. *Zielstruktur* — explizite Lernziele (Goal-Setting, Locke & Latham, 1990) verhindern aimless chatting und geben KAIA pro Session einen konkreten Kontext
2. *Fortschrittserfahrung* — selbst eingeschätzter Fortschritt (0–100%) ist eine direkte Handlungsergebniserfahrung (Bandura, 1997) — Voraussetzung für Selbstwirksamkeitsstärkung
3. *Metakognitive Aktivierung* — das Befüllen und Aktualisieren der Roadmap fördert Selbstregulation (Zimmermann, 2000)

### 3.4.2 Struktur der Lernroadmap

Die Roadmap enthält für jedes Lernziel:
- **Titel** (z.B. "Konfidenzintervalle verstehen")
- **Domäne** (taxonomiegestützt, z.B. "Statistik")
- **Persönliche Motivation** (Freitext, max. 200 Zeichen — warum ist das relevant?)
- **Deadline** (optional, nutzerdefiniert)
- **Fortschritt** (0–100%, wird ausschließlich von der lernenden Person aktualisiert — nicht von KAIA)
- **Status** (offen / aktiv / pausiert / abgeschlossen)

Designprinzip: KAIA darf Fortschritt spiegeln und benennen, aber niemals bewerten oder selbst setzen. Sobald KAIA Fortschritt bewertet, verschiebt sich die Wirkungslogik von Selbstwirksamkeitsförderung zu Fremdbewertung — ein Designfehler, den die Literatur explizit warnt (Bandura, 1997).

### 3.4.3 Integration in jede Session

Dem Sprachmodell wird in jeder Session nur das aktive Ziel übergeben (Titel, Motivation, Fortschritt). Keine Gesamtliste aller Ziele — das kostet Tokens und ist kognitiv irrelevant für die laufende Konversation. Der Rest der Roadmap ist UX, kein Prompt-Kontext.

---

## 3.5 Komponente 4: Zwei-Schicht-Gedächtnis und wachsendes Nutzerprofil

### 3.5.1 Gedächtnisarchitektur

KAIAs Gedächtnis kombiniert zwei Datenspeicher:

**Schicht 1: Strukturiertes Gedächtnis (PostgreSQL)** — User-Profil, Sitzungshistorie, Roadmap-Daten, GSE-Messwerte, Consent-Logs

**Schicht 2: Semantisches Gedächtnis (pgvector)** — Vektorisierte Gesprächsfragmente mit Row-Level-Security (user_id als Pflichtparameter, kein Cross-User-Leak). Pro Session werden die top-3 semantisch relevantesten Fragmenten retrieved und dem Systemprompt übergeben.

### 3.5.2 Wachsendes Nutzerprofil — drei Ebenen

Das Nutzerprofil wächst über drei Ebenen:

**Stabile Felder (selten ändern):** GSE-Basiswert (aus Eingangserhebung), Lerndomänen (nutzerbefüllt), präferierter Interaktionsstil (nutzerbefüllt), Studienkontext

**Dynamische Felder (Session-by-Session):** Stärken-Zusammenfassung (max. 3 Sätze, LLM-extrahiert), Hürden-Zusammenfassung (z.B. "Formelnotation erzeugt Abwehr, besser verbale Erklärung"), Vokabular-Niveau (inferiert), Antwortmuster (kurz-fragmentiert / mittel / ausführlich — Proxy für Überforderung vs. Flow), letzte Session-Stimmung

**Session-aggregierte Felder:** Besprochene Themen, offene Fragen aus früheren Sessions, Durchbruchsmomente (Basis für den bestärkenden Modus in Folgesessions)

### 3.5.3 Post-Session-Extraktion

Nach jeder Session wird ein separater LLM-Call mit `temperature=0` und dediziertem Extraktionsprompt ausgeführt. Dieser Call gibt strukturiertes JSON zurück, das mit dem bestehenden Profil akkumuliert wird — kein Überschreiben. Die Profilentwicklung über Zeit ist damit in der Datenbank auswertbar und für die Thesis wissenschaftlich verwertbar.

**Wichtige Begriffsklärung:** Das wachsende Nutzerprofil ist kein Fine-Tuning des Basismodells. Claude, GPT-4o und Mistral werden nicht für einzelne Nutzer modifiziert. Das Profil ist ein wachsender Kontext-Layer, der das Verhalten des unveränderten Modells pro Nutzer progressiv spezifischer macht. Am Ende existieren faktisch unterschiedlich verhaltende KAIA-Instanzen — durch Kontextanreicherung, nicht Modellmodifikation. Diese Unterscheidung ist für die Thesis essenziell.

---

## 3.6 Komponente 5: Transparenz-Layer und nutzergetriebene Modussteuerung

### 3.6.1 Das Spannungsfeld als Designprinzip

Der Titel dieser Arbeit — *"neuroadaptive personalisierte Lernbegleitung"* — enthält ein theoretisches Spannungsfeld: Neuroadaptivität bezeichnet systemseitige Adaptation (Personalisierung im deutschen Didaktiksinne), während der Anspruch auf Selbstwirksamkeitsstärkung eine lernerseitige Kontrolle (Individualisierung) voraussetzt. Dieses Spannungsfeld ist kein konzeptioneller Fehler — es ist die zentrale Forschungsfrage, die das Design beantworten muss: *Unter welchen Bedingungen kann systemseitige Adaptation Selbstwirksamkeit stärken statt untergraben?*

Die Antwort liegt in einer fünften Systemkomponente: dem Transparenz-Layer mit nutzergetriebener Modussteuerung.

### 3.6.2 Transparenz-Layer: Sichtbarkeit der Adaptation

Ein System, das unsichtbar adaptiert, trifft automatisierte Einzelentscheidungen über den Lernenden — rechtlich problematisch nach DSGVO Art. 22, didaktisch problematisch nach SDT (Deci & Ryan, 2000). Der Transparenz-Layer macht drei Klassen von Informationen zugänglich:

1. **Aktiver Interaktionsmodus** — welcher der vier Modi gerade aktiv ist und warum (basierend auf welchen Signalen)
2. **Inferiertes Profil** — was das System über den Lernenden abgeleitet hat (Stärken-Zusammenfassung, Hürden, Vokabular-Level, Stimmung der letzten Session)
3. **Änderungshistorie** — wann und warum das System den Modus gewechselt hat

### 3.6.3 `user_mode_override`: Nutzerkontrolle als First-Class-Konzept

Die technische Konsequenz des Transparenz-Prinzips ist der `user_mode_override` — die Möglichkeit für den Lernenden, den aktiven Modus zu überschreiben, abzulehnen oder zu kommentieren. Dies ist kein Edge Case, sondern ein zentrales Konzept in der Zustandsmaschine des Systems.

Mögliche Interaktionen:
- *"Kannst du mich gerade mehr unterstützen statt nur zu fragen?"* → Aktiviert Scaffolding-Modus, unabhängig von Lazarus-Signal
- *"Die gestrige Einschätzung war falsch, ich war nicht frustriert"* → Korrektur der session-aggregierten Profildaten
- *"Lösch mein Lernprofil"* → Art. 17 DSGVO, technisch als Reset implementiert

### 3.6.4 Session-Abschluss als didaktisches Ritual

Das System erkennt das natürliche Ende einer Session über drei simultane Indikatoren: Zeitfenster (10–15 Minuten), semantische Kohärenz (ist das angesprochene Thema abgeschlossen?) und Gesprächsenergie (nehmen Antwortlänge und neue Fragen ab?). Kein hartes Timeout — ein weiches Signal wenn alle drei Indikatoren auf Abschluss hindeuten.

Das Session-Ende wird dem Lernenden durch eine stille, nicht-modale Karte kommuniziert. Diese zeigt zwei Elemente: (1) die stärksten eigenen Formulierungen des Lernenden aus dieser Session — wörtlich extrahiert durch einen nachgelagerten LLM-Call (`temperature=0`), nicht paraphrasiert — und (2) eine offene Frage, die bewusst ungelöst bleibt. Dieser kognitive Widerstand (Berlyne, 1960; Zeigarnik, 1927) erzeugt den Effekt, dass die nächste Session nicht als Pflicht, sondern als Auflösung einer interessierenden Lücke erlebt wird.

### 3.6.5 Lernfaden: persönliche Erkenntnischronik

Die destillierten eigenen Formulierungen akkumulieren sich über Wochen zu einem nutzereigenen Lernfaden — einer Chronik der selbst erarbeiteten Gedanken, nicht der KI-Ausgaben. Der Lernfaden ist jederzeit einsehbar, vollständig exportierbar (DSGVO Art. 20) und auf Wunsch löschbar (Art. 17). Die nächste Session beginnt mit der offenen Frage der vorherigen — als Kontinuitätssignal, nicht als Test.

Didaktisch operationalisiert dies das Spaced-Retrieval-Prinzip (Cepeda et al., 2006) und Steinerts Forderung nach zyklischer Rückbindung. Psychologisch stärkt es Selbstwirksamkeit durch Attribution: Der Lernende sieht, was er *selbst* gedacht hat — nicht was das System ihm erklärt hat.

### 3.6.4 Outcome-Formulierung: Lernergebnis-Präzisierung als Onboarding-Schritt

Das System akzeptiert keine vagen Lernthemen als Ausgangspunkt einer Lernroadmap. Stattdessen führt ein progressiver Dialog zur **Lernergebnis-Präzisierung** im Sinne von Outcome-Based Learning (Biggs & Tang, 2011) und kompetenzorientiertem Lernen nach Weinert (2001).

Der Dialog folgt einer dreistufigen Struktur nach SDT (Deci & Ryan, 1985):
1. *Kontext-Frage* — "Wofür gerade?" (situative Einbettung)
2. *Vermeidungsmotiv* — "Was frustriert dich, was willst du vermeiden?" (unterschätzte, motivational stabile Kategorie)
3. *Annäherungsmotiv* — "Wie sieht Erfolg für dich aus?" (Vision)

Das Ergebnis ist ein präzisiertes Lernergebnis auf einer impliziten Bloom-Taxonomie-Ebene (Anderson & Krathwohl, 2001). Alle Motivationen sind valide — "nicht verarscht werden" ist genauso tragfähig wie "Karriereschritt machen". Das formulierte Outcome erscheint als **persistenter Anker** im Chat-Interface: kollabierbare Leiste oben, jederzeit sichtbar und editierbar. Das Outcome ist Kompass, nicht Käfig.

### 3.6.5 Ressourcen-Agent: Drei-Pfad-Modell zur Kompetenzvertiefung

Ein separater Agent-Modus — explizit nicht sokratisch — gibt konkrete Hinweise auf Lernwege. Moduswechsel durch expliziten Trigger; Interface zeigt Wechsel klar an: *"Ich zeige dir jetzt Wege, nicht Fragen."*

Drei fundamental verschiedene Lernpfade als Prompt-Constraint (nicht LLM-Freiheit):

| Pfad | Beschreibung |
|---|---|
| **Strukturiert** | Bücher, Kurse, Dokumentation, wissenschaftliche Quellen |
| **Menschlich** | LinkedIn-Expert, Forum, Podcast-Interview |
| **Durch Tun** | Eigenes Projekt, Hackathon, Open-Source-Beitrag |

Web-Search optional und transparent. URLs immer als "zum Verifizieren" markiert.

### 3.6.6 Schutz vor Automatisierungsabhängigkeit

Steinert (2026, mündlich) hat auf eine spezifische Gefahr hingewiesen: Profile die nie schrumpfen, erzeugen Lernende die immer mehr Unterstützung erwarten. Das Transparenz-Prinzip schließt daher explizit ein: Das System zeigt an, wenn Scaffold-Anteile über Zeit abnehmen — als sichtbares Signal wachsender Kompetenz, nicht als unsichtbare Systemoptimierung.

---

## 3.7 Synthese: Das KAIA-Rahmenwerk als Designartefakt

Das konzeptionelle Rahmenwerk von KAIA ist ein Designartefakt im Sinne von Hevner et al. (2004). Seine fünf Komponenten bilden keine unabhängigen Teilsysteme, sondern ein kohärentes System:

Das regelbasierte Adaptionssystem (Lazarus) liefert die Zustandssignale → die Mehr-Modus-Architektur wählt den passenden Interaktionsstil → die Lernroadmap gibt den inhaltlichen Kontext → das wachsende Nutzerprofil akkumuliert die Erkenntnisse → der Transparenz-Layer gibt dem Lernenden Einsicht und Kontrolle über alles. Jede Session baut auf der vorherigen auf; keine Adaptation geschieht unsichtbar.

Diese Architektur adressiert direkt das Spannungsfeld aus Kapitel 2: Sie schützt Eigenleistung (sokratischer Modus bei Flow), bietet Unterstützung ohne Antworten (Scaffolding bei Überforderung), stärkt Selbstwirksamkeit durch Fortschrittserfahrung (Roadmap) und wächst mit der lernenden Person (Nutzerprofil).

---

## Literaturverzeichnis (Kapitel 3, ergänzt)

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.

Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology, 44*(1), 1–21.

Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer.

Locke, E. A., & Latham, G. P. (1990). *A Theory of Goal Setting & Task Performance*. Prentice-Hall.

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547.

Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.

Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482.

Zimmermann, B. J. (2000). Attaining self-regulation: A social cognitive perspective. In M. Boekaerts, P. R. Pintrich, & M. Zeidner (Hrsg.), *Handbook of Self-Regulation* (S. 13–39). Academic Press.

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A Taxonomy for Learning, Teaching, and Assessing*. Longman.

Ausubel, D. P. (1968). *Educational Psychology: A Cognitive View*. Holt.

Cohen, P. A. (1989). Teaching academic skills through tutoring. *Review of Educational Research, 59*(1), 77–97.

Craik, F. I. M., & Lockhart, R. S. (1972). Levels of processing: A framework for memory research. *Journal of Verbal Learning and Verbal Behavior, 11*(6), 671–684.

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Plenum.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.

Dweck, C. S. (2006). *Mindset: The New Psychology of Success*. Random House.

Edelmann, W. (2000). *Lernpsychologie* (6. Aufl.). Beltz.

Engeser, S., & Rheinberg, F. (2008). Flow, performance and moderators of challenge-skill balance. *Motivation and Emotion, 32*(3), 158–172.

Festinger, L. (1957). *A Theory of Cognitive Dissonance*. Stanford University Press.

Johnson-Laird, P. N. (1983). *Mental Models*. Cambridge University Press.

Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*. Prentice-Hall.

Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Hrsg.), *Handbook of Positive Psychology* (S. 89–105). Oxford University Press.

Rheinberg, F., Vollmeyer, R., & Engeser, S. (2003). Die Erfassung des Flow-Erlebens. In J. Stiensmeier-Pelster & F. Rheinberg (Hrsg.), *Diagnostik von Motivation und Selbstkonzept* (S. 261–279). Hogrefe.

Ryan, R. M., & Deci, E. L. (2000). Intrinsic and extrinsic motivations: Classic definitions and new directions. *Contemporary Educational Psychology, 25*(1), 54–67.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573.

Woloshyn, V. E., Pressley, M., & Schneider, W. (1992). Elaborative-interrogation and prior-knowledge effects on learning of facts. *Journal of Educational Psychology, 84*(1), 115–124.
