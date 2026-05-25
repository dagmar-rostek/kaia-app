import { readFileSync } from "fs"
import { join } from "path"

function getDailyLog(): string {
  try {
    return readFileSync(join(process.cwd(), "../../docs/DAILY_LOG.md"), "utf-8")
  } catch {
    return "# KAIA Entwicklungs-Tagebuch\n\nNoch keine Einträge."
  }
}

const DE_MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

interface Entry {
  date: string        // "2026-05-25"
  yearMonth: string   // "2026-05"
  title: string       // "2026-05-25 — \"Titel\""
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

function monthId(yearMonth: string): string {
  return `monat-${yearMonth}`
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

function renderBody(body: string) {
  const parts = body.split(/\n\n+/)
  return parts.map((para, i) => {
    const t = para.trim()
    if (!t) return null

    // Code block
    if (t.startsWith("```")) {
      const code = t.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
      return (
        <pre key={i} className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed text-muted-foreground my-3">
          {code}
        </pre>
      )
    }

    // Horizontal rule
    if (t === "---") {
      return <hr key={i} className="border-border my-4" />
    }

    // Blockquote (multi-line)
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

    // Timed section heading (e.g. "**08:14 Uhr — Der Architekt betritt das Gebäude**")
    const boldLine = t.match(/^\*\*(.+)\*\*$/)
    if (boldLine) {
      return (
        <h3 key={i} className="text-sm font-bold text-foreground mt-5 mb-2">
          {boldLine[1]}
        </h3>
      )
    }

    // Italic line (narrator note)
    const italicLine = t.match(/^\*(.+)\*$/)
    if (italicLine) {
      return (
        <p key={i} className="text-sm text-muted-foreground italic leading-relaxed my-1">
          {italicLine[1]}
        </p>
      )
    }

    // Summary footer lines (bold key: value)
    if (t.startsWith("**Was heute") || t.startsWith("**Commits") || t.startsWith("**Kosten") || t.startsWith("**Morgen")) {
      return (
        <p key={i} className="text-xs text-muted-foreground leading-relaxed my-1">
          {renderInline(t)}
        </p>
      )
    }

    // Regular paragraph
    return (
      <p key={i} className="text-sm leading-relaxed text-foreground/90 my-2">
        {renderInline(t)}
      </p>
    )
  })
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold**, *italic*, and `code`
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

export default function DailyLogPage() {
  const md = getDailyLog()
  const entries = parseEntries(md)
  const groups = groupByMonth(entries)
  const newest = entries[0]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Entwicklungs-Tagebuch</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {entries.length} Einträge · neuer Eintrag mit{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">/log</code> in Claude Code
        </p>
      </div>

      <div className="flex gap-8 items-start">

        {/* ── Sidebar: Monats-Index ── */}
        <aside className="hidden lg:block w-44 shrink-0 sticky top-6 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
          <nav className="space-y-1">
            {groups.map(({ yearMonth, entries: es }) => (
              <a
                key={yearMonth}
                href={`#${monthId(yearMonth)}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
              >
                <span>{monthLabel(yearMonth)}</span>
                <span className="text-xs tabular-nums text-muted-foreground/60 group-hover:text-muted-foreground">
                  {es.length}
                </span>
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Mobile: Monat-Dropdown */}
          <details className="lg:hidden rounded-lg border border-border">
            <summary className="px-4 py-3 text-sm font-medium cursor-pointer select-none list-none flex items-center justify-between">
              <span>Timeline — {entries.length} Einträge</span>
              <span className="text-muted-foreground text-xs">▾</span>
            </summary>
            <nav className="px-4 pb-3 space-y-1 border-t border-border pt-2">
              {groups.map(({ yearMonth, entries: es }) => (
                <a
                  key={yearMonth}
                  href={`#${monthId(yearMonth)}`
                  }
                  className="flex items-center justify-between py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{monthLabel(yearMonth)}</span>
                  <span className="text-xs tabular-nums">{es.length}</span>
                </a>
              ))}
            </nav>
          </details>

          {/* Einträge nach Monat gruppiert */}
          {groups.map(({ yearMonth, entries: monthEntries }) => (
            <section key={yearMonth} id={monthId(yearMonth)}>
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
                    <details
                      key={entry.date}
                      open={isNewest}
                      className="group rounded-lg border border-border overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none hover:bg-muted/30 transition-colors gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isNewest && (
                            <span className="shrink-0 inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              neu
                            </span>
                          )}
                          <span className="text-sm font-medium truncate">{entry.title}</span>
                        </div>
                        <span className="shrink-0 text-muted-foreground text-xs transition-transform group-open:rotate-180">
                          ▾
                        </span>
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

          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground">Noch keine Einträge. Mit <code className="bg-muted px-1 rounded">/log</code> starten.</p>
          )}
        </div>
      </div>
    </div>
  )
}
