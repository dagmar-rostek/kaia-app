import Link from "next/link"
import { ArrowRight, FlaskConical, Brain, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto w-full space-y-12">

        {/* Hero */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            <FlaskConical className="h-3 w-3" />
            Masterthesis · SRH Fernhochschule · 2026
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            KAIA
          </h1>

          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
            Ein KI-Lernbegleiter der keine Antworten liefert.
            Absichtlich.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
          {[
            {
              icon: Brain,
              title: "Sokrates, aber digital",
              desc: "KAIA fragt zurück. Nicht weil sie keine Antworten hätte — sondern weil deine eigenen die besseren sind.",
            },
            {
              icon: MessageSquare,
              title: "Kein Dozent. Kein Tutorial.",
              desc: "Kein Lernplan der von oben vorgegeben wird. Kein Feedback das nach Schulnoten riecht.",
            },
            {
              icon: FlaskConical,
              title: "Echte Studie. Echte Daten.",
              desc: "KAIA wird in einer wissenschaftlichen Pilotstudie untersucht. Du bist dabei — wenn du willst.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium">{title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/vorregistrierung"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Jetzt vorregistrieren <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/mitmachen"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            Wie läuft das ab?
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Studienstart: <strong className="text-foreground">16. Juli 2026</strong>
          {" · "}
          bereits eingeloggt?{" "}
          <Link href="/login" className="underline hover:text-foreground transition-colors">
            Anmelden
          </Link>
        </p>

      </main>

      <footer className="px-6 py-4 border-t border-border text-center text-xs text-muted-foreground">
        Dagmar Rostek · 2026 ·{" "}
        <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
        {" · "}
        <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
      </footer>
    </>
  )
}
