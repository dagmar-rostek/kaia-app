"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { apiForgotPassword } from "@/lib/auth"

export default function PastwortVergessenPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await apiForgotPassword(email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">E-Mail unterwegs</h1>
          <p className="text-sm text-muted-foreground">
            Wenn ein Konto mit dieser Adresse existiert, bekommst du einen Reset-Link —
            bitte auch im Spam-Ordner schauen. Der Link ist 1 Stunde gültig.
          </p>
        </div>
        <Link
          href="/login"
          className="block text-center text-sm underline text-muted-foreground hover:text-foreground transition-colors"
        >
          Zurück zum Login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Passwort vergessen?</h1>
        <p className="text-sm text-muted-foreground">
          Gib deine E-Mail-Adresse ein. Wenn ein Konto existiert, schicken wir dir einen Link.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="du@beispiel.de"
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={!email || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Sende Link…
            </>
          ) : (
            "Reset-Link anfordern"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="underline text-foreground hover:no-underline">
            Zurück zum Login
          </Link>
        </p>
      </form>
    </div>
  )
}
