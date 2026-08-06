export const dynamic = "force-dynamic"

const API = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

const SUBSCALE_LABELS: Record<string, string> = {
  self_efficacy: "Akademische Selbstwirksamkeit",
  kdg: "Wissen-Handeln-Lücke",
  elaboration: "Elaborationsstrategien",
  metacognitive_sr: "Metakognitive Selbstregulation",
  control_of_learning: "Kontrollüberzeugungen",
}

interface GseData {
  total_score: number
  items: number[]
  created_at: string | null
}

interface MslqData {
  subscale_scores: Record<string, number>
  items: Record<string, number>
  created_at: string | null
}

interface SessionData {
  id: number
  session_number: number
  started_at: string | null
  ended_at: string | null
  message_count: number
  summary: {
    mood?: string
    topics?: string[]
    strengths_observed?: string
    friction_points?: string
    strongest_quote?: string
    first_step?: string
    insight_for_next_session?: string
  } | null
}

interface EvalData {
  user: { id: number; username: string; preferred_name: string | null; learning_topic: string | null }
  gse: { pre: GseData | null; post: GseData | null }
  mslq: { pre: MslqData | null; post: MslqData | null }
  sessions: SessionData[]
}

async function fetchEval(): Promise<EvalData | null> {
  try {
    const res = await fetch(`${API}/v1/admin/test-user-evaluation`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json() as Promise<EvalData>
  } catch {
    return null
  }
}

function fmt(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function fmtDelta(pre: number | undefined, post: number | undefined) {
  if (pre == null || post == null) return null
  return post - pre
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground">—</span>
  const sign = delta > 0 ? "+" : ""
  const cls = delta > 0
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : delta < 0
    ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20"
    : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-mono font-medium ${cls}`}>
      {sign}{delta.toFixed(3)}
    </span>
  )
}

function GseSection({ gse }: { gse: EvalData["gse"] }) {
  const pre = gse.pre
  const post = gse.post
  const delta = pre && post ? post.total_score - pre.total_score : null

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        GSE — Allgemeine Selbstwirksamkeit
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Prä", score: pre?.total_score ?? null, date: pre?.created_at ?? null },
          { label: "Post", score: post?.total_score ?? null, date: post?.created_at ?? null },
          { label: "Delta", score: null, date: null, delta },
        ].map(({ label, score, date, delta }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {delta !== undefined ? (
              <div className="text-2xl font-bold font-mono"><DeltaBadge delta={delta ?? null} /></div>
            ) : (
              <p className="text-2xl font-bold font-mono">{score != null ? score.toFixed(2) : "—"}</p>
            )}
            {date && <p className="text-xs text-muted-foreground/60">{fmt(date)}</p>}
          </div>
        ))}
      </div>

      {(pre?.items || post?.items) && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Item</th>
                {pre && <th className="text-center px-3 py-2 text-muted-foreground font-medium">Prä</th>}
                {post && <th className="text-center px-3 py-2 text-muted-foreground font-medium">Post</th>}
                {pre && post && <th className="text-center px-3 py-2 text-muted-foreground font-medium">Δ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 10 }, (_, i) => {
                const preVal = pre?.items?.[i] ?? null
                const postVal = post?.items?.[i] ?? null
                const d = preVal != null && postVal != null ? postVal - preVal : null
                return (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">GSE-{String(i + 1).padStart(2, "0")}</td>
                    {pre && <td className="px-3 py-1.5 text-center font-mono">{preVal ?? "—"}</td>}
                    {post && <td className="px-3 py-1.5 text-center font-mono">{postVal ?? "—"}</td>}
                    {pre && post && (
                      <td className="px-3 py-1.5 text-center">
                        <DeltaBadge delta={d} />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function MslqSection({ mslq }: { mslq: EvalData["mslq"] }) {
  const pre = mslq.pre
  const post = mslq.post
  const keys = Object.keys(SUBSCALE_LABELS)

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        MSLQ — Subskalen (1–7)
      </h2>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Subskala</th>
              {pre && <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Prä</th>}
              {post && <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Post</th>}
              {pre && post && <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Δ</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((key) => {
              const preVal = pre?.subscale_scores?.[key] ?? null
              const postVal = post?.subscale_scores?.[key] ?? null
              const d = fmtDelta(preVal ?? undefined, postVal ?? undefined)
              return (
                <tr key={key} className="hover:bg-muted/10">
                  <td className="px-4 py-2.5 text-sm">{SUBSCALE_LABELS[key]}</td>
                  {pre && <td className="px-4 py-2.5 text-center font-mono text-sm">{preVal != null ? preVal.toFixed(2) : "—"}</td>}
                  {post && <td className="px-4 py-2.5 text-center font-mono text-sm">{postVal != null ? postVal.toFixed(2) : "—"}</td>}
                  {pre && post && (
                    <td className="px-4 py-2.5 text-center">
                      <DeltaBadge delta={d} />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SessionsSection({ sessions }: { sessions: SessionData[] }) {
  const real = sessions.filter(s => s.message_count > 1 || (s.summary !== null))
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Sessions ({sessions.length} gesamt, {real.length} mit echtem Inhalt)
        </h2>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground w-16">
                  Session {s.session_number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {fmt(s.started_at)} · {s.message_count} Nachrichten
                </span>
                {s.summary?.mood && (
                  <span className={`text-xs rounded-full border px-2 py-0.5 ${
                    s.summary.mood === "positiv" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    s.summary.mood === "frustriert" ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400" :
                    "border-border text-muted-foreground"
                  }`}>
                    {s.summary.mood}
                  </span>
                )}
              </div>
              {!s.summary && s.message_count <= 1 && (
                <span className="text-xs text-muted-foreground/50 italic">Seed-Session</span>
              )}
              {!s.summary && s.message_count > 1 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">Reflexion fehlt</span>
              )}
            </div>

            {s.summary && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1 border-t border-border/50">
                {s.summary.topics && s.summary.topics.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Themen</p>
                    <div className="flex flex-wrap gap-1">
                      {s.summary.topics.map((t) => (
                        <span key={t} className="text-xs rounded-full border border-border bg-muted/30 px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {s.summary.strongest_quote && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Stärkster Satz</p>
                    <p className="text-xs text-foreground/80 italic">&ldquo;{s.summary.strongest_quote}&rdquo;</p>
                  </div>
                )}
                {s.summary.strengths_observed && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Beobachtete Stärken</p>
                    <p className="text-xs text-foreground/80">{s.summary.strengths_observed}</p>
                  </div>
                )}
                {s.summary.friction_points && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Reibungspunkte</p>
                    <p className="text-xs text-foreground/80">{s.summary.friction_points}</p>
                  </div>
                )}
                {s.summary.first_step && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Nächster Schritt</p>
                    <p className="text-xs text-foreground/80">{s.summary.first_step}</p>
                  </div>
                )}
                {s.summary.insight_for_next_session && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Für nächste Session</p>
                    <p className="text-xs text-foreground/80 italic">{s.summary.insight_for_next_session}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function TestauswertungPage() {
  const data = await fetchEval()

  if (!data) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Testauswertung</h1>
        <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            admin_test@kaia.internal nicht gefunden oder Daten nicht ladbar.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Starte erst einen Journey-Test im Adminbereich.
          </p>
        </div>
      </div>
    )
  }

  const gseDelta = data.gse.pre && data.gse.post
    ? data.gse.post.total_score - data.gse.pre.total_score
    : null

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Testauswertung</h1>
        <p className="text-muted-foreground text-sm">
          Daten von <span className="font-mono">admin_test@kaia.internal</span>
          {data.user.learning_topic ? ` · Lernthema: ${data.user.learning_topic}` : ""}
        </p>
        <p className="text-xs text-muted-foreground/60">
          Kein Echtdaten-Export — nur zur Optimierung der Auswertungsseite
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Sessions", value: data.sessions.length.toString() },
          { label: "GSE Prä", value: data.gse.pre ? data.gse.pre.total_score.toFixed(2) : "—" },
          { label: "GSE Post", value: data.gse.post ? data.gse.post.total_score.toFixed(2) : "—" },
          { label: "GSE Δ", value: null, delta: gseDelta },
        ].map(({ label, value, delta }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {delta !== undefined
              ? <div className="text-xl font-bold"><DeltaBadge delta={delta ?? null} /></div>
              : <p className="text-xl font-bold font-mono">{value}</p>}
          </div>
        ))}
      </div>

      <GseSection gse={data.gse} />
      <MslqSection mslq={data.mslq} />
      <SessionsSection sessions={data.sessions} />

    </div>
  )
}
