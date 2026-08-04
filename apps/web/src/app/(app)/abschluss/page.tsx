"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowUp, ArrowDown, Minus, Download } from "lucide-react"
import { LegalFooter } from "@/components/LegalFooter"
import { apiLogout, authFetch } from "@/lib/auth"

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserMe {
  username: string
  preferred_name: string | null
  learning_topic: string | null
}

interface GseRead {
  total_score: number
}

interface MslqRead {
  subscale_scores: Record<string, number>
}

interface SurveyResults {
  pre: { gse: GseRead | null; mslq: MslqRead | null }
  post: { gse: GseRead | null; mslq: MslqRead | null }
}

interface SessionItem {
  id: number
  session_number: number
  started_at: string
  ended_at: string | null
  message_count: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBSCALE_LABELS: [string, string][] = [
  ["self_efficacy", "Akademische Selbstwirksamkeit"],
  ["kdg", "Wissen-Handeln-Lücke"],
  ["elaboration", "Elaborationsstrategien"],
  ["metacognitive_sr", "Metakognitive Selbstregulation"],
  ["control_of_learning", "Kontrollüberzeugungen"],
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function barPct(score: number | undefined): number {
  if (score == null) return 0
  // Scale 1–7 → 0–100%
  return Math.round(((score - 1) / 6) * 100)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function gseInterpretation(diff: number): string {
  if (diff > 0.2) return "Deine Selbstwirksamkeit hat sich messbar gestärkt."
  if (diff < -0.2)
    return "Deine Selbstwirksamkeit hat sich leicht verändert — das ist normal in intensiven Lernprozessen."
  return "Deine Selbstwirksamkeit ist stabil geblieben."
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AbschlussPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserMe | null>(null)
  const [results, setResults] = useState<SurveyResults | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [meRes, surveyRes, sessionsRes] = await Promise.all([
          authFetch("/api/v1/users/me"),
          authFetch("/api/v1/survey/results"),
          authFetch("/api/v1/chat/sessions/summary"),
        ])
        if (meRes.ok) setUser((await meRes.json()) as UserMe)
        if (surveyRes.ok) setResults((await surveyRes.json()) as SurveyResults)
        if (sessionsRes.ok) setSessions((await sessionsRes.json()) as SessionItem[])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleLogout = useCallback(async () => {
    await apiLogout().catch(() => null)
    router.replace("/login")
  }, [router])

  const displayName = user?.preferred_name ?? user?.username ?? "…"
  const preGse = results?.pre?.gse?.total_score
  const postGse = results?.post?.gse?.total_score
  const gseDiff = preGse != null && postGse != null ? postGse - preGse : null
  const preMslq = results?.pre?.mslq?.subscale_scores
  const postMslq = results?.post?.mslq?.subscale_scores

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Lädt…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 space-y-12">

        {/* 1 — Personal header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Glückwunsch, {displayName}.</h1>
          <p className="text-muted-foreground leading-relaxed">
            Du hast 10 Sessions mit KAIA abgeschlossen.
            {user?.learning_topic && (
              <> Dein Lernthema war: <span className="text-foreground font-medium">{user.learning_topic}</span>.</>
            )}
          </p>
        </div>

        {/* 2 — GSE Vergleich */}
        {(preGse != null || postGse != null) && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Allgemeine Selbstwirksamkeitserwartung
              </h2>
              <p className="text-xs text-muted-foreground">
                GSE, Schwarzer &amp; Jerusalem, 1999
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Pre card */}
              <div className="flex-1 rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Vorher</p>
                <p className="text-4xl font-bold tabular-nums">
                  {preGse != null ? preGse.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">von 4</p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                {gseDiff != null && gseDiff > 0.05 && (
                  <ArrowUp className="h-5 w-5 text-emerald-500" />
                )}
                {gseDiff != null && gseDiff < -0.05 && (
                  <ArrowDown className="h-5 w-5 text-amber-500" />
                )}
                {(gseDiff == null || Math.abs(gseDiff) <= 0.05) && (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {gseDiff != null && (
                  <span className="text-xs font-medium tabular-nums">
                    {gseDiff > 0 ? "+" : ""}{gseDiff.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Post card */}
              <div className="flex-1 rounded-xl border border-border bg-muted/30 p-5 space-y-1 text-center">
                <p className="text-xs text-muted-foreground">Nachher</p>
                <p className="text-4xl font-bold tabular-nums">
                  {postGse != null ? postGse.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">von 4</p>
              </div>
            </div>

            {gseDiff != null && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {gseInterpretation(gseDiff)}{" "}
                Die Skala reicht von 1 (gering) bis 4 (hoch). Einzelne Messzeitpunkte sind
                Momentaufnahmen, keine Diagnosen.
              </p>
            )}
            {gseDiff == null && (
              <p className="text-sm text-muted-foreground">
                Die Skala reicht von 1 (gering) bis 4 (hoch). Einzelne Messzeitpunkte sind
                Momentaufnahmen, keine Diagnosen.
              </p>
            )}
          </section>
        )}

        {/* 3 — MSLQ Subskalen */}
        {(preMslq || postMslq) && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lernmotivation und -strategien
              </h2>
              <p className="text-xs text-muted-foreground">MSLQ, Pintrich et al., 1991</p>
            </div>

            <div className="space-y-4">
              {SUBSCALE_LABELS.map(([key, label]) => {
                const pre = preMslq?.[key]
                const post = postMslq?.[key]
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {pre != null ? pre.toFixed(1) : "—"} → {post != null ? post.toFixed(1) : "—"}
                      </span>
                    </div>
                    {/* Pre bar */}
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-foreground/70 transition-all"
                        style={{ width: `${barPct(pre)}%` }}
                      />
                    </div>
                    {/* Post bar */}
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-primary/60 transition-all"
                        style={{ width: `${barPct(post)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-foreground/70" />
                Vorher
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-primary/60" />
                Nachher
              </span>
              <span className="ml-auto">Skala 1–7. Höhere Werte = stärkere Ausprägung.</span>
            </div>
          </section>
        )}

        {/* 4 — Session-Übersicht */}
        {sessions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Deine Sessions
            </h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Session</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Datum</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Uhrzeit</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Nachrichten</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium tabular-nums">#{s.session_number}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(s.started_at)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtTime(s.started_at)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground text-xs">
                        {s.message_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 5 — Download */}
        <section className="space-y-3">
          <div className="relative group inline-block">
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground bg-muted/30 cursor-not-allowed opacity-60"
            >
              <Download className="h-4 w-4" />
              PDF herunterladen
            </button>
            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground/90 text-background text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Wird implementiert
            </span>
          </div>
        </section>

        {/* Local reflection textarea */}
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Eine letzte Sache — optional: Was nimmst du mit? Nicht für die Studie. Für dich.
          </p>
          <textarea
            rows={4}
            placeholder="Was hast du gelernt — wirklich gelernt?"
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
          />
          <p className="text-[11px] text-muted-foreground/40">
            Diese Notiz verlässt deinen Browser nicht — sie wird nicht gespeichert, nicht gesendet.
          </p>
        </section>

        {/* Logout */}
        <div className="space-y-3">
          <button
            onClick={() => void handleLogout()}
            className="w-full rounded-xl bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Fertig.
          </button>
          <p className="text-xs text-muted-foreground/50 text-center">
            Du kannst dich jederzeit wieder einloggen und deine Gesprächsprotokolle einsehen.
          </p>
        </div>

      </div>
      <LegalFooter />
    </div>
  )
}
