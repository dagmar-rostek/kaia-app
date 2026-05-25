import { readFileSync } from "fs"
import { join } from "path"

function getDailyLog(): string {
  try {
    return readFileSync(join(process.cwd(), "../../docs/DAILY_LOG.md"), "utf-8")
  } catch {
    return "# KAIA Entwicklungs-Tagebuch\n\nNoch keine Einträge."
  }
}

function parseEntries(md: string) {
  const lines = md.split("\n")
  const headerEnd = lines.findIndex((l, i) => i > 0 && l.startsWith("## "))
  const intro = headerEnd > 0 ? lines.slice(0, headerEnd).join("\n").trim() : ""

  const entries: { title: string; body: string }[] = []
  const blocks = md.split(/^## /m).slice(1)
  for (const block of blocks) {
    const [title, ...rest] = block.split("\n")
    entries.push({ title: title.trim(), body: rest.join("\n").trim() })
  }
  return { intro, entries }
}

export default function DailyLogPage() {
  const md = getDailyLog()
  const { entries } = parseEntries(md)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entwicklungs-Tagebuch</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Was das Team jeden Tag erlebt — aus Agenten-Sicht, ungeschönt.
          Aus <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/DAILY_LOG.md</code> · neuer Eintrag mit{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">/log</code>
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">Noch keine Einträge.</p>
      ) : (
        <div className="space-y-10">
          {entries.map((entry) => (
            <article key={entry.title} className="space-y-4">
              <h2 className="text-lg font-bold border-b border-border pb-3">{entry.title}</h2>
              <div className="space-y-3">
                {entry.body.split(/\n\n+/).map((para, i) => {
                  const trimmed = para.trim()
                  if (!trimmed) return null

                  if (trimmed.startsWith("```")) {
                    const code = trimmed.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")
                    return (
                      <pre key={i} className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed text-muted-foreground">
                        {code}
                      </pre>
                    )
                  }

                  if (trimmed.startsWith(">")) {
                    return (
                      <blockquote key={i} className="border-l-2 border-border pl-4 text-sm text-muted-foreground italic leading-relaxed">
                        {trimmed.replace(/^>\s*/gm, "")}
                      </blockquote>
                    )
                  }

                  if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2).includes("**")) {
                    return (
                      <h3 key={i} className="text-sm font-semibold text-foreground pt-2">
                        {trimmed.slice(2, -2)}
                      </h3>
                    )
                  }

                  return (
                    <p key={i} className="text-sm leading-relaxed text-foreground/90">
                      {trimmed}
                    </p>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
