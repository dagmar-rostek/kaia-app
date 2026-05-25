import Link from "next/link"
import { CheckSquare, ScrollText, Network, Activity, Database, ShieldCheck, Euro } from "lucide-react"

async function fetchHealth() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
    const res = await fetch(`${apiUrl}/v1/health`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    return res.json() as Promise<{ status: string; study_mode: string; version: string }>
  } catch {
    return null
  }
}

const STUDY_MODE_COLOR: Record<string, string> = {
  development: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  pilot: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  locked: "text-red-500 bg-red-500/10 border-red-500/20",
}

const QUICK_LINKS = [
  {
    href: "/admin/production-readiness",
    icon: CheckSquare,
    label: "Production Readiness",
    desc: "Deployment-Checkliste und Systemstatus",
  },
  {
    href: "/admin/release-notes",
    icon: ScrollText,
    label: "Release Notes",
    desc: "Changelog aller Commits mit Kategorie und Aufwand",
  },
  {
    href: "/admin/architektur",
    icon: Network,
    label: "Architektur",
    desc: "Systemdokumentation aus docs/ARCHITECTURE.md",
  },
  {
    href: "/admin/kosten",
    icon: Euro,
    label: "Kosten",
    desc: "Infrastruktur, Claude Code Entwicklung, LLM-Inferenz",
  },
]

export default async function AdminDashboardPage() {
  const health = await fetchHealth()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Übersicht</h1>
        <p className="text-muted-foreground text-sm mt-1">KAIA Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Activity className="h-4 w-4" />
            API Status
          </div>
          {health ? (
            <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              {health.status} · v{health.version}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 border-red-500/20">
              nicht erreichbar
            </span>
          )}
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Study Mode
          </div>
          {health ? (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STUDY_MODE_COLOR[health.study_mode] ?? "bg-muted text-muted-foreground border-border"}`}
            >
              {health.study_mode}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            Datenbank
          </div>
          <span className="text-sm text-muted-foreground">Schema noch nicht migriert</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Seiten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-border p-4 hover:border-border/60 hover:bg-muted/30 transition-colors space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
