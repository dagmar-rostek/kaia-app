"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Play,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  X,
  RotateCcw,
  Flame,
  Shield,
  ShieldAlert,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface EvalRun {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  triggered_by: string
  evaluator_model: string
  simulation_run_id: string | null
  total_cost_eur: number | null
  started_at: string
  finished_at: string | null
  error: string | null
  config: Record<string, unknown>
}

interface HeatmapCell {
  persona_id: string
  session_number: number
  score_pct: number | null
  flagged_metrics: string[]
  has_error: boolean
}

interface HeatmapPersona {
  persona_id: string
  learning_topic: string | null
  sabotage_pattern: string | null
  sessions: HeatmapCell[]
  avg_score_pct: number | null
}

interface HeatmapData {
  run_id: string
  status: string
  evaluator_model: string
  kaia_chat_model?: string
  personas: HeatmapPersona[]
  weakest_persona_id: string | null
  weakest_session_number: number | null
  weakest_score_pct: number | null
  system_avg_pct: number | null
  error_cell_count: number
  column_averages: Record<string, number | null>
}

interface MetricResult {
  id: number
  persona_id: string
  session_number: number
  metric_key: string
  score: number | null
  reasoning: string | null
  flagged: boolean
  crisis_triggered: boolean | null
  override_score: number | null
  override_reason: string | null
}

interface SessionDetail {
  run_id: string
  persona_id: string
  session_number: number
  results: MetricResult[]
  score_total_pct: number | null
  transcript: {
    messages: Array<{ role: string; source: string; content: string; turn: number }>
    flagged_exchanges: Array<{ turn: number; reason: string }>
    overall_finding: string | null
  } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const METRIC_LABELS: Record<string, string> = {
  m1_socratic_purity: "M1 — Sokratische Reinheit",
  m2_mission_adherence: "M2 — Mission-Adherenz",
  m3_persona_responsiveness: "M3 — Persona-Responsivität",
  m4_question_depth: "M4 — Fragetiefe",
  m5_sequence_coherence: "M5 — Sequenz-Kohärenz",
  m6_autonomy_preservation: "M6 — Autonomie-Wahrung",
  m7_crisis_detection: "M7 — Crisis Detection ⚠",
}

const SESSION_NAMES = [
  "", "Ankern", "Kartieren", "Erden", "Ausprobieren", "Spiegel",
  "Reiben", "Schärfen", "Übergeben", "Konsolidieren", "Loslassen",
]

function scoreColor(pct: number | null, hasError: boolean): string {
  if (hasError) return "bg-zinc-700 text-zinc-400"
  if (pct === null) return "bg-zinc-800 text-zinc-500"
  if (pct >= 84) return "bg-green-600 text-white"
  if (pct >= 67) return "bg-yellow-500 text-zinc-900"
  if (pct >= 34) return "bg-orange-500 text-white"
  return "bg-red-600 text-white"
}

function scoreBg(pct: number | null, hasError: boolean): string {
  if (hasError) return "bg-zinc-700"
  if (pct === null) return "bg-zinc-800"
  if (pct >= 84) return "bg-green-600"
  if (pct >= 67) return "bg-yellow-500"
  if (pct >= 34) return "bg-orange-500"
  return "bg-red-600"
}

function metricScore(score: number | null, override: number | null): number | null {
  return override ?? score
}

function metricScoreColor(s: number | null): string {
  if (s === null) return "text-zinc-400"
  if (s >= 3) return "text-green-400"
  if (s >= 2) return "text-yellow-400"
  if (s >= 1) return "text-orange-400"
  return "text-red-400"
}

const ALL_PERSONAS = [
  { id: "P01", name: "Markus — Schweiger" },
  { id: "P02", name: "Sandra — Verweigerer" },
  { id: "P03", name: "Petra — Therapeuten-Sucher" },
  { id: "P04", name: "Jonas — Krisenfall ⚠" },
  { id: "P05", name: "Kevin — Jailbreaker" },
  { id: "P06", name: "Claudia — Vielredner" },
  { id: "P07", name: "Thomas — Kontextwechsler" },
  { id: "P08", name: "Franziska — Meta-Saboteur" },
  { id: "P09", name: "Lena — Sozial Erwünschte" },
  { id: "P10", name: "Michael — Experten-Verweigerer" },
]

// Kosten in EUR pro Turn, kalibriert auf Messwerte (Stand Juli 2026, inkl. KAIA + Simulator + Judge):
// Haiku: ∅ zweier Messungen: €0.52/(1P×3S×5T)=0.035, €1.21/(2P×3S×5T)=0.040 → 0.040/Turn
// Sonnet: €1.30 / (1P × 3S × 5T) = €0.087/Turn (gemessen)
// GPT-4o, Mistral: Hochrechnung aus API-Preisseiten, noch nicht empirisch validiert
const MODEL_COST_PER_TURN: Record<string, number> = {
  "claude-haiku-4-5-20251001": 0.040,
  "claude-sonnet-4-6": 0.087,
  "gpt-4o": 0.21,
  "gpt-4o-mini": 0.012,
  "mistral-large-latest": 0.19,
  "mistral-small-latest": 0.038,
}

function estimateCost(personas: number, sessions: number, turns: number, model: string): string {
  const costPerTurn = MODEL_COST_PER_TURN[model] ?? MODEL_COST_PER_TURN["claude-haiku-4-5-20251001"]
  const base = personas * sessions * turns * costPerTurn
  const note = model && !["claude-haiku-4-5-20251001", "claude-sonnet-4-6"].includes(model) ? " *" : ""
  return `€${base.toFixed(2)}–${(base * 1.3).toFixed(2)}${note}`
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

interface AvailableModel {
  id: string
  label: string
  provider: string
}

function modelShortLabel(modelId: string): string {
  if (modelId.includes("haiku")) return "Haiku"
  if (modelId.includes("sonnet")) return "Sonnet"
  if (modelId.includes("gpt-4o-mini")) return "GPT-4o mini"
  if (modelId.includes("gpt-4o")) return "GPT-4o"
  if (modelId.includes("mistral-large")) return "Mistral L"
  if (modelId.includes("mistral-small")) return "Mistral S"
  return modelId
}

function modelBadgeClass(modelId: string): string {
  if (modelId.includes("haiku")) return "bg-orange-600/20 text-orange-300 border border-orange-600/30"
  if (modelId.includes("sonnet")) return "bg-blue-600/20 text-blue-300 border border-blue-600/30"
  if (modelId.includes("gpt")) return "bg-green-600/20 text-green-300 border border-green-600/30"
  if (modelId.includes("mistral")) return "bg-purple-600/20 text-purple-300 border border-purple-600/30"
  return "bg-zinc-600/20 text-zinc-300 border border-zinc-600/30"
}

function kaiaChatModelLabel(run: EvalRun): string {
  return modelShortLabel((run.config?.kaia_chat_model as string | undefined) ?? "claude-sonnet-4-6")
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function EvalPage() {
  const [runs, setRuns] = useState<EvalRun[]>([])
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ persona: string; session: number } | null>(null)
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [retesting, setRetesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evalLog, setEvalLog] = useState<Array<{ ts: string; level: string; msg: string }>>([])
  const [showLog, setShowLog] = useState(true)
  const logEndRef = useRef<HTMLDivElement | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Start-Modal State ──
  const [showStartModal, setShowStartModal] = useState(false)
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(["P01"])
  const [turnsPerSession, setTurnsPerSession] = useState(5)
  const [maxSessions, setMaxSessions] = useState(10)
  const [kaiaModel, setKaiaModel] = useState("")  // "" = aktuelles System-Modell
  const [compareRunId, setCompareRunId] = useState<string | null>(null)
  const [compareHeatmap, setCompareHeatmap] = useState<HeatmapData | null>(null)

  // ── Settings State (live model switcher) ──
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([])
  const [liveModel, setLiveModel] = useState<string>("")
  const [switchingModel, setSwitchingModel] = useState(false)

  const loadRuns = useCallback(async () => {
    try {
      const res = await fetch("/admin/api/eval/runs")
      if (res.ok) {
        const data: EvalRun[] = await res.json()
        setRuns(data.sort((a, b) => b.started_at.localeCompare(a.started_at)))
      }
    } catch {
      // silent
    }
  }, [])

  const loadHeatmap = useCallback(async (runId: string) => {
    try {
      const res = await fetch(`/admin/api/eval/runs/${runId}/heatmap`)
      if (res.ok) {
        setHeatmap(await res.json())
      }
    } catch {
      // silent
    }
  }, [])

  const loadLog = useCallback(async (runId: string) => {
    try {
      const res = await fetch(`/admin/api/eval/runs/${runId}/log`)
      if (res.ok) setEvalLog(await res.json())
    } catch {
      // silent — log is best-effort
    }
  }, [])

  const loadCompareHeatmap = useCallback(async (runId: string) => {
    try {
      const res = await fetch(`/admin/api/eval/runs/${runId}/heatmap`)
      if (res.ok) setCompareHeatmap(await res.json())
    } catch {
      // silent
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/admin/api/settings")
      if (res.ok) {
        const data = await res.json()
        setLiveModel(data.kaia_chat_model ?? "")
        setAvailableModels(data.available_models ?? [])
      }
    } catch {
      // silent
    }
  }, [])

  const switchLiveModel = async (modelId: string) => {
    setSwitchingModel(true)
    try {
      const res = await fetch("/admin/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kaia_chat_model: modelId }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiveModel(data.kaia_chat_model ?? modelId)
      }
    } catch {
      // silent
    } finally {
      setSwitchingModel(false)
    }
  }

  const loadDetail = useCallback(async (runId: string, personaId: string, session: number) => {
    setDetailLoading(true)
    setDetail(null)
    try {
      const res = await fetch(
        `/admin/api/eval/runs/${runId}/sessions/${personaId}/${session}`
      )
      if (res.ok) setDetail(await res.json())
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Scroll log to bottom when new entries arrive
  useEffect(() => {
    if (showLog) logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [evalLog, showLog])

  // Poll while a run is active
  useEffect(() => {
    const activeRun = runs.find((r) => r.status === "running" || r.status === "pending")
    if (!activeRun || !selectedRun) return
    pollRef.current = setTimeout(async () => {
      await loadRuns()
      if (selectedRun) {
        await loadHeatmap(selectedRun)
        await loadLog(selectedRun)
      }
    }, 3000)
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [runs, selectedRun, loadRuns, loadHeatmap, loadLog])

  useEffect(() => {
    void loadRuns() // eslint-disable-line react-hooks/set-state-in-effect
    void loadSettings() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadRuns, loadSettings])

  useEffect(() => {
    if (selectedRun) {
      void loadHeatmap(selectedRun) // eslint-disable-line react-hooks/set-state-in-effect
      void loadLog(selectedRun) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [selectedRun, loadHeatmap, loadLog])

  useEffect(() => {
    if (selectedCell && selectedRun) {
      void loadDetail(selectedRun, selectedCell.persona, selectedCell.session) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [selectedCell, selectedRun, loadDetail])

  useEffect(() => {
    if (compareRunId) {
      void loadCompareHeatmap(compareRunId) // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setCompareHeatmap(null)
    }
  }, [compareRunId, loadCompareHeatmap])

  const startEval = async () => {
    setStarting(true)
    setShowStartModal(false)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        evaluator_model: "claude-haiku-4-5-20251001",
        turns_per_session: turnsPerSession,
        kaia_model: kaiaModel,
      }
      if (selectedPersonas.length < 10) body.persona_ids = selectedPersonas
      if (maxSessions < 10) body.session_numbers = Array.from({ length: maxSessions }, (_, i) => i + 1)
      const res = await fetch("/admin/api/eval/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.detail || "Start fehlgeschlagen")
        return
      }
      const data = await res.json()
      await loadRuns()
      setSelectedRun(data.run_id)
    } catch (e) {
      setError(String(e))
    } finally {
      setStarting(false)
    }
  }

  const startRetest = async () => {
    if (!selectedRun || !selectedCell) return
    setRetesting(true)
    try {
      const res = await fetch(`/admin/api/eval/runs/${selectedRun}/retest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_id: selectedCell.persona,
          session_number: selectedCell.session,
          evaluator_model: "claude-haiku-4-5-20251001",
        }),
      })
      if (res.ok) {
        await loadRuns()
        setSelectedCell(null)
      }
    } finally {
      setRetesting(false)
    }
  }

  const stopEval = async () => {
    if (!selectedRun) return
    setStopping(true)
    setError(null)
    try {
      const res = await fetch(`/admin/api/eval/runs/${selectedRun}/cancel`, {
        method: "POST",
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.detail || "Stopp fehlgeschlagen")
      } else {
        await loadRuns()
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setStopping(false)
    }
  }

  const currentRun = runs.find((r) => r.id === selectedRun)
  const isRunning = currentRun?.status === "running" || currentRun?.status === "pending"

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eval-Matrix</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            10 Personas × 10 Sessions — LLM-as-Judge (M1–M7)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && selectedRun && (
            <button
              onClick={stopEval}
              disabled={stopping}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600
                         disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium
                         transition-colors"
            >
              {stopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              Stopp
            </button>
          )}
        <button
          onClick={() => setShowStartModal(true)}
          disabled={starting || isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium
                     transition-colors"
        >
          {starting || isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isRunning ? "Läuft…" : "Neuen Eval starten"}
        </button>
        </div>
      </div>

      {/* Live-Model-Switcher */}
      {availableModels.length > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-zinc-400 mb-0.5">KAIA Live-Modell (Chat + Eval-Standard)</p>
            <div className="flex items-center gap-2 flex-wrap">
              {availableModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchLiveModel(m.id)}
                  disabled={switchingModel}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    liveModel === m.id
                      ? modelBadgeClass(m.id) + " opacity-100"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                  } disabled:opacity-50`}
                >
                  {m.label}
                  {liveModel === m.id && " ✓"}
                </button>
              ))}
            </div>
          </div>
          {switchingModel && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
          {liveModel && (
            <div className={`text-xs px-2 py-1 rounded font-mono ${modelBadgeClass(liveModel)}`}>
              {modelShortLabel(liveModel)}
            </div>
          )}
        </div>
      )}

      {/* Start-Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Eval-Run konfigurieren</h2>
              <button onClick={() => setShowStartModal(false)}>
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Persona selection */}
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-2">
                  Personas auswählen ({selectedPersonas.length}/10)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_PERSONAS.map((p) => {
                    const active = selectedPersonas.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          setSelectedPersonas((prev) =>
                            active ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          )
                        }
                        className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          active
                            ? "bg-violet-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        <span className="font-mono font-bold mr-1">{p.id}</span>
                        <span className="opacity-75">{p.name.replace(p.id + " ", "").replace(/^— /, "")}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setSelectedPersonas(ALL_PERSONAS.map((p) => p.id))}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setSelectedPersonas([])}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Keine
                  </button>
                </div>
              </div>

              {/* Turns per session */}
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-2">
                  Turns pro Session: <span className="text-white">{turnsPerSession}</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={turnsPerSession}
                  onChange={(e) => setTurnsPerSession(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                  <span>3 (schnell)</span>
                  <span>10 (vollständig)</span>
                </div>
              </div>

              {/* Sessions per persona */}
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-2">
                  Sessions pro Persona: <span className="text-white">{maxSessions}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={maxSessions}
                  onChange={(e) => setMaxSessions(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                  <span>1 (S1 only)</span>
                  <span>10 (vollständig)</span>
                </div>
              </div>

              {/* KAIA Model selection */}
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-2">
                  KAIA-Modell (wird evaluiert)
                </label>
                <select
                  value={kaiaModel}
                  onChange={(e) => setKaiaModel(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">System-Modell ({liveModel ? modelShortLabel(liveModel) : "Sonnet"})</option>
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                {kaiaModel && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Verwendet {modelShortLabel(kaiaModel)} als KAIA — vergleichbar via Compare-Button nach Run.
                  </p>
                )}
              </div>

              {/* Cost estimate */}
              <div className="bg-zinc-800 rounded-lg p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Geschätzte Kosten:</span>
                  <span className="font-medium text-zinc-200">
                    {selectedPersonas.length > 0
                      ? estimateCost(selectedPersonas.length, maxSessions, turnsPerSession, kaiaModel || liveModel || "claude-haiku-4-5-20251001")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-400">Runs:</span>
                  <span className="text-zinc-300">
                    {selectedPersonas.length} Personas × {maxSessions} Sessions × {turnsPerSession} Turns
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-400">Dauer ca.:</span>
                  <span className="text-zinc-300">
                    {Math.ceil(selectedPersonas.length * maxSessions * 1.5)} min
                  </span>
                </div>
                {kaiaModel && !["claude-haiku-4-5-20251001", "claude-sonnet-4-6"].includes(kaiaModel) && (
                  <p className="text-zinc-500 mt-2">* GPT-4o/Mistral: Hochrechnung, noch nicht empirisch validiert.</p>
                )}
                <p className="text-zinc-600 mt-1">Kalibriert: Haiku €0.035/Turn, Sonnet €0.087/Turn (gemessen).</p>
              </div>

              <button
                onClick={startEval}
                disabled={selectedPersonas.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600
                           hover:bg-violet-500 disabled:opacity-40 rounded-lg text-sm font-medium
                           transition-colors"
              >
                <Play className="w-4 h-4" />
                Eval starten
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[260px_1fr] gap-6">
        {/* Run list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Eval-Runs
          </p>
          {runs.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <p className="text-sm text-zinc-400 font-medium">Noch kein Eval-Run</p>
              <p className="text-xs text-zinc-600 leading-snug">
                Die Eval-Matrix ist unabhängig von der Simulation. Klicke{" "}
                <span className="text-violet-400">&quot;Neuen Eval starten&quot;</span>{" "}
                oben rechts — der Eval führt die Personas gegen KAIA und bewertet jede Session
                mit LLM-as-Judge (M1–M7).
              </p>
            </div>
          )}
          {runs.map((run) => (
            <div key={run.id}>
              <button
                onClick={() => setSelectedRun(run.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedRun === run.id
                    ? "bg-zinc-800 border-violet-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400 truncate">{run.id}</span>
                  <RunStatusBadge status={run.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  {new Date(run.started_at).toLocaleString("de-DE", {
                    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                  })}
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    kaiaChatModelLabel(run) === "Haiku"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {kaiaChatModelLabel(run)}
                  </span>
                  {run.total_cost_eur != null && (
                    <span className="text-zinc-400">€{run.total_cost_eur.toFixed(3)}</span>
                  )}
                </div>
                {(run.config?.persona_ids as string[] | undefined)?.length && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(run.config.persona_ids as string[]).map((p) => (
                      <span key={p} className="text-[10px] bg-zinc-700 text-zinc-400 px-1 rounded">{p}</span>
                    ))}
                  </div>
                )}
                {run.error && (
                  <p className="text-xs text-red-400 mt-1 truncate">{run.error}</p>
                )}
              </button>
              <button
                onClick={() => setCompareRunId(compareRunId === run.id ? null : run.id)}
                className={`w-full text-[10px] py-0.5 rounded mt-0.5 transition-colors ${
                  compareRunId === run.id
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {compareRunId === run.id ? "⊖ Vergleich entfernen" : "⊕ Als Vergleich setzen"}
              </button>
            </div>
          ))}
        </div>

        {/* Main area */}
        <div>
          {!selectedRun ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-zinc-600 text-sm">
              <span>Wähle einen Eval-Run aus der Liste</span>
              <span className="text-xs text-zinc-700">
                oder starte einen neuen Eval oben rechts
              </span>
            </div>
          ) : isRunning ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-400 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">Eval läuft — aktualisiert alle 3 Sekunden</p>
                  {heatmap && heatmap.personas.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {heatmap.personas.filter(p => p.sessions.some(s => s.score_pct !== null)).length} Personas mit Ergebnissen
                    </p>
                  )}
                </div>
              </div>
              {/* Live Log */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                  <p className="text-xs font-medium text-zinc-400">Live-Log</p>
                  <button
                    onClick={() => setShowLog((v) => !v)}
                    className="text-xs text-zinc-600 hover:text-zinc-400"
                  >
                    {showLog ? "▲ einklappen" : "▼ aufklappen"}
                  </button>
                </div>
                {showLog && (
                  <div className="h-72 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
                    {evalLog.length === 0 ? (
                      <p className="text-zinc-600">Warte auf ersten Log-Eintrag…</p>
                    ) : (
                      evalLog.map((entry, i) => (
                        <div
                          key={i}
                          className={`leading-snug ${
                            entry.level === "error"
                              ? "text-red-400"
                              : entry.level === "warning"
                              ? "text-yellow-400"
                              : "text-zinc-400"
                          }`}
                        >
                          <span className="text-zinc-600">{entry.ts.slice(11, 19)}</span>{" "}
                          {entry.msg}
                        </div>
                      ))
                    )}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>
            </div>
          ) : !heatmap || heatmap.personas.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
              Keine Heatmap-Daten für diesen Run.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vergleich-Banner */}
              {compareHeatmap && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
                  <span className="text-amber-400 font-medium">Vergleich aktiv:</span>
                  <span className="font-mono text-zinc-400 truncate">{compareRunId}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    (compareHeatmap.kaia_chat_model ?? "").includes("haiku")
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {(compareHeatmap.kaia_chat_model ?? "").includes("haiku") ? "Haiku" : "Sonnet"}
                  </span>
                  <button
                    onClick={() => { setCompareRunId(null); setCompareHeatmap(null) }}
                    className="ml-auto text-zinc-500 hover:text-zinc-300"
                  >✕</button>
                </div>
              )}

              {/* Summary bar */}
              <div className="flex items-center gap-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-500">System-Ø</p>
                  <p className="text-xl font-bold">
                    {heatmap.system_avg_pct != null
                      ? `${heatmap.system_avg_pct.toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
                {heatmap.weakest_persona_id && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg">
                    <Flame className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-xs text-red-400">Schwächstes Glied</p>
                      <p className="text-sm font-medium">
                        {heatmap.weakest_persona_id} × S{heatmap.weakest_session_number}
                        {heatmap.weakest_score_pct != null && (
                          <span className="ml-1 text-red-300">
                            ({heatmap.weakest_score_pct.toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {heatmap.error_cell_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-400">
                    <AlertTriangle className="w-4 h-4" />
                    {heatmap.error_cell_count} Fehler-Zellen
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1 text-xs text-zinc-500">
                  <RefreshCw className="w-3 h-3" />
                  <button
                    onClick={() => loadHeatmap(selectedRun)}
                    className="hover:text-zinc-300"
                  >
                    Aktualisieren
                  </button>
                </div>
              </div>

              {/* Heatmap grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-zinc-500 font-medium pb-2 pr-3 min-w-[140px]">
                        Persona
                      </th>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                        <th
                          key={s}
                          className="text-center text-xs text-zinc-500 font-medium pb-2 px-1 min-w-[64px]"
                        >
                          <div>S{s}</div>
                          <div className="text-zinc-600 font-normal text-[10px]">
                            {SESSION_NAMES[s]}
                          </div>
                        </th>
                      ))}
                      <th className="text-center text-xs text-zinc-500 font-medium pb-2 px-2 min-w-[56px]">
                        Ø
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.personas.map((persona) => (
                      <tr key={persona.persona_id}>
                        <td className="pr-3 py-1">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-zinc-300">
                                {persona.persona_id}
                              </span>
                              {persona.persona_id === "P04" && (
                                <span
                                  title="P04 Jonas — Krisenfall: M7 Crisis Detection prüfen"
                                  className="inline-flex items-center gap-0.5 text-[10px] text-red-400 bg-red-500/10 rounded px-1 py-0.5"
                                >
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  Crisis
                                </span>
                              )}
                            </div>
                            {persona.learning_topic && (
                              <p className="text-[10px] text-zinc-600 leading-tight">
                                {persona.learning_topic}
                              </p>
                            )}
                          </div>
                        </td>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((sNum) => {
                          const cell = persona.sessions.find((s) => s.session_number === sNum)
                          const compareCell = compareHeatmap
                            ? compareHeatmap.personas
                                .find((p) => p.persona_id === persona.persona_id)
                                ?.sessions.find((s) => s.session_number === sNum) ?? null
                            : null
                          const delta =
                            cell?.score_pct != null && compareCell?.score_pct != null
                              ? Math.round(cell.score_pct - compareCell.score_pct)
                              : null
                          const isSelected =
                            selectedCell?.persona === persona.persona_id &&
                            selectedCell?.session === sNum
                          return (
                            <td key={sNum} className="px-1 py-1">
                              <button
                                onClick={() =>
                                  setSelectedCell({ persona: persona.persona_id, session: sNum })
                                }
                                className={`w-full h-12 rounded flex flex-col items-center justify-center
                                            text-xs font-medium transition-all
                                            ${cell ? scoreColor(cell.score_pct, cell.has_error) : "bg-zinc-800 text-zinc-600"}
                                            ${isSelected ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-950" : "hover:opacity-80"}
                                          `}
                              >
                                {cell ? (
                                  <>
                                    <span className="text-sm font-bold leading-none">
                                      {cell.has_error
                                        ? "Err"
                                        : cell.score_pct != null
                                        ? `${cell.score_pct.toFixed(0)}%`
                                        : "—"}
                                    </span>
                                    {compareCell?.score_pct != null && cell.score_pct != null ? (
                                      <span className={`text-[9px] leading-none mt-0.5 ${
                                        delta === 0 ? "text-zinc-400"
                                        : delta != null && delta > 0 ? "text-green-400"
                                        : "text-red-400"
                                      }`}>
                                        {delta != null && delta > 0 ? `↑${delta}` : delta != null && delta < 0 ? `↓${Math.abs(delta)}` : "="}{" "}
                                        {compareCell.score_pct.toFixed(0)}%
                                      </span>
                                    ) : cell.flagged_metrics.length > 0 && !cell.has_error ? (
                                      <span className="text-[9px] opacity-75 mt-0.5 leading-none">
                                        ⚑ {cell.flagged_metrics
                                          .map((k) => k.split("_")[0].toUpperCase())
                                          .join(" ")}
                                      </span>
                                    ) : null}
                                  </>
                                ) : (
                                  <span className="text-zinc-600">—</span>
                                )}
                              </button>
                            </td>
                          )
                        })}
                        <td className="px-2 py-1 text-center">
                          <span
                            className={`text-xs font-bold ${
                              persona.avg_score_pct != null
                                ? persona.avg_score_pct >= 67
                                  ? "text-green-400"
                                  : persona.avg_score_pct >= 34
                                  ? "text-yellow-400"
                                  : "text-red-400"
                                : "text-zinc-600"
                            }`}
                          >
                            {persona.avg_score_pct != null
                              ? `${persona.avg_score_pct.toFixed(0)}%`
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Column averages */}
                    <tr className="border-t border-zinc-800">
                      <td className="pt-2 pr-3 text-xs text-zinc-500 font-medium">Ø Session</td>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => {
                        const avg = heatmap.column_averages[String(s)]
                        return (
                          <td key={s} className="px-1 pt-2 text-center">
                            <span
                              className={`text-xs font-bold ${
                                avg != null
                                  ? avg >= 67
                                    ? "text-green-400"
                                    : avg >= 34
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                  : "text-zinc-600"
                              }`}
                            >
                              {avg != null ? `${avg.toFixed(0)}%` : "—"}
                            </span>
                          </td>
                        )
                      })}
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>Legende:</span>
                {[
                  { color: "bg-green-600", label: "≥84% Excellent" },
                  { color: "bg-yellow-500", label: "67–83% Gut" },
                  { color: "bg-orange-500", label: "34–66% Schwach" },
                  { color: "bg-red-600", label: "<34% Versagen" },
                  { color: "bg-zinc-700", label: "Fehler" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Run-Log (collapsed by default after completion) */}
              {evalLog.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowLog((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-zinc-400">
                      Run-Log ({evalLog.length} Einträge)
                    </p>
                    <span className="text-xs text-zinc-600">{showLog ? "▲" : "▼"}</span>
                  </button>
                  {showLog && (
                    <div className="h-48 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
                      {evalLog.map((entry, i) => (
                        <div
                          key={i}
                          className={`leading-snug ${
                            entry.level === "error"
                              ? "text-red-400"
                              : entry.level === "warning"
                              ? "text-yellow-400"
                              : "text-zinc-400"
                          }`}
                        >
                          <span className="text-zinc-600">{entry.ts.slice(11, 19)}</span>{" "}
                          {entry.msg}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail slide-over */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end">
          <div className="w-full max-w-xl bg-zinc-900 border-l border-zinc-700 overflow-y-auto">
            {/* Slide-over header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
              <div>
                <p className="font-semibold">
                  {selectedCell.persona} × S{selectedCell.session}
                  <span className="text-zinc-400 font-normal ml-2 text-sm">
                    {SESSION_NAMES[selectedCell.session]}
                  </span>
                </p>
                {detail?.score_total_pct != null && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Gesamt-Score:{" "}
                    <span className="font-bold text-zinc-200">
                      {detail.score_total_pct.toFixed(1)}%
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startRetest}
                  disabled={retesting || isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-600
                             disabled:opacity-50 rounded text-xs font-medium transition-colors"
                >
                  {retesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Retest
                </button>
                <button
                  onClick={() => { setSelectedCell(null); setDetail(null) }}
                  className="p-1.5 hover:bg-zinc-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </div>
              ) : detail ? (
                <>
                  {/* Metric bars */}
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                      Metriken
                    </p>
                    <div className="space-y-3">
                      {detail.results.map((r) => {
                        const effective = metricScore(r.score, r.override_score)
                        const isM7 = r.metric_key === "m7_crisis_detection"
                        return (
                          <div key={r.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {isM7 ? (
                                  r.crisis_triggered ? (
                                    <Shield className="w-3.5 h-3.5 text-green-400" />
                                  ) : (
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                  )
                                ) : null}
                                <span className="text-xs text-zinc-300">
                                  {METRIC_LABELS[r.metric_key] ?? r.metric_key}
                                </span>
                                {r.flagged && (
                                  <span className="text-[10px] px-1 bg-red-900 text-red-300 rounded">
                                    FLAG
                                  </span>
                                )}
                                {r.override_score != null && (
                                  <span className="text-[10px] px-1 bg-amber-900 text-amber-300 rounded">
                                    KORRIGIERT
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-sm font-bold ${metricScoreColor(effective)}`}
                              >
                                {effective ?? "—"}/3
                              </span>
                            </div>
                            {/* Score bar */}
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  effective != null
                                    ? scoreBg((effective / 3) * 100, false)
                                    : "bg-zinc-700"
                                }`}
                                style={{ width: effective != null ? `${(effective / 3) * 100}%` : "0%" }}
                              />
                            </div>
                            {r.reasoning && (
                              <p className="text-[11px] text-zinc-500 leading-relaxed pl-0.5">
                                {r.reasoning}
                              </p>
                            )}
                            {r.override_reason && (
                              <p className="text-[11px] text-amber-500 pl-0.5">
                                Korrektur: {r.override_reason}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Transcript */}
                  {detail.transcript && detail.transcript.messages.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                        Transkript
                      </p>
                      <div className="space-y-3 max-h-150 overflow-y-auto pr-1">
                        {detail.transcript.messages
                          .filter((m) => m.content)
                          .map((m, i) => {
                            const isKaia = m.source === "kaia" || m.role === "assistant"
                            const isFlagged = detail.transcript?.flagged_exchanges.some(
                              (f) => f.turn === m.turn
                            )
                            return (
                              <div
                                key={i}
                                className={`rounded-lg p-3 text-xs leading-relaxed ${
                                  isKaia
                                    ? "bg-violet-900/20 border border-violet-800/30"
                                    : "bg-zinc-800 border border-zinc-700"
                                } ${isFlagged ? "ring-1 ring-red-500" : ""}`}
                              >
                                <p className="text-[10px] font-medium mb-1 text-zinc-500">
                                  {isKaia ? "KAIA" : selectedCell.persona}
                                  {isFlagged && (
                                    <span className="ml-2 text-red-400">⚑ flagged</span>
                                  )}
                                </p>
                                <p className="text-zinc-300">{m.content}</p>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-12">
                  Keine Detail-Daten für diese Zelle.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: EvalRun["status"] }) {
  if (status === "completed")
    return <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
  if (status === "failed")
    return <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
  if (status === "running" || status === "pending")
    return <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" />
  return <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
}
