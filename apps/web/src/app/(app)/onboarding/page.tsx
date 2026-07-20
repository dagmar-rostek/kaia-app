"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Map, ArrowRight, Loader2 } from "lucide-react"
import { authFetch } from "@/lib/auth"
import { useTopicEval } from "@/hooks/useTopicEval"
import { TopicEvalFeedback } from "@/components/TopicEvalFeedback"

const EXAMPLES = [
  "Kritische Feedbackgespräche, die ich immer wieder aufschiebe",
  "Besser delegieren — ich weiß wie's geht, tue es aber nicht",
  "Konflikte im Team ansprechen statt auszusitzen",
  "Überzeugender präsentieren, obwohl ich die Methoden kenne",
  "Prioritäten setzen — die Theorie kenne ich, die Praxis fehlt",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { state: evalState, evaluate: evalTopic, reset: resetEval } = useTopicEval()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch("/api/v1/users/me/topic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learning_topic: trimmed }),
      })
      if (!res.ok) throw new Error(`Fehler ${res.status}`)
      router.push("/survey/pre")
    } catch {
      setError("Speichern fehlgeschlagen. Bitte versuche es erneut.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-muted">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Woran arbeitest du — obwohl du weißt wie es geht?</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            KAIA begleitet dich vier Wochen bei einem Thema, das du schon
            kennst oder verstehst — aber noch nicht wirklich in deinem Alltag lebst.
            Nicht für Einsteiger. Für Menschen, die den Schritt vom Wissen ins Tun gehen wollen.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="topic">
              Dein Thema
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={e => { setTopic(e.target.value); resetEval() }}
              onBlur={e => evalTopic(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="z. B. Kritische Feedbackgespräche, die ich immer wieder aufschiebe"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {topic.length}/500
            </p>
            <TopicEvalFeedback state={evalState} />
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Beispiele zur Inspiration:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setTopic(ex)}
                  className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Wird gespeichert…</>
            ) : (
              <>Weiter zum Fragebogen <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        {/* Journey preview */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Wie es weitergeht
          </p>
          <div className="space-y-2">
            {[
              { step: "Jetzt",        label: "Kurzfragebogen (ca. 5 Min) — einmalig vor dem Start" },
              { step: "Woche 1–4",   label: "Mind. 10 Sessions mit KAIA — à mind. 5 Minuten" },
              { step: "Am Ende",     label: "Nochmal derselbe Fragebogen — und wir vergleichen" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="text-xs font-mono text-muted-foreground/60 w-16 shrink-0 pt-0.5">
                  {step}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
