import Link from "next/link"

export const metadata = {
  title: "Impressum — KAIA",
}

export default function ImpressumPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-16 space-y-10">

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Impressum</h1>
        <p className="text-sm text-muted-foreground">
          Angaben gemäß § 5 TMG
        </p>
      </div>

      {/* Betreiberin */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Verantwortlich
        </h2>
        <div className="text-sm leading-relaxed space-y-0.5">
          <p className="font-medium">Dagmar Rostek</p>
          <p className="text-muted-foreground">Klosterstr. 12</p>
          <p className="text-muted-foreground">52511 Geilenkirchen</p>
        </div>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Telefon: </span>
            <a href="tel:+4917661159403" className="hover:text-foreground transition-colors">
              +49 176 61159403
            </a>
          </p>
          <p>
            <span className="text-muted-foreground">E-Mail: </span>
            <a href="mailto:dagmar@ecoaching-rostek.de" className="hover:text-foreground transition-colors">
              dagmar@ecoaching-rostek.de
            </a>
          </p>
        </div>
      </section>

      {/* Kontext */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Hintergrund
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Diese Website entsteht im Rahmen einer Masterthesis an der{" "}
          <strong className="text-foreground">SRH Fernhochschule Riedlingen</strong>{" "}
          (M.Sc. Data Science & Analytics). KAIA ist ein Forschungsprototyp —
          kein kommerzielles Produkt, kein Therapieangebot, kein Ersatz für professionelle Unterstützung.
        </p>
      </section>

      {/* Inhaltliche Verantwortung */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Verantwortlich für den Inhalt
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Dagmar Rostek, Anschrift wie oben.
        </p>
      </section>

      {/* Haftungsausschluss */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Haftung
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird keine Gewähr übernommen.
          Als Forschungsprototyp befindet sich KAIA in aktiver Entwicklung —
          Funktionen können sich jederzeit ändern.
        </p>
      </section>

      {/* KI-Hinweis */}
      <section className="rounded-xl border border-border bg-muted/20 p-5 space-y-2">
        <h2 className="text-sm font-semibold">Hinweis zur KI</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          KAIA ist eine Künstliche Intelligenz. Alle Antworten werden von einem Sprachmodell generiert.
          KAIA ist kein Mensch, kein Therapeut und kein Notfalldienst.
          Bei psychischen Krisen: Telefonseelsorge{" "}
          <a href="tel:0800111011" className="font-medium text-foreground hover:underline">
            0800 111 0 111
          </a>{" "}
          (kostenlos, 24/7) · Notruf{" "}
          <a href="tel:112" className="font-medium text-foreground hover:underline">112</a>.
        </p>
      </section>

      <div className="border-t border-border pt-6 text-xs text-muted-foreground">
        <Link href="/datenschutz" className="hover:text-foreground transition-colors">
          Datenschutzerklärung →
        </Link>
      </div>

    </main>
  )
}
