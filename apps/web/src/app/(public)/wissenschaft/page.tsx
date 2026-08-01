export const dynamic = "force-dynamic";

import { ExternalLink } from "lucide-react";

interface Source {
  authors: string;
  year: string;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  relevanz: string;
  zusatz?: string; // Psychologen-Empfehlung
}

interface Diskurs {
  titel: string;
  funktion: string;
  farbe: string;
  quellen: Source[];
}

const DISKURSE: Diskurs[] = [
  {
    titel: "Lernpsychologie",
    funktion: "Begründet situatives, selbstbestimmtes Lernen als Ausgangspunkt",
    farbe: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    quellen: [
      {
        authors: "Holzkamp, K.",
        year: "1995",
        title: "Lernen: Subjektwissenschaftliche Grundlegung",
        journal: "Forum Kritische Psychologie, 36, 113–131",
        url: "https://www.kritische-psychologie.de/files/FKP_36_Klaus_Holzkamp_Lernen.pdf",
        relevanz: "Lernen verläuft nicht linear, sondern situativ und durch Irritation geprägt. Begründet warum KAIA keine Wissensvermittlung betreibt, sondern Lernende in ihrer eigenen Situationsbewertung begleitet.",
      },
      {
        authors: "Deci, E. L., & Ryan, R. M.",
        year: "2000",
        title: 'The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior',
        journal: "Psychological Inquiry, 11(4), 227–268",
        doi: "10.1207/S15327965PLI1104_01",
        relevanz: "Selbstbestimmungstheorie: Menschen lernen am besten wenn Autonomie, Kompetenz und soziale Eingebundenheit erfüllt sind. Kern-Designprinzip für KAIAs sokratische Begleitung — kein Vorhersagen, kein Vorgeben.",
      },
    ],
  },
  {
    titel: "Entwicklungspsychologie & Didaktik",
    funktion: "Begründet wie Lernen durch Begleitung, Irritation und Erfahrung entsteht",
    farbe: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    quellen: [
      {
        authors: "Vygotsky, L. S.",
        year: "1978",
        title: "Mind in Society: The Development of Higher Psychological Processes",
        journal: "Harvard University Press",
        relevanz: "Zone der nächsten Entwicklung (ZPD): Lernen findet optimal im Raum zwischen dem statt, was jemand alleine kann, und dem was mit Unterstützung möglich ist. Kernbegründung für KAIAs adaptive Fragelogik — KAIA muss erkennen wo jemand steht und Fragen genau an dieser Grenze platzieren, nicht darunter, nicht darüber.",
      },
      {
        authors: "Wood, D., Bruner, J. S., & Ross, G.",
        year: "1976",
        title: "The role of tutoring in problem solving",
        journal: "Journal of Child Psychology and Psychiatry, 17(2), 89–100",
        doi: "10.1111/j.1469-7610.1976.tb00381.x",
        relevanz: "Ursprüngliche Definition von Scaffolding: Ein tutorieller Agent übernimmt die Aufgabenteile die den Lernenden überfordern würden — und zieht sich schrittweise zurück. Wichtig: Scaffolding ist an Problemlösung gebunden, nicht an Inhaltsvermittlung. Kernbegründung für KAIAs adaptive Fragelogik — intensive Begleitung am Anfang, zunehmende Zurückhaltung sobald Selbstregulation einsetzt.",
      },
      {
        authors: "Bruner, J.",
        year: "1996",
        title: "The Culture of Education",
        journal: "Harvard University Press",
        relevanz: "Erweitert das Scaffolding-Konzept (→ Wood et al. 1976) in den kulturellen und narrativen Kontext von Bildung. Lernen als gemeinschaftlich konstruierter Bedeutungsprozess, nicht als Informationsübertragung. Begründet KAIAs Gesprächslogik: KAIA ist kein Instruktor, sondern Teil eines gemeinsamen Deutungsprozesses.",
      },
      {
        authors: "Mezirow, J.",
        year: "1991",
        title: "Transformative Dimensions of Adult Learning",
        journal: "Jossey-Bass",
        relevanz: "Erwachsene lernen durch 'disorienting dilemmas' — Momente produktiver Desorientierung, die zur Reflexion und Transformation von Deutungsrahmen führen. KAIAs sokratischer Ansatz zielt gezielt auf solche Irritationen: nicht beruhigen, sondern zum Nachdenken über eigene Annahmen einladen.",
      },
      {
        authors: "Kolb, D. A.",
        year: "1984",
        title: "Experiential Learning: Experience as the Source of Learning and Development",
        journal: "Prentice Hall",
        relevanz: "Lernzyklus aus Erfahrung, Reflexion, Konzeptualisierung und Experiment. Rahmen für KAIAs Gesprächsstruktur: In welcher Phase des Lernzyklus befindet sich der Nutzer, und welche Art von Frage passt dazu? Konkrete Orientierung für das Prompt-Design.",
      },
    ],
  },
  {
    titel: "Stressregulation",
    funktion: "Erklärt warum Menschen unter Stress anders lernen",
    farbe: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    quellen: [
      {
        authors: "Lazarus, R. S.",
        year: "1993",
        title: "Coping theory and research: Past, present, and future",
        journal: "Psychosomatic Medicine, 55(3), 234–247",
        doi: "10.1097/00006842-199305000-00002",
        relevanz: "Stress entsteht durch subjektive Situationsbewertung, nicht objektiv. Begründet textbasierte Zustandserkennung: KAIA muss erkennen wie eine Person ihre Situation bewertet — nicht was objektiv passiert.",
      },
      {
        authors: "Teigen, K. H.",
        year: "1994",
        title: "Yerkes-Dodson: A law for all seasons",
        journal: "Theory & Psychology, 4(4), 525–547",
        doi: "10.1177/0959354394044004",
        relevanz: "Optimales Aktivierungsniveau als Leistungsvoraussetzung. Begründet KAIAs Flow-Kalibrierung: zu wenig Herausforderung = Langeweile, zu viel = Überforderung. KAIA soll den Sweetspot halten.",
      },
    ],
  },
  {
    titel: "Diagnostik & Metakognition",
    funktion: "Begründet textbasierte Zustandserkennung",
    farbe: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    quellen: [
      {
        authors: "Flavell, J. H.",
        year: "1979",
        title: "Metacognition and cognitive monitoring",
        journal: "American Psychologist, 34(10), 906–911",
        doi: "10.1037/0003-066X.34.10.906",
        relevanz: "Metakognition als Schlüsselkompetenz: das Wissen über die eigenen Denkprozesse. KAIAs Fragen zielen darauf ab, Metakognition anzuregen — nicht Antworten zu geben, sondern zum Nachdenken über das eigene Denken einzuladen.",
      },
      {
        authors: "Kruger, J., & Dunning, D.",
        year: "1999",
        title: "Unskilled and unaware of it",
        journal: "Journal of Personality and Social Psychology, 77(6), 1121–1134",
        doi: "10.1037/0022-3514.77.6.1121",
        relevanz: "Dunning-Kruger-Effekt: Menschen überschätzen ihre Kompetenz in Bereichen wo sie wenig wissen. KAIA muss mit dieser Diskrepanz umgehen können — sanfte Konfrontation durch Fragen statt Korrekturen.",
      },
      {
        authors: "Brusilovsky, P., & Millán, E.",
        year: "2007",
        title: "User models for adaptive hypermedia and adaptive educational systems",
        journal: "In: The adaptive web. Springer",
        doi: "10.1007/978-3-540-72079-9_1",
        relevanz: "Technische Grundlage für das persistente Gedächtnissystem: Wie werden Nutzermodelle gebaut und aktualisiert? Direkt relevant für KAIAs zweischichtiges Gedächtnis aus relationaler DB + Vektorspeicher.",
      },
      {
        authors: "Heppner, P. P., & Petersen, C. H.",
        year: "1982",
        title: "The development and implications of a personal problem-solving inventory",
        journal: "Journal of Counseling Psychology, 29(1), 66–75",
        doi: "10.1037/0022-0167.29.1.66",
        relevanz: "Problemlösekompetenz als Messgröße. Neben Selbstwirksamkeit ist Problemlösekompetenz das zweite Outcome-Kriterium der Studie — dieser Artikel liefert die psychometrische Grundlage.",
      },
    ],
  },
  {
    titel: "Adaptives Lernen & Selbstreguliertes Lernen",
    funktion: "Begründet den sokratischen Begleitansatz",
    farbe: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    quellen: [
      {
        authors: "Kalyuga, S.",
        year: "2007",
        title: "Expertise reversal effect and its implications for learner-tailored instruction",
        journal: "Educational Psychology Review, 19(4), 509–539",
        doi: "10.1007/s10648-007-9054-3",
        relevanz: "Adaptivitäts-Paradox: Je mehr ein System den nächsten Schritt vorgibt, desto mehr reduziert es Selbstlernkompetenz. Kernbegründung warum KAIA ausschließlich Fragen stellt — kein direktes Instruieren.",
      },
      {
        authors: "Zimmerman, B. J.",
        year: "2002",
        title: "Becoming a self-regulated learner: An overview",
        journal: "Theory Into Practice, 41(2), 64–70",
        doi: "10.1207/s15430421tip4102_2",
        relevanz: "Selbstreguliertes Lernen wird durch übermäßige Systemadaption geschwächt. Begründet KAIAs Zurückhaltung: das System soll Selbstregulation stärken, nicht ersetzen.",
      },
      {
        authors: "Hmelo-Silver, C. E.",
        year: "2004",
        title: "Problem-based learning: What and how do students learn?",
        journal: "Educational Psychology Review, 16(3), 235–266",
        doi: "10.1023/B:EDPR.0000034022.16470.f3",
        relevanz: "Empirische Basis für problembasiertes Lernen. Zeigt welche Lernprozesse durch offene Fragen anstelle von direkter Instruktion ausgelöst werden — zentrale Evidenz für KAIAs sokratischen Ansatz.",
      },
      {
        authors: "Hmelo-Silver, C. E., & Barrows, H. S.",
        year: "2006",
        title: "Goals and strategies of a problem-based learning facilitator",
        journal: "Interdisciplinary Journal of Problem-Based Learning, 1(1), 21–39",
        relevanz: "Konkrete Facilitator-Strategien im fragenbasierten Lernen. Zeigt wie Fragen gezielt eingesetzt werden um Reflexion auszulösen — direkte Vorlage für KAIAs Prompt-Logik.",
        zusatz: "Empfehlung Psychologe: Ergänzt Hmelo-Silver 2004 mit konkreten Gesprächsführungs-Strategien.",
      },
      {
        authors: "Pintrich, P. R., & De Groot, E. V.",
        year: "1990",
        title: "Motivational and self-regulated learning components of classroom academic performance",
        journal: "Journal of Educational Psychology, 82(1), 33–40",
        relevanz: "Liefert den MSLQ (Motivated Strategies for Learning Questionnaire) mit validierten Subskalen für akademische Selbstwirksamkeit. Direkt adaptierbar als Messinstrument neben der GSE-Skala.",
        zusatz: "Empfehlung Psychologe: Als Ergänzung zur GSE für lernspezifische Selbstwirksamkeitsmessung.",
      },
      {
        authors: "Bordin, E. S.",
        year: "1979",
        title: "The generalizability of the psychoanalytic concept of the working alliance",
        journal: "Psychotherapy: Theory, Research and Practice, 16(3), 252–260",
        doi: "10.1037/h0085885",
        relevanz: "Die therapeutische Arbeitsallianz — Zielkonsens, Aufgabenkonsens, Beziehungsband — ist ein stärkerer Wirkfaktor als die eingesetzte Technik. Im KAIA-Prompt direkt zitiert: Wenn die Beziehung bricht, hilft keine Fragetechnik mehr. Begründet das Rupture-Repair-Protokoll als eigenständige didaktische Intervention — nicht als Ausnahme, sondern als Kernkompetenz der Begleitung.",
      },
    ],
  },
  {
    titel: "Lerntransfer & Kognitive Taxonomie",
    funktion: "Begründet die Transfer-Phase jeder Session und die taxonomische Stufung der Abschlusslogik",
    farbe: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    quellen: [
      {
        authors: "Anderson, L. W., & Krathwohl, D. R. (Eds.)",
        year: "2001",
        title: "A taxonomy for learning, teaching, and assessing: A revision of Bloom's educational objectives",
        journal: "Longman",
        relevanz: "Die revidierte Bloom-Taxonomie (Erinnern → Verstehen → Anwenden → Analysieren → Bewerten → Erschaffen) ist das explizite Rückgrat von KAIAs Abschluss-Session. Session 10 setzt Bloom 5 (Bewerten) ein — Vergleich von Aussagen aus Session 1 und Session 9 — und Bloom 6 (Erschaffen): 'Wie wirst du ohne mich weiterlernen?' Ohne diese Quelle ist die taxonomische Verortung nicht verteidigbar.",
      },
      {
        authors: "Perkins, D. N., & Salomon, G.",
        year: "1992",
        title: "Transfer of learning",
        journal: "In: International Encyclopedia of Education (2nd ed., Vol. 11, pp. 6452–6457). Pergamon Press",
        relevanz: "Grundlegende Transfertheorie: Nah-Transfer (ähnliche Situation) vs. Fern-Transfer (neuer Kontext). KAIAs Phase-3-Frage 'Was würdest du jemandem erklären, der nicht dabei war?' zielt explizit auf Fern-Transfer — der Lernende muss die Einsicht in neue Sprache übersetzen, nicht nur wiederholen. Begründet warum jede Session mit einer Transferfrage schließt statt mit KAIAs Zusammenfassung.",
      },
      {
        authors: "Roediger, H. L., & Karpicke, J. D.",
        year: "2006",
        title: "Test-enhanced learning: Taking memory tests improves long-term retention",
        journal: "Psychological Science, 17(3), 249–255",
        doi: "10.1111/j.1467-9280.2006.01693.x",
        relevanz: "Testing Effect / Retrieval Practice: Aktives Abrufen aus dem Gedächtnis verankert Wissen stärker als nochmaliges Durcharbeiten. KAIAs Phase-3-Frage 'Was würdest du jemandem erklären...' ist gezielt als Retrieval-Practice-Moment konzipiert — nicht Zusammenfassung durch KAIA, sondern aktive Erinnerungsarbeit durch den Lernenden. Empirisch einer der robustesten Befunde der Lernforschung.",
      },
      {
        authors: "Gollwitzer, P. M.",
        year: "1999",
        title: "Implementation intentions: Strong effects of simple plans",
        journal: "American Psychologist, 54(7), 493–503",
        doi: "10.1037/0003-066X.54.7.493",
        relevanz: "Implementierungsintentionen ('Wenn X, dann Y') als nachgewiesene Brücke zwischen Absicht und Handlung — sie reduzieren die Lücke zwischen Vorsatz und Verhalten um Faktor 2–3. KAIAs Erste-Schritt-Frage ('Was wäre ein erster Schritt diese Woche — kleiner als du denkst?') ist als Implementierungsintention konzipiert: konkret, situativ, minimal. Erklärt warum die Schritt-Frage am Ende jeder Session nicht optional ist.",
      },
    ],
  },
  {
    titel: "Empathische KI",
    funktion: "Begründet empathisches Verhalten als simulierbare Designeigenschaft",
    farbe: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    quellen: [
      {
        authors: "Decety, J., & Jackson, P. L.",
        year: "2004",
        title: "The functional architecture of human empathy",
        journal: "Behavioral and Cognitive Neuroscience Reviews, 3(2), 71–100",
        doi: "10.1177/1534582304267187",
        relevanz: "Unterscheidet affektive, kognitive und verhaltensbasierte Empathie. Fundamental für KAIAs Selbstverständnis: affektive Empathie ist KI strukturell nicht zugänglich — was KAIA kann ist kognitive Empathie und empathisches Verhalten.",
      },
      {
        authors: "Liu, T., et al.",
        year: "2025",
        title: "The illusion of empathy: How AI chatbots shape conversation perception",
        journal: "Proceedings of AAAI, 39, 14327–14335",
        doi: "10.1609/aaai.v39i13.33569",
        relevanz: "Aktuellste Forschung: Nutzer nehmen KI konsistent als weniger empathisch wahr als Menschen — und dennoch zeigen KI-Chatbots messbare Wirkungen. Begründet warum KI-Disclosure in KAIA verpflichtend ist.",
      },
      {
        authors: "Lin, S., et al.",
        year: "2023",
        title: "Empathy-based communication framework for chatbots",
        journal: "Proceedings of HAI '23. ACM",
        doi: "10.1145/3623809.3623865",
        relevanz: "Konkrete Kommunikationsframeworks für empathische Chatbots. Direkte Vorlage für KAIAs Prompt-Design: wie wird Empathie in Sprache operationalisiert?",
      },
      {
        authors: "Ltifi, M.",
        year: "2023",
        title: "Trust in the chatbot: A semi-human relationship",
        journal: "Electronic Commerce Research, 23, 1–32",
        doi: "10.1007/s10660-021-09504-2",
        relevanz: "Vertrauen als Schlüsselvariable in Mensch-KI-Interaktion. Relevant für KAIAs Onboarding-Design und Transparenz-Anforderungen.",
      },
      {
        authors: "Uzan, G., Freud, T., & Elalouf, A.",
        year: "2025",
        title: "Optimizing chatbots to improve customer experience and satisfaction",
        journal: "Applied Sciences, 15(3), 1112",
        doi: "10.3390/app15031112",
        relevanz: "Personalisierung und Empathie als Optimierungsparameter. Liefert empirische Erkenntnisse zu Feedback-Integration in KI-Systemen.",
      },
    ],
  },
  {
    titel: "Flow & Selbstwirksamkeit",
    funktion: "Kalibrierungslogik und Evaluationskriterium",
    farbe: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    quellen: [
      {
        authors: "Bandura, A.",
        year: "1994",
        title: "Self-efficacy",
        journal: "In: Encyclopedia of human behavior, Vol. 4, 71–81. Academic Press",
        relevanz: "Banduras Selbstwirksamkeitstheorie ist das theoretische Fundament des gesamten Projekts. Selbstwirksamkeit als erlernbare, durch Erfahrung veränderbare Überzeugung — KAIAs Kernhypothese.",
      },
      {
        authors: "Bandura, A.",
        year: "2006",
        title: "Guide for constructing self-efficacy scales",
        journal: "In: Self-efficacy beliefs of adolescents, 307–337. Information Age Publishing",
        relevanz: "Anleitung zur Konstruktion domänenspezifischer Selbstwirksamkeitsskalen. Zeigt warum die generische GSE-Skala (Schwarzer) für Lern-Selbstwirksamkeit nicht ausreicht und wie lernspezifische Items entwickelt werden.",
        zusatz: "Empfehlung Psychologe: Zuerst lesen — entscheidend für die Validität der Messung.",
      },
      {
        authors: "Schwarzer, R., & Jerusalem, M.",
        year: "1995",
        title: "Generalized Self-Efficacy Scale",
        journal: "In: Measures in health psychology, 35–37. NFER-Nelson",
        relevanz: "Die GSE-Skala — 10 Items, validiert in über 25 Sprachen. Wird in KAIA als Pre-Post-Messung eingesetzt. Begrenzte Domänenspezifität, daher ergänzend durch situative Selbstwirksamkeitsfragen.",
      },
      {
        authors: "Oliveira, W., & Hamari, J.",
        year: "2024",
        title: "Global trends in flow theory research within gameful environments",
        journal: "Proceedings of HICSS-57",
        url: "https://aisel.aisnet.org/hicss-57/da/gamification/2",
        relevanz: "Flow-Theorie in digitalen Lernumgebungen. Liefert Indikatoren für Flow-Erleben die KAIA im Gespräch erkennen und kalibrieren soll — Challenge-Skill-Balance als Designziel.",
      },
    ],
  },
  {
    titel: "Design Science Research",
    funktion: "Methodologischer Rahmen der Thesis",
    farbe: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    quellen: [
      {
        authors: "Hevner, A. R., March, S. T., Park, J., & Ram, S.",
        year: "2004",
        title: "Design science in information systems research",
        journal: "MIS Quarterly, 28(1), 75–105",
        doi: "10.2307/25148625",
        relevanz: "Der kanonische DSR-Rahmen. KAIA ist ein IT-Artefakt das ein empirisch belegtes Problem adressiert, iterativ entwickelt und durch eine Pilotstudie evaluiert wird. Ohne diese Quelle ist die Methodik nicht verteidigbar.",
      },
      {
        authors: "Braun, V., & Clarke, V.",
        year: "2006",
        title: "Using thematic analysis in psychology",
        journal: "Qualitative Research in Psychology, 3(2), 77–101",
        doi: "10.1191/1478088706qp063oa",
        relevanz: "Methodische Grundlage für die Auswertung der qualitativen Interviewdaten (Abschlussinterviews der Studienteilnehmer). Thematische Analyse nach Braun & Clarke als etabliertes Verfahren.",
      },
      {
        authors: "Flick, U.",
        year: "2018",
        title: "An introduction to qualitative research (6th ed.)",
        journal: "SAGE Publications",
        relevanz: "Grundlagenwerk für qualitative Forschungsmethoden. Rahmen für das episodische Leitfadeninterview als Datenerhebungsinstrument nach der Studie.",
      },
    ],
  },
  {
    titel: "EU AI Act & DSGVO",
    funktion: "Compliance-Design als strukturelles Prinzip",
    farbe: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    quellen: [
      {
        authors: "Europäisches Parlament und Rat",
        year: "2024",
        title: "Verordnung (EU) 2024/1689 — AI Act",
        url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32024R1689",
        relevanz: "KAIAs Risikoklassifizierung nach EU AI Act muss in der Thesis begründet werden. Bildungssysteme fallen potenziell unter Hochrisiko-Kategorie — jede Designentscheidung muss mit Art. 9–15 kompatibel sein.",
      },
      {
        authors: "Europäisches Parlament und Rat",
        year: "2016",
        title: "Verordnung (EU) 2016/679 — DSGVO",
        url: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679",
        relevanz: "Alle Daten auf EU-Servern (Hetzner Helsinki), Privacy by Design (Art. 25), Betroffenenrechte Art. 15–21 vollständig implementiert. DSGVO ist kein Anhängsel — sie strukturiert die gesamte Datenhaltung.",
      },
      {
        authors: "Holmes, W., et al.",
        year: "2022",
        title: "Ethics of AI in Education",
        journal: "Journal of Interactive Media in Education, 2022(1)",
        relevanz: "Peer-reviewed, direkt auf EU-AI-Act-Diskussion im Bildungskontext zugeschnitten. Liefert ethische Leitlinien für KI in Lernumgebungen die über reine Compliance hinausgehen.",
        zusatz: "Empfehlung Psychologe: Aktuellste Quelle zum Thema KI-Ethik in Bildung.",
      },
    ],
  },
];

function DiskursCard({ diskurs }: { diskurs: Diskurs }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 mt-0.5 ${diskurs.farbe}`}>
          {diskurs.titel}
        </span>
        <p className="text-sm text-muted-foreground leading-snug">{diskurs.funktion}</p>
      </div>

      <div className="space-y-3">
        {diskurs.quellen.map((q) => (
          <div key={`${q.authors}-${q.year}`} className="rounded-lg border border-border p-4 space-y-2 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">
                  {q.authors} ({q.year}). <em>{q.title}</em>
                </p>
                {q.journal && (
                  <p className="text-xs text-muted-foreground mt-0.5">{q.journal}</p>
                )}
              </div>
              {(q.doi || q.url) && (
                <a
                  href={q.doi ? `https://doi.org/${q.doi}` : q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Quelle öffnen"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
              {q.relevanz}
            </p>
            {q.zusatz && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                ★ {q.zusatz}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function WissenschaftPage() {
  const totalQuellen = DISKURSE.reduce((sum, d) => sum + d.quellen.length, 0)

  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Wissenschaftliche Grundlagen</h1>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            KAIA basiert auf zehn theoretischen Diskursen aus Lernpsychologie, Entwicklungspsychologie,
            Lerntransferforschung, Empathieforschung, Selbstwirksamkeitstheorie und Design Science Research. Hier sind alle{" "}
            <strong className="text-foreground">{totalQuellen} Quellen</strong> mit ihrer
            spezifischen Relevanz für das Produkt dokumentiert.
          </p>
          <p className="text-xs text-muted-foreground">
            Quellen mit ★ sind zusätzliche Empfehlungen des Psychologen — über das Exposé hinaus.
          </p>
        </div>

        <div className="space-y-10">
          {DISKURSE.map((d) => (
            <DiskursCard key={d.titel} diskurs={d} />
          ))}
        </div>
      </main>
    </>
  )
}
