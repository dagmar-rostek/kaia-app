"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bot,
  User,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface PersonaStatus {
  codename: string
  status: "running" | "done" | "error"
  sessions_done: number
  error: string | null
}

interface RunStatus {
  run_id: string
  status: "running" | "done" | "error"
  started_at: string
  finished_at: string | null
  error: string | null
  personas: PersonaStatus[]
}

interface Exchange {
  user: string
  kaia: string
}

interface SessionResult {
  session_number: number
  opening: string
  exchanges: Exchange[]
  closing: string
  status: "done" | "error" | "running"
  error: string | null
}

interface PersonaResult {
  codename: string
  learning_topic: string
  sabotage_pattern: string
  user_id: number | null
  pre_survey: { gse_total: number; mslq_subscales: Record<string, number> } | null
  post_survey: { gse_total: number; mslq_subscales: Record<string, number> } | null
  sessions: SessionResult[]
  status: "running" | "done" | "error"
  error: string | null
}

interface RunResults {
  run_id: string
  status: "running" | "done" | "error"
  started_at: string
  finished_at: string | null
  error: string | null
  personas: PersonaResult[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SUBSCALE_LABEL: Record<string, string> = {
  intrinsic_motivation: "Intrinsische Motivation",
  self_efficacy: "Selbstwirksamkeit",
  test_anxiety: "Prüfungsangst",
  elaboration: "Elaboration",
}

function statusBadge(s: string) {
  if (s === "done") return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
      <CheckCircle2 className="h-3.5 w-3.5" /> Fertig
    </span>
  )
  if (s === "error") return (
    <span className="inline-flex items-center gap-1 text-xs text-red-500">
      <XCircle className="h-3.5 w-3.5" /> Fehler
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Läuft
    </span>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SessionCard({ s }: { s: SessionResult }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-md border border-border/60 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium">Session {s.session_number}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{s.exchanges.length} Nachrichten</span>
          {statusBadge(s.status)}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
          {s.error && (
            <div className="text-xs text-red-500 bg-red-500/10 rounded px-3 py-2">
              Fehler: {s.error}
            </div>
          )}

          {/* Opening */}
          {s.opening && (
            <div className="flex gap-2">
              <Bot className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{s.opening}</p>
            </div>
          )}

          {/* Exchanges */}
          {s.exchanges.map((ex, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex gap-2">
                <User className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80">{ex.user}</p>
              </div>
              {ex.kaia && (
                <div className="flex gap-2 ml-4">
                  <Bot className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{ex.kaia}</p>
                </div>
              )}
            </div>
          ))}

          {/* Closing */}
          {s.closing && (
            <div className="flex gap-2 border-t border-border/40 pt-3">
              <Bot className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">{s.closing}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SurveyScores({
  label,
  data,
}: {
  label: string
  data: { gse_total: number; mslq_subscales: Record<string, number> } | null
}) {
  if (!data) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs rounded px-2 py-0.5 bg-muted text-foreground">
          GSE {data.gse_total.toFixed(2)}
        </span>
        {Object.entries(data.mslq_subscales).map(([key, val]) => (
          <span key={key} className="text-xs rounded px-2 py-0.5 bg-muted text-muted-foreground" title={SUBSCALE_LABEL[key] ?? key}>
            {(SUBSCALE_LABEL[key] ?? key).slice(0, 12)} {Number(val).toFixed(1)}
          </span>
        ))}
      </div>
    </div>
  )
}

function PersonaCard({ p }: { p: PersonaResult }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="space-y-0.5">
          <p className="font-medium text-sm">{p.codename}</p>
          <p className="text-xs text-muted-foreground">{p.learning_topic}</p>
          <p className="text-xs text-muted-foreground/60 italic">{p.sabotage_pattern}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs text-muted-foreground">
            {p.sessions.filter(s => s.status === "done").length}/10 Sessions
          </span>
          {statusBadge(p.status)}
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/40">
          {p.error && (
            <div className="text-xs text-red-500 bg-red-500/10 rounded px-3 py-2 mt-4">
              Fehler: {p.error}
            </div>
          )}

          {/* Survey scores */}
          <div className="flex gap-6 pt-4">
            <SurveyScores label="Pre-Survey" data={p.pre_survey} />
            <SurveyScores label="Post-Survey" data={p.post_survey} />
          </div>

          {/* Sessions */}
          <div className="space-y-2">
            {p.sessions.map(s => (
              <SessionCard key={s.session_number} s={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const [runId, setRunId] = useState<string | null>(null)
  const [status, setStatus] = useState<RunStatus | null>(null)
  const [results, setResults] = useState<RunResults | null>(null)
  const [starting, setStarting] = useState(false)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll status while run is active
  useEffect(() => {
    if (!runId || status?.status !== "running") {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/admin/api/simulation/${runId}/status`)
        if (!res.ok) return
        const data = await res.json() as RunStatus
        setStatus(data)
      } catch {
        // ignore transient errors
      }
    }, 6000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [runId, status?.status])

  // Auto-load results when run finishes
  useEffect(() => {
    if (status?.status !== "done" || results) return
    void loadResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status])

  async function startRun() {
    setStarting(true)
    setError(null)
    setStatus(null)
    setResults(null)
    setRunId(null)
    try {
      const res = await fetch("/admin/api/simulation/run", { method: "POST" })
      const data = await res.json() as { run_id?: string; error?: string }
      if (!res.ok || !data.run_id) throw new Error(data.error ?? "Start fehlgeschlagen")
      setRunId(data.run_id)
      // Fetch initial status immediately
      const sRes = await fetch(`/admin/api/simulation/${data.run_id}/status`)
      if (sRes.ok) setStatus(await sRes.json() as RunStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setStarting(false)
    }
  }

  async function loadResults() {
    if (!runId) return
    setLoadingResults(true)
    try {
      const res = await fetch(`/admin/api/simulation/${runId}/results`)
      if (!res.ok) throw new Error("Ergebnisse konnten nicht geladen werden.")
      setResults(await res.json() as RunResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ladefehler")
    } finally {
      setLoadingResults(false)
    }
  }

  const running = status?.status === "running"
  const done = status?.status === "done"

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Crash-Persona Simulation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          10 adversarielle Personas × 10 Sessions — echte LLM-Calls gegen den KAIA-API-Key.
          Ergebnisse bleiben in der DB mit <code className="text-xs bg-muted px-1 rounded">is_simulation=true</code>.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Start */}
      <div className="flex items-center gap-4">
        <button
          onClick={startRun}
          disabled={starting || running}
          className="flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity"
        >
          {starting || running
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Play className="h-4 w-4" />
          }
          {starting ? "Starte…" : running ? "Läuft…" : "Simulation starten"}
        </button>
        {runId && (
          <span className="text-xs text-muted-foreground font-mono">{runId}</span>
        )}
      </div>

      {/* Run status overview */}
      {status && (
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fortschritt</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Gestartet {formatTime(status.started_at)}
              {status.finished_at && ` · Beendet ${formatTime(status.finished_at)}`}
            </div>
            {statusBadge(status.status)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {status.personas.map(p => (
              <div
                key={p.codename}
                className={`rounded-lg border p-3 space-y-1.5 ${
                  p.status === "done" ? "border-emerald-500/30 bg-emerald-500/5"
                  : p.status === "error" ? "border-red-500/30 bg-red-500/5"
                  : "border-border bg-muted/10"
                }`}
              >
                <p className="text-xs font-mono font-medium leading-tight">
                  {p.codename.split("_").slice(0, 2).join("_")}
                </p>
                <p className="text-xs text-muted-foreground">{p.sessions_done}/10</p>
                {statusBadge(p.status)}
                {p.error && (
                  <p className="text-xs text-red-400 truncate" title={p.error}>{p.error}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Load results button (if done but not yet loaded) */}
      {done && !results && !loadingResults && (
        <button
          onClick={loadResults}
          className="text-sm underline text-muted-foreground hover:text-foreground"
        >
          Ergebnisse laden
        </button>
      )}
      {loadingResults && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Lade Transkripte…
        </div>
      )}

      {/* Full results */}
      {results && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Auswertung — {results.personas.length} Personas
          </h2>
          <div className="space-y-3">
            {results.personas.map(p => (
              <PersonaCard key={p.codename} p={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
