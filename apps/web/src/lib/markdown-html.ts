// Server-side markdown → HTML renderer (no React dependency, safe for Server Components)
// Used by ThesisPage to avoid shipping raw markdown + client-side renderMd to the browser.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderInlineHtml(text: string): string {
  const escaped = escapeHtml(text)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
}

export function renderMdToHtml(md: string): string {
  const lines = md.split("\n")
  const html: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("# ")) {
      html.push(`<h1 class="text-xl font-bold mt-6 mb-2 text-foreground">${renderInlineHtml(line.slice(2))}</h1>`)
      i++; continue
    }
    if (line.startsWith("## ")) {
      html.push(`<h2 class="text-base font-semibold mt-7 mb-3 border-b border-border pb-1.5 text-foreground">${renderInlineHtml(line.slice(3))}</h2>`)
      i++; continue
    }
    if (line.startsWith("### ")) {
      html.push(`<h3 class="text-sm font-semibold mt-5 mb-1.5 text-foreground">${renderInlineHtml(line.slice(4))}</h3>`)
      i++; continue
    }
    if (line.startsWith("---")) {
      html.push(`<hr class="border-border my-5" />`)
      i++; continue
    }
    if (line.startsWith("> ") || line === ">") {
      const bq: string[] = []
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        bq.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      const inner = bq
        .filter(l => l.trim())
        .map(l => `<p class="text-sm text-muted-foreground italic">${renderInlineHtml(l)}</p>`)
        .join("")
      html.push(`<blockquote class="border-l-2 border-border pl-4 my-3 space-y-0.5">${inner}</blockquote>`)
      continue
    }
    if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) { items.push(lines[i].slice(2)); i++ }
      const lis = items.map(it => `<li>${renderInlineHtml(it)}</li>`).join("")
      html.push(`<ul class="list-disc list-inside space-y-1 my-2 text-sm text-muted-foreground ml-1">${lis}</ul>`)
      continue
    }
    if (line.startsWith("|")) {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++ }
      const headers = rows[0].split("|").filter(Boolean).map(s => s.trim())
      const body = rows.slice(2).map(r => r.split("|").filter(Boolean).map(s => s.trim()))
      const ths = headers.map(h => `<th class="text-left border border-border px-2.5 py-1.5 bg-muted/40 font-medium">${escapeHtml(h)}</th>`).join("")
      const trs = body.map(row =>
        `<tr class="hover:bg-muted/20">${row.map(c => `<td class="border border-border px-2.5 py-1.5 text-muted-foreground">${renderInlineHtml(c)}</td>`).join("")}</tr>`
      ).join("")
      html.push(`<div class="overflow-x-auto my-3"><table class="w-full text-xs border-collapse"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`)
      continue
    }
    if (line.startsWith("```")) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++ }
      i++
      html.push(`<pre class="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto leading-relaxed text-muted-foreground my-3 whitespace-pre">${escapeHtml(codeLines.join("\n"))}</pre>`)
      continue
    }
    if (line.trim() === "") { i++; continue }
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("|") &&
      !lines[i].startsWith("-") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("---")
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length) {
      html.push(`<p class="text-sm leading-relaxed text-muted-foreground my-1.5">${renderInlineHtml(paraLines.join(" "))}</p>`)
    } else {
      // Advance past any unmatched line to prevent an infinite loop
      i++
    }
  }
  return html.join("\n")
}

export function extractStand(md: string): string {
  const m = md.match(/\*\*Stand:\*\*\s*([^\n·*]+)/)
  return m?.[1]?.trim() ?? "—"
}
