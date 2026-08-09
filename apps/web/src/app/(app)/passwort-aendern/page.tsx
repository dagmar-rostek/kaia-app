"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/auth"

export default function PasswortAendernPage() {
  const router = useRouter()
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.new_password !== form.confirm) {
      setError("Die neuen Passwörter stimmen nicht überein.")
      return
    }
    if (form.new_password.length < 8) {
      setError("Das neue Passwort muss mindestens 8 Zeichen haben.")
      return
    }
    setLoading(true)
    try {
      const res = await authFetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.detail ?? "Passwort konnte nicht geändert werden.")
        return
      }
      setSuccess(true)
      setTimeout(() => router.replace("/chat"), 2000)
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passwort ändern</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gib dein aktuelles und ein neues Passwort ein.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            Passwort erfolgreich geändert. Du wirst weitergeleitet…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Aktuelles Passwort</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.current_password}
                onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm
                  outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Neues Passwort</label>
              <input
                type="password"
                autoComplete="new-password"
                value={form.new_password}
                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm
                  outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Neues Passwort bestätigen</label>
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm
                  outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-foreground text-background px-4 py-2.5 text-sm
                font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Wird geändert…" : "Passwort ändern"}
            </button>
          </form>
        )}

        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Zurück
        </button>
      </div>
    </main>
  )
}
