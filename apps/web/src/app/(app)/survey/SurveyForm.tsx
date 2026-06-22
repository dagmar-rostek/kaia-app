"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react"
import { authFetch } from "@/lib/auth"

// ── GSE items (Schwarzer & Jerusalem, 1995) ───────────────────────────────────

const GSE_ITEMS_RAW = [
  "Wenn sich Schwierigkeiten auftürmen, bin ich sicher, dass ich damit fertig werde.",
  "Wenn jemand gegen mich vorgeht, finde ich Mittel und Wege, um mein Ziel zu bekommen.",
  "Es bereitet mir keine Schwierigkeiten, meine Absichten und Ziele zu verwirklichen.",
  "In unerwarteten Situationen weiß ich immer, wie ich mich verhalten soll.",
  "Auch bei überraschenden Ereignissen glaube ich, dass ich gut mit ihnen umgehen kann.",
  "Schwierigkeiten sehe ich gelassen entgegen, weil ich meinen Fähigkeiten immer vertrauen kann.",
  "Was auch immer passiert, ich werde schon klarkommen.",
  "Für jedes Problem kann ich eine Lösung finden.",
  "Wenn eine neue Sache auf mich zukommt, weiß ich, wie ich damit umgehen kann.",
  "Wenn ich mit einem Problem konfrontiert werde, habe ich meist mehrere Ideen, wie ich damit fertig werde.",
]

// ── MSLQ items (Pintrich et al., 1991 — KAIA-Adaptation) ─────────────────────

type MslqItem = { num: number; text: string; subscale: string }

const MSLQ_ITEMS_RAW: MslqItem[] = [
  // Intrinsic Goal Orientation
  { num: 1,  subscale: "Zielorientierung",        text: "Ich bevorzuge Lerninhalte, die mich wirklich herausfordern, weil ich dabei Neues lerne." },
  { num: 16, subscale: "Zielorientierung",        text: "Ich beschäftige mich lieber mit Inhalten, die meine Neugier wecken — auch wenn sie schwieriger sind." },
  { num: 22, subscale: "Zielorientierung",        text: "Das Befriedigendste beim Lernen ist für mich, etwas wirklich in der Tiefe zu verstehen." },
  { num: 24, subscale: "Zielorientierung",        text: "Ich wähle Lernwege, bei denen ich am meisten lerne — auch wenn sie aufwändiger sind." },
  // Self-Efficacy
  { num: 5,  subscale: "Selbstwirksamkeit",       text: "Ich bin überzeugt, dass ich mein Lernthema wirklich durchdringen kann." },
  { num: 6,  subscale: "Selbstwirksamkeit",       text: "Ich bin sicher, dass ich auch schwierige Inhalte meines Lernthemas verstehen kann." },
  { num: 12, subscale: "Selbstwirksamkeit",       text: "Ich bin zuversichtlich, die grundlegenden Konzepte meines Lernthemas zu verstehen." },
  { num: 15, subscale: "Selbstwirksamkeit",       text: "Ich traue mir zu, auch komplexe Zusammenhänge in meinem Lernthema zu durchdringen." },
  { num: 20, subscale: "Selbstwirksamkeit",       text: "Ich bin sicher, dass ich beim Lernen gute Ergebnisse erzielen kann, wenn ich mich anstrenge." },
  { num: 21, subscale: "Selbstwirksamkeit",       text: "Ich erwarte, dass ich mit meinem Lernthema gut vorankomme." },
  { num: 29, subscale: "Selbstwirksamkeit",       text: "Ich bin überzeugt, dass ich die Fähigkeiten, die ich mir vornehme, wirklich erwerben kann." },
  { num: 31, subscale: "Selbstwirksamkeit",       text: "Angesichts der Anforderungen meines Lernthemas und meiner bisherigen Fähigkeiten bin ich zuversichtlich, erfolgreich zu sein." },
  // Elaboration
  { num: 53, subscale: "Elaboration",             text: "Beim Lernen verknüpfe ich Informationen aus verschiedenen Quellen miteinander." },
  { num: 62, subscale: "Elaboration",             text: "Ich versuche, neue Ideen mit dem zu verbinden, was ich aus anderen Bereichen weiß." },
  { num: 64, subscale: "Elaboration",             text: "Wenn ich neue Inhalte lerne, versuche ich sie mit dem zu verknüpfen, was ich bereits weiß." },
  { num: 67, subscale: "Elaboration",             text: "Ich schreibe kurze Zusammenfassungen der wichtigsten Gedanken, um sie zu festigen." },
  { num: 69, subscale: "Elaboration",             text: "Ich versuche, Inhalte zu verstehen, indem ich Verbindungen zwischen verschiedenen Konzepten herstelle." },
  { num: 81, subscale: "Elaboration",             text: "Ich versuche, Ideen aus meinem Lernthema in anderen Situationen anzuwenden." },
  // Metacognitive Self-Regulation
  { num: 33, subscale: "Metakognition",           text: "Beim Lernen verpasse ich oft Wichtiges, weil ich an anderes denke." },
  { num: 36, subscale: "Metakognition",           text: "Ich stelle mir selbst Fragen, um mein Lernen zu fokussieren." },
  { num: 41, subscale: "Metakognition",           text: "Wenn mir etwas unklar ist, kehre ich zurück und versuche es zu klären." },
  { num: 44, subscale: "Metakognition",           text: "Wenn Inhalte schwer zu verstehen sind, ändere ich meine Lernstrategie." },
  { num: 54, subscale: "Metakognition",           text: "Bevor ich etwas gründlich lerne, verschaffe ich mir erst einen Überblick über die Struktur." },
  { num: 55, subscale: "Metakognition",           text: "Ich stelle mir selbst Fragen, um zu prüfen ob ich den Stoff wirklich verstanden habe." },
  { num: 56, subscale: "Metakognition",           text: "Ich passe meine Lernweise an, wenn ich merke, dass mein Vorgehen nicht funktioniert." },
  { num: 57, subscale: "Metakognition",           text: "Ich merke oft, dass ich gelernt habe, ohne wirklich aufgenommen zu haben, worum es ging." },
  { num: 61, subscale: "Metakognition",           text: "Ich denke ein Thema durch und überlege, was ich daraus mitnehmen will — statt es nur zu wiederholen." },
  { num: 76, subscale: "Metakognition",           text: "Beim Lernen versuche ich herauszufinden, welche Konzepte mir noch unklar sind." },
  { num: 78, subscale: "Metakognition",           text: "Ich setze mir Lernziele, um meine Aktivitäten in jeder Lerneinheit zu steuern." },
  { num: 79, subscale: "Metakognition",           text: "Wenn mir etwas unklar bleibt, sorge ich dafür, dass ich es im Nachgang kläre." },
]

const MSLQ_LABELS: [string, string] = ["Trifft gar nicht zu", "Trifft vollständig zu"]
const GSE_LABELS = ["Stimmt nicht", "Stimmt kaum", "Stimmt eher", "Stimmt genau"]

// ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── Likert components ─────────────────────────────────────────────────────────

function LikertRow7({ text, value, onChange, index, total }: {
  text: string; value: number | null; onChange: (v: number) => void; index: number; total: number
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground flex-1">{text}</p>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{index + 1}/{total}</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <span className="text-xs text-muted-foreground w-24 shrink-0 hidden sm:block">{MSLQ_LABELS[0]}</span>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded text-xs font-semibold transition-all border ${
              value === n
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
            aria-label={`${n} von 7`}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-muted-foreground w-24 shrink-0 text-right hidden sm:block">{MSLQ_LABELS[1]}</span>
      </div>
    </div>
  )
}

function LikertRow4({ text, value, onChange, index, total }: {
  text: string; value: number | null; onChange: (v: number) => void; index: number; total: number
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground flex-1">{text}</p>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{index + 1}/{total}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {GSE_LABELS.map((label, idx) => {
          const n = idx + 1
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`py-2 px-1 rounded text-xs font-medium transition-all border ${
                value === n
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Evaluation display ────────────────────────────────────────────────────────

interface MslqResult {
  subscale_scores: Record<string, number>
}
interface GseResult {
  total_score: number
}

const SUBSCALE_LABELS: Record<string, string> = {
  self_efficacy:    "Selbstwirksamkeit (lernbezogen)",
  intrinsic_goal:   "Intrinsische Zielorientierung",
  elaboration:      "Elaborationsstrategien",
  metacognitive_sr: "Metakognitive Selbstregulation",
}

function ScoreBar({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{score.toFixed(2)} / {max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EvaluationPanel({ mslqResult, gseResult, measurementType, onContinue, redirectTo }: {
  mslqResult: MslqResult
  gseResult: GseResult
  measurementType: "pre" | "post"
  onContinue: () => void
  redirectTo: string
}) {
  const router = useRouter()
  const isPost = measurementType === "post"

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col items-center text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h1 className="text-2xl font-semibold">Befragung abgeschlossen</h1>
        <p className="text-muted-foreground text-sm max-w-md">
          {isPost
            ? "Deine Abschlussbefragung ist gespeichert. Die Studie ist damit abgeschlossen."
            : "Deine Eingangsbefragung ist gespeichert. Du kannst jetzt mit KAIA starten."}
        </p>
      </div>

      <div className="space-y-6">
        {/* GSE */}
        <div className="rounded-lg border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Allgemeine Selbstwirksamkeit (GSE)</h2>
            <span className="text-xs text-muted-foreground">Schwarzer & Jerusalem, 1995</span>
          </div>
          <ScoreBar score={gseResult.total_score} max={4} label="Gesamtscore" />
          <p className="text-xs text-muted-foreground">
            Skala 1 (stimmt nicht) bis 4 (stimmt genau) · 10 Items · Mittelwert
          </p>
        </div>

        {/* MSLQ */}
        <div className="rounded-lg border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Lernstrategien & Motivation (MSLQ)</h2>
            <span className="text-xs text-muted-foreground">Pintrich et al., 1991/1993</span>
          </div>
          {Object.entries(mslqResult.subscale_scores).map(([key, score]) => (
            <ScoreBar
              key={key}
              score={score}
              max={7}
              label={SUBSCALE_LABELS[key] ?? key}
            />
          ))}
          <p className="text-xs text-muted-foreground">
            Skala 1 (trifft gar nicht zu) bis 7 (trifft vollständig zu) · 30 Items · Subskalen-Mittelwerte
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Diese Werte dienen als {isPost ? "Abschluss-" : "Ausgangs-"}messung für die Studie. Sie werden nicht für Diagnosen verwendet.
        </p>
      </div>

      <button
        onClick={() => router.push(redirectTo)}
        className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {isPost ? "Zur Übersicht →" : "Zu KAIA →"}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  measurementType: "pre" | "post"
  redirectTo: string
}

export function SurveyForm({ measurementType, redirectTo }: Props) {
  const [step, setStep] = useState<"intro" | "mslq" | "gse" | "done">("intro")
  const [mslqAnswers, setMslqAnswers] = useState<Record<string, number>>({})
  const [gseAnswers, setGseAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mslqResult, setMslqResult] = useState<MslqResult | null>(null)
  const [gseResult, setGseResult] = useState<GseResult | null>(null)

  // Shuffle once per form instance — stable within a session
  const shuffledMslq = useMemo<MslqItem[]>(() => shuffle(MSLQ_ITEMS_RAW), [])
  const shuffledGse = useMemo<Array<{ text: string; originalIdx: number }>>(
    () => shuffle(GSE_ITEMS_RAW.map((text, idx) => ({ text, originalIdx: idx }))),
    []
  )

  const mslqDone = shuffledMslq.every((i) => mslqAnswers[String(i.num)] != null)
  const gseDone = shuffledGse.every((i) => gseAnswers[i.originalIdx] != null)

  const mslqAnsweredCount = Object.keys(mslqAnswers).length
  const gseAnsweredCount = Object.keys(gseAnswers).length

  const setMslq = useCallback((num: number, val: number) => {
    setMslqAnswers((prev) => ({ ...prev, [String(num)]: val }))
  }, [])

  const setGse = useCallback((originalIdx: number, val: number) => {
    setGseAnswers((prev) => ({ ...prev, [originalIdx]: val }))
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const headers = { "Content-Type": "application/json" }

      // Submit MSLQ
      const mslqRes = await authFetch("/api/v1/survey/mslq", {
        method: "POST",
        headers,
        body: JSON.stringify({ measurement_type: measurementType, items: mslqAnswers }),
      })
      if (!mslqRes.ok) {
        const msg = await mslqRes.text().catch(() => mslqRes.statusText)
        throw new Error(msg)
      }
      const mslqData = await mslqRes.json() as MslqResult
      setMslqResult(mslqData)

      // Submit GSE (items as 1-indexed array in original order)
      const gseItems = GSE_ITEMS_RAW.map((_, idx) => gseAnswers[idx])
      const gseRes = await authFetch("/api/v1/survey/gse", {
        method: "POST",
        headers,
        body: JSON.stringify({ measurement_type: measurementType, items: gseItems }),
      })
      if (!gseRes.ok) {
        const msg = await gseRes.text().catch(() => gseRes.statusText)
        throw new Error(msg)
      }
      const gseData = await gseRes.json() as GseResult
      setGseResult(gseData)

      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler. Bitte nochmal versuchen.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Evaluation ──────────────────────────────────────────────────────────────

  if (step === "done" && mslqResult && gseResult) {
    return (
      <EvaluationPanel
        mslqResult={mslqResult}
        gseResult={gseResult}
        measurementType={measurementType}
        onContinue={() => {}}
        redirectTo={redirectTo}
      />
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (step === "intro") {
    const isPost = measurementType === "post"
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {isPost ? "Abschlussbefragung" : "Eingangsbefragung"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isPost ? "Wie hat sich dein Lernen verändert?" : "Wie lernst du bisher?"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isPost
              ? "Du hast mindestens 10 Sessions mit KAIA abgeschlossen. Dieser kurze Fragebogen erfasst, wie sich deine Lernstrategien und deine Selbstwirksamkeit verändert haben."
              : "Bevor du mit KAIA startest, beantworten wir kurz: Wie gehst du bisher ans Lernen heran? Das dauert ca. 8–10 Minuten."}
          </p>
        </div>

        <div className="rounded-lg border border-border p-5 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Was dich erwartet</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">30</span><span>Aussagen zu Lernstrategien und Motivation (7-stufige Skala)</span></div>
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">10</span><span>Aussagen zur allgemeinen Selbstwirksamkeit (4-stufige Skala)</span></div>
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">~8</span><span>Minuten Gesamtzeit</span></div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
          Deine Antworten werden nur für die Masterthesis-Studie verwendet und nicht mit Dritten geteilt. Du hast jederzeit das Recht auf Auskunft und Löschung (DSGVO Art. 15–17).
        </div>

        <button
          onClick={() => setStep("mslq")}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Jetzt starten
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ── MSLQ & GSE ─────────────────────────────────────────────────────────────

  const totalAnswered = mslqAnsweredCount + gseAnsweredCount
  const totalItems = shuffledMslq.length + shuffledGse.length
  const overallPct = Math.round((totalAnswered / totalItems) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Global progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{totalAnswered} von {totalItems} Aussagen beantwortet</span>
          <span className="font-medium">{overallPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        {/* Section tabs */}
        <div className="flex gap-4 pt-1">
          <button
            onClick={() => setStep("mslq")}
            className={`flex items-center gap-1.5 text-xs pb-0.5 transition-colors ${
              step === "mslq" ? "text-foreground border-b border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              mslqDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
            }`}>{mslqDone ? "✓" : mslqAnsweredCount}</span>
            Lernstrategien ({shuffledMslq.length})
          </button>
          <button
            onClick={() => mslqDone && setStep("gse")}
            disabled={!mslqDone}
            className={`flex items-center gap-1.5 text-xs pb-0.5 transition-colors ${
              step === "gse" ? "text-foreground border-b border-foreground"
              : mslqDone ? "text-muted-foreground hover:text-foreground"
              : "opacity-40 cursor-not-allowed text-muted-foreground"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              gseDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
            }`}>{gseDone ? "✓" : gseAnsweredCount}</span>
            Selbstwirksamkeit ({shuffledGse.length})
          </button>
        </div>
      </div>

      {step === "mslq" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Lernstrategien & Motivation</h2>
            <span className="text-xs text-muted-foreground">{mslqAnsweredCount}/{shuffledMslq.length}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Bewerte jede Aussage: <strong>1</strong> = trifft gar nicht zu · <strong>7</strong> = trifft vollständig zu.
            Die Aussagen sind gemischt dargestellt.
          </p>
          <div>
            {shuffledMslq.map((item, idx) => (
              <LikertRow7
                key={item.num}
                text={item.text}
                value={mslqAnswers[String(item.num)] ?? null}
                onChange={(v) => setMslq(item.num, v)}
                index={idx}
                total={shuffledMslq.length}
              />
            ))}
          </div>
          <div className="pt-6">
            <button
              onClick={() => setStep("gse")}
              disabled={!mslqDone}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter zu Selbstwirksamkeit
              <ChevronRight className="h-4 w-4" />
            </button>
            {!mslqDone && (
              <p className="text-xs text-muted-foreground mt-2">
                Noch {shuffledMslq.length - mslqAnsweredCount} Aussagen offen.
              </p>
            )}
          </div>
        </div>
      )}

      {step === "gse" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Allgemeine Selbstwirksamkeit</h2>
            <span className="text-xs text-muted-foreground">{gseAnsweredCount}/{shuffledGse.length}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Schwarzer & Jerusalem, 1995 · Wähle für jede Aussage wie sehr sie auf dich zutrifft.
          </p>
          <div>
            {shuffledGse.map((item, idx) => (
              <LikertRow4
                key={item.originalIdx}
                text={item.text}
                value={gseAnswers[item.originalIdx] ?? null}
                onChange={(v) => setGse(item.originalIdx, v)}
                index={idx}
                total={shuffledGse.length}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={!gseDone || submitting}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed w-fit"
            >
              {submitting ? "Wird gespeichert…" : "Abschicken"}
              {!submitting && <CheckCircle2 className="h-4 w-4" />}
            </button>
            {!gseDone && (
              <p className="text-xs text-muted-foreground">
                Noch {shuffledGse.length - gseAnsweredCount} Aussagen offen.
              </p>
            )}
            <button
              onClick={() => setStep("mslq")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              ← Zurück zu Lernstrategien
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
