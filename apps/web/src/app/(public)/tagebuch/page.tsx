import { readDoc } from "@/lib/docs"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Entwicklungs-Tagebuch — KAIA",
  description: "Das ehrliche Protokoll hinter KAIA — Entscheidungen, Rückschläge, kleine Siege. Protokolliert von den Agenten im Team.",
}

const DE_MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

interface Entry {
  date: string
  yearMonth: string
  title: string
  body: string
}

function parseEntries(md: string): Entry[] {
  const blocks = md.split(/^## /m).slice(1)
  return blocks
    .map((block) => {
      const [title, ...rest] = block.split("\n")
      const dateMatch = title.match(/^(\d{4}-\d{2}-\d{2})/)
      if (!dateMatch) return null
      return {
        date: dateMatch[1],
        yearMonth: dateMatch[1].slice(0, 7),
        title: title.trim(),
        body: rest.join("\n").trim(),
      }
    })
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-")
  return `${DE_MONTHS[parseInt(month) - 1]} ${year}`
}

function groupByMonth(entries: Entry[]): { yearMonth: string; entries: Entry[] }[] {
  const map = new Map<string, Entry[]>()
  for (const e of entries) {
    if (!map.has(e.yearMonth)) map.set(e.yearMonth, [])
    map.get(e.yearMonth)!.push(e)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([yearMonth, entries]) => ({ yearMonth, entries }))
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    return part
  })
}

function renderBody(body: string) {
  const parts = body.split(/\n\n+/)
  return parts.map((para, i) => {
    const t = para.trim()
    if (!t) return null
    if (t.startsWith("```")) {
      const code = t.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
      return (
        <pre key={i} className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed text-muted-foreground my-3">
          {code}
        </pre>
      )
    }
    if (t === "---") return <hr key={i} className="border-border my-4" />
    if (t.startsWith(">")) {
      const lines = t.split("\n").map(l => l.replace(/^>\s?/, ""))
      return (
        <blockquote key={i} className="border-l-2 border-border pl-4 my-3">
          {lines.map((l, j) => (
            <p key={j} className="text-sm text-muted-foreground italic leading-relaxed">{renderInline(l)}</p>
          ))}
        </blockquote>
      )
    }
    const boldLine = t.match(/^\*\*(.+)\*\*$/)
    if (boldLine) {
      return <h3 key={i} className="text-sm font-bold text-foreground mt-5 mb-2">{boldLine[1]}</h3>
    }
    const italicLine = t.match(/^\*(.+)\*$/)
    if (italicLine) {
      return <p key={i} className="text-sm text-muted-foreground italic leading-relaxed my-1">{italicLine[1]}</p>
    }
    if (t.startsWith("**Was heute") || t.startsWith("**Commits") || t.startsWith("**Kosten") || t.startsWith("**Morgen")) {
      return <p key={i} className="text-xs text-muted-foreground leading-relaxed my-1">{renderInline(t)}</p>
    }
    return <p key={i} className="text-sm leading-relaxed text-foreground/90 my-2">{renderInline(t)}</p>
  })
}

export default function TagebuchPage() {
  const md = readDoc("DAILY_LOG.md", "# KAIA Entwicklungs-Tagebuch\n\nNoch keine Einträge.")
  const entries = parseEntries(md)
  const groups = groupByMonth(entries)
  const newest = entries[0]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Entwicklungs-Tagebuch</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Das ehrliche Protokoll hinter KAIA — Entscheidungen, Rückschläge und kleine Siege.
          Protokolliert von den Agenten im Team. Immer ehrlich, manchmal dramatisch.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">{entries.length} Einträge · wird täglich aktualisiert</span>
        </div>
      </div>

      <div className="flex gap-8 items-start">

        <aside className="hidden lg:block w-44 shrink-0 sticky top-6 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
          <nav className="space-y-1">
            {groups.map(({ yearMonth, entries: es }) => (
              <a
                key={yearMonth}
                href={`#monat-${yearMonth}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
              >
                <span>{monthLabel(yearMonth)}</span>
                <span className="text-xs tabular-nums text-muted-foreground/60 group-hover:text-muted-foreground">{es.length}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 space-y-8">

          <details className="lg:hidden rounded-lg border border-border">
            <summary className="px-4 py-3 text-sm font-medium cursor-pointer select-none list-none flex items-center justify-between">
              <span>Timeline — {entries.length} Einträge</span>
              <span className="text-muted-foreground text-xs">▾</span>
            </summary>
            <nav className="px-4 pb-3 space-y-1 border-t border-border pt-2">
              {groups.map(({ yearMonth, entries: es }) => (
                <a key={yearMonth} href={`#monat-${yearMonth}`} className="flex items-center justify-between py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span>{monthLabel(yearMonth)}</span>
                  <span className="text-xs tabular-nums">{es.length}</span>
                </a>
              ))}
            </nav>
          </details>

          {groups.map(({ yearMonth, entries: monthEntries }) => (
            <section key={yearMonth} id={`monat-${yearMonth}`}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background/90 backdrop-blur-sm py-2">
                {monthLabel(yearMonth)}
                <span className="ml-2 font-normal normal-case tracking-normal opacity-60">
                  {monthEntries.length} {monthEntries.length === 1 ? "Eintrag" : "Einträge"}
                </span>
              </h2>
              <div className="space-y-3">
                {monthEntries.map((entry) => {
                  const isNewest = newest && entry.date === newest.date
                  return (
                    <details key={entry.title} open={isNewest} className="group rounded-lg border border-border overflow-hidden">
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none hover:bg-muted/30 transition-colors gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isNewest && (
                            <span className="shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">neu</span>
                          )}
                          <span className="text-sm font-medium truncate">{entry.title}</span>
                        </div>
                        <span className="shrink-0 text-muted-foreground text-xs transition-transform group-open:rotate-180">▾</span>
                      </summary>
                      <div className="px-5 pb-6 pt-2 border-t border-border">
                        {renderBody(entry.body)}
                      </div>
                    </details>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
