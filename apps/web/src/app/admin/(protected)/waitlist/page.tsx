export const dynamic = "force-dynamic"

import { Mail, User, Package, Clock } from "lucide-react"

const API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

interface WaitlistEntry {
  id: number
  name: string
  email: string
  product: string
  product_label: string
  created_at: string
}

async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const res = await fetch(`${API}/v1/admin/waitlist`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}` },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json() as Promise<WaitlistEntry[]>
  } catch {
    return []
  }
}

const PRODUCT_COLORS: Record<string, string> = {
  "gfk-leadership": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "gfk-business":   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "ai-leaders":     "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "ai-builders":    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default async function WaitlistPage() {
  const entries = await fetchWaitlist()

  const byProduct = entries.reduce<Record<string, WaitlistEntry[]>>((acc, e) => {
    if (!acc[e.product]) acc[e.product] = []
    acc[e.product].push(e)
    return acc
  }, {})

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Warteliste</h1>
        <p className="text-sm text-muted-foreground">
          {entries.length} Vorregistrierung{entries.length !== 1 ? "en" : ""} · Neueste zuerst
        </p>
      </div>

      {entries.length === 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Noch keine Anmeldungen.
        </div>
      )}

      {/* Pro-Produkt-Zusammenfassung */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(byProduct).map(([product, list]) => (
            <div
              key={product}
              className={`rounded-lg border px-4 py-3 space-y-0.5 ${PRODUCT_COLORS[product] ?? "bg-muted/20 border-border text-muted-foreground"}`}
            >
              <p className="text-lg font-bold">{list.length}</p>
              <p className="text-xs opacity-80 leading-snug">{list[0].product_label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabelle */}
      {entries.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> Name</div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> E-Mail</div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Package className="h-3 w-3" /> Produkt</div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Datum</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <a href={`mailto:${e.email}`} className="hover:text-foreground transition-colors underline underline-offset-2">
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRODUCT_COLORS[e.product] ?? "bg-muted border-border text-muted-foreground"}`}>
                      {e.product_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {fmt(e.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </main>
  )
}
