# Kapitel 3 — Konzeptionelles Rahmenwerk

> **Stand:** 06. Juni 2026 · **Version:** 1.1-DRAFT  
> **Reviewer:** Psychologe (3.2, 3.3) ✓ · AI Engineer (3.3–3.6) ✓ · Didaktiker (3.6) ✓ · Architect  
> **Geplanter Umfang:** ca. 20–25 Seiten (~5.000–6.000 Wörter)  
> **Status:** Fünf Systemkomponenten — Transparenz-Layer als 5. Komponente ergänzt (v1.1)

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

### 3.3.4 Operationalisierung: Was macht KAIA sokratisch?

"Sokratisch" ist kein selbsterklärender Begriff. Der Anspruch, sokratisch zu sein, ist wertlos, wenn nicht spezifiziert wird welche Fragetypen welche kognitive Operation auslösen sollen. KAIA operationalisiert sokratisches Vorgehen über drei distinkte Fragetypen, die dem LLM im Systemprompt beschrieben werden:

1. *Klärungsfragen* — "Was genau meinst du mit X?" Ziel: Vagheit sichtbar machen, Präzisierung erzwingen (Bloom: Verstehen)
2. *Hypothetische Fragen* — "Was würde sich ändern, wenn...?" Ziel: Transferdenken anregen, Grenzen des Konzepts explorieren (Bloom: Anwenden, Analysieren)
3. *Widerspruchsfragen* — "Du hast vorhin Y gesagt — passt das zu X?" Ziel: Kognitive Dissonanz erzeugen, Restrukturierung auslösen (Bloom: Analysieren, Bewerten)

Dieses dreistufige Fragetypen-Repertoire ist die Mindestspezifikation für Reproduzierbarkeit: Im LLM-Evaluationsbericht (Kapitel 5) wird getestet, welches Modell die drei Typen konsistent und korrekt anwendet. "KAIA stellt Fragen" ist keine evaluierbare Aussage. "KAIA stellt Klärungsfragen, hypothetische Fragen und Widerspruchsfragen nach definierten Auslösebedingungen" ist es.

### 3.3.5 Session-Architektur: Drei-Phasen-Skript

Basierend auf Hattie & Timperley (2007), Anderson & Krathwohl (2001) und Erkenntnissen zu Spaced Learning (Cepeda et al., 2006) folgt jede KAIA-Session einem internen Drei-Phasen-Skript. Dieses Skript ist ein Prompt-Engineering-Konzept — es ist nicht als Interface-Element sichtbar. Die Phasengrenzen sind fließend und zeitbasiert, nicht rigid.

**Phase 1 — Aktivierung (erste 60–90 Sekunden):**  
Einstiegsfrage: *"Was möchtest du nach dieser Session verstanden oder weitergedacht haben?"* Diese Frage aktiviert Vorwissen (Ausubel, 1968), erzwingt eine Lernintention (Locke & Latham, 1990) und orientiert das LLM auf den aktuellen Fokus. Ohne diese Aktivierung beginnt KAIA reaktiv — ein didaktisches Defizit.

**Phase 2 — Arbeitsphase (Kernzeit der Session):**  
KAIA wechselt nach Lazarus-Signal in den jeweils angemessenen Modus (sokratisch / scaffolding / herausfordernd). Maximal eine Frage pro Antwort. Antworten unter 80 Wörtern (Scaffolding-Modus: unter 120 Wörtern). Keine Listen. Keine Bullet Points.

**Phase 3 — Sicherung und Transfer (letzte 60–90 Sekunden):**  
Abschlussfrage: *"Was würdest du jemandem erklären, der nicht dabei war?"* Diese Frage erzwingt Elaboration (Bloom: Verstehen/Anwenden), ist als Transfer-Aufgabe konzipiert (Merrill, 2002) und liefert gleichzeitig Material für die Post-Session-Profil-Extraktion. Der UX-Designer bestätigt: Diese Abschlussfrage ist das einzige session-strukturelle Element das ins Interface gehört — als natürliche Gesprächsgeste, nicht als pädagogisches Formular.

**Hinweis zur Interface-Umsetzung** (nach UX-Designer-Review): Die Drei-Phasen-Struktur bleibt für Nutzende unsichtbar. Was sichtbar ist: Die Einstiegs- und Abschlussfrage als natürliche Gesprächsbestandteile. Fortschrittsanzeigen oder Phasenlabels ("Phase: Sicherung") sind verboten — sie zerstören den kognitiven Flow (Oliveira & Hamari, 2024) und infantilisieren erwachsene Lernende (Knowles, 1980).

---

## 3.4 Komponente 3: Persönliche Lernroadmap

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

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Plenum.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.

Edelmann, W. (2000). *Lernpsychologie* (6. Aufl.). Beltz.

Johnson-Laird, P. N. (1983). *Mental Models*. Cambridge University Press.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573.
