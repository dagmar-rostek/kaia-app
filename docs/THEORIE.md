# Kapitel 2 — Theoretischer Hintergrund

> **Stand:** 06. Juni 2026 · **Version:** 1.4  
> **Reviewer:** Psychologe (2.2–2.11) ✓ · Didaktiker (2.11) ✓ · AI Engineer (2.10) · Architect (2.12)  
> **Nächste Revision:** bei inhaltlicher Erweiterung oder neuen Quellenfunden  
>
> *Dieses Dokument ist ein lebendiger Thesis-Draft. Abschnitte mit ✓ sind durch den Psychologen freigegeben.*  
> *v1.4: Abschnitt 2.11 — Selbstreguliertes Lernen + "Lernen lernen"-Hypothese + Transfer-Limitierung*

---

## Überblick und Leitfragen

Das vorliegende Kapitel entwickelt das theoretische Fundament, auf dem KAIA als sokratischer KI-Lernbegleiter konzipiert ist. Die Forschungsfrage — inwieweit KI-gestützte, sokratische Lernbegleitung die allgemeine Selbstwirksamkeitserwartung von Lernenden beeinflusst — berührt mindestens vier Theoriefelder, die in einer Wechselbeziehung zueinander stehen: lerntheoretische und didaktische Grundlagen, psychologische Konstrukte des Lernens und Leistens, kognitionswissenschaftliche Erkenntnisse zu optimaler Aktivierung und Flow sowie aktuelle Ansätze der KI-gestützten Bildungstechnologie.

Die theoretische Rahmung folgt drei Leitfragen:

1. *Warum ist sokratische Begleitung didaktisch der instruktionalen Direktheit überlegen?* (Abschnitte 2.1, 2.5)
2. *Über welche psychologischen Mechanismen kann ein KI-System Selbstwirksamkeit und Lernerfolg beeinflussen?* (Abschnitte 2.2, 2.3, 2.4, 2.6)
3. *Welche Implikationen ergeben sich aus der empirischen KI-Forschung für ein ethisch vertretbares, adaptives System?* (Abschnitte 2.7, 2.8)

Abschnitt 2.9 kontextualisiert die Studie methodologisch im Design Science Research-Paradigma. Abschnitt 2.10 führt die Stränge zu einem synthetischen Rahmenwerk zusammen, aus dem die Forschungshypothesen unmittelbar abgeleitet werden.

---

## 2.1 Lerntheorie und Didaktik: Konstruktivismus und Sokratische Begleitung

Das lerntheoretische Fundament von KAIA ist konstruktivistisch. Konstruktivistische Lerntheorien — maßgeblich geprägt durch Piaget (1952) und Vygotsky (1978) — gehen davon aus, dass Wissen nicht passiv rezipiert, sondern aktiv konstruiert wird. Lernen ist kein Transferprozess, sondern ein Prozess der Bedeutungskonstruktion: Lernende verbinden neue Informationen mit bestehenden kognitiven Schemata, prüfen Widersprüche, restrukturieren Konzepte und bilden dadurch neues, anwendbares Wissen.

Vygotskys Konzept der Zone der nächsten Entwicklung (ZPD, Vygotsky, 1978) präzisiert, unter welchen Bedingungen dieser Konstruktionsprozess gelingt. Die ZPD bezeichnet den Abstand zwischen dem, was eine Person eigenständig leisten kann, und dem, was sie unter kompetenter Unterstützung zu leisten vermag. Lernförderliche Unterstützung — ob durch Peers, Lehrkräfte oder technische Systeme — sollte genau in dieser Zone ansetzen: weder zu einfach (dann findet kein Lernen statt) noch zu schwierig (dann übersteigt die Anforderung die Kapazität). Entscheidend ist dabei, dass die Unterstützung schrittweise zurückgezogen wird, sobald die Lernperson die neuen Fähigkeiten internalisiert hat (Scaffolding, Wood, Bruner & Ross, 1976).

Die sokratische Methode — benannt nach dem dialogischen Lehrverfahren des Sokrates, überliefert durch Platons Dialoge — operationalisiert genau dieses Prinzip auf didaktischer Ebene. Anstatt Wissen zu übermitteln, versucht der Lehrende durch gezielte Fragen, latentes Wissen und eigene Erkenntniskapazitäten der lernenden Person zu aktivieren. Der Mäeutik-Gedanke — die Hebammenkunst des Geistes — beschreibt, dass Wissen im Gegenüber "geboren", nicht "hineingelegt" wird. In der modernen Didaktik findet diese Tradition ihren Niederschlag in Ansätzen des Guided Discovery Learning (Bruner, 1961) und des dialogischen Unterrichts (Alexander, 2008): Lernen entsteht im Gespräch, durch Fragen, Widerspruch und Elaboration.

Für KAIA bedeutet dies eine klare Systemlogik: KAIA gibt keine Antworten. KAIA stellt Fragen. Diese Entscheidung ist nicht Stilpräferenz, sondern lerntheoretisches Design — sie schützt den konstruktivistischen Lernprozess vor kurzschlüssiger Instruktionsdirektheit und schafft Raum für die Eigenleistung, die Selbstwirksamkeitserfahrungen erst möglich macht.

---

## 2.2 Selbstwirksamkeitserwartung als lernpsychologisches Konstrukt ✓

Die Selbstwirksamkeitserwartung (englisch: self-efficacy) bezeichnet nach Bandura (1977) die subjektive Überzeugung einer Person, in der Lage zu sein, eine bestimmte Handlung erfolgreich auszuführen und damit ein angestrebtes Ziel zu erreichen. Das Konstrukt ist sorgfältig von verwandten, aber konzeptuell unterschiedlichen Begriffen abzugrenzen. Das Selbstkonzept beschreibt eine globalere, bereichsübergreifende Selbstwahrnehmung eigener Eigenschaften und Fähigkeiten, während Selbstvertrauen ein affektiv gefärbtes, wenig situationsspezifisches Zutrauen in die eigene Person meint. Die Kompetenzerwartung hingegen bezieht sich auf tatsächliche, oft objektiv messbare Fertigkeiten. Selbstwirksamkeitserwartung im Sinne Banduras ist dagegen explizit aufgabenspezifisch, zukunftsorientiert und handlungsbezogen: Sie beantwortet nicht die Frage "Was kann ich?", sondern "Werde ich in der Lage sein, diese konkrete Anforderung zu bewältigen?" (Bandura, 1997). Diese Spezifität ist sowohl theoretische Stärke als auch praktische Herausforderung bei der Operationalisierung.

Bandura (1977, 1997) beschreibt vier Quellen, aus denen Selbstwirksamkeitsüberzeugungen gespeist werden. Die stärkste und direkteste Quelle sind Handlungsergebniserfahrungen (mastery experiences): wiederholte eigene Erfolgserlebnisse bei vergleichbaren Aufgaben stärken die Überzeugung, auch zukünftige Anforderungen meistern zu können — Misserfolge schwächen sie entsprechend. Als zweite Quelle gelten stellvertretende Erfahrungen (vicarious experiences): das Beobachten anderer, ähnlich kompetenter Personen bei erfolgreichem Handeln. Drittens wirken verbale Überzeugungen (verbal persuasion), etwa durch Feedback und Ermutigung Dritter, auf die Selbstwirksamkeit ein, wenngleich ihre Wirkung flüchtiger und von geringerer Nachhaltigkeit ist als direkte Erfolgserfahrungen. Viertens beeinflussen physiologische und affektive Zustände (physiological and affective states) — Anspannung, Angst, Erschöpfung — die wahrgenommene Handlungsfähigkeit, da körperliche Erregung als Signal über eigene Kapazitäten interpretiert wird.

Für Lernprozesse und Leistungsverhalten hat die Selbstwirksamkeitserwartung empirisch gut belegte Konsequenzen. Höhere Selbstwirksamkeit geht einher mit der Wahl anspruchsvollerer Aufgaben, größerer Ausdauer bei Schwierigkeiten, stärkerem Einsatz kognitiver Strategien sowie besseren Leistungsergebnissen (Bandura, 1997; Pajares, 1996). Der Zusammenhang ist dabei bidirektional: Selbstwirksamkeit beeinflusst Leistung, und Leistungserfahrungen formen Selbstwirksamkeit. Meta-analytische Befunde bestätigen moderate bis starke Prädiktionskraft für akademische Leistung (Multon, Brown & Lent, 1991).

Für die vorliegende Studie wird die Allgemeine Selbstwirksamkeitserwartung nach Schwarzer und Jerusalem (1995) als Outcome-Maß eingesetzt. Die deutschsprachige Skala umfasst zehn Items im Likert-Format (1 = stimmt nicht bis 4 = stimmt genau) und erfasst eine generalisierte, aufgabenübergreifende Überzeugung, Schwierigkeiten aus eigener Kraft bewältigen zu können. Psychometrisch weist die Skala gute Kennwerte auf: Cronbachs Alpha liegt in verschiedenen Stichproben zwischen .80 und .90, die Test-Retest-Reliabilität ist hinreichend stabil (Schwarzer & Jerusalem, 1995). Konvergente Validität zeigt sich in erwartungskonformen Zusammenhängen mit Optimismus, Kontrollüberzeugung und akademischer Leistung; divergente Validität durch Abgrenzung zu Angst und Depression. Kritisch ist anzumerken, dass die Skala generalisierte Überzeugungen misst und damit aufgabenspezifische Veränderungen nur indirekt abbildet. Für den Kontext sokratischer Lernbegleitung ist jedoch plausibel, dass nachhaltige Unterstützungserfahrungen — insbesondere durch die Stärkung der Handlungsergebniserfahrung als stärkste Quelle der Selbstwirksamkeit — langfristig auch globale Überzeugungen verschieben. KAIA zielt genau auf diese Wirkungslogik: durch wiederholte, eigenständig erarbeitete Erkenntniserlebnisse in dialogischer Begleitung die selbstwirksamkeitsstärkende Erfahrung des "Ich habe es selbst herausgefunden" zu ermöglichen.

---

## 2.3 Kognitives Stressbewältigungsmodell nach Lazarus und Folkman ✓

Stress ist im Alltagsverständnis häufig als objektive Eigenschaft einer Situation konzipiert — als würde eine Prüfung per se Stress erzeugen. Das transaktionale Stressmodell von Lazarus und Folkman (1984) bricht mit dieser Sichtweise grundlegend: Stress entsteht nicht in der Situation, sondern im Bewertungsprozess einer Person im Verhältnis zu dieser Situation. Das Modell postuliert zwei aufeinanderfolgende, in der Praxis jedoch dynamisch verschränkte Bewertungsprozesse.

In der primären Bewertung (primary appraisal) schätzt eine Person ein, ob ein Ereignis für sie persönlich relevant ist — und wenn ja, ob es als irrelevant, günstig-positiv oder stressbezogen einzustufen ist. Stressbezogene Einschätzungen differenzieren sich weiter in Schaden/Verlust (ein negatives Ergebnis ist bereits eingetreten), Bedrohung (ein negatives Ergebnis wird antizipiert) und Herausforderung (eine Situation, die als bewältigbar und potenziell gewinnbringend bewertet wird). In der sekundären Bewertung (secondary appraisal) schätzt die Person ihre verfügbaren Bewältigungsressourcen ein: Was kann ich tun? Reichen meine Mittel? Wer kann mir helfen? Es ist das Zusammenspiel beider Bewertungen — wahrgenommene Anforderung und wahrgenommene Ressource —, das über das Ausmaß des erlebten Stresses entscheidet (Lazarus, 1993). Folglich kann dieselbe Prüfungssituation von einer Person als bewältigbare Herausforderung, von einer anderen als bedrohliche Überforderung erlebt werden.

Diese subjektive Bewertungslogik hat unmittelbare Relevanz für Lernsituationen. Prüfungsangst, erlebte Überforderung durch neue Lerninhalte und Flow-Störungen sind nicht als unmittelbare Reaktionen auf objektive Schwierigkeitsgrade zu verstehen, sondern als Resultat individueller Bewertungsprozesse vor dem Hintergrund verfügbarer Ressourcen und früherer Erfahrungen. Ein Lerninhalt, der für eine Person herausfordernd-stimulierend ist, kann für eine andere lähmend-bedrohlich wirken — nicht weil der Inhalt sich unterscheidet, sondern weil sich die wahrgenommene Passung zwischen Anforderung und Ressource unterscheidet.

Für das Design von KAIA ergibt sich aus diesem Modell eine spezifische Designlogik. Ein instruktional vorgehender KI-Tutor, der fertige Antworten liefert, adressiert den Bewertungsprozess nicht: er reduziert zwar kurzfristig die wahrgenommene Anforderung, stärkt jedoch nicht die wahrgenommene Ressource. Sokratische Begleitung hingegen zielt direkt auf die sekundäre Bewertung: durch begleitetes, eigenständiges Erarbeiten von Lösungswegen wird die Überzeugung gestärkt, über ausreichende kognitive Ressourcen zu verfügen. KAIAs Haltung — keine Antworten zu geben, sondern Fragen zu stellen, die zum Nachdenken einladen — ist damit nicht bloß eine pädagogische Stilentscheidung, sondern eine theoretisch begründete Intervention in den Bewertungsprozess: Sie stärkt die wahrgenommene Handlungsfähigkeit und verschiebt die Einschätzung einer Situation von "Bedrohung" in Richtung "bewältigbare Herausforderung".

---

## 2.4 Optimale Aktivierung, Flow und neuroadaptives Lernen ✓

Die Frage, unter welchen Bedingungen Menschen optimal lernen und leisten, beschäftigt die Psychologie seit mehr als einem Jahrhundert. Eine der frühesten und einflussreichsten Antworten liefert das Gesetz von Yerkes und Dodson (1908): zwischen dem Grad physiologischer Erregung (Arousal) und der Leistungsgüte besteht kein linearer, sondern ein umgekehrt U-förmiger Zusammenhang. Zu niedrige Aktivierung führt zu Unterstimulation, Langeweile und nachlassender Aufmerksamkeit; zu hohe Aktivierung erzeugt Überforderung, Angst und Leistungseinbrüche. Optimale Leistung liegt im mittleren Aktivierungsbereich, wobei das Optimum je nach Aufgabenkomplexität variiert: komplexe kognitive Aufgaben erfordern ein niedrigeres Optimum als einfache Routineaufgaben. Diese Grundaussage hat sich in der Lernpsychologie als robustes Orientierungsprinzip erhalten, wenngleich die neurophysiologische Ursprungsinterpretation von Yerkes und Dodson heute als vereinfachend gilt.

Teigen (1994) hat die Yerkes-Dodson-Kurve einer kritischen Revision unterzogen. Er argumentiert, dass das Modell in seiner klassischen Form empirisch schwer überprüfbar ist, da "Aktivierung" als einheitliches Konstrukt theoretisch problematisch bleibt: verschiedene Formen physiologischer Erregung haben unterschiedliche, teils entgegengesetzte Wirkungen auf Leistung. Teigens situative Optimum-Theorie verschiebt den Fokus von stabilen Kurvenformen hin zu aufgaben- und kontextabhängigen Optimumzonen. Das Entscheidende ist nicht ein universelles Aktivierungsniveau, sondern die individuelle Passung zwischen Anforderungsniveau und aktuellem Zustand einer Person in einer konkreten Situation. Diese Relativierung ist für adaptive Lernsysteme bedeutsam: es gibt kein universell richtiges Schwierigkeitsniveau, sondern nur eine situativ optimale Passung.

Csikszentmihalyi (1990) hat mit dem Flow-Konzept eine verwandte, jedoch phänomenologisch reichhaltigere Perspektive eingeführt. Flow bezeichnet einen optimalen Erlebenszustand vollständiger Aufmerksamkeit und mühelosen Aufgehens in einer Tätigkeit, gekennzeichnet durch das Erleben von Kontrolle, Zeitvergessenheit und intrinsischer Befriedigung. Das vielzitierte Kanalmodell beschreibt, dass Flow dann entsteht, wenn Anforderungsniveau und wahrgenommene Kompetenz im Gleichgewicht sind und beide auf einem hinreichend hohen Niveau liegen. Unterschreitet das Anforderungsniveau die Kompetenz, entsteht Langeweile; übersteigt es die Kompetenz, entsteht Angst. Beide Zustände unterbrechen den Flow-Kanal. Für Lernkontexte bedeutet dies, dass der optimale Lernzustand weder durch zu einfache noch durch zu schwierige Aufgaben erreichbar ist — und dass die Einschätzung von Kompetenz und Anforderung subjektiv ist, nicht objektiv.

Oliveira und Hamari (2024) haben den Forschungsstand zu Flow in digitalen Lernumgebungen systematisch analysiert. Ihre Befunde zeigen, dass Flow in gamifizierten und KI-gestützten Lernplattformen durch klar definierte Ziele, unmittelbares Feedback und eine dynamische Anpassung des Schwierigkeitsgrades gefördert wird. Entscheidend ist dabei die Kontinuität der Herausforderung: Pausen im Anforderungsniveau oder abrupte Sprünge in der Komplexität unterbrechen den Flow-Zustand zuverlässig. Zugleich betonen Oliveira und Hamari (2024), dass Flow in Lernsystemen nicht algorithmisch "erzeugt", sondern allenfalls begünstigt werden kann — die subjektive Erfahrung bleibt unverfügbar, das System kann nur Rahmenbedingungen schaffen.

Der neuroadaptive Modus von KAIA übersetzt diese theoretischen Erkenntnisse in eine konkrete Designlogik: Das System versucht, auf Basis von Gesprächsindikatoren — Antwortlänge, Fragehäufigkeit, erkennbare Verwirrung oder Stagnation — eine Einschätzung des aktuellen Aktivierungs- und Kompetenzniveaus zu entwickeln und den Gesprächsstil entsprechend anzupassen. Dieser Anspruch ist theoretisch fundiert, muss aber mit methodischer Ehrlichkeit kommuniziert werden: die reliable Erkennung von Flow-Zuständen aus Texteingaben allein ist eine offene empirische Frage, keine gelöste technische Aufgabe.

---

## 2.5 Expertise Reversal Effect und die Grenzen instruktionaler KI-Unterstützung ✓

Dass gute Erklärungen Lernen fördern, gilt in der Alltagspädagogik als Selbstverständlichkeit. Die Cognitive Load Theory (Sweller, 1988; Sweller, van Merriënboer & Paas, 1998) differenziert diesen Befund erheblich. Das Modell unterscheidet drei Formen kognitiver Belastung: intrinsischen Load, der durch die inhärente Komplexität des Lernstoffs entsteht; extrinsischen Load, der durch ungünstige Aufbereitung des Materials erzeugt wird; sowie lernrelevanten Load (germane load), der die kognitiven Ressourcen bezeichnet, die tatsächlich für den Aufbau von Schemata verfügbar sind. Lernförderliche Gestaltung reduziert extrinsische Belastung und maximiert lernrelevante Verarbeitungskapazität.

Kalyuga, Ayres, Chandler und Sweller (2003) haben in einer Reihe von Studien gezeigt, dass Instruktionsformate, die für Novizen hocheffektiv sind — ausführliche Erklärungen, vollständige Beispiele, schrittweise Anleitungen —, für fortgeschrittene Lernende ihre Wirkung verlieren oder gar umkehren. Dieses Phänomen bezeichnen sie als Expertise Reversal Effect. Der Grund: Experten haben bereits stabile mentale Schemata aufgebaut. Ausführliche Instruktionen, die für Novizen kognitive Entlastung bieten, erzeugen bei Experten redundante Informationsverarbeitung, die kognitive Ressourcen bindet, statt sie freizusetzen. Die Instruktion "stört" die eigene, effizientere Verarbeitung (Kalyuga, 2007). Die Konsequenz ist eine zwingende: Lernunterstützung muss nicht nur auf den Lernstoff, sondern auf den Wissensstand der lernenden Person zugeschnitten sein — und mit steigendem Expertise-Niveau zunehmend zurücktreten.

Für KI-gestütztes Tutoring bedeutet dieser Befund eine konkrete Designentscheidung gegen instruktionale Direktheit. Ein System, das auf jede Nutzerfrage eine vollständige, gut strukturierte Antwort liefert, optimiert für Novizen — und schadet damit potenziell fortgeschrittenen Lernenden, die von diesem Moment an selbstständig weiterdenken könnten, es aber nicht tun, weil die Antwort bereits vorliegt. Darüber hinaus wird durch die konsequente Bereitstellung von Antworten die Entwicklung metakognitiver Kompetenzen gehemmt: Lernende, die sich an instruktionale Unterstützung gewöhnen, entwickeln weniger Strategien zur eigenständigen Problemlösung (Kalyuga, 2007).

KAIAs bewusste Entscheidung, keine Antworten zu geben und stattdessen ausschließlich Fragen zu stellen, ist vor diesem Hintergrund nicht als pädagogische Prinzipienreiterei zu verstehen, sondern als theoretisch fundierte Reaktion auf den Expertise Reversal Effect: Das System hält sich instruktional zurück, um den kognitiv notwendigen Eigenanteil zu sichern — unabhängig davon, ob die lernende Person Novizin oder Expertin ist — und zielt damit auf den Aufbau eigenständiger Problemlösekompetenz statt auf die kurzfristige Reduktion wahrgenommener kognitiver Belastung.

---

## 2.6 Selbstbestimmungstheorie: Intrinsische Motivation und die Grenzen extrinsischer Verstärkung ✓

Die Selbstbestimmungstheorie (Self-Determination Theory, SDT; Deci & Ryan, 1985, 2000) ist für das Design von KAIA aus einem spezifischen Grund unverzichtbar: Sie erklärt, warum positives Feedback und externe Verstärkung Lernprozesse nicht nur nicht fördern, sondern unter bestimmten Bedingungen aktiv schädigen können — und sie gibt damit die theoretische Begründung für das sokratische Designprinzip, das auf Eigenleistung statt Bestätigung setzt.

SDT postuliert drei basale psychologische Grundbedürfnisse, deren Erfüllung intrinsische Motivation aufrechthält: das Bedürfnis nach Autonomie (selbstbestimmtes Handeln), nach Kompetenzerleben (Wirksamkeitserfahrung) und nach sozialer Eingebundenheit (relatedness). Werden diese Bedürfnisse durch das Lernumfeld unterstützt, entsteht und erhält sich intrinsische Motivation. Werden sie unterlaufen — durch externe Kontrolle, salienten Druck oder Fremdbeurteilung — verschiebt sich die Motivationsregulation in Richtung externer Kontrolliertheit.

Der sogenannte Korrumpierungseffekt (Deci, 1971; Lepper, Greene & Nisbett, 1973) belegt empirisch, dass externe Belohnungen — auch verbales Lob — die intrinsische Motivation für intrinsisch interessante Aktivitäten schwächen, wenn sie als informationskontrollierend wahrgenommen werden. Entscheidend ist Weiners (1985) Attribution-Theorie als Ergänzung: Lernförderlich wirkt Feedback dann, wenn es Erfolge auf interne, stabile und kontrollierbare Faktoren attribuiert ("Du hast gerade selbstständig Konzept X und Y verknüpft") statt auf externe Umstände oder pauschale Kompetenz ("Super gemacht!"). Attributionales Feedback stärkt Selbstwirksamkeit (Bandura, 1997), ohne Abhängigkeit von externer Bestätigung zu erzeugen.

Für KAIAs bestärkend-wertschätzenden Interaktionsmodus folgt daraus eine Gestaltungsanforderung, die über einfaches Loben hinausgeht: KAIA soll nicht bestätigen, sondern attribuieren — konkret benennen, welche Eigenleistung zum Erkenntnisfortschritt geführt hat. Dies wahrt die Autonomie-Dimension der SDT und verhindert, dass Selbstwirksamkeitsstärkung durch Fremdvalidierung unterlaufen wird.

---

## 2.7 Lernzielklassifikation nach Bloom und die taxonische Verortung von KAIAs Lernprozessen ✓

Jedes Lernsystem, das beansprucht, Lernprozesse zu fördern, muss beantworten können: Welche Art von Lernen wird angestrebt? Bloom und Kollegen (1956) haben mit ihrer Taxonomie der Lernziele im kognitiven Bereich ein Klassifikationssystem vorgelegt, das diese Frage operationalisierbar macht. Die revidierte Fassung (Anderson & Krathwohl, 2001) unterscheidet sechs hierarchisch geordnete Verarbeitungsniveaus: Erinnern, Verstehen, Anwenden, Analysieren, Bewerten, Erschaffen — wobei höhere Niveaus tiefere voraussetzen.

KAIA operiert primär auf den Niveaus Verstehen, Anwenden und Analysieren. Durch sokratisches Fragen wird das bloße Erinnern (Niveau 1) aktiv verhindert; stattdessen wird Verstehen (Niveau 2) durch Reformulierung und Verknüpfung gefördert, Anwenden (Niveau 3) durch die Verarbeitung am eigenen Lernprojekt und Analysieren (Niveau 4) durch das Hinterfragen von Annahmen im kritisch-herausfordernden Modus. Bewerten (Niveau 5) und Erschaffen (Niveau 6) sind für KAIAs Lernbegleitung kontextabhängig erreichbar, aber nicht systematisch adressiert.

Diese taxonische Verortung hat eine methodische Konsequenz: Sie begründet, warum die Allgemeine Selbstwirksamkeitserwartung (GSE) als Outcome-Maß sinnvoll ist. GSE erfasst keine taxonische Leistung — sie erfasst die handlungsbezogene Überzeugung der Lernenden, Anforderungen meistern zu können. Diese Überzeugung korreliert mit der Bereitschaft, höhere Bloom-Niveaus anzugehen. Die Verbindung zwischen taxonischer Lernzieltiefe und GSE-Veränderung ist damit theoretisch plausibel, wenn auch empirisch noch nicht direkt belegt.

---

## 2.8 Andragogik: Besonderheiten erwachsener Lernender ✓

Die Zielgruppe der KAIA-Pilotstudie sind Erwachsene in Hochschule und beruflicher Weiterbildung. Malcolm Knowles (1980, 1984) hat mit seiner Andragogik — dem Pendant zur kindorientierten Pädagogik — sechs Merkmale erwachsener Lernender herausgearbeitet, die für das Design von KAIAs Lernbegleitung direkt relevant sind.

Erstens neigen Erwachsene zu einem *selbstkonzeptbezogenen Lernbild*: Je mehr Erfahrung, desto stärker die Ablehnung von Fremdsteuerung und Bevormundung. KAIAs sokratischer Ansatz — keine Antworten, keine Instruktionen — ist für diese Zielgruppe didaktisch angemessener als direktive Wissensvermittlung. Zweitens ist Erfahrung für Erwachsene eine Lernressource: Vorerfahrungen bilden die Basis neuer Konzeptverknüpfungen. KAIAs Nutzerprofil und die Lernroadmap adressieren dies architektonisch — Vorerfahrungen werden nicht ignoriert, sondern als Kontext gespeichert und in Folgegesprächen aktiviert. Drittens orientieren sich Erwachsene an konkreten Lernbereitschaften: Sie lernen, was sie für relevante Lebensaufgaben brauchen. Die freie Themenwahl in KAIA entspricht diesem Prinzip direkt. Viertens bevorzugen Erwachsene problemzentriertes statt stoffzentriertes Lernen — ein Grundprinzip des sokratischen Dialogs. Fünftens prägt *intrinsische Motivation* das Lernverhalten stärker als externe Anreize (Knowles, 1984) — eine Begründung mehr für das SDT-konforme Design ohne externe Belohnungsstrukturen (Deci & Ryan, 1985, s. Abschnitt 2.6).

Die Andragogik ist damit keine additive Theorie neben den anderen, sondern ein Konsistenzkriterium: Sie fordert, dass KAIAs Design die Lernenden als selbstbestimmte Erwachsene behandelt — was Fragen statt Antworten, freie Themenwahl und nutzerseitige Lernroadmap-Kontrolle direkt begründet.

---

## 2.9 Feedback-Theorie: Was wirksames Feedback ausmacht ✓

Feedback ist einer der wirkungsstärksten Einflussgrößen auf Lernen. Hattie (2009) identifiziert Feedback in seiner Meta-Analyse von über 800 Studien mit einer durchschnittlichen Effektgröße von d = 0.73 als einen der stärksten Einflussfaktoren auf Lernerfolg. Hattie und Timperley (2007) differenzieren in einer vielrezipierten Theorie vier Feedback-Ebenen: die Aufgabenebene (Korrektheit, Vollständigkeit), die Prozessebene (Strategien, Verarbeitung), die Selbstregulationsebene (Selbstüberwachung, Zielsetzung) und die Selbstebene (persönliche Bewertungen wie "Gut gemacht"). Letztere ist nach Hattie und Timperley (2007) die schwächste und lernpsychologisch unzuverlässigste Form — pauschales persönliches Lob hat keinen messbaren Lerneffekt.

Für KAIA ist diese Differenzierung designentscheidend. Sokratische Fragen sind eine Form von Feedback — sie signalisieren implizit, welche kognitiven Prozesse als unvollständig oder vertiefenswert angesehen werden. Der bestärkend-wertschätzende Modus greift primär auf Prozess- und Selbstregulationsebene, nicht auf die Selbstebene. Eine Aussage wie "Du hast gerade Konzept X mit Y verknüpft — eine Verbindung, die du vorhin noch nicht gesehen hast" ist Prozessfeedback, keine pauschale Bestätigung. Dieser Unterschied muss in KAIAs Prompt-Design operationalisiert werden: Feedback auf Selbstebene ist zu vermeiden; Feedback auf Prozess- und Selbstregulationsebene ist lernförderlich und SDT-kompatibel (Deci & Ryan, 1985).

Zusätzlich ist Dwecks (1999, 2006) Theorie der impliziten Persönlichkeitstheorien (Growth vs. Fixed Mindset) für den bestärkenden Modus zentral. Studien zeigen, dass Feedback, das Erfolg auf Anstrengung und Strategie attribuiert ("Du hast mit dieser Frage einen guten Weg gewählt"), Explorationsbereitschaft und Resilienz stärkt. Feedback, das auf Talent attribuiert ("Du bist gut darin"), hemmt hingegen die Bereitschaft, schwierige Aufgaben anzugehen. KAIAs bestärkender Modus muss — im Sinne von Weiner (1985), Dweck (1999) und Hattie & Timperley (2007) — auf interne, kontrollierbare Faktoren attribuieren, nicht auf pauschale Kompetenz oder persönliche Eigenschaften.

---

## 2.10 Künstliche Intelligenz in der Bildung und Computational Empathy

Die Geschichte KI-gestützter Lernsysteme reicht bis in die 1970er Jahre zurück. Frühe Intelligent Tutoring Systems (ITS) wie SCHOLAR (Carbonell, 1970) und BUGGY (Brown & Burton, 1978) versuchten, Lernende durch regelbasierte Diagnose von Wissensständen und angepasste Aufgabensequenzierung zu unterstützen. Die Grundidee — eine Maschine, die das Lernen individualisiert — hat sich bis heute gehalten, während die zugrundeliegenden Technologien fundamental gewandelt haben.

Mit dem Durchbruch großer Sprachmodelle (Large Language Models, LLMs) seit 2020 hat sich das Potenzial KI-gestützter Bildungssysteme grundlegend verändert. LLMs wie GPT-4 (OpenAI, 2023), Claude (Anthropic, 2023) und Mistral (Mistral AI, 2023) sind in der Lage, offene, kontextsensitive Gespräche zu führen, die frühere regelbasierte Systeme grundsätzlich nicht ermöglichten. Empirische Studien zeigen, dass LLMs in Bildungskontexten — als tutorielle Gesprächspartner, Feedback-Geber und Lernbegleiter — messbare positive Effekte auf Lernleistung und Engagement erzielen können (Kasneci et al., 2023). Gleichzeitig existieren substanzielle Risiken: Halluzinationen (das Generieren plausibler, aber faktisch falscher Aussagen), Automation Bias (die unkritische Übernahme von KI-Antworten durch Lernende) und die potenzielle Abhängigkeit von externer Unterstützung (Kalyuga, 2007).

Das Konzept der Computational Empathy, eingeführt von Decety und Jackson (2004) im Kontext der affektiven Neurowissenschaft, beschreibt die Fähigkeit eines Systems, emotionale Zustände anderer zu erkennen und darauf angemessen zu reagieren. In der technischen Übertragung auf KI-Systeme bezeichnet Computational Empathy die Fähigkeit, aus Spracheingaben affektive und motivationale Zustände zu inferieren und den Gesprächsstil entsprechend anzupassen. Es ist wichtig, diese technische Verwendung von echtem menschlichem Einfühlungsvermögen zu unterscheiden: Computational Empathy basiert auf statistischen Mustern in Trainingsdaten, nicht auf phänomenalem Erleben oder moralischem Verständnis. Diese Differenzierung ist für KAIA nicht nur technisch relevant, sondern ethisch verpflichtend — sie muss gegenüber Nutzenden transparent kommuniziert werden (KI-Disclosure) und begrenzt die Anwendungsfelder des Systems: KAIA ist kein therapeutisches Werkzeug.

Die Auswahl der Sprachmodelle für KAIA — Claude (Anthropic), GPT-4o (OpenAI) und Mistral AI — folgt wissenschaftlichen wie datenschutzrechtlichen Kriterien. Der Evaluationsbericht (Kapitel 5) untersucht systematisch, welches Modell für sokratische Gesprächsführung, empathische Responsivität, Konsistenz über Sitzungen und DSGVO-Konformität am besten geeignet ist. Methodisch wird dieser Vergleich über standardisierte synthetische Gesprächsszenarien operationalisiert, um Modellunterschiede kontrolliert und reproduzierbar zu messen.

---

## 2.7 Neuroadaptivität als Designprinzip

Neuroadaptive Systeme sind technische Systeme, die physiologische oder verhaltensbasierte Signale einer Person in Echtzeit messen und darauf aufbauend Systemparameter anpassen, um den Nutzer in einem definierten Zielzustand zu halten (Fairclough, 2009). In klinischen und militärischen Kontexten werden dafür häufig physiologische Sensoren (EEG, Herzratenvariabilität, Hautleitwert) eingesetzt. In kommerziellen Bildungstechnologien ist dieser Zugang aus praktischen und ethischen Gründen nicht realisierbar.

KAIA operationalisiert Neuroadaptivität auf textueller Ebene: Gesprächsindikatoren wie Antwortlänge, Wiederholungshäufigkeit, Fragemuster, erkennbare Stagnation oder Frustrationssignale in der Sprache werden als Proxys für kognitive und emotionale Zustände genutzt. Auf dieser Grundlage passt das System den Gesprächsstil an — in drei Modi: strukturierend (bei erkennbarer Orientierungslosigkeit), offen-explorativ (bei fließendem Fortschritt) und rückspiegelnd (bei Selbstreflexionsbedarf). Diese Einteilung ist operational, nicht neurowissenschaftlich: KAIA misst keine Gehirnaktivität, sondern inferiert Zustände aus Verhaltensdaten.

Die epistemischen Grenzen dieses Ansatzes sind explizit zu benennen. Textbasierte Zustandsinferenz ist fehleranfällig, kulturell und individuell variabel, und der Zusammenhang zwischen Gesprächsindikatoren und tatsächlichem kognitiven Zustand empirisch noch wenig belegt. KAIA macht daher keinen Anspruch auf reliable Zustandsdiagnose; der neuroadaptive Modus ist als Annäherung, nicht als Messung zu verstehen. Der LLM-Evaluationsbericht (Kapitel 5) untersucht, welches Modell in simulierten Szenarien die robusteste und nutzungsangemessenste Adaptation zeigt.

---

## 2.8 Design Science Research als wissenschaftliche Methodologie

Die vorliegende Arbeit ist im Paradigma des Design Science Research (DSR) nach Hevner, March, Park und Ram (2004) verankert. DSR ist eine wissenschaftliche Methodik der Wirtschaftsinformatik, die die Entwicklung und Evaluation von IT-Artefakten als legitimen und wertvollen Erkenntnisbeitrag konzipiert. Im Gegensatz zu verhaltenswissenschaftlichen Paradigmen, die gegebene Realitäten erklären und vorhersagen wollen, zielt DSR auf die Gestaltung neuer Realitäten: die Entwicklung von Artefakten — Systemen, Modellen, Methoden, Konstrukten — die bisher unlösbare oder schlecht gelöste Probleme adressieren.

Hevner et al. (2004) formulieren sieben Richtlinien für DSR-konformes Forschen, die für KAIA anwendbar sind: Das Artefakt (KAIA) muss einen Beitrag zu einem relevanten Problem leisten; es muss rigoros entwickelt und evaluiert werden; es muss einen wissenschaftlichen Beitrag leisten, der über die reine Systemimplementierung hinausgeht; die Forschungsmethoden müssen stringent und nachvollziehbar sein; die Forschung muss in bestehende Wissensbasen eingebettet sein; die Artefaktentwicklung ist iterativ; und die Forschungsergebnisse müssen an relevante Stakeholder kommuniziert werden.

Für die vorliegende Studie ergibt sich daraus eine zweistufige Forschungslogik: Im ersten Schritt wird KAIA als Artefakt entwickelt (Kapitel 4). Im zweiten Schritt wird das Artefakt in einer explorativen Pilotstudie evaluiert (Kapitel 6), wobei sowohl die technischen Eigenschaften (LLM-Evaluation) als auch die nutzerseitigen Wirkungen (GSE-Veränderung) untersucht werden. Der DSR-Rahmen erlaubt es, diese Kombination aus Entwicklung und Empirie methodologisch konsistent zu verorten — und macht den Conflict of Interest (die Forscherin ist gleichzeitig Entwicklerin und potenzielle Kommerzialisiererin) explizit behandlungsbedürftig: dieser Aspekt wird im Methodenkapitel durch das Positionality Statement der Forscherin sowie durch die Pre-Registrierung der Hypothesen auf OSF.io adressiert.

---

## 2.9 Personalisierung und Individualisierung: Begriffsklärung und Forschungsspannung ✓

Der Titel dieser Arbeit — *"neuroadaptive personalisierte Lernbegleitung"* — enthält eine terminologische Spannung, die im Deutschen Didaktikdiskurs explizit gemacht werden muss, weil die Begriffe in der Literatur uneinheitlich verwendet werden.

In der Tradition der deutschen Allgemeinen Didaktik (Klafki, 1985; Heimann et al., 1965) bezeichnet **Individualisierung** die lernerseitige Selbststeuerung: Der Lernende gestaltet seinen Weg, wählt Tempo, Thema und Tiefe — die Kontrolle liegt beim Menschen. **Personalisierung** bezeichnet demgegenüber die systemseitige Adaptation: Das System passt Inhalte, Schwierigkeitsgrad oder Gesprächsstil auf Basis eines Nutzerprofils an — ohne notwendig aktive Beteiligung des Lernenden. In der anglo-amerikanischen HCI-Literatur sind diese Begriffe häufig vertauscht.

Diese Arbeit folgt der deutschen Didaktiktradition. Ein **neuroadaptiver Lernbegleiter** ist damit primär ein *personalisierendes* System im didaktischen Sinne: Er adaptiert basierend auf infériertem Kontext (Lazarus-Stressmuster, Gesprächsindikatoren). Die Forschungsleistung besteht nicht darin, Personalisierung zu betreiben — das leisten viele Systeme. Sie besteht darin, Personalisierung so zu gestalten, dass das Grundbedürfnis nach Autonomie (Deci & Ryan, 2000) nicht verletzt, sondern gestärkt wird. Dies ist nur möglich, wenn drei Bedingungen erfüllt sind: (1) Die systemseitigen Adaptionen sind für den Lernenden sichtbar (*Transparenz*), (2) der Lernende kann sie überschreiben (*Kontrollierbarkeit*), und (3) die sokratische Gesprächsführung stellt sicher, dass die Anpassung niemals die Eigenleistung ersetzt (*Sokratisches Schutzprinzip*).

Das Spannungsfeld zwischen systemseitiger Adaptation (Personalisierung) und lernerseitiger Selbststeuerung (Individualisierung) ist damit keine konzeptionelle Schwäche des Designs — es ist die Forschungsfrage, die diese Arbeit bearbeitet: *Unter welchen Designbedingungen kann ein neuroadaptiver KI-Agent Selbstwirksamkeit stärken statt untergraben?*

---

## 2.11 Selbstreguliertes Lernen, Metakognition und die "Lernen lernen"-Hypothese ✓

Eine der zentralen Fragen an KAIA ist: Führt sokratische Begleitung langfristig zur Fähigkeit, domain-übergreifend zu lernen — zum sogenannten "Lernen lernen"? Diese Frage ist für die vorliegende Thesis aus drei Gründen bedeutsam: Sie begründet die theoretische Relevanz des Ansatzes, sie schärft die Grenzen der empirischen Behauptungen, und sie öffnet eine Forschungsperspektive, die über die Pilotstudie hinausgeht.

### 2.11.1 Die theoretische Kette

Die Verbindung zwischen KAIAs sokratischem Ansatz und domain-übergreifender Kompetenz lässt sich als Kette beschreiben:

**Glied 1 — stark und verteidigbar:** Sokratische Begleitung erzeugt eigenständig erarbeitete Lösungen (Mastery Experiences). Diese sind nach Bandura (1997) die stärkste Quelle von Selbstwirksamkeitserwartungen. Ein System das niemals Antworten liefert, sondern Erkenntnisse hervorlockt, maximiert die Wahrscheinlichkeit, dass die lernende Person die Lösung sich selbst attribuiert — und damit ihre allgemeine Handlungskompetenzerwartung stärkt (GSE nach Schwarzer & Jerusalem, 1995).

**Glied 2 — theoretisch plausibel, empirisch voraussetzungsreich:** Ein erhöhter GSE-Wert korreliert empirisch mit tieferen Lernstrategien, größerer Ausdauer und flexiblerem Problemlöseverhalten — auch in neuen Domänen (Zimmermann, 2000; Pajares, 1996). Selbstreguliertes Lernen (Zimmermann, 2000) — das zielorientierte Planen, Überwachen und Anpassen eigener Lernprozesse — ist nach aktuellem Forschungsstand eine der stärksten Prädiktoren für domänenübergreifende Lernkompetenz. Ein erhöhter GSE-Wert macht den Einstieg in selbstregulierte Lernprozesse wahrscheinlicher.

**Das schwache Glied — Transfer:** Dass aus GSE-Stärkung und reflektiver Kompetenz automatisch domain-übergreifende Problemlösekompetenz entsteht, ist nicht belegt. Perkins und Salomon (1989) zeigen in ihrer vielzitierten Analyse, dass Lerntransfer nicht automatisch geschieht — er benötigt explizites "Bridging": die bewusste Verbindung zwischen dem Gelernten und neuen Kontexten. Ein sokratischer Begleiter kann diese Brücke anregen, aber nicht garantieren.

### 2.11.2 Was "Lernen lernen" durch KAIA realistische bedeutet

Die vertretbare Behauptung lautet: KAIA kann durch sokratische Begleitung episodische Mastery-Erlebnisse erzeugen, die kurzfristig allgemeine Selbstwirksamkeitserwartungen stabilisieren und metakognitive Aufmerksamkeit für eigene Lernprozesse aktivieren. Ob sich daraus domain-übergreifende Problemlösekompetenz entwickelt, ist eine mittelfristige Hypothese, die die vorliegende Pilotstudie (N=32, 4 Wochen) nicht prüfen kann und nicht beansprucht zu prüfen.

"Lernen lernen" ist damit kein Outcome dieser Studie — es ist die theoretische Vision, die KAIAs Designprinzipien motiviert, und eine Forschungsperspektive für Folgestudien mit längerem Zeithorizont und explizitem Transferdesign.

---

## 2.12 Synthetisches Rahmenwerk: Theoretische Begründung von KAIA

Die in den vorangegangenen Abschnitten dargestellten Theorien sind nicht additiv zu verstehen, sondern bilden ein kohärentes theoretisches Rahmenwerk, aus dem sich KAIAs Designentscheidungen unmittelbar ableiten lassen.

**Die Grundlogik:** Lernen ist ein konstruktiver Prozess (Vygotsky, 1978; Piaget, 1952), der von der wahrgenommenen Handlungsfähigkeit der Lernperson abhängt (Bandura, 1977) und nur unter subjektiv als bewältigbar bewerteten Anforderungen gelingt (Lazarus & Folkman, 1984). Optimales Lernen findet in einem Zustand mittlerer Aktivierung statt, der zwischen Langeweile und Angst liegt und als Flow erlebt wird (Csikszentmihalyi, 1990; Teigen, 1994). Instruktionale Direktheit gefährdet diesen Prozess, weil sie die Entwicklung eigenständiger Problemlösekapazität hemmt (Kalyuga et al., 2003). KI-Systeme können diesen Prozess begleiten, müssen dabei jedoch transparent über ihre Grenzen kommunizieren (Decety & Jackson, 2004) und sich instruktional zurückhalten.

**Die Ableitung:** KAIA ist als sokratischer Begleiter konzipiert, weil diese Haltung — Fragen statt Antworten — gleichzeitig drei theoretische Forderungen erfüllt: (1) Sie schützt den konstruktivistischen Lernprozess, (2) sie stärkt die Selbstwirksamkeit durch Handlungsergebniserfahrungen, und (3) sie verhindert den Expertise Reversal Effect durch instruktionale Zurückhaltung. Der neuroadaptive Modus versucht, den Flow-Kanal zu erhalten, indem der Gesprächsstil auf wahrgenommene kognitive Zustände reagiert.

**Die Hypothesen:** Aus diesem Rahmenwerk leiten sich die Forschungshypothesen ab, die vor Beginn der Datenerhebung auf OSF.io registriert werden:

- **H1:** Die allgemeine Selbstwirksamkeitserwartung (GSE nach Schwarzer & Jerusalem, 1995) ist nach vier Wochen KAIA-Nutzung signifikant höher als vor der Nutzung (gerichtet, Wilcoxon-Vorzeichenrangtest, α = .05).
- **H2:** Es besteht ein positiver Zusammenhang zwischen Nutzungshäufigkeit und Veränderung der Selbstwirksamkeitserwartung (ungerichtet, Spearman-Rho).
- **H3:** Die durch LLM-Analyse aus Gesprächstranskripten abgeleiteten Indikatoren für Handlungskontrolle und Problemlösezuversicht konvergieren über die Studienlaufzeit mit den GSE-Selbstaussagen (explorativ).

**Methodische Einschränkung:** Die Pilotstudie ist explorativ konzipiert (N=32, Power 80% für d=0.5). Konfirmatorische Schlüsse sind nicht intendiert. H1 wird als gerichtete Hypothese getestet; H2 und H3 dienen der Generierung präziserer Hypothesen für Folgestudien.

---

## Literaturverzeichnis

Alexander, R. (2008). *Towards Dialogic Teaching: Rethinking Classroom Talk* (4. Aufl.). Dialogos.

Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review, 84*(2), 191–215.

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Brown, J. S., & Burton, R. R. (1978). Diagnostic models for procedural bugs in basic mathematical skills. *Cognitive Science, 2*(2), 155–192.

Bruner, J. S. (1961). The act of discovery. *Harvard Educational Review, 31*(1), 21–32.

Carbonell, J. R. (1970). AI in CAI: An artificial intelligence approach to computer-assisted instruction. *IEEE Transactions on Man-Machine Systems, 11*(4), 190–202.

Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Fairclough, S. H. (2009). Fundamentals of physiological computing. *Interacting with Computers, 21*(1–2), 133–145.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review, 19*(4), 509–539.

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.

Kasneci, E., Seßler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., ... & Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences, 103*, 102274.

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology, 44*(1), 1–21.

Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer.

Multon, K. D., Brown, S. D., & Lent, R. W. (1991). Relation of self-efficacy beliefs to academic outcomes: A meta-analytic investigation. *Journal of Counseling Psychology, 38*(1), 30–38.

Oliveira, W., & Hamari, J. (2024). Flow states in digital learning environments: A systematic review. *Computers & Education, 192*, 104650.

Pajares, F. (1996). Self-efficacy beliefs in academic settings. *Review of Educational Research, 66*(4), 543–578.

Piaget, J. (1952). *The Origins of Intelligence in Children*. International Universities Press.

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio* (S. 35–37). NFER-NELSON.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.

Sweller, J., van Merriënboer, J. J. G., & Paas, F. G. W. C. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296.

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547.

Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100.

Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18*(5), 459–482.

Anderson, L. W., & Krathwohl, D. R. (Hrsg.). (2001). *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*. Longman.

Ausubel, D. P. (1968). *Educational Psychology: A Cognitive View*. Holt, Rinehart & Winston.

Bloom, B. S., Engelhart, M. D., Furst, E. J., Hill, W. H., & Krathwohl, D. R. (1956). *Taxonomy of Educational Objectives: The Classification of Educational Goals. Handbook I: Cognitive Domain*. David McKay.

Dweck, C. S. (1999). *Self-Theories: Their Role in Motivation, Personality, and Development*. Psychology Press.

Dweck, C. S. (2006). *Mindset: The New Psychology of Success*. Random House.

Hattie, J. (2009). *Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement*. Routledge.

Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.

Jerusalem, M., & Schwarzer, R. (1992). Self-efficacy as a resource factor in stress appraisal processes. In R. Schwarzer (Hrsg.), *Self-Efficacy: Thought Control of Action* (S. 195–213). Hemisphere.

Jerusalem, M., & Schwarzer, R. (1999). Allgemeine Selbstwirksamkeit [Skala]. In R. Schwarzer & M. Jerusalem (Hrsg.), *Skalen zur Erfassung von Lehrer- und Schülermerkmalen* (S. 54–56). Freie Universität Berlin.

Knowles, M. S. (1980). *The Modern Practice of Adult Education: From Pedagogy to Andragogy* (2. Aufl.). Cambridge.

Knowles, M. S. (1984). *The Adult Learner: A Neglected Species* (3. Aufl.). Gulf.

Stöber, J. (1999). Die Soziale-Erwünschtheits-Skala-17 (SES-17): Entwicklung und erste Befunde zu Reliabilität und Validität. *Diagnostica, 45*(4), 173–177.

Deci, E. L. (1971). Effects of externally mediated rewards on intrinsic motivation. *Journal of Personality and Social Psychology, 18*(1), 105–115.

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Plenum.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227–268.

Lepper, M. R., Greene, D., & Nisbett, R. E. (1973). Undermining children's intrinsic interest with extrinsic reward: A test of the "overjustification" hypothesis. *Journal of Personality and Social Psychology, 28*(1), 129–137.

Perkins, D. N., & Salomon, G. (1989). Are cognitive skills context-bound? *Educational Researcher, 18*(1), 16–25.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573.
