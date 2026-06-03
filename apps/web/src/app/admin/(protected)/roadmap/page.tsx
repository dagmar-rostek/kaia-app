"use client"

import { useState, useMemo, useRef, useEffect } from "react"
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
  ChevronDown,
  ChevronUp,
  X,
  GitCommit,
} from "lucide-react"

type Status = "done" | "active" | "planned" | "idea" | "blocker"
type Month = "done" | "juni" | "juli" | "august" | "ideas"
type AgentId =
  | "coordinator"
  | "product-owner"
  | "discovery-researcher"
  | "psychologist"
  | "compliance"
  | "architect"
  | "ai-engineer"
  | "ai-ethics"
  | "ux-designer"
  | "security"
  | "qa-tester"
  | "mlops"

interface Feature {
  title: string
  desc: string
  status: Status
  month: Month
  chapter?: string
  tags?: string[]
  agents?: AgentId[]
  aufwand?: string
  sha?: string
  icon?: React.ElementType
}

const AGENT_CONFIG: Record<AgentId, { label: string; cls: string }> = {
  coordinator:          { label: "Koordinator",  cls: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300" },
  "product-owner":      { label: "PO",           cls: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400" },
  "discovery-researcher": { label: "Discovery",  cls: "bg-pink-500/10 text-pink-700 border-pink-500/20 dark:text-pink-400" },
  psychologist:         { label: "Psychologe",   cls: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400" },
  compliance:           { label: "Compliance",   cls: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" },
  architect:            { label: "Architect",    cls: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400" },
  "ai-engineer":        { label: "AI Eng.",      cls: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" },
  "ai-ethics":          { label: "AI Ethics",    cls: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400" },
  "ux-designer":        { label: "UX",           cls: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400" },
  security:             { label: "Security",     cls: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400" },
  "qa-tester":          { label: "QA",           cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" },
  mlops:                { label: "MLOps",        cls: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400" },
}

const FEATURES: Feature[] = [
  // === FERTIG ===
  {
    title: "Monorepo-Skeleton",
    desc: "Next.js 14 + FastAPI Monorepo, GitHub Actions CI/CD, Docker Compose, Caddy + Let's Encrypt auf Hetzner CX23.",
    status: "done", month: "done", chapter: "Kap. 4",
    tags: ["Infra"], agents: ["architect", "mlops"],
    aufwand: "3h", sha: "426aa27", icon: Database,
  },
  {
    title: "Landing Page & öffentliche Seiten",
    desc: "/wissenschaft, /architektur, /release-notes mit gemeinsamer Navigation und Dark-Mode.",
    status: "done", month: "done", chapter: "Kap. 1",
    tags: ["Frontend"], agents: ["ux-designer", "architect"],
    aufwand: "2h", sha: "da909b5", icon: Eye,
  },
  {
    title: "Admin-Bereich Basis",
    desc: "Dashboard, Production Readiness, Kosten, Tagebuch, Release Notes — passwortgeschützt via HMAC-Cookie.",
    status: "done", month: "done", chapter: "Kap. 4",
    tags: ["Frontend", "Admin"], agents: ["ux-designer", "security", "architect"],
    aufwand: "3h", sha: "8085cb7", icon: Shield,
  },
  {
    title: "Sentry Monitoring",
    desc: "Vollständige Sentry-Integration Frontend + Backend — DSN via Docker Build-Arg, global-error.tsx Boundary.",
    status: "done", month: "done", chapter: "Kap. 4",
    tags: ["Observability"], agents: ["mlops"],
    aufwand: "1h", sha: "464820f", icon: Activity,
  },
  {
    title: "BugReport-Widget",
    desc: "Floating Bug-Button sendet Reports direkt in Slack-Kanal mit Screenshot-Option.",
    status: "done", month: "done", chapter: "Kap. 4",
    tags: ["Observability"], agents: ["ux-designer", "mlops"],
    aufwand: "30min", sha: "8085cb7", icon: MessageSquare,
  },
  {
    title: "Auth Backend",
    desc: "JWT Access (15min) + Refresh (30d) rotierend, bcrypt-12, User-Approval-Flow, Token-Family-Reuse-Detection.",
    status: "done", month: "done", chapter: "Kap. 4",
    tags: ["Security", "Backend"], agents: ["security", "architect"],
    aufwand: "3h 30min", sha: "7bc1929", icon: Lock,
  },
  {
    title: "Auth Frontend",
    desc: "Login, Registrierung mit Multi-Step-DSGVO-Consent, AuthContext, AuthGuard, Next.js Middleware-Schutz.",
    status: "done", month: "done", chapter: "Kap. 4 · Kap. 6",
    tags: ["Frontend", "DSGVO"], agents: ["ux-designer", "security", "compliance"],
    aufwand: "2h", sha: "f82d263", icon: Users,
  },

  // === JUNI ===
  {
    title: "Admin User-Approval UI",
    desc: "Übersicht aller pending-User, Einzel-Freigabe mit Begründung — zentrale Studienkontrolle.",
    status: "active", month: "juni", chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Studie"], agents: ["product-owner", "ux-designer", "security"],
    aufwand: "2h", icon: Users,
  },
  {
    title: "DB-Schema (Alembic)",
    desc: "Vollständiges DB-Schema: users, sessions, messages, gse_results, consent_logs — pgvector Extension.",
    status: "planned", month: "juni", chapter: "Kap. 4",
    tags: ["Backend", "DB"], agents: ["architect", "security"],
    aufwand: "3h", icon: Database,
  },
  {
    title: "Datenschutzerklärung & Teilnahmevereinbarung",
    desc: "DSGVO-konformes Dokument: Datenkategorien, Zwecke, Speicherfrist 6 Monate, Löschrecht.",
    status: "planned", month: "juni", chapter: "Kap. 6",
    tags: ["DSGVO", "Ethik"], agents: ["compliance", "psychologist"],
    aufwand: "2h", icon: FileText,
  },
  {
    title: "Crisis-Detection Pre-Filter",
    desc: "Statischer Keyword-Filter vor LLM — bei Treffer Eskalationshinweis (Telefonseelsorge 0800 111 0 111).",
    status: "blocker", month: "juni", chapter: "Kap. 6",
    tags: ["Ethik", "Blocker"], agents: ["ai-engineer", "ai-ethics", "security"],
    aufwand: "3h", icon: AlertTriangle,
  },
  {
    title: "KI-Disclosure + Multi-Step-Onboarding",
    desc: "Expliziter Hinweis: KAIA ist eine KI (computational empathy, kein Mensch). Zweistufiger Consent-Flow.",
    status: "planned", month: "juni", chapter: "Kap. 6",
    tags: ["Ethik", "DSGVO"], agents: ["compliance", "ai-ethics", "ux-designer"],
    aufwand: "2h", icon: Eye,
  },
  {
    title: "GSE Pre-Measurement",
    desc: "Allgemeine Selbstwirksamkeitserwartung (Schwarzer & Jerusalem, 1995) — 10 Items, 4-stufige Likert-Skala.",
    status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 6",
    tags: ["Psychometrie", "Studie"], agents: ["psychologist", "ux-designer", "ai-ethics"],
    aufwand: "3h", icon: FlaskConical,
  },

  // === JULI ===
  {
    title: "Chat Core mit SSE-Streaming",
    desc: "Echtzeit-Textstrom via Server-Sent Events, React Query für State, Message-History in PostgreSQL.",
    status: "planned", month: "juli", chapter: "Kap. 4",
    tags: ["Backend", "Frontend"], agents: ["ai-engineer", "architect", "ux-designer"],
    aufwand: "5h", icon: MessageSquare,
  },
  {
    title: "Prompt-Management in DB",
    desc: "Sokratische Prompt-Templates in PostgreSQL, Jinja2-Rendering, live editierbar — Study-Lock bei STUDY_MODE=locked.",
    status: "planned", month: "juli", chapter: "Kap. 3 · Kap. 4",
    tags: ["AI", "Backend"], agents: ["ai-engineer", "mlops", "architect"],
    aufwand: "3h", icon: Brain,
  },
  {
    title: "LLM Single API (Claude · GPT-4o · Mistral)",
    desc: "Gemeinsames Abstraktions-Interface für alle drei LLMs — versionierte Model-IDs, DPAs vor Integration.",
    status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 5",
    tags: ["AI", "LLM-Eval"], agents: ["ai-engineer", "security", "mlops"],
    aufwand: "4h", icon: Zap,
  },
  {
    title: "LLM-Evaluation (synthetische Daten)",
    desc: "Vergleich Claude/GPT-4o/Mistral: Empathiequalität, Sokratik, Konsistenz, Datenschutzkonformität — VOR Studienstart.",
    status: "planned", month: "juli", chapter: "Kap. 5",
    tags: ["LLM-Eval", "Wissenschaft"], agents: ["ai-engineer", "mlops", "psychologist"],
    aufwand: "6h", icon: FlaskConical,
  },
  {
    title: "Zwei Interaktionsmodi",
    desc: "Modus A: rein sokratisch (nur Fragen). Modus B: unterstützend/instruktional. Operationalisierung mit Psychologen.",
    status: "planned", month: "juli", chapter: "Kap. 3",
    tags: ["AI", "Psychologie"], agents: ["ai-engineer", "psychologist"],
    aufwand: "3h", icon: Brain,
  },
  {
    title: "Character-System",
    desc: "10 KAIA-Charaktere + Normal + Crazy (täglicher Wechsel). Aktiver Charakter sichtbar, User kann wechseln.",
    status: "planned", month: "juli", chapter: "Kap. 3",
    tags: ["AI", "UX"], agents: ["ai-engineer", "ux-designer", "psychologist"],
    aufwand: "4h", icon: Sparkles,
  },
  {
    title: "Zwei-Schicht-Gedächtnis",
    desc: "PostgreSQL (strukturiert) + pgvector (semantisch) — Row-Level-Security, user_id als Pflichtparameter.",
    status: "planned", month: "juli", chapter: "Kap. 3 · Kap. 4",
    tags: ["AI", "Security", "DB"], agents: ["architect", "security", "ai-engineer"],
    aufwand: "4h", icon: Database,
  },
  {
    title: "KAIA Cross-Session-Gedächtnis",
    desc: "KAIA referenziert frühere Sessions natürlich im Gespräch. Semantische Suche via pgvector.",
    status: "planned", month: "juli", chapter: "Kap. 3",
    tags: ["AI"], agents: ["ai-engineer", "architect"],
    aufwand: "3h", icon: Brain,
  },
  {
    title: "30-Tage-Zugangs-Timer",
    desc: "Jede Tester:in hat 30 Tage Zugang ab Freischaltung. Im Admin sichtbar + manuell verlängerbar.",
    status: "planned", month: "juli", chapter: "Kap. 6",
    tags: ["Admin", "Studie"], agents: ["product-owner", "ux-designer"],
    aufwand: "1h", icon: Calendar,
  },
  {
    title: "Token-Budget pro User",
    desc: "Standard $5/User. Im Admin individuell anpassbar — Übersicht mit verbrauchtem Budget in Echtzeit.",
    status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Cost"], agents: ["mlops", "product-owner"],
    aufwand: "2h", icon: BarChart3,
  },
  {
    title: "SMTP + E-Mail-System",
    desc: "Passwort-Reset, Benachrichtigung bei Freigabe, opt. Reminder. Hetzner SMTP oder Postmark.",
    status: "planned", month: "juli", chapter: "Kap. 4",
    tags: ["Backend"], agents: ["architect", "security"],
    aufwand: "2h", icon: Mail,
  },
  {
    title: "Study-Lock + LLM Model-Pinning",
    desc: "STUDY_MODE=locked blockiert CI bei Prompt-Änderungen. Jedes Modell mit expliziter versionierter Model-ID.",
    status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 5",
    tags: ["Studie", "AI"], agents: ["mlops", "ai-engineer", "security"],
    aufwand: "1h", icon: Lock,
  },

  // === AUGUST ===
  {
    title: "GSE Post-Measurement + Visualisierung",
    desc: "GSE nach Studienende (10 Items). Prä/Post-Vergleich grafisch, PDF-Download, opt-in Sharing.",
    status: "planned", month: "august", chapter: "Kap. 6",
    tags: ["Psychometrie", "Studie"], agents: ["psychologist", "ux-designer"],
    aufwand: "4h", icon: BarChart3,
  },
  {
    title: "Per-Session Structured Observation",
    desc: "Nach jeder Session: neuroadaptiver Modus, Sentiment, Selbstwirksamkeitseinschätzung automatisch gespeichert.",
    status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6",
    tags: ["AI", "Analytics"], agents: ["ai-engineer", "psychologist", "mlops"],
    aufwand: "3h", icon: Target,
  },
  {
    title: "LLM-Transcript-Analyse",
    desc: "Fremdwahrnehmung aus Transkripten: Handlungskontrolle, Problemlösezuversicht, Bewältigungserwartung.",
    status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6",
    tags: ["AI", "Psychologie"], agents: ["ai-engineer", "ai-ethics", "psychologist"],
    aufwand: "5h", icon: Brain,
  },
  {
    title: "Konvergenz/Divergenz-Visualisierung",
    desc: "Zeitreihe: Selbstwahrnehmung (GSE) vs. Fremdwahrnehmung (LLM-Analyse) — Basis für Thesis-Ergebnisse.",
    status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6",
    tags: ["Analytics", "Wissenschaft"], agents: ["ux-designer", "psychologist"],
    aufwand: "3h", icon: BarChart3,
  },
  {
    title: "Feedback/Wünsche-Seite",
    desc: "Alle eingeloggten User sehen und schreiben Feedback. Admin labelt: Roadmap / In Entwicklung / Abgelehnt.",
    status: "planned", month: "august", chapter: "Kap. 6",
    tags: ["Frontend", "Studie"], agents: ["ux-designer", "product-owner"],
    aufwand: "2h", icon: MessageSquare,
  },
  {
    title: "Admin Analytics Dashboard",
    desc: "Nutzungsstatistiken: Login-Zeit, Chat-Dauer, Topics, Token-Verbrauch — nur mit consent_analytics=true.",
    status: "planned", month: "august", chapter: "Kap. 4 · Kap. 6",
    tags: ["Admin", "Analytics", "DSGVO"], agents: ["mlops", "compliance", "ux-designer"],
    aufwand: "4h", icon: BarChart3,
  },
  {
    title: "DSGVO Art. 15–21 vollständig",
    desc: "Auskunftsrecht, Löschrecht, Berichtigung, Portabilität, Widerspruch — Self-Service im Profil.",
    status: "planned", month: "august", chapter: "Kap. 6",
    tags: ["DSGVO"], agents: ["compliance", "ux-designer"],
    aufwand: "3h", icon: FileText,
  },
  {
    title: "Easter Eggs",
    desc: "Versteckte Überraschungen auf 404, Loading, Edge Cases — Admin wird per Slack notifiziert.",
    status: "planned", month: "august",
    tags: ["UX"], agents: ["ux-designer"],
    aufwand: "1h", icon: Sparkles,
  },
  {
    title: "Pre-Registration OSF.io + Power-Analyse",
    desc: "Hypothesen vor Datensicht (OSF.io). G*Power-Stichprobenanalyse dokumentiert — Pflicht für Validität.",
    status: "planned", month: "august", chapter: "Kap. 6",
    tags: ["Wissenschaft", "Ethik"], agents: ["discovery-researcher", "psychologist"],
    aufwand: "1h", icon: FlaskConical,
  },

  // === IDEEN ===
  {
    title: "Reminder-System",
    desc: "Automatische Erinnerungen für Tester:innen (Mail oder In-App). Frequenz mit Psychologen abstimmen.",
    status: "idea", month: "ideas", chapter: "evtl. Kap. 6",
    tags: ["UX", "Psychologie"], agents: ["psychologist", "ux-designer", "product-owner"],
    aufwand: "2h", icon: Mail,
  },
  {
    title: "Surprise Mode",
    desc: "KAIA verhält sich unerwartet anders — ethische Fragen (Transparenz, Vertrauen) mit Psychologen klären.",
    status: "idea", month: "ideas", chapter: "evtl. Kap. 3",
    tags: ["AI", "Psychologie"], agents: ["ai-ethics", "psychologist"],
    icon: HelpCircle,
  },
  {
    title: "DPAs Anthropic / OpenAI / Mistral",
    desc: "Data Processing Agreements vor Studienstart. Schrems-II in Datenschutzerklärung dokumentieren.",
    status: "idea", month: "ideas",
    tags: ["DSGVO", "Rechtlich"], agents: ["compliance"],
    aufwand: "1h", icon: FileText,
  },
]

const STATUS_CONFIG = {
  done:    { label: "Fertig",          cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", bar: "bg-emerald-500",         icon: CheckCircle2 },
  active:  { label: "In Entwicklung", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",           bar: "bg-blue-500",             icon: Clock },
  planned: { label: "Geplant",        cls: "bg-muted text-muted-foreground border-border",                                  bar: "bg-muted-foreground/40",  icon: Calendar },
  idea:    { label: "Team-Idee",      cls: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",    bar: "bg-violet-500",           icon: Lightbulb },
  blocker: { label: "Blocker",        cls: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",               bar: "bg-red-500",              icon: AlertTriangle },
}

const TAG_COLORS: Record<string, string> = {
  DSGVO:       "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Ethik:       "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  Blocker:     "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  Security:    "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  Psychometrie:"bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Psychologie: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Wissenschaft:"bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
  "LLM-Eval":  "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400",
  Studie:      "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400",
  AI:          "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  Analytics:   "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  Rechtlich:   "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-400",
}

const SCIENCE_OBLIGATIONS = [
  { label: "Crisis-Detection",              detail: "Keyword-Filter vor LLM — Eskalationshinweis Telefonseelsorge",         done: false, critical: true  },
  { label: "Ethikvotum SRH",               detail: "Antrag läuft — 4–8 Wochen Bearbeitungszeit",                           done: false, critical: true  },
  { label: "KI-Disclosure",                detail: "Expliziter Hinweis: KAIA ist eine KI, kein Mensch",                     done: false, critical: true  },
  { label: "Multi-Step-Consent",           detail: "2 getrennte Checkboxen: Datenverarbeitung + Analytics",                  done: true,  critical: false },
  { label: "DSGVO vollständig (Art. 15–21)", detail: "Auskunft, Löschung, Portabilität, Widerspruch",                       done: false, critical: false },
  { label: "Pre-Registration OSF.io",      detail: "Hypothesen vor Datensicht registrieren",                                 done: false, critical: false },
  { label: "Power-Analyse G*Power",        detail: "Stichprobengröße vor Studienstart dokumentieren",                        done: false, critical: false },
  { label: "LLM Model-Pinning",            detail: "Immer versionierte IDs — nie generisch",                                 done: false, critical: false },
  { label: "Study-Lock",                   detail: "Prompt-Freeze während Datenerhebung (STUDY_MODE=locked)",                done: false, critical: false },
  { label: "pgvector Row-Level-Security",  detail: "user_id als Pflichtparameter, kein Cross-User-Leak",                    done: false, critical: false },
  { label: "DPAs",                         detail: "Data Processing Agreements mit Anthropic, OpenAI, Mistral",              done: false, critical: false },
  { label: "Schrems-II in Datenschutzerklärung", detail: "EU-Serverstandort Hetzner Helsinki dokumentiert",                 done: false, critical: false },
  { label: "LLM-Evaluationsbericht",       detail: "Claude vs. GPT-4o vs. Mistral nach definierten Kriterien",              done: false, critical: false },
]

const THESIS_CHAPTERS = [
  { num: "Kap. 1", title: "Einleitung & Motivation",        color: "text-slate-500"  },
  { num: "Kap. 2", title: "Theoretischer Hintergrund",      color: "text-violet-500" },
  { num: "Kap. 3", title: "Konzeptionelles Rahmenwerk",     color: "text-sky-500"    },
  { num: "Kap. 4", title: "Technische Implementierung",     color: "text-emerald-500"},
  { num: "Kap. 5", title: "LLM-Evaluationsbericht",         color: "text-cyan-500"   },
  { num: "Kap. 6", title: "Pilotstudie & Evaluation",       color: "text-orange-500" },
]

// ── Feature Card ──────────────────────────────────────────────────────────────

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
            <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${s.cls}`}>
              <s.icon className="h-3 w-3" />
              {s.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 border-t border-border/60">
        {/* Chapter */}
        {f.chapter && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-mono">{f.chapter}</span>
          </div>
        )}
        {/* Time */}
        {f.aufwand && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground tabular-nums">{f.aufwand}</span>
          </div>
        )}
        {/* SHA */}
        {f.sha && (
          <div className="flex items-center gap-1">
            <GitCommit className="h-3 w-3 text-muted-foreground shrink-0" />
            <code className="text-xs text-muted-foreground font-mono">{f.sha}</code>
          </div>
        )}
      </div>

      {/* Tags + Agents */}
      <div className="flex flex-wrap gap-1.5">
        {f.tags?.map((tag) => (
          <span key={tag} className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"}`}>
            {tag}
          </span>
        ))}
        {f.agents?.map((a) => {
          const ac = AGENT_CONFIG[a]
          return (
            <span key={a} className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs ${ac.cls}`}>
              {ac.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  label,
  options,
  active,
  onChange,
}: {
  label: string
  options: { value: T; label: string; cls?: string }[]
  active: T[]
  onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggle(v: T) {
    onChange(active.includes(v) ? active.filter((x) => x !== v) : [...active, v])
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-pointer ${
          active.length > 0
            ? "border-foreground/40 bg-foreground/5 text-foreground"
            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
        }`}
      >
        {label}
        {active.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-foreground text-background text-xs font-bold h-4 w-4">
            {active.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-44 rounded-lg border border-border bg-background shadow-lg py-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <input
                type="checkbox"
                checked={active.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 rounded border-border accent-foreground cursor-pointer"
              />
              {opt.cls ? (
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${opt.cls}`}>
                  {opt.label}
                </span>
              ) : (
                <span className="text-sm">{opt.label}</span>
              )}
            </label>
          ))}
          {active.length > 0 && (
            <>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => { onChange([]); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" /> Zurücksetzen
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Month Column ──────────────────────────────────────────────────────────────

function MonthColumn({
  title, subtitle, month, accentClass, dotClass, features,
}: {
  title: string; subtitle: string; month: Month
  accentClass: string; dotClass: string; features: Feature[]
}) {
  const all = FEATURES.filter((f) => f.month === month)
  const done = all.filter((f) => f.status === "done").length

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
              {done}/{all.length}
              {features.length !== all.length && (
                <span className="text-muted-foreground/60"> · {features.length} sichtbar</span>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {features.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
            Kein Feature matcht den Filtern
          </p>
        ) : (
          features.map((f) => <FeatureCard key={f.title} f={f} />)
        )}
      </div>
    </div>
  )
}

// ── Science Accordion ─────────────────────────────────────────────────────────

function ScienceSection() {
  const [open, setOpen] = useState(true)
  const scienceDone = SCIENCE_OBLIGATIONS.filter((o) => o.done).length
  const critical = SCIENCE_OBLIGATIONS.filter((o) => o.critical && !o.done).length

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Wissenschaftliche Pflichten</span>
          <span className="text-xs text-muted-foreground font-mono">
            {scienceDone}/{SCIENCE_OBLIGATIONS.length} erfüllt
          </span>
          {critical > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              {critical} Blocker für Ethikvotum
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {SCIENCE_OBLIGATIONS.map((o) => (
            <div
              key={o.label}
              className={`flex items-start gap-3 px-5 py-3 transition-colors ${
                o.done ? "bg-emerald-500/5" : o.critical ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-muted/20"
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
                  <span className={`text-sm font-medium ${o.done ? "line-through text-muted-foreground" : o.critical ? "text-red-600 dark:text-red-400" : ""}`}>
                    {o.label}
                  </span>
                  {o.critical && !o.done && (
                    <span className="text-xs text-red-500 font-medium">· Pflicht für Ethikvotum</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{o.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const [activeStatuses, setActiveStatuses] = useState<Status[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([])

  const allTags = useMemo(
    () => [...new Set(FEATURES.flatMap((f) => f.tags ?? []))].sort(),
    []
  )
  const allAgents = useMemo(
    () => [...new Set(FEATURES.flatMap((f) => f.agents ?? []))].sort() as AgentId[],
    []
  )

  const filtered = useMemo(() => {
    return FEATURES.filter((f) => {
      if (activeStatuses.length && !activeStatuses.includes(f.status)) return false
      if (activeTags.length && !activeTags.some((t) => f.tags?.includes(t))) return false
      if (activeAgents.length && !activeAgents.some((a) => f.agents?.includes(a))) return false
      return true
    })
  }, [activeStatuses, activeTags, activeAgents])

  const hasFilter = activeStatuses.length > 0 || activeTags.length > 0 || activeAgents.length > 0

  const stats = {
    done:     FEATURES.filter((f) => f.status === "done").length,
    active:   FEATURES.filter((f) => f.status === "active").length,
    planned:  FEATURES.filter((f) => f.status === "planned").length,
    ideas:    FEATURES.filter((f) => f.status === "idea").length,
    blockers: FEATURES.filter((f) => f.status === "blocker").length,
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">Produktroadmap</h1>
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Juni · Juli · August 2026
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          KAIA Pilotstudie — Masterthesis M.Sc. Data Science & Analytics, SRH Riedlingen
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["done", "active", "planned", "ideas", "blockers"] as const).map((k) => {
          const map = {
            done: { label: "Fertig", cls: "text-emerald-500" },
            active: { label: "In Entwicklung", cls: "text-blue-500" },
            planned: { label: "Geplant", cls: "text-muted-foreground" },
            ideas: { label: "Team-Ideen", cls: "text-violet-500" },
            blockers: { label: "Blocker", cls: "text-red-500" },
          }
          return (
            <div key={k} className="rounded-lg border border-border p-4 space-y-1">
              <p className={`text-2xl font-bold ${map[k].cls}`}>{stats[k]}</p>
              <p className="text-xs text-muted-foreground">{map[k].label}</p>
            </div>
          )
        })}
      </div>

      {/* Wissenschaftliche Pflichten — collapsible */}
      <ScienceSection />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium mr-1">Filter:</span>

        <FilterDropdown
          label="Status"
          options={(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([k, v]) => ({
            value: k,
            label: v.label,
            cls: v.cls,
          }))}
          active={activeStatuses}
          onChange={setActiveStatuses}
        />

        <FilterDropdown
          label="Tags"
          options={allTags.map((tag) => ({ value: tag, label: tag, cls: TAG_COLORS[tag] }))}
          active={activeTags}
          onChange={setActiveTags}
        />

        <FilterDropdown
          label="Agents"
          options={allAgents.map((a) => ({ value: a, label: AGENT_CONFIG[a].label, cls: AGENT_CONFIG[a].cls }))}
          active={activeAgents}
          onChange={setActiveAgents}
        />

        {hasFilter && (
          <button
            onClick={() => { setActiveStatuses([]); setActiveTags([]); setActiveAgents([]) }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X className="h-3 w-3" /> Alle zurücksetzen
          </button>
        )}
      </div>

      {/* Feature Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Calendar className="h-4 w-4" />
          Feature-Timeline
          {hasFilter && (
            <span className="text-xs font-normal normal-case text-muted-foreground">
              — {filtered.length} Features sichtbar
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <MonthColumn
            title="Backlog" subtitle="Team-Ideen · noch ohne Termin"
            month="ideas" accentClass="border-violet-500" dotClass="bg-violet-400"
            features={filtered.filter((f) => f.month === "ideas")}
          />
          <MonthColumn
            title="Juni 2026" subtitle="User-Approval · DB · Datenschutz · GSE Start"
            month="juni" accentClass="border-blue-500" dotClass="bg-blue-500 animate-pulse"
            features={filtered.filter((f) => f.month === "juni")}
          />
          <MonthColumn
            title="Juli 2026" subtitle="Chat · LLM · Gedächtnis · Characters · Budget"
            month="juli" accentClass="border-sky-500" dotClass="bg-sky-400"
            features={filtered.filter((f) => f.month === "juli")}
          />
          <MonthColumn
            title="August 2026" subtitle="GSE End · Analytics · DSGVO · Pre-Reg"
            month="august" accentClass="border-orange-500" dotClass="bg-orange-400"
            features={filtered.filter((f) => f.month === "august")}
          />
          <MonthColumn
            title="Fertig" subtitle="Monorepo · Auth · Admin · Monitoring"
            month="done" accentClass="border-emerald-500" dotClass="bg-emerald-500"
            features={filtered.filter((f) => f.month === "done")}
          />
        </div>
      </div>

      {/* Thesis Chapter Legend */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          Thesis-Kapitel-Mapping
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y divide-border sm:divide-y-0 [&>*:nth-child(n+4)]:border-t [&>*:nth-child(n+4)]:border-border sm:[&>*:nth-child(2)]:border-l sm:[&>*:nth-child(2)]:border-border sm:[&>*:nth-child(3)]:border-l sm:[&>*:nth-child(3)]:border-border lg:[&>*:nth-child(4)]:border-l lg:[&>*:nth-child(4)]:border-border lg:[&>*:nth-child(5)]:border-l lg:[&>*:nth-child(5)]:border-border lg:[&>*:nth-child(6)]:border-l lg:[&>*:nth-child(6)]:border-border">
            {THESIS_CHAPTERS.map((ch) => {
              const chFeatures = FEATURES.filter(
                (f) => f.chapter && f.chapter.includes(ch.num)
              )
              return (
                <div key={ch.num} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${ch.color}`}>{ch.num}</span>
                    <span className="text-xs font-medium">{ch.title}</span>
                  </div>
                  <div className="space-y-1">
                    {chFeatures.slice(0, 5).map((f) => (
                      <div key={f.title} className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[f.status].bar} shrink-0`} />
                        <span className="text-xs text-muted-foreground truncate">{f.title}</span>
                      </div>
                    ))}
                    {chFeatures.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{chFeatures.length - 5} weitere</span>
                    )}
                    {chFeatures.length === 0 && (
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
            <p>Alle User-Daten werden 6 Monate nach Studienende automatisch gelöscht (in Datenschutzerklärung).</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Token-Budget</p>
            <p>Standard $5/User. Individuell anpassbar im Admin — manche $3, andere $10.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
