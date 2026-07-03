"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { apiLogin } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      await apiLogin(email, password)
      router.replace("/chat")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen."
      if (msg.includes("Admin-Freigabe") || msg.includes("wartet")) {
        setError(
          "Dein Account wartet noch auf Freischaltung durch Dagmar. " +
          "Du bekommst eine E-Mail, sobald es losgeht.",
        )
      } else if (msg.includes("gesperrt")) {
        setError("Dein Account ist gesperrt. Bitte kontaktiere Dagmar.")
      } else if (msg.includes("gesperrt für")) {
        setError(msg)
      } else {
        setError("E-Mail oder Passwort stimmen nicht. Bitte versuche es erneut.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Anmelden</h1>
        <p className="text-sm text-muted-foreground">
          Willkommen zurück. KAIA wartet auf dich.
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

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Passwort
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!email || !password || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Einen Moment…
            </>
          ) : (
            "Anmelden"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Noch kein Account?{" "}
          <Link href="/registrierung" className="underline text-foreground hover:no-underline">
            Jetzt registrieren
          </Link>
        </p>
      </form>
    </div>
  )
}
