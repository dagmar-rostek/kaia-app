"use client"

import { useCallback, useRef, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export type TopicEvalCategory = "knowing_doing" | "knowledge_acquisition" | "unclear"
export type TopicEvalConfidence = "high" | "medium" | "low"

export interface TopicEvalResult {
  fits_gap: boolean
  confidence: TopicEvalConfidence
  feedback: string
  suggestion: string | null
  category: TopicEvalCategory
}

export type TopicEvalState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: TopicEvalResult }
  | { status: "error"; message: string }

/**
 * Evaluiert ein Lernthema auf Passung zum KAIA Knowing-Doing-Gap-Ansatz.
 *
 * Trigger: onBlur des Topic-Inputs — nicht onChange (zu teuer).
 * Cached die letzte evaluierte Topic-Eingabe um doppelte Calls zu vermeiden.
 * Funktioniert ohne Auth — sowohl für Registrierung als auch Onboarding.
 */
export function useTopicEval() {
  const [state, setState] = useState<TopicEvalState>({ status: "idle" })
  const lastEvaluatedRef = useRef<string>("")

  const evaluate = useCallback(async (topic: string) => {
    const trimmed = topic.trim()

    // Nichts tun bei leerem Input oder unverändertem Wert
    if (!trimmed || trimmed === lastEvaluatedRef.current) return

    lastEvaluatedRef.current = trimmed
    setState({ status: "loading" })

    try {
      const res = await fetch(`${API}/v1/topics/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      })

      if (res.status === 429) {
        setState({
          status: "error",
          message: "Zu viele Anfragen. Bitte warte kurz.",
        })
        return
      }

      if (!res.ok) {
        // 503 oder andere Fehler: nicht blockieren, still fehlschlagen
        setState({ status: "idle" })
        return
      }

      const result = (await res.json()) as TopicEvalResult
      setState({ status: "done", result })
    } catch {
      // Netzwerkfehler: kein hartes UI-Blocking
      setState({ status: "idle" })
    }
  }, [])

  const reset = useCallback(() => {
    lastEvaluatedRef.current = ""
    setState({ status: "idle" })
  }, [])

  return { state, evaluate, reset }
}
