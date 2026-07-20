# Kapitel 1 — Einleitung

**Version:** 1.0  
**Stand:** 13. Juli 2026  
**Geplanter Umfang:** ca. 2.200 Wörter

---

## 1.1 Motivation und Problemstellung

Die Verbreitung großer Sprachmodelle (Large Language Models, LLMs) hat in den vergangenen drei Jahren eine neue Phase in der Diskussion über KI-gestützte Bildungstechnologien eingeleitet. Systeme wie ChatGPT (OpenAI, 2022), Khanmigo (Khan Academy, 2023) oder Google Gemini werden zunehmend als tutorielle Begleiter im Selbststudium eingesetzt — häufig ohne empirische Validierung ihrer pädagogischen Wirksamkeit und ohne hinreichende Berücksichtigung datenschutzrechtlicher Anforderungen, wie sie die Datenschutz-Grundverordnung (DSGVO) und der EU-AI-Act (European Parliament, 2024) stellen (Holmes et al., 2022; Zawacki-Richter et al., 2019).

Die lernpsychologische Forschung verweist dabei auf ein grundlegendes Spannungsfeld: Adaptive Systeme, die Lernende durch Inhalte führen, können Selbstwirksamkeit ebenso stärken wie untergraben. Kalyuga (2007) zeigt, dass elaborierte Scaffolding-Interventionen bei fortschreitender Expertise den Lerneffekt umkehren können — das System wird zur kognitiven Krücke statt zum Katalysator. Für den Hochschulkontext, in dem Selbstregulation und Metakognition zentrale Kompetenzziele darstellen (Pintrich et al., 1993), ist dies besonders relevant: Ein System, das denkt, bevor der Lernende es tut, unterminiert genau das, was Hochschulbildung fördern soll.

Hinzu kommt die Rolle des subjektiven Stresserlebens. Lazarus (1993) zeigt in seiner kognitiv-transaktionalen Stresstheorie, dass nicht objektive Anforderungen, sondern deren subjektive Bewertung — die kognitive Appraisal-Sequenz — das Stresserleben und damit das Lernverhalten determinieren. Ein Lernbegleiter, der situative Stresszustände ignoriert und rein inhaltsgetrieben operiert, verfehlt damit einen wesentlichen Einflusskanal auf Lernerfolg und Motivation. Teigen (1994) ergänzt mit dem Yerkes-Dodson-Prinzip, dass sowohl Unter- als auch Überforderung den Lerntransfer hemmen; ein optimal kalibriertes Aktivierungsniveau ist Voraussetzung für nachhaltiges Lernen.

Schließlich ist die Frage der Empathie in KI-Systemen zu stellen. Decety und Jackson (2004) unterscheiden zwischen affektiver und kognitiver Empathie; was in KI-Systemen erzeugt werden kann, ist eine form von *computational empathy* — die modellierte Repräsentation emotionaler Zustände als Grundlage adaptiver Reaktionen. Ob und unter welchen Bedingungen diese Form der Empathie in tutoriellen Systemen lernförderlich wirkt, ist empirisch weitgehend ungeklärt.

Vor diesem Hintergrund entstand KAIA (Kinetic AI Agent) — ein empathischer KI-Lernbegleiter, der eine spezifische Lücke adressiert: den **Knowing-Doing Gap** (Pfeffer & Sutton, 2000). Menschen scheitern im Lernkontext selten daran, dass ihnen Wissen fehlt — sie scheitern daran, vorhandenes Wissen in konkretes Alltagshandeln zu überführen (Sheeran, 2002: Intention-Behavior Gap). KAIA ist nicht für den Wissensaufbau von Null konzipiert. KAIA begleitet Menschen, die bereits wissen, was sie tun sollten, und genau dort nicht handeln. Die sokratische Gesprächsführung aktiviert latentes Vorwissen; Implementation Intentions (Gollwitzer, 1999) überführen Erkenntnisse in konkrete Handlungsschritte.

---

## 1.2 Forschungsfragen

Aus der skizzierten Problemstellung ergeben sich drei aufeinander aufbauende Forschungsfragen:

**FF1 — Sokratische KI-Begleitung ohne Autonomieverlust:**  
Wie kann ein KI-Lernbegleiter sokratische Gesprächsführung operationalisieren, ohne die Lernautonomie der Nutzenden zu reduzieren?

Diese Frage adressiert das didaktische Kernproblem: Sokratik bedeutet, dass Erkenntnisse durch den Lernenden selbst entstehen — ein KI-System, das diesen Prozess zu stark vorstrukturiert, widerspricht dem Prinzip methodisch. Die Arbeit untersucht, welche Interaktionsarchitektur (drei konfigurierbare Charaktermodi: Begleitend, Konfrontierend, Perspektivwechselnd), welches Prompt-Design und welche Session-Sequenzierung dieses Gleichgewicht herzustellen vermögen. Die Arbeit untersucht, wie sokratische Begleitung spezifisch den Intention-Behavior Gap (Sheeran, 2002) überbrückt: nicht durch Wissensvermittlung, sondern durch Handlungsplanung und Reflexion auf vorhandenes, nicht umgesetztes Wissen.

**FF2 — Neuroadaptive Personalisierung unter DSGVO-Bedingungen:**  
Welche Formen neuroadaptiver Personalisierung sind in einem DSGVO-konformen System technisch umsetzbar und für Lernende akzeptabel?

Diese Frage verbindet den technischen Entwurf — persistentes Nutzerprofil, kumulatives Gedächtnis über pgvector-Embeddings, MSLQ-basierte motivationale Profilierung — mit den normativen Anforderungen des europäischen Datenschutzrechts. Besondere Relevanz kommt der Frage zu, wo die Grenze zwischen lernförderlicher Personalisierung und unzulässiger Profilierung im Sinne des EU-AI-Acts liegt, sowie welche Datensparsamkeitsprinzipien die Systemarchitektur strukturieren.

**FF3 — LLM-Architekturvergleich:**  
Welches der evaluierten großen Sprachmodelle zeigt unter kontrollierten Bedingungen die höchste Qualität in den Dimensionen Empathie, sokratische Gesprächsführung, Konsistenz und Crisis-Detection-Sicherheit?

Diese Frage zielt auf den systematischen Vergleich von sieben Sprachmodellen: Claude Sonnet 4.6 und Claude Haiku 4.5 (Anthropic), GPT-4o, GPT-5.6 Terra und GPT-4.1 mini (OpenAI) sowie Mistral Large und Mistral Small (Mistral AI). Die Evaluation erfolgt über eine Crash-Persona-Simulation mit zehn definierten Testpersönlichkeiten sowie eine strukturierte Eval-Matrix mit vier Metriken. Der Vergleich schließt eine Bewertung der datenschutzrechtlichen Eignung der Anbieter für einen EU-Einsatzkontext ein.

---

## 1.3 Zielsetzung

Ziel dieser Arbeit ist die Entwicklung, Implementierung und explorative Evaluation eines sokratisch konfigurierten KI-Lernbegleiters (KAIA) nach den Prinzipien des Design Science Research (Hevner et al., 2004). Im Mittelpunkt stehen drei komplementäre Ziele:

Erstens die Konstruktion eines funktionsfähigen Prototyps als Design-Artefakt: eine DSGVO-konforme Webanwendung, die sokratische Gesprächsführung mit neuroadaptiver Personalisierung verbindet. Der Prototyp ist nicht als Proof-of-Concept angelegt, sondern als studientaugliches System mit vollständigem Consent-Flow, Datenlöschung auf Anfrage und prüfbarer Serverinfrastruktur in der EU.

Zweitens eine systematische Evaluation der verwendeten LLMs hinsichtlich pädagogischer Qualitätsmerkmale — als Grundlage für begründete Modellentscheidungen in Folgestudien und als Beitrag zur noch dünnen empirischen Literatur zu LLM-Qualität im Bildungskontext.

Drittens die Durchführung einer explorativen Pilotstudie (N ≈ 20) mit Prä/Post-Messung allgemeiner Selbstwirksamkeitserwartung (GSE; Schwarzer & Jerusalem, 1995) und motivationaler Lernstrategien (MSLQ; Pintrich et al., 1991, 1993). Die Studie ist als Pilotstudie angelegt; statistisch belastbare Kausalaussagen sind bei der geplanten Stichprobengröße nicht möglich und nicht intendiert. Ziel ist die Gewinnung erster Hinweise auf Wirkrichtungen sowie die methodische Vorbereitung einer späteren Hauptstudie.

---

## 1.4 Methodik: Design Science Research

Die Arbeit folgt dem Paradigma des Design Science Research (DSR) nach Hevner et al. (2004). DSR verbindet die Konstruktion eines nützlichen Artefakts mit der Gewinnung wissenschaftlichen Wissens über seine Gestaltungsprinzipien. Im Gegensatz zu rein explanativer Forschung steht beim DSR die Frage im Vordergrund: Wie muss ein System beschaffen sein, um in einem definierten Kontext wirksam zu sein?

Für KAIA bedeutet dies konkret die Umsetzung der drei DSR-Zyklen nach Hevner (2007):

- **Relevance Cycle:** Die Anforderungen entstammen der lernpsychologischen Forschung zu Selbstregulation, Stresserleben und Selbstwirksamkeit sowie dem praktischen Bedarf nach DSGVO-konformen KI-Tutorsystemen im deutschsprachigen Hochschulraum.
- **Design Cycle:** Iterative Entwicklung des KAIA-Prototyps über mehrere Versionen der Session-Architektur. Die dritte Version (Session-Architektur v3) implementiert persistente Nutzerprofile auf MSLQ-Basis, kumulatives semantisches Gedächtnis (pgvector) und ein versioniertes Prompt-Management-System mit Jinja2-Templates.
- **Rigor Cycle:** Theoretische Fundierung in Lernpsychologie (Lazarus, 1993; Kalyuga, 2007; Teigen, 1994), Didaktik (sokratische Methode, Bloom'sche Taxonomie), Empathieforschung (Decety & Jackson, 2004) und Flow-Theorie (Oliveira & Hamari, 2024).

Das DSR-Paradigma ist für diese Arbeit besonders geeignet, weil der Forschungsgegenstand — ein neuartiges KI-Lernsystem — nicht a priori existiert, sondern erst durch den Entwurfsprozess konstituiert wird. Erkenntnisse entstehen iterativ aus Entwurf, Implementierung, Test und Reflexion; die Trennung zwischen Forschung und Entwicklung ist dabei strukturell aufgehoben, nicht methodisch ignoriert.

---

## 1.5 Aufbau der Arbeit

Die vorliegende Arbeit gliedert sich in sechs Kapitel.

**Kapitel 1** legt die Problemstellung, die drei Forschungsfragen und die methodischen Grundlagen dar und deklariert den Interessenkonflikt.

**Kapitel 2** erarbeitet die wissenschaftlichen Grundlagen: selbstreguliertes Lernen und Selbstwirksamkeitserwartung (Bandura, 1997; Schwarzer & Jerusalem, 1995), motivationale Lernstrategien (MSLQ; Pintrich et al., 1991, 1993), sokratische Didaktik, Stress und kognitive Bewertung (Lazarus, 1993), computational empathy (Decety & Jackson, 2004), Flow-Kalibrierung (Oliveira & Hamari, 2024) sowie aktuelle Forschung zu LLMs im Bildungskontext.

**Kapitel 3** dokumentiert Entwurf und technische Realisierung des KAIA-Systems: Komponentenarchitektur (FastAPI-Backend, PostgreSQL 16 mit pgvector, Next.js-14-Frontend, Hosting auf Hetzner Cloud Helsinki), Session-Architektur v3, das dreigliedrige Charaktersystem, Prompt-Management, neuroadaptive Personalisierungslogik, DSGVO-Umsetzung (Multi-Step-Consent, KI-Disclosure, DSGVO-Artt. 15–21) und Eval-Infrastruktur.

**Kapitel 4** beschreibt Methodik und Ergebnisse des systematischen LLM-Modellvergleichs auf Basis der Crash-Persona-Simulation (zehn Testpersonas) und der Eval-Matrix (vier Metriken: Empathie, sokratische Qualität, Konsistenz, Crisis-Detection-Sicherheit).

**Kapitel 5** stellt Design, Durchführung und Ergebnisse der explorativen Pilotstudie vor: Rekrutierung, Stichprobenbeschreibung, Studienprotokoll (Studienstart 1. August 2026, Studienende 29. August 2026, mindestens drei Sessions über vier Wochen), Erhebungsinstrumente, deskriptive Statistik und erste Befundmuster.

**Kapitel 6** reflektiert die Ergebnisse vor dem Hintergrund der theoretischen Grundlagen, diskutiert Limitationen, zieht methodische Schlussfolgerungen und skizziert den Weg zu einer Hauptstudie.

---

## 1.6 Abgrenzung

Die folgenden Abgrenzungen sind für das Verständnis dieser Arbeit konstitutiv:

**Kein klinisches System.** KAIA ist nicht für die Begleitung psychischer Erkrankungen konzipiert und ersetzt keine psychotherapeutische Behandlung. Die implementierte Crisis-Detection leitet bei entsprechenden Signalen an professionelle Hilfsangebote weiter (Telefonseelsorge 0800 111 0 111); eine inhaltliche Krisenintervention findet nicht statt. Nutzende mit akuten psychischen Erkrankungen sind aus der Studie ausgeschlossen.

**Kein repräsentatives Experiment.** Die Pilotstudie mit N ≈ 20 Personen aus dem persönlichen Netzwerk der Forscherin ermöglicht keine statistisch generalisierbaren Kausalaussagen. Eine Stichprobengröße dieser Größenordnung erlaubt keine ausreichende statistische Power für inferenzstatistische Schlüsse; die Ergebnisse sind als explorativ zu verstehen. Power-Analysen (G*Power) dienen der Vorbereitung einer Folgestudie, nicht der Validierung der vorliegenden.

**Kein vollständiges adaptives Tutorsystem.** KAIA implementiert keine automatisierte Leistungsdiagnose, keine domänenspezifische Wissensbasis und kein vollständiges Intelligent Tutoring System (ITS) im Sinne von Vanlehn (2011). Die Personalisierung basiert auf motivationalen Profilen (MSLQ) und semantischem Gedächtnis; eine kompetenzdiagnostische Modellierung des Lernenden findet nicht statt.

**Kein Wissensvermittlungssystem.** KAIA ist nicht für den Aufbau von Fachwissen konzipiert. Zielgruppe sind Menschen mit vorhandenem Wissen in einem Lernbereich, das im Alltag nicht konsequent umgesetzt wird (Knowing-Doing Gap; Pfeffer & Sutton, 2000). Wer grundlegendes Domänenwissen erst erwerben muss, ist nicht KAIAs primäre Zielgruppe.

**Kein generisches Mehrsprachensystem.** KAIA ist explizit für den deutschsprachigen Einsatz konfiguriert. Englischsprachige Nutzung ist bis zum Abschluss der Thesis nicht vorgesehen; alle Prompts, Benutzeroberflächen und Studienunterlagen sind in deutscher Sprache verfasst.

**Kein Produktivsystem.** Der Prototyp ist für eine definierte Pilotstudie konzipiert. Ein öffentliches Release für nicht-studienteilnehmende Nutzerinnen und Nutzer erfolgt erst nach Abschluss der Thesis und nach einer ethischen Neubewertung im Rahmen einer möglichen Kommerzialisierung.

---

## 1.7 Interessenkonflikt

Die Verfasserin dieser Arbeit ist gleichzeitig in drei Rollen tätig: als **Entwicklerin** des Systems, als **Forscherin** der Pilotstudie und als **potenzielle Kommerzialisiererin** einer späteren Produktversion. Dieser dreifache Interessenkonflikt ist in Übereinstimmung mit den Standards wissenschaftlicher Integrität (Deutsche Forschungsgemeinschaft, 2022) offenzulegen und zu reflektieren.

Die Doppelrolle Entwicklerin/Forscherin bringt methodische Risiken mit sich: Confirmation Bias bei der Interpretation der Ergebnisse, Selektivität bei der Berichterstattung von Befunden, und eine mögliche unbewusste Beeinflussung des Studiendesigns zugunsten erwarteter Ergebnisse. Das Potenzial einer späteren Kommerzialisierung verstärkt diesen Anreiz strukturell.

**Konsequenzen für das Forschungsdesign:** Die Pilotstudie ist bewusst explorativ angelegt und erhebt keinen Anspruch auf kausale Wirksamkeitsnachweise. Alle Messinstrumente sind validierte, extern entwickelte Skalen (GSE: Schwarzer & Jerusalem, 1995; MSLQ: Pintrich et al., 1991). Die Befunddarstellung erfolgt unter expliziter Benennung der methodischen Einschränkungen, die sich aus dem Rollenmix ergeben. Negative und neutrale Befunde werden gleichwertig berichtet.

**Transparenz gegenüber Teilnehmenden:** Alle Studienteilnehmenden werden im Rahmen des Multi-Step-Consents über die Doppelrolle der Forscherin informiert. Die Teilnahmevereinbarung enthält einen expliziten Hinweis darauf, dass die Forscherin ein persönliches Interesse an positiven Studienergebnissen haben könnte. Die Teilnahme ist freiwillig und ohne Angabe von Gründen jederzeit widerrufbar, ohne dass der Widerruf Konsequenzen für das Verhältnis zur Forscherin hat.

**Datenhaltung:** Sämtliche Nutzerdaten werden ausschließlich auf EU-Servern (Hetzner Cloud, Helsinki) gespeichert. Nach Abschluss der Studie werden alle personenbezogenen Daten entsprechend der dokumentierten Löschfristen entfernt. Datenverarbeitungsverträge (DPAs) bestehen mit Anthropic, OpenAI und Mistral AI. Während der Studienlaufzeit sind Prompt- und Schemaänderungen technisch gesperrt (Study-Lock ab 28. Juli 2026).

---

## Literaturverzeichnis (Kapitel 1)

Bandura, A. (1997). *Self-efficacy: The exercise of control*. Freeman.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews*, *3*(2), 71–100. https://doi.org/10.1177/1534582304267187

Deutsche Forschungsgemeinschaft. (2022). *Leitlinien zur Sicherung guter wissenschaftlicher Praxis* (2. Aufl.). DFG. https://doi.org/10.5281/zenodo.6472827

European Parliament. (2024). *Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act)*. Official Journal of the European Union.

Hevner, A. R. (2007). A three cycle view of design science research. *Scandinavian Journal of Information Systems*, *19*(2), 87–92.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly*, *28*(1), 75–105. https://doi.org/10.2307/25148625

Holmes, W., Porayska-Pomsta, K., Holstein, K., Sutherland, E., Baker, T., Shum, S. B., Santos, O. C., Rodrigo, M. T., Cukurova, M., Bittencourt, I. I., & Koedinger, K. R. (2022). Ethics of AI in education: Towards a community-wide agenda. *Journal of Learning Analytics*, *9*(1), 163–181. https://doi.org/10.18608/jla.2022.7227

Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review*, *19*(4), 509–539. https://doi.org/10.1007/s10648-007-9054-3

Lazarus, R. S. (1993). From psychological stress to the emotions: A history of changing outlooks. *Annual Review of Psychology*, *44*(1), 1–21. https://doi.org/10.1146/annurev.ps.44.020193.000245

Oliveira, W., & Hamari, J. (2024). Flow in educational gamification: A systematic review. *Computers & Education*, *213*, 104998. https://doi.org/10.1016/j.compedu.2024.104998

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). *A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)* (ERIC Document Reproduction Service No. ED338122). University of Michigan.

Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). *Educational and Psychological Measurement*, *53*(3), 801–813. https://doi.org/10.1177/0013164493053003024

Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. In J. Weinman, S. Wright & M. Johnston (Hrsg.), *Measures in health psychology: A user's portfolio. Causal and control beliefs* (S. 35–37). NFER-Nelson.

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology*, *4*(4), 525–547. https://doi.org/10.1177/0959354394044004

Vanlehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist*, *46*(4), 197–221. https://doi.org/10.1080/00461520.2011.611369

Zawacki-Richter, O., Marín, V. I., Bond, M., & Gouverneur, F. (2019). Systematic review of research on artificial intelligence applications in higher education – where are the educators? *International Journal of Educational Technology in Higher Education*, *16*(1), 39. https://doi.org/10.1186/s41239-019-0171-0
