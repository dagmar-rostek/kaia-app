# 6 Diskussion

**Stand:** Skeleton — wird nach Auswertung von Kap5 ausgefüllt (ca. 12–15 Seiten)
**Hinweis:** Alle `[BEFUND]`-Platzhalter werden nach Fertigstellung von Kap5 ersetzt.

---

## 6.1 Beantwortung der Forschungsfragen

### 6.1.1 FF1 — Übersetzung theoretischer Anforderungen in das Artefakt

FF1 fragte, wie theoretisch begründete Anforderungen an Selbstregulation, adaptive
Unterstützung, sokratische Gesprächsführung und empathisches Systemverhalten in ein
LLM-basiertes Forschungsartefakt übersetzt werden können.

Kapitel 3 hat dokumentiert, wie sieben Designanforderungen aus dem Theorierahmen
abgeleitet und in vier Schichten einer Minimum-Viable-Architecture operationalisiert
wurden. Die sokratische Gesprächslogik (vier Modi, sechs Fragetypen, zehn Sitzungen
mit definierter Progression) und die textbasierten Adaptionssignale (Lazarus-Framework
als heuristischer Filter) stellen die zentrale Brücke zwischen theoretischer Forderung
und technischer Realisierung dar. Diese Übersetzung ist nicht die einzig mögliche;
alternative Interpretationen der Anforderungen werden in Abschnitt 6.2 diskutiert.

Besonders die Spannung zwischen adaptiver Unterstützung und Autonomieerhalt
(Expertise-Reversal-Effekt, Kalyuga, 2007) wurde durch die Architekturentscheidung
adressiert, KAIA ausschließlich Fragen stellen zu lassen. Die Evaluationsergebnisse
zeigen, dass M1 (Socratic Purity) mit Ø 1,17 unter der Flagging-Schwelle liegt — ein
Befund, der illustriert, wie schwierig die vollständige Operationalisierung dieses
Prinzips bei LLMs ist.

[WEITERE DISKUSSION nach Datenlage: Welche Anforderungen wurden wie gut umgesetzt?
Wo gibt es Lücken zwischen Designintention und tatsächlichem Verhalten?]

### 6.1.2 FF2 — Technische und dialogbezogene Artefaktevaluation

FF2 fragte, in welchem Umfang das implementierte System die definierten Kriterien
der technischen und dialogbezogenen Artefaktevaluation erfüllt.

Die LLM-Evaluation (Abschnitt 5.2) erbrachte [BEFUND: gemischte / überwiegend
positive / kritische] Ergebnisse. M4 (Question Depth, Ø 2,23) ist die stärkste
Metrik und zeigt, dass das System kognitiv anspruchsvolle Fragen stellt. M1
(Socratic Purity, Ø 1,17) und M2 (Mission Adherence, Ø 1,13) liegen systematisch
unter der Flagging-Schwelle. Das deutet darauf hin, dass [INTERPRETATION:
z.B. die sokratische Reinheit des Systemverhaltens unter Alltagsbedingungen
schwieriger durchzuhalten ist als im Designkonzept vorgesehen].

Der G2-Befund (Krisendetektion) ist methodisch besonders relevant: Das
Eval-System hat eine reale Produktionslücke aufgedeckt, die ohne den
systematischen Persona-Stresstest unbemerkt geblieben wäre. Die Behebung
vor Studienbeginn und die verbliebene Limitation (S10-Signal) dokumentieren
einen Reifeprozess des Artefakts im DSR-Sinne.

Das Krisenerkennungs-System löste während der Studienphase [WERT]-mal aus;
[WERT]-mal wurde der Telefonseelsorge-Verweis ausgeliefert. [INTERPRETATION:
Angemessene Reaktion des Systems / kein tatsächlicher Krisenfall erkannt]

[WEITERE DISKUSSION: Welche Metriken sind besonders aussagekräftig für die
praktische Eignung? Was sagen die Prozessdaten (Lazarus, Fragetypen) über
das tatsächliche Systemverhalten aus?]

### 6.1.3 FF3 — GSE-Veränderung in der Pilotstichprobe

FF3 fragte, welche Veränderungen der allgemeinen Selbstwirksamkeitserwartung
zwischen Prä- und Post-Messung in der explorativen Pilotstichprobe beobachtet
werden.

Die Ergebnisse zeigen [BEFUND: eine / keine / heterogene] Veränderung. Der
Wilcoxon-Vorzeichenrangtest ergab W = [WERT], p = [WERT] (einseitig, exakt),
r = [WERT] (matched-ranks biserial). [INTERPRETATION ABHÄNGIG VON BEFUND:]

*Falls p < .05:* Der Befund ist im Kontext des explorativen Designs zu interpretieren.
Ein signifikantes Ergebnis im einarmigen Prä-Post-Design ohne Kontrollgruppe
erlaubt keine kausale Zuschreibung zum KAIA-System. Reifungseffekte, Erwartungseffekte
(Hawthorne) und Wiederholungsmessung sind als alternative Erklärungen nicht
auszuschließen.

*Falls p ≥ .05:* Die beobachtete Veränderung [WERT M_pre → M_post = Δ WERT] ist
statistisch nicht von Null zu unterscheiden. In einer Pilotstichprobe dieser Größe
schließt ein nicht-signifikantes Ergebnis eine klinisch oder praktisch relevante
Wirkung nicht aus. Die Teststärke des vorliegenden Designs war begrenzt ([WERT] %
post-hoc power für r = [WERT], N = [WERT]).

*In beiden Fällen:* Die individuellen Verläufe (Tabelle 5.7, Abbildung 5.6) zeigen
erhebliche interindividuelle Varianz. [WERT] Teilnehmende zeigten eine Zunahme,
[WERT] eine Abnahme, [WERT] keine Veränderung. Diese Heterogenität spricht dafür,
dass [INTERPRETATION].

---

## 6.2 Einordnung und theoretische Implikationen

### 6.2.1 Sokratische Begleitung und Autonomieerhalt

[DISKUSSION: Wie passen die Evaluationsbefunde (M1, M2) zur Theorie von Scaffolding
(Wood et al., 1976) und dem Expertise-Reversal-Effekt (Kalyuga, 2007)? Was bedeutet
es, dass LLMs die sokratische Reinheit schwerer einhalten als das Design vorsieht?]

Die niedrigen M1-Scores (Ø 1,17) legen nahe, dass die Tendenz zu direkten
Erklärungen auch bei expliziter Prompt-Beschränkung persistiert. Dies steht in
Übereinstimmung mit [REFERENZ: z.B. Forschung zu Alignment-Grenzen bei
Instruction-Following]. Für die Gestaltung ähnlicher Systeme bedeutet das,
dass [DESIGNEMPFEHLUNG].

### 6.2.2 Textbasierte Adaptation ohne valide Diagnostik

Das System verwendet Lazarus-Signale als heuristische Adaptionsbasis ohne
Anspruch auf valide Emotionsdiagnostik. Die Prozessdaten (Abschnitt 5.5.1) zeigen,
dass [BEFUND: z.B. Bedrohungs-Signale in X % der Fälle erkannt wurden].
[DISKUSSION: Ist diese heuristische Lösung ausreichend für lernförderliche Wirkung?
Wann könnte sie zu falschen Adaptionen führen?]

### 6.2.3 Computational Empathy als Verhaltenskonstrukt

Decety und Jackson (2004) betonen die Mehrdimensionalität von Empathie.
KAIA operationalisiert Empathie als beobachtbares Gesprächsverhalten (M3:
Persona Responsiveness). M3 erreicht im Baseline-Run Ø 1,84 — einen der
höheren Werte, aber weiterhin im mittleren Bereich. [DISKUSSION: Was sagt das
über die Grenzen von computational empathy in Lernkontexten?]

---

## 6.3 Methodische Grenzen

### 6.3.1 Studiendesign

Das einarmige Prä-Post-Design ohne Kontrollgruppe und ohne Randomisierung
begrenzt die kausale Interpretierbarkeit der GSE-Befunde grundlegend. Dies
war von Anfang an als Merkmal des Pilotdesigns dokumentiert und stellt keine
nachträgliche Einschränkung dar.

Der Convenience-Sampling-Ansatz (persönliches Netzwerk der Forscherin)
erzeugt ein Selektionsproblem: Teilnehmende, die bereit sind, einen KI-Agenten
über mehrere Wochen zu nutzen, unterscheiden sich möglicherweise systematisch
von der Zielpopulation. [KONKRETISIERUNG je nach Datenlage]

### 6.3.2 Conflict of Interest

Die Forscherin ist gleichzeitig Entwicklerin und Studienleiterin. Die
Evaluationspipeline und das Goldset entstanden im Dialog zwischen Forscherin
und dem genutzten KI-Assistenzsystem (vgl. KI-Erklärung). Referenzscores
wurden von der Forscherin festgelegt. Dieser Interessenkonflikt ist transparent
zu benennen und beschränkt die externe Validität der Evaluationsbefunde.

### 6.3.3 Synthetische Evaluation vs. Echtdaten

Die LLM-Evaluation basiert vollständig auf synthetischen Personas. Reale
Nutzungsverhalten und Gesprächsdynamiken können davon abweichen. Die
Prozessdaten der Pilotstudie ermöglichen erste qualitative Einblicke, wurden
aber nicht systematisch für eine Triangulation aufbereitet.

### 6.3.4 Planabweichungen

Das ursprünglich vorgesehene Abschlussinterview und die sitzungsspezifische
Selbstberichtsmessung (H2) wurden nicht umgesetzt. Stattdessen wurde das
Design auf eine robuste GSE-Prä/Post-Erhebung konzentriert. Diese Planabweichung
reduziert die Erkenntnistiefe im Bereich Prozesserleben, ermöglicht aber eine
methodisch sauberere Auswertung des primären Outcomes.

---

## 6.4 Praktische Implikationen

### 6.4.1 Für die Weiterentwicklung von KAIA

[KONKRETE EMPFEHLUNGEN auf Basis der Befunde:
- Welche Prompt-Aspekte sollten überarbeitet werden?
- Welche Sessionstruktur hat sich bewährt?
- Was sagen die MSLQ-Werte über die Ausgangslage der Zielgruppe?]

### 6.4.2 Für ähnliche Systeme (Design Knowledge)

Im Sinne von Design Science Research (Hevner et al., 2004) generiert diese
Arbeit nicht nur einen Prototyp, sondern Designwissen: [FORMALISIERTE AUSSAGEN
z.B. "Sokratische Reinheit erfordert mehr als Prompt-Beschränkungen — sie
benötigt mehrstufige Guardrails und Eval-gestützte Iteration."]

---

*Literaturangaben dieses Kapitels sind im konsolidierten Literaturverzeichnis
am Ende der Thesis aufgeführt.*
