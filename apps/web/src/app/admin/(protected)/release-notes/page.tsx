import { readDoc } from "@/lib/docs"

export const dynamic = "force-dynamic"

function getReleaseNotes(): string {
  return readDoc("RELEASE_NOTES.md", "# Release Notes\n\nNoch keine Einträge vorhanden.")
}

function parseEntries(md: string) {
  const sections: {
    date: string
    entries: { sha: string; kategorie: string; note: string; aufwand: string }[]
  }[] = []

  const blocks = md.split(/^## /m).slice(1)
  for (const block of blocks) {
    const dateMatch = block.match(/^(.+)\n/)
    if (!dateMatch) continue
    const date = dateMatch[1].trim()
    const entries: (typeof sections)[0]["entries"] = []
    let currentKat = "Verbesserung"

    for (const line of block.split("\n")) {
      const katM = line.match(/^### .+? (.+)$/)
      if (katM) { currentKat = katM[1]; continue }
      const entM = line.match(/\*\*(?:[^`]+·\s)?`([a-f0-9]+)`\*\* — (.+?)(?:\s·\s`([^`]+)`)?  $/)
      if (entM) {
        entries.push({ sha: entM[1], kategorie: currentKat, note: entM[2], aufwand: entM[3] ?? "" })
      }
    }
    if (entries.length) sections.push({ date, entries })
  }
  return sections
}

const KATEGORIE_COLOR: Record<string, string> = {
  Neu: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Verbesserung: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fix: "bg-red-500/10 text-red-500 border-red-500/20",
  Infra: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Docs: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export default function AdminReleaseNotesPage() {
  const md = getReleaseNotes()
  const sections = parseEntries(md)
  const totalEntries = sections.reduce((s, sec) => s + sec.entries.length, 0)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Release Notes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Changelog aus <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/RELEASE_NOTES.md</code>
        </p>
        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{totalEntries}</strong> Einträge
          </span>
          <span>
            <strong className="text-foreground">{sections.length}</strong> Release-Tage
          </span>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="text-muted-foreground text-sm">Noch keine Einträge.</p>
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={sec.date}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background/80 backdrop-blur py-2">
                {sec.date}
              </h2>
              <div className="space-y-2">
                {sec.entries.map((e) => (
                  <div
                    key={e.sha}
                    className="rounded-lg border border-border p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${KATEGORIE_COLOR[e.kategorie] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                          {e.kategorie}
                        </span>
                        <code className="text-xs text-muted-foreground font-mono">{e.sha}</code>
                      </div>
                      {e.aufwand && (
                        <span className="text-xs text-muted-foreground tabular-nums">{e.aufwand}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{e.note}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
