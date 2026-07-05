export const dynamic = "force-dynamic";

import { readDoc } from "@/lib/docs";

// ── Types ──────────────────────────────────────────────────────────────────────

type StructuredEntry = {
  sha: string;
  kategorie: string;
  note: string;
  aufwand: string;
  subject: string;
};

type Section = {
  rawDate: string;
  title: string;
  entries: StructuredEntry[];
  narrative: string;
};

type FileMeta = {
  total: string;
  days: string;
  hours: string;
  standDatum: string;
};

// ── Category config ────────────────────────────────────────────────────────────

const KAT_CONFIG: Record<string, { badge: string; dot: string; line: string }> = {
  "Neu":          { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500", line: "border-emerald-500/40" },
  "Verbesserung": { badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",                dot: "bg-sky-500",     line: "border-sky-500/40" },
  "Fix":          { badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",                dot: "bg-red-500",     line: "border-red-500/40" },
  "Infra":        { badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",    dot: "bg-orange-500",  line: "border-orange-500/40" },
  "Docs":         { badge: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",    dot: "bg-violet-500",  line: "border-violet-500/40" },
};
const DEFAULT_KAT = { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", line: "border-border" };

// ── Parser ────────────────────────────────────────────────────────────────────

function parseFileMeta(md: string): FileMeta {
  const statsM = md.match(/\*\*(\d+) Einträge insgesamt · (\d+) Release-Tage · (~?\d+ h) Gesamt-Aufwand\*\*/);
  const dateM  = md.match(/\*\*Stand heute:\*\* (.+)/);
  return {
    total:      statsM?.[1] ?? "—",
    days:       statsM?.[2] ?? "—",
    hours:      statsM?.[3] ?? "—",
    standDatum: dateM?.[1]?.trim() ?? "",
  };
}

function parseSections(md: string): Section[] {
  const blocks = md.split(/^## /m).slice(1);
  const sections: Section[] = [];

  for (const block of blocks) {
    const firstLineM = block.match(/^(.+)\n/);
    if (!firstLineM) continue;

    const rawHeader = firstLineM[1].trim();
    const dashIdx = rawHeader.indexOf(" — ");
    const rawDate = dashIdx >= 0 ? rawHeader.slice(0, dashIdx) : rawHeader;
    const title   = dashIdx >= 0 ? rawHeader.slice(dashIdx + 3) : "";

    const entries: StructuredEntry[] = [];
    let lastKat = "Verbesserung";
    let lastEntry: StructuredEntry | null = null;

    for (const line of block.split("\n").slice(1)) {
      // Category heading: ### Emoji Kategorie
      const katM = line.match(/^### .+? (.+)$/);
      if (katM) { lastKat = katM[1].trim(); lastEntry = null; continue; }

      // Structured entry: **DD.MM.YYYY · `sha`** — text · `time`  (trailing 2 spaces = markdown br)
      // Also matches: **`sha`** — text · `time`
      const entM = line.match(
        /\*\*(?:[^`*]+·\s)?`([a-f0-9]{6,10})`\*\* — (.+?)(?:\s·\s`([^`]+)`)?\s*$/
      );
      if (entM) {
        lastEntry = {
          sha:       entM[1],
          kategorie: lastKat,
          note:      entM[2].trim(),
          aufwand:   entM[3] ?? "",
          subject:   "",
        };
        entries.push(lastEntry);
        continue;
      }

      // Subject line: *feat: git commit message*
      const subjM = line.match(/^\*([^*].+[^*])\*\s*$/);
      if (subjM && lastEntry) {
        lastEntry.subject = subjM[1].trim();
      }
    }

    // If no structured entries were found, treat the section body as narrative prose
    const body = block.slice(firstLineM[0].length).trim();
    const narrative = entries.length === 0 ? body : "";

    sections.push({ rawDate, title, entries, narrative });
  }

  return sections;
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .trim();
}

// ── Components ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded-xl border border-border bg-muted/40 min-w-20">
      <span className="text-2xl font-bold tabular-nums tracking-tight">{value}</span>
      <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

function NarrativeCard({ body }: { body: string }) {
  const paras = body
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p && p !== "---" && !p.startsWith("---"));

  // First bold-only line = subtitle (version tag etc.)
  const subtitleIdx = paras.findIndex(p => /^\*\*[^*\n]+\*\*$/.test(p));
  const subtitle    = subtitleIdx >= 0 ? stripMd(paras[subtitleIdx]) : null;

  // Lead = first non-subtitle paragraph that's real content
  const contentParas = paras.filter((_, i) => i !== subtitleIdx);
  const [lead, ...rest] = contentParas;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 space-y-3">
      {subtitle && (
        <p className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
          {subtitle}
        </p>
      )}
      {lead && (
        <p className="text-sm leading-relaxed">{stripMd(lead)}</p>
      )}
      {rest.length > 0 && (
        <details className="group">
          <summary className="list-none cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors select-none flex items-center gap-1 pt-1">
            <span className="group-open:hidden">▸ Technische Details einblenden</span>
            <span className="hidden group-open:inline">▾ Technische Details ausblenden</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {rest.map((p, i) => (
              <p key={i} className="text-xs leading-relaxed text-muted-foreground">{stripMd(p)}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function TimelineEntry({ entry }: { entry: StructuredEntry }) {
  const kat = KAT_CONFIG[entry.kategorie] ?? DEFAULT_KAT;
  return (
    <div className="relative pl-6">
      {/* Dot on the timeline line */}
      <span
        className={`absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ring-1 ring-border ${kat.dot}`}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold leading-none ${kat.badge}`}>
            {entry.kategorie}
          </span>
          <code className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            {entry.sha}
          </code>
          {entry.aufwand && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums shrink-0">
              {entry.aufwand}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed">{entry.note}</p>
        {entry.subject && (
          <p className="text-[11px] font-mono text-muted-foreground/60">{entry.subject}</p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReleaseNotesPage() {
  const md       = readDoc("RELEASE_NOTES.md", "# KAIA Release Notes\n\nNoch keine Einträge.");
  const meta     = parseFileMeta(md);
  const sections = parseSections(md);

  const totalEntries = sections.reduce((n, s) => n + s.entries.length, 0);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-14">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Release Notes</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
              Jede Änderung am KAIA-Prototyp — vom ersten Commit bis heute.
              Mit Aufwandszeit, Commit-SHA und wissenschaftlicher Einordnung.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          <StatPill value={meta.total || String(totalEntries)} label="Einträge" />
          <StatPill value={meta.days  || String(sections.length)} label="Release-Tage" />
          <StatPill value={meta.hours || "—"}                     label="Gesamtaufwand" />
        </div>

        {/* Category legend */}
        <div className="flex flex-wrap gap-2 mt-5">
          {Object.entries(KAT_CONFIG).map(([k, v]) => (
            <span
              key={k}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${v.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      {sections.length === 0 ? (
        <p className="text-muted-foreground text-sm">Noch keine Einträge. Erster Commit kommt gleich.</p>
      ) : (
        <div className="space-y-14">
          {sections.map((sec) => (
            <section key={`${sec.rawDate}-${sec.title}`}>

              {/* Sticky date header */}
              <div className="sticky top-0 z-10 -mx-6 px-6 py-2.5 bg-background/90 backdrop-blur-sm border-b border-border mb-6 flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-sm font-bold text-foreground">{sec.rawDate}</span>
                {sec.title && (
                  <span className="text-sm text-muted-foreground line-clamp-1">{sec.title}</span>
                )}
                {sec.entries.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums shrink-0">
                    {sec.entries.length} {sec.entries.length === 1 ? "Änderung" : "Änderungen"}
                  </span>
                )}
              </div>

              {/* Content */}
              {sec.narrative ? (
                <NarrativeCard body={sec.narrative} />
              ) : (
                <div className="relative border-l-2 border-border pl-5 space-y-7">
                  {sec.entries.map((e) => (
                    <TimelineEntry key={e.sha} entry={e} />
                  ))}
                </div>
              )}

            </section>
          ))}
        </div>
      )}

      {meta.standDatum && (
        <p className="mt-16 text-center text-xs text-muted-foreground/50">
          Stand: {meta.standDatum}
        </p>
      )}
    </main>
  );
}
