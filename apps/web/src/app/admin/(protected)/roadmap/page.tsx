import {
  CheckCircle2,
  Clock,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  FlaskConical,
  Users,
  Shield,
  Database,
  MessageSquare,
  Brain,
  BarChart3,
  Mail,
  Lock,
  Eye,
  Zap,
  Sparkles,
  Calendar,
  Target,
  HelpCircle,
  FileText,
  Activity,
} from "lucide-react"

type Status = "done" | "active" | "planned" | "idea" | "blocker"
type Month = "done" | "juni" | "juli" | "august" | "ideas"

interface Feature {
  title: string
  desc: string
  status: Status
  month: Month
  chapter?: string
  tags?: string[]
  icon?: React.ElementType
}

const FEATURES: Feature[] = [
  // === FERTIG ===
  {
    title: "Monorepo-Skeleton",
    desc: "Next.js 14 + FastAPI Monorepo, GitHub Actions CI/CD, Docker Compose, Caddy + Let's Encrypt auf Hetzner CX23.",
    status: "done",
    month: "done",
    chapter: "Kap. 4",
    tags: ["Infra"],
    icon: Database,
  },
  {
    title: "Landing Page & öffentliche Seiten",
    desc: "/wissenschaft, /architektur, /release-notes mit gemeinsamer Navigation und Dark-Mode.",
    status: "done",
    month: "done",
    chapter: "Kap. 1",
    tags: ["Frontend"],
    icon: Eye,
  },
  {
    title: "Admin-Bereich Basis",
    desc: "Dashboard, Production Readiness, Kosten, Tagebuch, Release Notes — passwortgeschützt via HMAC-Cookie.",
    status: "done",
    month: "done",
    chapter: "Kap. 4",
    tags: ["Frontend", "Admin"],
    icon: Shield,
  },
  {
    title: "Sentry Monitoring",
    desc: "Vollständige Sentry-Integration für Frontend (instrumentation-client.ts) und Backend — DSN via Docker Build-Arg.",
    status: "done",
    month: "done",
    chapter: "Kap. 4",
    tags: ["Observability"],
    icon: Activity,
  },
  {
    title: "BugReport-Widget",
    desc: "Floating Bug-Button sendet Reports direkt in Slack-Kanal mit Screenshot-Option.",
    status: "done",
    month: "done",
    chapter: "Kap. 4",
    tags: ["Observability"],
    icon: MessageSquare,
  },
  {
    title: "Auth Backend",
    desc: "JWT Access (15min) + Refresh (30d) rotierend, bcrypt-12, User-Approval-Flow, kaia_session Cookie für Middleware.",
    status: "done",
    month: "done",
    chapter: "Kap. 4",
    tags: ["Security", "Backend"],
    icon: Lock,
  },
  {
    title: "Auth Frontend",
    desc: "Login, Registrierung mit Multi-Step-DSGVO-Consent, AuthContext, AuthGuard, Next.js Middleware-Schutz.",
    status: "done",
    month: "done",
    chapter: "Kap. 4 · Kap. 6",
    tags: ["Frontend", "DSGVO"],
    icon: Users,
  },

  // === JUNI ===
  {
    title: "Admin User-Approval UI",
    desc: "Übersicht aller pending-User, Einzel-Freigabe, Ablehnung mit Begründung — zentrale Studienkontrolle.",
    status: "active",
    month: "juni",
    chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Studie"],
    icon: Users,
  },
  {
    title: "DB-Schema (Alembic)",
    desc: "Erstes vollständiges DB-Schema: users, sessions, messages, gse_results, consent_logs — pgvector Extension.",
    status: "planned",
    month: "juni",
    chapter: "Kap. 4",
    tags: ["Backend", "DB"],
    icon: Database,
  },
  {
    title: "Datenschutzerklärung & Teilnahmevereinbarung",
    desc: "DSGVO-konformes Dokument: Datenkategorien, Zwecke, Speicherfrist 6 Monate nach Studienende, Löschrecht.",
    status: "planned",
    month: "juni",
    chapter: "Kap. 6",
    tags: ["DSGVO", "Ethik"],
    icon: FileText,
  },
  {
    title: "Crisis-Detection Pre-Filter",
    desc: "Statischer Keyword-Filter auf User-Input vor LLM-Verarbeitung — bei Treffer Eskalationshinweis (Telefonseelsorge 0800 111 0 111).",
    status: "blocker",
    month: "juni",
    chapter: "Kap. 6",
    tags: ["Ethik", "Blocker"],
    icon: AlertTriangle,
  },
  {
    title: "KI-Disclosure + Multi-Step-Onboarding",
    desc: "Expliziter Hinweis: KAIA ist eine KI (computational empathy, kein Mensch). Zweistufiger Consent-Flow vor erster Nutzung.",
    status: "planned",
    month: "juni",
    chapter: "Kap. 6",
    tags: ["Ethik", "DSGVO"],
    icon: Eye,
  },
  {
    title: "GSE Pre-Measurement",
    desc: "Allgemeine Selbstwirksamkeitserwartung (Schwarzer & Jerusalem, 1995) — 10 Items, 4-stufige Likert-Skala vor erster Session.",
    status: "planned",
    month: "juni",
    chapter: "Kap. 3 · Kap. 6",
    tags: ["Psychometrie", "Studie"],
    icon: FlaskConical,
  },

  // === JULI ===
  {
    title: "Chat Core mit SSE-Streaming",
    desc: "Echtzeit-Textstrom via Server-Sent Events, React Query für State, Message-History in PostgreSQL.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 4",
    tags: ["Backend", "Frontend"],
    icon: MessageSquare,
  },
  {
    title: "Prompt-Management in DB",
    desc: "Sokratische Prompt-Templates in PostgreSQL, Jinja2-Rendering, live editierbar ohne Deploy — Study-Lock bei STUDY_MODE=locked.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 3 · Kap. 4",
    tags: ["AI", "Backend"],
    icon: Brain,
  },
  {
    title: "LLM Single API (Claude · GPT-4o · Mistral)",
    desc: "Gemeinsames Abstraktions-Interface für alle drei LLMs — versionierte Model-IDs (nie generisch), DPAs vor Integration.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 4 · Kap. 5",
    tags: ["AI", "LLM-Eval"],
    icon: Zap,
  },
  {
    title: "LLM-Evaluation mit synthetischen Daten",
    desc: "Systematischer Vergleich Claude/GPT-4o/Mistral nach Empathiequalität, Sokratik, Konsistenz, Datenschutzkonformität — VOR Studienstart.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 5",
    tags: ["LLM-Eval", "Wissenschaft"],
    icon: FlaskConical,
  },
  {
    title: "Zwei Interaktionsmodi",
    desc: "Modus A: rein sokratisch (nur Fragen). Modus B: unterstützend/instruktional (fachliche Hilfe). Operationalisierung mit Psychologen.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 3",
    tags: ["AI", "Psychologie"],
    icon: Brain,
  },
  {
    title: "Character-System",
    desc: "10 klar unterschiedliche KAIA-Charaktere + Normal + Crazy (täglicher Wechsel). Aktiver Charakter immer sichtbar, User kann wechseln.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 3",
    tags: ["AI", "UX"],
    icon: Sparkles,
  },
  {
    title: "Zwei-Schicht-Gedächtnis",
    desc: "PostgreSQL (strukturiert) + pgvector (semantisch) — Row-Level-Security (user_id Pflichtparameter, kein Cross-User-Leak).",
    status: "planned",
    month: "juli",
    chapter: "Kap. 3 · Kap. 4",
    tags: ["AI", "Security", "DB"],
    icon: Database,
  },
  {
    title: "KAIA Cross-Session-Gedächtnis",
    desc: "KAIA referenziert frühere Sessions natürlich im Gespräch — wie eine Freundin, die sich erinnert. Semantische Suche via pgvector.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 3",
    tags: ["AI"],
    icon: Brain,
  },
  {
    title: "30-Tage-Zugangs-Timer",
    desc: "Jede Tester:in hat automatisch 30 Tage Zugang ab Freischaltung. Danach deaktiviert. Im Admin sichtbar + manuell verlängerbar.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 6",
    tags: ["Admin", "Studie"],
    icon: Calendar,
  },
  {
    title: "Token-Budget pro User",
    desc: "Standard $5/User. Im Admin-Frontend individuell anpassbar pro Tester:in — Übersicht mit verbrauchtem Budget in Echtzeit.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Cost"],
    icon: BarChart3,
  },
  {
    title: "SMTP + E-Mail-System",
    desc: "Passwort-Reset via E-Mail, Benachrichtigung bei User-Freigabe, optional Reminder. Hetzner SMTP oder Postmark.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 4",
    tags: ["Backend"],
    icon: Mail,
  },
  {
    title: "Study-Lock + LLM Model-Pinning",
    desc: "Bei STUDY_MODE=locked: CI blockiert Prompt- und Schema-Änderungen. Jedes Modell mit expliziter versionierter Model-ID.",
    status: "planned",
    month: "juli",
    chapter: "Kap. 4 · Kap. 5",
    tags: ["Studie", "AI"],
    icon: Lock,
  },

  // === AUGUST ===
  {
    title: "GSE Post-Measurement + Visualisierung",
    desc: "GSE nach Studienende (10 Items). Grafische Darstellung Prä/Post-Vergleich, PDF-Download, opt-in Sharing für User.",
    status: "planned",
    month: "august",
    chapter: "Kap. 6",
    tags: ["Psychometrie", "Studie"],
    icon: BarChart3,
  },
  {
    title: "Per-Session Structured Observation",
    desc: "Nach jeder Session automatisch gespeichert: neuroadaptiver Modus, Sentiment (positiv/neutral/negativ), Selbstwirksamkeitseinschätzung.",
    status: "planned",
    month: "august",
    chapter: "Kap. 3 · Kap. 6",
    tags: ["AI", "Analytics"],
    icon: Target,
  },
  {
    title: "LLM-Transcript-Analyse",
    desc: "Automatisierte Fremdwahrnehmung aus Gesprächstranskripten: Handlungskontrolle, Problemlösezuversicht, Bewältigungserwartung.",
    status: "planned",
    month: "august",
    chapter: "Kap. 3 · Kap. 6",
    tags: ["AI", "Psychologie"],
    icon: Brain,
  },
  {
    title: "Konvergenz/Divergenz-Visualisierung",
    desc: "Zeitreihe: Selbstwahrnehmung (GSE) vs. Fremdwahrnehmung (LLM-Analyse) — Basis für Thesis-Kapitel Ergebnisse & Diskussion.",
    status: "planned",
    month: "august",
    chapter: "Kap. 3 · Kap. 6",
    tags: ["Analytics", "Wissenschaft"],
    icon: BarChart3,
  },
  {
    title: "Feedback/Wünsche-Seite",
    desc: "Alle eingeloggten User sehen und schreiben Feedback. Admin labelt: Roadmap / In Entwicklung / Umgesetzt / Abgelehnt + Kommentar.",
    status: "planned",
    month: "august",
    chapter: "Kap. 6",
    tags: ["Frontend", "Studie"],
    icon: MessageSquare,
  },
  {
    title: "Admin Analytics Dashboard",
    desc: "Nutzungsstatistiken: Login-Zeit, Chat-Dauer, Topics, Token-Verbrauch — nur für User mit consent_analytics=true.",
    status: "planned",
    month: "august",
    chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Analytics", "DSGVO"],
    icon: BarChart3,
  },
  {
    title: "DSGVO Art. 15–21 vollständig",
    desc: "Auskunftsrecht, Löschrecht, Berichtigung, Portabilität, Widerspruch — vollständig implementiert als Self-Service im Profil.",
    status: "planned",
    month: "august",
    chapter: "Kap. 6",
    tags: ["DSGVO"],
    icon: FileText,
  },
  {
    title: "Easter Eggs",
    desc: "Versteckte Überraschungen auf 404, Loading, Edge Cases — Admin wird per Slack notifiziert wenn einer gefunden wird.",
    status: "planned",
    month: "august",
    tags: ["UX"],
    icon: Sparkles,
  },
  {
    title: "Pre-Registration OSF.io + Power-Analyse",
    desc: "Hypothesen vor Datensicht registrieren (OSF.io). G*Power-Stichprobenanalyse dokumentieren — Pflicht für wissenschaftliche Validität.",
    status: "planned",
    month: "august",
    chapter: "Kap. 6",
    tags: ["Wissenschaft", "Ethik"],
    icon: FlaskConical,
  },

  // === IDEEN ===
  {
    title: "Reminder-System",
    desc: "Automatische Erinnerungen für Tester:innen (Mail oder In-App). Zeitpunkt und Frequenz mit Psychologen abstimmen.",
    status: "idea",
    month: "ideas",
    chapter: "evtl. Kap. 6",
    tags: ["UX", "Psychologie"],
    icon: Mail,
  },
  {
    title: "Surprise Mode",
    desc: "KAIA verhält sich unerwartet anders — Konzept mit Psychologen validieren (ethische Fragen: Transparenz, Vertrauen).",
    status: "idea",
    month: "ideas",
    chapter: "evtl. Kap. 3",
    tags: ["AI", "Psychologie"],
    icon: HelpCircle,
  },
  {
    title: "DPAs Anthropic / OpenAI / Mistral",
    desc: "Data Processing Agreements mit allen drei LLM-Anbietern vor Studienstart abschließen. Schrems-II in Datenschutzerklärung.",
    status: "idea",
    month: "ideas",
    tags: ["DSGVO", "Rechtlich"],
    icon: FileText,
  },
]

const STATUS_CONFIG = {
  done: {
    label: "Fertig",
    cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  active: {
    label: "In Entwicklung",
    cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    bar: "bg-blue-500",
    icon: Clock,
  },
  planned: {
    label: "Geplant",
    cls: "bg-muted text-muted-foreground border-border",
    bar: "bg-muted-foreground/40",
    icon: Calendar,
  },
  idea: {
    label: "Team-Idee",
    cls: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
    bar: "bg-violet-500",
    icon: Lightbulb,
  },
  blocker: {
    label: "Blocker",
    cls: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    bar: "bg-red-500",
    icon: AlertTriangle,
  },
}

const TAG_COLORS: Record<string, string> = {
  DSGVO: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Ethik: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  Blocker: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  Security: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  Psychometrie: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Psychologie: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Wissenschaft: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
  "LLM-Eval": "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400",
  Studie: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400",
  AI: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  Analytics: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
}

const SCIENCE_OBLIGATIONS = [
  {
    label: "Crisis-Detection",
    detail: "Keyword-Filter vor LLM — Eskalationshinweis Telefonseelsorge",
    done: false,
    critical: true,
  },
  { label: "Ethikvotum SRH", detail: "Antrag läuft — 4–8 Wochen Bearbeitungszeit", done: false, critical: true },
  { label: "KI-Disclosure", detail: "Expliziter Hinweis: KAIA ist eine KI, kein Mensch", done: false, critical: true },
  { label: "Multi-Step-Consent", detail: "2 getrennte Checkboxen: Datenverarbeitung + Analytics", done: true, critical: false },
  { label: "DSGVO vollständig (Art. 15–21)", detail: "Auskunft, Löschung, Portabilität, Widerspruch", done: false, critical: false },
  {
    label: "Pre-Registration OSF.io",
    detail: "Hypothesen vor Datensicht registrieren",
    done: false,
    critical: false,
  },
  { label: "Power-Analyse G*Power", detail: "Stichprobengröße vor Studienstart dokumentieren", done: false, critical: false },
  { label: "LLM Model-Pinning", detail: "Immer versionierte IDs — nie generisch", done: false, critical: false },
  { label: "Study-Lock", detail: "Prompt-Freeze während Datenerhebung (STUDY_MODE=locked)", done: false, critical: false },
  { label: "pgvector Row-Level-Security", detail: "user_id als Pflichtparameter, kein Cross-User-Leak", done: false, critical: false },
  { label: "DPAs", detail: "Data Processing Agreements mit Anthropic, OpenAI, Mistral", done: false, critical: false },
  { label: "Schrems-II in Datenschutzerklärung", detail: "EU-Serverstandort Hetzner Helsinki dokumentiert", done: false, critical: false },
  { label: "LLM-Evaluationsbericht", detail: "Claude vs. GPT-4o vs. Mistral nach definierten Kriterien", done: false, critical: false },
]

const THESIS_CHAPTERS = [
  { num: "Kap. 1", title: "Einleitung & Motivation", color: "text-slate-500" },
  { num: "Kap. 2", title: "Theoretischer Hintergrund", color: "text-violet-500" },
  { num: "Kap. 3", title: "Konzeptionelles Rahmenwerk", color: "text-sky-500" },
  { num: "Kap. 4", title: "Technische Implementierung", color: "text-emerald-500" },
  { num: "Kap. 5", title: "LLM-Evaluationsbericht", color: "text-cyan-500" },
  { num: "Kap. 6", title: "Pilotstudie & Evaluation", color: "text-orange-500" },
]

function FeatureCard({ f }: { f: Feature }) {
  const s = STATUS_CONFIG[f.status]
  const Icon = f.icon ?? Zap

  return (
    <div className="rounded-lg border border-border bg-background hover:bg-muted/20 transition-colors p-4 space-y-3 group">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="text-sm font-medium leading-tight">{f.title}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${s.cls}`}
            >
              <s.icon className="h-3 w-3" />
              {s.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/60">
        {f.chapter && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-mono">{f.chapter}</span>
          </div>
        )}
        {f.tags?.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function MonthColumn({
  title,
  subtitle,
  month,
  accentClass,
  dotClass,
}: {
  title: string
  subtitle: string
  month: Month
  accentClass: string
  dotClass: string
}) {
  const features = FEATURES.filter((f) => f.month === month)
  const done = features.filter((f) => f.status === "done").length
  const total = features.length

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border-l-4 ${accentClass} bg-muted/30 px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            <span className="text-xs font-mono text-muted-foreground">
              {done}/{total}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {features.map((f) => (
          <FeatureCard key={f.title} f={f} />
        ))}
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  const done = FEATURES.filter((f) => f.status === "done").length
  const active = FEATURES.filter((f) => f.status === "active").length
  const planned = FEATURES.filter((f) => f.status === "planned").length
  const ideas = FEATURES.filter((f) => f.status === "idea").length
  const blockers = FEATURES.filter((f) => f.status === "blocker").length
  const scienceDone = SCIENCE_OBLIGATIONS.filter((o) => o.done).length
  const critical = SCIENCE_OBLIGATIONS.filter((o) => o.critical && !o.done).length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Produktroadmap</h1>
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Juni · Juli · August 2026
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          KAIA Pilotstudie — Masterthesis M.Sc. Data Science & Analytics, SRH Riedlingen
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Fertig", value: done, cls: "text-emerald-500" },
          { label: "In Entwicklung", value: active, cls: "text-blue-500" },
          { label: "Geplant", value: planned, cls: "text-muted-foreground" },
          { label: "Team-Ideen", value: ideas, cls: "text-violet-500" },
          { label: "Blocker", value: blockers, cls: "text-red-500" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-1">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Wissenschaftliche Pflichten */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <FlaskConical className="h-4 w-4" />
            Wissenschaftliche Pflichten
          </div>
          <div className="flex items-center gap-3">
            {critical > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                {critical} kritische Blocker
              </span>
            )}
            <span className="text-xs text-muted-foreground font-mono">
              {scienceDone}/{SCIENCE_OBLIGATIONS.length} erfüllt
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {SCIENCE_OBLIGATIONS.map((o) => (
              <div
                key={o.label}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  o.done
                    ? "bg-emerald-500/5"
                    : o.critical
                      ? "bg-red-500/5 hover:bg-red-500/10"
                      : "hover:bg-muted/20"
                }`}
              >
                {o.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : o.critical ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-border shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium ${o.done ? "line-through text-muted-foreground" : o.critical ? "text-red-600 dark:text-red-400" : ""}`}
                    >
                      {o.label}
                    </span>
                    {o.critical && !o.done && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        · Pflicht für Ethikvotum
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month Columns */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Calendar className="h-4 w-4" />
          Feature-Timeline
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <MonthColumn
            title="Bereits fertig"
            subtitle="Monorepo · Auth · Admin · Monitoring"
            month="done"
            accentClass="border-emerald-500"
            dotClass="bg-emerald-500"
          />
          <MonthColumn
            title="Juni 2026"
            subtitle="User-Approval · DB · Datenschutz · GSE Start"
            month="juni"
            accentClass="border-blue-500"
            dotClass="bg-blue-500 animate-pulse"
          />
          <MonthColumn
            title="Juli 2026"
            subtitle="Chat · LLM · Gedächtnis · Characters · Budget"
            month="juli"
            accentClass="border-violet-500"
            dotClass="bg-violet-400"
          />
          <MonthColumn
            title="August 2026"
            subtitle="GSE End · Analytics · DSGVO · Pre-Reg"
            month="august"
            accentClass="border-orange-500"
            dotClass="bg-orange-400"
          />
        </div>
      </div>

      {/* Team Ideas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Lightbulb className="h-4 w-4" />
          Team-Ideen (noch offen)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FEATURES.filter((f) => f.month === "ideas").map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </div>
      </div>

      {/* Thesis Chapter Legend */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          Thesis-Kapitel-Mapping
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {THESIS_CHAPTERS.map((ch, i) => {
              const features = FEATURES.filter(
                (f) => f.chapter && (f.chapter.includes(ch.num) || f.chapter.startsWith(ch.num))
              )
              return (
                <div
                  key={ch.num}
                  className={`p-4 space-y-2 ${i > 0 && i % 3 === 0 ? "border-t border-border" : i > 2 && "sm:border-t border-border"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${ch.color}`}>{ch.num}</span>
                    <span className="text-xs font-medium">{ch.title}</span>
                  </div>
                  <div className="space-y-1">
                    {features.slice(0, 5).map((f) => (
                      <div key={f.title} className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[f.status].bar} shrink-0`} />
                        <span className="text-xs text-muted-foreground truncate">{f.title}</span>
                      </div>
                    ))}
                    {features.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{features.length - 5} weitere</span>
                    )}
                    {features.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">Theoretische Grundlagen</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Study Milestone */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Studienziel</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Studie</p>
            <p>~20 Teilnehmende, 3 Sessions über 4 Wochen. Mindestens 3 Sessions je Person dokumentiert.</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Datenhaltung</p>
            <p>Alle User-Daten werden 6 Monate nach Studienende automatisch gelöscht (dokumentiert in Datenschutzerklärung).</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Token-Budget</p>
            <p>Standard $5/User. Individuell anpassbar im Admin — manche Tester:innen erhalten $3, andere $10.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
