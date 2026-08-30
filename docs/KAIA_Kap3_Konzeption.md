# 3 Konzeption

Kapitel 3 überführt die in Kapitel 2 begründeten theoretischen
Prinzipien in überprüfbare Designentscheidungen des Forschungsartefakts.
Die Konzeption trennt dabei theoretisch begründete Anforderungen von
projektspezifischen Festlegungen. Nicht jede technische oder dialogische
Entscheidung wird als direkte Folge einer Theorie dargestellt. Wo die
Literatur lediglich einen Gestaltungsrahmen begründet, wird die konkrete
Ausprägung als Designentscheidung des Prototyps ausgewiesen.

## 3.1 Designanforderungen

Die erste Anforderung besteht darin, den kognitiven Eigenanteil der
lernenden Person zu erhalten. Der Expertise Reversal Effect zeigt, dass
die Wirksamkeit instruktionaler Unterstützung vom vorhandenen Vorwissen
abhängt. Unterstützung, die für wenig erfahrene Lernende hilfreich ist,
kann bei höherem Vorwissen redundant oder nachteilig werden (Kalyuga et
al., 2003). Daraus folgt keine generelle Ablehnung direkter Instruktion.
Für den Agenten folgt vielmehr die Anforderung, Umfang und Direktheit
der Unterstützung am erkennbaren Unterstützungsbedarf auszurichten.

Die zweite Anforderung betrifft ein variables Unterstützungsniveau.
Scaffolding beschreibt tutorielle Hilfe, bei der zunächst jene
Aufgabenteile unterstützt werden, die eine Person noch nicht
selbstständig bewältigen kann (Wood et al., 1976). Der Agent benötigt
deshalb mindestens eine stärker fragende und eine stärker
strukturierende Form der Begleitung. Die Wahl zwischen diesen Formen
darf nicht als sichere Diagnose eines inneren Zustands verstanden
werden. Sie basiert auf Gesprächshinweisen und bleibt korrigierbar.

Die dritte Anforderung ist der Schutz von Autonomie und
Selbstregulation. Der Agent soll Entscheidungen über Lernziel, Bewertung
eigener Fortschritte und nächste Handlungsschritte nicht dauerhaft
übernehmen. Seine Unterstützung soll Wahlmöglichkeiten erhalten und mit
wachsender Selbstständigkeit zurücktreten. Damit wird Adaptivität nicht
als möglichst umfassende Personalisierung verstanden, sondern als
begrenzte Unterstützung mit dem Ziel, eigenständige Regulation zu
ermöglichen.

Die vierte Anforderung ist die Überführung von Reflexion in konkretes
Handeln. Implementation Intentions verbinden eine erwartete Situation
mit einer vorgesehenen Reaktion und können die Umsetzung von
Zielabsichten unterstützen (Gollwitzer, 1999). Der Agent soll deshalb
nach geeigneten Reflexionsphasen die Formulierung eines konkreten
nächsten Schritts und eines passenden Ausführungskontexts anregen. Diese
Funktion begründet keine Garantie späterer Umsetzung.

Die fünfte Anforderung betrifft empathische Responsivität ohne
diagnostischen Anspruch. Das System darf sprachliche Hinweise nutzen, um
Tonalität und Unterstützungsgrad anzupassen. Solche Inferenzen bleiben
jedoch unsicher. Der Agent darf daraus weder psychologische Diagnosen
noch Behauptungen über tatsächlich vorliegende Emotionen ableiten.
Nutzende müssen die Möglichkeit behalten, eine unpassende
Systeminterpretation zu korrigieren.

Die sechste Anforderung ist Transparenz. Nutzende müssen erkennen
können, dass sie mit einem KI System interagieren. Darüber hinaus soll
nachvollziehbar sein, welche personenbezogenen Informationen für
Personalisierung gespeichert und wie sie für die Gesprächssteuerung
verwendet werden. Transparenz ist damit sowohl regulatorische
Anforderung als auch Designprinzip für die kontrollierbare Adaptation.

Die siebte Anforderung betrifft wissenschaftliche Prüfbarkeit. Zentrale
Regeln der Gesprächsführung, die verwendeten Promptversionen, das
zugrunde liegende Sprachmodell und die für Personalisierung verwendeten
Kontextinformationen müssen für die Evaluation dokumentierbar sein.
Variable Modellantworten lassen sich dadurch nicht vollständig
deterministisch reproduzieren. Die Studienbedingungen und die
regelbasierte Steuerungslogik sollen jedoch so weit wie möglich fixiert
und versioniert werden.

Die sieben Anforderungen übersetzen den theoretischen Rahmen in prüfbare
Gestaltungsziele. Die folgenden Abschnitte spezifizieren ihre technische
Umsetzung, während Kapitel 4 untersucht, in welchem Umfang der
resultierende Prototyp die definierten Anforderungen erfüllt.

## 3.2 Architekturentscheidung

Die Systemarchitektur dient der Umsetzung der in Abschnitt 3.1
formulierten Anforderungen. Sie wird nicht als unmittelbare Folge
psychologischer Theorie verstanden. Entscheidungen über Anzahl der
Agenten, technische Schichten, Speicherkomponenten und Modellanbindung
sind technische Entwurfsentscheidungen. Ihre wissenschaftliche
Begründung liegt darin, dass sie die geforderten Eigenschaften des
Artefakts mit möglichst geringer zusätzlicher Komplexität prüfbar
umsetzen.

Der Prototyp verwendet eine einzelne dialogführende Agenteninstanz.
Diese Entscheidung reduziert zusätzliche Koordinationslogik zwischen
mehreren gleichzeitig antwortenden Agenten und erleichtert die Zuordnung
beobachteter Systemantworten zur dokumentierten Gesprächslogik. Aus
dieser Architekturentscheidung folgt keine generelle Überlegenheit eines
einzelnen Agenten gegenüber Systemen mit mehreren Agenten. Sie ist eine
projektspezifische Festlegung für den untersuchten Prototyp.

Die Verarbeitung wird funktional in vier Bereiche getrennt. Die
Eingabeschicht übernimmt Nutzereingaben und Sitzungsinformationen. Die
Dialogschicht verbindet das verwendete Sprachmodell mit den jeweils
relevanten Gesprächsregeln und Kontextinformationen. Die
Persistenzschicht speichert jene Informationen, die für
sitzungsübergreifende Personalisierung vorgesehen sind. Die
Datenschutzschicht begrenzt Speicherung, Zugriff und Weitergabe
personenbezogener Daten entsprechend dem in Abschnitt 2.6 beschriebenen
Rahmen. Diese Trennung beschreibt Verantwortungsbereiche der Architektur
und nicht vier voneinander unabhängige technische Systeme.

Für die Dialogsteuerung werden Systemregeln, Nutzerkontext und adaptive
Gesprächsinformationen modular zusammengeführt. Diese Modularisierung
soll ermöglichen, einzelne Bestandteile zu versionieren und in der
Evaluation getrennt zu dokumentieren. Das zugrunde liegende Sprachmodell
wird über eine abgegrenzte Schnittstelle angesprochen. Ein Modellwechsel
ist dadurch technisch vorgesehen. Gleichwertiges Verhalten verschiedener
Modelle wird jedoch nicht vorausgesetzt und muss für jedes eingesetzte
Modell erneut evaluiert werden.

Die sitzungsübergreifende Personalisierung erfordert persistente
Informationen. Gespeichert werden deshalb nur Daten, die für die im
Prototyp vorgesehenen Funktionen benötigt werden. Die konkrete
Speicherstruktur und die Regeln zur Aktualisierung des Nutzerkontexts
werden in Abschnitt 3.5 beschrieben. Eine persistente Speicherung ist
dabei kein Selbstzweck. Sie muss gegenüber dem Nutzen für
Personalisierung und den datenschutzrechtlichen Anforderungen begründet
werden.

Die Architektur soll schließlich die wissenschaftliche Prüfung des
Artefakts unterstützen. Verwendetes Modell, Promptversionen, zentrale
Steuerungsregeln und relevante Konfigurationen werden dokumentiert.
Damit werden die Bedingungen einzelner Evaluationsläufe nachvollziehbar.
Wegen der stochastischen Generierung durch Sprachmodelle bedeutet diese
Dokumentation keine vollständige Reproduzierbarkeit identischer
Antworten. Sie ermöglicht jedoch eine kontrolliertere Zuordnung von
Ergebnissen zu einer definierten Systemversion.

Die Bezeichnung Minimum Viable Architecture wird in dieser Arbeit daher
als projektspezifisches Entwurfsprinzip verwendet. Gemeint ist die
kleinste für die Forschungsziele ausreichende Architektur des Prototyps.
Der Begriff stellt kein empirisch validiertes Architekturmodell dar.
Entscheidend ist nicht technische Minimalität an sich, sondern die
nachvollziehbare Umsetzung der Designanforderungen bei begrenzter
Komplexität.

## 3.3 Textbasierte Adaptionssignale

Die dialogische Adaptation des Prototyps verwendet sprachliche Hinweise
aus dem laufenden Gespräch. Diese Hinweise werden nicht als Messung
eines psychologischen Zustands interpretiert. Das transaktionale
Stressmodell dient lediglich als theoretischer Ordnungsrahmen. Primäre
Bewertung betrifft die Bedeutung einer Situation für das eigene
Wohlergehen. Sekundäre Bewertung betrifft wahrgenommene
Bewältigungsmöglichkeiten und verfügbare Ressourcen (Lazarus & Folkman,
1984). Aus dieser Theorie folgt jedoch kein validiertes Verfahren, mit
dem sich beide Bewertungsprozesse aus einzelnen Chatnachrichten
zuverlässig bestimmen lassen.

Für den Prototyp werden deshalb keine diagnostischen Stressmarker
definiert. Stattdessen nutzt die Gesprächssteuerung heuristische
Adaptionssignale. Hinweise auf wahrgenommene Belastung können
beispielsweise explizite Aussagen über Überforderung, Zeitdruck oder
fehlende Kontrolle sein. Hinweise auf wahrgenommene
Bewältigungsmöglichkeiten können explizit genannte Ressourcen,
Handlungsoptionen oder eigene nächste Schritte sein. Diese Kategorien
sind theorieinformierte Designregeln. Sie sind keine validierte Skala
und erlauben weder eine Stressdiagnose noch eine reliable Schätzung von
Primärbewertung, Sekundärbewertung oder Copingpotenzial.

Forschung zur automatisierten Stressklassifikation zeigt grundsätzlich,
dass textuelle Merkmale Informationen enthalten können, die für die
Unterscheidung belasteter und unbelasteter Texte nutzbar sind.
Entsprechende Verfahren kombinieren jedoch unterschiedliche
lexikalische, syntaktische und semantische Merkmale und müssen anhand
gelabelter Datensätze empirisch trainiert und geprüft werden (Muñoz &
Iglesias, 2022). Diese Evidenz validiert daher nicht die im Prototyp
verwendeten heuristischen Signale. Sie begründet lediglich, dass Sprache
grundsätzlich als Datenquelle für explorative Adaptation untersucht
werden kann.

Ein Wechsel des Unterstützungsmodus soll nicht durch ein einzelnes
sprachliches Signal ausgelöst werden. Die Steuerung kann mehrere
aufeinanderfolgende Gesprächsbeiträge berücksichtigen und einen
Moduswechsel erst bei einem konsistenten Muster vornehmen. Eine solche
Hysterese reduziert kurzfristige Wechsel aufgrund einzelner
Formulierungen. Die konkrete Zahl erforderlicher Beiträge ist jedoch
eine technische Designentscheidung. Solange sie nicht empirisch
kalibriert wurde, darf sie nicht als psychologisch begründeter
Schwellenwert dargestellt werden.

Zusätzlich muss die lernende Person eine Systeminterpretation
korrigieren können. Diese Möglichkeit ist notwendig, weil sprachliche
Merkmale mehrdeutig sind und individuelle Ausdrucksweisen variieren.
Eine Äußerung kann situative Belastung anzeigen, aber ebenso durch
persönlichen Sprachstil, Kontext oder andere nicht beobachtete Faktoren
entstehen. Die nutzerseitige Korrektur ist deshalb Bestandteil der
Adaptionslogik und keine bloße Komfortfunktion.

Die textbasierten Adaptionssignale werden in der Pilotstudie nicht als
validiertes Messinstrument behandelt. Analysen ihrer Häufigkeit, ihrer
Verbindung mit Moduswechseln oder ihrer Übereinstimmung mit anderen
Variablen sind explorativ. Eine erfolgreiche technische Reaktion auf
definierte Signalmuster zeigt lediglich, dass die implementierte
Adaptionsregel funktioniert. Sie belegt nicht, dass das System den
tatsächlichen psychologischen Zustand der lernenden Person erkannt hat.

## 3.4 Sokratische Adaptionslogik

### 3.4.1 Interaktionsmodi

Die Gesprächssteuerung unterscheidet vier Interaktionsmodi. Diese Modi
sind keine psychologischen Zustandsklassen. Sie sind Designzustände des
Systems, mit denen unterschiedliche Formen der Unterstützung konsistent
beschrieben und technisch gesteuert werden. Ihre Auswahl basiert auf den
in Abschnitt 3.3 beschriebenen Gesprächshinweisen sowie auf dem
verfügbaren Nutzerkontext. Eine Moduszuordnung darf daher nicht als
Feststellung von Stress, Flow oder Coping interpretiert werden.

Der sokratisch explorative Modus priorisiert offene Fragen und geringe
inhaltliche Vorgaben, wenn die bisherige Interaktion keine stärkere
Strukturierung nahelegt. Der unterstützende Modus ergänzt Fragen durch
kurze Orientierung oder Teilstrukturierung, wenn Gesprächshinweise auf
Schwierigkeiten bei der eigenständigen Bearbeitung hindeuten. Der
bestärkende Modus spiegelt konkret beobachtbare Fortschritte oder selbst
formulierte Lösungsansätze, ohne daraus stabile Eigenschaften der Person
abzuleiten. Der kritisch prüfende Modus hinterfragt Annahmen, Gründe und
Konsequenzen, sofern die Gesprächssituation eine solche Vertiefung
zulässt.

Die vier Modi operationalisieren damit ein Spektrum zwischen geringer
und stärkerer Unterstützung sowie zwischen explorativer und prüfender
Gesprächsführung. Der Expertise Reversal Effect und Scaffolding
begründen die allgemeine Notwendigkeit variabler Unterstützung. Sie
validieren jedoch weder diese konkrete Viererstruktur noch ihre
Aktivierungsregeln. Beides sind Entwurfsentscheidungen des Prototyps,
deren technische Konsistenz in Kapitel 4 geprüft wird.

Die Modusauflösung erfolgt außerhalb des Sprachmodells anhand
dokumentierter Steuerungsregeln. Der gewählte Modus wird dem
Sprachmodell als Teil des Gesprächskontexts übergeben. Dadurch lässt
sich nachvollziehen, welche Systemregel für eine Antwort vorgesehen war.
Das Sprachmodell bleibt dennoch stochastisch und kann die Vorgabe
unterschiedlich umsetzen. Die Evaluation muss deshalb getrennt prüfen,
ob die Steuerungslogik den vorgesehenen Modus auswählt und ob das
Sprachmodell diesen Modus in der erzeugten Antwort tatsächlich einhält.

### 3.4.2 Fragetypen

Für die Gesprächsführung verwendet der Prototyp sechs funktionale
Fragetypen. Dazu gehören Klärungsfragen, hypothetische Fragen,
Widerspruchsfragen, systemische Fragen, Fragen zum nächsten
Handlungsschritt und Fragen zur Aktivierung von Vorwissen. Diese
Taxonomie ist eine projektspezifische Spezifikation. Sie darf nicht mit
etablierten Klassifikationen sokratischer Fragen gleichgesetzt werden.
In der Literatur werden beispielsweise sechs andere Kategorien
beschrieben, die Klärung, Annahmen, Gründe und Evidenz, Perspektiven,
Implikationen sowie Fragen über die Frage selbst unterscheiden (Le,
2019).

Die projektspezifischen Fragetypen erfüllen unterschiedliche Funktionen
im Agentendesign. Klärungsfragen präzisieren unklare Aussagen.
Hypothetische und systemische Fragen erweitern den betrachteten Kontext.
Widerspruchsfragen prüfen Inkonsistenzen oder konkurrierende Annahmen.
Fragen zum nächsten Handlungsschritt unterstützen die Konkretisierung
einer Handlungsabsicht. Fragen zur Aktivierung von Vorwissen stellen
Bezüge zu bereits vorhandenem Wissen oder früheren Gesprächsinhalten
her. Die Zuordnung dieser Typen zu festen kognitiven Stufen wird nicht
vorausgesetzt, da die kognitive Anforderung einer Frage vom Inhalt und
vom Vorwissen der lernenden Person abhängt.

Die sechs Typen dienen vor allem der Spezifikation und Evaluation. Für
definierte Testsituationen kann geprüft werden, ob das Sprachmodell den
jeweils geforderten Fragetyp erzeugt und verbotene Antwortformen
vermeidet. Eine erfolgreiche Klassifikation oder Generierung belegt die
Einhaltung der Gesprächsspezifikation. Sie belegt nicht, dass ein
bestimmter Fragetyp einen vorher festgelegten kognitiven oder
motivationalen Effekt hervorruft.

### 3.4.3 Sitzungsprogression

Der Prototyp ist für zehn Nutzungssitzungen konzipiert. Die Anzahl von
zehn Sitzungen ist eine Festlegung des Studiendesigns und lässt sich
weder aus dem Spacing Effekt noch aus einer Lernzieltaxonomie als
notwendige Mindestzahl ableiten. Verteilte Lerngelegenheiten begründen
lediglich, Lernaktivitäten über mehrere Zeitpunkte zu verteilen. Die
konkrete Dauer und Anzahl der Sitzungen ergeben sich aus dem
vorgesehenen Nutzungsszenario und der Durchführbarkeit der Pilotstudie.

Innerhalb dieses Rahmens folgt die Gesprächsführung einer geplanten
Progression. Frühe Sitzungen dienen vor allem der Klärung von
Lernanliegen, Vorwissen und konkreten Schwierigkeiten. Mittlere
Sitzungen nutzen stärker anwendungsbezogene Fragen und greifen frühere
Gesprächsinhalte wieder auf. Späte Sitzungen richten den Blick stärker
auf eigenständige Fortführung, Rückblick und zukünftige
Handlungsschritte. Diese Progression ist ein Designmodell des Prototyps.
Sie wird nicht als empirisch validierte Abfolge kognitiver
Entwicklungsstufen dargestellt.

Wiederaufnahmen früherer Inhalte können verteilte Abrufgelegenheiten
schaffen. Der Spacing Effekt stützt die grundsätzliche Verteilung von
Lerngelegenheiten über die Zeit (Cepeda et al., 2006). Er belegt jedoch
nicht, dass ein Rückbezug auf ein früheres Gesprächszitat bereits Spaced
Retrieval im experimentell geprüften Sinn darstellt. Solche Rückbezüge
werden deshalb als Gedächtnis und Kohärenzfunktion des Agenten
beschrieben.

Jede Sitzung besitzt zudem eine interne Gesprächsstruktur aus
Orientierung, Arbeitsphase und Sicherung. Diese Struktur dient der
Konsistenz des Prototyps. Sie wird nicht als direkte Implementierung
eines einzelnen etablierten Instruktionsmodells beansprucht. Konkrete
Regeln wie eine begrenzte Zahl gleichzeitig gestellter Fragen oder ein
abschließender Rückblick sind Prompt und Interaktionsentscheidungen, die
in der technischen Evaluation auf Einhaltung geprüft werden.

### 3.4.4 Erster Schritt Loop

Der Erster Schritt Loop ist eine eigene Designkomponente des Prototyps.
Sein theoretischer Bezug liegt in Implementation Intentions. Diese
konkretisieren Zielabsichten, indem eine antizipierte Situation mit
einer vorgesehenen Handlung verknüpft wird (Gollwitzer, 1999). Die
Forschung zu Implementation Intentions stützt damit insbesondere Fragen
nach dem Zeitpunkt, dem Kontext und der konkreten Ausführung eines
beabsichtigten nächsten Schritts. Sie validiert jedoch nicht den
gesamten im Prototyp implementierten Loop.

Im System wird ein von der lernenden Person formulierter nächster
Schritt gespeichert und in einer späteren Sitzung erneut aufgegriffen.
Wurde er umgesetzt, kann die Person reflektieren, was die Umsetzung
ermöglicht hat. Wurde er nicht umgesetzt, kann der Schritt
konkretisiert, verkleinert oder an einen geeigneteren Kontext gebunden
werden. Das Speichern, spätere Wiederaufgreifen und iterative Anpassen
des Schritts sind eigene Designentscheidungen. Sie erweitern das Prinzip
der Implementation Intention um eine sitzungsübergreifende Rückkopplung.

Die Metaanalyse von Gollwitzer und Sheeran (2006) zeigt, dass
Implementation Intentions die Zielerreichung über unterschiedliche
Anwendungsfelder hinweg unterstützen können. Daraus folgt jedoch kein
Wirksamkeitsnachweis für den Erster Schritt Loop des Agenten. Ob die im
Dialog formulierten Schritte tatsächlich umgesetzt werden und welche
Bedeutung der Loop für die Pilotstudie besitzt, muss anhand der
erhobenen Daten getrennt untersucht werden.

### 3.4.5 Sprachliche Begrenzungen

Die Gesprächslogik begrenzt wertende und personenbezogen typisierende
Aussagen. Der Agent soll keine stabilen Eigenschaften aus einzelnen
Äußerungen ableiten, keine unbegründeten Prognosen formulieren und
Fortschritt nicht durch pauschales Lob bewerten. Wenn positive
Entwicklung aufgegriffen wird, soll sich die Rückmeldung auf konkret
beobachtbare Aussagen, Entscheidungen oder Handlungen beziehen. Diese
Regel schützt die Eigenattribution der lernenden Person, ohne zu
behaupten, dass jede Form von Lob grundsätzlich motivationsschädlich
ist.

Auch der Verzicht auf unmittelbare Ratschläge ist keine absolute Regel.
Primär soll der Agent durch Fragen und begrenztes Scaffolding
Eigenaktivität erhalten. Wenn notwendige Kontextinformation fehlt oder
eine rein fragende Reaktion die Bearbeitung blockieren würde, kann kurze
strukturierende Information zulässig sein. Damit bleibt das
Gesprächsprinzip mit der in Abschnitt 3.1 formulierten Anforderung
variabler Unterstützung vereinbar.

Abschnitt 3.4 beschreibt somit eine regelbasierte Gesprächsspezifikation
und kein validiertes psychologisches Interventionsprogramm. Die vier
Modi, sechs projektspezifischen Fragetypen, Sitzungsprogression und der
Erster Schritt Loop sind zentrale Bestandteile des Designartefakts.
Kapitel 4 muss ihre technische Einhaltung und, soweit Daten vorliegen,
ihre Nutzung im Feld getrennt von psychologischen Wirkungsbehauptungen
evaluieren.

## 3.5 Gedächtnis und persistente Personalisierung

Die sitzungsübergreifende Personalisierung wird durch externe
Kontextspeicher realisiert. Sie verändert nicht die Parameter des
zugrunde liegenden Sprachmodells. Gespeicherte Informationen werden bei
späteren Anfragen erneut als Kontext bereitgestellt. Diese Architektur
erlaubt eine Trennung zwischen Basismodell und nutzerspezifischem
Gedächtnis. Sie bedeutet jedoch nicht, dass die Verarbeitung der in den
Kontext aufgenommenen Daten ausschließlich innerhalb der eigenen
Infrastruktur erfolgt. Werden solche Informationen an eine externe
Modellschnittstelle übermittelt, findet dort ebenfalls eine Verarbeitung
statt. Die datenschutzrechtliche Bewertung richtet sich daher nach dem
tatsächlichen Datenfluss und nicht allein danach, ob ein Modelltraining
stattfindet.

Die erste Speicherebene enthält den zu Studienbeginn erhobenen
Ausgangskontext. Dazu können das Lernziel und ausgewählte Ergebnisse der
Eingangserhebung gehören. GSE und MSLQ Werte sind dabei primär
Forschungsvariablen. Werden sie zusätzlich als Promptkontext verwendet,
beeinflussen sie potenziell die vom Agenten erzeugte Gesprächsführung
und werden damit zugleich Bestandteil der Intervention. Dieser
Doppelgebrauch muss in Kapitel 4 transparent dokumentiert und bei der
Interpretation berücksichtigt werden. Ein unveränderter Ausgangskontext
kann die Studienbedingungen standardisieren. Er sichert jedoch nicht die
interne Validität eines Prä Post Vergleichs.

Ein automatisch erzeugter Profiltext ist methodisch besonders sensibel.
Er verdichtet Messwerte und weitere Angaben zu einer interpretativen
Beschreibung der lernenden Person. Dadurch können zusätzliche Annahmen
entstehen, die nicht unmittelbar in den Ausgangsdaten enthalten sind.
Für die Pilotstudie sollte ein solcher Profiltext deshalb nur verwendet
werden, wenn seine konkrete Funktion für die Adaptation spezifiziert,
seine Erzeugungsregel fixiert und sein zusätzlicher Nutzen gegenüber den
strukturierten Ausgangsdaten begründet ist. Andernfalls erhöht er sowohl
die Interpretationsunsicherheit als auch den Umfang personenbezogener
Profilinformationen.

Die zweite Speicherebene enthält strukturierte Informationen aus
einzelnen Sitzungen. Für die sitzungsübergreifende Gesprächsführung sind
insbesondere ein selbst formulierter nächster Handlungsschritt und eine
knappe Zusammenfassung relevanter Gesprächsinhalte funktional
begründbar. Weitere Felder wie Stimmung, Reibungspunkte oder ein
automatisch ausgewähltes stärkstes Zitat dürfen nicht allein deshalb
dauerhaft gespeichert werden, weil sie technisch verfügbar sind. Nach
dem Grundsatz der Datenminimierung müssen gespeicherte personenbezogene
Daten für den jeweiligen Zweck angemessen, erheblich und auf das
notwendige Maß beschränkt sein (Europäische Union, 2016).

Wörtliche Nutzeräußerungen können für spätere Rückbezüge nützlich sein,
erhöhen aber zugleich die Menge potenziell sensibler Freitextdaten. Für
Widerspruchsfragen oder Rückblicke ist daher zu prüfen, ob ein
vollständiges Zitat erforderlich ist oder eine kürzere, sachlich
begrenzte Repräsentation denselben Zweck erfüllt. Ein Feld wie
strongest_quote ist keine psychometrische Variable und besitzt ohne
definierte Auswahlkriterien keine eigenständige wissenschaftliche
Bedeutung. Wird es verwendet, muss dokumentiert werden, nach welchen
Regeln eine Äußerung ausgewählt und für welche Funktion sie später
erneut eingebracht wird.

Die dritte Speicherebene ermöglicht eine semantische Suche über frühere
Gesprächsinhalte. Technisch kann eine vektorbasierte Repräsentation
relevante frühere Passagen für eine neue Anfrage auffindbar machen. Für
die Forschungsfrage ist jedoch nicht die verwendete Datenbanktechnologie
entscheidend, sondern die Retrievalregel. Dokumentiert werden müssen
insbesondere welche Inhalte indexiert werden, wie viele frühere
Fragmente abgerufen werden und unter welchen Bedingungen sie in den
Modellkontext gelangen. Die technische Implementierung mit einer
konkreten Datenbankerweiterung gehört in die Systemdokumentation und ist
keine eigenständige theoretische Designanforderung.

Die Personalisierung muss für Nutzende kontrollierbar bleiben.
Gespeicherte oder inferierte Angaben können unvollständig oder falsch
sein. Deshalb sollen relevante Profilinformationen und wiederverwendete
Erinnerungen einsehbar und, soweit technisch vorgesehen, korrigierbar
oder löschbar sein. Diese Anforderung folgt zugleich aus der
epistemischen Unsicherheit automatischer Profilbildung und aus
datenschutzrechtlichen Grundsätzen wie Transparenz, Richtigkeit,
Datenminimierung und Speicherbegrenzung (Europäische Union, 2016).
Pseudonymisierte Gedächtnisdaten bleiben personenbezogene Daten, solange
eine Zuordnung mit zusätzlichen Informationen möglich ist.

Der bisher vorgesehene Lernfaden wird daher als nutzerseitige
Darstellung ausgewählter, für die Lernbegleitung relevanter Erinnerungen
verstanden und nicht als möglichst vollständige Chronik. Ein Export oder
eine Löschung kann Betroffenenrechte technisch unterstützen. Ob daraus
im konkreten Fall unmittelbar ein Anspruch nach einem bestimmten Artikel
der Datenschutz Grundverordnung folgt, wird in Abschnitt 3.6 anhand der
jeweiligen Verarbeitung und Voraussetzungen eingeordnet.

Auch offene Fragen am Sitzungsende werden nicht mit einem behaupteten
Zeigarnik Effekt begründet. Der klassische Effekt beschreibt eine
Gedächtnistendenz für unterbrochene oder unvollständige Aufgaben. Daraus
folgt nicht, dass eine absichtlich ungelöste Frage in einem Lernagenten
Motivation, Wiederkehr oder Lernerfolg zuverlässig steigert. Eine offene
Abschlussfrage kann als Gesprächs und Übergangsentscheidung des
Prototyps eingesetzt werden, benötigt für ihre technische Funktion aber
keine psychologische Wirkungsbehauptung.

Die produktive Pilotversion nutzte ausschließlich das qualitative
Lernendenprofil und kumulative Session Summaries als Gedächtniskontext.
Eine Datenbankstruktur für semantisches Retrieval mit pgvector war zwar
angelegt, wurde jedoch nicht in die Chatlogik eingebunden. Embeddings
wurden nicht geschrieben und ein semantischer Abruf fand während der
Pilotstudie nicht statt.

Das Gedächtnis ist damit kein eigenständiger Wirkmechanismus, sondern
Infrastruktur für Kontinuität und begrenzte Personalisierung. Seine
wissenschaftliche Bewertung muss drei Fragen trennen. Erstens ist zu
prüfen, ob relevante Informationen technisch korrekt gespeichert und
wiedergefunden werden. Zweitens ist zu prüfen, ob die wiederverwendeten
Informationen die vorgesehene Gesprächsfunktion unterstützen. Drittens
ist zu prüfen, ob Umfang und Dauer der Speicherung gegenüber
Forschungszweck und Datenschutzanforderungen gerechtfertigt sind. Eine
technische Funktionsprüfung des Gedächtnisses belegt weder einen
Lerneffekt noch eine valide psychologische Profilbildung.

## 3.6 Compliance Design

Abschnitt 2.6 grenzt die für den Prototyp relevanten rechtlichen
Anforderungen ein. Die Konzeption übersetzt diese Anforderungen in
technische und organisatorische Maßnahmen. Dabei wird zwischen
gesetzlichen Pflichten, möglichen technischen Umsetzungen und
freiwilligen Schutzmaßnahmen unterschieden. Eine implementierte Funktion
wird nicht allein deshalb als rechtskonform bezeichnet. Die rechtliche
Bewertung hängt vom konkreten Verarbeitungsvorgang, den Rollen der
Beteiligten und der tatsächlichen Systemkonfiguration ab.

Datenschutz durch Technikgestaltung wird im Prototyp durch begrenzte
Datenspeicherung, Pseudonymisierung, Zugriffsbeschränkungen und
getrennte Verarbeitungskontexte umgesetzt. Artikel 25 der Datenschutz
Grundverordnung verlangt geeignete technische und organisatorische
Maßnahmen sowie datenschutzfreundliche Voreinstellungen (Europäische
Union, 2016). Der Betrieb der eigenen Anwendungs und
Datenbankkomponenten innerhalb der Europäischen Union reduziert
bestimmte Transferfragen. Er schließt Drittlandverarbeitung jedoch nicht
aus, wenn Gesprächsinhalte an einen externen Sprachmodellanbieter
außerhalb des Europäischen Wirtschaftsraums übermittelt werden.

Für externe Sprachmodelldienste müssen deshalb die
datenschutzrechtlichen Rollen und tatsächlichen Datenflüsse dokumentiert
werden. Liegt eine Auftragsverarbeitung vor, richtet sich die
vertragliche Absicherung nach Artikel 28 der Datenschutz
Grundverordnung. Erfolgt eine Übermittlung personenbezogener Daten in
ein Drittland, sind zusätzlich die Voraussetzungen des fünften Kapitels
zu prüfen. Standarddatenschutzklauseln können nach Artikel 46 eine
geeignete Garantie darstellen. Ihre bloße Existenz belegt jedoch nicht
automatisch die Zulässigkeit jeder konkreten Übermittlung. Für die
Thesis werden daher Anbieter, Verarbeitungsort, Vertragsgrundlage und
Übermittlungsmechanismus der tatsächlich eingesetzten
Studienkonfiguration dokumentiert.

Die Transparenz gegenüber den Teilnehmenden wird auf zwei Ebenen
umgesetzt. Erstens informiert das Onboarding vor Beginn der Interaktion
darüber, dass die Lernbegleitung durch ein KI System erfolgt. Diese
Maßnahme setzt die Transparenzanforderung aus Artikel 50 Absatz 1 des EU
AI Acts für unmittelbar mit natürlichen Personen interagierende KI
Systeme um. Diese Vorschrift ist seit dem 2. August 2026 anwendbar und
wurde durch die Verordnung (EU) 2026/1744 nicht auf einen späteren
Zeitpunkt verschoben (Europäische Union, 2024; Europäische Union, 2026).
Zweitens werden die Teilnehmenden über Zweck, Kategorien und Empfänger
der personenbezogenen Daten sowie über Speicherdauer und
Betroffenenrechte informiert. Diese datenschutzrechtlichen Informationen
sind von der KI Kennzeichnung zu unterscheiden.

Artikel 22 der Datenschutz Grundverordnung wird nicht als allgemeine
Grundlage des Transparenz Layers verwendet. Die Vorschrift betrifft
ausschließlich auf automatisierter Verarbeitung beruhende Entscheidungen
mit rechtlicher oder ähnlich erheblicher Wirkung. Der Prototyp trifft
nach seinem vorgesehenen Verwendungszweck keine solchen Entscheidungen.
Die Anzeige eines aktiven Gesprächsmodus oder die Möglichkeit, eine
Systeminterpretation zu korrigieren, sind daher Designmaßnahmen für
Nachvollziehbarkeit und Nutzerkontrolle. Sie stellen nicht die Umsetzung
einer aus Artikel 22 folgenden Anfechtungspflicht dar.

Die Einwilligung der Teilnehmenden wird ebenfalls von der technischen
Oberfläche getrennt betrachtet. Eine anklickbare Zustimmung macht eine
Einwilligung nicht automatisch wirksam. Soweit die Datenverarbeitung in
der Pilotstudie auf Artikel 6 Absatz 1 Buchstabe a gestützt wird, müssen
die Bedingungen der Einwilligung erfüllt sein. Für besondere Kategorien
personenbezogener Daten ist zusätzlich Artikel 9 zu berücksichtigen. Der
vorgesehene Einwilligungsprozess muss deshalb Zweck, Datenarten,
Empfänger, mögliche Drittlandverarbeitung, Widerrufsmöglichkeiten und
Folgen eines Widerrufs verständlich abbilden. Die konkrete
Studieninformation und Einwilligungserklärung werden im Anhang
dokumentiert.

Die Anwendung unterstützt die Ausübung von Betroffenenrechten durch
Funktionen zur Einsicht, Korrektur und Löschung gespeicherter
Informationen. Ein Datenexport kann die praktische Wahrnehmung des
Rechts auf Datenübertragbarkeit unterstützen. Aus der Existenz einer
Export oder Löschfunktion folgt jedoch nicht, dass damit sämtliche
gesetzlichen Voraussetzungen und Verfahrenspflichten der Artikel 15 bis
21 vollständig umgesetzt sind. Für wissenschaftliche Forschungsdaten
können zudem besondere rechtliche Voraussetzungen und Einschränkungen
relevant sein. Deshalb werden technische Funktionen und rechtliche
Ansprüche in der Arbeit nicht gleichgesetzt.

Die Erkennung von Krisensprache wird als freiwillige Schutzmaßnahme des
Forschungsprototyps behandelt. Sie ist keine aus den hier geprüften
Vorschriften unmittelbar abgeleitete Pflicht für einen Lernagenten. Bei
einem definierten Krisenmuster soll die normale Lerninteraktion
unterbrochen und ein standardisierter Hinweis auf geeignete
Hilfsangebote ausgegeben werden. Der Agent soll in dieser Situation
keine therapeutische Beratung übernehmen. Die technische Evaluation
prüft, ob definierte Testfälle die vorgesehene Schutzreaktion auslösen.
Ein bestandener Test belegt die korrekte Umsetzung der spezifizierten
Regel und nicht die zuverlässige Erkennung sämtlicher realer
Krisensituationen.

Das Compliance Design ist damit kein eigenständiger Nachweis
vollständiger Rechtskonformität. Es dokumentiert, wie identifizierte
rechtliche und ethische Anforderungen in die Architektur des
Forschungsprototyps übersetzt werden. Für die wissenschaftliche
Evaluation sind insbesondere die dokumentierte KI Kennzeichnung, die
Nachvollziehbarkeit der Datenflüsse, die Zugriffsbeschränkung, die Lösch
und Korrekturmöglichkeiten sowie die definierte Reaktion auf
Krisentestfälle prüfbar. Rechtliche Bewertung und technische
Funktionsprüfung bleiben dabei getrennte Ebenen.

Kapitel 3 spezifiziert damit das Forschungsartefakt auf drei Ebenen. Die
Designanforderungen definieren die aus Kapitel 2 abgeleiteten
Zielkriterien. Architektur, Adaptionslogik und Gedächtnis übersetzen
diese Kriterien in prüfbare Systemfunktionen. Das Compliance Design
begrenzt ihre technische Umsetzung durch rechtliche und ethische
Anforderungen. Die beschriebenen Komponenten sind Designentscheidungen
und keine vorweggenommenen Wirkungsnachweise. Kapitel 4
operationalisiert deshalb getrennt die technische Funktionsprüfung, die
Evaluation des Sprachmodellverhaltens und die explorative Untersuchung
der Nutzungs und Outcome Daten.
