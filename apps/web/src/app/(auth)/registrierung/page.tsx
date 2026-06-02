'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

interface FormState {
  email: string
  username: string
  password: string
  passwordConfirm: string
  consent_analytics: boolean
}

export default function RegistrierungPage() {
  const [form, setForm] = useState<FormState>({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    consent_analytics: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.password !== form.passwordConfirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    try {
      const api = process.env.NEXT_PUBLIC_API_URL ?? '/api'
      const res = await fetch(`${api}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          consent_data: true,
          consent_analytics: form.consent_analytics,
          consent_version: '1.0',
        }),
        credentials: 'include',
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string }
        throw new Error(err.detail ?? 'Registrierung fehlgeschlagen')
      }
      setRegistered(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 flex items-center justify-center mx-auto">
          <svg
            className="h-8 w-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Registrierung erfolgreich</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dein Konto wurde erstellt und wartet auf Freischaltung durch die Studienleiterin.
          <br />
          Du erhältst eine Nachricht, sobald du Zugang erhältst.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bereits registriert?{' '}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            Anmelden
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">E-Mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="du@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Benutzername</label>
          <input
            required
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="z.B. anna_m"
          />
          <p className="text-xs text-muted-foreground">3–100 Zeichen, Buchstaben, Zahlen, _ und -</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Passwort</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Passwort bestätigen</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={form.passwordConfirm}
            onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Einwilligung
          </p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked
              readOnly
              className="mt-0.5 rounded border-input accent-primary"
            />
            <span className="text-sm leading-relaxed">
              Ich stimme der Verarbeitung meiner Daten im Rahmen der KAIA-Pilotstudie zu.{' '}
              <span className="text-destructive">*</span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Pflichtfeld — ohne Einwilligung ist eine Teilnahme nicht möglich.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent_analytics}
              onChange={(e) => setForm((f) => ({ ...f, consent_analytics: e.target.checked }))}
              className="mt-0.5 rounded border-input accent-primary"
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              Ich stimme der anonymisierten Nutzungsanalyse für Forschungszwecke zu.{' '}
              <span className="text-xs">(freiwillig)</span>
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Wird registriert…' : 'Konto erstellen'}
        </button>
      </form>
    </div>
  )
}
