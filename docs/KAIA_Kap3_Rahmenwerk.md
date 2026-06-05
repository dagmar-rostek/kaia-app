# Kapitel 3 — Konzeptionelles Rahmenwerk

> **Stand:** 05. Juni 2026 · **Version:** 1.0-DRAFT  
> **Reviewer:** Psychologe (3.2, 3.3) ✓ · AI Engineer (3.3, 3.4, 3.5) ✓ · Architect  
> **Geplanter Umfang:** ca. 18–22 Seiten (~4.500–5.500 Wörter)  
> **Status:** Vollständig überarbeitete Version — alle vier Systemkomponenten dokumentiert

---

## Überblick

Dieses Kapitel entwickelt das konzeptionelle Rahmenwerk von KAIA. Es übersetzt die theoretischen Grundlagen (Kapitel 2) in operative Designentscheidungen und beschreibt das Vier-Komponenten-Modell: (1) regelbasiertes Adaptionssystem, (2) Mehr-Modus-Interaktionsarchitektur, (3) Lernroadmap-Integration, (4) Zwei-Schicht-Gedächtnis und wachsendes Nutzerprofil.

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

### 3.3.4 Session-Format: Kurze Einheiten mit Tagesplan

Basierend auf Erkenntnissen zu Spaced Learning (Cepeda et al., 2006) und der Praxis des projektbasierten Lernens werden Sessions auf **5–10 Minuten** begrenzt. Jede Session beginnt mit einem expliziten Tagesplan: "Was möchtest du heute mit KAIAs Hilfe erarbeiten?" Dieser Plan wird gespeichert und als Kontext für die Session-Auswertung verwendet.

---

## 3.4 Komponente 3: Persönliche Lernroadmap

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

## 3.6 Synthese: Das KAIA-Rahmenwerk als Designartefakt

Das konzeptionelle Rahmenwerk von KAIA ist ein Designartefakt im Sinne von Hevner et al. (2004). Seine vier Komponenten bilden keine unabhängigen Teilsysteme, sondern ein kohärentes System, in dem jede Entscheidung theoretisch begründet ist:

Das regelbasierte Adaptionssystem (Lazarus) liefert die Zustandssignale → die Mehr-Modus-Architektur wählt den passenden Interaktionsstil → die Lernroadmap gibt den inhaltlichen Kontext → das wachsende Nutzerprofil akkumuliert die Erkenntnisse für Folgesessions. Jede Session baut auf der vorherigen auf; jede Interaktion fließt in die Personalisierung ein.

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
