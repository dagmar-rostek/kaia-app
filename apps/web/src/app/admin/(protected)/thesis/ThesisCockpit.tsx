"use client"

import { useState, useEffect, useRef, startTransition } from "react"
import {
  BookOpen, Brain, Target, Code2, FlaskConical, GraduationCap,
} from "lucide-react"

// ── Countdown ─────────────────────────────────────────────────────────────────

const DEADLINE = new Date("2026-09-01T00:00:00")

function useCountdown() {
  const [ms, setMs] = useState(() => Math.max(0, DEADLINE.getTime() - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, DEADLINE.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [])
  return {
    days:    Math.floor(ms / 86_400_000),
    hours:   Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    ms,
  }
}

function pad(n: number) { return String(n).padStart(2, "0") }

// ── Chapter config ────────────────────────────────────────────────────────────

type KapId = "kap1" | "kap2" | "kap3" | "kap4" | "kap5" | "kap6"
type Status = "done" | "draft" | "planned"

interface KapMeta {
  id: KapId
  num: string
  title: string
  pages: string
  status: Status
  icon: React.ElementType
}

const CHAPTERS: KapMeta[] = [
  { id: "kap1", num: "1", title: "Einleitung",             pages: "8–10",  status: "planned", icon: BookOpen },
  { id: "kap2", num: "2", title: "Theoretischer Hintergrund", pages: "15–18", status: "draft",   icon: Brain },
  { id: "kap3", num: "3", title: "Konzeptionelles Rahmenwerk", pages: "15–18", status: "draft",   icon: Target },
  { id: "kap4", num: "4", title: "Technische Implementierung", pages: "18–22", status: "draft",   icon: Code2 },
  { id: "kap5", num: "5", title: "LLM-Evaluationsbericht",  pages: "12–15", status: "draft",   icon: FlaskConical },
  { id: "kap6", num: "6", title: "Pilotstudie & Evaluation", pages: "20–25", status: "draft",   icon: GraduationCap },
]

const STATUS_DOT: Record<Status, string> = {
  done:    "bg-emerald-500",
  draft:   "bg-blue-500",
  planned: "bg-muted-foreground/40",
}

// ── Main component ────────────────────────────────────────────────────────────

interface ChapterData {
  html: string
  stand: string
}

interface Props {
  chapters: Record<KapId, ChapterData>
}

export function ThesisCockpit({ chapters }: Props) {
  const [active, setActive] = useState<KapId>("kap2")
  const { days, hours, minutes, seconds } = useCountdown()
  const contentRef = useRef<HTMLDivElement>(null)

  const totalDays = 89 // June 4 → Sep 1
  const elapsed = totalDays - days
  const progress = Math.max(0, Math.min(100, (elapsed / totalDays) * 100))

  function selectChapter(id: KapId) {
    startTransition(() => setActive(id))
    contentRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden">

      {/* ── Left sidebar ── */}
      <aside className="w-52 shrink-0 border-r border-border flex flex-col overflow-y-auto">

        {/* Compact countdown */}
        <div className="px-4 py-4 border-b border-border space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Abgabe 01. Sep.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { v: days,    l: "Tage"   },
              { v: hours,   l: "Std."   },
              { v: minutes, l: "Min."   },
              { v: seconds, l: "Sek."   },
            ].map(({ v, l }) => (
              <div key={l} className="rounded bg-muted/40 border border-border px-2 py-1.5 text-center">
                <p className="text-lg font-bold font-mono tabular-nums leading-none">{pad(v)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          {/* Mini progress bar */}
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-linear-to-r from-blue-500 to-violet-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% der Zeit weg</p>
          </div>
        </div>

        {/* Chapter list */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kapitel</p>
          {CHAPTERS.map((ch) => {
            const Icon = ch.icon
            const isActive = ch.id === active
            return (
              <button
                key={ch.id}
                onClick={() => selectChapter(ch.id)}
                className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors group ${
                  isActive
                    ? "bg-foreground/8 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[ch.status]}`} />
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Kap. {ch.num}</p>
                  <p className="text-xs text-muted-foreground truncate">{ch.title}</p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* SRH requirements mini */}
        <div className="px-4 py-3 border-t border-border space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SRH Vorgaben</p>
          {[
            "80 S. ±10% Nettotext",
            "Min. 50 wiss. Quellen",
            "APA / DGPs 4. Aufl.",
            "Arial 11pt, 1,5-zeilig",
          ].map(r => (
            <div key={r} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full border border-border shrink-0" />
              <p className="text-xs text-muted-foreground">{r}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Content area — pre-rendered HTML, no React reconciliation ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {CHAPTERS.map(ch => {
          const isActive = ch.id === active
          const data = chapters[ch.id]
          return (
            <div key={ch.id} className={isActive ? "block" : "hidden"}>
              <div className="max-w-3xl mx-auto px-8 py-6 space-y-1">
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">Kapitel {ch.num}</p>
                    <h1 className="text-xl font-bold tracking-tight">{ch.title}</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stand: <span className="font-medium">{data.stand}</span>
                      {" · "}Umfang: <span className="font-medium">{ch.pages} Seiten</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium shrink-0 mt-1 ${
                    ch.status === "done"  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                    ch.status === "draft" ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ch.status]}`} />
                    {ch.status === "done" ? "Fertig" : ch.status === "draft" ? "In Arbeit" : "Geplant"}
                  </span>
                </div>
                {/* Pre-rendered HTML from server — no client-side markdown parsing */}
                <div dangerouslySetInnerHTML={{ __html: data.html }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
