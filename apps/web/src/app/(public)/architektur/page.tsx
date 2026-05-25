import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { readDoc } from "@/lib/docs";

function getArchitektur(): string {
  return readDoc("ARCHITECTURE.md", "# Architektur\n\nDokumentation folgt.");
}

export default function ArchitekturPage() {
  const md = getArchitektur();

  const sections = md.split(/^## /m).slice(1).map((block) => {
    const [title, ...rest] = block.split("\n");
    return { title: title.trim(), body: rest.join("\n").trim() };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">KAIA</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Architektur</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Systemarchitektur</h1>
          <p className="text-muted-foreground text-sm">
            Wie KAIA aufgebaut ist — für alle, die verstehen wollen wie das System funktioniert.
            Diese Seite wird automatisch aus{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">docs/ARCHITECTURE.md</code> generiert.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={sec.title} className="space-y-3">
              <h2 className="text-lg font-semibold border-b border-border pb-2">{sec.title}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{sec.body}</pre>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
