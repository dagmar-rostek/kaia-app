import { readDoc } from "@/lib/docs"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Entwicklungs-Tagebuch — KAIA",
  description: "Das ehrliche Protokoll hinter KAIA — Entscheidungen, Rückschläge, kleine Siege. Geschrieben von den Agenten im Team.",
}

function getLog(): string {
  return readDoc("DAILY_LOG.md", "# KAIA Entwicklungs-Tagebuch\n\nKeine Einträge vorhanden.")
}

export default function TagebuchPage() {
  const raw = getLog()

  // Split into entries by ## heading
  const entries = raw
    .split(/^(?=## )/m)
    .filter((block) => block.startsWith("## "))

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Entwicklungs-Tagebuch</h1>
        <p className="text-muted-foreground leading-relaxed">
          Was wirklich passiert wenn man eine KI-Lernanwendung für eine Masterthesis baut.
          Entscheidungen, Rückschläge, Streit zwischen Agenten und kleine Siege —
          protokolliert vom Koordinator. Immer ehrlich, manchmal dramatisch.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live-Dokument · wird täglich aktualisiert</span>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-10">
        {entries.map((entry, i) => {
          const lines = entry.split("\n")
          const heading = lines[0].replace(/^## /, "").trim()
          const body = lines.slice(1).join("\n").trim()

          // Extract subtitle from italic line after ---
          const subMatch = body.match(/^\*([^*]+)\*/m)
          const subtitle = subMatch?.[1] ?? null

          // Clean body for display (remove the --- separators, format blockquotes)
          const paragraphs = body
            .split(/\n{2,}/)
            .filter(Boolean)
            .filter((p) => p !== "---")

          return (
            <article key={i} className="space-y-5 border-b border-border pb-10 last:border-0">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight leading-snug">{heading}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground italic">{subtitle}</p>
                )}
              </div>

              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                {paragraphs.map((para, j) => {
                  // Blockquote
                  if (para.startsWith(">")) {
                    return (
                      <blockquote
                        key={j}
                        className="border-l-2 border-border pl-4 text-foreground/80 italic"
                      >
                        {para.replace(/^>\s*/, "")}
                      </blockquote>
                    )
                  }
                  // Bold headings like **Morgens: ...**
                  if (para.startsWith("**") && para.endsWith("**")) {
                    return (
                      <p key={j} className="font-semibold text-foreground">
                        {para.replace(/\*\*/g, "")}
                      </p>
                    )
                  }
                  // Meta line (commits, costs, tomorrow)
                  if (para.startsWith("**Commits:**") || para.startsWith("**Kosten") || para.startsWith("**Was heute") || para.startsWith("**Morgen:**")) {
                    return (
                      <p key={j} className="text-xs font-mono text-muted-foreground/70 border-t border-border pt-3">
                        {para.replace(/\*\*/g, "")}
                      </p>
                    )
                  }
                  // Skip italic-only lines (subtitle already handled)
                  if (para.match(/^\*[^*]+\*$/) && j === 0) return null
                  return <p key={j}>{para.replace(/\*\*/g, "")}</p>
                })}
              </div>
            </article>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-8 text-xs text-muted-foreground space-y-1">
        <p>Dieses Tagebuch ist ein Teil der Masterthesis von Dagmar Rostek (M.Sc. Data Science & Analytics, SRH Fernhochschule Riedlingen).</p>
        <p>Der Code ist öffentlich zugänglich. Die Personen hinter den Agenten-Namen sind fiktiv.</p>
      </div>
    </div>
  )
}
