"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, ArrowRight, RotateCcw, Save, AlertTriangle, Bot, FastForward, PlusCircle, BarChart2, Layers } from "lucide-react"
import { tokenStore } from "@/lib/auth"
import { setUserModel } from "../users/actions"

const MODELS = [
  { id: "", label: "System-Standard" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "mistral-large-latest", label: "Mistral Large" },
  { id: "mistral-small-latest", label: "Mistral Small" },
]

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
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadedKey, setLoadedKey] = useState(-1)
  const [journey, setJourney] = useState<JourneyState | null>(null)
  const [topic, setTopic] = useState("")
  const [savedTopic, setSavedTopic] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)
  const [savingTopic, setSavingTopic] = useState(false)
  const [skippingSurvey, setSkippingSurvey] = useState(false)
  const [seedingSessions, setSeedingSessions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMsg, setResetMsg] = useState<string | null>(null)
  const [testUserId, setTestUserId] = useState<number | null>(null)
  const [liveModel, setLiveModel] = useState<string | null>(null)
  const [modelPending, startModelTransition] = useTransition()

  const loading = loadedKey !== refreshKey
  const authHeader = useMemo(
    (): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  )

  // Fetch admin test token — same pattern as chat-test
  useEffect(() => {
    let cancelled = false
    fetch("/admin/api/test-token", { method: "POST" })
      .then(async res => {
        if (!res.ok) throw new Error(`Token-Fehler (${res.status})`)
        return res.json() as Promise<{ access_token: string }>
      })
      .then(data => {
        if (!cancelled) {
          setToken(data.access_token)
          // Seed tokenStore so (app) routes (survey) accept this token without cookie refresh
          tokenStore.set(data.access_token)
        }
      })
      .catch(e => { if (!cancelled) setTokenError(e instanceof Error ? e.message : "Token-Fehler") })
    return () => { cancelled = true }
  }, [])

  // Load journey state + user topic once token is available
  useEffect(() => {
    if (!token) return
    let cancelled = false
    Promise.all([
      fetch("/api/v1/survey/journey", { headers: authHeader }),
      fetch("/api/v1/users/me", { headers: authHeader }),
    ]).then(async ([jRes, uRes]) => {
      if (cancelled) return
      if (!jRes.ok || !uRes.ok) {
        setError("Ladefehler beim Laden des Journey-States.")
        setLoadedKey(refreshKey)
        return
      }
      const j = await jRes.json() as JourneyState
      const u = await uRes.json() as { id: number; learning_topic: string | null; kaia_model: string | null }
      setJourney(j)
      setTestUserId(u.id)
      setLiveModel(u.kaia_model)
      setSavedTopic(u.learning_topic)
      setTopic(prev => prev || (u.learning_topic ?? ""))
      setError(null)
      setLoadedKey(refreshKey)
    }).catch(() => {
      if (!cancelled) {
        setError("Laden fehlgeschlagen.")
        setLoadedKey(refreshKey)
      }
    })
    return () => { cancelled = true }
  }, [token, refreshKey, authHeader])

  async function handleReset() {
    if (!confirm("Journey-State zurücksetzen? Alle Fragebögen und Chat-Sessions werden gelöscht.")) return
    setResetting(true)
    setResetMsg(null)
    setError(null)
    try {
      const res = await fetch("/api/v1/survey/journey/reset", { method: "DELETE", headers: authHeader })
      if (!res.ok) throw new Error()
      setResetMsg("Reset erfolgreich.")
      setRefreshKey(k => k + 1)
    } catch {
      setError("Reset fehlgeschlagen.")
    } finally {
      setResetting(false)
    }
  }

  async function handleSkipSurvey(type: "pre" | "post") {
    setSkippingSurvey(true)
    setError(null)
    try {
      // MSLQ dummy: all items at neutral value 4 (scale 1–7)
      const mslqItems: Record<string, number> = {}
      for (const num of [5, 6, 12, 15, 20, 21, 29, 31, 101, 102, 103, 104, 105, 53, 62, 64, 67, 69, 81, 33, 36, 41, 44, 54, 55, 56, 57, 61, 76, 78, 79, 2, 9, 18, 25]) {
        mslqItems[String(num)] = 4
      }
      const [mslqRes, gseRes] = await Promise.all([
        fetch("/api/v1/survey/mslq", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ measurement_type: type, items: mslqItems }),
        }),
        fetch("/api/v1/survey/gse", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ measurement_type: type, items: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2] }),
        }),
      ])
      if (!mslqRes.ok && mslqRes.status !== 409) throw new Error("MSLQ fehlgeschlagen")
      if (!gseRes.ok && gseRes.status !== 409) throw new Error("GSE fehlgeschlagen")
      setResetMsg(`${type === "pre" ? "Pre" : "Post"}-Befragung übersprungen.`)
      setRefreshKey(k => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Überspringen.")
    } finally {
      setSkippingSurvey(false)
    }
  }

  async function handleSeedSessions() {
    if (!testUserId) return
    setSeedingSessions(true)
    setError(null)
    try {
      const needed = Math.max(0, 10 - (journey?.session_count ?? 0))
      if (needed === 0) { setResetMsg("Bereits 10+ Sessions vorhanden."); return }
      const res = await fetch(
        `/admin/api/users/${testUserId}/seed-sessions?count=${needed}`,
        { method: "POST" }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResetMsg(`${needed} Test-Session${needed !== 1 ? "s" : ""} angelegt.`)
      setRefreshKey(k => k + 1)
    } catch {
      setError("Seed-Sessions fehlgeschlagen.")
    } finally {
      setSeedingSessions(false)
    }
  }

  function handleSwitchModel(modelId: string) {
    if (testUserId === null) return
    setLiveModel(modelId || null)
    startModelTransition(async () => {
      await setUserModel(testUserId, modelId || null)
    })
  }

  async function handleSaveTopic() {
    if (!topic.trim()) return
    setSavingTopic(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/users/me/topic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
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

  if (tokenError) return (
    <div className="p-8 flex items-center gap-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {tokenError}
    </div>
  )
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

      {/* Model switcher */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">KI-Modell</h2>
        <div className="flex items-center gap-3">
          <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={liveModel ?? ""}
            onChange={(e) => handleSwitchModel(e.target.value)}
            disabled={modelPending || testUserId === null}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {modelPending && <span className="text-xs text-muted-foreground">Speichert…</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          Aktiv: <span className="font-medium text-foreground">{liveModel ?? "System-Standard"}</span>
        </p>
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

            {/* Pre-Befragung */}
            <div className="flex gap-2">
              <button
                onClick={() => { if (token) tokenStore.set(token); router.push("/survey/pre") }}
                className={`flex-1 flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  journey.state === "pre_pending"
                    ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <span className="font-medium">Pre-Befragung ausfüllen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSkipSurvey("pre")}
                disabled={skippingSurvey || (journey.pre_mslq_done && journey.pre_gse_done)}
                title="Fragebogen mit Testdaten überspringen"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 transition-colors"
              >
                <FastForward className="h-3.5 w-3.5" />
                {skippingSurvey ? "…" : "Skip"}
              </button>
            </div>

            {/* Chat */}
            <div className="flex gap-2">
              <button
                onClick={() => { if (token) tokenStore.set(token); router.push("/chat") }}
                className={`flex-1 flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  journey.state === "active"
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <span className="font-medium">Chat fortsetzen</span>
                <span className="text-xs text-muted-foreground mr-2">{journey.session_count}/10 Sessions</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (token) tokenStore.set(token); router.push("/chat?force_new=true") }}
                title="Neue Session erzwingen — aktive Session wird beendet"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Neu
              </button>
              <button
                onClick={handleSeedSessions}
                disabled={seedingSessions || journey.session_count >= 10}
                title="10 leere Test-Sessions direkt in DB anlegen — überspringt echtes Chatten"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 transition-colors"
              >
                <Layers className="h-3.5 w-3.5" />
                {seedingSessions ? "…" : "Seed ×10"}
              </button>
            </div>

            {/* Post-Befragung */}
            <div className="flex gap-2">
              <button
                onClick={() => { if (token) tokenStore.set(token); router.push("/survey/post") }}
                className={`flex-1 flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  journey.state === "post_pending"
                    ? "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <span className="font-medium">Post-Befragung ausfüllen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSkipSurvey("post")}
                disabled={skippingSurvey || (journey.post_mslq_done && journey.post_gse_done)}
                title="Fragebogen mit Testdaten überspringen"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 transition-colors"
              >
                <FastForward className="h-3.5 w-3.5" />
                {skippingSurvey ? "…" : "Skip"}
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Views */}
      {journey && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ansichten prüfen</h2>
          <div className="space-y-2">
            <button
              onClick={() => { if (token) tokenStore.set(token); router.push("/abschluss") }}
              className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-foreground">Abschluss-Seite</p>
                <p className="text-xs mt-0.5">Teilnehmer-Ansicht — GSE/MSLQ-Vergleich, Session-Tabelle</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
            <a
              href="/admin/auswertung"
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <div className="text-left">
                <p className="font-medium text-foreground">Studienauswertung</p>
                <p className="text-xs mt-0.5">Forscher-Ansicht — Abgeschlossene Teilnehmende, CSV-Export</p>
              </div>
              <BarChart2 className="h-4 w-4 shrink-0" />
            </a>
            <p className="text-xs text-muted-foreground/60 px-1">
              Hinweis: Der Test-Account (is_simulation=true) erscheint nicht in der Studienauswertung —
              nur echte freigeschaltete Teilnehmende zählen dort.
            </p>
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
