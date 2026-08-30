# Masterthesis — Pre-Results-Freeze Stand

**Titel:** Entwicklung eines empathischen AI-Agenten zur neuroadaptiven personalisierten Lernbegleitung

**Verfasserin:** Dagmar Rostek
**Studiengang:** M.Sc. Data Science & Analytics
**Hochschule:** SRH Fernhochschule Riedlingen
**Betreuer:** Prof. Dr. Christian Prinz / Prof. Dr. Thomas Ekert
**Abgabe:** 03. Oktober 2026

> **Konsolidierungsstand:** 28. August 2026 — Pre-Results-Freeze
> **Fertige Kapitel:** Kap1 ✅ · Kap2 ✅ · Kap3 ✅ · Kap4 ✅
> **Ausstehend:** Kap5 (Ergebnisse) · Kap6 (Diskussion) · Kap7 (Fazit) · Abstract
> **Alle Faktencheck-Korrekturen eingearbeitet:** M8 nicht impl., Krisenregel Regex-only, Mistral-Zahlen entfernt, Löschfrist-Inkonsistenz dokumentiert, Präregistrierung nicht durchgeführt, Prompt-Freeze 02.08.2026, Goldset ko-authoriert

---

# Abstract

Der Abstract wird nach Abschluss der empirischen Auswertung finalisiert. Er fasst Forschungsproblem, Zielsetzung, methodisches Vorgehen, zentrale Ergebnisse und Schlussfolgerungen auf maximal einer Seite zusammen.

---

# Genderhinweis

Aus Gründen der besseren Lesbarkeit wird in dieser Arbeit auf eine durchgehend geschlechtsspezifische Mehrfachnennung verzichtet. Personenbezogene Bezeichnungen beziehen sich, sofern aus dem jeweiligen Kontext nichts anderes hervorgeht, auf Personen aller Geschlechter. Diese sprachliche Vereinfachung beinhaltet keine Wertung.

---

# Erklärung zur Nutzung von Künstlicher Intelligenz

Gemäß den Richtlinien der SRH Fernhochschule — The Mobile University zum Umgang mit Künstlicher Intelligenz in Studium und Lehre wird die Nutzung von KI-Werkzeugen bei der Erstellung dieser Arbeit transparent offengelegt (SRH Fernhochschule — The Mobile University, 2023).

**Verwendete Systeme**

Verwendet wurden Claude Code auf Basis von Claude Sonnet 4.6 von Anthropic sowie ChatGPT von OpenAI. Claude Code wurde sowohl für die Entwicklung des Forschungsartefakts als auch für textuelle Arbeiten eingesetzt. ChatGPT wurde insbesondere als wissenschaftlicher Review-Assistent, Citation Auditor und Unterstützung bei der Kürzung, Präzisierung und kapitelübergreifenden Konsistenzprüfung des Manuskripts verwendet.

**Anwendungsbereiche**

Claude Code unterstützte die Softwareentwicklung des Forschungsprototyps einschließlich Architektur, Backend- und Frontend-Implementierung, Datenbanklogik, LLM-Integration, Promptentwicklung, Testing, Evaluationspipeline, Krisenregel und Deployment. Die Entwicklung erfolgte iterativ im Dialog mit dem Assistenzsystem. Claude Code wurde außerdem zur Formulierung, Strukturierung und sprachlichen Präzisierung von Teilen der Thesis eingesetzt.

Bei der technischen Evaluation unterstützte Claude Code die Entwicklung und Implementierung der synthetischen Personas sowie der LLM-Judge-Pipeline. Die 35 Referenzfälle für M1 bis M7 entstanden in einem strukturierten Dialog zwischen der Verfasserin und Claude Code. Die Bewertungskriterien und die final verwendeten Referenzscores wurden von der Verfasserin festgelegt und inhaltlich verantwortet.

ChatGPT wurde im Überarbeitungsprozess als kritischer wissenschaftlicher Gutachter eingesetzt. Die Unterstützung umfasste insbesondere methodische und statistische Kritik, Citation Audits, die Prüfung der Argumentationslogik und des roten Fadens, die Identifikation von Overclaims und Redundanzen, die Kürzung wissenschaftlich nicht notwendiger Passagen sowie die sprachliche Präzisierung und formale Konsistenzprüfung. Darüber hinaus unterstützte ChatGPT die Überarbeitung und Zusammenführung der Word-Arbeitsfassung.

**Umfang und Abgrenzung**

Der Einsatz der KI-Werkzeuge war substanziell und erstreckte sich sowohl auf die technische Entwicklung des Forschungsartefakts als auch auf Formulierungs- und Überarbeitungsprozesse der Thesis. Auf eine nachträgliche prozentuale Quantifizierung KI-unterstützter Textanteile wird verzichtet, da eine belastbare Trennung einzelner Formulierungsanteile im iterativen Arbeitsprozess nicht möglich ist.

**Verantwortung**

Die Auswahl des Forschungsproblems, die Festlegung des Untersuchungsdesigns, die methodischen Entscheidungen, die Freigabe der Systemarchitektur und Promptlogik, die Festlegung der Bewertungskriterien, die Auswahl und Interpretation der statistischen Verfahren sowie die wissenschaftlichen Schlussfolgerungen werden von der Verfasserin verantwortet.

---

# Abkürzungsverzeichnis

| Abkürzung | Bedeutung |
|---|---|
| AI | Artificial Intelligence |
| AI Act | Verordnung (EU) 2024/1689 vom 13. Juni 2024 (Verordnung über künstliche Intelligenz), ABl. L 2024/1689 vom 12.7.2024 |
| API | Application Programming Interface |
| DPA | Data Processing Addendum |
| DSGVO | Verordnung (EU) 2016/679 vom 27. April 2016 (Datenschutz-Grundverordnung), ABl. L 119 vom 4.5.2016, S. 1–88 |
| DSR | Design Science Research |
| EMA | Ecological Momentary Assessment |
| EU | Europäische Union |
| EWR | Europäischer Wirtschaftsraum |
| GPAI | General Purpose Artificial Intelligence |
| GSE | General Self-Efficacy Scale |
| KI | Künstliche Intelligenz |
| LLM | Large Language Model |
| MSLQ | Motivated Strategies for Learning Questionnaire |
| QA | Quality Assurance |
| SCC | Standard Contractual Clauses |
| SRL | Self-Regulated Learning |
| UX | User Experience |
| Digital Omnibus on AI | Verordnung (EU) 2026/1744 zur Änderung des EU AI Acts |

---

# 1 Einleitung

## 1.1 Problemstellung und wissenschaftliche Relevanz

Generative Sprachmodelle erweitern die Möglichkeiten digitaler Lernbegleitung, weil sie offene Dialoge verarbeiten und Antworten kontextbezogen erzeugen können. Für Lernanwendungen entsteht daraus jedoch nicht automatisch ein lernförderliches System. Ein Sprachmodell kann Aufgaben erklären, Lösungen formulieren oder nächste Schritte vorgeben und damit kurzfristig Unterstützung leisten. Dieselbe Unterstützung kann jedoch den kognitiven Eigenanteil der lernenden Person reduzieren, wenn das System dauerhaft die Strukturierung, Bewertung und Lösungsbildung übernimmt. Für eine Lernbegleitung, die Selbstregulation unterstützen soll, besteht deshalb ein Gestaltungsproblem zwischen hilfreicher Adaptation und dem Erhalt eigener kognitiver Aktivität. Die Forschung zu selbstreguliertem Lernen hebt die aktive Steuerung eigener Lernprozesse hervor, während Arbeiten zur Selbstwirksamkeit die Bedeutung wahrgenommener eigener Bewältigungsfähigkeit für zielgerichtetes Handeln beschreiben (Bandura, 1997; Pintrich, 2004).

Für das vorliegende Forschungsproblem reicht es daher nicht aus, einen allgemein leistungsfähigen Chatbot bereitzustellen. Erforderlich ist eine Gesprächslogik, die Unterstützung an die konkrete Interaktion anpasst und zugleich vermeidet, die zentrale Denkleistung systematisch zu übernehmen. Scaffolding beschreibt Unterstützung, die an den aktuellen Bedarf angepasst und mit wachsender Selbstständigkeit zurückgenommen wird (Wood et al., 1976). Für sprachmodellbasierte Systeme stellt sich zusätzlich die Frage, wie eine solche Anpassung erfolgen kann, wenn keine validierte psychologische Diagnostik und keine physiologische Zustandserfassung vorliegen. Das in dieser Arbeit entwickelte Forschungsartefakt nutzt deshalb ausschließlich textbasierte Gesprächssignale als heuristische Adaptionsgrundlage. Hinweise auf mögliche Frustration, Unsicherheit oder positive Aktivierung können die Auswahl der Gesprächsstrategie beeinflussen. Aus diesen Signalen wird jedoch kein Anspruch auf eine valide Messung emotionaler oder psychologischer Zustände abgeleitet.

Der im festgelegten Titel verwendete Begriff der neuroadaptiven Lernbegleitung ist vor diesem Hintergrund eng zu operationalisieren. In der Forschung zu physiologischem Computing bezeichnet Adaptation typischerweise Systeme, die physiologische oder psychophysiologische Informationen zur laufenden Systemanpassung verwenden (Fairclough, 2009). Das hier untersuchte Forschungsartefakt erhebt weder neuronale Aktivität noch physiologische Messgrößen. Neuroadaptivität bezeichnet in dieser Arbeit daher die konzeptionelle Orientierung an einer zustandsabhängigen Lernbegleitung. Ihre technische Umsetzung erfolgt ausschließlich über textbasierte Adaptionssignale und darf nicht mit neurophysiologischer Zustandserfassung gleichgesetzt werden.

Ein zweites Gestaltungsproblem betrifft empathisches Systemverhalten. Empathie bezeichnet beim Menschen ein mehrdimensionales psychologisches Konstrukt, das nicht ohne Weiteres auf technische Systeme übertragen werden kann (Decety & Jackson, 2004). Für den Agenten wird Empathie deshalb nicht als subjektives Erleben verstanden. Gemeint ist beobachtbares Gesprächsverhalten, das Äußerungen der lernenden Person kontextsensitiv aufgreift und Tonalität sowie Unterstützungsintensität anpasst.

Der wissenschaftliche Beitrag der Arbeit liegt auf drei Ebenen. Erstens werden theoretische Anforderungen in eine dokumentierte Artefaktlogik für einen sokratisch und situationsabhängig adaptierenden LLM-Agenten übersetzt. Zweitens werden technische und dialogbezogene Artefaktkriterien getrennt von psychologischen Outcomes evaluiert. Drittens ergänzt eine explorative Pilotstudie die Artefaktevaluation um reale Nutzungsdaten und eine Prä-Post-Untersuchung der allgemeinen Selbstwirksamkeitserwartung.

## 1.2 Zielsetzung und Forschungsfragen

Ziel der Arbeit ist die theoriegeleitete Konzeption, prototypische Entwicklung und Evaluation eines empathisch und adaptiv gestalteten LLM-basierten Agenten für die individuelle Lernbegleitung.

Die übergeordnete Forschungsfrage lautet, wie ein LLM-basierter Agent für die individuelle Lernbegleitung so gestaltet und technisch evaluiert werden kann, dass er adaptive und sokratische Unterstützung ermöglicht, und welche explorativen Hinweise sich aus seiner Nutzung für Veränderungen der allgemeinen Selbstwirksamkeitserwartung ergeben.

Zur Bearbeitung dieser Frage werden drei Teilforschungsfragen unterschieden. FF1 untersucht, wie theoretisch begründete Anforderungen an Selbstregulation, adaptive Unterstützung, sokratische Gesprächsführung und empathisches Systemverhalten in ein LLM-basiertes Forschungsartefakt übersetzt werden können. FF2 untersucht, in welchem Umfang das implementierte System die definierten Kriterien der technischen und dialogbezogenen Artefaktevaluation erfüllt. FF3 untersucht, welche Veränderungen der allgemeinen Selbstwirksamkeitserwartung innerhalb der explorativen Pilotstichprobe zwischen Prä- und Post-Messung beobachtet werden.

## 1.3 Abgrenzung der Untersuchung

Die Arbeit untersucht einen Forschungsprototyp für individuelle Lernbegleitung und kein therapeutisches, diagnostisches oder klinisches System. Textbasierte Gesprächssignale werden als heuristische Hinweise für die Auswahl einer Gesprächsstrategie verwendet. Sie sind keine validierten Messungen von Emotion, Stress, Persönlichkeit oder anderen psychologischen Zuständen.

Das Studiendesign umfasst keine Kontrollgruppe und ist nicht als konfirmatorischer Wirksamkeitsnachweis angelegt. Veränderungen zwischen Prä- und Post-Messung können daher neben der Nutzung des Agenten auch durch Zeit, Wiederholungsmessung, Erwartungen, parallele Erfahrungen oder andere nicht kontrollierte Einflüsse erklärt werden. Die Ergebnisse werden entsprechend als explorative Evidenz innerhalb der untersuchten Stichprobe interpretiert.

## 1.4 Forschungslogik und Aufbau der Arbeit

Die Arbeit folgt einer Design-Science-Forschungslogik, in der die Entwicklung und Evaluation eines Artefakts miteinander verbunden werden (Hevner et al., 2004; Hevner, 2007). Kapitel 2 entwickelt die theoretischen Grundlagen. Kapitel 3 übersetzt diese Anforderungen in die Konzeption des Forschungsartefakts. Kapitel 4 beschreibt das methodische Vorgehen und trennt die Design-Science-Entwicklung von der technischen Evaluation sowie von der explorativen Pilotstudie. Kapitel 5 berichtet die Ergebnisse. Kapitel 6 interpretiert die Befunde. Kapitel 7 fasst den Beitrag zusammen.

---

# 2 Theoretische Grundlagen

*[Kapitel 2 — finalisierte Word-Fassung der Verfasserin ist maßgeblich; diese Datei enthält nur den Gesamt-Strukturkontext]*

---

# 3 Konzeption

*[Kapitel 3 — finalisierte Word-Fassung der Verfasserin ist maßgeblich; diese Datei enthält nur den Gesamt-Strukturkontext]*

---

# 4 Methodisches Vorgehen

*[Kapitel 4 — finalisierte Word-Fassung der Verfasserin ist maßgeblich; diese Datei enthält nur den Gesamt-Strukturkontext]*

---

# Anhang

Vollständige Anhänge A–N: siehe [KAIA_Anhang.md](KAIA_Anhang.md)

---

# Literaturverzeichnis

Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review, 84*(2), 191–215. https://doi.org/10.1037/0033-295X.84.2.191

Bandura, A. (1997). *Self-efficacy: The exercise of control.* W. H. Freeman.

Brusilovsky, P., & Millán, E. (2007). User models for adaptive hypermedia and adaptive educational systems. In P. Brusilovsky, A. Kobsa, & W. Nejdl (Eds.), *The adaptive web* (pp. 3–53). Springer. https://doi.org/10.1007/978-3-540-72079-9_1

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354

Csikszentmihalyi, M. (1990). *Flow: The psychology of optimal experience.* Harper & Row.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100. https://doi.org/10.1177/1534582304267187

Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58. https://doi.org/10.1177/1529100612453266

Europäische Union. (2016). Verordnung (EU) 2016/679 (Datenschutz-Grundverordnung). *Amtsblatt der Europäischen Union, L 119,* 1–88.

Europäische Union. (2024). Verordnung (EU) 2024/1689 (Verordnung über künstliche Intelligenz). *Amtsblatt der Europäischen Union, L 2024/1689.*

Europäische Union. (2026). Verordnung (EU) 2026/1744 (Digital Omnibus on AI). *Amtsblatt der Europäischen Union, L 2026/1744.*

Fairclough, S. H. (2009). Fundamentals of physiological computing. *Interacting with Computers, 21*(1–2), 133–145. https://doi.org/10.1016/j.intcom.2008.10.011

Flavell, J. H. (1979). Metacognition and cognitive monitoring. *American Psychologist, 34*(10), 906–911. https://doi.org/10.1037/0003-066X.34.10.906

Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. *American Psychologist, 54*(7), 493–503. https://doi.org/10.1037/0003-066X.54.7.493

Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology, 38,* 69–119. https://doi.org/10.1016/S0065-2601(06)38002-1

Gregor, S., & Hevner, A. R. (2013). Positioning and presenting design science research for maximum impact. *MIS Quarterly, 37*(2), 337–355. https://doi.org/10.25300/MISQ/2013/37.2.01

Hevner, A. R. (2007). A three cycle view of design science research. *Scandinavian Journal of Information Systems, 19*(2), 87–92.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105. https://doi.org/10.2307/25148625

Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review, 19,* 509–539. https://doi.org/10.1007/s10648-007-9054-3

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31. https://doi.org/10.1207/S15326985EP3801_4

Kasneci, E., Sessler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., Gasser, U., Groh, G., Günnemann, S., Hüllermeier, E., Krusche, S., Kutyniok, G., Michaeli, T., Nerdel, C., Pfeffer, J., Poquet, O., Sailer, M., Schmidt, A., Seidel, T., Stadler, M., Weller, J., Kuhn, J., & Kasneci, G. (2023). ChatGPT for good? On opportunities and challenges of large language models for education. *Learning and Individual Differences, 103,* 102274. https://doi.org/10.1016/j.lindif.2023.102274

Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. *Biometrics, 33*(1), 159–174. https://doi.org/10.2307/2529310

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology, 44,* 1–21. https://doi.org/10.1146/annurev.ps.44.020193.000245

Lazarus, R. S., & Folkman, S. (1984). *Stress, appraisal, and coping.* Springer.

Le, N. T. (2019). How do technology-enhanced learning tools support critical thinking? *Frontiers in Education, 4,* 126. https://doi.org/10.3389/feduc.2019.00126

Multon, K. D., Brown, S. D., & Lent, R. W. (1991). Relation of self-efficacy beliefs to academic outcomes: A meta-analytic investigation. *Journal of Counseling Psychology, 38*(1), 30–38. https://doi.org/10.1037/0022-0167.38.1.30

Muñoz, S., & Iglesias, C. A. (2022). A text classification approach to detect psychological stress combining a lexicon-based feature framework with distributional representations. *Information Processing & Management, 59*(5), 103011. https://doi.org/10.1016/j.ipm.2022.103011

Nakamura, J., & Csikszentmihalyi, M. (2002). The concept of flow. In C. R. Snyder & S. J. Lopez (Eds.), *Handbook of positive psychology* (pp. 89–105). Oxford University Press.

Ortega-Ochoa, E., Arguedas, M., & Daradoumis, T. (2024). Empathic pedagogical conversational agents: A systematic literature review. *British Journal of Educational Technology, 55,* 886–909. https://doi.org/10.1111/bjet.13413

Pajares, F. (1996). Self-efficacy beliefs in academic settings. *Review of Educational Research, 66*(4), 543–578. https://doi.org/10.3102/00346543066004543

Picard, R. W. (1997). *Affective computing.* MIT Press. https://doi.org/10.7551/mitpress/1140.001.0001

Pintrich, P. R. (2004). A conceptual framework for assessing motivation and self-regulated learning in college students. *Educational Psychology Review, 16*(4), 385–407. https://doi.org/10.1007/s10648-004-0006-x

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ).* University of Michigan. ERIC ED338122.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement, 53*(3), 801–813. https://doi.org/10.1177/0013164493053003024

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist, 55*(1), 68–78. https://doi.org/10.1037/0003-066X.55.1.68

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), *Measures in health psychology: A user's portfolio. Causal and control beliefs* (pp. 35–37). NFER-NELSON.

Shiffman, S., Stone, A. A., & Hufford, M. R. (2008). Ecological momentary assessment. *Annual Review of Clinical Psychology, 4,* 1–32. https://doi.org/10.1146/annurev.clinpsy.3.022806.091415

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4

Sweller, J., van Merriënboer, J. J. G., & Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296. https://doi.org/10.1023/A:1022193728205

Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31,* 261–292. https://doi.org/10.1007/s10648-019-09465-5

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547. https://doi.org/10.1177/0959354394044004

Vanbelle, S., & Albert, A. (2009). A note on the linearly weighted kappa coefficient for ordinal scales. *Statistical Methodology, 6*(2), 157–163. https://doi.org/10.1016/j.stamet.2008.06.001

Wood, D., Bruner, J. S., & Ross, G. (1976). The role of tutoring in problem solving. *Journal of Child Psychology and Psychiatry, 17*(2), 89–100. https://doi.org/10.1111/j.1469-7610.1976.tb00381.x

Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology, 18,* 459–482.

Zheng, L., Chiang, W. L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E. P., Zhang, H., Gonzalez, J. E., & Stoica, I. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. *Advances in Neural Information Processing Systems, 36.*

Zimmerman, B. J. (2000). Attaining self-regulation: A social cognitive perspective. In M. Boekaerts, P. R. Pintrich, & M. Zeidner (Eds.), *Handbook of self-regulation* (pp. 13–39). Academic Press. https://doi.org/10.1016/B978-012109890-2/50031-7

---

# Eidesstattliche Erklärung

| | |
|---|---|
| Name | Dagmar Rostek |
| Matrikel-Nr. | 2004169 |
| Studiengang | Data Science & Analytics (M.Sc.) |

Ich versichere, dass ich die vorliegende Master-Thesis mit dem Thema

**„Entwicklung eines empathischen AI-Agenten zur neuroadaptiven personalisierten Lernbegleitung"**

ohne Hilfe Dritter und ohne Benutzung anderer als der angegebenen Quellen und Hilfsmittel angefertigt und die den benutzten Quellen wörtlich oder inhaltlich entnommenen Stellen als solche kenntlich gemacht habe.

Diese Arbeit hat in gleicher oder ähnlicher Form noch keiner Prüfungsbehörde vorgelegen.

| Datum | Unterschrift |
|---|---|
| | |
