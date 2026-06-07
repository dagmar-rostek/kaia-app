export const dynamic = "force-dynamic"

import { Users, UserX } from "lucide-react"
import { RemoveButton } from "./RemoveButton"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const AUTH = `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`

interface PreReg {
  id: string
  name: string
  email: string
  reason: string
  status: string
  created_at: string
}

interface Stats {
  total: number
  remaining: number
  max: number
}

async function fetchList(): Promise<PreReg[]> {
  try {
    const res = await fetch(`${API}/v1/preregister/admin/list`, {
      headers: { Authorization: AUTH },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function fetchStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API}/v1/preregister/stats`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

export default async function VorregistrierungAdminPage() {
  const [entries, stats] = await Promise.all([fetchList(), fetchStats()])

  const active  = entries.filter(e => e.status === "active")
  const removed = entries.filter(e => e.status === "removed")

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voranmeldungen</h1>
        {stats && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total} aktiv · {stats.remaining} Plätze frei · max. {stats.max}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {stats && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.total} Voranmeldungen</span>
            <span>{stats.remaining} Plätze frei</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: `${(stats.total / stats.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Active */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Aktiv ({active.length})
        </h2>
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch niemand auf der Liste.</p>
        )}
        <div className="space-y-2">
          {active.map(e => (
            <div key={e.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.email}</span>
                  <span className="text-xs text-muted-foreground">{fmt(e.created_at)}</span>
                </div>
                <p className="text-xs text-muted-foreground italic truncate">&ldquo;{e.reason}&rdquo;</p>
              </div>
              <RemoveButton id={e.id} name={e.name} />
            </div>
          ))}
        </div>
      </div>

      {/* Removed */}
      {removed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Abgemeldet ({removed.length})
          </h2>
          <div className="space-y-1">
            {removed.map(e => (
              <div key={e.id} className="rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 flex items-center gap-3 opacity-60">
                <span className="text-sm line-through text-muted-foreground">{e.name}</span>
                <span className="text-xs text-muted-foreground">{e.email}</span>
                <span className="text-xs text-muted-foreground">{fmt(e.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
