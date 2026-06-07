import { readDoc } from "@/lib/docs"

export const dynamic = "force-dynamic"

function getTheorie(): string {
  return readDoc("THEORIE.md", "# Theoretischer Hintergrund\n\nDokumentation folgt.")
}

// ── Simple markdown renderer ──────────────────────────────────────────────────
// Handles: h1/h2/h3, bold, italic, blockquote, horizontal rule, paragraphs
// No dependency needed — academic text doesn't need full CommonMark

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>)
    else if (match[4]) parts.push(<code key={match.index} className="text-xs bg-muted px-1 py-0.5 rounded font-mono">{match[4]}</code>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function renderBlocks(md: string): React.ReactNode[] {
  const lines = md.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // h1
    if (line.startsWith("# ")) {
      nodes.push(<h1 key={i} className="text-2xl font-bold tracking-tight mt-6 mb-2">{line.slice(2)}</h1>)
      i++; continue
    }
    // h2
    if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-lg font-semibold mt-8 mb-3 border-b border-border pb-2 text-foreground">{line.slice(3)}</h2>)
      i++; continue
    }
    // h3
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-base font-semibold mt-5 mb-2 text-foreground">{line.slice(4)}</h3>)
      i++; continue
    }
    // hr
    if (line.startsWith("---")) {
      nodes.push(<hr key={i} className="border-border my-6" />)
      i++; continue
    }
    // blockquote
    if (line.startsWith("> ")) {
      const bqLines: string[] = []
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        bqLines.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      // Check for bold label (e.g. **Stand:**)
      nodes.push(
        <blockquote key={i} className="border-l-4 border-border pl-4 my-4 text-sm text-muted-foreground italic space-y-1">
          {bqLines.map((bl, bi) => bl ? <p key={bi}>{renderInline(bl)}</p> : null)}
        </blockquote>
      )
      continue
    }
    // list item
    if (line.startsWith("- ")) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-3 text-sm text-muted-foreground ml-2">
          {listItems.map((item, li) => <li key={li}>{renderInline(item)}</li>)}
        </ul>
      )
      continue
    }
    // empty line
    if (line.trim() === "") { i++; continue }
    // paragraph
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !lines[i].startsWith("- ") && !lines[i].startsWith("---")) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      nodes.push(
        <p key={i} className="text-sm leading-relaxed text-muted-foreground my-2">
          {renderInline(paraLines.join(" "))}
        </p>
      )
    }
  }
  return nodes
}

// ── Metadata extraction ───────────────────────────────────────────────────────

function extractMeta(md: string) {
  const standMatch = md.match(/\*\*Stand:\*\*\s*([^\n·]+)/)
  const versionMatch = md.match(/\*\*Version:\*\*\s*([^\n·]+)/)
  const reviewerMatch = md.match(/\*\*Reviewer:\*\*\s*([^\n]+)/)
  const sections = (md.match(/^## /gm) || []).length
  const wordCount = md.split(/\s+/).filter(Boolean).length
  return {
    stand: standMatch?.[1]?.trim() ?? "—",
    version: versionMatch?.[1]?.trim() ?? "—",
    reviewer: reviewerMatch?.[1]?.trim() ?? "—",
    sections,
    wordCount,
  }
}

export default function TheoriePage() {
  const md = getTheorie()
  const meta = extractMeta(md)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Theoretischer Hintergrund</h1>
        <p className="text-muted-foreground text-sm">
          Kapitel 2 der Masterthesis — Draft aus{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/THEORIE.md</code>
        </p>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: "Stand",     value: meta.stand },
          { label: "Version",   value: meta.version },
          { label: "Abschnitte", value: String(meta.sections) },
          { label: "Wörter",    value: String(meta.wordCount) },
          { label: "Reviewer",  value: meta.reviewer.split("·")[0].trim() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-lg border border-border bg-background p-6 space-y-1">
        {renderBlocks(md)}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Abschnitte mit ✓ sind durch den Psychologen freigegeben. Dokument wird mit jedem inhaltlichen Update versioniert.
      </p>
    </div>
  )
}
