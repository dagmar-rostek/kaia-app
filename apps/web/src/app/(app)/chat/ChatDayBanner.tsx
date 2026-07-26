"use client"

import { X } from "lucide-react"

const SESSION_HINTS: Record<number, string> = {
  1:  "Ankern — heute lernen du und KAIA euch kennen.",
  2:  "Kartieren — was weißt du schon, ohne es gewusst zu haben?",
  3:  "Erden — hier wird das Abstrakte konkret.",
  4:  "Ausprobieren — was hast du seit letzter Session tatsächlich gemacht?",
  5:  "Spiegel — Halbzeit. Schau zurück, bevor es weiter geht.",
  6:  "Reiben — KAIA stellt jetzt die unbequemen Fragen.",
  7:  "Schärfen — was glaubst du wirklich?",
  8:  "Übergeben — KAIA tritt zurück. Du übernimmst.",
  9:  "Konsolidieren — vorletzte Session. Was bleibt?",
  10: "Loslassen — letzte Session. Danach bist du auf dich gestellt.",
}

function getJourneyHint(sessionNumber: number): string {
  return SESSION_HINTS[sessionNumber] ?? ""
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
