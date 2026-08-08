export const dynamic = "force-dynamic"

import { readDoc } from "@/lib/docs"
import { renderMdToHtml, extractStand } from "@/lib/markdown-html"
import { ThesisCockpit } from "./ThesisCockpit"

function prep(filename: string, fallback: string) {
  const md = readDoc(filename, fallback)
  return { html: renderMdToHtml(md), stand: extractStand(md) }
}

export default function ThesisPage() {
  const chapters = {
    kap1: prep("KAIA_Kap1_Einleitung.md",          "# Kapitel 1 — Einleitung\n\n> **Stand:** Platzhalter\n\nInhalt folgt (August 2026)."),
    kap2: prep("KAIA_Kap2_Theorie.md",             "# Kapitel 2 — Theoretischer Hintergrund\n\nInhalt folgt."),
    kap3: prep("KAIA_Kap3_Konzeption.md",          "# Kapitel 3 — Konzeptionelles Rahmenwerk\n\nInhalt folgt."),
    kap4: prep("KAIA_Kap4_Methodisches_Vorgehen.md","# Kapitel 4 — Methodisches Vorgehen\n\nInhalt folgt."),
    kap5: prep("KAIA_Kap4_LLM_Evaluation.md",      "# Kapitel 5 — LLM-Evaluationsbericht\n\nInhalt folgt."),
    kap6: prep("KAIA_Kap4_Studiendesign.md",       "# Kapitel 6 — Studiendesign & Pilotstudie\n\nInhalt folgt."),
  }
  return <ThesisCockpit chapters={chapters} />
}
