"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

// ── GSE items (Schwarzer & Jerusalem, 1995) ───────────────────────────────────

const GSE_ITEMS = [
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

type MslqItem = { num: number; text: string }

const MSLQ_ITEMS: MslqItem[] = [
  // Intrinsic Goal Orientation
  { num: 1,  text: "Ich bevorzuge Lerninhalte, die mich wirklich herausfordern, weil ich dabei Neues lerne." },
  { num: 16, text: "Ich beschäftige mich lieber mit Inhalten, die meine Neugier wecken — auch wenn sie schwieriger sind." },
  { num: 22, text: "Das Befriedigendste beim Lernen ist für mich, etwas wirklich in der Tiefe zu verstehen." },
  { num: 24, text: "Ich wähle Lernwege, bei denen ich am meisten lerne — auch wenn sie aufwändiger sind." },
  // Self-Efficacy
  { num: 5,  text: "Ich bin überzeugt, dass ich mein Lernthema wirklich durchdringen kann." },
  { num: 6,  text: "Ich bin sicher, dass ich auch schwierige Inhalte meines Lernthemas verstehen kann." },
  { num: 12, text: "Ich bin zuversichtlich, die grundlegenden Konzepte meines Lernthemas zu verstehen." },
  { num: 15, text: "Ich traue mir zu, auch komplexe Zusammenhänge in meinem Lernthema zu durchdringen." },
  { num: 20, text: "Ich bin sicher, dass ich beim Lernen gute Ergebnisse erzielen kann, wenn ich mich anstrenge." },
  { num: 21, text: "Ich erwarte, dass ich mit meinem Lernthema gut vorankomme." },
  { num: 29, text: "Ich bin überzeugt, dass ich die Fähigkeiten, die ich mir vornehme, wirklich erwerben kann." },
  { num: 31, text: "Angesichts der Anforderungen meines Lernthemas und meiner bisherigen Fähigkeiten bin ich zuversichtlich, erfolgreich zu sein." },
  // Elaboration
  { num: 53, text: "Beim Lernen verknüpfe ich Informationen aus verschiedenen Quellen miteinander." },
  { num: 62, text: "Ich versuche, neue Ideen mit dem zu verbinden, was ich aus anderen Bereichen weiß." },
  { num: 64, text: "Wenn ich neue Inhalte lerne, versuche ich sie mit dem zu verknüpfen, was ich bereits weiß." },
  { num: 67, text: "Ich schreibe kurze Zusammenfassungen der wichtigsten Gedanken, um sie zu festigen." },
  { num: 69, text: "Ich versuche, Inhalte zu verstehen, indem ich Verbindungen zwischen verschiedenen Konzepten herstelle." },
  { num: 81, text: "Ich versuche, Ideen aus meinem Lernthema in anderen Situationen anzuwenden." },
  // Metacognitive Self-Regulation
  { num: 33, text: "Beim Lernen verpasse ich oft Wichtiges, weil ich an anderes denke." },
  { num: 36, text: "Ich stelle mir selbst Fragen, um mein Lernen zu fokussieren." },
  { num: 41, text: "Wenn mir etwas unklar ist, kehre ich zurück und versuche es zu klären." },
  { num: 44, text: "Wenn Inhalte schwer zu verstehen sind, ändere ich meine Lernstrategie." },
  { num: 54, text: "Bevor ich etwas gründlich lerne, verschaffe ich mir erst einen Überblick über die Struktur." },
  { num: 55, text: "Ich stelle mir selbst Fragen, um zu prüfen ob ich den Stoff wirklich verstanden habe." },
  { num: 56, text: "Ich passe meine Lernweise an, wenn ich merke, dass mein Vorgehen nicht funktioniert." },
  { num: 57, text: "Ich merke oft, dass ich gelernt habe, ohne wirklich aufgenommen zu haben, worum es ging." },
  { num: 61, text: "Ich denke ein Thema durch und überlege, was ich daraus mitnehmen will — statt es nur zu wiederholen." },
  { num: 76, text: "Beim Lernen versuche ich herauszufinden, welche Konzepte mir noch unklar sind." },
  { num: 78, text: "Ich setze mir Lernziele, um meine Aktivitäten in jeder Lerneinheit zu steuern." },
  { num: 79, text: "Wenn mir etwas unklar bleibt, sorge ich dafür, dass ich es im Nachgang kläre." },
]

const MSLQ_LABELS: [string, string] = ["Trifft gar nicht zu", "Trifft vollständig zu"]
const GSE_LABELS = ["Stimmt nicht", "Stimmt kaum", "Stimmt eher", "Stimmt genau"]

// ── Likert components ─────────────────────────────────────────────────────────

function LikertRow7({
  text,
  value,
  onChange,
}: {
  text: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
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

function LikertRow4({
  text,
  value,
  onChange,
}: {
  text: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
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

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  measurementType: "pre" | "post"
  redirectTo: string
}

export function SurveyForm({ measurementType, redirectTo }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<"intro" | "mslq" | "gse" | "done">("intro")
  const [mslqAnswers, setMslqAnswers] = useState<Record<string, number>>({})
  const [gseAnswers, setGseAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mslqDone = MSLQ_ITEMS.every((i) => mslqAnswers[String(i.num)] != null)
  const gseDone = GSE_ITEMS.every((_, idx) => gseAnswers[idx] != null)

  const setMslq = useCallback((num: number, val: number) => {
    setMslqAnswers((prev) => ({ ...prev, [String(num)]: val }))
  }, [])

  const setGse = useCallback((idx: number, val: number) => {
    setGseAnswers((prev) => ({ ...prev, [idx]: val }))
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      // Submit MSLQ
      await api.post("/v1/survey/mslq", {
        measurement_type: measurementType,
        items: mslqAnswers,
      })
      // Submit GSE (items as 1-indexed array)
      const gseItems = GSE_ITEMS.map((_, idx) => gseAnswers[idx])
      await api.post("/v1/survey/gse", {
        measurement_type: measurementType,
        items: gseItems,
      })
      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler. Bitte nochmal versuchen.")
    } finally {
      setSubmitting(false)
    }
  }

  const answeredCount = Object.keys(mslqAnswers).length + Object.keys(gseAnswers).length
  const totalItems = MSLQ_ITEMS.length + GSE_ITEMS.length
  const progressPct = Math.round((answeredCount / totalItems) * 100)

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

  // ── Done ───────────────────────────────────────────────────────────────────

  if (step === "done") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Danke!</h1>
          <p className="text-muted-foreground">
            {measurementType === "pre"
              ? "Deine Eingangsbefragung ist gespeichert. Du kannst jetzt mit KAIA starten."
              : "Deine Abschlussbefragung ist gespeichert. Die Studie ist damit abgeschlossen."}
          </p>
        </div>
        <button
          onClick={() => router.push(redirectTo)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {measurementType === "pre" ? "Zu KAIA →" : "Zur Übersicht →"}
        </button>
      </div>
    )
  }

  // ── MSLQ & GSE ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{answeredCount} von {totalItems} beantwortet</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-foreground transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <button
            onClick={() => setStep("mslq")}
            className={`pb-0.5 transition-colors ${step === "mslq" ? "text-foreground border-b border-foreground" : "hover:text-foreground"}`}
          >
            Lernstrategien (30)
          </button>
          <button
            onClick={() => mslqDone && setStep("gse")}
            disabled={!mslqDone}
            className={`pb-0.5 transition-colors ${step === "gse" ? "text-foreground border-b border-foreground" : mslqDone ? "hover:text-foreground" : "opacity-40 cursor-not-allowed"}`}
          >
            Selbstwirksamkeit (10)
          </button>
        </div>
      </div>

      {step === "mslq" && (
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Lernstrategien & Motivation</h2>
          <p className="text-sm text-muted-foreground mb-4">Bewerte jede Aussage: <strong>1</strong> = trifft gar nicht zu · <strong>7</strong> = trifft vollständig zu</p>
          <div>
            {MSLQ_ITEMS.map((item) => (
              <LikertRow7
                key={item.num}
                text={item.text}
                value={mslqAnswers[String(item.num)] ?? null}
                onChange={(v) => setMslq(item.num, v)}
              />
            ))}
          </div>
          <div className="pt-6">
            <button
              onClick={() => setStep("gse")}
              disabled={!mslqDone}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>
            {!mslqDone && (
              <p className="text-xs text-muted-foreground mt-2">
                Noch {MSLQ_ITEMS.length - Object.keys(mslqAnswers).length} Aussagen offen.
              </p>
            )}
          </div>
        </div>
      )}

      {step === "gse" && (
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Allgemeine Selbstwirksamkeit</h2>
          <p className="text-sm text-muted-foreground mb-4">Schwarzer & Jerusalem, 1995 · Wähle für jede Aussage wie sehr sie auf dich zutrifft.</p>
          <div>
            {GSE_ITEMS.map((text, idx) => (
              <LikertRow4
                key={idx}
                text={text}
                value={gseAnswers[idx] ?? null}
                onChange={(v) => setGse(idx, v)}
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
                Noch {GSE_ITEMS.length - Object.keys(gseAnswers).length} Aussagen offen.
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
