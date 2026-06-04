export const dynamic = "force-dynamic"

import { readDoc } from "@/lib/docs"
import { ThesisCockpit } from "./ThesisCockpit"

export default function ThesisPage() {
  const chapters = {
    kap1: readDoc("KAIA_Kap1_Einleitung.md",    "# Kapitel 1 — Einleitung\n\n> **Stand:** Platzhalter\n\nInhalt folgt (August 2026)."),
    kap2: readDoc("THEORIE.md",                  "# Kapitel 2 — Theoretischer Hintergrund\n\nInhalt folgt."),
    kap3: readDoc("KAIA_Kap3_Rahmenwerk.md",    "# Kapitel 3 — Konzeptionelles Rahmenwerk\n\nInhalt folgt."),
    kap4: readDoc("KAIA_Kap4_Implementierung.md","# Kapitel 4 — Technische Implementierung\n\nInhalt folgt."),
    kap5: readDoc("KAIA_Kap5_LLM_Eval.md",      "# Kapitel 5 — LLM-Evaluationsbericht\n\nInhalt folgt."),
    kap6: readDoc("KAIA_Kap6_Pilotstudie.md",   "# Kapitel 6 — Pilotstudie & Evaluation\n\nInhalt folgt."),
  }
  return <ThesisCockpit chapters={chapters} />
}
