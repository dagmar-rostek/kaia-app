export const dynamic = "force-dynamic"

import Link from "next/link"
import {
  CheckSquare,
  ScrollText,
  Network,
  Activity,
  Database,
  ShieldCheck,
  Euro,
  FlaskConical,
  BarChart2,
  BookOpen,
  CalendarDays,
  ArrowRight,
} from "lucide-react"

async function fetchHealth() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000"
    const res = await fetch(`${apiUrl}/v1/health`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json() as Promise<{ status: string; study_mode: string; version: string }>
  } catch {
    return null
  }
}

const STUDY_MODE_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  development: { label: "Development", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  pilot:       { label: "Pilot",       color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  locked:      { label: "Locked 🔒",   color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20" },
}

interface QuickLink {
  href: string
  icon: React.ElementType
  label: string
  desc: string
  accent: string       // Tailwind bg class for icon pill
  iconColor: string    // Tailwind text class for icon
  badge?: string
}

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/admin/production-readiness",
    icon: CheckSquare,
    label: "Production Readiness",
    desc: "Deployment-Checkliste und Systemstatus — was steht vor dem nächsten Release an.",
    accent: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    href: "/admin/release-notes",
    icon: ScrollText,
    label: "Release Notes",
    desc: "Changelog aller Commits — Kategorien, Aufwand und Thesis-Relevanz auf einen Blick.",
    accent: "bg-sky-500/10",
    iconColor: "text-sky-400",
  },
  {
    href: "/admin/architektur",
    icon: Network,
    label: "Architektur",
    desc: "Systemdokumentation direkt aus ARCHITECTURE.md — Schichten, Domänen, ADRs.",
    accent: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    href: "/admin/kosten",
    icon: Euro,
    label: "Kosten",
    desc: "Infrastruktur, Claude Code Entwicklung, LLM-Inferenz — Budget im Blick behalten.",
    accent: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
  },
  {
    href: "/admin/thesis",
    icon: BookOpen,
    label: "Thesis-Cockpit",
    desc: "Kapitel, Deadlines, Fortschritts-Tracker — die Masterthesis strukturiert im Griff.",
    accent: "bg-pink-500/10",
    iconColor: "text-pink-400",
  },
  {
    href: "/admin/daily-log",
    icon: CalendarDays,
    label: "Tagebuch",
    desc: "Tägliche Entwicklungs-Einträge als Story aus Agenten-Perspektive.",
    accent: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    href: "/admin/simulation",
    icon: FlaskConical,
    label: "Crash-Simulation",
    desc: "10 adversarielle Personas · echte LLM-Calls · Transkripte zur Qualitätsprüfung.",
    accent: "bg-rose-500/10",
    iconColor: "text-rose-400",
    badge: "Live-Calls",
  },
  {
    href: "/admin/eval",
    icon: BarChart2,
    label: "Eval-Matrix",
    desc: "10 Personas × 10 Sessions — LLM-as-Judge bewertet M1–M7 und zeigt Schwächen.",
    accent: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    badge: "Thesis-Eval",
  },
]

export default async function AdminDashboardPage() {
  const health = await fetchHealth()
  const mode = health ? (STUDY_MODE_LABEL[health.study_mode] ?? null) : null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top header bar */}
      <div className="border-b border-zinc-800 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">KAIA Admin</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Masterthesis-Dashboard · nur für interne Nutzung</p>
          </div>
          <div className="flex items-center gap-3">
            {/* API Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${health ? "bg-emerald-400" : "bg-red-500"}`}
              />
              <span className="text-zinc-400">{health ? `API v${health.version}` : "API nicht erreichbar"}</span>
            </div>
            {/* Study Mode */}
            {mode && (
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium
                            ${mode.color} ${mode.bg} ${mode.border}`}
              >
                {mode.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

        {/* Status row */}
        <div className="grid grid-cols-3 gap-4">
          <StatusCard
            icon={Activity}
            label="API Status"
            value={health ? `${health.status} · v${health.version}` : "nicht erreichbar"}
            ok={!!health}
          />
          <StatusCard
            icon={ShieldCheck}
            label="Study Mode"
            value={mode?.label ?? "unbekannt"}
            ok={!!health}
            colorClass={mode?.color}
          />
          <StatusCard
            icon={Database}
            label="Datenbank"
            value="PostgreSQL 16 + pgvector"
            ok={true}
          />
        </div>

        {/* Quick links grid */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            Bereiche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map(({ href, icon: Icon, label, desc, accent, iconColor, badge }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col gap-3 rounded-xl border border-zinc-800
                           bg-zinc-900 p-5 hover:border-zinc-600 hover:bg-zinc-800/80
                           transition-all duration-150"
              >
                {badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-medium px-1.5 py-0.5
                                   rounded bg-zinc-700 text-zinc-400 border border-zinc-600">
                    {badge}
                  </span>
                )}
                <div className={`inline-flex w-9 h-9 items-center justify-center rounded-lg ${accent}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100 leading-none mb-1.5">{label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs text-zinc-600
                                group-hover:text-zinc-400 transition-colors">
                  Öffnen
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({
  icon: Icon,
  label,
  value,
  ok,
  colorClass,
}: {
  icon: React.ElementType
  label: string
  value: string
  ok: boolean
  colorClass?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${ok ? "bg-zinc-800" : "bg-red-500/10"}`}>
        <Icon className={`w-4 h-4 ${ok ? "text-zinc-400" : "text-red-400"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-medium truncate ${colorClass ?? (ok ? "text-zinc-200" : "text-red-400")}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
