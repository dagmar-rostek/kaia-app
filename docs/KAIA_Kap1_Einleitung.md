# 1 Einleitung

## 1.1 Problemstellung und wissenschaftliche Relevanz

Generative Sprachmodelle erweitern die Möglichkeiten digitaler
Lernbegleitung, weil sie offene Dialoge verarbeiten und Antworten
kontextbezogen erzeugen können. Für Lernanwendungen entsteht daraus
jedoch nicht automatisch ein lernförderliches System. Ein Sprachmodell
kann Aufgaben erklären, Lösungen formulieren oder nächste Schritte
vorgeben und damit kurzfristig Unterstützung leisten. Dieselbe
Unterstützung kann jedoch den kognitiven Eigenanteil der lernenden
Person reduzieren, wenn das System dauerhaft die Strukturierung,
Bewertung und Lösungsbildung übernimmt. Für eine Lernbegleitung, die
Selbstregulation unterstützen soll, besteht deshalb ein
Gestaltungsproblem zwischen hilfreicher Adaptation und dem Erhalt
eigener kognitiver Aktivität. Die Forschung zu selbstreguliertem Lernen
hebt die aktive Steuerung eigener Lernprozesse hervor, während Arbeiten
zur Selbstwirksamkeit die Bedeutung wahrgenommener eigener
Bewältigungsfähigkeit für zielgerichtetes Handeln beschreiben (Bandura,
1997; Pintrich, 2004).

Für das vorliegende Forschungsproblem reicht es daher nicht aus, einen
allgemein leistungsfähigen Chatbot bereitzustellen. Erforderlich ist
eine Gesprächslogik, die Unterstützung an die konkrete Interaktion
anpasst und zugleich vermeidet, die zentrale Denkleistung systematisch
zu übernehmen. Scaffolding beschreibt Unterstützung, die an den
aktuellen Bedarf angepasst und mit wachsender Selbstständigkeit
zurückgenommen wird (Wood et al., 1976). Für sprachmodellbasierte
Systeme stellt sich zusätzlich die Frage, wie eine solche Anpassung
erfolgen kann, wenn keine validierte psychologische Diagnostik und keine
physiologische Zustandserfassung vorliegen. Das in dieser Arbeit
entwickelte Forschungsartefakt nutzt deshalb ausschließlich textbasierte
Gesprächssignale als heuristische Adaptionsgrundlage. Hinweise auf
mögliche Frustration, Unsicherheit oder positive Aktivierung können die
Auswahl der Gesprächsstrategie beeinflussen. Aus diesen Signalen wird
jedoch kein Anspruch auf eine valide Messung emotionaler oder
psychologischer Zustände abgeleitet.

Der im festgelegten Titel verwendete Begriff der neuroadaptiven
Lernbegleitung ist vor diesem Hintergrund eng zu operationalisieren. In
der Forschung zu physiologischem Computing bezeichnet Adaptation
typischerweise Systeme, die physiologische oder psychophysiologische
Informationen zur laufenden Systemanpassung verwenden (Fairclough,
2009). Das hier untersuchte Forschungsartefakt erhebt weder neuronale
Aktivität noch physiologische Messgrößen. Neuroadaptivität bezeichnet in
dieser Arbeit daher die konzeptionelle Orientierung an einer
zustandsabhängigen Lernbegleitung. Ihre technische Umsetzung erfolgt
ausschließlich über textbasierte Adaptionssignale und darf nicht mit
neurophysiologischer Zustandserfassung gleichgesetzt werden. Diese
begriffliche Begrenzung ist für die Interpretation des Systems
wesentlich.

Ein zweites Gestaltungsproblem betrifft empathisches Systemverhalten.
Empathie bezeichnet beim Menschen ein mehrdimensionales psychologisches
Konstrukt, das nicht ohne Weiteres auf technische Systeme übertragen
werden kann (Decety & Jackson, 2004). Für den Agenten wird Empathie
deshalb nicht als subjektives Erleben verstanden. Gemeint ist
beobachtbares Gesprächsverhalten, das Äußerungen der lernenden Person
kontextsensitiv aufgreift und Tonalität sowie Unterstützungsintensität
anpasst. Damit verbindet die Arbeit adaptive Gesprächsführung,
sokratische Unterstützung und persistente Personalisierung zu einem
Forschungsartefakt. Die wissenschaftliche Aufgabe besteht nicht darin,
die Überlegenheit einer solchen Architektur vorauszusetzen, sondern ihre
Designentscheidungen theoretisch zu begründen, technisch zu
operationalisieren und ihr Verhalten systematisch zu evaluieren.

Die Forschungslücke wird entsprechend nicht über die pauschale
Behauptung begründet, vergleichbare Systeme seien bislang nicht
untersucht worden. Kapitel 2 zeigt vielmehr, dass Ansätze zu
Selbstwirksamkeit, Selbstregulation, Scaffolding, adaptiver
Unterstützung und empathischem Systemverhalten unterschiedliche
Teilprobleme adressieren, deren Verbindung für das konkrete
Forschungsproblem operationalisiert werden muss. Der wissenschaftliche
Beitrag der Arbeit liegt deshalb auf drei Ebenen. Erstens werden diese
Anforderungen in eine dokumentierte Artefaktlogik für einen sokratisch
und situationsabhängig adaptierenden LLM Agenten übersetzt. Zweitens
werden technische und dialogbezogene Artefaktkriterien getrennt von
psychologischen Outcomes evaluiert. Drittens ergänzt eine explorative
Pilotstudie die Artefaktevaluation um reale Nutzungsdaten und eine Prä
Post Untersuchung der allgemeinen Selbstwirksamkeitserwartung. Die
Arbeit verbindet damit Designwissen, technische Verhaltensprüfung und
begrenzte empirische Evidenz, ohne aus einer dieser Ebenen allein einen
Wirksamkeitsnachweis abzuleiten.

## 1.2 Zielsetzung und Forschungsfragen

Ziel der Arbeit ist die theoriegeleitete Konzeption, prototypische
Entwicklung und Evaluation eines empathisch und adaptiv gestalteten LLM
basierten Agenten für die individuelle Lernbegleitung. Das
Forschungsartefakt soll Unterstützung nicht primär durch direkte
Lösungsproduktion leisten, sondern durch eine sokratisch orientierte
Gesprächsführung, situationsabhängige Anpassung und
sitzungsübergreifende Kontextnutzung. Die Entwicklung folgt dabei keinem
Anspruch auf eine bereits validierte Gesamtarchitektur. Vielmehr werden
theoretische Anforderungen in konkrete Designentscheidungen überführt
und anschließend auf ihre technische und dialogbezogene Umsetzung
geprüft.

Die übergeordnete Forschungsfrage lautet, wie ein LLM basierter Agent
für die individuelle Lernbegleitung so gestaltet und technisch evaluiert
werden kann, dass er adaptive und sokratische Unterstützung ermöglicht,
und welche explorativen Hinweise sich aus seiner Nutzung für
Veränderungen der allgemeinen Selbstwirksamkeitserwartung ergeben.

Zur Bearbeitung dieser Frage werden drei Teilforschungsfragen
unterschieden. FF1 untersucht, wie theoretisch begründete Anforderungen
an Selbstregulation, adaptive Unterstützung, sokratische
Gesprächsführung und empathisches Systemverhalten in ein LLM basiertes
Forschungsartefakt übersetzt werden können. FF2 untersucht, in welchem
Umfang das implementierte System die definierten Kriterien der
technischen und dialogbezogenen Artefaktevaluation erfüllt. FF3
untersucht, welche Veränderungen der allgemeinen
Selbstwirksamkeitserwartung innerhalb der explorativen Pilotstichprobe
zwischen Prä und Post Messung beobachtet werden.

Die drei Fragen besitzen unterschiedliche Erkenntnisansprüche. FF1
richtet sich auf die Konstruktion und Begründung des Artefakts. FF2
betrifft die spezifizierte Funktionsweise des implementierten Systems.
FF3 betrifft die empirische Beobachtung innerhalb einer kleinen
Pilotstichprobe. Aus FF3 wird in Kapitel 2 eine gerichtete
Forschungsannahme zur Veränderung des GSE Gesamtscores abgeleitet.
Aufgrund des einarmigen Prä Post Designs erlaubt eine beobachtete
Veränderung jedoch keine eindeutige kausale Zuschreibung zum Agenten.

## 1.3 Abgrenzung der Untersuchung

Die Arbeit untersucht einen Forschungsprototyp für individuelle
Lernbegleitung und kein therapeutisches, diagnostisches oder klinisches
System. Textbasierte Gesprächssignale werden als heuristische Hinweise
für die Auswahl einer Gesprächsstrategie verwendet. Sie sind keine
validierten Messungen von Emotion, Stress, Persönlichkeit oder anderen
psychologischen Zuständen. Entsprechend werden weder psychologische
Diagnosen gestellt noch Aussagen über neuronale Zustände der Nutzenden
getroffen.

Auch die empirische Reichweite ist begrenzt. Die Pilotstudie untersucht
die allgemeine Selbstwirksamkeitserwartung mit der GSE als primäres
quantitatives Outcome. Problemlösekompetenz, Handlungskontrolle, Flow
und metakognitive Regulation werden nicht als eigenständige validierte
Outcomes geprüft. Das ursprünglich im Exposé vorgesehene
Abschlussinterview und die sitzungsspezifische Selbstberichtsmessung für
eine zweite Forschungsannahme wurden im finalen Erhebungsdesign nicht
umgesetzt. Diese Planabweichungen werden in Kapitel 4 transparent
dokumentiert und nicht durch nachträgliche Ersatzoperationalisierungen
verdeckt.

Das Studiendesign umfasst keine Kontrollgruppe und ist nicht als
konfirmatorischer Wirksamkeitsnachweis angelegt. Veränderungen zwischen
Prä und Post Messung können daher neben der Nutzung des Agenten auch
durch Zeit, Wiederholungsmessung, Erwartungen, parallele Erfahrungen
oder andere nicht kontrollierte Einflüsse erklärt werden. Die Ergebnisse
werden entsprechend als explorative Evidenz innerhalb der untersuchten
Stichprobe interpretiert. Eine Generalisierung auf andere Populationen
oder ein Nachweis langfristiger Transferwirkungen ist nicht Gegenstand
der Untersuchung.

Die rechtliche und ethische Gestaltung wird als Bestandteil der
Artefaktentwicklung berücksichtigt. Die Arbeit beansprucht jedoch keine
formale Zertifizierung vollständiger Rechtskonformität.
Datenschutzrechtliche und regulatorische Anforderungen werden in
Designentscheidungen übersetzt und deren Umsetzung soweit dokumentierbar
geprüft. Festgestellte Abweichungen werden als Limitationen der
prototypischen Implementierung ausgewiesen.

## 1.4 Forschungslogik und Aufbau der Arbeit

Die Arbeit folgt einer Design Science Forschungslogik, in der die
Entwicklung und Evaluation eines Artefakts miteinander verbunden werden
(Hevner et al., 2004; Hevner, 2007). Kapitel 2 entwickelt die
theoretischen Grundlagen und grenzt die zentralen Konstrukte voneinander
ab. Daraus werden Anforderungen an adaptive Unterstützung,
Selbstregulation, empathisches Systemverhalten und die empirische
Untersuchung der Selbstwirksamkeit abgeleitet. Kapitel 3 übersetzt diese
Anforderungen in die Konzeption des Forschungsartefakts. Beschrieben
werden insbesondere Architektur, textbasierte Adaptionssignale,
sokratische Gesprächslogik, persistente Personalisierung und Compliance
Design.

Kapitel 4 beschreibt das methodische Vorgehen. Es trennt die Design
Science Entwicklung von der technischen und dialogbezogenen Evaluation
sowie von der explorativen Pilotstudie. Die technische Evaluation prüft
das System anhand synthetischer Personas und projektspezifischer
Kriterien. Die Pilotstudie untersucht reale Nutzungsdaten und die
Veränderung der allgemeinen Selbstwirksamkeitserwartung zwischen Prä und
Post Messung. Kapitel 5 berichtet die Ergebnisse dieser
Evaluationsstränge getrennt. Kapitel 6 interpretiert die Befunde im
Verhältnis zu den Forschungsfragen und diskutiert alternative
Erklärungen, methodische Grenzen und Implikationen. Kapitel 7 fasst den
Beitrag der Arbeit zusammen und leitet den weiteren Forschungsbedarf ab.
