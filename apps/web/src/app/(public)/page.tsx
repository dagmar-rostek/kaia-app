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
            Für das Wissen, das du schon hast —
            aber noch nicht lebst.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left">
          {[
            {
              icon: Brain,
              title: "Vom Wissen ins Tun",
              desc: "Du kennst die Methoden. Du warst in den Workshops. Aber im Alltag passiert es nicht. Genau hier setzt KAIA an.",
            },
            {
              icon: MessageSquare,
              title: "Fragen statt Erklären",
              desc: "KAIA gibt keine Antworten — KAIA fragt zurück. Sokratisch, konsequent, auf den Punkt.",
            },
            {
              icon: FlaskConical,
              title: "Pilotstudie abgeschlossen.",
              desc: "Die wissenschaftliche Pilotstudie ist beendet. Danke an alle Teilnehmenden. Was als nächstes kommt, erfährst du hier.",
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
            href="/pilotstudie-abschluss"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Was kommt als nächstes? <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Pilotstudie abgeschlossen · September 2026
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
