import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-8 bg-background">
      <div className="space-y-2">
        <p className="text-8xl font-bold tracking-tight text-muted-foreground/30 select-none">404</p>
        <h1 className="text-2xl font-bold tracking-tight">Diese Seite existiert nicht.</h1>
      </div>

      <div className="max-w-md space-y-4 rounded-xl border border-border bg-muted/20 p-6">
        <p className="text-sm text-muted-foreground italic">
          KAIA, was tun wir jetzt?
        </p>
        <p className="text-base font-medium">
          &ldquo;Interessant. Was hat dich ursprünglich hierher geführt?&rdquo;
        </p>
        <p className="text-xs text-muted-foreground">
          — KAIA, unbeeindruckt, stellt eine Frage.
        </p>
      </div>

      <p className="text-sm text-muted-foreground max-w-xs">
        Seiten, die nicht existieren, können trotzdem nützlich sein —
        zum Beispiel als Anlass zu überlegen, wonach man eigentlich sucht.
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Zur Startseite
        </Link>
        <Link
          href="/mitmachen"
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Mitmachen
        </Link>
      </div>
    </div>
  )
}
