"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Eye, EyeOff, Check, Loader2 } from "lucide-react"
import { useTopicEval } from "@/hooks/useTopicEval"
import { TopicEvalFeedback } from "@/components/TopicEvalFeedback"

const TOPIC_SUGGESTIONS = [
  "Führung & Mitarbeitergespräche",
  "Kritische Feedbackgespräche",
  "Konfliktgespräche",
  "Delegieren",
  "Kommunikation & Präsentation",
  "Storytelling",
  "Entscheidungen unter Unsicherheit",
  "Vertrieb & Überzeugung",
  "Selbstorganisation",
  "Zeitblöcke einhalten",
]

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api"

type Field = "email" | "username" | "password" | "confirm"
type Errors = Partial<Record<Field, string>>

interface SlotStats {
  total: number
  remaining: number
  max: number
}

function validateFields(
  email: string,
  username: string,
  password: string,
  confirm: string,
): Errors {
  const errs: Errors = {}
  if (!email || !email.includes("@") || !email.includes("."))
    errs.email = "Keine gültige E-Mail-Adresse."
  if (username.length < 3)
    errs.username = "Mindestens 3 Zeichen."
  else if (!/^[a-zA-Z0-9_-]+$/.test(username))
    errs.username = "Nur Buchstaben, Zahlen, _ und - erlaubt."
  if (password.length < 8)
    errs.password = "Mindestens 8 Zeichen."
  if (password && confirm && confirm !== password)
    errs.confirm = "Die Passwörter stimmen nicht überein."
  return errs
}

function SlotCounter({ stats }: { stats: SlotStats | null | "loading" }) {
  if (stats === "loading") {
    return (
      <div
        aria-hidden="true"
        className="h-7 w-48 rounded-full bg-muted/60 animate-pulse motion-reduce:animate-none"
      />
    )
  }
  if (stats === null) return null

  const { remaining, max } = stats
  const isFull = remaining === 0
  const isLow = remaining > 0 && remaining <= 5

  const colorClasses = isFull
    ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
    : isLow
      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"

  const label = isFull
    ? "Alle Plätze belegt"
    : `Noch ${remaining} von ${max} Plätzen frei`

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${colorClasses}`}
    >
      {label}
    </span>
  )
}

export default function RegistrierungPage() {
  const [stats, setStats] = useState<SlotStats | null | "loading">("loading")

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [learningTopic, setLearningTopic] = useState("")
  const [consentData, setConsentData] = useState(false)
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentAnalytics, setConsentAnalytics] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { state: evalState, evaluate: evalTopic, reset: resetEval } = useTopicEval()

  const consentDataRef = useRef<HTMLInputElement>(null)
  const consentResearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${API}/v1/preregister/stats`)
      .then(r => r.json())
      .then((d: SlotStats) => setStats(d))
      .catch(() => setStats(null))
  }, [])

  const fieldErrors = validateFields(email, username, password, confirm)

  function touch(field: Field) {
    setTouched(t => ({ ...t, [field]: true }))
  }

  function err(field: Field) {
    return touched[field] ? fieldErrors[field] : undefined
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, username: true, password: true, confirm: true })
    if (Object.keys(fieldErrors).length > 0) return
    if (!learningTopic.trim()) {
      setGeneralError("Bitte gib dein Lernthema ein.")
      return
    }
    if (!consentData) { consentDataRef.current?.focus(); return }
    if (!consentResearch) { consentResearchRef.current?.focus(); return }

    setLoading(true)
    setGeneralError(null)
    try {
      const res = await fetch(`${API}/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          learning_topic: learningTopic.trim(),
          consent_data: true,
          consent_research_data: true,
          consent_analytics: consentAnalytics,
        }),
      })
      if (res.ok) { setDone(true); return }
      const data = await res.json().catch(() => ({})) as { detail?: string }
      if (res.status === 409 && data.detail?.includes("E-Mail")) {
        setGeneralError("Diese E-Mail-Adresse ist bereits registriert.")
      } else if (res.status === 409) {
        setGeneralError("Dieser Benutzername ist bereits vergeben.")
      } else {
        setGeneralError(data.detail ?? `Fehler ${res.status}. Bitte versuche es erneut.`)
      }
    } catch {
      setGeneralError("Verbindungsfehler. Bitte prüfe deine Internetverbindung.")
    } finally {
      setLoading(false)
    }
  }

  // --- Erfolgs-Screen ---
  if (done) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted">
            <Check className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Anmeldung eingegangen</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Danke, <span className="text-foreground font-medium">{username}</span>. Dagmar prüft
            deine Anmeldung und schreibt dir eine E-Mail, sobald du loslegen kannst.
            Das dauert meistens nicht lange.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-5 text-left space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Was jetzt passiert
          </p>
          <div className="space-y-2">
            {[
              { num: "1.", text: "Dagmar bekommt eine Benachrichtigung über deine Anmeldung." },
              { num: "2.", text: `Du bekommst eine E-Mail an ${email}.` },
              { num: "3.", text: "Du meldest dich an und startest mit KAIA." },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-start gap-3">
                <span className="text-xs font-mono text-muted-foreground/60 shrink-0 pt-0.5 w-4">
                  {num}
                </span>
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Fragen?{" "}
          <a
            href="mailto:Dagmar.Rostek@stud.mobile-university.de"
            className="underline hover:text-foreground transition-colors"
          >
            Dagmar.Rostek@stud.mobile-university.de
          </a>
        </p>
      </div>
    )
  }

  const isFull = stats !== "loading" && stats !== null && stats.remaining === 0

  // --- Vollständig ausgebucht ---
  if (isFull) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 px-3 py-1 text-sm font-medium">
            Alle Plätze belegt
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Die Studie ist voll.</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Alle {stats.max} Plätze der KAIA-Pilotstudie sind vergeben. Schreib Dagmar direkt,
            falls du auf eine Warteliste möchtest.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          <a
            href="mailto:Dagmar.Rostek@stud.mobile-university.de"
            className="underline hover:text-foreground transition-colors"
          >
            Dagmar.Rostek@stud.mobile-university.de
          </a>
        </p>
      </div>
    )
  }

  // --- Registrierungsformular ---
  return (
    <div className="w-full max-w-md space-y-8">

      {/* Kopfbereich mit Platz-Counter */}
      <div className="space-y-3">
        <SlotCounter stats={stats} />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Sei dabei.</h1>
          <p className="text-sm text-muted-foreground">
            Registriere dich jetzt — Dagmar schaltet deinen Account manuell frei.
          </p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-7">

        {/* E-Mail */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Deine E-Mail-Adresse
          </label>
          <p className="text-xs text-muted-foreground">
            An diese Adresse bekommst du eine Nachricht, sobald dein Account freigeschaltet ist.
          </p>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            aria-describedby={err("email") ? "email-err" : undefined}
            aria-invalid={!!err("email")}
            placeholder="du@beispiel.de"
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          {err("email") && (
            <p id="email-err" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {err("email")}
            </p>
          )}
        </div>

        {/* Benutzername */}
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            Wie soll KAIA dich ansprechen?
          </label>
          <p className="text-xs text-muted-foreground">
            Nur für dich sichtbar — KAIA verwendet diesen Namen in jedem Gespräch.
            Buchstaben, Zahlen, _ und - sind erlaubt.
          </p>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onBlur={() => touch("username")}
            aria-describedby={err("username") ? "username-err" : undefined}
            aria-invalid={!!err("username")}
            placeholder="z. B. Dagmar oder dein Spitzname"
            disabled={loading}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          {err("username") && (
            <p id="username-err" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {err("username")}
            </p>
          )}
        </div>

        {/* Passwort */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Dein Passwort
          </label>
          <p className="text-xs text-muted-foreground">
            Mindestens 8 Zeichen. Du musst es dir nicht merken — ein Passwort-Manager reicht.
          </p>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => touch("password")}
              aria-describedby={err("password") ? "password-err" : undefined}
              aria-invalid={!!err("password")}
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
          {err("password") && (
            <p id="password-err" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {err("password")}
            </p>
          )}
        </div>

        {/* Passwort bestätigen */}
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium">
            Passwort bestätigen
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              aria-describedby={
                err("confirm") ? "confirm-err" :
                touched.confirm && confirm && !fieldErrors.confirm ? "confirm-ok" :
                undefined
              }
              aria-invalid={!!err("confirm")}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {err("confirm") && (
            <p id="confirm-err" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {err("confirm")}
            </p>
          )}
          {touched.confirm && confirm && !fieldErrors.confirm && (
            <p id="confirm-ok" className="text-xs text-green-600 dark:text-green-400">
              Stimmt überein.
            </p>
          )}
        </div>

        {/* Lernthema */}
        <div className="space-y-2">
          <label htmlFor="learning_topic" className="text-sm font-medium">
            Wobei soll KAIA dich begleiten?
          </label>
          <p className="text-xs text-muted-foreground">
            Etwas, das du schon kennst oder verstehst — aber noch nicht wirklich in deinem Alltag lebst.
          </p>
          <input
            id="learning_topic"
            type="text"
            value={learningTopic}
            onChange={e => { setLearningTopic(e.target.value); resetEval() }}
            onBlur={e => evalTopic(e.target.value)}
            placeholder="z. B. Kritische Feedbackgespräche, die ich immer wieder aufschiebe"
            disabled={loading}
            maxLength={500}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <TopicEvalFeedback state={evalState} />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {TOPIC_SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setLearningTopic(s)}
                disabled={loading}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors disabled:opacity-50 ${
                  learningTopic === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Einwilligungen */}
        <fieldset className="space-y-4 rounded-xl border border-border p-5">
          <legend className="px-1 text-sm font-medium">Einwilligungen</legend>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              ref={consentDataRef}
              type="checkbox"
              checked={consentData}
              onChange={e => setConsentData(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
            />
            <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
              Ich habe die{" "}
              <Link
                href="/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground hover:no-underline"
              >
                Datenschutzerklärung ↗
              </Link>{" "}
              gelesen und willige in die Verarbeitung meiner personenbezogenen Daten
              (E-Mail-Adresse, Benutzername, Chat-Gespräche) für die Durchführung der
              KAIA-Pilotstudie ein. Diese Einwilligung kann jederzeit widerrufen werden.{" "}
              <span className="font-medium text-foreground">(Pflicht)</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              ref={consentResearchRef}
              type="checkbox"
              checked={consentResearch}
              onChange={e => setConsentResearch(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
            />
            <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
              Ich willige ausdrücklich in die Verarbeitung meiner psychologischen
              Selbsteinschätzungsdaten (Antworten auf den Selbstwirksamkeits-Fragebogen) zu
              wissenschaftlichen Forschungszwecken ein (Art.&nbsp;9 Abs.&nbsp;2
              lit.&nbsp;a DSGVO). Diese Daten fließen anonymisiert in die Masterthesis ein.{" "}
              <span className="font-medium text-foreground">(Pflicht)</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentAnalytics}
              onChange={e => setConsentAnalytics(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
            />
            <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
              Ich stimme zu, dass Login-Zeitpunkte, Session-Dauer und Nutzungsverhalten
              für die Studienauswertung erfasst werden.{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </span>
          </label>
        </fieldset>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Deine Anmeldung wird von Dagmar manuell geprüft. Du bekommst eine E-Mail,
          sobald dein Account freigeschaltet ist — dann kannst du direkt loslegen.
        </p>

        {generalError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {generalError}
          </p>
        )}

        <button
          type="submit"
          disabled={!consentData || !consentResearch || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Wird gesendet…
            </>
          ) : (
            "Anmelden"
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Bereits registriert?{" "}
          <Link href="/login" className="underline text-foreground hover:no-underline">
            Zum Login
          </Link>
        </p>
      </form>
    </div>
  )
}
