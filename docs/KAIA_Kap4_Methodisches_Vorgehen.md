# 4 Methodisches Vorgehen

Kapitel 4 beschreibt die methodische Umsetzung der Forschungsfragen.
Design Science Research bildet den Rahmen für Konstruktion und
Evaluation des Artefakts. Darauf aufbauend werden die Entwicklung des
Prototyps, die Evaluation des Sprachmodellverhaltens, das Studiendesign,
die Datenerhebung und die Auswertungsverfahren dokumentiert. Technische
Artefaktevaluation und empirische Untersuchung der Teilnehmendendaten
werden dabei als unterschiedliche Evidenzebenen behandelt.

## 4.1 Design Science Research als methodischer Rahmen

### 4.1.1 Begründung der Methodenwahl

Die Entwicklung des Forschungsprototyps folgt Design Science Research.
Dieses Forschungsparadigma verbindet die Konstruktion zweckgerichteter
Artefakte mit ihrer systematischen Evaluation und der Gewinnung
übertragbaren Gestaltungswissens (Hevner et al., 2004). Für die
vorliegende Arbeit ist der Ansatz geeignet, weil nicht nur ein
bestehendes Phänomen beschrieben wird. Ein technisches und dialogisches
Artefakt wird auf Grundlage theoretischer und regulatorischer
Anforderungen entworfen, implementiert und anschließend auf mehreren
Ebenen geprüft.

Die Wahl von Design Science Research ersetzt keine empirische
Wirkungsprüfung. Sie strukturiert vielmehr die Entwicklung und
Evaluation des Artefakts. Die Pilotstudie liefert ergänzende empirische
Evidenz über Nutzung und Veränderungen innerhalb der untersuchten
Stichprobe. Aufgrund des einarmigen Prä Post Designs kann sie keine
kausale Wirksamkeit des Agenten nachweisen. Damit werden
Artefaktevaluation und Outcome Evaluation methodisch getrennt.

Der wissenschaftliche Beitrag liegt folglich nicht allein im
funktionsfähigen Prototyp. Nach Gregor und Hevner (2013) kann Design
Science Research Wissen auf unterschiedlichen Abstraktionsebenen
hervorbringen. Für diese Arbeit sind insbesondere die dokumentierten
Gestaltungsentscheidungen, ihre Begründung, die spezifizierte
Gesprächslogik und die Evaluationsverfahren als potenziell übertragbares
Gestaltungswissen relevant. Ob einzelne Entscheidungen über den
konkreten Prototyp hinaus tragfähig sind, wird jedoch nicht
vorausgesetzt, sondern anhand ihrer Begründung und Evaluation
diskutiert.

### 4.1.2 Einordnung in das Dreizyklus Modell

Hevner (2007) beschreibt Design Science Research durch drei miteinander
verbundene Zyklen. Der Relevance Cycle verbindet die Forschung mit dem
Anwendungskontext und führt Anforderungen aus der Problemumgebung in den
Entwicklungsprozess ein. In dieser Arbeit umfasst dies den Bedarf an
einer lernbezogenen Gesprächsbegleitung, die Eigenaktivität erhält,
Unterstützung adaptiv dosiert und unter den definierten Datenschutz und
Transparenzanforderungen betrieben werden kann.

Der Rigor Cycle verbindet die Entwicklung mit der bestehenden
Wissensbasis. Kapitel 2 stellt dafür die relevanten theoretischen und
empirischen Grundlagen bereit. Dazu gehören Selbstwirksamkeit,
Selbstregulation, Scaffolding, kognitive Belastung, Implementation
Intentions und die begrenzte Nutzung sprachlicher Hinweise für
Adaptation. Der Rigor Cycle bedeutet dabei nicht, dass jede technische
Entscheidung unmittelbar aus einer Theorie folgt. Er verlangt vielmehr,
vorhandenes Wissen dort zu nutzen, wo es die Problemdefinition,
Gestaltungsanforderungen oder Evaluation begründen kann.

Der Design Cycle umfasst die iterative Konstruktion und Prüfung des
Artefakts. Anforderungen aus Kapitel 3 werden in technische und
dialogische Funktionen übersetzt, getestet und bei identifizierten
Abweichungen überarbeitet. Die nachfolgenden Abschnitte dokumentieren
diese Iterationen sowie die Verfahren, mit denen Systemverhalten und
Studienbetrieb geprüft werden. Die drei Zyklen sind analytische
Perspektiven auf denselben Forschungsprozess und keine strikt
nacheinander ablaufenden Projektphasen.

### 4.1.3 Entwicklungsiterationen

Die Entwicklung wurde in drei übergeordneten Iterationen dokumentiert.
Die erste Iteration umfasste die technische Grundfunktion mit
Authentifizierung, Einwilligungsprozess, Sitzungsverwaltung,
Modellanbindung und persistenter Speicherung. Ziel dieser Phase war ein
technisch nutzbarer Prototyp, auf dem die dialogischen Funktionen
kontrolliert entwickelt werden konnten. Architekturentscheidungen und
technische Details werden im Anhang dokumentiert, soweit sie für
Nachvollziehbarkeit und Reproduktion der Studienkonfiguration
erforderlich sind.

Die zweite Iteration konzentrierte sich auf Gesprächslogik und
Promptentwicklung. Die in Kapitel 3 spezifizierten Modi, Fragetypen,
Sitzungsfunktionen und Begrenzungen wurden in versionierte
Promptkomponenten übersetzt. Beobachtete Fehlverhalten führten zu
gezielten Revisionen. Dazu gehörte insbesondere eine wiederholte
Präferenz für Fragen zum nächsten Handlungsschritt, die die gewünschte
Variation der Gesprächsführung einschränkte. Die einzelnen
Promptversionen und die Kriterien ihrer Überarbeitung werden in
Abschnitt 4.2 dokumentiert.

Die dritte Iteration fokussierte die systematische Evaluation und die
Stabilisierung der Studienkonfiguration. Hierzu wurden definierte
Testszenarien, simulierte Nutzerprofile und ein Bewertungsverfahren für
Modellantworten eingesetzt. Sicherheitskritische oder methodisch
relevante Abweichungen wurden vor Beginn der Pilotstudie bearbeitet.
Anschließend wurde die für die Studie verwendete Kombination aus Modell,
Promptversion und Systemregeln fixiert. Diese Fixierung verbessert die
Vergleichbarkeit der Nutzungsbedingungen, erzeugt jedoch keine
vollständige Reproduzierbarkeit stochastischer Modellausgaben.

### 4.1.4 Evaluation als Bestandteil des Designprozesses

Die Qualität eines dialogischen Sprachmodells lässt sich nicht durch
einen einzelnen Korrektheitstest bestimmen. Anforderungen wie
sokratische Gesprächsführung, angemessene Unterstützung, Autonomieerhalt
und Reaktion auf Krisentestfälle müssen zunächst in beobachtbare
Bewertungskriterien übersetzt werden. Die Evaluation ist deshalb selbst
Bestandteil der Artefaktentwicklung. Diese Notwendigkeit rechtfertigt
jedoch nicht, subjektive Eindrücke der Entwicklerin als hinreichende
Evidenz zu behandeln.

In frühen Entwicklungsphasen wurden eigene Interaktionen mit dem
Prototyp genutzt, um Fehlermuster zu identifizieren und Promptrevisionen
anzustoßen. Dieses Vorgehen besitzt ein offensichtliches Risiko für
Confirmation Bias und eine Anpassung an die Kommunikationsweise der
Entwicklerin. Die später eingesetzten simulierten Nutzerprofile und
standardisierten Bewertungsrubriken erweitern die Testbedingungen und
reduzieren diese Abhängigkeit. Sie beseitigen sie nicht vollständig,
insbesondere wenn Entwicklung, Goldstandardannotation und Bewertung
teilweise von derselben Forscherin verantwortet werden.

Die methodische Absicherung folgt deshalb einer abgestuften
Evidenzlogik. Technische Tests prüfen deterministische Systemfunktionen.
Standardisierte Dialogtests prüfen, ob Modellantworten definierte
Verhaltenskriterien erfüllen. Die Pilotstudie untersucht anschließend
das Artefakt unter realen Nutzungsbedingungen und erhebt explorative
Outcome Daten. Keine dieser Ebenen ersetzt die jeweils andere.
Insbesondere ist die Übereinstimmung mit einer Bewertungsrubrik kein
Nachweis psychologischer Wirksamkeit. Die fehlende unabhängige
Zweitannotation des manuellen Validierungssets bleibt dabei eine
methodische Limitation und wird in der Diskussion erneut berücksichtigt.

Der Einsatz KI gestützter Entwicklungswerkzeuge und spezialisierter
virtueller Rollen wird nicht als unabhängige Qualitätssicherung
behandelt. Solche Werkzeuge können Entwicklung, Dokumentation und
interne Gegenprüfung unterstützen, bleiben aber Teil des von der
Forscherin verantworteten Entwicklungsprozesses. Ihre Nutzung wird
transparent offengelegt und im Anhang dokumentiert. Für die
wissenschaftliche Belastbarkeit entscheidend sind die nachvollziehbaren
Anforderungen, Versionen, Testverfahren und empirischen Daten und nicht
die Anzahl eingesetzter virtueller Rollen.

## 4.2 Prototypentwicklung

### 4.2.1 Evaluation des Sprachmodellverhaltens

Die Evaluation des Sprachmodellverhaltens prüft, in welchem Ausmaß
Modellantworten die in Kapitel 3 spezifizierten Gesprächsanforderungen
unter standardisierten Testszenarien erfüllen. Sie bildet damit die
technische und dialogbezogene Artefaktevaluation. Psychologische
Outcomes werden getrennt in der Pilotstudie untersucht.

Für die automatisierte Belastungsprüfung werden zehn synthetische
Nutzerprofile eingesetzt, die unterschiedliche und teilweise gezielt
schwierige Gesprächsverläufe erzeugen. Dazu gehören knappe Antworten,
Umsetzungsblockaden, Ablehnung der Gesprächsmethode, Versuche zur
Manipulation der Systeminstruktion und ein vorab definierter
Krisenverlauf. Die Profile sind Testfälle und keine empirisch
validierten Repräsentationen realer Lernendentypen. Ihre Funktion
besteht darin, wiederholbare Situationen zu erzeugen, in denen
spezifizierte Systemanforderungen gezielt geprüft werden können.

Die Nutzeräußerungen der simulierten Dialoge werden durch ein separates
Sprachmodell erzeugt. Anschließend bewertet ein weiteres Sprachmodell
die Antworten des zu prüfenden Agenten anhand spezifizierter Rubriken.
LLM gestützte Bewertung kann offene Modellausgaben skalierbar
beurteilen, weist jedoch bekannte Verzerrungsrisiken auf. Dazu gehören
unter anderem Präferenzen für bestimmte Antwortformen und mögliche
Vorteile für Ausgaben aus derselben Modellfamilie (Zheng et al., 2023).
Der automatische Judge wird deshalb als Messverfahren innerhalb der
technischen Evaluation behandelt und nicht als objektiver
Referenzstandard.

Die Bewertungsrubrik umfasst sieben projektspezifische Kriterien. M1
prüft, ob die Antwort die vorgesehene sokratische Zurückhaltung einhält.
M2 bewertet die Einhaltung der jeweiligen Sitzungsaufgabe. M3 erfasst,
ob relevante Signale aus der simulierten Nutzeräußerung in der Antwort
berücksichtigt werden. M4 bewertet die Anschlussfähigkeit und kognitive
Anforderung der erzeugten Frage. M5 prüft die Kohärenz mit
vorausgehenden Gesprächsinhalten. M6 bewertet, ob die kognitive Synthese
bei der lernenden Person verbleibt. M7 prüft für definierte
Krisentestfälle die spezifizierte Schutzreaktion. Eine in einer früheren
Thesisfassung beschriebene Metrik M8 war im Evaluationscode nicht
implementiert und wurde nicht ausgewertet.

Die Kriterien M1 bis M7 operationalisieren die projektspezifischen
Anforderungen des Forschungsartefakts als beobachtbare Antwortmerkmale.
Sokratische Zurückhaltung, Responsivität und Autonomieerhalt sind in
diesem Evaluationskontext daher durch die jeweilige Rubrik definiert. M3
bewertet beispielsweise die Reaktion auf relevante Signale der
simulierten Nutzeräußerung und ist kein eigenständiges psychometrisches
Empathiemaß.

Die Bewertung erfolgt auf einer vierstufigen ordinalen Skala von null
bis drei. Null bezeichnet eine Nichterfüllung des jeweiligen Kriteriums,
eins eine teilweise Erfüllung, zwei eine überwiegende Erfüllung und drei
eine vollständige Erfüllung nach der jeweiligen Rubrik. Niedrige
Bewertungen werden als Entwicklungsflags verwendet. Die Schwellen sind
damit technische Prüfkriterien und keine psychometrischen Grenzwerte.

Vor der Verwendung des automatischen Judges wurden 35 gezielt
konstruierte Referenzfälle mit jeweils fünf Fällen für die Metriken M1
bis M7 erstellt. Jeder Referenzfall enthält einen erwarteten Score und
eine explizite Bewertungsbegründung. Die Erstellung erfolgte im
strukturierten Dialog zwischen der Forscherin und dem KI gestützten
Entwicklungswerkzeug Claude Code. Die Bewertungskriterien sowie die
final verwendeten Referenzscores wurden von der Forscherin festgelegt
und inhaltlich verantwortet. Eine unabhängige zweite menschliche
Annotation und eine verblindete Teilstichprobe lagen nicht vor. Der
Vergleich prüft damit die Übereinstimmung des LLM Judges mit dem
projektspezifischen Referenzset und stellt keine unabhängige externe
Validierung dar.

Da die Ratings geordnete Kategorien von null bis drei darstellen, ist
bei der Reliabilitätsanalyse zwischen exakter Übereinstimmung und dem
Ausmaß einer Abweichung zu unterscheiden. Ein ungewichtetes Cohen Kappa
behandelt eine Abweichung um eine Stufe ebenso wie eine Abweichung um
drei Stufen. Für ordinale Kategorien ist deshalb ein gewichtetes Kappa
methodisch angemessener, sofern die Gewichtung vor der
Ergebnisinterpretation festgelegt und dokumentiert wird. Zusätzlich
werden die beobachtete exakte Übereinstimmung und die Verteilung der
Abweichungen berichtet, damit die Reliabilität nicht durch einen
einzelnen Koeffizienten beschrieben wird.

Der ursprünglich verwendete Schwellenwert von Kappa größer oder gleich
0,60 wird nicht als allgemein gültiges Validitätskriterium
interpretiert. Die häufig zitierte Einteilung nach Landis und Koch
(1977) bezeichnet Werte oberhalb von 0,60 als substantielle
Übereinstimmung. Solche Kategorien sind jedoch heuristische Benchmarks
und keine universell begründeten Grenzwerte. Der Schwellenwert wird
daher ausschließlich als vorab definierte interne Freigaberegel des
Entwicklungsprozesses dokumentiert.

Die automatisierte Evaluation umfasst wiederholte Dialoge über die
vorgesehenen Sitzungen. Die Kriterien M1 bis M6 werden für zehn
synthetische Personas über zehn Sitzungen geprüft. Daraus ergeben sich
600 reguläre Judge Bewertungen. M7 wird ausschließlich für die
Krisenpersona P04 ab Sitzung 5 angewendet und erzeugt sechs zusätzliche
Bewertungen. Ein vollständiger Evaluationszyklus umfasst damit 606 Judge
Bewertungen.

Modellvergleiche werden unter identischen Promptversionen, Testszenarien
und Bewertungsrubriken durchgeführt. Unterschiede der aggregierten
Scores beschreiben damit die Leistung der getesteten
Modellkonfigurationen innerhalb dieses Evaluationssystems. Sie
rechtfertigen keine allgemeine Rangordnung der Sprachmodelle.
Insbesondere Ergebnisse aus einzelnen besonders schwierigen Profilen
werden als Stresstestbefunde und nicht als Evidenz genereller
Modellüberlegenheit interpretiert.

Die Auswahl des Produktionsmodells berücksichtigt neben den
Evaluationswerten auch technische Bedingungen des Studienbetriebs wie
Antwortlatenz, Verfügbarkeit und die Einbindung in die dokumentierte
Datenschutzkonfiguration. Solche Kriterien sind für die Auswahl einer
Studienkonfiguration relevant, aber von der Qualität der
Gesprächsantworten analytisch zu trennen. Die für die Pilotstudie
verwendete Kombination aus Modell, Promptversion und Systemregeln wird
vor Beginn der Datenerhebung fixiert und im Studienprotokoll
dokumentiert.

Die Ergebnisse der Evaluationsläufe, einschließlich einzelner
Metrikwerte, Modellunterschiede und identifizierter Fehlermuster,
gehören in Kapitel 5. Abschnitt 4.2.1 beschreibt ausschließlich
Testdesign, Bewertungslogik und Validierungsverfahren. Damit wird
verhindert, dass Methodenbeschreibung und Ergebnisinterpretation
vermischt werden.

### 4.2.2 Prompt Design und Operationalisierung der Gesprächslogik

Der Systemprompt ist ein zentraler Bestandteil des Forschungsartefakts.
Er übersetzt die in Kapitel 3 spezifizierten Gesprächsregeln in
Instruktionen für das Sprachmodell. Dazu gehören Rollenbeschreibung,
Grenzen der Unterstützung, sitzungsspezifische Aufgaben, zulässige und
unerwünschte Antwortformen sowie die Einbindung ausgewählter
Kontextinformationen. Prompt Design wird in dieser Arbeit deshalb als
Entwicklungs und Operationalisierungsverfahren innerhalb des Design
Science Research behandelt. Es ist keine eigenständige
Forschungsmethode.

Die Promptentwicklung folgt dem in Abschnitt 4.1 beschriebenen
iterativen Designprozess. Beobachtete Abweichungen zwischen
spezifiziertem und erzeugtem Verhalten werden dokumentiert, einer
möglichen Ursache zugeordnet und durch gezielte Änderungen an den
Instruktionen bearbeitet. Anschließend wird die geänderte Version erneut
unter standardisierten Testszenarien geprüft. Die Revisionen dienen
damit der schrittweisen Annäherung des Systemverhaltens an die zuvor
definierten Anforderungen. Sie dürfen nicht nachträglich als Bestätigung
der theoretischen Wirkungsannahmen interpretiert werden.

Alle für die Studienkonfiguration relevanten Promptversionen werden mit
Versionskennung und Änderungszeitpunkt dokumentiert. Diese Versionierung
verbessert die Nachvollziehbarkeit des Entwicklungsverlaufs und
ermöglicht die Zuordnung von Evaluationsergebnissen zu einer konkreten
Instruktionsfassung. Sie erzeugt jedoch keine vollständige
Reproduzierbarkeit, da Modellausgaben trotz identischer Instruktionen
stochastisch variieren können und anbieterseitige Modelländerungen nicht
vollständig kontrollierbar sind.

Der Systemprompt ist modular aufgebaut. Ein stabiler Basisteil definiert
Rolle, Kernauftrag und allgemeine Gesprächsgrenzen. Ein
sitzungsspezifischer Teil enthält die für die jeweilige Sitzung
vorgesehene Gesprächsfunktion. Ein Kontextteil stellt nur die für die
aktuelle Interaktion vorgesehenen Informationen aus Ausgangskontext und
Gedächtnis bereit. Zusätzlich können Steuerungsinformationen aus der in
Kapitel 3 beschriebenen Adaptionslogik eingebunden werden. Diese
funktionale Trennung soll Änderungen lokalisierbar machen und
verhindert, dass sämtliche Anforderungen in einem undifferenzierten
Instruktionsblock zusammengeführt werden.

Das Missionsframework für die zehn Sitzungen ist als feste
projektspezifische Instruktionsstruktur implementiert. Es legt fest,
welche Gesprächsfunktion in einer Sitzung priorisiert wird und welche
Fragetypen bevorzugt oder begrenzt werden. Wie in Abschnitt 3.4
begründet, ist weder die Zahl von zehn Sitzungen noch die konkrete
Progression als empirisch validierte Lernsequenz zu verstehen. Der
Prompt operationalisiert eine Designentscheidung des Prototyps. Die
Evaluation prüft deshalb die Einhaltung dieser Spezifikation und nicht
die Gültigkeit einer allgemeinen zehnstufigen Lerntheorie.

Auch die sechs verwendeten Fragetypen werden im Prompt als
projektspezifische Kategorien behandelt. Ihre Definitionen müssen so
konkret sein, dass erzeugte Antworten anhand beobachtbarer Merkmale den
Kategorien zugeordnet werden können. Eine bloße Benennung eines
Fragetypus im Prompt reicht dafür nicht aus. Für die technische
Evaluation sind deshalb insbesondere Form, Funktion und unerwünschte
Gegenbeispiele der jeweiligen Kategorie zu dokumentieren. Die
vollständigen Promptdefinitionen und Beispiele werden im Anhang
bereitgestellt, während der Haupttext nur die für das Verständnis der
Methode erforderliche Struktur beschreibt.

Die Promptregeln enthalten außerdem Begrenzungen für unerwünschtes
Verhalten. Dazu gehören vorschnelle Lösungsvorgaben, unbegründete
personenbezogene Zuschreibungen, therapeutische Rollenübernahme und die
Missachtung definierter Krisenregeln. Die Evaluation in Abschnitt 4.2.1
prüft, ob diese spezifizierten Regeln im beobachteten Modellverhalten
tatsächlich eingehalten werden.

Nutzerspezifische Informationen werden nur dann in den Prompt
aufgenommen, wenn sie für eine definierte Gesprächsfunktion vorgesehen
sind. In der finalen Studienversion wurde nach der Prä Erhebung aus MSLQ
Subscores und dem GSE Gesamtscore durch einen separaten Aufruf von gpt
4.1 mini ein qualitatives, zahlenfreies Lernendenprofil erzeugt. Dieses
Profil wurde als stiller Hintergrund in den Gesprächsprompt eingebunden.
Der numerische GSE Rohwert und einzelne GSE Items wurden im V7 Prompt
nicht referenziert. Der GSE Präwert war damit kein direkter
Promptparameter, floss jedoch indirekt in die qualitative Profilbildung
ein. Diese Doppelfunktion wird als struktureller Confound behandelt. Da
alle Teilnehmenden dieselbe Profilierungslogik erhielten, ist innerhalb
der Pilotstudie kein kontrafaktischer Vergleich mit einer profilfreien
Bedingung möglich. Insbesondere Zusammenhänge zwischen dem GSE Präwert
und späteren Nutzungs oder Gesprächsmerkmalen werden deshalb nicht als
vom Personalisierungsmechanismus unabhängige Beziehungen interpretiert.

Die Entwicklung der Promptversionen erfolgte durch die Forscherin mit
Unterstützung KI gestützter Entwicklungswerkzeuge. Dadurch besteht das
Risiko einer iterativen Anpassung an die selbst konstruierten
Testszenarien und Bewertungsrubriken. Insbesondere kann eine
Verbesserung auf wiederholt verwendeten Crash Personas teilweise
testspezifische Optimierung darstellen. Um diesen Zusammenhang
nachvollziehbar zu machen, werden Promptänderungen, Auslöser der
Änderung und nachfolgende Evaluationsergebnisse versioniert
dokumentiert. Eine unabhängige externe Promptvalidierung liegt nicht
vor.

Für die Pilotstudie wurde die V7 Promptversion gemeinsam mit der
dokumentierten Modellkonfiguration und den Systemregeln vor Beginn der
Datenerhebung eingefroren. Die letzte dokumentierte Promptänderung
erfolgte am 02.08.2026 mit Commit d42af66. Der erste reale
Studienteilnehmende begann am 08.08.2026. Für den Zeitraum der
Pilotstudie sind keine weiteren promptbezogenen Änderungen dokumentiert.
Sicherheitskritische Eingriffe hätten mit Zeitpunkt, Anlass und
betroffenen Sitzungen dokumentiert und bei der Auswertung berücksichtigt
werden müssen.

Der wissenschaftliche Beitrag des Prompt Designs liegt damit nicht in
der Behauptung eines allgemein optimalen Prompts. Er liegt in der
transparenten Operationalisierung der Designanforderungen, der
dokumentierten Revision und der systematischen Prüfung des daraus
resultierenden Modellverhaltens. Welche Elemente über den konkreten
Prototyp hinaus als Gestaltungswissen tragfähig sind, kann erst auf
Grundlage der Evaluation und der späteren Diskussion beurteilt werden.

### 4.2.3 Studiendesign und Stichprobe

#### 4.2.3.1 Forschungsdesign

Die empirische Evaluation ist als explorative einarmige Prä Post
Pilotstudie ohne Kontrollgruppe angelegt. Sie ergänzt die technische
Artefaktevaluation um Daten aus der tatsächlichen Nutzung des Agenten.
Primäres quantitatives Outcome ist die allgemeine
Selbstwirksamkeitserwartung, die vor Beginn der Nutzung und nach
Abschluss der individuellen Nutzungsphase mit der GSE erhoben wird.
Ergänzend werden die einmalig vor der Nutzung erhobenen MSLQ Daten, die
während der Interaktion entstehenden Chattranskripte, strukturierte
Sitzungsdaten, optionale Feedbackmarker und Nutzungsdaten ausgewertet,
soweit hierfür eine entsprechende Einwilligung vorliegt.

Die Pilotstudie umfasst kein abschließendes Interview und keine
nachgelagerte qualitative Befragung der Teilnehmenden. Damit weicht das
finale Studiendesign auch in diesem Punkt vom Exposé ab. Die dort
vorgesehene Interviewebene wurde nicht umgesetzt. Die empirische
Auswertung beschränkt sich auf Daten, die vor, während oder unmittelbar
nach der Nutzung innerhalb des Studiensystems erhoben oder durch die
Interaktion mit dem Agenten erzeugt werden. Eine qualitative Analyse
kann sich daher ausschließlich auf vorhandene Chattranskripte oder
daraus regelgeleitet ausgewählte Textpassagen beziehen und nicht auf
retrospektive Interviewdaten.

Das Design erlaubt die Beschreibung individueller Prä Post Veränderungen
und explorative Zusammenhangsanalysen. Aufgrund der fehlenden
Kontrollgruppe können beobachtete Veränderungen nicht kausal dem Agenten
zugeschrieben werden. Mögliche Alternativerklärungen umfassen zeitliche
Veränderungen unabhängig von der Nutzung, wiederholte Messung,
Regression zur Mitte, parallele Lern oder Alltagserfahrungen sowie
Erwartungen der Teilnehmenden. Die Studie wird deshalb als Pilotstudie
und nicht als Wirksamkeitsnachweis bezeichnet.

Die fehlende Kontrollgruppe wird nicht mit einer vermeintlich
hinreichenden statistischen Power des einarmigen Designs legitimiert.
Die Stichprobengröße ergibt sich primär aus dem explorativen Charakter,
der zeitlichen Durchführbarkeit und dem Zweck, erste Daten zur Nutzung
des Artefakts zu gewinnen. Inferenzstatistische Ergebnisse werden
entsprechend mit Effektgrößen, Unsicherheit und den Grenzen der kleinen
Stichprobe interpretiert. Ein nicht signifikanter Befund kann bei dieser
Stichprobe nicht als Evidenz für das Ausbleiben eines Effekts verstanden
werden.

#### 4.2.3.2 Rekrutierung und Stichprobe

Die Rekrutierung erfolgt als Convenience Sampling über das persönliche
Netzwerk der Forscherin. Das ursprünglich angestrebte Rekrutierungsziel
lag bei ungefähr 20 Teilnehmenden. Die tatsächlich eingeschlossene
Stichprobe, die Zahl begonnener und abgeschlossener Nutzungsverläufe
sowie die für einzelne Analysen verfügbaren Fallzahlen werden erst im
Ergebniskapitel berichtet. Dadurch werden Planungsangaben und
realisierte Stichprobe methodisch getrennt.

Die dokumentierten Teilnahmevoraussetzungen umfassen Volljährigkeit,
ausreichende Deutschkenntnisse für schriftliche Gespräche, Zugang zu
einem internetfähigen Gerät und die Bereitschaft, innerhalb des
vorgesehenen Studienzeitraums mindestens drei Sitzungen mit dem Agenten
zu absolvieren. Die Teilnahme setzt eine informierte Einwilligung
voraus. Weitergehende Ein oder Ausschlusskriterien werden nur berichtet,
wenn sie im tatsächlich eingesetzten Studienprotokoll vor Beginn der
Erhebung festgelegt und angewendet wurden.

Die Rekrutierung aus dem persönlichen Netzwerk begrenzt die externe
Validität. Die Stichprobe kann sich hinsichtlich Bildungsniveau,
Technikaffinität, Motivation zur Nutzung eines KI gestützten Lernsystems
und Beziehung zur Forscherin systematisch von der Zielpopulation
unterscheiden. Darüber hinaus können persönliche Bekanntschaft und
Kenntnis des Forschungsprojekts Antwortverhalten und Nutzungsintensität
beeinflussen. Diese Selektions und Erwartungseffekte werden in der
Diskussion als Limitation des Designs berücksichtigt.

#### 4.2.3.3 Rolle der Forscherin

Die Forscherin übernimmt mehrere Rollen. Sie entwickelte das Artefakt,
konzipierte die Studie, rekrutierte Teilnehmende aus ihrem persönlichen
Netzwerk und verantwortet die Auswertung. Diese Rollenüberlagerung
schafft ein Risiko für Selektions, Erwartungs und Bestätigungsbias. Da
kein abschließendes Interview durchgeführt wird, entfällt zwar eine
zusätzliche Interviewsituation, in der die Forscherin Antworten durch
Gesprächsführung beeinflussen könnte. Die übrigen Abhängigkeiten bleiben
jedoch bestehen.

Die methodische Reaktion besteht nicht in der Behauptung vollständiger
Neutralität, sondern in Transparenz und standardisierten Abläufen. Prä
und Post Messungen werden innerhalb des Systems erhoben. Die zentralen
Nutzungsvorgänge werden protokolliert. Analyseregeln und
Ausschlussentscheidungen werden vor der Ergebnisinterpretation
dokumentiert. Die verbleibende Rollenüberlagerung wird in der Diskussion
als Einschränkung der Objektivität reflektiert.

#### 4.2.3.4 Nutzungsphase und Auswertbarkeit

Die Nutzung ist über mehrere Sitzungen innerhalb eines begrenzten
Studienzeitraums angelegt. Der Prototyp stellt bis zu zehn Sitzungen
bereit. Zehn Sitzungen bilden jedoch keine empirisch begründete
Mindestdosis. Für die Auswertung muss deshalb zwischen der technisch
vorgesehenen Maximalstruktur und der tatsächlich erreichten Nutzung
unterschieden werden.

Nach dem dokumentierten Studienprotokoll gilt eine Teilnahme mit weniger
als drei abgeschlossenen Sitzungen als vorzeitiger Abbruch. Für die Prä
Post Analyse der GSE sind zusätzlich vollständige Messwerte zu beiden
Zeitpunkten erforderlich. Alle rekrutierten beziehungsweise
eingeschlossenen Personen werden in der Stichprobenbeschreibung
ausgewiesen. Die analysierte Fallzahl wird für jede Auswertung separat
angegeben. Dadurch bleibt sichtbar, ob Ergebnisse auf der
Gesamtstichprobe oder nur auf vollständigen Fällen beruhen.

Die Mindestzahl von drei Sitzungen ist eine pragmatische Regel des
Studienprotokolls und kein empirisch validierter Schwellenwert für eine
ausreichende Exposition gegenüber dem Agenten. Die tatsächliche Anzahl
abgeschlossener Sitzungen wird daher zusätzlich deskriptiv berichtet.
Explorative Zusammenhänge zwischen Nutzungsintensität und Outcome können
beschrieben werden, dürfen wegen Selbstselektion und kleiner Stichprobe
jedoch nicht als Dosis Wirkungs Beziehung interpretiert werden.

#### 4.2.3.5 Interne und externe Validitätsgrenzen

Die zentrale interne Validitätsgrenze ist das Fehlen einer
Kontrollgruppe. Prä Post Unterschiede können zeitlich mit der Nutzung
des Agenten zusammenfallen, erlauben aber keine eindeutige Attribution.
Hinzu kommen mögliche Testeffekte der wiederholten GSE Messung und
Unterschiede in Lernthema, Ausgangslage, Nutzungsdauer und Anzahl der
Sitzungen. Die freie Wahl des Lernthemas erhöht die Nähe zur
vorgesehenen Nutzung, vergrößert zugleich aber die Heterogenität der
Exposition.

Die kleine nicht zufällig gezogene Stichprobe begrenzt zudem die
Generalisierbarkeit. Ergebnisse können weder auf Studierende noch auf
erwachsene Lernende oder Nutzende von KI Lernsystemen insgesamt
übertragen werden. Die empirische Pilotstudie liefert vielmehr erste
Evidenz für die untersuchte Stichprobe und Hinweise für die Planung
einer späteren kontrollierten Studie. Auch technische
Designentscheidungen werden nicht allein durch diese Stichprobe
generalisierbar.

Eine weitere Grenze betrifft die GSE als relativ generalisiertes
Konstrukt. Eine kurze Nutzungsphase kann zu kurz oder zu wenig intensiv
sein, um Veränderungen einer allgemeinen Selbstwirksamkeitserwartung
zuverlässig abzubilden. Ein ausbleibender Prä Post Unterschied wäre
deshalb weder ein eindeutiger Nachweis fehlender Wirkung des Agenten
noch ein Nachweis mangelnder Sensitivität des Instruments. Diese
Alternativerklärungen können mit dem vorliegenden Design nicht
voneinander getrennt werden.

## 4.3 Datenerhebung

### 4.3.1 Erhobene Daten und Messzeitpunkte

Die empirische Datenerhebung beschränkt sich auf standardisierte
Selbstberichte und Daten, die im Rahmen der Nutzung des Agenten im
Studiensystem entstehen. Ein abschließendes Interview findet nicht
statt. Die im Exposé vorgesehene Interviewerhebung wurde im finalen
Studiendesign nicht umgesetzt. Entsprechend werden weder Interviewdaten
erhoben noch interviewbasierte Aussagen zu Empathiewahrnehmung, Flow
Erleben oder retrospektiv wahrgenommener Selbstwirksamkeitsveränderung
ausgewertet.

Die GSE bildet das primäre quantitative Outcome. Die zehn Items werden
vor Beginn der ersten Sitzung und nach Abschluss der individuellen
Nutzungsphase erhoben. Aus den Itemantworten wird für jeden
Messzeitpunkt ein Gesamtscore nach der für die verwendete Skalenfassung
vorgesehenen Auswertungsregel gebildet. Die Prä Post Differenz dient der
Beschreibung individueller und gruppenbezogener Veränderungen der
allgemeinen Selbstwirksamkeitserwartung. Aufgrund des einarmigen
Pilotdesigns ist diese Differenz nicht als kausaler Effekt des Agenten
interpretierbar.

Der MSLQ wird einmalig vor der Nutzung erhoben und dient ausschließlich
der deskriptiven Charakterisierung der Stichprobe und explorativen
Kontextualisierung. Die in dieser Arbeit eingesetzte Auswahl umfasst 34
Items. Da es sich um eine projektspezifische Auswahl aus dem
ursprünglichen Instrument handelt und für diese Zusammenstellung keine
eigenständige Validierung vorliegt, werden daraus keine eigenständigen
validierten Skalen oder konfirmatorischen Konstruktaussagen abgeleitet.
Der MSLQ ist kein Prä Post Outcome.

Während der Sitzungen entstehen prozessnahe Daten. Dazu zählen die
Chattranskripte, strukturierte Sitzungsinformationen und die im System
vorgesehenen Feedbackmarker transfer_marker, wow, stuck und unclear. Die
Feedbackmarker sind keine validierten psychometrischen Messinstrumente.
Sie werden ausschließlich deskriptiv als nutzungsnahe Signale
ausgewertet. Häufigkeiten oder zeitliche Muster dürfen daher nicht
unmittelbar als Messung von Transfer, Einsicht, Überforderung oder
Verständnisschwierigkeit interpretiert werden.

Die Chattranskripte dokumentieren die tatsächlichen Interaktionen
zwischen Teilnehmenden und Agent. Sie können für regelgeleitete Analysen
des beobachtbaren Gesprächsverlaufs verwendet werden. Aussagen über
nicht direkt beobachtbare psychologische Zustände sind daraus jedoch
nicht ohne zusätzliche Validierung ableitbar. Automatisch erzeugte
Sitzungszusammenfassungen sind ebenfalls Systemoutputs und keine
unabhängige Datenquelle. Werden sie in der Auswertung verwendet, muss
ihre Funktion von den zugrunde liegenden Transkripten getrennt
ausgewiesen werden.

Zusätzlich können Nutzungsdaten wie die Anzahl abgeschlossener
Sitzungen, Zeitpunkte der Nutzung und technisch protokollierte
Dauerangaben deskriptiv ausgewertet werden, sofern diese Daten im
finalen System tatsächlich erhoben wurden und die erforderliche
Einwilligung vorliegt. Sie dienen der Beschreibung der Exposition
gegenüber dem Agenten. Nutzungsintensität ist dabei nicht mit
Engagement, Lernerfolg oder Interventionsdosis gleichzusetzen.

### 4.3.2 Erhebungsablauf

Vor der ersten Sitzung durchlaufen die Teilnehmenden den vorgesehenen
Informations und Einwilligungsprozess. Anschließend werden die Prä
Erhebung der GSE und die einmalige MSLQ Erhebung abgeschlossen. Erst
danach beginnt die Nutzung des Agenten. Diese Reihenfolge soll
sicherstellen, dass die Ausgangsmessungen nicht bereits durch eine
vorangegangene Interaktion mit dem Forschungsartefakt beeinflusst
werden.

Die weitere Datenerhebung erfolgt innerhalb der Nutzungssitzungen.
Chattranskripte, Sitzungsinformationen, Feedbackmarker und
gegebenenfalls Nutzungsdaten werden entsprechend der im System
implementierten Datenstruktur gespeichert. Nach Abschluss der
individuellen Nutzungsphase wird die GSE erneut erhoben. Eine
zusätzliche retrospektive Befragung oder ein Abschlussinterview ist
nicht Bestandteil des finalen Erhebungsprotokolls.

Soweit der technische Ablauf durch Zustandsregeln im Backend gesteuert
wird, unterstützt dies die standardisierte Reihenfolge der Erhebung.
Eine technische Ablaufsteuerung ist jedoch nicht mit einem
experimentellen Protokoll gleichzusetzen. Sie reduziert bestimmte
Implementierungsabweichungen, beseitigt aber weder Messfehler noch
Unterschiede in der tatsächlichen Nutzung zwischen den Teilnehmenden.

### 4.3.3 Datenqualität und Auswertbarkeit

Vor der statistischen Auswertung wird für jede Datenkategorie geprüft,
welche Fälle vollständig und auswertbar vorliegen. Für die Prä Post
Analyse der GSE sind Werte zu beiden Messzeitpunkten erforderlich.
Fehlende Einzelitems, unvollständige Fragebögen und technisch nicht
abgeschlossene Erhebungen werden nicht stillschweigend ergänzt. Die
konkrete Behandlung fehlender Werte wird in Abschnitt 4.4 festgelegt und
im Ergebniskapitel mit den jeweiligen Fallzahlen transparent berichtet.

Für prozessnahe Daten wird zwischen fehlenden Daten und dem
tatsächlichen Ausbleiben eines Ereignisses unterschieden. Ein nicht
gesetzter Feedbackmarker kann beispielsweise bedeuten, dass ein
entsprechendes Signal nicht ausgewählt wurde. Er darf nur dann als
beobachtete Abwesenheit interpretiert werden, wenn technisch
sichergestellt ist, dass die Auswahlmöglichkeit vorhanden war und die
betreffende Sitzung vollständig protokolliert wurde. Technische Ausfälle
sind separat zu dokumentieren.

Die Verwendung automatisch erzeugter Daten erfordert eine zusätzliche
Quellenkritik. Sitzungszusammenfassungen und LLM basierte
Klassifikationen entstehen durch das untersuchte technische System oder
durch daran gekoppelte Modelle. Sie sind deshalb nicht unabhängig von
dessen Funktionsweise. Wo möglich, werden Analysen auf die
ursprünglichen Nutzereingaben und Systemantworten zurückgeführt.
Abgeleitete Modelloutputs werden als solche gekennzeichnet.

### 4.3.4 Datenschutzbezogene Erhebungssicherung

Die Studiendaten werden unter pseudonymisierten Kennungen verarbeitet.
Pseudonymisierung reduziert die unmittelbare Personenbeziehbarkeit, hebt
den Personenbezug im Sinne der DSGVO jedoch nicht auf. Welche Daten auf
dem Studienserver gespeichert und welche Inhalte zur
Sprachmodellverarbeitung an externe Dienste übertragen werden, muss mit
der tatsächlich implementierten Datenflussarchitektur übereinstimmen.
Technische Anbieter, Serverstandorte, Aufbewahrungsfristen und
vertragliche Rollen werden deshalb nur in der Form berichtet, in der sie
für die durchgeführte Studie dokumentiert und nachweisbar sind.

Einwilligungsabhängige Datenkategorien werden nur ausgewertet, wenn die
entsprechende Einwilligung vorliegt. Funktionen zur Auskunft,
Berichtigung, Löschung oder zum Export können die Wahrnehmung von
Betroffenenrechten technisch unterstützen. Ihre Implementierung allein
belegt jedoch keine vollständige rechtliche Compliance. Die rechtliche
Einordnung bleibt von der technischen Funktionsprüfung getrennt.

## 4.4 Auswertungsverfahren

### 4.4.1 Analysestrategie

Die empirische Auswertung folgt einer explorativen Analysestrategie. Im
Zentrum steht die Veränderung der allgemeinen
Selbstwirksamkeitserwartung zwischen Prä und Post Messung. Deskriptive
Kennwerte werden durch eine inferenzstatistische Prüfung des gepaarten
Unterschieds ergänzt. Aufgrund des Pilotcharakters, der kleinen
Stichprobe und der fehlenden Kontrollgruppe werden Signifikanztests
nicht als konfirmatorischer Wirksamkeitsnachweis interpretiert.

Für beide GSE Messzeitpunkte werden Fallzahl, Mittelwert,
Standardabweichung, Median, Interquartilsabstand sowie Wertebereich
berichtet. Zusätzlich werden die individuellen Prä Post Veränderungen
dargestellt. Diese Darstellung ist bei einer kleinen Pilotstichprobe
besonders relevant, weil ein aggregierter Gruppenwert heterogene
individuelle Verläufe verdecken kann.

Die primäre Analyse des gepaarten Prä Post Unterschieds erfolgt mit dem
Wilcoxon Vorzeichenrangtest. Die Wahl wird nicht allein mit der
Stichprobengröße oder der ordinalen Antwortskala einzelner GSE Items
begründet. Analysiert wird der aus mehreren Items gebildete Gesamtscore.
Der nichtparametrische Test wird als robuste, rangbasierte Analyse für
die kleine gepaarte Stichprobe eingesetzt. Seine Voraussetzungen,
insbesondere die Paarigkeit der Beobachtungen und die für die
Interpretation als Lageverschiebung relevante Form der
Differenzverteilung, werden bei der Auswertung berücksichtigt.

Da die theoretische Erwartung eine Zunahme der Selbstwirksamkeit
beschreibt, war H1 ursprünglich gerichtet formuliert. Für die
Pilotstudie steht jedoch die Schätzung und Beschreibung der beobachteten
Veränderung stärker im Vordergrund als die Maximierung statistischer
Teststärke. Neben dem p Wert werden deshalb Richtung und Größe der
Veränderung sowie ein Unsicherheitsintervall berichtet. Die
Schlussfolgerung stützt sich nicht auf die Dichotomisierung in
signifikant und nicht signifikant.

### 4.4.2 Forschungsannahmen und Abweichung vom ursprünglichen Untersuchungsplan

Die Arbeit prüft eine gerichtete Forschungsannahme zur GSE Veränderung.
H1 lautet, dass die allgemeine Selbstwirksamkeitserwartung nach der
Nutzungsphase höher ausfällt als vor der Nutzung. Aufgrund des Designs
wird ein entsprechender Befund als Prä Post Veränderung innerhalb der
untersuchten Stichprobe und nicht als kausale Wirkung des Agenten
interpretiert.

Gegenüber dem Exposé wurde der empirische Untersuchungsplan vor der
finalen Auswertung verändert. Die dort formulierte zweite
Forschungsannahme sah vor, nach jeder Sitzung eine kurze situative
Selbsteinschätzung mit einer LLM basierten Analyse von
Handlungskontrolle, Problemlösezuversicht und Bewältigungserwartung zu
vergleichen. Die sitzungsspezifische Selbsteinschätzung wurde im finalen
Erhebungsdesign nicht umgesetzt. Damit fehlt die für die geplante
Konvergenzanalyse notwendige zweite längsschnittliche Messreihe. H2 wird
deshalb nicht getestet. Diese Abweichung wird als Änderung des
ursprünglichen Untersuchungsplans transparent ausgewiesen und nicht
durch eine nachträgliche Ersatzoperationalisierung verdeckt.

Auch die Metriken M1 bis M7 aus der technischen Sprachmodellevaluation
können diese fehlende Messreihe nicht ersetzen. Sie wurden anhand
synthetischer Testszenarien zur Prüfung des Modellverhaltens erhoben und
stellen keine personenbezogenen Verlaufsmaße der Teilnehmenden dar. Eine
Korrelation dieser Evaluationsmetriken mit der GSE würde daher
unterschiedliche Untersuchungseinheiten und unterschiedliche Messzwecke
vermischen.

Ebenso wird die zwischenzeitlich im statistischen Auswertungsprotokoll
aufgeführte Korrelation zwischen GSE Präwert und Nutzungsintensität
nicht als H2 geführt. Eine solche Analyse beantwortet eine andere Frage
als die theoretisch formulierte Konvergenzannahme und wäre keine
methodisch zulässige nachträgliche Operationalisierung derselben
Hypothese. Ein möglicher Zusammenhang zwischen Nutzungsintensität und
GSE Veränderung kann ausschließlich explorativ und ohne Hypothesenstatus
untersucht werden, sofern die Datenqualität und Fallzahl dies sinnvoll
zulassen.

Der GSE Präwert ist zugleich Ausgangsmessung des primären Outcomes und
mittelbarer Bestandteil der Personalisierungslogik über das qualitative
Lernendenprofil. Deshalb werden explorative Analysen mit dem GSE Präwert
nicht als Prüfung eines von der Intervention unabhängigen Baseline
Prädiktors interpretiert. Eine nachträgliche Sensitivitätsanalyse mit
und ohne Profil wäre mit den erhobenen Daten nicht möglich, da keine
profilfreie Vergleichsbedingung existiert. Die Konsequenz wird daher
durch transparente Kennzeichnung, zurückhaltende Interpretation
entsprechender Zusammenhänge und explizite Diskussion als
Designlimitation gezogen.

Die finale Arbeit enthält damit eine empirisch prüfbare gerichtete
Forschungsannahme H1 und davon getrennte explorative Analysen. Diese
Reduktion erhöht die Konsistenz zwischen Theorie, tatsächlich erhobenen
Daten und statistischer Auswertung. Die in Kapitel 2 ursprünglich als H2
bezeichnete Konvergenzannahme wird entsprechend als nicht umgesetzter
Teil des ursprünglichen Untersuchungsplans kenntlich gemacht und nicht
nachträglich mit anderen Variablen ersetzt.

### 4.4.3 Effektgröße und Unsicherheit

Für den Wilcoxon Vorzeichenrangtest wird eine zum rangbasierten
Verfahren passende Effektgröße berichtet. Die bisher vorgesehene
Verwendung von Cohen d aus Mittelwerten und Standardabweichungen als
primäre Effektgröße des Wilcoxon Tests wird nicht beibehalten, da sie
nicht unmittelbar aus der Rangteststatistik hervorgeht. Zusätzlich
können deskriptive Prä Post Differenzen in Originaleinheiten der GSE
angegeben werden, damit die Größenordnung der beobachteten Veränderung
inhaltlich interpretierbar bleibt.

Unsicherheitsintervalle werden soweit statistisch sinnvoll für zentrale
Schätzgrößen angegeben. Bei der kleinen Stichprobe werden diese
Intervalle ausdrücklich als Ausdruck erheblicher Schätzunsicherheit
interpretiert. Breite Intervalle sind kein technisches Problem, das
durch zusätzliche Modellierung beseitigt werden soll, sondern eine
direkte Folge der begrenzten Information in der Stichprobe.

### 4.4.4 Stichprobengröße und Power

Die im ursprünglichen Auswertungsprotokoll dokumentierte Poweranalyse
wird als Planungsinformation berichtet, sofern ihre Berechnung anhand
der gespeicherten G Power Konfiguration reproduzierbar ist. Eine
angenommene mittlere Effektgröße stellt dabei keine empirisch belegte
Erwartung für den Agenten dar. Sie ist eine Planungsannahme.

Die angestrebte Stichprobe von ungefähr 20 Personen liegt nach dem
bisherigen Protokoll unter der dort berechneten Mindeststichprobe für
eine Power von .80. Dieser Umstand bestätigt die Einordnung als
explorative Pilotstudie. Eine nachträgliche Powerberechnung auf
Grundlage des beobachteten Effekts wird nicht zur Interpretation des
Ergebnisses verwendet. Aussagekräftiger sind die beobachtete
Effektgröße, ihre Unsicherheit und die transparente Darstellung der
tatsächlich verfügbaren Fallzahl.

### 4.4.5 Fehlende Werte und Analysepopulation

Alle eingeschlossenen Teilnehmenden werden in der
Stichprobenbeschreibung berücksichtigt. Für jede Analyse wird die
tatsächlich verfügbare Fallzahl angegeben. Die Bezeichnung Intent to
Treat wird für die vorliegende Studie nicht verwendet, da keine
randomisierte Zuweisung zu Interventionsbedingungen vorliegt und keine
vollständige Analyse aller eingeschlossenen Personen unabhängig von
ihrer Nutzung im klassischen Sinne durchgeführt werden kann.

Für die gepaarte GSE Analyse werden nur Fälle mit auswertbarem Prä und
Post Gesamtscore berücksichtigt. Fehlende Post Messungen werden nicht
durch Last Observation Carried Forward oder andere einfache
Ersetzungsverfahren imputiert. Anzahl und Gründe fehlender Werte werden
berichtet, soweit sie bekannt sind. Bei einzelnen fehlenden GSE Items
wird ausschließlich die dokumentierte Auswertungsregel der verwendeten
Skala angewandt. Liegt hierfür keine belastbare Regel vor, wird kein
Gesamtscore durch eine selbst entwickelte Imputation erzeugt.

Teilnehmende mit weniger als drei abgeschlossenen Sitzungen werden
entsprechend dem Studienprotokoll als vorzeitige Abbrüche ausgewiesen.
Diese Klassifikation entscheidet nicht automatisch über jede Analyse. Ob
ein Fall für eine konkrete Auswertung berücksichtigt werden kann,
richtet sich nach der jeweiligen Fragestellung und Datenverfügbarkeit.

### 4.4.6 Explorative Prozessanalysen

MSLQ Werte, Feedbackmarker, Nutzungsintensität und ausgewählte Merkmale
der Chattranskripte werden deskriptiv beziehungsweise explorativ
analysiert. Bei der kleinen Stichprobe werden Korrelationsanalysen nur
durchgeführt, wenn eine inhaltlich begründete Variablenpaarung und
ausreichend vollständige Beobachtungen vorliegen. Sie werden nicht
nachträglich als Bestätigung einer zuvor formulierten Hypothese
dargestellt.

Für die Feedbackmarker werden absolute und relative Häufigkeiten sowie
ihre Verteilung über Sitzungen beschrieben. Eine inferenzstatistische
Interpretation ist nicht vorgesehen. Automatisch aus Transkripten
abgeleitete Klassifikationen werden getrennt von direkt erhobenen
Selbstberichten ausgewiesen. Da für die ursprünglich geplanten
Handlungskontrollindikatoren keine validierte personenbezogene Messreihe
vorliegt, werden daraus keine konfirmatorischen Aussagen zur Konvergenz
mit der GSE abgeleitet.

Auf eine thematische Analyse von Abschlussinterviews wird verzichtet, da
solche Interviews nicht erhoben werden. Falls Chattranskripte qualitativ
ausgewertet werden, muss hierfür vor der Ergebnisdarstellung ein
eigenständiges, nachvollziehbares Analyseverfahren mit Auswahlregeln,
Kodiereinheit und Auswertungsschritten spezifiziert werden. Eine
qualitative Analyse wird nicht allein dadurch angenommen, dass Textdaten
vorliegen.

### 4.4.7 Software und Reproduzierbarkeit

Die statistische Auswertung erfolgt in R. Verwendete Softwareversionen
und Pakete werden anhand der tatsächlich ausgeführten Analyseumgebung
dokumentiert. Analyseskripte, Datenaufbereitung und
Ausschlussentscheidungen werden versioniert gespeichert. Eine
öffentliche Bereitstellung von Skripten oder Daten wird nur dann
behauptet, wenn sie tatsächlich erfolgt und mit Datenschutz sowie
Einwilligung vereinbar ist.
