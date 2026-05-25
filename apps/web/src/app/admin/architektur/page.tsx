import { readFileSync } from "fs"
import { join } from "path"

function getArchitektur(): string {
  try {
    return readFileSync(join(process.cwd(), "../../docs/ARCHITECTURE.md"), "utf-8")
  } catch {
    return "# Architektur\n\nDokumentation folgt."
  }
}

export default function AdminArchitekturPage() {
  const md = getArchitektur()

  const sections = md
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [title, ...rest] = block.split("\n")
      return { title: title.trim(), body: rest.join("\n").trim() }
    })

  const h1Match = md.match(/^# (.+)$/m)
  const h1 = h1Match?.[1] ?? "Systemarchitektur"

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{h1}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aus{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/ARCHITECTURE.md</code> generiert
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => (
          <section key={sec.title} className="space-y-3">
            <h2 className="text-base font-semibold border-b border-border pb-2">{sec.title}</h2>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
              {sec.body}
            </pre>
          </section>
        ))}
      </div>
    </div>
  )
}
