# Kapitel 2 — Theoretischer Hintergrund

> **Stand:** 13. Juli 2026 · **Version:** 2.0  
> **Reviewer:** Psychologe (2.3, 2.7, 2.8) ✓ · Didaktiker (2.1, 2.2, 2.4–2.6, 2.9, 2.13) · AI Engineer (2.11) · Architect (2.14)  
> **Nächste Revision:** bei inhaltlicher Erweiterung oder neuen Quellenfunden  
>
> *v2.0 (13. Juli 2026): Vollständige Überarbeitung und Restrukturierung. Nummerierungsfehler (doppelte 2.7/2.8/2.9) korrigiert. Neu: 2.4 (Didaktische Grundlagen: Gagné, Merrill, Distributed Practice), 2.8 (MSLQ), 2.9 (Sokratische Methode und Drei-Charaktere-Architektur), 2.13 (Session-Architektur V3 und kumulatives Gedächtnis). Erweitert: 2.6 (EMA-Feedback), 2.7 (GSE-Normdaten). Alle implementierten Features theoretisch verortet.*

---

## Überblick und Leitfragen

Das vorliegende Kapitel entwickelt das theoretische Fundament, auf dem KAIA als sokratischer KI-Lernbegleiter konzipiert ist. Die Forschungsfrage — inwieweit KI-gestützte, sokratische Lernbegleitung die allgemeine Selbstwirksamkeitserwartung von Lernenden beeinflusst — berührt mindestens fünf Theoriefelder in Wechselbeziehung: lerntheoretische und didaktische Grundlagen, kognitionspsychologische Erkenntnisse zu Belastung und Expertise, motivationspsychologische Konstrukte (Selbstbestimmung, Flow, Stressbewältigung), die Psychometrie der eingesetzten Messinstrumente sowie aktuelle Ansätze der KI-gestützten Bildungstechnologie.

Die theoretische Rahmung folgt vier Leitfragen:

1. *Warum ist sokratische Begleitung didaktisch der instruktionalen Direktheit überlegen, und wie operationalisiert KAIAs Drei-Charaktere-Architektur dieses Prinzip?* (Abschnitte 2.1, 2.4, 2.9)
2. *Über welche psychologischen Mechanismen kann ein KI-System Selbstwirksamkeit und Lernerfolg beeinflussen?* (Abschnitte 2.2, 2.3, 2.7)
3. *Wie begründet die didaktische Wissenschaft die spezifische Session-Architektur — Sequenzierung, Frequenz, Reflexionspunkte — von KAIA?* (Abschnitte 2.4, 2.6, 2.13)
4. *Welche Implikationen ergeben sich aus der empirischen KI-Forschung für ein ethisch vertretbares, adaptives System, und welche Messinstrumente sind valide für die intendierte Wirkung?* (Abschnitte 2.8, 2.10, 2.11)

Abschnitt 2.12 behandelt selbstreguliertes Lernen als übergreifendes Konstrukt. Abschnitt 2.14 kontextualisiert die Studie methodologisch im Design Science Research-Paradigma. Abschnitt 2.15 führt alle Stränge zu einem synthetischen Rahmenwerk zusammen, aus dem die Forschungshypothesen unmittelbar abgeleitet werden.

---

## 2.1 Lerntheoretische Grundlagen: Konstruktivismus, Zone der nächsten Entwicklung und exemplarisches Lernen

Das lerntheoretische Fundament von KAIA ist konstruktivistisch. Konstruktivistische Lerntheorien — geprägt durch Piaget (1952) und Vygotsky (1978) — gehen davon aus, dass Wissen nicht passiv rezipiert, sondern aktiv konstruiert wird. Lernen ist kein Transferprozess, sondern ein Prozess der Bedeutungskonstruktion: Lernende verbinden neue Informationen mit bestehenden kognitiven Schemata, prüfen Widersprüche, restrukturieren Konzepte und bilden dadurch neues, anwendbares Wissen.

Vygotskys Konzept der Zone der nächsten Entwicklung (ZPD; Vygotsky, 1978) präzisiert, unter welchen Bedingungen dieser Konstruktionsprozess gelingt. Die ZPD bezeichnet den Abstand zwischen dem, was eine Person eigenständig leisten kann, und dem, was sie unter kompetenter Unterstützung zu leisten vermag. Lernförderliche Unterstützung — ob durch Peers, Lehrkräfte oder technische Systeme — sollte genau in dieser Zone ansetzen: weder zu einfach noch zu schwierig. Entscheidend ist, dass die Unterstützung schrittweise zurückgezogen wird, sobald die Lernperson die neuen Fähigkeiten internalisiert hat (Scaffolding; Wood, Bruner & Ross, 1976). KAIA übersetzt dieses Prinzip in eine technische Architektur: Die drei Gesprächscharaktere (Abschnitt 2.9) repräsentieren unterschiedliche Intensitäten sokratischer Unterstützung, die je nach wahrgenommenem kognitivem Zustand der lernenden Person aktiviert werden.

Klafki (1958, 1985) hat in seiner bildungstheoretischen Didaktik das Prinzip des exemplarischen Lernens herausgearbeitet: Nicht der vollständige Kanon eines Wissensgebietes soll gelehrt werden, sondern exemplarische Inhalte, an denen allgemeine Prinzipien erfahrbar werden. Für KAIA ist dieses Prinzip in der Themenstruktur der Studie wirksam: Die drei Beispiel-Lernthemen (Wertschätzende Kommunikation, KI-Kompetenz, Leadership) sind nicht beliebig gewählt, sondern repräsentieren exemplarische Kompetenzdomänen, an denen das übergreifende Metaziel — die Entwicklung von Selbststeuerungskompetenz — erfahrbar werden soll (vgl. Abschnitt 2.12). Klafkis Didaktische Analyse (1958) fordert dabei, für jeden Lerninhalt explizit zu klären: Welche gegenwärtige Bedeutung hat der Inhalt für die Lernenden? Welche zukünftige? Welche Zugangsweise ist strukturell sinnvoll? Diese Fragen stellen die didaktische Legitimationsgrundlage für die Themenwahl dar.

---

## 2.2 Kognitive Psychologie des Lernens: Kognitive Belastungstheorie und Expertise Reversal Effect

Dass gute Erklärungen Lernen fördern, gilt in der Alltagspädagogik als Selbstverständlichkeit. Die Cognitive Load Theory (Sweller, 1988; Sweller, van Merriënboer & Paas, 1998) differenziert diesen Befund erheblich. Das Modell unterscheidet drei Formen kognitiver Belastung: intrinsischen Load, der durch die inhärente Komplexität des Lernstoffs entsteht; extrinsischen Load, der durch ungünstige Aufbereitung des Materials erzeugt wird; sowie lernrelevanten Load (germane load), der die kognitiven Ressourcen bezeichnet, die für den Aufbau von Schemata tatsächlich verfügbar sind. Lernförderliches Design reduziert extrinsische Belastung und maximiert lernrelevante Verarbeitungskapazität.

Kalyuga, Ayres, Chandler und Sweller (2003) zeigen, dass Instruktionsformate, die für Novizen hocheffektiv sind — ausführliche Erklärungen, vollständige Beispiele, schrittweise Anleitungen —, für fortgeschrittene Lernende ihre Wirkung verlieren oder umkehren. Dieses Phänomen, der Expertise Reversal Effect, erklärt sich dadurch, dass Experten stabile mentale Schemata besitzen. Ausführliche Instruktionen erzeugen bei ihnen redundante Informationsverarbeitung, die kognitive Ressourcen bindet statt freizusetzen (Kalyuga, 2007). Die Konsequenz ist eine zwingende: Lernunterstützung muss nicht nur auf den Lernstoff, sondern auf den Wissensstand der lernenden Person zugeschnitten sein — und mit steigendem Expertise-Niveau instruktional zurücktreten.

Für KAIA bedeutet dieser Befund eine konkrete Designentscheidung gegen instruktionale Direktheit. Ein System, das auf jede Nutzerfrage eine vollständige Antwort liefert, optimiert für Novizen und schadet potenziell fortgeschrittenen Lernenden. Darüber hinaus hemmt konsequente Antwortbereitstellung die Entwicklung metakognitiver Kompetenzen (Kalyuga, 2007). KAIAs Entscheidung, ausschließlich Fragen zu stellen, ist daher nicht pädagogische Prinzipienreiterei, sondern theoretisch fundierte Reaktion auf den Expertise Reversal Effect: Das System hält sich instruktional zurück, sichert den kognitiv notwendigen Eigenanteil und zielt auf den Aufbau eigenständiger Problemlösekompetenz.

---

## 2.3 Motivationspsychologie: Selbstbestimmung, Flow und Stressbewältigung

### 2.3.1 Selbstbestimmungstheorie: Intrinsische Motivation und die Grenzen extrinsischer Verstärkung

Die Selbstbestimmungstheorie (Self-Determination Theory, SDT; Deci & Ryan, 1985, 2000) postuliert drei basale psychologische Grundbedürfnisse, deren Erfüllung intrinsische Motivation aufrechthält: das Bedürfnis nach Autonomie (selbstbestimmtes Handeln), nach Kompetenzerleben (Wirksamkeitserfahrung) und nach sozialer Eingebundenheit (relatedness). Werden diese Bedürfnisse unterlaufen — durch externe Kontrolle, salientem Druck oder Fremdbeurteilung — verschiebt sich die Motivationsregulation in Richtung externer Kontrolliertheit.

Der sogenannte Korrumpierungseffekt (Deci, 1971; Lepper, Greene & Nisbett, 1973) belegt empirisch, dass externe Belohnungen — auch verbales Lob — die intrinsische Motivation für intrinsisch interessante Aktivitäten schwächen, wenn sie als informationskontrollierend wahrgenommenen werden. Für KAIAs Gesprächsdesign folgt daraus eine spezifische Gestaltungsanforderung: KAIA soll nicht bestätigen, sondern attribuieren — konkret benennen, welche Eigenleistung zum Erkenntnisfortschritt geführt hat (vgl. Weiner, 1985). Dies wahrt die Autonomie-Dimension der SDT und verhindert, dass Selbstwirksamkeitsstärkung durch Fremdvalidierung unterlaufen wird.

### 2.3.2 Flow und optimale Aktivierung

Yerkes und Dodson (1908) haben gezeigt, dass zwischen dem Grad physiologischer Erregung und der Leistungsgüte ein umgekehrt U-förmiger Zusammenhang besteht. Optimale Leistung liegt im mittleren Aktivierungsbereich, wobei das Optimum je nach Aufgabenkomplexität variiert. Teigen (1994) hat dieses Modell einer kritischen Revision unterzogen und argumentiert, dass das Entscheidende nicht ein universelles Aktivierungsniveau ist, sondern die individuelle Passung zwischen Anforderungsniveau und aktuellem Zustand einer Person — eine Relativierung, die für adaptive Lernsysteme bedeutsam ist.

Csikszentmihalyi (1990) hat mit dem Flow-Konzept eine phänomenologisch reichhaltigere Perspektive eingeführt: Flow entsteht, wenn Anforderungsniveau und wahrgenommene Kompetenz im Gleichgewicht sind und beide auf hinreichend hohem Niveau liegen. Oliveira und Hamari (2024) haben den Forschungsstand zu Flow in digitalen Lernumgebungen systematisch analysiert. Ihre Befunde zeigen, dass Flow durch klar definierte Ziele, unmittelbares Feedback und dynamische Anpassung des Schwierigkeitsgrades gefördert wird. Zugleich betonen die Autoren, dass Flow in Lernsystemen nicht algorithmisch erzeugt, sondern allenfalls begünstigt werden kann. KAIAs neuroadaptiver Modus operationalisiert diese Erkenntnis: Das System schafft Rahmenbedingungen für Flow, ohne ihn mechanistisch beanspruchen zu können (vgl. Abschnitt 2.10).

### 2.3.3 Transaktionales Stressmodell nach Lazarus und Folkman

Das transaktionale Stressmodell von Lazarus und Folkman (1984) bricht mit der alltagspsychologischen Sichtweise, Stress sei eine objektive Eigenschaft einer Situation. Stress entsteht im Bewertungsprozess einer Person im Verhältnis zu dieser Situation. Das Modell postuliert zwei Bewertungsprozesse: In der primären Bewertung schätzt eine Person ein, ob ein Ereignis stressbezogen ist — differenziert in Schaden/Verlust, Bedrohung und Herausforderung. In der sekundären Bewertung schätzt sie ihre verfügbaren Bewältigungsressourcen ein. Das Zusammenspiel beider Bewertungen — wahrgenommene Anforderung und wahrgenommene Ressource — bestimmt das Ausmaß des erlebten Stresses (Lazarus, 1993).

Für das Design von KAIA ergibt sich eine spezifische Konsequenz. Ein instruktional vorgehender KI-Tutor, der fertige Antworten liefert, reduziert kurzfristig die wahrgenommene Anforderung, stärkt jedoch nicht die wahrgenommene Ressource. Sokratische Begleitung hingegen zielt direkt auf die sekundäre Bewertung: durch eigenständiges Erarbeiten von Lösungswegen wird die Überzeugung gestärkt, über ausreichende kognitive Ressourcen zu verfügen. KAIAs Haltung ist damit eine theoretisch begründete Intervention in den Bewertungsprozess — sie verschiebt die Einschätzung von "Bedrohung" in Richtung "bewältigbare Herausforderung".

---

## 2.4 Didaktische Grundlagen: Lernziele, Sequenzierung und Instruktionsdesign

### 2.4.1 Lernzielklassifikation nach Bloom und Anderson/Krathwohl

Bloom und Kollegen (1956) haben mit ihrer Taxonomie der Lernziele im kognitiven Bereich ein Klassifikationssystem vorgelegt, das die Frage "Welche Art von Lernen wird angestrebt?" operationalisierbar macht. Die revidierte Fassung (Anderson & Krathwohl, 2001) unterscheidet sechs hierarchisch geordnete Verarbeitungsniveaus: Erinnern, Verstehen, Anwenden, Analysieren, Bewerten, Erschaffen.

KAIA operiert primär auf den Niveaus Verstehen (2), Anwenden (3) und Analysieren (4). Durch sokratisches Fragen wird das bloße Erinnern (1) aktiv verhindert; Verstehen wird durch Reformulierung und Verknüpfung gefördert, Anwenden durch die Verarbeitung am eigenen Lernprojekt, Analysieren durch das Hinterfragen von Annahmen im konfrontierenden Charakter. Die Session-Architektur V3 (Abschnitt 2.13) staffelt diese Niveaus explizit über die Studiendauer: Die Erkundungsphase (Sessions 1–2) adressiert vorrangig Verstehen; die Transfer- und Analysephase (Sessions 3–8) Anwenden und Analysieren; die Synthesephase (Sessions 9–10) Bewerten und Erschaffen.

### 2.4.2 Bedingungen des Lernens nach Gagné

Gagné (1965, 1977) hat eine lerntheoretisch fundierte Systematik des Instruktionsdesigns entwickelt, die zwischen verschiedenen Lernergebnistypen (verbale Information, intellektuelle Fertigkeiten, kognitive Strategien, motorische Fertigkeiten, Einstellungen) und neun Unterrichtsereignissen unterscheidet. Die neun Ereignisse — Aufmerksamkeit gewinnen, Lernziel mitteilen, Vorwissen aktivieren, Stimulus darbieten, Lernhilfe geben, Leistung hervorrufen, Rückmeldung geben, Leistung beurteilen, Behalten und Transfer sichern — beschreiben eine vollständige Lernsequenz, die externe Lernanlässe und interne Verarbeitungsprozesse koordiniert.

Für KAIA ist dieses Modell auf Session-Ebene instruktiv. KAIAs sokratische Fragen übernehmen die Funktion mehrerer Gagné-Ereignisse gleichzeitig: Sie aktivieren Vorwissen, geben implizite Lernhilfe und rufen Eigenleistung hervor. Der Halbzeit-Spiegel in Session 5 und die Triple-Task-Abschlussgestaltung in Session 10 (Abschnitt 2.13) entsprechen Gagnés Ereignissen "Behalten und Transfer sichern". Das kumulative Gedächtnis (session_summary, historical_quotes) operationalisiert die Aktivierung von Vorwissen über Sessiongrenzen hinweg — ein Mechanismus, für den Gagné keine technische Lösung anbieten konnte, der jedoch direkt aus seiner Lerntheorie ableitbar ist.

### 2.4.3 First Principles of Instruction nach Merrill

Merrill (2002) destilliert aus der empirischen Instruktionsforschung fünf Kernprinzipien effektiven Lernens: (1) Lernen findet statt, wenn Lernende reale Probleme lösen (Problem-Zentrierung); (2) Lernen wird gefördert, wenn an vorhandenem Wissen angeknüpft wird (Aktivierung); (3) Lernen verbessert sich, wenn neue Wissensaspekte demonstriert werden (Demonstration); (4) Lernen erfordert die Anwendung neuer Wissensaspekte durch die Lernenden selbst (Anwendung); (5) Lernen ist nachhaltiger, wenn das Erlernte in die Alltagswelt der Lernenden integriert wird (Integration).

KAIAs Design erfüllt alle fünf Prinzipien strukturell: Die freie Themenwahl adressiert reale, persönlich bedeutsame Probleme (Prinzip 1); das kumulative Gedächtnis ermöglicht Anknüpfung an Vorerfahrungen (Prinzip 2); KAIA demonstriert nicht, aber provoziert durch Fragen die eigene Demonstration durch die lernende Person (Prinzip 3 in sokratischer Umkehrung); die Eigenleistung der lernenden Person ist das primäre Prinzip des gesamten Designs (Prinzip 4); die Autonomisierungsfrage in Session 10 expliziert den Transfer in den Alltag (Prinzip 5). Merrills Rahmen liefert damit eine zusätzliche instruktionstheoretische Legitimation des KAIA-Designs jenseits der deutschen Didaktiktradition.

### 2.4.4 Distributed Practice und die temporale Sequenzierung von Lerneinheiten

Eine der robustesten Befundlagen der Kognitionspsychologie ist der Spacing-Effekt: Verteiltes Lernen über mehrere Zeitpunkte ist massed practice — das konzentrierte Lernen in einer einzigen Sitzung — in Bezug auf langfristigen Behaltens- und Transfererfolg substanziell überlegen. Cepeda, Pashler, Vul, Wixted und Rohrer (2006) haben in einer quantitativen Synthese von 254 Studien mit 317 Experimenten belegt, dass die optimale intersessionale Zeitspanne von der beabsichtigten Behaltensintervall abhängt, aber in praktisch allen untersuchten Bedingungen mindestens 24 Stunden betragen sollte. Dunlosky, Rawson, Marsh, Nathan und Willingham (2013) bewerten distributed practice als die Lerntechnik mit dem stärksten empirischen Wirkungsnachweis insgesamt.

Die Beschränkung auf maximal eine KAIA-Session pro Tag ist damit nicht nur eine pragmatische Nutzungsregel, sondern eine direkte Implementierung des Distributed-Practice-Prinzips. Zehn Sessions über mindestens zehn Tage — in der Praxis über vier Wochen — erzeugt die intersessionalen Abstände, die nach Cepeda et al. (2006) für nachhaltiges Behalten notwendig sind. Gleichzeitig stellt die Mindestteilnahmevorgabe (drei Sessions über vier Wochen) die Untergrenze des Spacing-Effekts sicher. Das kumulatives Gedächtnis (Abschnitt 2.13) ist dabei nicht nur technisch notwendig, um Gesprächskontinuität herzustellen, sondern kognitiv notwendig: Es aktiviert bei jeder Session das in Vorabsitzungen erworbene Wissen und schafft die semantischen Anker, über die Spacing seinen Effekt entfaltet (Ausubel, 1968).

---

## 2.5 Andragogik: Besonderheiten erwachsener Lernender

Die Zielgruppe der KAIA-Pilotstudie sind Erwachsene in Hochschule und beruflicher Weiterbildung. Knowles (1980, 1984) hat mit seiner Andragogik sechs Merkmale erwachsener Lernender herausgearbeitet, die für das Design von KAIAs Lernbegleitung direkt relevant sind.

Erstens neigen Erwachsene zu einem selbstkonzeptbezogenen Lernbild: Je mehr Erfahrung, desto stärker die Ablehnung von Fremdsteuerung und Bevormundung. KAIAs sokratischer Ansatz — keine Antworten, keine Instruktionen — ist für diese Zielgruppe didaktisch angemessener als direktive Wissensvermittlung. Zweitens ist Erfahrung für Erwachsene eine Lernressource: Vorerfahrungen bilden die Basis neuer Konzeptverknüpfungen. KAIAs kumulatives Gedächtnis adressiert dies architektonisch — Vorerfahrungen werden als Kontext gespeichert und in Folgegesprächen aktiviert. Drittens orientieren sich Erwachsene an konkreten Lernbereitschaften: Sie lernen, was sie für relevante Lebensaufgaben brauchen. Die freie Themenwahl in KAIA entspricht diesem Prinzip direkt. Viertens bevorzugen Erwachsene problemzentriertes statt stoffzentriertes Lernen — ein Grundprinzip des sokratischen Dialogs. Fünftens prägt intrinsische Motivation das Lernverhalten stärker als externe Anreize (Knowles, 1984) — eine Begründung mehr für das SDT-konforme Design ohne externe Belohnungsstrukturen (Deci & Ryan, 1985; vgl. Abschnitt 2.3.1).

Die Andragogik ist damit kein additives Theoriekonzept, sondern ein Konsistenzkriterium: Sie fordert, dass KAIAs Design die Lernenden als selbstbestimmte Erwachsene behandelt — was Fragen statt Antworten, freie Themenwahl und nutzerseitige Lernroadmap-Kontrolle unmittelbar begründet.

---

## 2.6 Feedback-Theorie und formatives Assessment

### 2.6.1 Wirkungsebenen von Feedback nach Hattie und Timperley

Feedback ist einer der wirkungsstärksten Einflussgrößen auf Lernen. Hattie (2009) identifiziert Feedback in seiner Meta-Analyse mit einer durchschnittlichen Effektgröße von d = 0.73 als einen der stärksten Einflussfaktoren auf Lernerfolg. Hattie und Timperley (2007) differenzieren vier Feedback-Ebenen: die Aufgabenebene (Korrektheit, Vollständigkeit), die Prozessebene (Strategien, Verarbeitung), die Selbstregulationsebene (Selbstüberwachung, Zielsetzung) und die Selbstebene (persönliche Bewertungen wie "Gut gemacht!"). Letztere ist die schwächste und lernpsychologisch unzuverlässigste Form — pauschales persönliches Lob hat keinen messbaren Lerneffekt.

Für KAIA ist diese Differenzierung designentscheidend. Sokratische Fragen sind eine Form impliziten Feedbacks — sie signalisieren, welche kognitiven Prozesse als unvollständig oder vertiefenswert angesehen werden. Der KAIA-Charakter "warm/Begleitend" greift primär auf Prozess- und Selbstregulationsebene; Feedback auf Selbstebene ist durch das Prompt-Design zu vermeiden. Dwecks (1999, 2006) Befunde zur Growth-vs.-Fixed-Mindset-Theorie ergänzen dies: Feedback, das Erfolg auf Anstrengung und Strategie attribuiert, stärkt Explorationsbereitschaft und Resilienz. KAIAs bestärkender Gesprächsstil muss — im Sinne von Weiner (1985), Dweck (1999) und Hattie und Timperley (2007) — auf interne, kontrollierbare Faktoren attribuieren, nicht auf pauschale Kompetenz.

### 2.6.2 Ecological Momentary Assessment als Grundlage des EMA-Feedbacksystems

Ecological Momentary Assessment (EMA; Shiffman, Stone & Hufford, 2008) bezeichnet die Erfassung psychologischer Zustände in Echtzeit und im natürlichen Kontext — im Gegensatz zu retrospektiven Befragungen, die Erinnerungsverzerrungen unterliegen. EMA-Methoden gelten als validere Erfassung aktueller Erlebenszustände, weil sie zeitnah zur tatsächlichen Erfahrung erhoben werden.

KAIAs Feedback-System adaptiert dieses Prinzip als In-Session-Signalsystem: Lernende können während des Gesprächs vier Markierungen setzen — transfer_marker (eine Einsicht, die über die Session hinaus relevant ist), wow (eine Frage hat etwas ausgelöst), stuck (die aktuelle Frage führt nicht weiter), unclear (die Frage ist unverständlich). Diese Signale sind episodisch-momentan, nicht retrospektiv, und entsprechen damit der EMA-Logik. Sie übernehmen im Kontext von KAIAs adaptiver Gesprächsführung drei Funktionen: Sie geben der Lernperson aktive Steuerungskontrolle (Autonomiebedürfnis nach SDT), sie liefern dem System Rückmeldung zur Kalibrierung des Gesprächsstils (formatives Assessment im Sinne von Black & Wiliam, 1998), und sie erzeugen eine longitudinal auswertbare Spur von Engagement- und Verständniszuständen. Die transfer_marker-Daten fließen in die Auswertung des Evaluationsberichts (Kapitel 5) ein; die wow- und stuck-Signale steuern die unmittelbare Adaptionslogik von KAIA.

---

## 2.7 Selbstwirksamkeitserwartung als lernpsychologisches Konstrukt

Die Selbstwirksamkeitserwartung (self-efficacy; Bandura, 1977) bezeichnet die subjektive Überzeugung einer Person, in der Lage zu sein, eine bestimmte Handlung erfolgreich auszuführen und damit ein angestrebtes Ziel zu erreichen. Das Konstrukt ist von verwandten Begriffen abzugrenzen: Das Selbstkonzept beschreibt eine globalere Selbstwahrnehmung eigener Eigenschaften, Selbstvertrauen ist ein affektiv gefärbtes, wenig situationsspezifisches Zutrauen. Selbstwirksamkeitserwartung ist dagegen explizit aufgabenspezifisch, zukunftsorientiert und handlungsbezogen: Sie beantwortet nicht "Was kann ich?", sondern "Werde ich in der Lage sein, diese konkrete Anforderung zu bewältigen?" (Bandura, 1997).

Bandura (1977, 1997) beschreibt vier Quellen: Handlungsergebniserfahrungen (mastery experiences) als stärkste Quelle; stellvertretende Erfahrungen (vicarious experiences); verbale Überzeugungen (verbal persuasion); sowie physiologische und affektive Zustände. Für Lernprozesse hat Selbstwirksamkeit empirisch gut belegte Konsequenzen: Höhere Selbstwirksamkeit geht einher mit der Wahl anspruchsvollerer Aufgaben, größerer Ausdauer und besseren Leistungsergebnissen (Bandura, 1997; Pajares, 1996). Meta-analytische Befunde bestätigen moderate bis starke Prädiktionskraft für akademische Leistung (Multon, Brown & Lent, 1991).

Für die vorliegende Studie wird die Allgemeine Selbstwirksamkeitserwartung nach Schwarzer und Jerusalem (1995) eingesetzt. Die deutschsprachige Skala (10 Items, 4-stufiges Likert-Format) erfasst eine generalisierte Überzeugung, Schwierigkeiten aus eigener Kraft bewältigen zu können. Psychometrisch weist die Skala gute Kennwerte auf (Cronbachs Alpha .80–.90; Jerusalem & Schwarzer, 1992). Der normative Mittelwert für deutsche Erwachsenenstichproben liegt bei M = 2.97 (SD = 0.52; Schwarzer & Jerusalem, 1995), was als Referenzpunkt für die Interpretation von Prä-Post-Veränderungen dient. Kritisch ist anzumerken, dass die Skala generalisierte Überzeugungen misst und damit aufgabenspezifische Veränderungen nur indirekt abbildet. Für den Kontext sokratischer Lernbegleitung ist es jedoch plausibel, dass wiederholte eigenständige Erkenntniserlebnisse — Handlungsergebniserfahrungen im Sinne Banduras — langfristig globale Überzeugungen verschieben.

---

## 2.8 MSLQ als Messinstrument für Lernmotivation und Lernstrategien

Das Motivated Strategies for Learning Questionnaire (MSLQ; Pintrich, Smith, Garcia & McKeachie, 1991) ist ein standardisiertes Selbstberichtsinstrument zur Erfassung motivationaler Orientierungen und kognitiver Lernstrategien im Hochschulkontext. Das vollständige Instrument umfasst 81 Items in 15 Subskalen, verteilt auf einen Motivations- (31 Items, 6 Subskalen) und einen Lernstrategieteil (50 Items, 9 Subskalen). Alle Items werden auf einer 7-stufigen Likert-Skala (1 = trifft überhaupt nicht zu bis 7 = trifft vollständig zu) beantwortet.

Die psychometrischen Eigenschaften des MSLQ wurden durch Pintrich et al. (1993) an einer Stichprobe von 380 Studierenden validiert. Die Autoren berichten interne Konsistenzwerte zwischen Cronbachs Alpha = .62 und .93 für die einzelnen Subskalen; die Skalen zur Selbstwirksamkeit (α = .93) und zu kognitiven Strategien (elaboration: α = .76) zeigen besonders gute Reliabilität. Prädiktive Validität ist durch signifikante Zusammenhänge mit Studienleistungen belegt (Pintrich et al., 1993).

KAIA setzt eine adaptierte Version mit 30 Items aus vier validierten MSLQ-Subskalen ein: (1) Intrinsische Zielorientierung (intrinsic goal orientation) — das Ausmaß, in dem Lernende inhaltlich motiviert sind; (2) Aufgabenwert (task value) — die wahrgenommene Relevanz und Wichtigkeit des Lerngegenstandes; (3) Selbstwirksamkeit für Lernen und Leistung (self-efficacy for learning and performance) — lernspezifische Kompetenzerwartung; (4) Elaborationsstrategien (elaboration) — das Verknüpfen neuer Inhalte mit bestehendem Wissen. Diese vier Subskalen wurden ausgewählt, weil sie konzeptuell auf die Wirkungslogik KAIAs abgestimmt sind: Sokratische Begleitung sollte — wenn wirksam — intrinsische Orientierung und Aufgabenwert stabilisieren (über das Erleben von Relevanz und Selbstbestimmung), Selbstwirksamkeit für Lernen erhöhen (über Mastery-Erfahrungen) und Elaborationsstrategien aktivieren (über die Notwendigkeit, Fragen durch Verknüpfung zu beantworten).

Die Einbeziehung des MSLQ neben der GSE ist methodisch begründet: Während die GSE eine generalisierte motivationale Überzeugung misst (globaler Outcome), erfasst das MSLQ domänennahe Konstrukte der Lernmotivation und -strategie, die als proximale Mediatoren des Lernprozesses gelten. Der Prä-Post-Vergleich beider Instrumente ermöglicht eine differenziertere Analyse: Verändert sich die allgemeine Selbstwirksamkeit (GSE), während domänenspezifische Lernmotivation (MSLQ) stabil bleibt — oder laufen beide Veränderungen parallel? Diese Frage ist für die Interpretation kausaler Mechanismen bedeutsam (vgl. Abschnitt 2.15).

---

## 2.9 Sokratische Methode und die Drei-Charaktere-Architektur

Die sokratische Methode — benannt nach dem dialogischen Lehrverfahren des Sokrates, überliefert durch Platons Dialoge — operationalisiert das konstruktivistische Lernprinzip auf didaktischer Ebene: Anstatt Wissen zu übermitteln, aktiviert der Lehrende durch gezielte Fragen latentes Wissen und eigene Erkenntniskapazitäten der lernenden Person. Der Mäeutik-Gedanke — die Hebammenkunst des Geistes — beschreibt, dass Wissen im Gegenüber "geboren", nicht "hineingelegt" wird. In der modernen Didaktik findet dies Niederschlag in Guided Discovery Learning (Bruner, 1961) und dialogischem Unterricht (Alexander, 2008).

Für KAIA bedeutet dies eine klare Systemlogik: KAIA gibt keine Antworten. KAIA stellt Fragen. Diese Entscheidung ist nicht Stilpräferenz, sondern lerntheoretisches Design — sie schützt den konstruktivistischen Lernprozess, sichert den Eigenanteil der Lernenden und schafft Raum für die Mastery-Erfahrungen, die Selbstwirksamkeit erst stärken können.

Die Drei-Charaktere-Architektur (warm/Begleitend, challenging/Konfrontierend, wild/Perspektivwechselnd) ist theoretisch im Konzept der Cognitive Apprenticeship (Collins, Brown & Newman, 1989) verankert. Collins et al. (1989) unterscheiden vier didaktische Handlungsformen des "kognitiven Meisters": Modeling (Denk- und Handlungsprozesse sichtbar machen), Coaching (Begleitung und Rückmeldung im Prozess), Scaffolding (gestufte Unterstützung) und Fading (schrittweiser Rückzug der Unterstützung). Die drei KAIA-Charaktere repräsentieren drei spezifische Scaffolding-Intensitäten und Interventionsstile:

**warm/Begleitend** entspricht der Coaching-Phase der Cognitive Apprenticeship: ruhige, aufbauende Fragen, die den Lernprozess emotional sichern und kognitive Orientierung bieten. Dieser Charakter ist didaktisch angemessen für Einstiegsphasen (Sessions 1–2), bei erkennbarer Desorientierung oder nach stuck-Signalen. Er setzt den konstruktivistischen Anker, von dem aus weiteres Scaffolding möglich wird.

**challenging/Konfrontierend** entspricht dem Fading: reduzierte emotionale Stützung, erhöhte kognitive Herausforderung. Piagetscher kognitiver Konflikt (Piaget, 1952) — das Erzeugen von Inkongruenz zwischen bestehenden Schemata und neuen Informationen — ist die theoretische Grundlage dieses Charakters. Direkte Hinterfragung von Annahmen, Widersprüche aufzeigen, zum Widerspruch einladen: Diese Intervention adressiert Bloom-Niveau 4 (Analysieren) und zielt auf den Aufbau selbstreflexiver Denkbewegungen. Didaktisch angemessen für die Transferphase (Sessions 3–8), bei stabiler Gesprächsbasis.

**wild/Perspektivwechselnd** entspricht dem, was Perkins und Salomon (1989) "high-road transfer" nennen — die bewusste Aktivierung abstrakter Prinzipien aus einem fremden Kontext, um Durchbruchseinsichten zu ermöglichen. Unerwartete Verbindungen zwischen disparaten Konzepten herzustellen, stimuliert die Übertragung von Lernprinzipien auf neue Domänen. Dieser Charakter ist didaktisch angemessen für die Synthesephase (Sessions 9–10) und bei wow-Signalen, die tiefere Elaboration ankündigen.

Der adaptive Wechsel zwischen den Charakteren — gesteuert durch Gesprächsindikatoren und EMA-Signale — operationalisiert die graduelle Fading-Logik der Cognitive Apprenticeship: von stützend zu herausfordernd zu transferanregend, entsprechend dem Kompetenzaufbau der Lernenden.

---

## 2.10 Adaptive Lernsysteme: Neuroadaptivität und Personalisierung

Neuroadaptive Systeme sind technische Systeme, die physiologische oder verhaltensbasierte Signale in Echtzeit messen und darauf aufbauend Systemparameter anpassen (Fairclough, 2009). In klinischen und militärischen Kontexten werden dafür EEG, Herzratenvariabilität und Hautleitwert eingesetzt. In kommerziellen Bildungstechnologien ist dieser Zugang aus praktischen und ethischen Gründen nicht realisierbar.

KAIA operationalisiert Neuroadaptivität auf textueller Ebene: Gesprächsindikatoren wie Antwortlänge, Fragemuster, erkennbare Stagnation oder EMA-Signale werden als Proxys für kognitive und emotionale Zustände genutzt. Die epistemischen Grenzen dieses Ansatzes sind explizit zu benennen: Textbasierte Zustandsinferenz ist fehleranfällig, kulturell und individuell variabel, und der Zusammenhang zwischen Gesprächsindikatoren und tatsächlichem kognitiven Zustand empirisch noch wenig belegt. KAIA macht daher keinen Anspruch auf reliable Zustandsdiagnose; der neuroadaptive Modus ist als Annäherung, nicht als Messung zu verstehen.

In der Tradition der deutschen Allgemeinen Didaktik (Klafki, 1985; Heimann, Otto & Schulz, 1965) bezeichnet **Individualisierung** die lernerseitige Selbststeuerung, **Personalisierung** die systemseitige Adaptation. KAIA ist primär ein personalisierendes System: Es adaptiert basierend auf inferiertem Kontext. Die Forschungsleistung besteht nicht darin, Personalisierung zu betreiben — das leisten viele Systeme —, sondern darin, Personalisierung so zu gestalten, dass das Grundbedürfnis nach Autonomie (Deci & Ryan, 2000) nicht verletzt, sondern gestärkt wird. Dies erfordert drei Designbedingungen: (1) systemseitige Adaptionen sind für die Lernenden sichtbar (*Transparenz*), (2) die Lernenden können sie überschreiben (*Kontrollierbarkeit*), und (3) die sokratische Gesprächsführung stellt sicher, dass Anpassung niemals Eigenleistung ersetzt (*Sokratisches Schutzprinzip*).

---

## 2.11 Künstliche Intelligenz in der Bildung und Computational Empathy

Die Geschichte KI-gestützter Lernsysteme reicht bis in die 1970er Jahre zurück. Frühe Intelligent Tutoring Systems (ITS) wie SCHOLAR (Carbonell, 1970) und BUGGY (Brown & Burton, 1978) versuchten, Lernende durch regelbasierte Diagnose von Wissensständen zu unterstützen. Mit dem Durchbruch großer Sprachmodelle (Large Language Models, LLMs) seit 2020 hat sich das Potenzial KI-gestützter Bildungssysteme grundlegend verändert. LLMs sind in der Lage, offene, kontextsensitive Gespräche zu führen, die frühere regelbasierte Systeme nicht ermöglichten. Empirische Studien zeigen messbare positive Effekte auf Lernleistung und Engagement (Kasneci et al., 2023). Gleichzeitig existieren substanzielle Risiken: Halluzinationen, Automation Bias (die unkritische Übernahme von KI-Antworten) und potenzielle Abhängigkeit von externer Unterstützung (Kalyuga, 2007).

Das Konzept der Computational Empathy, eingeführt von Decety und Jackson (2004) im Kontext affektiver Neurowissenschaft, bezeichnet in der technischen Übertragung die Fähigkeit eines Systems, aus Spracheingaben affektive und motivationale Zustände zu inferieren und den Gesprächsstil anzupassen. Es ist wichtig, diese technische Verwendung von echtem menschlichem Einfühlungsvermögen zu unterscheiden: Computational Empathy basiert auf statistischen Mustern in Trainingsdaten, nicht auf phänomenalem Erleben oder moralischem Verständnis. Diese Differenzierung ist für KAIA ethisch verpflichtend — sie muss gegenüber Nutzenden transparent kommuniziert werden (KI-Disclosure) und begrenzt die Anwendungsfelder: KAIA ist kein therapeutisches Werkzeug.

Die Auswahl der Sprachmodelle — Claude (Anthropic), GPT-4o (OpenAI) und Mistral AI — folgt wissenschaftlichen wie datenschutzrechtlichen Kriterien. Der Evaluationsbericht (Kapitel 5) untersucht systematisch, welches Modell für sokratische Gesprächsführung, empathische Responsivität, Konsistenz über Sitzungen und DSGVO-Konformität am besten geeignet ist. Methodisch wird dieser Vergleich über standardisierte synthetische Gesprächsszenarien operationalisiert.

---

## 2.12 Selbstreguliertes Lernen, Metakognition und die "Lernen lernen"-Hypothese

### 2.12.1 Metakognition als Fundament — Selbstwirksamkeit als Motor

Selbstwirksamkeit (Bandura, 1997) und metakognitive Regulation (Flavell, 1979) sind verwandte, aber verschiedene Konstrukte. Selbstwirksamkeit erklärt, *ob* jemand bereit ist, eine schwierige Aufgabe anzugehen — sie ist der **motivationale Motor**. Metakognitive Regulation erklärt, *wie gut* jemand das eigene Denken überwachen, steuern und auf neue Kontexte übertragen kann — sie ist der **kognitive Boden**.

Flavell (1979) unterscheidet metakognitives Wissen (Wissen über eigene Denk- und Lernprozesse) und metakognitive Überwachung (das aktive Beobachten und Steuern dieser Prozesse). Zimmermann (2000) zeigt, dass metakognitive Steuerungskapazität der stärkste empirische Prädiktor für domänenübergreifenden Lerntransfer ist — stärker als GSE allein. Für KAIAs Designlogik bedeutet das: Der sokratische Ansatz zielt nicht primär auf Selbstwirksamkeit (obwohl diese als Nebeneffekt gestärkt wird), sondern auf **metakognitive Aktivierung** — das Bewusstwerden eigener Denkprozesse und blinder Flecken. Selbstwirksamkeit ist der messbare Proxy-Indikator in der GSE-Skala; die eigentlich angestrebte Tiefenwirkung ist metakognitive Regulation.

### 2.12.2 Die theoretische Kette

Die Verbindung zwischen KAIAs sokratischem Ansatz und domänenübergreifender Kompetenz lässt sich als Kette beschreiben:

**Glied 1 — stark und verteidigbar:** Sokratische Begleitung erzeugt eigenständig erarbeitete Lösungen (Mastery Experiences). Diese sind nach Bandura (1997) die stärkste Quelle von Selbstwirksamkeitserwartungen. Ein System, das niemals Antworten liefert, maximiert die Wahrscheinlichkeit, dass die lernende Person die Lösung sich selbst attribuiert — und damit ihre allgemeine Handlungskompetenzerwartung stärkt (GSE; Schwarzer & Jerusalem, 1995).

**Glied 2 — theoretisch plausibel, empirisch voraussetzungsreich:** Ein erhöhter GSE-Wert korreliert empirisch mit tieferen Lernstrategien, größerer Ausdauer und flexiblerem Problemlöseverhalten (Zimmermann, 2000; Pajares, 1996). Selbstreguliertes Lernen — das zielorientierte Planen, Überwachen und Anpassen eigener Lernprozesse — ist nach aktuellem Forschungsstand einer der stärksten Prädiktoren für domänenübergreifende Lernkompetenz. Ein erhöhter GSE-Wert macht den Einstieg in selbstregulierte Lernprozesse wahrscheinlicher.

**Das schwache Glied — Transfer:** Dass aus GSE-Stärkung und reflektiver Kompetenz automatisch domänenübergreifende Problemlösekompetenz entsteht, ist nicht belegt. Perkins und Salomon (1989) zeigen, dass Lerntransfer nicht automatisch geschieht — er benötigt explizites "Bridging": die bewusste Verbindung zwischen dem Gelernten und neuen Kontexten. Ein sokratischer Begleiter kann diese Brücke anregen, aber nicht garantieren.

### 2.12.3 Die drei Beispielthemen als Kompetenz-Schichten

KAIAs drei Beispiel-Lernthemen (Wertschätzende Kommunikation, KI-Kompetenz, Leadership) repräsentieren drei aufeinander aufbauende Kompetenz-Schichten nach Erpenbeck und Rosenstiel (2007): Kommunikation als primär sozial- und selbstkompetenzbasiertes Thema; KI-Kompetenz als methodisch-fachkompetenzbasiertes Thema; Leadership als Transformation aller Kompetenz-Dimensionen. Das gemeinsame Metaziel — das Bewusstwerden der eigenen Selbststeuerungskompetenz — muss für die Lernenden transparent gemacht werden, damit der Transfer-Effekt sich entfalten kann.

### 2.12.4 Was "Lernen lernen" durch KAIA realistisch bedeutet

Die vertretbare Behauptung lautet: KAIA kann durch sokratische Begleitung episodische Mastery-Erlebnisse erzeugen, die kurzfristig allgemeine Selbstwirksamkeitserwartungen stabilisieren und metakognitive Aufmerksamkeit für eigene Lernprozesse aktivieren. Ob sich daraus domänenübergreifende Problemlösekompetenz entwickelt, ist eine mittelfristige Hypothese, die die vorliegende Pilotstudie (N ≈ 20, 4 Wochen) nicht prüfen kann und nicht beansprucht zu prüfen.

"Lernen lernen" ist damit kein Outcome dieser Studie — es ist die theoretische Vision, die KAIAs Designprinzipien motiviert, und eine Forschungsperspektive für Folgestudien mit längerem Zeithorizont.

---

## 2.13 Session-Architektur V3 und kumulatives Gedächtnis: Theoretische Fundierung

### 2.13.1 Dreigliedrige Sequenzierung nach Bloom

Die Session-Architektur V3 gliedert den Lernprozess in drei didaktisch distinkte Phasen, die der taxonomischen Logik Blooms (Anderson & Krathwohl, 2001) folgen:

**Phase 1 — Erkunden (Sessions 1–2):** Adressiert Bloom-Niveaus 1–2 (Erinnern, Verstehen). Lernende erkunden das selbstgewählte Thema, artikulieren Vorkenntnisse und Zielsetzungen. KAIA arbeitet primär im "warm/Begleitend"-Charakter: aufbauende Fragen, die semantische Anker setzen und das kumulative Gedächtnis für Folgesessions aufbauen. Didaktisch entspricht dies der Activierung-Phase nach Merrill (2002) und den Unterrichtsereignissen 3 (Vorwissen aktivieren) und 6 (Leistung hervorrufen) nach Gagné (1977).

**Phase 2 — Transfer und Analyse (Sessions 3–8):** Adressiert Bloom-Niveaus 3–4 (Anwenden, Analysieren). Die Kernarbeit des Lernprozesses findet hier statt: Konzepte werden auf persönliche Situationen angewendet, Annahmen werden hinterfragt, Verbindungen zwischen Konzepten werden hergestellt. KAIA wechselt zwischen "warm/Begleitend" und "challenging/Konfrontierend". Session 5 ist als obligatorischer Halbzeit-Spiegel konzipiert: KAIA leitet eine strukturierte Reflexion ein, in der Lernende ihre Entwicklung seit Session 1 einschätzen. Dies entspricht Schöns (1983) Konzept der "reflection-on-action" — der bewussten Analyse vergangener Erfahrungen, die metakognitive Regulation schult. Zimmermann (2000) belegt, dass diese Form der mid-process-Überwachung ein zentraler Selbstregulationsmechanismus ist. In der EMA-Logik (Abschnitt 2.6.2) verankert Session 5 damit einen evaluativen Momentaufnahme-Punkt.

**Phase 3 — Synthese (Sessions 9–10):** Adressiert Bloom-Niveaus 5–6 (Bewerten, Erschaffen). Session 10 operationalisiert drei simultane Aufgaben: (a) Gegenüberstellung von Session 1 und der aktuellen Position (longitudinale Reflexion, metakognitive Wachstumsbewertung), (b) Autonomisierungsfrage — explizite Reflexion darüber, welche Erkenntnisse die lernende Person eigenständig weiterentwickeln kann und wird (Zimmermann, 2000; Knowles, 1984), (c) keine GSE-Priming-Instruktion vor der Messung, um Reaktivitätseffekte (demand characteristics) zu minimieren. Diese Triple-Task-Abschlussgestaltung entspricht Gagnés neuntem Unterrichtsereignis (Behalten und Transfer sichern) und Merrills Integrationsprinzip (2002).

### 2.13.2 Kumulatives Gedächtnis: Longitudinales Scaffolding

Das kumulative Gedächtnis (session_summary, strongest_quote, historical_quotes) ist nicht nur eine technische Infrastruktur, sondern eine didaktische Notwendigkeit. Ausubel (1968) hat gezeigt, dass sinnvolles Lernen — meaningful learning — nur stattfindet, wenn neue Informationen an bestehende kognitive Strukturen geknüpft werden können. Ohne explizite Aktivierung des Vorlernens am Anfang jeder Session würde jede Sitzung isoliert bleiben und der Spacing-Effekt (Cepeda et al., 2006) ließe sich nicht entfalten.

Die session_summary und historical_quotes ermöglichen es KAIA, zu Beginn jeder Session semantisch präzise anzuknüpfen — nicht durch wörtliche Wiederholung, sondern durch fragenbasierte Reaktivierung. Der strongest_quote fungiert als Mastery-Marker im Sinne Banduras (1977): die verdichtete Formulierung eines eigenständig erarbeiteten Erkenntnismoments, der als Referenzpunkt für zukünftige Fragen dienen kann. Diese Architektur realisiert longitudinales Scaffolding: die Unterstützung ist nicht in einer Session vollständig, sondern baut sich über die Studiendauer kumulativ auf und faded entsprechend dem Kompetenzfortschritt der lernenden Person.

### 2.13.3 Didaktische Kohärenz der Session-Architektur

Das Berliner Modell (Heimann, Otto & Schulz, 1965) analysiert Unterricht in vier miteinander in Wechselwirkung stehenden Entscheidungsfeldern: Intentionen, Inhalte, Methoden, Medien. Angewandt auf KAIA ergibt sich folgende Analyse: Die Intentionen (GSE-Stärkung, metakognitive Aktivierung) bestimmen die Methode (Sokratik, keine Instruktion); die freie Inhaltswahl (Intentionen der Lernenden) beeinflusst die Methodenausprägung (welcher Charakter); das Medium (LLM-Text-Chat) begrenzt die Bandbreite der Methoden (keine non-verbalen Signale). Diese Wechselwirkungsanalyse zeigt, dass die Session-Architektur didaktisch kohärent ist — Intentionen, Inhalte, Methoden und Medien bilden ein konsistentes Gefüge, das durch die Distributed-Practice-Regel temporal strukturiert wird.

---

## 2.14 Design Science Research als wissenschaftliche Methodologie

Die vorliegende Arbeit ist im Paradigma des Design Science Research (DSR; Hevner, March, Park & Ram, 2004) verankert. DSR ist eine wissenschaftliche Methodik der Wirtschaftsinformatik, die die Entwicklung und Evaluation von IT-Artefakten als legitimen Erkenntnisbeitrag konzipiert. Im Gegensatz zu verhaltenswissenschaftlichen Paradigmen, die gegebene Realitäten erklären und vorhersagen wollen, zielt DSR auf die Gestaltung neuer Realitäten.

Hevner et al. (2004) formulieren sieben Richtlinien für DSR-konformes Forschen, die für KAIA anwendbar sind: Das Artefakt (KAIA) muss einen Beitrag zu einem relevanten Problem leisten; es muss rigoros entwickelt und evaluiert werden; es muss einen wissenschaftlichen Beitrag leisten, der über die Systemimplementierung hinausgeht; die Forschungsmethoden müssen stringent sein; die Forschung muss in bestehende Wissensbasen eingebettet sein; die Artefaktentwicklung ist iterativ; und die Ergebnisse müssen an relevante Stakeholder kommuniziert werden.

Für die vorliegende Studie ergibt sich eine zweistufige Forschungslogik: KAIA wird als Artefakt entwickelt (Kapitel 4), dann in einer explorativen Pilotstudie evaluiert (Kapitel 6), wobei technische Eigenschaften (LLM-Evaluation) und nutzerseitige Wirkungen (GSE-, MSLQ-Veränderung) untersucht werden. Der DSR-Rahmen macht den Conflict of Interest explizit behandlungsbedürftig: Die Forscherin ist gleichzeitig Entwicklerin und potenzielle Kommerzialisiererin. Dieser Aspekt wird im Methodenkapitel durch das Positionality Statement adressiert.

---

## 2.15 Synthetisches Rahmenwerk: Theoretische Begründung von KAIA

Die in den vorangegangenen Abschnitten dargestellten Theorien sind nicht additiv, sondern bilden ein kohärentes theoretisches Rahmenwerk, aus dem sich KAIAs Designentscheidungen unmittelbar ableiten lassen.

**Die Grundlogik:** Lernen ist ein konstruktiver Prozess (Vygotsky, 1978; Piaget, 1952), der von der wahrgenommenen Handlungsfähigkeit der Lernperson abhängt (Bandura, 1977) und nur unter subjektiv als bewältigbar bewerteten Anforderungen gelingt (Lazarus & Folkman, 1984). Optimales Lernen findet in einem Zustand mittlerer Aktivierung statt, der als Flow erlebt wird (Csikszentmihalyi, 1990; Teigen, 1994). Instruktionale Direktheit gefährdet diesen Prozess, weil sie die Entwicklung eigenständiger Problemlösekapazität hemmt (Kalyuga et al., 2003) und intrinsische Motivation korrumpiert (Deci & Ryan, 1985). Erwachsene Lernende erwarten Selbststeuerung (Knowles, 1984) und profitieren von verteilt strukturierten Lernsequenzen (Cepeda et al., 2006). Feedback wirkt dann lernförderlich, wenn es auf Prozess- und Selbstregulationsebene operiert (Hattie & Timperley, 2007).

**Die Ableitung:** KAIA ist als sokratischer Begleiter mit Drei-Charaktere-Architektur konzipiert, weil diese Gestaltung gleichzeitig sechs theoretische Forderungen erfüllt: (1) Sie schützt den konstruktivistischen Lernprozess (keine Antworten); (2) sie stärkt die Selbstwirksamkeit durch Mastery-Erfahrungen (Bandura, 1977); (3) sie verhindert den Expertise Reversal Effect durch instruktionale Zurückhaltung (Kalyuga, 2007); (4) sie respektiert das Autonomiebedürfnis erwachsener Lernender (Knowles, 1984; Deci & Ryan, 2000); (5) sie nutzt den Spacing-Effekt durch die temporale Session-Struktur (Cepeda et al., 2006); (6) sie differenziert Scaffolding-Intensitäten nach kognitivem Zustand der Lernperson (Collins et al., 1989). Der neuroadaptive Modus versucht, den Flow-Kanal zu erhalten, indem der Gesprächscharakter auf Gesprächsindikatoren und EMA-Signale reagiert.

**Die Messung:** Die GSE (Schwarzer & Jerusalem, 1995) misst den globalen motivationalen Outcome (allgemeine Selbstwirksamkeit). Das MSLQ (Pintrich et al., 1991, 1993) misst proximate Mediatoren (Lernmotivation, Elaborationsstrategien). Gemeinsam ermöglichen beide Instrumente eine Analyse, ob sich durch KAIA-Nutzung nicht nur die globale Überzeugung verschiebt, sondern auch die lernstrategischen Mechanismen, über die dieser Effekt vermutlich vermittelt wird.

**Die Hypothesen** der Studie lauten:

- **H1:** Die allgemeine Selbstwirksamkeitserwartung (GSE; Schwarzer & Jerusalem, 1995) ist nach vier Wochen KAIA-Nutzung signifikant höher als vor der Nutzung (gerichtet, Wilcoxon-Vorzeichenrangtest, α = .05).
- **H2:** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit und Veränderung der Selbstwirksamkeitserwartung (ungerichtet, Spearman-Rho).
- **H3:** Lernende mit höherer MSLQ-Elaborationsstrategie zu T1 zeigen stärkere GSE-Veränderungen (explorativ, moderierte Regression).
- **H4:** Die durch LLM-Analyse aus Gesprächstranskripten abgeleiteten Indikatoren für Handlungskontrolle und Problemlösezuversicht konvergieren über die Studienlaufzeit mit den GSE-Selbstaussagen (explorativ).

**Methodische Einschränkung:** Die Pilotstudie ist explorativ konzipiert (N ≈ 20, Power 80% für d = 0.5 bei α = .05). Konfirmatorische Schlüsse sind nicht intendiert. H1 wird als gerichtete Hypothese getestet; H2 bis H4 dienen der Generierung präziserer Hypothesen für Folgestudien.

---

## Literaturverzeichnis

Alexander, R. (2008). *Towards dialogic teaching: Rethinking classroom talk* (4. Aufl.). Dialogos.

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A taxonomy for learning, teaching, and assessing: A revision of Bloom's taxonomy of educational objectives*. Longman.

Ausubel, D. P. (1968). *Educational psychology: A cognitive view*. Holt, Rinehart & Winston.

Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review, 84*(2), 191–215. https://doi.org/10.1037/0033-295X.84.2.191

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Black, P., & Wiliam, D. (1998). Assessment and classroom learning. *Assessment in Education: Principles, Policy & Practice, 5*(1), 7–74. https://doi.org/10.1080/0969595980050102

Bloom, B. S., Engelhart, M. D., Furst, E. J., Hill, W. H., & Krathwohl, D. R. (1956). *Taxonomy of educational objectives: The classification of educational goals. Handbook I: Cognitive domain*. David McKay.

Brown, J. S., & Burton, R. R. (1978). Diagnostic models for procedural bugs in basic mathematical skills. *Cognitive Science, 2*(2), 155–192. https://doi.org/10.1207/s15516709cog0202_4

Bruner, J. S. (1961). The act of discovery. *Harvard Educational Review, 31*(1), 21–32.

Carbonell, J. R. (1970). AI in CAI: An artificial intelligence approach to computer-assisted instruction. *IEEE Transactions on Man-Machine Systems, 11*(4), 190–202.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354

Collins, A., Brown, J. S., & Newman, S. E. (1989). Cognitive apprenticeship: Teaching the crafts of reading, writing, and mathematics. In L. B. Resnick (Hrsg.), *Knowing, learning, and instruction: Essays in honor of Robert Glaser* (S. 453–494). Erlbaum.

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience*. Harper & Row.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100. https://doi.org/10.1177/1534582304267187

Deci, E. L. (1971). Effects of externally mediated rewards on intrinsic motivation. *Journal of Personality and Social Psychology, 18*(1), 105–115. https://doi.org/10.1037/h0030644

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic motivation and self-determination in human behavior*. Plenum.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268. https://doi.org/10.1207/S15327965PLI1104_01

Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest, 14*(1), 4–58. https://doi.org/10.1177/1529100612453266

Dweck, C. S. (1999). *Self-theories: Their role in motivation, personality, and development*. Psychology Press.

Dweck, C. S. (2006). *Mindset: The new psychology of success*. Random House.

Erpenbeck, J., & Rosenstiel, L. v. (Hrsg.). (2007). *Handbuch Kompetenzmessung* (2. Aufl.). Schäffer-Poeschel.

Fairclough, S. H. (2009). Fundamentals of physiological computing. *Interacting with Computers, 21*(1–2), 133–145. https://doi.org/10.1016/j.intcom.2008.10.011

Flavell, J. H. (1979). Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry. *American Psychologist, 34*(10), 906–911. https://doi.org/10.1037/0003-066X.34.10.906

Gagné, R. M. (1965). *The conditions of learning*. Holt, Rinehart & Winston.

Gagné, R. M. (1977). *The conditions of learning* (3. Aufl.). Holt, Rinehart & Winston.

Hattie, J. (2009). *Visible learning: A synthesis of over 800 meta-analyses relating to achievement*. Routledge.

Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. https://doi.org/10.3102/003465430298487

Heimann, P., Otto, G., & Schulz, W. (1965). *Unterricht: Analyse und Planung*. Schroedel.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105. https://doi.org/10.2307/25148625

Jerusalem, M., & Schwarzer, R. (1992). Self-efficacy as a resource factor in stress appraisal processes. In R. Schwarzer (Hrsg.), *Self-efficacy: Thought control of action* (S. 195–213). Hemisphere.

Jerusalem, M., & Schwarzer, R. (1999). Allgemeine Selbstwirksamkeit [Skala]. In R. Schwarzer & M. Jerusalem (Hrsg.), *Skalen zur Erfassung von Lehrer- und Schülermerkmalen* (S. 54–56). Freie Universität Berlin.

Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review, 19*(4), 509–539. https://doi.org/10.1007/s10648-007-9054-3

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31. https://doi.org/10.1207/S15326985EP3801_4

Kasneci, E., Seßler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., & Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences, 103*, 102274. https://doi.org/10.1016/j.lindif.2023.102274

Klafki, W. (1958). Didaktische Analyse als Kern der Unterrichtsvorbereitung. *Die Deutsche Schule, 50*(10), 450–471.

Klafki, W. (1985). *Neue Studien zur Bildungstheorie und Didaktik*. Beltz.

Knowles, M. S. (1980). *The modern practice of adult education: From pedagogy to andragogy* (2. Aufl.). Cambridge.

Knowles, M. S. (1984). *The adult learner: A neglected species* (3. Aufl.). Gulf.

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology, 44*(1), 1–21. https://doi.org/10.1146/annurev.ps.44.020193.000245

Lazarus, R. S., & Folkman, S. (1984). *Stress, appraisal, and coping*. Springer.

Lepper, M. R., Greene, D., & Nisbett, R. E. (1973). Undermining children's intrinsic interest with extrinsic reward: A test of the "overjustification" hypothesis. *Journal of Personality and Social Psychology, 28*(1), 129–137. https://doi.org/10.1037/h0035519

Merrill, M. D. (2002). First principles of instruction. *Educational Technology Research and Development, 50*(3), 43–59. https://doi.org/10.1007/BF02505024

Multon, K. D., Brown, S. D., & Lent, R. W. (1991). Relation of self-efficacy beliefs to academic outcomes: A meta-analytic investigation. *Journal of Counseling Psychology, 38*(1), 30–38. https://doi.org/10.1037/0022-0167.38.1.30

Oliveira, W., & Hamari, J. (2024). Flow states in digital learning environments: A systematic review. *Computers & Education, 192*, 104650. https://doi.org/10.1016/j.compedu.2022.104650

Pajares, F. (1996). Self-efficacy beliefs in academic settings. *Review of Educational Research, 66*(4), 543–578. https://doi.org/10.3102/00346543066004543

Perkins, D. N., & Salomon, G. (1989). Are cognitive skills context-bound? *Educational Researcher, 18*(1), 16–25. https://doi.org/10.3102/0013189X018001016

Piaget, J. (1952). *The origins of intelligence in children*. International Universities Press.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)*. National Center for Research to Improve Postsecondary Teaching and Learning. (ERIC Document Reproduction Service No. ED338122)

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement, 53*(3), 801–813. https://doi.org/10.1177/0013164493053003024

Schön, D. A. (1983). *The reflective practitioner: How professionals think in action*. Basic Books.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4*, 1–32. https://doi.org/10.1146/annurev.clinpsy.3.022806.091415

Stöber, J. (1999). Die Soziale-Erwünschtheits-Skala-17 (SES-17): Entwicklung und erste Befunde zu Reliabilität und Validität. *Diagnostica, 45*(4), 173–177.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4

Sweller, J., van Merriënboer, J. J. G., & Paas, F. G. W. C. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296. https://doi.org/10.1023/A:1022193728205

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547. https://doi.org/10.1177/0959354394044004

Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573. https://doi.org/10.1037/0033-295X.92.4.548

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100. https://doi.org/10.1111/j.1469-7610.1976.tb00381.x

Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482. https://doi.org/10.1002/cne.920180503

Zimmermann, B. J. (2000). Attaining self-regulation: A social cognitive perspective. In M. Boekaerts, P. R. Pintrich, & M. Zeidner (Hrsg.), *Handbook of self-regulation* (S. 13–39). Academic Press.
