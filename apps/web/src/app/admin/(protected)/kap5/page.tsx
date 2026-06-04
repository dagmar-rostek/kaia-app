import { readDoc } from "@/lib/docs"

export const dynamic = "force-dynamic"

function get(): string {
  return readDoc("KAIA_Kap5_LLM_Eval.md", "# Kapitel 5 — LLM-Evaluationsbericht\n\nInhalt folgt.")
}


function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0; let match: RegExpExecArray | null
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
  const lines = md.split("\n"); const nodes: React.ReactNode[] = []; let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("# "))  { nodes.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-2">{line.slice(2)}</h1>); i++; continue }
    if (line.startsWith("## ")) { nodes.push(<h2 key={i} className="text-lg font-semibold mt-8 mb-3 border-b border-border pb-2">{line.slice(3)}</h2>); i++; continue }
    if (line.startsWith("### ")){ nodes.push(<h3 key={i} className="text-base font-semibold mt-5 mb-2">{line.slice(4)}</h3>); i++; continue }
    if (line.startsWith("---")) { nodes.push(<hr key={i} className="border-border my-6" />); i++; continue }
    if (line.startsWith("> "))  {
      const bqLines: string[] = []
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) { bqLines.push(lines[i].replace(/^>\s?/, "")); i++ }
      nodes.push(<blockquote key={i} className="border-l-4 border-border pl-4 my-4 text-sm text-muted-foreground italic space-y-1">{bqLines.map((bl, bi) => bl ? <p key={bi}>{renderInline(bl)}</p> : null)}</blockquote>); continue
    }
    if (line.startsWith("- "))  {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) { items.push(lines[i].slice(2)); i++ }
      nodes.push(<ul key={i} className="list-disc list-inside space-y-1 my-3 text-sm text-muted-foreground ml-2">{items.map((item, li) => <li key={li}>{renderInline(item)}</li>)}</ul>); continue
    }
    if (line.startsWith("|"))   {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++ }
      const headers = rows[0].split("|").filter(Boolean).map(s => s.trim())
      const dataRows = rows.slice(2).map(r => r.split("|").filter(Boolean).map(s => s.trim()))
      nodes.push(
        <div key={i} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead><tr>{headers.map((h, hi) => <th key={hi} className="text-left border border-border px-3 py-2 bg-muted/40 font-medium text-xs">{h}</th>)}</tr></thead>
            <tbody>{dataRows.map((row, ri) => <tr key={ri} className="hover:bg-muted/20">{row.map((cell, ci) => <td key={ci} className="border border-border px-3 py-2 text-xs text-muted-foreground">{renderInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ); continue
    }
    if (line.trim() === "") { i++; continue }
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !lines[i].startsWith("- ") && !lines[i].startsWith("---") && !lines[i].startsWith("|")) { paraLines.push(lines[i]); i++ }
    if (paraLines.length) nodes.push(<p key={i} className="text-sm leading-relaxed text-muted-foreground my-2">{renderInline(paraLines.join(" "))}</p>)
  }
  return nodes
}

function extractMeta(md: string) {
  const standMatch = md.match(/\*\*Stand:\*\*\s*([^\n·]+)/)
  const sections = (md.match(/^## /gm) || []).length
  const wordCount = md.split(/\s+/).filter(Boolean).length
  return { stand: standMatch?.[1]?.trim() ?? "—", sections, wordCount }
}


export default function Page() {
  const md = get()
  const meta = extractMeta(md)
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Kapitel 5 — LLM-Evaluationsbericht</h1>
        <p className="text-muted-foreground text-sm">Draft v0.2 · Ergebnisse folgen Juli 2026</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Stand",      value: meta.stand   },
          { label: "Abschnitte", value: String(meta.sections) },
          { label: "Wörter",     value: String(meta.wordCount) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium truncate">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background p-6 space-y-1">
        {renderBlocks(md)}
      </div>
    </div>
  )
}
