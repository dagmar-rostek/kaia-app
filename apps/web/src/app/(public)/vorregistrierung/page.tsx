"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Sparkles } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

const REASONS = [
  "Weil mir gerade langweilig ist.",
  "Weil du mir ein Eis versprochen hast.",
  "Ich will dir einen Gefallen tun.",
  "Neugier. Was ist das überhaupt?",
  "Weil ich der KI mal auf den Zahn fühlen will.",
  "Für die Wissenschaft. Klingt gut, oder?",
  "Weil alle anderen auch mitmachen. Schafe, die ich bin.",
  "Ich lerne seit Jahren nicht mehr. Vielleicht hilft das.",
  "Weil ich sonst Netflix geschaut hätte.",
  "Dagmar hat mich so nett gefragt.",
]

export default function VorregistrierungPage() {
  const router = useRouter()

  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [reason,   setReason]   = useState("")
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [hint,     setHint]     = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API}/api/v1/preregister/stats`)
      .then(r => r.json())
      .then(d => setRemaining(d.remaining))
      .catch(() => {})
  }, [])

  function fillReason() {
    const r = REASONS[Math.floor(Math.random() * REASONS.length)]
    setReason(r)
  }

  async function submit() {
    if (!name.trim() || !email.trim() || !reason.trim()) {
      setError("Bitte alle Felder ausfüllen.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/v1/preregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), reason: reason.trim() }),
      })
      if (res.ok) {
        router.push("/vorregistrierung/danke")
      } else {
        const data = await res.json()
        if (res.status === 409) {
          if (data.detail?.includes("Plätze")) {
            setError("Alle 50 Plätze sind leider belegt. Schreib mir direkt: dagmar@ecoaching-rostek.de")
          } else {
            setError("Mit dieser E-Mail bist du bereits registriert.")
          }
        } else {
          setError("Etwas ist schiefgelaufen. Bitte nochmal versuchen.")
        }
      }
    } catch {
      setError("Verbindungsfehler. Bitte nochmal versuchen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-16 space-y-10">

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Ich bin dabei.</h1>
          {remaining !== null && (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${
              remaining <= 5
                ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}>
              {remaining === 0 ? "Ausgebucht" : `Noch ${remaining} von 50 Plätzen frei`}
            </span>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Die Studie startet am <strong className="text-foreground">16. Juli 2026</strong>.
          Trag dich jetzt ein — du bekommst rechtzeitig eine E-Mail wenn es losgeht.
        </p>
      </div>

      <div className="space-y-5">

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Dein Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Wie soll ich dich nennen?"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Deine E-Mail <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <p className="text-xs text-muted-foreground">Nur für die Studien-Benachrichtigung. Kein Newsletter.</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Warum möchtest du mitmachen? <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={fillReason}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Inspiration gefällig?"
            >
              <Sparkles className="h-3 w-3" />
              Inspiration
            </button>
          </div>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); setHint(null) }}
            onFocus={() => setHint("Ein Satz reicht. Wirklich.")}
            onBlur={() => setHint(null)}
            rows={3}
            placeholder="Ein ehrlicher Satz — von «Neugier» bis «meine Therapeutin hat mich geschickt»."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none leading-relaxed"
          />
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>

        {error && (
          <p className="text-sm text-red-500 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading || remaining === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Wird eingetragen…" : <><Send className="h-4 w-4" /> Ich bin dabei</>}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Du kannst dich jederzeit wieder abmelden — Link steht in der Bestätigungsmail.
        </p>
      </div>
    </main>
  )
}
