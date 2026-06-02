import { ExternalLink, Server, Bot, Zap, TrendingUp } from "lucide-react"

const HETZNER = {
  server: 3.79,
  ipv4: 0.60,
  get total() { return this.server + this.ipv4 },
}

interface CostRow {
  label: string
  monthly: number | null
  note: string
}

const INFRA_ROWS: CostRow[] = [
  { label: "Hetzner CX23 (2 vCPU, 4 GB RAM, Helsinki)", monthly: HETZNER.server, note: "Shared vCPU, 20 TB Traffic inkl." },
  { label: "IPv4-Adresse (Hetzner, seit Nov 2023 kostenpflichtig)", monthly: HETZNER.ipv4, note: "Statische IP" },
]

const DEV_ROWS: CostRow[] = [
  { label: "Claude Code — claude-sonnet-4-6", monthly: null, note: "$3/MTok Input · $15/MTok Output · Cache: $0.30 (Read) / $3.75 (Write) je MTok" },
  { label: "Schätzung: einfache Session (1–2h, wenig Agents)", monthly: null, note: "ca. $2–8 pro Session" },
  { label: "Schätzung: intensive Session (4h+, 10–15 Agents)", monthly: null, note: "ca. $15–40 pro Session" },
]

const LLM_ROWS: CostRow[] = [
  { label: "claude-sonnet-4-6 (Inferenz, Studienteilnehmer)", monthly: null, note: "$3/MTok Input · $15/MTok Output — noch $0, Studie nicht gestartet" },
  { label: "gpt-4o (Inferenz, Studienteilnehmer)", monthly: null, note: "$2.50/MTok Input · $10/MTok Output — noch $0, Studie nicht gestartet" },
  { label: "mistral-large (Inferenz, EU-Option)", monthly: null, note: "€3/MTok Input · €9/MTok Output — noch $0, Studie nicht gestartet" },
]

function EuroBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20 tabular-nums">
      €{amount.toFixed(2)}/Mo
    </span>
  )
}

function PendingBadge({ note }: { note: string }) {
  return (
    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground border-border">
      {note}
    </span>
  )
}

export default function KostenPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kosten</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Was kostet KAIA? Infrastruktur, Entwicklung und zukünftige Inferenzkosten.
        </p>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5" /> Infrastruktur
          </p>
          <p className="text-2xl font-bold text-foreground">€{HETZNER.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">pro Monat, fix</p>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" /> Claude Code Entwicklung
          </p>
          <p className="text-2xl font-bold text-foreground">$2–40</p>
          <p className="text-xs text-muted-foreground">pro Session, nutzungsbasiert</p>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> LLM-Inferenz (Studie)
          </p>
          <p className="text-2xl font-bold text-muted-foreground">$0</p>
          <p className="text-xs text-muted-foreground">Studie noch nicht gestartet</p>
        </div>
      </div>

      {/* Infrastruktur */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Server className="h-4 w-4" /> Infrastruktur — Hetzner CX23 Helsinki
          </h2>
          <a
            href="https://console.hetzner.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Hetzner Console <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border">
          {INFRA_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
              <div className="shrink-0">
                {row.monthly !== null ? <EuroBadge amount={row.monthly} /> : <PendingBadge note="variabel" />}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 gap-4 bg-muted/30">
            <p className="text-sm font-semibold">Gesamt Infrastruktur</p>
            <EuroBadge amount={HETZNER.total} />
          </div>
        </div>
      </section>

      {/* Entwicklung */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Bot className="h-4 w-4" /> Entwicklung — Claude Code (12-Agenten-Team)
          </h2>
          <a
            href="https://console.anthropic.com/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Anthropic Console <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border">
          {DEV_ROWS.map((row) => (
            <div key={row.label} className="flex items-start justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground px-1">
          Exakte Kosten pro Session im{" "}
          <a
            href="https://console.anthropic.com/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Anthropic Usage Dashboard
          </a>
          . Das 12-Agenten-Team erhöht den Token-Verbrauch pro Session durch parallele Agent-Invocations.
        </p>
      </section>

      {/* LLM Inferenz */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4" /> LLM-Inferenz — Studienphase (zukünftig)
          </h2>
        </div>
        <div className="rounded-lg border border-border divide-y divide-border">
          {LLM_ROWS.map((row) => (
            <div key={row.label} className="flex items-start justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Kostenabschätzung für die Studie</p>
          <p className="text-xs text-muted-foreground">
            Bei ~30 Teilnehmern × ~5 Chat-Sessions × ~20 Nachrichten × ~500 Token/Nachricht ≈ 1.5M Output-Token.
            Mit claude-sonnet-4-6: ca. <strong className="text-foreground">$22</strong> Inferenz gesamt.
            Infrastruktur bleibt konstant. Gesamtkosten Studie geschätzt: <strong className="text-foreground">€50–80</strong>.
          </p>
        </div>
      </section>

      {/* Hinweis Zeittracker */}
      <section className="rounded-lg border border-border p-4 flex items-start gap-3">
        <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Zeittracker</p>
          <p className="text-xs text-muted-foreground">
            Tageseinträge mit abgeschlossenen Aufgaben und Zeitaufwand werden in{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">docs/DAILY_LOG.md</code> protokolliert.
            Neuen Eintrag anlegen mit dem Claude Code Command{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">/log</code>.
          </p>
        </div>
      </section>
    </div>
  )
}
