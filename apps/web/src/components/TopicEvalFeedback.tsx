"use client"

import { Loader2 } from "lucide-react"
import type { TopicEvalState } from "@/hooks/useTopicEval"

interface Props {
  state: TopicEvalState
}

/**
 * Feedback-Box unter dem Topic-Input-Feld.
 * Farbkodierung: grün (passt) / gelb (unklar) / orange (passt nicht).
 * Kein hartes Blocking — User kann immer weitermachen.
 */
export function TopicEvalFeedback({ state }: Props) {
  if (state.status === "idle") return null

  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Thema wird bewertet"
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none shrink-0" />
        <span>Thema wird eingeordnet…</span>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="text-xs text-amber-600 dark:text-amber-400">
        {state.message}
      </p>
    )
  }

  const { result } = state

  if (result.category === "knowing_doing") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 space-y-1"
      >
        <p className="font-medium">Passt gut zu KAIA.</p>
        <p>{result.feedback}</p>
      </div>
    )
  }

  if (result.category === "unclear") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400 space-y-1"
      >
        <p className="font-medium">Könnte klappen.</p>
        <p>{result.feedback}</p>
      </div>
    )
  }

  // knowledge_acquisition
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2.5 text-xs text-orange-700 dark:text-orange-400 space-y-1.5"
    >
      <p className="font-medium">Kleiner Hinweis.</p>
      <p>{result.feedback}</p>
      {result.suggestion && (
        <p className="text-orange-600/80 dark:text-orange-300/70">
          Meinst du vielleicht:{" "}
          <span className="italic">&ldquo;{result.suggestion}&rdquo;</span>
        </p>
      )}
    </div>
  )
}
