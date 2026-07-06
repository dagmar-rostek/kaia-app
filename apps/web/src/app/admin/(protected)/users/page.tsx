export const dynamic = "force-dynamic"

import { Clock, CheckCircle2, XCircle, Users, AlertTriangle } from "lucide-react"
import { ApproveButton, RejectButton, DeleteButton } from "./UserActions"

const API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

type UserStatus = "pending" | "active" | "suspended"

interface AdminUser {
  id: number
  email: string
  username: string
  status: UserStatus
  consent_analytics: boolean
  approved_at: string | null
  approved_by: string | null
  last_login_at: string | null
  created_at: string
}

async function fetchUsers(): Promise<AdminUser[]> {
  try {
    const res = await fetch(`${API}/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
      },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const STATUS_CONFIG: Record<UserStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending:   { label: "Ausstehend",    cls: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",   icon: Clock },
  active:    { label: "Aktiv",         cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400", icon: CheckCircle2 },
  suspended: { label: "Abgelehnt",     cls: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",           icon: XCircle },
}

export default async function UsersPage() {
  const users = await fetchUsers()
  const pending  = users.filter((u) => u.status === "pending")
  const active   = users.filter((u) => u.status === "active")
  const suspended = users.filter((u) => u.status === "suspended")

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Teilnehmende</h1>
        <p className="text-muted-foreground text-sm">
          User-Approval — Studienkontrolle. Nur freigegebene Accounts können sich einloggen.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Ausstehend", value: pending.length,   cls: "text-amber-500"   },
          { label: "Aktiv",      value: active.length,    cls: "text-emerald-500" },
          { label: "Abgelehnt",  value: suspended.length, cls: "text-red-500"     },
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-1">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending — prominent */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Freigabe erforderlich</h2>
          {pending.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              {pending.length} ausstehend
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
            Keine ausstehenden Registrierungen
          </p>
        ) : (
          <div className="rounded-lg border border-amber-500/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">E-Mail</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Registriert</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Analytics</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pending.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3 text-xs">
                      {u.consent_analytics
                        ? <span className="text-emerald-600 dark:text-emerald-400">Ja</span>
                        : <span className="text-muted-foreground">Nein</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <ApproveButton userId={u.id} />
                        <RejectButton userId={u.id} />
                        <DeleteButton userId={u.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active users */}
      {active.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">Aktive Teilnehmende</h2>
            <span className="text-xs text-muted-foreground font-mono">{active.length}</span>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">E-Mail</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Freigegeben</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Letzter Login</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{fmt(u.approved_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{fmt(u.last_login_at)}</td>
                    <td className="px-4 py-3">
                      <RejectButton userId={u.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Suspended */}
      {suspended.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Abgelehnte / Gesperrte</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">E-Mail</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suspended.map((u) => {
                  const s = STATUS_CONFIG[u.status]
                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.username}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium ${s.cls}`}>
                          <s.icon className="h-3 w-3" />{s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <ApproveButton userId={u.id} />
                          <DeleteButton userId={u.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
