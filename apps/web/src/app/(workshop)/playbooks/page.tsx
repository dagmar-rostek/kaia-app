"use client"

import { useState, useEffect, useRef } from "react"

// ── Passwort hier ändern ──────────────────────────────────────────────────
const CORRECT = "PLAYBOOK_4Y"
// ─────────────────────────────────────────────────────────────────────────
const PW_KEY = "rostek-pb-auth-v1"

const THEMES = [
  {
    num: 1,
    title: "Leadership-Resilienz",
    sub: "Was hält mich, auch wenn es stürmt?",
    href: "/playbooks/resilienz.html",
    accent: "#3E6B4F",
    accentSoft: "#E3ECE4",
    accentDark: "#8FC2A0",
    accentSoftDark: "#1F2D25",
    live: true,
  },
  {
    num: 2,
    title: "Wertearbeit",
    sub: "Wofür stehe ich als Leitung?",
    href: "/playbooks/wertearbeit.html",
    accent: "#86561C",
    accentSoft: "#F2E7D6",
    accentDark: "#E2B87C",
    accentSoftDark: "#2D2417",
    live: true,
  },
  {
    num: 3,
    title: "Teamvision und Ausrichtung",
    sub: "Wohin wollen wir als Team?",
    href: "/playbooks/teamvision.html",
    accent: "#2F5F8A",
    accentSoft: "#E1EAF3",
    accentDark: "#8DB8E0",
    accentSoftDark: "#1B2633",
    live: true,
  },
  {
    num: 4,
    title: "Kommunikation & Konflikte",
    sub: "Was steckt in meiner schwierigen Situation?",
    href: "/playbooks/kommunikation.html",
    accent: "#7A4040",
    accentSoft: "#F0DEDE",
    accentDark: "#C28080",
    accentSoftDark: "#2D1A1A",
    live: true,
  },
]

export default function PlaybooksPage() {
  const [phase, setPhase] = useState<"init" | "locked" | "unlocked">("init")
  const [pw, setPw] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PW_KEY) === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhase("unlocked")
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhase("locked")
      }
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("locked")
    }
  }, [])

  useEffect(() => {
    if (phase === "locked") inputRef.current?.focus()
  }, [phase])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw === CORRECT) {
      try { sessionStorage.setItem(PW_KEY, "1") } catch {}
      setPhase("unlocked")
      setError("")
    } else {
      setError("Falsches Passwort.")
      setPw("")
      inputRef.current?.focus()
    }
  }

  function handleLogout() {
    try { sessionStorage.removeItem(PW_KEY) } catch {}
    setPhase("locked")
    setPw("")
  }

  if (phase === "init") return null

  if (phase === "locked") {
    return (
      <div
        style={{ background: "var(--background)", color: "var(--foreground)" }}
        className="min-h-screen flex flex-col items-center justify-center gap-10 px-4 text-center"
      >
        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#3E6B4F" }}
          >
            Workshop-Materialien
          </p>
          <h1 className="font-light text-4xl tracking-tight leading-tight">
            rostek unternehmensKOMMUNIKATION
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
          <input
            ref={inputRef}
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Passwort"
            autoComplete="current-password"
            className="w-full text-center text-lg tracking-wider rounded-2xl border px-4 py-3 bg-background focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--border)" }}
          />
          {error && (
            <p className="text-sm text-red-500 h-5">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full font-semibold py-3 text-white transition-opacity hover:opacity-85"
            style={{ background: "#3E6B4F" }}
          >
            Zugang →
          </button>
          <p className="text-xs text-muted-foreground">Nur für Kursteilnehmende.</p>
        </form>
      </div>
    )
  }

  return (
    <div
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      className="min-h-screen"
    >
      <div className="max-w-2xl mx-auto px-4 py-14 flex flex-col gap-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Deine Playbooks
          </p>
          <h1 className="text-4xl font-light tracking-tight leading-tight">
            Wähle dein Thema
          </h1>
          <p className="text-muted-foreground max-w-prose">
            Jedes Playbook begleitet dich durch den Tag — mit Impulsen, Bauaufträgen
            und Platz für deine Gedanken. Deine Einträge werden nur für diese Sitzung gespeichert und gehen verloren, wenn du den Tab schließt. Erstelle daher regelmäßig ein PDF.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {THEMES.map((t) => {
            const Card = t.live ? "a" : "div"
            return (
              <Card
                key={t.num}
                {...(t.live ? { href: t.href! } : {})}
                className="rounded-3xl border flex flex-col justify-between gap-4 p-6 min-h-52 transition-all duration-200"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--background)",
                  opacity: t.live ? 1 : 0.5,
                  cursor: t.live ? "pointer" : "default",
                  textDecoration: "none",
                  color: "var(--foreground)",
                }}
                onMouseEnter={e => {
                  if (t.live) {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = t.accent
                    el.style.transform = "translateY(-2px)"
                  }
                }}
                onMouseLeave={e => {
                  if (t.live) {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = "var(--border)"
                    el.style.transform = "translateY(0)"
                  }
                }}
              >
                <div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{ color: t.accent }}
                  >
                    Thema {t.num}
                  </p>
                  <h2 className="text-xl font-normal leading-snug mb-2">{t.title}</h2>
                  <p className="text-sm text-muted-foreground leading-snug">{t.sub}</p>
                </div>
                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full w-fit"
                  style={
                    t.live
                      ? { background: t.accentSoft, color: t.accent }
                      : { background: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                >
                  {t.live && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: t.accent }}
                    />
                  )}
                  {t.live ? "Verfügbar" : "Demnächst"}
                </span>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Deine Einträge bleiben nur auf diesem Gerät.
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground border rounded-full px-4 py-1.5 hover:text-foreground transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            Abmelden
          </button>
        </div>

        <div
          className="border-t pt-6 flex items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs text-muted-foreground">
            Für Dozentinnen
          </p>
          <a
            href="/playbooks/admin.html"
            className="text-sm border rounded-full px-4 py-1.5 transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
              textDecoration: "none",
            }}
          >
            Moderationsguide →
          </a>
        </div>
      </div>
    </div>
  )
}
