import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="inline-block rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            Masterthesis · SRH Fernhochschule Riedlingen
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Kinetic AI Agent
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            KAIA ist ein KI-Lernbegleiter der ausschließlich Fragen stellt.
            Kein Dozent. Kein Tutorial. Sokrates als Algorithmus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Konto erstellen
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border text-center text-xs text-muted-foreground">
        Dagmar Rostek · 2025/2026 ·{" "}
        <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
        {" · "}
        <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
      </footer>
    </>
  );
}
