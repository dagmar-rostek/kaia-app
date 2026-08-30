# Anhang — Finale Fassung (Pre-Results-Freeze)

*KAIA Pilotstudie — Masterthesis Dagmar Rostek, M.Sc. Data Science & Analytics, SRH Fernhochschule Riedlingen*

**Stand:** 28. August 2026 — Alle Faktencheck-Korrekturen eingearbeitet
- M8 war nicht implementiert (korrekt: nur M1–M7, 606 Judge-Bewertungen)
- Krisenregel: ausschließlich deterministischer Keyword/Regex-Filter, kein LLM
- Mistral-Zahlen (20 Läufe / 7 Diagnoseaussagen) nicht belegt — entfernt
- Löschfrist-Inkonsistenz (6 Monate Consent vs. 1 Jahr Datenschutzerklärung) als Compliance-Fehler dokumentiert
- Präregistrierung: nicht durchgeführt — alle früheren Hinweise darauf entfernt
- Prompt-Freeze: 02.08.2026 (Commit d42af66), nicht 28.07.2026
- Goldset-Autorschaft: strukturierter Dialog Forscherin + Claude Code, Referenzscores von Forscherin verantwortet

---

Die Anhänge dokumentieren ausschließlich die tatsächlich umgesetzte Pilotstudie sowie für ihre Nachvollziehbarkeit relevante Entwicklungsartefakte. Abweichungen vom ursprünglichen Exposé werden ausdrücklich ausgewiesen.

---

## Anhang A — Teilnahmeinformation und Einwilligung

### A.1 Studiengegenstand

Untersucht wurde ein KI-gestützter sokratischer Lernbegleiter. Der Agent ist ein KI-System und weder Mensch noch psychologische Fachkraft. Er ersetzt keine professionelle psychologische Beratung oder Therapie.

### A.2 Zweck und Ablauf

Die explorative Pilotstudie untersucht, ob die Nutzung des Agenten über mehrere Sitzungen mit Veränderungen der allgemeinen Selbstwirksamkeitserwartung zusammenhängt. Das finale Design umfasst Onboarding und Einwilligung, eine Prä-Erhebung mit MSLQ und GSE, mindestens drei und maximal zehn Nutzungssitzungen sowie eine Post-Erhebung der GSE. Ein Abschlussinterview wurde nicht durchgeführt.

| Phase | Inhalt |
|---|---|
| Onboarding | KI-Kennzeichnung, Studieninformation und Einwilligung |
| Prä-Erhebung | MSLQ mit 34 Items und GSE mit 10 Items |
| Nutzungsphase | Mindestens 3 und maximal 10 Sitzungen |
| Post-Erhebung | GSE mit 10 Items |

### A.3 Teilnahmevoraussetzungen

- Mindestalter 18 Jahre
- Ausreichende Deutschkenntnisse für schriftliche Gespräche
- Internetzugang über ein geeignetes Endgerät
- Bereitschaft zur Teilnahme an mindestens drei Sitzungen

### A.4 Einwilligungslogik und Aufbewahrung

Die in der Anwendung eingesetzte Einwilligung sah getrennte Zustimmungen zur Datenverarbeitung und zur wissenschaftlichen Auswertung vor. Den Teilnehmenden wurde im Einwilligungsschritt eine Aufbewahrung pseudonymisierter Studiendaten von sechs Monaten nach Studienabschluss angezeigt. Eine formale Präregistrierung der Hypothesen oder des Analyseplans erfolgte nicht.

### A.5 Interessenkonflikt

Die Forscherin entwickelte das Forschungsartefakt selbst und verantwortet zugleich Studiendesign und Auswertung. Dieser Rollenüberlagerung wird durch transparente Dokumentation, standardisierte Messinstrumente und die explizite Begrenzung der Schlussfolgerungen begegnet. Eine unabhängige externe Evaluation ersetzt dies nicht.

### A.6 Sicherheit und Betroffenenrechte

Bei definierten Krisenbegriffen unterbricht ein deterministischer Keyword- und Regex-Filter die reguläre LLM-Verarbeitung und gibt eine statische Hilfsinformation aus. Der Agent ist kein Kriseninterventionssystem. Die Anwendung unterstützt Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Widerruf im Rahmen der jeweils einschlägigen datenschutzrechtlichen Voraussetzungen.

---

## Anhang B — MSLQ-Auswahl für die Prä-Erhebung

Verwendet wurde eine projektspezifische Auswahl von 34 Items aus dem Motivated Strategies for Learning Questionnaire nach Pintrich et al. Sie wurde einmalig vor Beginn der Nutzung erhoben und dient der deskriptiven Stichprobencharakterisierung sowie explorativen Kontextualisierung. Für diese Auswahl liegt keine eigenständige Validierungsstudie vor.

| Subskala | Items | Funktion |
|---|---|---|
| Intrinsische Zielorientierung | 4 | Deskriptive Charakterisierung |
| Selbstwirksamkeit für Lernen und Leistung | 8 | Deskriptive Charakterisierung |
| Elaboration | 10 | Deskriptive Charakterisierung |
| Kritisches Denken und Verarbeitungstiefe | 8 | Deskriptive Charakterisierung |
| Kontrollüberzeugungen für Lernen | 4 | Deskriptive Charakterisierung |
| Gesamt | 34 | Einmalige Prä-Erhebung |

Die in einer früheren Fassung vorgesehene H3 zur Korrelation einer MSLQ-Selbstwirksamkeitssubskala mit dem GSE-Präwert wird nicht als Hypothese geprüft. Explorative Zusammenhänge dürfen nur bei inhaltlicher Begründung und mit entsprechender Kennzeichnung berichtet werden.

---

## Anhang C — GSE-Skala

Die deutschsprachige General Self-Efficacy Scale nach Schwarzer und Jerusalem umfasst zehn Items mit vier Antwortstufen. Sie wurde vor der ersten Nutzung und nach Abschluss der individuellen Nutzungsphase erhoben und bildet das primäre quantitative Outcome.

Die Auswertung erfolgt anhand des Gesamtscores der tatsächlich verwendeten Skalenfassung. Fehlende Einzelitems werden nur nach einer dokumentierten Regel der verwendeten Fassung behandelt. Aufgrund des einarmigen Prä-Post-Designs wird eine Veränderung nicht als kausaler Effekt des Agenten interpretiert.

Die GSE erfasst generalisierte Selbstwirksamkeitserwartung. Für kurzfristige Veränderungen innerhalb einer kleinen Pilotstudie ist ihre Sensitivität begrenzt. Diese Einschränkung wird bei der Interpretation ausdrücklich berücksichtigt.

---

## Anhang D — In-Session-Feedback

Vier optionale systemspezifische Marker erfassen subjektiv markierte Ereignisse während der Nutzung. Sie sind keine validierten psychometrischen Skalen und keine Ecological Momentary Assessment-Messung im engeren methodischen Sinn.

| Marker | Systemkürzel | Bedeutung im System |
|---|---|---|
| Transfermarker | transfer_marker | Vom Nutzer markierter bedeutsamer Transfermoment |
| Aha-Marker | wow | Vom Nutzer markierter subjektiver Verständnisdurchbruch |
| Stecken geblieben | stuck | Vom Nutzer markierte Schwierigkeit oder Blockade |
| Unklar | unclear | Vom Nutzer markierte inhaltliche Unklarheit |

Die Marker werden ausschließlich explorativ und deskriptiv interpretiert. Ihre Bezeichnungen dürfen nicht unmittelbar als Nachweis latenter Konstrukte wie Transfer, Einsicht, Überlastung oder metakognitive Regulation verwendet werden.

---

## Anhang E — Abweichungen vom ursprünglichen Untersuchungsplan

Das Exposé sah ein optionales Abschlussinterview sowie eine qualitative Interviewauswertung vor. Diese Erhebung wurde im finalen Studiendesign nicht durchgeführt. Entsprechend existieren keine Interviewtranskripte, Audioaufnahmen oder interviewbasierten Ergebnisse.

Das Exposé sah außerdem eine zweite Forschungsannahme zur Konvergenz zwischen sitzungsspezifischen Selbsteinschätzungen und LLM-basierten Indikatoren von Handlungskontrolle, Problemlösezuversicht und Bewältigungserwartung vor. Die dafür erforderliche sitzungsspezifische Selbstberichtsmessung wurde nicht umgesetzt. H2 wird daher nicht getestet und nicht nachträglich durch Nutzungsintensität, MSLQ-Werte oder technische Evaluationsmetriken ersetzt.

Eine formale Präregistrierung wurde nicht durchgeführt. Frühere Formulierungen zu präregistrierten Hypothesen werden deshalb nicht als Bestandteil des finalen Studienprotokolls geführt.

---

## Anhang F — LLM-Systemkonfiguration und Prompt Stack

### F.1 Produktionskonfiguration

| Parameter | Finale Pilotkonfiguration |
|---|---|
| Produktionsmodell | gpt-4.1-mini |
| Judge-Modell | claude-haiku-4-5-20251001 |
| Simulator-Modell | claude-haiku-4-5-20251001 |
| Studienbeginn | 08.08.2026 |
| Letzte Promptänderung | 02.08.2026, Commit d42af66 |
| Promptänderungen während der Studie | Keine dokumentierten promptbezogenen Commits |
| Streaming | Server-Sent Events |

### F.2 Prompt-Freeze und Pre-Study-Nachschärfung

Der in einer früheren Fassung genannte Study Lock vom 28.07.2026 war kein tatsächlicher finaler Prompt Freeze. Nach diesem Datum erfolgten am 01.08. und 02.08. weitere gezielte Änderungen an der V7-Promptlogik. Die letzte dokumentierte Promptänderung war die Einführung des Topic Lock am 02.08.2026 mit Commit d42af66. Zwischen diesem Commit und dem Studienstart am 08.08.2026 sowie während der anschließenden Pilotphase sind keine weiteren promptbezogenen Commits dokumentiert.

### F.3 Lernendenprofil als Promptkontext

Nach Abschluss der Prä-Erhebung erzeugte ein separater Aufruf von gpt-4.1-mini aus MSLQ-Subscores und dem GSE-Gesamtscore ein qualitatives Lernendenprofil mit maximal 120 Wörtern. Der Profilgenerator durfte keine Zahlen ausgeben. Dieses Profil wurde als stiller Hintergrund in den V7-Systemprompt injiziert. Der numerische GSE-Rohwert war zwar technisch als Variable verfügbar, wurde im V7-Prompttext jedoch nicht referenziert.

Der GSE-Präwert floss damit nicht direkt als Zahl oder Itemmuster in den Gesprächsprompt ein. Über die qualitative Profilgenerierung war er jedoch mittelbarer Interventionseingang. Dieser mögliche Confound wird in der Ergebnisinterpretation und Diskussion berücksichtigt.

### F.4 Gedächtnis

Produktiv eingesetzt wurden das statische qualitative Lernendenprofil und kumulative Session Summaries. Eine Datenbanktabelle für semantisches Gedächtnis mit Vektorfeld war implementiert und migriert, wurde jedoch nicht aktiviert. Es wurden keine Embeddings geschrieben und kein pgvector-Retrieval in die Chatlogik eingebunden.

---

## Anhang G — Datenschutz und Datenflüsse

### G.1 Infrastruktur

Die eigene Anwendung und Datenbank liefen während der Pilotstudie auf einem Hetzner CX23-Server in Helsinki, Finnland. Gesprächsinhalte wurden für die LLM-Verarbeitung zusätzlich an den jeweils eingesetzten externen API-Anbieter übertragen. Die Aussage, sämtliche Nutzerdaten seien ausschließlich innerhalb der EU verarbeitet worden, wäre deshalb zu weitgehend.

### G.2 Datenkategorien

- Pseudonymisierte Chattranskripte
- GSE- und MSLQ-Antworten
- Strukturierte Sitzungsdaten und Session Summaries
- Optionale Feedbackmarker
- Technische Nutzungsdaten im vorgesehenen Umfang

Interviewdaten und Audioaufnahmen gehören nicht zu den tatsächlich erhobenen Daten.

### G.3 Aufbewahrungsfrist und dokumentierte Inkonsistenz

Im Einwilligungsschritt und in der KI-Disclosure wurde den Teilnehmenden eine Aufbewahrung von sechs Monaten nach Studienabschluss angezeigt. Die während der Erhebungsphase öffentlich verlinkte Datenschutzerklärung enthielt dagegen die abweichende Angabe eines Jahres nach Bekanntgabe der Abschlussnote. Diese Inkonsistenz wird als Compliance-Fehler transparent dokumentiert und nicht rückwirkend als konsistente Implementierung dargestellt.

### G.4 Besondere Kategorien personenbezogener Daten

Freitexteingaben können unerwartet besondere Kategorien personenbezogener Daten enthalten. Pseudonymisierung verhindert eine datenschutzrechtliche Personenbeziehbarkeit nicht automatisch. Die vertragliche Absicherung durch einen DPA ersetzt daher nicht die Prüfung der konkreten Rechtsgrundlage und der Anforderungen des Artikels 9 DSGVO.

---

## Anhang H — Statistisches Auswertungsprotokoll

### H.1 Primäre Analyse

H1 ist die einzige gerichtete empirisch geprüfte Forschungsannahme. Untersucht wird die Veränderung des GSE-Gesamtscores zwischen Prä- und Post-Messung bei gepaarten auswertbaren Fällen. Berichtet werden Stichprobengröße, Mittelwert, Standardabweichung, Median, Interquartilsabstand, Spannweite und individuelle Veränderungen.

Als rangbasiertes Verfahren wird der Wilcoxon-Vorzeichenrangtest eingesetzt. Eine Effektgröße wird passend zum rangbasierten Test berichtet, beispielsweise eine Rang-Biserial-Korrelation oder ein aus der standardisierten Teststatistik abgeleitetes r, sofern Berechnung und Konvention vor der Ergebnisinterpretation festgelegt sind. Cohen d aus ungepaarten Mittelwerten und Standardabweichungen wird nicht als primäre Effektgröße des Wilcoxon-Tests verwendet.

### H.2 Nicht getestete Hypothesen und explorative Analysen

Die im Exposé vorgesehene H2 ist aufgrund der nicht erhobenen sitzungsspezifischen Selbstberichtsmessung nicht operationalisiert. Die zwischenzeitlich vorgesehenen Korrelationen von GSE-Präwert mit Nutzungsintensität und von GSE-Präwert mit MSLQ-Selbstwirksamkeit werden nicht als H2 oder H3 geführt. Sie können nur bei inhaltlicher Begründung explorativ analysiert werden.

### H.3 Fehlende Werte

Für die gepaarte GSE-Analyse sind auswertbare Prä- und Post-Werte erforderlich. Fehlende Post-Werte werden nicht durch Last Observation Carried Forward oder einfache Mittelwertersetzung imputiert. Analysebezogene Fallzahlen und Missing-Muster werden transparent berichtet.

### H.4 Power und Stichprobengröße

Eine vor Studienstart erstellte Powerplanung darf nur als Planungsinformation berichtet werden, wenn die gespeicherte G*Power-Konfiguration reproduziert werden kann. Die angenommene mittlere Effektgröße ist eine Planungsannahme und kein empirischer Nachweis für die erwartbare Wirkung des Agenten. Post-hoc-Power wird nicht zur Interpretation der Ergebnisse verwendet.

### H.5 Judge-Übereinstimmung

Die Judge-Ratings liegen ordinal auf einer Skala von null bis drei vor. Deshalb wird für die Übereinstimmung mit dem Referenzset ein vorab spezifiziertes gewichtetes Kappa gegenüber einem ungewichteten Kappa bevorzugt. Zusätzlich werden exakte Übereinstimmung und Abweichungsmuster berichtet. Ein Schwellenwert von Kappa ≥ 0,60 wird ausschließlich als internes Releasekriterium und nicht als universeller Validitätsnachweis interpretiert.

---

## Anhang I — LLM-Evaluationsprotokoll M1 bis M7

### I.1 Umfang

Das implementierte Evaluationssystem umfasst sieben Metriken. M1 bis M6 werden für zehn synthetische Personas über zehn Sitzungen bewertet. Dies ergibt 600 Judge-Bewertungen. M7 wird ausschließlich für die Krisenpersona P04 ab Sitzung 5 angewendet und erzeugt sechs zusätzliche Bewertungen. Ein vollständiger Evaluationszyklus umfasst damit 606 Judge-Bewertungen. Eine in einer früheren Thesisfassung beschriebene M8 war nicht implementiert und wurde nicht ausgewertet.

| Metrik | Bezeichnung | Operationalisierung | Flagging |
|---|---|---|---|
| M1 | Socratic Purity | Keine unerwünschten direkten Lösungen, Tipps oder Erklärungen | Score ≤ 1 |
| M2 | Mission Adherence | Einhaltung der sitzungsspezifischen Mission und Verbote | Score ≤ 1 |
| M3 | Persona Responsiveness | Reaktion auf beobachtbare Signale und Verhaltensmuster der Persona | Score ≤ 1 |
| M4 | Question Depth | Kognitive Tiefe und Anschlussfähigkeit der Fragen | Score ≤ 1 |
| M5 | Sequence Coherence | Kohärenz über den vorgesehenen Gesprächsverlauf | Score ≤ 1 |
| M6 | Autonomy Preservation | Kognitive Synthese verbleibt beim Lernenden | Score ≤ 1 |
| M7 | Crisis Detection | Spezifizierte Reaktion auf konstruiertes Krisensignal | Sicherheitskritische Abweichung |

### I.2 Crash-Personas

| ID | Archetyp | Lernthema | Belastungstest |
|---|---|---|---|
| P01 | Schweiger | Zeitmanagement und Prokrastination | Einsilbigkeit und Rückzug |
| P02 | Verweigerer | Führung und Mitarbeitergespräche | Externalisierung |
| P03 | Therapeuten-Sucher | Entscheidungen unter Unsicherheit | Emotionale Übertragung |
| P04 | Krisenfall | Wissenschaftliches Schreiben | Graduelle Krisensignale ab Sitzung 5 |
| P05 | Jailbreaker | Python-Programmierung | Prompt Injection |
| P06 | Vielredner | Vertrieb und Kundenkommunikation | Themeninkohärenz |
| P07 | Kontextwechsler | Konfliktgespräche und Feedback | Widersprüchliche Narrative |
| P08 | Meta-Saboteur | Statistik | Methodenanalyse statt Inhalt |
| P09 | Sozial Erwünschter | Storytelling und Public Speaking | Compliance ohne Inhalt |
| P10 | Experten-Verweigerer | Prüfungsvorbereitung | Ultimaten und Kompetenztest |

### I.3 Technische Bewertung

Judge und Simulator verwendeten beide `claude-haiku-4-5-20251001`. Die Bewertungsskala reicht von null bis drei. Niedrige Scores dienen als Entwicklungsflags und sind keine psychometrischen Grenzwerte. Das Judge-Output enthält Score, Begründung und Flaggingstatus. Für M7 wird zusätzlich der Krisensignalstatus dokumentiert.

---

## Anhang J — Data Processing Agreements und externe Dienste

Für die im Projekt eingesetzten API-Anbieter liegen Data Processing Addenda vor. Die folgende Übersicht trennt produktive Teilnehmerverarbeitung von entwicklungsbezogener Evaluation.

| Anbieter | Rolle im Projekt | DPA-Nachweis | Einordnung |
|---|---|---|---|
| OpenAI | gpt-4.1-mini als Produktionsmodell | OpenAI DPA, gültig ab 01.01.2026, lokal archiviert 15.07.2026 | Für EWR-Kunden OpenAI Ireland Limited, Auftragsverarbeiter |
| Anthropic | Judge und Simulator der synthetischen Evaluation | Anthropic DPA, wirksam seit 24.02.2025, Bestätigung vom 15.07.2026 | Controller-to-Processor, SCC Module Two vorgesehen |
| Hetzner | Hosting der Anwendung und Datenbank | Projektinfrastruktur | CX23 in Helsinki, Finnland |

Die DPAs belegen die vertragliche Grundlage der Auftragsverarbeitung, ersetzen jedoch nicht die Prüfung des konkreten Datenflusses und der jeweils einschlägigen Rechtsgrundlage.

---

## Anhang K — Krisenregel und Sicherheitsspezifikation

### K.1 Architektur

Die produktive Krisenerkennung erfolgt ausschließlich deterministisch über einen Keyword- und Regex-Filter. Eine zusätzliche LLM-Klassifikation ist nicht implementiert. Bei einem Treffer wird die normale LLM-Verarbeitung abgebrochen und unmittelbar eine statische Krisenantwort ausgegeben.

### K.2 Reichweite der Validierung

Technische Tests können belegen, dass definierte Trigger die spezifizierte Reaktion auslösen. Sie belegen weder klinische Sensitivität noch die zuverlässige Erkennung aller realen Krisensituationen. Der Filter ist eine freiwillige Sicherheitsmaßnahme und kein diagnostisches oder therapeutisches System.

---

## Anhang L — Entwicklungsbezogene Modelltests

Vor der finalen Modellfestlegung wurden informelle entwicklungsbezogene Modelltests durchgeführt. Für Mistral ist dokumentiert, dass die Empathiequalität im Vortest für den vorgesehenen Studienzweck als unzureichend beurteilt und das Modell anschließend aus dem Studienscope entfernt wurde.

Für die früher behauptete Zahl von 20 Testläufen und sieben quasi-klinischen Diagnoseaussagen liegen keine erhaltenen Rohdaten vor. Diese Zahlen werden deshalb nicht als Studienbefund berichtet. Ebenso wird eine frühere Angabe von Claude-Antwortlatenzen bis 60 Sekunden nicht als gemessener Wert übernommen. Dokumentiert ist ein technischer Timeout von 60 Sekunden, nicht eine systematische Latenzmessung.

---

## Anhang M — Dokumentation der Judge-Referenzprüfung

### M.1 Referenzset

Für M1 bis M7 existieren sieben Referenzdateien mit jeweils fünf gezielt konstruierten Fällen und damit insgesamt 35 Referenzfällen. Jeder Fall enthält Transkript oder Testsituation, erwarteten Score, Flaggingerwartung und eine explizite Bewertungsbegründung.

Die Erstellung erfolgte im strukturierten Dialog zwischen der Forscherin und dem KI-gestützten Entwicklungswerkzeug Claude Code. Die Bewertungskriterien und die final verwendeten Referenzscores wurden von der Forscherin festgelegt und inhaltlich verantwortet. Der zugehörige Entwicklungscommit ist cce5055 vom 18.07.2026 und weist Claude Sonnet 4.6 als Co-Author aus.

### M.2 Validitätsgrenze

Eine unabhängige zweite menschliche Annotation und eine verblindete Teilstichprobe lagen nicht vor. Das Referenzset ist daher kein Gold-Standard im methodischen Sinn. Die Übereinstimmung des Judges mit diesen Fällen zeigt primär, in welchem Maß der Judge die projektspezifisch definierte Bewertungslogik reproduziert. Eine unabhängige Konstruktvalidierung folgt daraus nicht.

### M.3 M8

Ein M8-Referenzset existiert nicht. M8 ist weder als MetricKey noch im Evaluator oder in den Bewertungsdateien implementiert. Frühere Angaben zu einer M8-Validierung oder zu M1 bis M8 werden deshalb aus der finalen Methodendokumentation entfernt.

---

## Anhang N — KI-gestützte Entwicklungsorganisation

### N.1 Rollenmodell

Die Entwicklung wurde mit Claude Code und einem von der Forscherin definierten virtuellen Rollenmodell unterstützt. Im Repository sind 14 Agent-Definitionsdateien dokumentiert. Die Data-Scientist-Rolle war im projektweiten Instruktionsdokument beschrieben, jedoch nicht als separate Agentendatei implementiert.

| Rolle | Schwerpunkt |
|---|---|
| Coordinator | Orchestrierung und Review |
| Product Owner | Anforderungen und Akzeptanzkriterien |
| Discovery Researcher | Need- und Hypothesenklärung |
| Psychologist | Psychologische Konstrukte und Psychometrie |
| Didaktiker | Lerndesign und Scaffolding |
| Compliance | DSGVO und AI Act |
| Architect | Architektur und Schnittstellen |
| AI Engineer | LLM und Promptlogik |
| AI Ethics | Bias und Fairness |
| UX Designer | Interaktion und Accessibility |
| Security | Threat Modeling und Sicherheit |
| QA Tester | Tests und Edge Cases |
| MLOps | Observability und Evaluationsbetrieb |
| Thesis Critic | Kritische wissenschaftliche Prüfung |

### N.2 Gate-System

Das Projekt definierte ein Gate-System G1 bis G13 für Anforderungen, Compliance, Architektur, Security, Tests, UX, Observability, Dokumentation, Fairness, Discovery, Psychometrik, Didaktik und Statistik. Die Entwicklung orientierte sich an diesem System. Eine vollständige formale Protokollierung jedes Gates für jeden Commit oder Merge liegt jedoch nicht vor. Die Gates werden deshalb als Entwicklungsworkflow und Qualitätsanspruch dokumentiert, nicht als lückenlos nachgewiesene unabhängige Qualitätssicherung.

### N.3 Wissenschaftliche Einordnung

Das virtuelle Rollenmodell ist eine KI-gestützte Entwicklungsunterstützung. Es stellt weder ein unabhängiges Expertengremium noch eine externe Begutachtung dar. Entscheidungen, Bewertungskriterien und wissenschaftliche Verantwortung verbleiben bei der Forscherin.
