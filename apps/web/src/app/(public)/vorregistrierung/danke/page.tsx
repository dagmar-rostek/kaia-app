import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { StudyCountdown } from "@/components/StudyCountdown"

export const metadata = {
  title: "Du bist dabei — KAIA",
}

export default function DankePage() {
  return (
    <main className="max-w-lg mx-auto px-6 py-24 text-center space-y-8">

      <div className="space-y-4">
        <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
        <h1 className="text-3xl font-bold tracking-tight">Du bist auf der Liste.</h1>
        <p className="text-muted-foreground leading-relaxed">
          Eine Bestätigungsmail ist unterwegs zu dir.
          Am <strong className="text-foreground">1. August 2026</strong> geht es los —
          dann meldest du dich richtig an und kannst direkt starten.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <StudyCountdown label="Noch" />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-5 text-sm text-muted-foreground space-y-2 text-left">
        <p className="font-medium text-foreground">Was passiert jetzt?</p>
        <ul className="space-y-1.5">
          <li>✉️ Du bekommst gleich eine Bestätigungsmail</li>
          <li>📅 Am 1. August schreibt Dagmar dir persönlich</li>
          <li>🚀 Du kannst dich dann registrieren und loslegen</li>
          <li>🎁 Als Dankeschön: Sonderkonditionen für Early Birds</li>
        </ul>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Zurück zur Startseite
      </Link>
    </main>
  )
}
