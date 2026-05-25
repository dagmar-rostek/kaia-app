import { CheckCircle2, XCircle, AlertCircle, Activity, Shield, Database, Globe, Bell, Lock } from "lucide-react"

async function fetchHealth() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
    const res = await fetch(`${apiUrl}/v1/health`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    return res.json() as Promise<{ status: string; study_mode: string; version: string }>
  } catch {
    return null
  }
}

type CheckStatus = "ok" | "warn" | "fail" | "manual"

interface CheckItem {
  label: string
  detail: string
  status: CheckStatus
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
  if (status === "warn") return <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
  if (status === "fail") return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  return <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: "OK",
  warn: "Warnung",
  fail: "Fehler",
  manual: "Manuell prüfen",
}

const STATUS_CLASS: Record<CheckStatus, string> = {
  ok: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warn: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  fail: "bg-red-500/10 text-red-500 border-red-500/20",
  manual: "bg-muted text-muted-foreground border-border",
}

export default async function ProductionReadinessPage() {
  const health = await fetchHealth()

  const apiStatus: CheckStatus = health?.status === "ok" ? "ok" : "fail"
  const studyModeStatus: CheckStatus =
    health?.study_mode === "locked" ? "ok" : health?.study_mode === "pilot" ? "warn" : "fail"

  const checks: { category: string; icon: React.ElementType; items: CheckItem[] }[] = [
    {
      category: "API & Backend",
      icon: Activity,
      items: [
        {
          label: "API erreichbar",
          detail: health ? `v${health.version} — Status: ${health.status}` : "Nicht erreichbar – prüfe Docker/Caddy",
          status: apiStatus,
        },
        {
          label: "Study Mode",
          detail: health
            ? health.study_mode !== "locked"
              ? `Aktuell: ${health.study_mode} — für Studie muss "locked" gesetzt sein`
              : `Aktuell: ${health.study_mode}`
            : "—",
          status: studyModeStatus,
        },
        {
          label: "Datenbank-Migrationen",
          detail: "Alembic-Migrations müssen vor Studienstart laufen (alembic upgrade head)",
          status: "manual",
        },
      ],
    },
    {
      category: "Infrastruktur",
      icon: Globe,
      items: [
        {
          label: "SSL/HTTPS aktiv",
          detail: "Caddy übernimmt Let's Encrypt automatisch — prüfe Zertifikatsablauf",
          status: "manual",
        },
        {
          label: "Docker Healthchecks",
          detail: "API-Container hat definierten Healthcheck (interval: 15s, retries: 3)",
          status: "ok",
        },
        {
          label: "Backup-Strategie",
          detail: "Noch kein automatisches PostgreSQL-Backup konfiguriert (pg_dump via Cron oder Hetzner Snapshot)",
          status: "warn",
        },
      ],
    },
    {
      category: "Sicherheit",
      icon: Lock,
      items: [
        {
          label: "JWT_SECRET gesetzt",
          detail: "Muss in .env als sicherer zufälliger Wert (openssl rand -hex 32) gesetzt sein",
          status: "manual",
        },
        {
          label: "ADMIN_PASSWORD gesetzt",
          detail: "Muss in .env und docker-compose.prod.yml korrekt übergeben werden",
          status: "manual",
        },
        {
          label: "Docker non-root User",
          detail: "API-Container läuft als 'kaia' System-User (nicht root)",
          status: "ok",
        },
        {
          label: "Passwort-Hashing",
          detail: "bcrypt via passlib — bcrypt-Factor 12 empfohlen für Produktion",
          status: "manual",
        },
      ],
    },
    {
      category: "Monitoring",
      icon: Bell,
      items: [
        {
          label: "Sentry API konfiguriert",
          detail: "SENTRY_KAIA_API muss in .env gesetzt sein",
          status: "manual",
        },
        {
          label: "Sentry Web konfiguriert",
          detail: "SENTRY_KAIA_WEB muss in .env gesetzt sein",
          status: "manual",
        },
        {
          label: "Slack-Kanal verknüpft",
          detail: "Sentry-Alerts sollten in definierten Slack-Channel posten",
          status: "manual",
        },
      ],
    },
    {
      category: "Studie",
      icon: Shield,
      items: [
        {
          label: "User-Approval-Flow",
          detail: "Neue Accounts müssen manuell freigeschaltet werden (kein Self-Signup)",
          status: "manual",
        },
        {
          label: "GSE-Fragebogen integriert",
          detail: "Allgemeine Selbstwirksamkeitserwartung muss vor/nach Studie erfasst werden",
          status: "manual",
        },
        {
          label: "Datenschutzerklärung",
          detail: "DSGVO-konforme Einwilligungserklärung für Studienteilnehmer hinterlegen",
          status: "warn",
        },
        {
          label: "Ethikvotum",
          detail: "SRH-Ethikvotum liegt vor oder wird beantragt",
          status: "manual",
        },
      ],
    },
    {
      category: "Datenbank",
      icon: Database,
      items: [
        {
          label: "pgvector Extension",
          detail: "CREATE EXTENSION vector; muss in der Datenbank aktiviert sein",
          status: "manual",
        },
        {
          label: "Connection Pooling",
          detail: "SQLAlchemy Async Engine mit pool_pre_ping=True konfiguriert",
          status: "ok",
        },
        {
          label: "DB-Passwort Stärke",
          detail: "POSTGRES_PASSWORD sollte ein sicherer Zufallswert sein",
          status: "manual",
        },
      ],
    },
  ]

  const allItems = checks.flatMap((c) => c.items)
  const counts = {
    ok: allItems.filter((i) => i.status === "ok").length,
    warn: allItems.filter((i) => i.status === "warn").length,
    fail: allItems.filter((i) => i.status === "fail").length,
    manual: allItems.filter((i) => i.status === "manual").length,
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production Readiness</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Deployment-Checkliste für den Start der KAIA-Pilotstudie
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Automatisch OK", value: counts.ok, cls: "text-emerald-500" },
          { label: "Warnungen", value: counts.warn, cls: "text-orange-500" },
          { label: "Fehler", value: counts.fail, cls: "text-red-500" },
          { label: "Manuell prüfen", value: counts.manual, cls: "text-muted-foreground" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="rounded-lg border border-border p-4 space-y-1">
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {checks.map(({ category, icon: Icon, items }) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <Icon className="h-4 w-4" />
              {category}
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/20 transition-colors"
                >
                  <StatusIcon status={item.status} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span
                        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${STATUS_CLASS[item.status]}`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
