"use client"

import { X } from "lucide-react"

function getJourneyHint(sessionNumber: number): string {
  if (sessionNumber === 1) return "Erste Session — KAIA lernt dich kennen."
  if (sessionNumber <= 3) return "Einstiegsphase — lass dich auf KAIAs Fragen ein."
  if (sessionNumber <= 7) return "Hauptphase — bleib dran, auch wenn es unbequem wird."
  if (sessionNumber === 8) return "Langsam Richtung Abschluss — was hat sich verändert?"
  if (sessionNumber === 9) return "Vorletzte Session — fast geschafft."
  if (sessionNumber === 10) return "Letzte Session — danach folgt die Post-Befragung."
  return ""
}

interface Props {
  sessionNumber: number
  show: boolean
  onDismiss: () => void
}

export function ChatDayBanner({ sessionNumber, show, onDismiss }: Props) {
  if (!show) return null

  const hint = getJourneyHint(sessionNumber)

  return (
    <div className="shrink-0 border-b border-border/60 bg-muted/30 px-4 py-2.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-foreground shrink-0">
            Session {sessionNumber} von 10
          </span>
          {hint && (
            <>
              <span className="text-border/60 select-none shrink-0">·</span>
              <span className="text-xs text-muted-foreground truncate">{hint}</span>
            </>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-2.5 -m-1.5 rounded text-muted-foreground/60 hover:text-foreground transition-colors shrink-0"
          aria-label="Hinweis ausblenden"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
