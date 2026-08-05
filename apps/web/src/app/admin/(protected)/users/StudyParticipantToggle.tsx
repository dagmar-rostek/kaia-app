"use client"

import { useState, useTransition } from "react"
import { setStudyParticipant } from "./actions"

export function StudyParticipantToggle({
  userId,
  initialValue,
}: {
  userId: number
  initialValue: boolean
}) {
  const [isParticipant, setIsParticipant] = useState(initialValue)
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    const next = !isParticipant
    setIsParticipant(next) // optimistic update
    startTransition(async () => {
      const ok = await setStudyParticipant(userId, next)
      if (!ok) {
        setIsParticipant(!next) // revert on failure
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={isParticipant ? "Aus Studie entfernen" : "Zur Studie hinzufügen"}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50
        ${isParticipant
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
          : "border-border bg-transparent text-muted-foreground hover:bg-muted"
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${
          isParticipant ? "bg-emerald-500" : "border border-muted-foreground/50"
        }`}
      />
      {isParticipant ? "Studie ✓" : "Studie"}
    </button>
  )
}
