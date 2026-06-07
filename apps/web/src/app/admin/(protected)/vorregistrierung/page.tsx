"use client"

import { useEffect, useState } from "react"
import { Trash2, RefreshCw, Users } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

interface Entry {
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

function getAdminToken(): string {
  return document.cookie.match(/kaia_admin=([^;]+)/)?.[1] ?? ""
}

export default function VorregistrierungAdminPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [eRes, sRes] = await Promise.all([
        fetch(`${API}/api/v1/preregister/admin/list`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        }),
        fetch(`${API}/api/v1/preregister/stats`),
      ])
      if (eRes.ok) setEntries(await eRes.json())
      if (sRes.ok) setStats(await sRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function remove(id: string, name: string) {
    if (!confirm(`${name} wirklich entfernen? Die Person bekommt eine E-Mail.`)) return
    setRemoving(id)
    try {
      await fetch(`${API}/api/v1/preregister/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      })
      await load()
    } finally {
      setRemoving(null)
    }
  }

  const active  = entries.filter(e => e.status === "active")
  const removed = entries.filter(e => e.status === "removed")

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voranmeldungen</h1>
          {stats && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {stats.total} aktiv · {stats.remaining} Plätze frei · max. {stats.max}
            </p>
          )}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </button>
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
              className="h-full bg-foreground rounded-full transition-all"
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
        {active.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">Noch niemand auf der Liste.</p>
        )}
        <div className="space-y-2">
          {active.map(e => (
            <div key={e.id} className="rounded-lg border border-border p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic truncate">&ldquo;{e.reason}&rdquo;</p>
              </div>
              <button
                onClick={() => remove(e.id, e.name)}
                disabled={removing === e.id}
                className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                title="Entfernen — schickt E-Mail"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Removed */}
      {removed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Entfernt ({removed.length})</h2>
          <div className="space-y-1">
            {removed.map(e => (
              <div key={e.id} className="rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 flex items-center gap-3 opacity-60">
                <span className="text-sm line-through text-muted-foreground">{e.name}</span>
                <span className="text-xs text-muted-foreground">{e.email}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
