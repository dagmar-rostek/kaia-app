"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

const STUDY_START = new Date("2026-07-16T00:00:00")

function pad(n: number) {
  return String(n).padStart(2, "0")
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function getTimeLeft(): TimeLeft {
  const total = Math.max(0, STUDY_START.getTime() - Date.now())
  return {
    total,
    days:    Math.floor(total / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  }
}

export function StudyCountdown({ label = "Registrierung öffnet in" }: { label?: string }) {
  const [t, setT] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!t) return null

  if (t.total <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Registrierung ist jetzt geöffnet!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
        <Clock className="h-3 w-3" />
        {label}
      </p>
      <div className="flex items-start gap-3 justify-center">
        {[
          { value: t.days,    label: "Tage" },
          { value: t.hours,   label: "Stunden" },
          { value: t.minutes, label: "Minuten" },
          { value: t.seconds, label: "Sekunden" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl border border-border bg-muted/40 flex items-center justify-center">
              <span className="text-2xl font-bold font-mono tabular-nums">{pad(value)}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1.5">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        16. Juli 2026 · Studienstart
      </p>
    </div>
  )
}
