"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

const ROLES = [
  "Pflege",
  "Ärzteschaft",
  "Therapie & Rehabilitation",
  "Verwaltung & Management",
  "Führungskraft",
  "Soziale Arbeit / Seelsorge",
  "Sonstiges",
]

export function WaitlistForm() {
  const [name, setName]     = useState("")
  const [email, setEmail]   = useState("")
  const [role, setRole]     = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !role) {
      setError("Bitte alle Felder ausfüllen.")
      return
    }
    setError("")
    setLoading(true)
    // Platzhalter — wird in Woche 1 mit API-Endpoint verkabelt
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <p className="font-semibold">Du bist dabei, {name.split(" ")[0]}.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Wir melden uns sobald CLARA startet — du bekommst als eine der Ersten
            Zugang zu deinen 2 Freigesprächen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Vorname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="given-name"
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        type="email"
        placeholder="E-Mail-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="" disabled>Bereich / Rolle im Krankenhaus</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Auf die Warteliste →
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Keine Werbung. Kein Spam. Nur ein Hinweis wenn CLARA startet.
      </p>
    </form>
  )
}
