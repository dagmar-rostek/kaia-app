"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { apiResetPassword } from "@/lib/auth"

export default function PasswortResetPage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params.token === "string" ? params.token : ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || password !== confirm) return
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiResetPassword(token, password)
      setDone(true)
      setTimeout(() => router.replace("/login"), 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Passwort konnte nicht zurückgesetzt werden."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          Ungültiger Link. Bitte fordere einen neuen Reset-Link an.
        </p>
        <Link href="/passwort-vergessen" className="text-sm underline text-foreground">
          Neuen Link anfordern
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Passwort gesetzt</h1>
        <p className="text-sm text-muted-foreground">
          Dein Passwort wurde erfolgreich geändert. Du wirst gleich zum Login weitergeleitet.
        </p>
      </div>
    )
  }

  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Neues Passwort vergeben</h1>
        <p className="text-sm text-muted-foreground">
          Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Neues Passwort
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
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

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium">
            Passwort bestätigen
          </label>
          <input
            id="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            disabled={loading}
            className={`w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 ${
              mismatch ? "border-red-500" : "border-border"
            }`}
          />
          {mismatch && (
            <p className="text-xs text-red-600 dark:text-red-400">Passwörter stimmen nicht überein.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!password || !confirm || mismatch || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Speichern…
            </>
          ) : (
            "Passwort speichern"
          )}
        </button>
      </form>
    </div>
  )
}
