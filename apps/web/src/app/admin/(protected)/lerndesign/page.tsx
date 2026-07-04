"use client"

import { useState } from "react"
import {
  BookOpen, Zap, Brain, Target, ChevronDown, ChevronRight,
  CheckCircle2, Clock, Circle, AlertTriangle, Lightbulb,
  MessageSquare, Shield, BarChart3,
  ArrowRight, Network, Users
} from "lucide-react"

// ── Session data ───────────────────────────────────────────────────────────────

const SESSIONS = [
  {
    num: 1,
    cluster: "Terrain kartieren",
    bloom: "Stufen 1–2",
    bloomLabel: "Erinnern · Verstehen",
    color: "emerald",
    ziel: "Thema, Lernintention und erster Schritt mit Evidenzanker sichtbar machen.",
    einstieg: "Offene Einladung ohne Thema voraussetzen: «Was beschäftigt dich gerade — wobei du denkst: da müsste ich eigentlich besser werden?»",
    kernfragen: [
      "Was beschäftigt dich gerade — beruflich oder persönlich?",
      "Was hat dich dazu gebracht? Was nervt dich daran?",
      "Habe ich das richtig verstanden: du möchtest X, weil Y?",
      "Wenn du in vier Wochen zurückblickst — was wäre dann anders?",
      "Was wäre ein erster kleiner Schritt — kleiner als du denkst?",
      "Woran würdest du merken, dass dieser Schritt etwas bewegt hat?",
    ],
    abschluss: "Lernintention + erster Schritt gespeichert. Session darf ohne abgeschlossenes Ziel enden.",
    besonderheiten: "5-Schritte-Onboarding-Flow. Scaffolding bei «weiß nicht» (3 Orientierungsbereiche). Session-Summary-Extraktion nach Ende.",
  },
  {
    num: 2,
    cluster: "Terrain kartieren",
    bloom: "Stufen 1–2",
    bloomLabel: "Erinnern · Verstehen",
    color: "emerald",
    ziel: "Erster Schritt aus Session 1 nachhalten. Vorwissen und Lücken kartieren.",
    einstieg: "Callback auf Session 1: «Du wolltest X ausprobieren. Wie war das?» — bei fehlendem first_step: insight_for_next_session aus Extraktion.",
    kernfragen: [
      "Was hat das verhindert? / War der Schritt zu groß?",
      "Was weißt du eigentlich schon darüber, wenn du innehältst?",
      "Was genau meinst du mit [Begriff]?",
    ],
    abschluss: "Spaced Retrieval aktiviert. Nächster Schritt entsteht.",
    besonderheiten: "Erster Cross-Session-Callback. Anamnese-Fragen dominieren (Typ 6). Routing-Konfidenz noch low confidence.",
  },
  {
    num: 3,
    cluster: "Transfer in den Alltag",
    bloom: "Stufen 2–4",
    bloomLabel: "Verstehen · Anwenden · Analysieren",
    color: "sky",
    ziel: "Erkenntnis in konkrete Handlungsschritte überführen.",
    einstieg: "Schritt-Loop: Rückbezug auf letzten Schritt + Implementation Intention prüfen.",
    kernfragen: [
      "In welcher konkreten Situation diese Woche könntest du das ausprobieren?",
      "Was würde sich in deiner nächsten Besprechung konkret anders anfühlen?",
      "Wann genau, in welcher Situation?",
    ],
    abschluss: "Implementation Intention formuliert (Wenn-Dann). Evidenzanker gesetzt.",
    besonderheiten: "Systemische Fragen (Typ 4) + Erste-Schritt-Fragen (Typ 5) dominieren. Wissensart-Routing ab jetzt aktiv.",
  },
  {
    num: 4,
    cluster: "Transfer in den Alltag",
    bloom: "Stufen 2–4",
    bloomLabel: "Verstehen · Anwenden · Analysieren",
    color: "sky",
    ziel: "Transfer vertiefen. Muster aus den Versuchen analysieren.",
    einstieg: "Evidenzanker-Abgleich: «Du hattest gesagt, du würdest X merken — war das so?»",
    kernfragen: [
      "Was hat gestimmt — was hat nicht gestimmt?",
      "Was weißt du jetzt, das du davor nicht wusstest?",
      "Was würde sich ändern, wenn du eine Woche so tätest als ob?",
    ],
    abschluss: "Muster aus Versuchen im Profil gespeichert.",
    besonderheiten: "Hypothetische Fragen (Typ 2) nehmen zu. Cross-Session-Widersprüche werden vorbereitet.",
  },
  {
    num: 5,
    cluster: "Transfer in den Alltag",
    bloom: "Stufen 2–4",
    bloomLabel: "Verstehen · Anwenden · Analysieren",
    color: "sky",
    ziel: "Halbzeit-Spiegel. Fortschritt explizit sichtbar machen.",
    einstieg: "Obligatorischer Halbzeit-Spiegel: «Was weißt du jetzt, das du vor fünf Sessions noch nicht wusstest?»",
    kernfragen: [
      "Was weißt du jetzt, das du vor fünf Sessions noch nicht wusstest?",
      "Was hat sich verändert — in deinem Denken, nicht nur in deinem Tun?",
    ],
    abschluss: "FKS-Messung (Flow-Kurzskala). Bloom-Eskalation vorbereitet.",
    besonderheiten: "Obligatorische FKS-Erhebung nach Session 5. Übergang in Analysephase.",
  },
  {
    num: 6,
    cluster: "Widerspruchsarbeit",
    bloom: "Stufen 4–5",
    bloomLabel: "Analysieren · Bewerten",
    color: "violet",
    ziel: "Cross-sessionaler Widerspruch. Kognitive Dissonanz ohne Bedrohungsappraisal.",
    einstieg: "Widerspruchsfrage aus Profil: «In Session 3 hast du gesagt X. Jetzt sagst du Y. Was hat sich verändert?»",
    kernfragen: [
      "Du hast vorhin X gesagt — passt das zu dem, was du gerade sagst?",
      "Was hat sich zwischen Session 3 und jetzt verändert?",
      "Was würde jemand einwenden, der anderer Meinung ist?",
    ],
    abschluss: "Widerspruch explizit, nicht aufgelöst — Lernende entwickelt eigene Antwort.",
    besonderheiten: "Widerspruchsfragen (Typ 3) dominieren. Greift aktiv auf Profil-Gedächtnis zurück.",
  },
  {
    num: 7,
    cluster: "Widerspruchsarbeit",
    bloom: "Stufen 4–5",
    bloomLabel: "Analysieren · Bewerten",
    color: "violet",
    ziel: "Bewertungskriterien entwickeln. Annahmen sichtbar machen.",
    einstieg: "Beobachtung aus letztem Gespräch oder Widerspruchsfrage.",
    kernfragen: [
      "Was wären deine eigenen Kriterien dafür, dass das gelungen ist?",
      "Was würde sich in deinem System verändern, wenn du das verstanden hättest?",
      "Welche Annahme steckt hinter dem was du sagst?",
    ],
    abschluss: "Eigene Bewertungsmaßstäbe formuliert.",
    besonderheiten: "Challenge erst NACH Konsolidierung (Kolb-Sequenz: Konsolidierung → Challenge).",
  },
  {
    num: 8,
    cluster: "Widerspruchsarbeit",
    bloom: "Stufen 4–5",
    bloomLabel: "Analysieren · Bewerten",
    color: "violet",
    ziel: "Tiefe Analyse. Systemisches Denken.",
    einstieg: "Callback auf Bewertungskriterien aus Session 7.",
    kernfragen: [
      "Was würde ein skeptischer Kollege dazu sagen?",
      "Wo hält deine Argumentation einer Prüfung stand — wo nicht?",
    ],
    abschluss: "FKS-Messung. Vorbereitung Synthesephase.",
    besonderheiten: "FKS-Erhebung nach Session 8. Kritisch-herausfordernd Modus verstärkt.",
  },
  {
    num: 9,
    cluster: "Synthese & Autonomisierung",
    bloom: "Stufen 5–6",
    bloomLabel: "Bewerten · Erschaffen",
    color: "rose",
    ziel: "Transfer-Autonomie. Eigene Lernstrategie entwickeln.",
    einstieg: "Gegenüberstellung früher Formulierungen mit aktuellen: «Du hast am Anfang gesagt X — wie siehst du das heute?»",
    kernfragen: [
      "Was würdest du jemandem erklären, der genau da steht wo du am Anfang standest?",
      "Was würdest du anders machen, wenn du nochmal von vorne anfangen würdest?",
      "Wie wirst du nach dem Ende der Sessions weiterlernen?",
    ],
    abschluss: "Eigene Lernstrategie formuliert.",
    besonderheiten: "Bloom-Stufe 6: Erschaffen. Lernfaden-Gegenüberstellung Session 1 vs. Session 9.",
  },
  {
    num: 10,
    cluster: "Synthese & Autonomisierung",
    bloom: "Stufen 5–6",
    bloomLabel: "Bewerten · Erschaffen",
    color: "rose",
    ziel: "Abschluss. Mastery Experience durch Reflexion. Transfer-Autonomie sichern.",
    einstieg: "Obligatorische Frage: «Wie wirst du ohne mich weiterlernen?»",
    kernfragen: [
      "Wie wirst du ohne mich weiterlernen?",
      "Was weißt du jetzt, das du vor zehn Sessions noch nicht wusstest?",
      "Was bleibt offen — bewusst?",
    ],
    abschluss: "FKS-Messung. GSE Post-Messung. LIST-K Post-Messung (SRL). Lernfaden-Export angeboten. Session-Ende mit Abschlusskarte.",
    besonderheiten: "Stärkste Selbstwirksamkeits-Intervention: Lernfaden Session 1 vs. Session 9 in eigenen Worten.",
  },
]

const SENTIMENT_SIGNALS = [
  {
    category: "Primärbewertung — Bedrohung/Herausforderung",
    color: "orange",
    signals: [
      { name: "Katastrophisierende Sprache", beispiele: '"Das schaffe ich nie", "Das ist zu viel", "Total schwierig"', effekt: "→ Scaffolding-Modus", icon: "⚠️" },
      { name: "Zeitdruck-Signale", beispiele: '"keine Zeit", "noch nicht fertig", "bis Freitag"', effekt: "→ Scaffolding-Modus", icon: "⏱️" },
      { name: "Kontrollverlust-Marker", beispiele: '"es wird erwartet", "man muss", "das zwingt mich"', effekt: "→ Scaffolding-Modus", icon: "🔒" },
      { name: "Hilflosigkeits-Framing", beispiele: '"Was soll ich denn machen?!" (mit !)', effekt: "→ Scaffolding-Modus", icon: "😰" },
    ],
  },
  {
    category: "Sekundärbewertung — Coping-Ressourcen",
    color: "emerald",
    signals: [
      { name: "Handlungsorientierung", beispiele: '"Ich probiere...", "Ich kann versuchen..."', effekt: "→ Sokratisch/Herausfordernd", icon: "💪" },
      { name: "Ressourcen-Benennung", beispiele: '"Ich hab das ähnlich schon...", "Ich könnte fragen..."', effekt: "→ Sokratisch/Herausfordernd", icon: "🛠️" },
      { name: "Ambivalenz-Signale", beispiele: '"Einerseits... andererseits..."', effekt: "→ Laufender Bewertungsprozess", icon: "⚖️" },
      { name: "Metakognitive Distanz", beispiele: '"Ich merke, dass ich...", "Ich glaube, mein Problem ist..."', effekt: "→ Sokratisch (hohes Potenzial)", icon: "🔍" },
    ],
  },
]

const FORBIDDEN_PATTERNS = [
  {
    cat: "Entlastungs-Muster",
    color: "red",
    desc: "Nehmen Erwartungsdruck weg statt Handlungsfähigkeit aufzubauen",
    examples: ["Muss nichts Großes sein.", "Das ist okay so.", "Kein Druck.", "Nimm dir die Zeit.", "Das ist vollkommen normal.", "Das ist auch in Ordnung."],
  },
  {
    cat: "Innenraum-Muster",
    color: "amber",
    desc: "Führen in subjektive Innenwahrnehmung statt nach außen",
    examples: ["...aber spürbar.", "Das Thema ist schon da, noch nicht formuliert.", "Was taucht dann auf?", "Was fühlt sich richtig an?", "Was trägt dich?", "Was willst du wirklich?", "Was hat zuletzt am meisten Energie gekostet?", "Was belastet dich?", "Was erschöpft dich?"],
  },
  {
    cat: "Affekt-Spiegeln",
    color: "orange",
    desc: "Spiegeln den emotionalen Zustand und vertiefen ihn",
    examples: ["Das klingt als ob...", "Das höre ich.", "Danke, dass du trotzdem hier bist.", "Ich verstehe, dass..."],
  },
  {
    cat: "Erfahrungs-Fabrication",
    color: "purple",
    desc: "Behaupten menschliche Erfahrungsgeschichte die KAIA nicht hat",
    examples: ["Das kenne ich aus vielen Gesprächen.", "Das höre ich oft.", "Viele sagen das."],
  },
  {
    cat: "Therapeutisches Terrain",
    color: "red",
    desc: "Überschreiten die Grenze zur Therapie — sofortige Zweistufen-Reaktion",
    examples: ["Therapie", "Trauma", "Kindheit/Vergangenheit als Erklärungsrahmen", "Innere Stimmen", "Schutzmechanismen"],
  },
]

const FEATURES = [
  { name: "Sokratischer Modus", status: "done", detail: "Sechs Fragetypen, max. 80 Wörter, ein Impuls pro Antwort" },
  { name: "Cross-Session-Gedächtnis (kumulativ)", status: "done", detail: "load_all_session_contexts(): alle Vorsessions kompakt aggregiert. Inline-Re-Extraktion (12s-Timeout) entfernt — kein Latenz-Risiko mehr beim Session-Start." },
  { name: "Session-1 Onboarding-Flow", status: "done", detail: "5 Schritte: Einladung → Thema → Bestätigung → Lernintention → Evidenzanker" },
  { name: "EMA Feedback-Buttons", status: "done", detail: "wow · transfer_marker (passiv) · stuck · unclear (aktiv → Meta-Frage)" },
  { name: "Closure-Phase (STORY-001)", status: "done", detail: "Session-Abschluss mit stärksten eigenen Formulierungen + offener Frage" },
  { name: "Sentiment-Erkennung (Lazarus)", status: "done", detail: "8 Textindikatoren im Thinking-Block klassifiziert" },
  { name: "Thinking-Block Debug", status: "done", detail: "Admin Chat-Test zeigt interne Klassifizierung" },
  { name: "session_number im Prompt-Kontext", status: "done", detail: "session_number, session_phase (early/mid/late), is_final_session, user_turns — alle im PromptContext und im Jinja2-Template verfügbar." },
  { name: "Persistentes Nutzerprofil (Layer 1)", status: "done", detail: "UserLearningProfile-Tabelle: gse_baseline, gse_items, subscale_scores (MSLQ), LLM-generierte profile_interpretation. Einmalig nach Pre-Survey erstellt, nie überschrieben." },
  { name: "Session X von 10 UI", status: "done", detail: "Header zeigt 'Session N von 10' (text-xs muted). Sessions 9+10: stiller Kontext-Satz vor KAIAs erster Nachricht." },
  { name: "strongest_quote Extraktion", status: "done", detail: "Neues Pflichtfeld im Session-Extractor: stärkster eigener Satz des Lernenden pro Session — Basis für Session-10-Gegenüberstellung." },
  { name: "Session-5 Meilenstein-Trigger", status: "done", detail: "Obligatorischer Halbzeit-Spiegel in Prompt v3: 'Was weißt du jetzt, das du vor fünf Sessions noch nicht wusstest?' — kein optionales Element." },
  { name: "Session-10 Abschluss-Logik", status: "done", detail: "Drei simultane Aufgaben: (1) Gegenüberstellung Session-1 vs. jetzt via historical_quotes, (2) Autonomisierungsfrage, (3) kein GSE-Priming." },
  { name: "Historische Zitate (historical_quotes)", status: "done", detail: "strongest_quote aller Vorsessions im PromptContext ab Session 6 — für Widerspruchsarbeit (Typ 3) und Session-10-Gegenüberstellung." },
  { name: "Profil-Trigger nach Pre-Survey", status: "done", detail: "maybe_create_learning_profile() als BackgroundTask nach /survey/mslq und /survey/gse — idempotent, UNIQUE-Constraint als Race-Condition-Guard." },
  { name: "KAIA_PROMPT_V3_WARM (aktiv)", status: "done", detail: "Warm-Charakter v3 — alle neuen Kontext-Variablen, Session-5-Trigger, Session-10-Logik, Profil-Integration, historische Zitate. V2 als Eval-Regression-Baseline erhalten." },
  { name: "Scaffolding-Modus", status: "partial", detail: "Im Prompt spezifiziert, aber kein expliziter Modus-Schalter im Service-Layer" },
  { name: "Wertschätzend-bestärkender Modus", status: "partial", detail: "Im Prompt spezifiziert — Modus-Auflösung im Service-Layer noch nicht deterministisch" },
  { name: "Kritisch-herausfordernder Modus", status: "partial", detail: "Character 'challenging' implementiert — aber kein automatisches Switching basierend auf MSLQ-Profil" },
  { name: "MSLQ-Profil-Routing (4 Kombinationen)", status: "partial", detail: "Profil-Interpretation durch LLM generiert. Regelbasierte Übersetzung MSLQ-Subskalen → konkrete Prompt-Hinweise (Enthusiast/Kompetente/Gewissenhafte/Lernstarke) noch nicht implementiert." },
  { name: "Lernroadmap", status: "planned", detail: "Datenbankfelder existieren — kein UI, keine Prompt-Integration" },
  { name: "Domänenwissen-Modus", status: "planned", detail: "Ressourcen-Agent: explizit nicht sokratisch, gibt konkrete Lernwege. Trigger: nutzergesteuert" },
  { name: "Funken-Feature (STORY-003)", status: "planned", detail: "Kurze Reflexions-Impulse zwischen Sessions (Push-Mechanismus)" },
  { name: "FKS-Messung (nach Sessions 5/8/10)", status: "planned", detail: "Flow-Kurzskala in-App nach definierten Sessions" },
  { name: "GSE Pre/Post-Messung", status: "planned", detail: "Selbstwirksamkeitserleben (Schwarzer & Jerusalem, 1995, 10 Items) — Pre: im Onboarding vor Session 1, Post: nach Session 10 (min. 28 Tage). Pflicht für Studienstart." },
  { name: "SRL-Messung Pre/Post (LIST-K)", status: "planned", detail: "Selbstreguliertes Lernen via LIST-K (Wild & Schiefele, 1994), ~20–28 Items — Pre: Onboarding, Post: nach Session 10." },
  { name: "Profil-Briefing-Panel", status: "planned", detail: "Einmaliges Briefing vor Session 1: 'Aus deinen Antworten im Fragebogen hat KAIA ein Bild...' — kein Modal, keine Checkbox (Consent bereits erteilt)." },
  { name: "Lernfaden (Chronik)", status: "planned", detail: "Eigene Formulierungen akkumulieren — exportierbar (DSGVO Art. 20)" },
  { name: "user_mode_override", status: "planned", detail: "Nutzer kann aktiven Modus überschreiben ('Kannst du mich mehr unterstützen?')" },
  { name: "Token-Limit-Warnung", status: "planned", detail: "Automatischer CLOSING_TRIGGER wenn ~70% Token-Budget verbraucht" },
]

const MSLQ_PROFILES = [
  {
    name: "Enthusiast",
    color: "emerald",
    gse: "hoch",
    motivation: "hoch",
    selfReg: "hoch",
    trigger: "GSE ≥ 3.0 UND Motivations-Subskalen ≥ 4.0 UND SRL-Subskalen ≥ 4.0",
    desc: "Hohe Selbstwirksamkeit, hohe Motivation, hohe Selbstregulation. Kein Scaffolding nötig.",
    promptHints: [
      "Widersprüche früh zulassen — diese Person verträgt kognitive Dissonanz",
      "Hypothetische Fragen (Typ 2) und Widerspruchsfragen (Typ 3) bevorzugen",
      "Keine übertriebene Bestätigung — wirkt patronisierend",
      "Bloom-Eskalation auf Stufe 5–6 ab Session 3 möglich",
    ],
    example: "Lernende, die strukturiert vorgehen, Rückschläge gut verarbeiten und von sich aus Lernstrategien wählen.",
  },
  {
    name: "Kompetente-ohne-Antrieb",
    color: "sky",
    gse: "hoch",
    motivation: "niedrig",
    selfReg: "mittel",
    trigger: "GSE ≥ 3.0 UND Motivations-Subskalen < 3.5",
    desc: "Hohe Selbstwirksamkeit, aber niedrige intrinsische Motivation. Häufig: Prokrastination trotz Können.",
    promptHints: [
      "Lernintention und Relevanzfragen stark betonen (Typ 5)",
      "Verbindung zwischen Thema und persönlichem Wert herstellen",
      "Nicht zu schnell in Analyse-Ebene eskalieren — erst Motivation aktivieren",
      "Systemische Fragen (Typ 4): 'Was würde sich für dich ändern, wenn du das wirklich verstehen würdest?'",
    ],
    example: "Erfahrene Fachleute, die wissen wie, aber 'warum nochmal' verloren haben.",
  },
  {
    name: "Gewissenhafte",
    color: "violet",
    gse: "niedrig",
    motivation: "mittel",
    selfReg: "hoch",
    trigger: "GSE < 3.0 UND SRL-Subskalen ≥ 4.0",
    desc: "Gute Selbstregulation, aber niedrige Selbstwirksamkeit. Häufig: Selbstzweifel trotz guter Lernstrategie.",
    promptHints: [
      "Scaffolding-Modus in Sessions 1–3",
      "Mastery-Experience-Fragen bevorzugen: 'Was hast du bereits geschafft, das ähnlich schwierig war?'",
      "Wertschätzend-bestärkender Modus nach Durchbrüchen",
      "Keine Widerspruchsfragen in frühen Sessions — GSE-Basis erst aufbauen",
    ],
    example: "Lernende mit hoher Sorgfalt und guter Planung, aber systematischer Selbstunterschätzung.",
  },
  {
    name: "Lernstarke-ohne-Struktur",
    color: "rose",
    gse: "niedrig",
    motivation: "hoch",
    selfReg: "niedrig",
    trigger: "GSE < 3.0 UND Motivations-Subskalen ≥ 4.0 UND SRL-Subskalen < 3.5",
    desc: "Hohe Motivation, aber niedrige Selbstregulation und niedrige GSE. Häufig: Enthusiasm ohne Strategie.",
    promptHints: [
      "Scaffolding-Modus dauerhaft in Sessions 1–5",
      "Erste-Schritt-Fragen (Typ 5) intensiv nutzen — kleine, verifizierbare Schritte",
      "Implementation Intentions (Wenn-Dann) explizit formulieren lassen",
      "Keine Bloom-Eskalation über Stufe 3 hinaus bis SRL-Signale positiv",
    ],
    example: "Motivierte Einsteiger, die viel wollen aber wenig strukturieren — klassisches Onboarding-Profil.",
  },
]

const EMA_BUTTONS = [
  { type: "wow", emoji: "🌟", label: "Wow", desc: "Das trifft was", color: "amber", active: false, detail: "Passiv — wird gespeichert. Kein LLM-Trigger. Misst Aha-Momente." },
  { type: "transfer_marker", emoji: "💡", label: "Weiterdenken", desc: "Muss ich weiterdenken", color: "sky", active: false, detail: "Passiv — wird gespeichert. Kein LLM-Trigger. Misst Transfer-Impulse." },
  { type: "stuck", emoji: "🚧", label: "Hänge fest", desc: "Ich hänge gerade", color: "orange", active: true, detail: "Aktiv — triggert KAIA-Meta-Frage via SSE. KAIA reagiert mit metakognitiver Frage." },
  { type: "unclear", emoji: "❓", label: "Unklar", desc: "Das verstehe ich noch nicht", color: "rose", active: true, detail: "Aktiv — triggert KAIA-Meta-Frage via SSE. KAIA reagiert mit Klärungsfrage." },
]

// ── Color helpers ──────────────────────────────────────────────────────────────

const BLOOM_COLORS: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  sky: "border-sky-500/30 bg-sky-500/5",
  violet: "border-violet-500/30 bg-violet-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
}
const BLOOM_BADGE: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  sky: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}
const STATUS_CONFIG = {
  done:    { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", label: "Implementiert" },
  partial: { icon: Clock,         color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",   label: "Teilweise" },
  planned: { icon: Circle,        color: "text-zinc-500",    bg: "bg-zinc-500/10 border-zinc-500/20",     label: "Geplant" },
}

// ── Components ─────────────────────────────────────────────────────────────────

function SessionCard({ s }: { s: typeof SESSIONS[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border ${BLOOM_COLORS[s.color]} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-300">
          {s.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">Session {s.num}</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${BLOOM_BADGE[s.color]}`}>{s.bloomLabel}</span>
            <span className="text-xs text-muted-foreground">{s.cluster}</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{s.ziel}</p>
        </div>
        {open
          ? <ChevronDown className="shrink-0 h-4 w-4 text-muted-foreground mt-0.5" />
          : <ChevronRight className="shrink-0 h-4 w-4 text-muted-foreground mt-0.5" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Einstieg</p>
              <p className="text-sm text-zinc-300">{s.einstieg}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Abschluss</p>
              <p className="text-sm text-zinc-300">{s.abschluss}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Schlüsselfragen</p>
            <ul className="space-y-1.5">
              {s.kernfragen.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <ArrowRight className="shrink-0 h-3.5 w-3.5 text-zinc-600 mt-0.5" />
                  <span>«{f}»</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Besonderheiten</p>
            <p className="text-sm text-zinc-400">{s.besonderheiten}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

type Tab = "sessions" | "sentiment" | "verboten" | "features" | "ema" | "profil"

export default function LerndesignPage() {
  const [tab, setTab] = useState<Tab>("sessions")

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "sessions",  label: "Sessions 1–10",       icon: BookOpen },
    { id: "profil",    label: "Nutzerprofil (MSLQ)", icon: Users },
    { id: "sentiment", label: "Sentiment-Erkennung", icon: Brain },
    { id: "verboten",  label: "Verbotene Muster",    icon: Shield },
    { id: "features",  label: "Feature-Status",      icon: BarChart3 },
    { id: "ema",       label: "EMA-Buttons",         icon: MessageSquare },
  ]

  const done    = FEATURES.filter(f => f.status === "done").length
  const partial = FEATURES.filter(f => f.status === "partial").length
  const planned = FEATURES.filter(f => f.status === "planned").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Network className="h-5 w-5 text-violet-400" />
            <h1 className="text-xl font-bold">KAIA Lerndesign & Session-Architektur</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Vollständige Referenz — Session-Struktur, Sentiment-Signale, verbotene Muster, Feature-Status.
            Basis für systematisches Testing.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /><span>{done} implementiert</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <Clock className="h-3.5 w-3.5" /><span>{partial} teilweise</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Circle className="h-3.5 w-3.5" /><span>{planned} geplant</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Sessions Tab */}
        {tab === "sessions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Sessions 1–2", sub: "Terrain kartieren", color: "emerald", bloom: "Bloom 1–2" },
                { label: "Sessions 3–5", sub: "Transfer in Alltag", color: "sky", bloom: "Bloom 2–4" },
                { label: "Sessions 6–8", sub: "Widerspruchsarbeit", color: "violet", bloom: "Bloom 4–5" },
                { label: "Sessions 9–10", sub: "Synthese", color: "rose", bloom: "Bloom 5–6" },
              ].map(c => (
                <div key={c.label} className={`rounded-lg border ${BLOOM_COLORS[c.color]} px-4 py-3`}>
                  <p className={`text-xs font-semibold mb-1 ${BLOOM_BADGE[c.color].split(" ")[1]}`}>{c.bloom}</p>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>
            {SESSIONS.map(s => <SessionCard key={s.num} s={s} />)}
          </div>
        )}

        {/* Sentiment Tab */}
        {tab === "sentiment" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              <strong>Hysterese-Logik:</strong> Modus wechselt erst nach N=3 konsistenten Signalen — kein Übersteuern durch einzelne Formulierungen.
              Derzeit: Klassifizierung im Thinking-Block, deterministischer Modus-Switch im Service-Layer noch geplant.
            </div>
            {SENTIMENT_SIGNALS.map(cat => (
              <div key={cat.category}>
                <h3 className={`text-sm font-semibold mb-3 ${cat.color === "orange" ? "text-orange-400" : "text-emerald-400"}`}>
                  {cat.category}
                </h3>
                <div className="space-y-2">
                  {cat.signals.map(s => (
                    <div key={s.name} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{s.icon}</span>
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {s.beispiele}
                          </p>
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-1 rounded border font-medium ${
                          cat.color === "orange"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {s.effekt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" />
                Vier Interaktionsmodi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { mode: "Sokratisch-explorativ", trigger: "Challenge-Appraisal + Coping vorhanden", desc: "Nur Fragen, kein Scaffolding" },
                  { mode: "Scaffolding / unterstützend", trigger: "Bedrohungs-Appraisal + geringe Coping-Ressourcen", desc: "Minimale Strukturhilfe + Frage" },
                  { mode: "Wertschätzend-bestärkend", trigger: "Erfolgserleben, Durchbruch-Signal", desc: "Konkrete Lernfortschritte spiegeln" },
                  { mode: "Kritisch-herausfordernd", trigger: "Geringe Bedrohung + stabile Ressourcen", desc: "Annahme hinterfragen, Dissonanz erzeugen" },
                ].map(m => (
                  <div key={m.mode} className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5">
                    <p className="text-sm font-medium">{m.mode}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    <p className="text-xs text-zinc-600 mt-1 font-mono">Trigger: {m.trigger}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verboten Tab */}
        {tab === "verboten" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vollständige Liste verbotener Muster — direkt aus dem aktiven Prompt. Bei Verletzung: neuer Eintrag hier + Commit.
            </p>
            {FORBIDDEN_PATTERNS.map(cat => {
              const colorMap: Record<string, string> = {
                red: "border-red-500/30 bg-red-500/5 text-red-400",
                amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
                orange: "border-orange-500/30 bg-orange-500/5 text-orange-400",
                purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
              }
              const borderColor = colorMap[cat.color] ?? "border-zinc-700 bg-zinc-800 text-zinc-400"
              return (
                <div key={cat.cat} className={`rounded-xl border p-5 ${borderColor.split(" ").slice(0,2).join(" ")}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${borderColor.split(" ")[2]}`} />
                    <div>
                      <p className={`text-sm font-semibold ${borderColor.split(" ")[2]}`}>{cat.cat}</p>
                      <p className="text-xs text-muted-foreground">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map(ex => (
                      <span key={ex} className="text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full">
                        «{ex}»
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-sky-400" />
                Erlaubtes Strukturprinzip bei negativem Affekt-Einstieg
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-mono text-xs mt-0.5">✓</span>
                  <span className="text-zinc-300">Ein Satz neutrale Anerkennung: <em className="text-zinc-400">«Das klingt anstrengend.»</em></span>
                </div>
                <div className="flex gap-3">
                  <span className="text-emerald-400 font-mono text-xs mt-0.5">✓</span>
                  <span className="text-zinc-300">Sofortiger Pivot: <em className="text-zinc-400">«Was beschäftigt dich gerade, wobei du dir wünschst, es anders zu können?»</em></span>
                </div>
                <div className="flex gap-3">
                  <span className="text-red-400 font-mono text-xs mt-0.5">✗</span>
                  <span className="text-zinc-300">Im Affekt-Frame bleiben: <em className="text-zinc-400">«Was erschöpft dich am meisten?»</em></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {tab === "features" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-2">
              {(["done", "partial", "planned"] as const).map(s => {
                const c = STATUS_CONFIG[s]
                const Icon = c.icon
                const count = FEATURES.filter(f => f.status === s).length
                return (
                  <div key={s} className={`rounded-lg border ${c.bg} px-4 py-3 flex items-center gap-3`}>
                    <Icon className={`h-5 w-5 ${c.color}`} />
                    <div>
                      <p className={`text-sm font-semibold ${c.color}`}>{count}</p>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {FEATURES.map(f => {
              const c = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG]
              const Icon = c.icon
              return (
                <div key={f.name} className="rounded-lg border border-border bg-muted/10 px-4 py-3 flex items-start gap-3">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${c.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{f.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${c.bg} ${c.color}`}>{c.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Nutzerprofil Tab */}
        {tab === "profil" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm text-sky-400">
              <strong>Zwei-Schichten-Profil-Modell:</strong>{" "}
              Layer 1 = unveränderlicher MSLQ/GSE-Baseline-Snapshot (<code>user_learning_profiles</code>).{" "}
              Layer 2 = kumulative Session-Daten (<code>session_summary</code> in <code>chat_sessions</code>).{" "}
              LLM-generierte <code>profile_interpretation</code> wird einmalig nach dem Pre-Survey erstellt — kein LLM-Call pro Session.
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">MSLQ-Subskalen (Pre-Survey)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Motivated Strategies for Learning Questionnaire (Pintrich et al., 1991/1993). 4 Subskalen, 30 Items, Likert 1–7.
                Routing-Logik basiert auf Subskalen-Mittelwerten.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Intrinsische Zielorientierung", sub: "Motivation", items: "4 Items", thres: "≥ 4.0 = hoch" },
                  { label: "Extrinsische Zielorientierung", sub: "Motivation", items: "4 Items", thres: "< 3.5 = niedrig" },
                  { label: "Task Value", sub: "Motivation", items: "6 Items", thres: "≥ 4.0 = relevant" },
                  { label: "Selbstreguliertes Lernen (SRL)", sub: "SRL", items: "9 Items", thres: "≥ 4.0 = hoch" },
                  { label: "Self-Efficacy (MSLQ)", sub: "Motivation", items: "8 Items", thres: "< 3.5 = niedrig GSE-Korrelat" },
                  { label: "GSE Baseline (Schwarzer & Jerusalem)", sub: "GSE", items: "10 Items", thres: "≥ 3.0 = hoch" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2.5">
                    <p className="text-xs font-medium">{s.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{s.items}</span>
                      <span className="text-zinc-600 text-xs">·</span>
                      <span className="text-xs text-zinc-500 font-mono">{s.thres}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">4 Profil-Kombinationen → Routing-Logik</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Regelbasierte Übersetzung (Phase 3 — noch geplant). Derzeit: LLM-generierte <code>profile_interpretation</code> im Prompt als Freitext.
              </p>
              <div className="space-y-4">
                {MSLQ_PROFILES.map(p => {
                  const colors: Record<string, { border: string; badge: string; text: string }> = {
                    emerald: { border: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400" },
                    sky:     { border: "border-sky-500/30 bg-sky-500/5",         badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",         text: "text-sky-400" },
                    violet:  { border: "border-violet-500/30 bg-violet-500/5",   badge: "bg-violet-500/15 text-violet-400 border-violet-500/30", text: "text-violet-400" },
                    rose:    { border: "border-rose-500/30 bg-rose-500/5",       badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",       text: "text-rose-400" },
                  }
                  const c = colors[p.color]
                  return (
                    <div key={p.name} className={`rounded-xl border p-5 ${c.border}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`shrink-0 px-2.5 py-1 rounded border text-xs font-semibold ${c.badge}`}>
                          {p.name}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: "GSE", val: p.gse },
                            { label: "Motivation", val: p.motivation },
                            { label: "SRL", val: p.selfReg },
                          ].map(tag => (
                            <span key={tag.label} className="text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                              {tag.label}: <span className={`font-medium ${
                                tag.val === "hoch" ? "text-emerald-400" :
                                tag.val === "niedrig" ? "text-rose-400" : "text-amber-400"
                              }`}>{tag.val}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 mb-2">{p.desc}</p>
                      <p className="text-xs text-zinc-500 font-mono mb-3">Trigger: {p.trigger}</p>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Prompt-Hinweise</p>
                        <ul className="space-y-1">
                          {p.promptHints.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                              <ArrowRight className="shrink-0 h-3 w-3 text-zinc-600 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
                        <p className="text-xs text-zinc-500"><span className="text-zinc-400 font-medium">Beispiel:</span> {p.example}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-semibold mb-2 text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Implementierungsstatus
              </h3>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-300">Layer 1 Datenbankschema</strong> — <code>user_learning_profiles</code> Tabelle existiert. Migration <code>l2g8h3i4b5c6</code> deployed.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-300">Profil-Trigger nach Pre-Survey</strong> — <code>maybe_create_learning_profile()</code> als BackgroundTask. Idempotent + Race-Condition-Guard.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-300">LLM-Interpretation im Prompt</strong> — <code>profile_interpretation</code> im PromptContext v3 (Freitext, max. 120 Wörter, Haiku generiert).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-300">Regelbasiertes Routing (Phase 3)</strong> — Die 4 Profil-Kombinationen hier sind das Zieldesign. Noch nicht als deterministischer Code-Pfad implementiert.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong className="text-zinc-300">Profil-Briefing-Panel (Phase 2)</strong> — Einmaliges Transparenz-Panel vor Session 1. Refactoring SSE-Auto-Start nötig.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMA Tab */}
        {tab === "ema" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              EMA = Ecological Momentary Assessment. Vier Feedback-Signale direkt im Chat-Interface — zwei passiv (gespeichert), zwei aktiv (triggern KAIA-Reaktion).
            </p>
            <div className="grid grid-cols-2 gap-4">
              {EMA_BUTTONS.map(b => {
                const colorMap: Record<string, string> = {
                  amber: "border-amber-500/30 bg-amber-500/5",
                  sky: "border-sky-500/30 bg-sky-500/5",
                  orange: "border-orange-500/30 bg-orange-500/5",
                  rose: "border-rose-500/30 bg-rose-500/5",
                }
                const textMap: Record<string, string> = {
                  amber: "text-amber-400",
                  sky: "text-sky-400",
                  orange: "text-orange-400",
                  rose: "text-rose-400",
                }
                return (
                  <div key={b.type} className={`rounded-xl border p-5 ${colorMap[b.color]}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{b.emoji}</span>
                      <div>
                        <p className={`text-sm font-semibold ${textMap[b.color]}`}>{b.label}</p>
                        <p className="text-xs text-muted-foreground">«{b.desc}»</p>
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${
                        b.active
                          ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                          : "bg-zinc-700/50 text-zinc-400 border-zinc-600"
                      }`}>
                        {b.active ? "Aktiv" : "Passiv"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{b.detail}</p>
                    <p className="text-xs font-mono text-zinc-600 mt-2">type: {b.type}</p>
                  </div>
                )
              })}
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                API-Flow für aktive Buttons (stuck / unclear)
              </h3>
              <div className="space-y-2 text-xs font-mono text-zinc-400">
                <p><span className="text-sky-400">1.</span> POST /api/v1/chat/sessions/{"{id}"}/feedback  →  body: {`{ feedback_type: "stuck" }`}</p>
                <p><span className="text-sky-400">2.</span> POST /api/v1/chat/sessions/{"{id}"}/meta-question?feedback_type=stuck&debug=true  →  SSE</p>
                <p><span className="text-sky-400">3.</span> KAIA streamt metakognitive Reaktionsfrage</p>
                <p><span className="text-zinc-600 mt-2 block">Passiv (wow / transfer_marker): nur Schritt 1, kein SSE.</span></p>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              <strong>Status im Admin Chat-Test:</strong> Buttons werden gerade hinzugefügt (dieser Sprint).
              Im User-Chat noch nicht sichtbar — geplant für Onboarding-Sprint.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
