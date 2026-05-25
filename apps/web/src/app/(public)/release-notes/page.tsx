export const dynamic = "force-dynamic";

import { readDoc } from "@/lib/docs";

function getReleaseNotes(): string {
  return readDoc("RELEASE_NOTES.md", "# Release Notes\n\nNoch keine Einträge vorhanden.");
}

function parseEntries(md: string) {
  const sections: { date: string; entries: { sha: string; kategorie: string; note: string; aufwand: string; subject: string }[] }[] = [];

  const blocks = md.split(/^## /m).slice(1);
  for (const block of blocks) {
    const dateMatch = block.match(/^(.+)\n/);
    if (!dateMatch) continue;
    const date = dateMatch[1].trim();
    const entries: typeof sections[0]["entries"] = [];

    let currentKat = "Verbesserung";
    for (const line of block.split("\n")) {
      const katM = line.match(/^### .+? (.+)$/);
      if (katM) { currentKat = katM[1]; continue; }
      const entM = line.match(/\*\*`([a-f0-9]+)`\*\* — (.+?)(?:\s·\s`([^`]+)`)?  $/);
      if (entM) {
        entries.push({ sha: entM[1], kategorie: currentKat, note: entM[2], aufwand: entM[3] ?? "", subject: "" });
      }
    }
    if (entries.length) sections.push({ date, entries });
  }
  return sections;
}

const KATEGORIE_COLOR: Record<string, string> = {
  "Neu": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Verbesserung": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Fix": "bg-red-500/10 text-red-500 border-red-500/20",
  "Infra": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Docs": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function ReleaseNotesPage() {
  const md = getReleaseNotes();
  const sections = parseEntries(md);

  const totalEntries = sections.reduce((s, sec) => s + sec.entries.length, 0);

  return (
    <>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Release Notes</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert.
            Pro Eintrag siehst du, was sich konkret geändert hat, plus die realistische Aufwandszeit.
          </p>
          <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{totalEntries}</strong> Einträge</span>
            <span><strong className="text-foreground">{sections.length}</strong> Release-Tage</span>
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="text-muted-foreground text-sm">Noch keine Einträge. Erster Commit kommt gleich.</p>
        ) : (
          <div className="space-y-10">
            {sections.map((sec) => (
              <section key={sec.date}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-4 sticky top-0 bg-background/80 backdrop-blur py-2 -mx-6 px-6">
                  {sec.date}
                </h2>
                <div className="space-y-3">
                  {sec.entries.map((e) => (
                    <div key={e.sha} className="rounded-lg border border-border p-4 hover:border-border/80 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${KATEGORIE_COLOR[e.kategorie] ?? "bg-muted text-muted-foreground border-border"}`}>
                            {e.kategorie}
                          </span>
                          <code className="text-xs text-muted-foreground font-mono">{e.sha}</code>
                        </div>
                        {e.aufwand && (
                          <span className="text-xs text-muted-foreground tabular-nums">{e.aufwand}</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{e.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
