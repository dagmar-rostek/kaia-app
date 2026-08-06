"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { LegalFooter } from "@/components/LegalFooter"
import { apiLogout, authFetch } from "@/lib/auth"

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserMe {
  username: string
  preferred_name: string | null
  learning_topic: string | null
}

interface SessionMessage {
  role: string
  content: string
}

interface SessionSummary {
  mood?: string
  topics?: string[]
  strengths_observed?: string
  friction_points?: string
  strongest_quote?: string
  first_step?: string
  insight_for_next_session?: string
  observation?: string
}

interface FullSession {
  id: number
  session_number: number
  started_at: string | null
  message_count: number
  summary: SessionSummary | null
  messages: SessionMessage[]
}

interface AbschlussData {
  gse_pre: { items: number[]; total_score: number } | null
  gse_post: { items: number[]; total_score: number } | null
  mslq_pre: { subscale_scores: Record<string, number> } | null
  mslq_post: { subscale_scores: Record<string, number> } | null
  sessions: FullSession[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GSE_ITEM_LABELS = [
  "Bewältigung",
  "Durchsetzen",
  "Ziele",
  "Orientierung",
  "Anpassung",
  "Gelassenheit",
  "Resilienz",
  "Problemlösung",
  "Flexibilität",
  "Ressourcen",
]

const GSE_ITEMS_FULL = [
  "Wenn sich Schwierigkeiten auftun, vertraue ich darauf, dass ich damit fertig werde.",
  "Wenn jemand gegen mich ist, finde ich Mittel und Wege, um das zu erreichen, was ich will.",
  "Es bereitet mir keine Schwierigkeiten, meine Absichten und Ziele zu verwirklichen.",
  "In unerwarteten Situationen weiß ich immer, wie ich mich verhalten soll.",
  "Auch bei überraschenden Ereignissen glaube ich, dass ich gut mit ihnen umgehen kann.",
  "Schwierigkeiten sehe ich gelassen entgegen, weil ich meinen Fähigkeiten immer vertrauen kann.",
  "Was auch immer passiert, ich werde schon klarkommen.",
  "Für jedes Problem kann ich eine Lösung finden.",
  "Wenn eine neue Sache auf mich zukommt, weiß ich, wie ich damit umgehen kann.",
  "Wenn es nötig ist, kann ich auf viele Dinge zurückgreifen.",
]

const MSLQ_META: { key: string; label: string; shortLabel: string; color: string; description: string; improveText: string }[] = [
  {
    key: "self_efficacy",
    label: "Akademische Selbstwirksamkeit",
    shortLabel: "Selbstwirk.",
    color: "#6366f1",
    description: "Vertrauen in die eigenen Lernfähigkeiten",
    improveText: "Mehr Zutrauen in die eigene Kompetenz beim Lernen — du glaubst stärker daran, dass du es schaffst.",
  },
  {
    key: "kdg",
    label: "Wissen-Handeln-Lücke",
    shortLabel: "Wissen↔Handeln",
    color: "#0ea5e9",
    description: "Fähigkeit, Wissen in Handeln zu übersetzen",
    improveText: "Geringere Distanz zwischen dem was du weißt und dem was du tust — die Lücke schließt sich.",
  },
  {
    key: "elaboration",
    label: "Elaborationsstrategien",
    shortLabel: "Elaboration",
    color: "#8b5cf6",
    description: "Tiefes Verarbeiten durch Verknüpfung mit Vorwissen",
    improveText: "Du vernetzt Neues stärker mit dem was du schon weißt — tieferes Verstehen statt Auswendiglernen.",
  },
  {
    key: "metacognitive_sr",
    label: "Metakogn. Selbstregulation",
    shortLabel: "Selbstreg.",
    color: "#f59e0b",
    description: "Planung, Überwachung und Anpassung beim Lernen",
    improveText: "Du steuerst deinen Lernprozess bewusster — planst, überprüfst und korrigierst aktiv.",
  },
  {
    key: "control_of_learning",
    label: "Kontrollüberzeugungen",
    shortLabel: "Kontrolle",
    color: "#10b981",
    description: "Überzeugung, Lernerfolg selbst beeinflussen zu können",
    improveText: "Stärkere Überzeugung, dass dein Handeln wirklich einen Unterschied macht.",
  },
]

const SESSION_GOALS: Record<number, string> = {
  1: "Thema, Lernintention und erster Schritt sichtbar machen.",
  2: "Ersten Schritt nachhalten. Vorwissen und Lücken kartieren.",
  3: "Erkenntnisse in konkrete Handlungsschritte überführen.",
  4: "Transfer vertiefen. Muster aus den Versuchen analysieren.",
  5: "Halbzeit-Spiegel. Fortschritt explizit sichtbar machen.",
  6: "Cross-sessionaler Widerspruch. Kognitive Dissonanz erkunden.",
  7: "Bewertungskriterien entwickeln. Annahmen sichtbar machen.",
  8: "Tiefe Analyse. Systemisches Denken fördern.",
  9: "Transfer-Autonomie. Eigene Lernstrategie entwickeln.",
  10: "Abschluss. Mastery Experience durch Reflexion. Transfer sichern.",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MoodBadge({ mood }: { mood: string }) {
  const cfg = {
    positiv: { cls: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
    neutral: { cls: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500" },
    frustriert: { cls: "bg-red-100 text-red-700 border-red-300", dot: "bg-red-500" },
    unklar: { cls: "bg-gray-100 text-gray-600 border-gray-300", dot: "bg-gray-400" },
  }[mood] ?? { cls: "bg-gray-100 text-gray-600 border-gray-300", dot: "bg-gray-400" }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {mood}
    </span>
  )
}

function Accordion({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">{title}</div>
        <div className="flex items-center gap-2 shrink-0">
          {badge}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {open && <div className="border-t border-border">{children}</div>}
    </div>
  )
}

function RadarChart({
  valsPre,
  valsPost,
  labels,
  scaleMin,
  scaleMax,
  colorPre = "#818cf8",
  colorPost = "#34d399",
  size = 280,
}: {
  valsPre: number[]
  valsPost: number[]
  labels: string[]
  scaleMin: number
  scaleMax: number
  colorPre?: string
  colorPost?: string
  size?: number
}) {
  const n = labels.length
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 40

  const norm = (v: number) => {
    const span = scaleMax - scaleMin
    return span ? Math.min(1, Math.max(0, (v - scaleMin) / span)) : 0
  }

  const pt = (i: number, v: number) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    const nv = norm(v)
    return { x: cx + r * nv * Math.cos(angle), y: cy + r * nv * Math.sin(angle) }
  }

  const ptsStr = (vals: number[]) =>
    vals.map((v, i) => { const p = pt(i, v); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(" ")

  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Grid */}
      {gridLevels.map((lvl) => {
        const gpts = Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          return `${(cx + r * lvl * Math.cos(angle)).toFixed(1)},${(cy + r * lvl * Math.sin(angle)).toFixed(1)}`
        }).join(" ")
        return (
          <polygon
            key={lvl}
            points={gpts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth="1"
            className="text-foreground"
          />
        )
      })}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2
        const x = (cx + r * Math.cos(angle)).toFixed(1)
        const y = (cy + r * Math.sin(angle)).toFixed(1)
        return (
          <line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke="currentColor" strokeOpacity={0.1} strokeWidth="1" className="text-foreground" />
        )
      })}

      {/* Pre polygon */}
      <polygon
        points={ptsStr(valsPre)}
        fill={colorPre}
        fillOpacity={0.15}
        stroke={colorPre}
        strokeWidth="1.8"
      />

      {/* Post polygon */}
      <polygon
        points={ptsStr(valsPost)}
        fill={colorPost}
        fillOpacity={0.15}
        stroke={colorPost}
        strokeWidth="1.8"
      />

      {/* Labels */}
      {labels.map((lab, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2
        const lx = cx + (r + 24) * Math.cos(angle)
        const ly = cy + (r + 24) * Math.sin(angle)
        let anchor: "middle" | "start" | "end" = "middle"
        if (lx < cx - 10) anchor = "end"
        else if (lx > cx + 10) anchor = "start"
        return (
          <text
            key={i}
            x={lx.toFixed(1)}
            y={ly.toFixed(1)}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9.5"
            fill="currentColor"
            fillOpacity={0.6}
            className="text-foreground select-none"
          >
            {lab}
          </text>
        )
      })}
    </svg>
  )
}

function ChatLog({ messages }: { messages: SessionMessage[] }) {
  return (
    <div className="space-y-2">
      {messages.map((msg, i) => {
        const isAi = msg.role === "assistant"
        return (
          <div
            key={i}
            className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
              isAi
                ? "bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
                : "bg-muted/30 border border-border"
            }`}
          >
            <p className={`text-[11px] font-semibold mb-1 ${isAi ? "text-indigo-500" : "text-muted-foreground"}`}>
              {isAi ? "KAIA" : "Du"}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        )
      })}
    </div>
  )
}

function TagsAnnotation({ summary }: { summary: SessionSummary }) {
  const tags: { key: string; value: string }[] = []
  if (summary.mood) tags.push({ key: "Stimmung", value: summary.mood })
  if (summary.topics?.length) tags.push({ key: "Themen", value: summary.topics.join(" · ") })
  if (summary.strongest_quote) tags.push({ key: "StärksterSatz", value: `"${summary.strongest_quote}"` })
  if (summary.strengths_observed) tags.push({ key: "Stärken", value: summary.strengths_observed })
  if (summary.friction_points) tags.push({ key: "Reibung", value: summary.friction_points })
  if (summary.first_step) tags.push({ key: "NächsterSchritt", value: summary.first_step })
  if (summary.insight_for_next_session) tags.push({ key: "FürNächsteSession", value: summary.insight_for_next_session })

  if (!tags.length) return null

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3 space-y-1.5 font-mono text-xs">
      {tags.map(({ key, value }) => (
        <div key={key} className="flex gap-2 leading-relaxed">
          <span className="text-indigo-400 shrink-0">&lt;{key}&gt;</span>
          <span className="text-foreground/80 font-sans break-words min-w-0">{value}</span>
        </div>
      ))}
    </div>
  )
}

function SessionCard({ session, learningTopic }: { session: FullSession; learningTopic: string | null }) {
  const snum = session.session_number
  const summary = session.summary
  const goal = SESSION_GOALS[snum]
  const date = session.started_at
    ? new Date(session.started_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  const moodBadge = summary?.mood ? <MoodBadge mood={summary.mood} /> : null

  return (
    <Accordion
      defaultOpen={snum === 10}
      badge={moodBadge}
      title={
        <>
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            {snum}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">Session {snum}</p>
            {date && <p className="text-xs text-muted-foreground">{date} · {session.message_count} Nachrichten</p>}
          </div>
        </>
      }
    >
      <div className="p-5 space-y-5">
        {/* Session structure */}
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 px-4 py-3 space-y-1">
          <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Session-Aufbau</p>
          {learningTopic && (
            <p className="text-xs"><span className="text-muted-foreground">Lernthema:</span> <span className="font-medium">{learningTopic}</span></p>
          )}
          {summary?.topics && summary.topics.length > 0 && (
            <p className="text-xs"><span className="text-muted-foreground">Themen dieser Session:</span>{" "}
              {summary.topics.map((t, i) => (
                <span key={i} className="inline-flex items-center rounded-md bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 text-[11px] text-violet-700 dark:text-violet-300 mr-1">{t}</span>
              ))}
            </p>
          )}
          {goal && <p className="text-xs text-muted-foreground italic">{goal}</p>}
        </div>

        {/* KAIA Meta-Reflexion */}
        {summary && (
          <div className="rounded-lg border-l-4 border-indigo-400 bg-muted/20 pl-4 pr-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">KAIA Meta-Reflexion</p>

            {summary.mood && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0">Stimmung</span>
                <MoodBadge mood={summary.mood} />
              </div>
            )}

            {summary.strongest_quote && (
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0">Stärkster Satz</span>
                <p className="text-xs italic text-foreground/80">&bdquo;{summary.strongest_quote}&ldquo;</p>
              </div>
            )}

            {summary.strengths_observed && (
              <div className="flex gap-2">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 w-24 shrink-0 font-medium">Stärken</span>
                <p className="text-xs text-foreground/80">{summary.strengths_observed}</p>
              </div>
            )}

            {summary.friction_points && (
              <div className="flex gap-2">
                <span className="text-xs text-amber-600 dark:text-amber-400 w-24 shrink-0 font-medium">Reibung</span>
                <p className="text-xs text-foreground/80">{summary.friction_points}</p>
              </div>
            )}

            {summary.first_step && (
              <div className="flex gap-2">
                <span className="text-xs text-blue-600 dark:text-blue-400 w-24 shrink-0 font-medium">Nächster Schritt</span>
                <p className="text-xs text-foreground/80">{summary.first_step}</p>
              </div>
            )}

            {summary.insight_for_next_session && (
              <div className="flex gap-2">
                <span className="text-xs text-violet-600 dark:text-violet-400 w-24 shrink-0 font-medium">Für nächste Session</span>
                <p className="text-xs text-foreground/80 italic">{summary.insight_for_next_session}</p>
              </div>
            )}
          </div>
        )}

        {/* Chat log */}
        {session.messages.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Chatverlauf</p>
            <ChatLog messages={session.messages} />
          </div>
        )}

        {/* Tags */}
        {summary && <TagsAnnotation summary={summary} />}
      </div>
    </Accordion>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AbschlussPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserMe | null>(null)
  const [data, setData] = useState<AbschlussData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [meRes, abschlussRes] = await Promise.all([
          authFetch("/api/v1/users/me"),
          authFetch("/api/v1/survey/abschluss"),
        ])
        if (meRes.ok) setUser((await meRes.json()) as UserMe)
        if (abschlussRes.ok) setData((await abschlussRes.json()) as AbschlussData)
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

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const res = await authFetch("/api/v1/survey/abschluss/pdf")
      if (!res.ok) return
      const contentType = res.headers.get("content-type") ?? ""
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = contentType.includes("pdf") ? "kaia-bericht.pdf" : "kaia-bericht.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }, [])

  const displayName = user?.preferred_name ?? user?.username ?? "…"
  const sessions = useMemo(() => data?.sessions ?? [], [data])

  const gsePre = data?.gse_pre
  const gsePost = data?.gse_post
  const gseDiff = gsePre && gsePost ? gsePost.total_score - gsePre.total_score : null

  const mslqPre = data?.mslq_pre?.subscale_scores
  const mslqPost = data?.mslq_post?.subscale_scores

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 space-y-14">

        {/* ── 1. Header (not in PDF) ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Abschluss</p>
          <h1 className="text-3xl font-bold tracking-tight">Glückwunsch, {displayName}.</h1>
          <p className="text-muted-foreground leading-relaxed">
            Du hast 10 Sessions mit KAIA abgeschlossen.
            {user?.learning_topic && (
              <> Dein Lernthema war: <span className="text-foreground font-medium">{user.learning_topic}</span>.</>
            )}
          </p>
          <p className="text-sm text-muted-foreground/70">
            Du hast auf die Karma-Kasse eingezahlt — jede Reflexion war ein Beitrag zu dir.
          </p>
        </div>

        {/* ── 2. GSE ── */}
        {(gsePre || gsePost) && (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Allgemeine Selbstwirksamkeitserwartung (GSE)
              </h2>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Schwarzer &amp; Jerusalem, 1999 · Skala 1–4</p>
            </div>

            {/* Total scores */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Vorher", value: gsePre?.total_score, color: "#818cf8" },
                { label: "Nachher", value: gsePost?.total_score, color: "#34d399" },
                { label: "Δ", value: null, delta: gseDiff },
              ].map(({ label, value, delta, color }) => (
                <div key={label} className="rounded-xl border border-border bg-muted/30 p-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {delta !== undefined ? (
                    <p className={`text-3xl font-bold tabular-nums ${(delta ?? 0) > 0 ? "text-emerald-500" : (delta ?? 0) < 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {delta != null ? `${delta > 0 ? "+" : ""}${delta.toFixed(2)}` : "—"}
                    </p>
                  ) : (
                    <p className="text-3xl font-bold tabular-nums" style={{ color }}>
                      {value != null ? value.toFixed(2) : "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Spider chart */}
            {gsePre?.items && gsePost?.items && gsePre.items.length === 10 && gsePost.items.length === 10 && (
              <div className="flex justify-center py-2">
                <RadarChart
                  valsPre={gsePre.items}
                  valsPost={gsePost.items}
                  labels={GSE_ITEM_LABELS}
                  scaleMin={1}
                  scaleMax={4}
                  size={280}
                />
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-[#818cf8]/60" /> Vorher
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-[#34d399]/60" /> Nachher
              </span>
            </div>

            {/* Item accordion */}
            <Accordion
              title={<span className="text-sm font-medium">10 Items im Einzelvergleich</span>}
              defaultOpen={false}
            >
              <div className="divide-y divide-border">
                {Array.from({ length: 10 }, (_, i) => {
                  const preVal = gsePre?.items?.[i] ?? null
                  const postVal = gsePost?.items?.[i] ?? null
                  const delta = preVal != null && postVal != null ? postVal - preVal : null
                  return (
                    <div key={i} className="px-5 py-3 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                          <span className="text-xs text-muted-foreground truncate">{GSE_ITEMS_FULL[i]}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 tabular-nums text-xs">
                          <span className="text-muted-foreground">{preVal ?? "—"}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{postVal ?? "—"}</span>
                          {delta != null && (
                            <span className={`font-semibold ${delta > 0 ? "text-emerald-500" : delta < 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Accordion>

            {gseDiff != null && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
                {gseDiff > 0.2
                  ? "Deine Selbstwirksamkeit hat sich im Verlauf der Sessions messbar gestärkt."
                  : gseDiff < -0.2
                  ? "Deine Selbstwirksamkeit hat sich leicht verändert — das ist normal in intensiven Lernprozessen."
                  : "Deine Selbstwirksamkeit ist stabil geblieben."}{" "}
                Die GSE misst eine Tendenz, keine unveränderliche Eigenschaft. Einzelne Messzeitpunkte sind Momentaufnahmen, keine Diagnosen.
              </p>
            )}
          </section>
        )}

        {/* ── 3. MSLQ ── */}
        {(mslqPre || mslqPost) && (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Lernmotivation &amp; -strategien (MSLQ)
              </h2>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Pintrich et al., 1991/1993 · Skala 1–7</p>
            </div>

            {/* Spider chart */}
            {mslqPre && mslqPost && (
              <div className="flex justify-center py-2">
                <RadarChart
                  valsPre={MSLQ_META.map(({ key }) => mslqPre[key] ?? 1)}
                  valsPost={MSLQ_META.map(({ key }) => mslqPost[key] ?? 1)}
                  labels={MSLQ_META.map(({ shortLabel }) => shortLabel)}
                  scaleMin={1}
                  scaleMax={7}
                  size={280}
                />
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-[#818cf8]/60" /> Vorher
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-full bg-[#34d399]/60" /> Nachher
              </span>
              <span className="ml-auto">Höhere Werte = stärkere Ausprägung.</span>
            </div>

            {/* Subscale cards */}
            <div className="space-y-2">
              {MSLQ_META.map(({ key, label, color, description, improveText }) => {
                const pre = mslqPre?.[key]
                const post = mslqPost?.[key]
                const delta = pre != null && post != null ? post - pre : null
                const barPrePct = pre != null ? Math.round(((pre - 1) / 6) * 100) : 0
                const barPostPct = post != null ? Math.round(((post - 1) / 6) * 100) : 0
                return (
                  <Accordion
                    key={key}
                    title={
                      <>
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-sm font-medium">{label}</span>
                      </>
                    }
                    badge={
                      delta != null ? (
                        <span className={`text-xs font-semibold tabular-nums ${delta > 0 ? "text-emerald-500" : delta < 0 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(2)}
                        </span>
                      ) : undefined
                    }
                  >
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-xs text-muted-foreground">{description}</p>

                      {/* Bar viz */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-16 shrink-0">Vorher {pre?.toFixed(2) ?? "—"}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-[#818cf8]/70 transition-all" style={{ width: `${barPrePct}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-16 shrink-0">Nachher {post?.toFixed(2) ?? "—"}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-[#34d399]/70 transition-all" style={{ width: `${barPostPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {delta != null && delta > 0.1 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">{improveText}</p>
                      )}
                    </div>
                  </Accordion>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
              Subskalen-Werte sind Mittelwerte aus mehreren Items. Einzelne Messzeitpunkte sind Momentaufnahmen, keine Diagnosen.
            </p>
          </section>
        )}

        {/* ── 4. Sessions ── */}
        {sessions.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Deine 10 Sessions
            </h2>
            <div className="space-y-3">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} learningTopic={user?.learning_topic ?? null} />
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Vollständiger Chatverlauf (alle Sessions) ── */}
        {sessions.length > 0 && (
          <section>
            <Accordion
              title={<span className="text-sm font-medium">Vollständiger Chatverlauf — alle Sessions</span>}
              defaultOpen={false}
            >
              <div className="p-5 space-y-8">
                {sessions.map((s) => (
                  s.messages.length > 0 && (
                    <div key={s.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-xs font-medium text-muted-foreground px-2">Session {s.session_number}</span>
                        <span className="h-px flex-1 bg-border" />
                      </div>
                      <ChatLog messages={s.messages} />
                    </div>
                  )
                ))}
              </div>
            </Accordion>
          </section>
        )}

        {/* ── 6. PDF Download ── */}
        <section>
          <button
            onClick={() => void handleDownloadPdf()}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {pdfLoading ? "Bericht wird erstellt…" : "PDF herunterladen"}
          </button>
          <p className="mt-2 text-xs text-muted-foreground/50">
            Persönlicher Abschlussbericht mit allen Daten.
          </p>
        </section>

        {/* ── 7. Local reflection ── */}
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

        {/* ── 8. Logout ── */}
        <div className="space-y-3 pb-8">
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
