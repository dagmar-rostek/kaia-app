import Link from "next/link"
import { Lock } from "lucide-react"
import { StudyCountdown } from "@/components/StudyCountdown"

export const metadata = {
  title: "Registrierung — KAIA",
  description: "Die Registrierung für die KAIA-Pilotstudie öffnet am 16. Juli 2026.",
}

export default function RegistrierungPage() {
  return (
    <div className="w-full max-w-md space-y-8 text-center">

      {/* KAIA zurück zur Startseite */}
      <Link href="/" className="inline-block text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity">
        KAIA
      </Link>

      <div className="space-y-3">
        <div className="flex justify-center">
          <div className="p-3 rounded-full border border-border bg-muted/40">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Registrierung noch nicht geöffnet</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Die KAIA-Pilotstudie startet am <strong className="text-foreground">16. Juli 2026</strong>.
          Ab dann kannst du dich hier registrieren und mitmachen.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <StudyCountdown label="Registrierung öffnet in" />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
        Neugierig was dich erwartet?{" "}
        <Link href="/mitmachen" className="text-foreground underline hover:no-underline">
          Lies wie die Teilnahme abläuft →
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Fragen?{" "}
        <a href="mailto:Dagmar.Rostek@stud.mobile-university.de" className="underline hover:text-foreground transition-colors">
          Dagmar.Rostek@stud.mobile-university.de
        </a>
      </p>
    </div>
  )
}
