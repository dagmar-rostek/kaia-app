"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen, CheckCircle2, Clock, AlertTriangle, FileText,
  Target, FlaskConical, Brain, Code2, GraduationCap,
} from "lucide-react"

// ── Deadline ──────────────────────────────────────────────────────────────────

const DEADLINE = new Date("2026-09-01T00:00:00")
const BUFFER_DATE = new Date("2026-09-22T00:00:00") // 3 weeks buffer

function useCountdown(target: Date) {
  const [ms, setMs] = useState(() => Math.max(0, target.getTime() - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setMs(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  const days    = Math.floor(ms / 86_400_000)
  const hours   = Math.floor((ms % 86_400_000) / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  return { days, hours, minutes, seconds, ms }
}

function pad(n: number) { return String(n).padStart(2, "0") }

// ── Chapter data ──────────────────────────────────────────────────────────────

type ChapterStatus = "done" | "draft" | "planned" | "blocked"

interface Chapter {
  num: string
  title: string
  subtitle: string
  href: string
  status: ChapterStatus
  pages: string
  words: string
  deadline: string
  icon: React.ElementType
  note?: string
}

const CHAPTERS: Chapter[] = [
  {
    num: "1",
    title: "Einleitung",
    subtitle: "Problemstellung · Zielsetzung · Aufbau",
    href: "/admin/kap1",
    status: "planned",
    pages: "8–10",
    words: "~2.000",
    deadline: "August 2026",
    icon: BookOpen,
    note: "Bewusst zuletzt — erst nach Vorliegen der Ergebnisse.",
  },
  {
    num: "2",
    title: "Theoretischer Hintergrund",
    subtitle: "Konstruktivismus · Selbstwirksamkeit · Flow · KI · DSR",
    href: "/admin/theorie",
    status: "draft",
    pages: "15–18",
    words: "~3.500",
    deadline: "Stand: 04.06.2026",
    icon: Brain,
    note: "Draft v1.1 — Psychologe-Review ✓ (Kap. 2.2–2.5). Kap. 2.6–2.9 ausbaufähig.",
  },
  {
    num: "3",
    title: "Konzeptionelles Rahmenwerk",
    subtitle: "Zustandserkennung · Sokratik · Gedächtnis · Characters",
    href: "/admin/kap3",
    status: "draft",
    pages: "15–18",
    words: "~4.000",
    deadline: "Juli 2026",
    icon: Target,
    note: "Draft v0.3 — Kap. 3.5 (Synthese) ausstehend nach Abschluss Kap. 4.",
  },
  {
    num: "4",
    title: "Technische Implementierung",
    subtitle: "Architektur · Auth · Chat · LLM · DSGVO",
    href: "/admin/kap4",
    status: "draft",
    pages: "18–22",
    words: "~5.000",
    deadline: "Juli 2026",
    icon: Code2,
    note: "Chat/LLM-Abschnitte folgen mit Implementierung (Juli).",
  },
  {
    num: "5",
    title: "LLM-Evaluationsbericht",
    subtitle: "Claude · GPT-4o · Mistral — 4 Dimensionen",
    href: "/admin/kap5",
    status: "draft",
    pages: "12–15",
    words: "~3.200",
    deadline: "Juli 2026 (Ergebnisse)",
    icon: FlaskConical,
    note: "Methodik fertig. Evaluation & Ergebnisse: Juli.",
  },
  {
    num: "6",
    title: "Pilotstudie & Evaluation",
    subtitle: "GSE Prä/Post · N=32 · H1–H3 · Diskussion",
    href: "/admin/kap6",
    status: "draft",
    pages: "20–25",
    words: "~5.500",
    deadline: "Aug./Sep. 2026 (Ergebnisse)",
    icon: GraduationCap,
    note: "Studiendesign fertig. Daten: August. Auswertung: September.",
  },
]

const STATUS_CONFIG: Record<ChapterStatus, { label: string; cls: string; dot: string }> = {
  done:    { label: "Fertig",     cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", dot: "bg-emerald-500" },
  draft:   { label: "In Arbeit",  cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",           dot: "bg-blue-500" },
  planned: { label: "Geplant",    cls: "bg-muted text-muted-foreground border-border",                                  dot: "bg-muted-foreground/40" },
  blocked: { label: "Blockiert",  cls: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",               dot: "bg-red-500" },
}

const SRH_REQUIREMENTS = [
  { label: "Nettotext",        value: "80 Seiten ±10%",               done: false },
  { label: "Quellen",          value: "min. 50 wissenschaftliche",     done: false },
  { label: "Zitierformat",     value: "APA / DGPs 4. Auflage",        done: false },
  { label: "Schrift",          value: "Arial 11pt, 1,5-zeilig",       done: false },
  { label: "Einreichung",      value: "3 Exemplare, Klebebindung",    done: false },
  { label: "Abstract",         value: "Deutsch, max. 1 Seite",        done: false },
  { label: "Eidesstattl. Erl.", value: "Unterschrieben, letzte Seite", done: false },
]

// ── Countdown Block ───────────────────────────────────────────────────────────

function CountdownBlock() {
  const { days, hours, minutes, seconds } = useCountdown(DEADLINE)
  const { days: bufDays } = useCountdown(BUFFER_DATE)
  const totalDays = Math.ceil((DEADLINE.getTime() - new Date("2026-06-04").getTime()) / 86_400_000)
  const remaining = days
  const progress = Math.max(0, Math.min(100, ((totalDays - remaining) / totalDays) * 100))

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Abgabe-Countdown
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ziel: 01. September 2026 · Puffer: bis 22. September 2026
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {bufDays} Tage bis Puffer-Ende
          </span>
        </div>

        {/* Big timer */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: days,    label: "Tage"    },
            { value: hours,   label: "Stunden" },
            { value: minutes, label: "Minuten" },
            { value: seconds, label: "Sekunden" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-lg bg-muted/40 border border-border p-3 text-center">
              <p className="text-3xl font-bold font-mono tabular-nums tracking-tight">
                {pad(value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>04. Juni 2026</span>
            <span className="font-medium">{Math.round(progress)}% der Zeit verstrichen</span>
            <span>01. Sep. 2026</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline milestones */}
      <div className="border-t border-border px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: "Kap. 3–4 fertig",    date: "Juli 2026",      done: false },
            { label: "LLM-Evaluation",      date: "Juli 2026",      done: false },
            { label: "Studie abgeschlossen",date: "August 2026",    done: false },
            { label: "Abgabe",              date: "01. Sep. 2026",  done: false },
          ].map(({ label, date, done }) => (
            <div key={label} className={`rounded border p-2.5 space-y-0.5 ${done ? "bg-emerald-500/5 border-emerald-500/20" : "border-border"}`}>
              {done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                : <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              }
              <p className={`font-medium ${done ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{label}</p>
              <p className="text-muted-foreground">{date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ThesisPage() {
  const totalPages = CHAPTERS.reduce((s, c) => {
    const [min] = c.pages.split("–").map(Number)
    return s + (min || 0)
  }, 0)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Masterthesis — Schreib-Cockpit</h1>
        <p className="text-muted-foreground text-sm">
          KAIA: Neuroadaptiver KI-Lernbegleiter · M.Sc. Data Science & Analytics · SRH Riedlingen
        </p>
      </div>

      {/* Countdown */}
      <CountdownBlock />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Kapitel gesamt",  value: "6",          cls: "text-foreground" },
          { label: "In Arbeit",       value: "5",          cls: "text-blue-500"   },
          { label: "Min. Seiten",     value: `${totalPages}+`, cls: "text-muted-foreground" },
          { label: "Ziel-Quellen",    value: "50+",        cls: "text-violet-500" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-0.5">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4" /> Kapitel
        </h2>
        <div className="space-y-2">
          {CHAPTERS.map((ch) => {
            const s = STATUS_CONFIG[ch.status]
            const Icon = ch.icon
            return (
              <Link key={ch.num} href={ch.href} className="block rounded-lg border border-border hover:bg-muted/20 transition-colors p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-xs font-mono text-muted-foreground">Kap. {ch.num}</span>
                        <h3 className="text-sm font-semibold">{ch.title}</h3>
                        <p className="text-xs text-muted-foreground">{ch.subtitle}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 ${s.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span><strong className="text-foreground">Umfang:</strong> {ch.pages} Seiten ({ch.words} Wörter)</span>
                      <span><strong className="text-foreground">Ziel:</strong> {ch.deadline}</span>
                    </div>
                    {ch.note && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border/60 pl-2">{ch.note}</p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* SRH Requirements */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> SRH Formalvorgaben (Leitfaden 1292-01)
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {SRH_REQUIREMENTS.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20">
                <div className="flex items-center gap-2.5">
                  {r.done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                  }
                  <span className={`text-sm ${r.done ? "line-through text-muted-foreground" : ""}`}>{r.label}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Zitierformat: <strong>DGPs / APA 4. Auflage</strong> — Deutsche Gesellschaft für Psychologie (2016). Schrift: Arial 11pt, 1,5-zeilig, Blocksatz. Ränder: 2,5/2/4/2 cm (oben/unten/links/rechts).
        </p>
      </div>

    </div>
  )
}
