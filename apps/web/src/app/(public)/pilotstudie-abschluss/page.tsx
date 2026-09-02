import type { Metadata } from "next"
import PilotstudieAbschlussClient from "./_client"

export const metadata: Metadata = {
  title: "Pilotstudie abgeschlossen — KAIA",
  description:
    "Die KAIA-Pilotstudie ist beendet. Danke an alle Teilnehmenden. Hier kannst du dich für die kommenden KAIA-Produkte vorregistrieren.",
}

export default function PilotstudieAbschlussPage() {
  return <PilotstudieAbschlussClient />
}
