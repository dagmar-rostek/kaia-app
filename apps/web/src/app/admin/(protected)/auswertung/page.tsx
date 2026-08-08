export const dynamic = "force-dynamic"

import { BarChart2, TrendingUp, Users } from "lucide-react"
import { UserDownloadButtons, DownloadAllCsvButton } from "./DownloadButtons"

const API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

interface ProgressItem {
  user_id: number
  display_name: string
  current_session: number
  pre_survey_done: boolean
  post_survey_done: boolean
}

async function fetchProgress(): Promise<ProgressItem[]> {
  try {
    const res = await fetch(`${API}/v1/admin/participants/progress`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}` },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json() as Promise<ProgressItem[]>
  } catch {
    return []
  }
}

interface ParticipantSummaryItem {
  user_id: number
  participant_id: string
  display_name: string
  learning_topic: string | null
  completed_at: string | null
  gse_delta: number | null
  sessions_completed: number
}

interface ParticipantsSummaryResponse {
  count: number
  avg_gse_delta: number | null
  participants: ParticipantSummaryItem[]
}

async function fetchSummary(): Promise<ParticipantsSummaryResponse> {
  try {
    const res = await fetch(`${API}/v1/admin/export/participants/summary`, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
      },
      cache: "no-store",
    })
    if (!res.ok) return { count: 0, avg_gse_delta: null, participants: [] }
    return res.json() as Promise<ParticipantsSummaryResponse>
  } catch {
    return { count: 0, avg_gse_delta: null, participants: [] }
  }
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function fmtDelta(delta: number | null) {
  if (delta === null) return "—"
  const sign = delta >= 0 ? "+" : ""
  return `${sign}${delta.toFixed(3)}`
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground text-xs">—</span>
  const positive = delta > 0
  const neutral = delta === 0
  const cls = positive
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : neutral
    ? "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
    : "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-mono font-medium ${cls}`}
    >
      {fmtDelta(delta)}
    </span>
  )
}

export default async function AuswertungPage() {
  const [summary, progress] = await Promise.all([fetchSummary(), fetchProgress()])

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Studienauswertung</h1>
        <p className="text-muted-foreground text-sm">
          {summary.count === 0
            ? "Noch keine Teilnehmenden haben die Studie abgeschlossen."
            : `${summary.count} Teilnehmende ${summary.count === 1 ? "hat" : "haben"} die Studie abgeschlossen.`}
        </p>
        <p className="text-xs text-muted-foreground/70">
          Nur Teilnehmende mit aktivem Studie-Schalter werden hier angezeigt.
        </p>
      </div>

      {/* Progress overview */}
      {progress.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Aktive Teilnehmende ({progress.length})
          </h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Pre-Fragebogen</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Fortschritt</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Post-Fragebogen</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {progress.map((p) => (
                  <tr key={p.user_id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.display_name}</td>
                    <td className="px-4 py-3">
                      {p.pre_survey_done
                        ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">ausgefüllt</span>
                        : <span className="text-xs text-muted-foreground">ausstehend</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${Math.min(100, (p.current_session / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.post_survey_done
                        ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">ausgefüllt</span>
                        : <span className="text-xs text-muted-foreground">ausstehend</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {p.current_session} / 10
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Aggregate cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Abgeschlossen</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{summary.count}</p>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ø GSE-Veränderung</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${
            summary.avg_gse_delta === null
              ? "text-muted-foreground"
              : summary.avg_gse_delta >= 0
              ? "text-emerald-500"
              : "text-red-500"
          }`}>
            {summary.avg_gse_delta === null ? "—" : fmtDelta(summary.avg_gse_delta)}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ø Sessions / TN</span>
          </div>
          <p className="text-2xl font-bold text-sky-500">
            {summary.count === 0
              ? "—"
              : (
                  summary.participants.reduce((sum, p) => sum + p.sessions_completed, 0) /
                  summary.count
                ).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Participant table */}
      {summary.count === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sobald Teilnehmende alle 10 Sessions und die Post-Befragung abgeschlossen haben,
            erscheinen sie hier.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Die Studie läuft — Daten werden erfasst, sobald jemand alle Schritte abgeschlossen hat.
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Abgeschlossene Teilnehmende</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-12">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Lernthema</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Abgeschlossen</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">GSE Δ</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.participants.map((p) => (
                  <tr key={p.user_id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {p.participant_id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.sessions_completed} Session{p.sessions_completed !== 1 ? "s" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">
                      {p.learning_topic ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {fmt(p.completed_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DeltaBadge delta={p.gse_delta} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <UserDownloadButtons
                          userId={p.user_id}
                          participantId={p.participant_id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Footer: bulk download */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          CSV enthält alle Rohdaten (GSE-Items, MSLQ-Subskalen, Deltas) — direkt für R/SPSS/Python nutzbar.
        </p>
        <DownloadAllCsvButton />
      </div>

    </div>
  )
}
