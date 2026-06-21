"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api, ApiError } from "@/lib/api"
import { CheckCircle2, Circle, ArrowRight, RotateCcw, Save, AlertTriangle } from "lucide-react"

interface JourneyState {
  state: "pre_pending" | "active" | "post_pending" | "completed"
  session_count: number
  pre_mslq_done: boolean
  pre_gse_done: boolean
  post_mslq_done: boolean
  post_gse_done: boolean
  pre_completed_at: string | null
  post_completed_at: string | null
}

const STATE_LABEL: Record<JourneyState["state"], string> = {
  pre_pending: "Warte auf Pre-Befragung",
  active: "Aktiv — Chat möglich",
  post_pending: "Warte auf Post-Befragung",
  completed: "Abgeschlossen",
}

const STATE_COLOR: Record<JourneyState["state"], string> = {
  pre_pending: "text-amber-500",
  active: "text-emerald-500",
  post_pending: "text-blue-500",
  completed: "text-muted-foreground",
}

function Step({ done, label, sub }: { done: boolean; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      {done
        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
      }
      <div>
        <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function JourneyTestClient() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadedKey, setLoadedKey] = useState(-1)
  const [journey, setJourney] = useState<JourneyState | null>(null)
  const [topic, setTopic] = useState("")
  const [savedTopic, setSavedTopic] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [savingTopic, setSavingTopic] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  // loading is derived — no synchronous setState in effect needed
  const loading = loadedKey !== refreshKey

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get<JourneyState>("/v1/survey/journey"),
      api.get<{ learning_topic: string | null }>("/v1/users/me"),
    ]).then(([j, u]) => {
      if (cancelled) return
      setJourney(j)
      setSavedTopic(u.learning_topic)
      setTopic(prev => prev || (u.learning_topic ?? ""))
      setError(null)
      setLoadedKey(refreshKey)
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof ApiError ? `Fehler ${err.status}` : "Laden fehlgeschlagen.")
        setLoadedKey(refreshKey)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api"

  async function handleReset() {
    if (!confirm("Journey-State zurücksetzen? Alle Fragebögen und Chat-Sessions werden gelöscht.")) return
    setResetting(true)
    setResetMsg(null)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/v1/survey/journey/reset`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setResetMsg("Reset erfolgreich.")
      setRefreshKey(k => k + 1)
    } catch {
      setError("Reset fehlgeschlagen.")
    } finally {
      setResetting(false)
    }
  }

  async function handleSaveTopic() {
    if (!topic.trim()) return
    setSavingTopic(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/v1/users/me/topic`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learning_topic: topic.trim() }),
      })
      if (!res.ok) throw new Error()
      setSavedTopic(topic.trim())
    } catch {
      setError("Thema konnte nicht gespeichert werden.")
    } finally {
      setSavingTopic(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Lade Journey-State…</div>

  return (
    <div className="p-8 max-w-2xl space-y-8">

      <div>
        <h1 className="text-xl font-bold">Journey testen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kompletten Studienflow durchlaufen — ohne Tageslimit, mit Reset.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {resetMsg && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          {resetMsg}
        </div>
      )}

      {/* Topic */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lernthema</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="z.B. Ich möchte meine Kommunikation verbessern"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSaveTopic}
            disabled={savingTopic || !topic.trim() || topic.trim() === savedTopic}
            className="flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" />
            {savingTopic ? "…" : "Speichern"}
          </button>
        </div>
        {savedTopic && (
          <p className="text-xs text-muted-foreground">
            Gespeichert: <span className="font-medium text-foreground">{savedTopic}</span>
          </p>
        )}
      </section>

      {/* Current state */}
      {journey && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Aktueller Stand</h2>
            <span className={`text-sm font-semibold ${STATE_COLOR[journey.state]}`}>
              {STATE_LABEL[journey.state]}
            </span>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <Step
              done={journey.pre_mslq_done && journey.pre_gse_done}
              label="Pre-Befragung (MSLQ + GSE)"
              sub={journey.pre_completed_at
                ? `Abgeschlossen ${new Date(journey.pre_completed_at).toLocaleString("de-DE")}`
                : undefined}
            />
            <Step
              done={journey.session_count > 0}
              label={`Chat-Sessions (${journey.session_count} / 10)`}
              sub={journey.session_count >= 10 ? "10 Sessions erreicht" : undefined}
            />
            <Step
              done={journey.post_mslq_done && journey.post_gse_done}
              label="Post-Befragung (MSLQ + GSE)"
              sub={journey.post_completed_at
                ? `Abgeschlossen ${new Date(journey.post_completed_at).toLocaleString("de-DE")}`
                : undefined}
            />
          </div>
        </section>
      )}

      {/* Flow links */}
      {journey && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Flow-Schritte</h2>
          <div className="space-y-2">

            <Link
              href="/survey/pre"
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                journey.state === "pre_pending"
                  ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span className="font-medium">Pre-Befragung ausfüllen</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/chat"
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                journey.state === "active"
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span className="font-medium">Chat starten</span>
              <span className="text-xs text-muted-foreground mr-2">{journey.session_count}/10 Sessions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/survey/post"
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                journey.state === "post_pending"
                  ? "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span className="font-medium">Post-Befragung ausfüllen</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </section>
      )}

      {/* Reset */}
      <section className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Journey zurücksetzen</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Löscht alle Fragebögen und Chat-Sessions — Thema bleibt erhalten.
            </p>
          </div>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 px-3 py-2 text-sm font-medium disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resetting ? "…" : "Reset"}
          </button>
        </div>
      </section>

    </div>
  )
}
