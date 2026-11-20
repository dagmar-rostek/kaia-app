"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  PLAYBOOK_PASSWORDS_DEFAULT,
  PASSWORDS_STORAGE_KEY,
  HTML_AUTH_KEY,
} from "@/lib/playbook-passwords"

const LANG_KEY = "rostek-pb-lang-v1"

type Theme = {
  key: string
  num: number
  titleDE: string
  titleEN: string
  subDE: string
  subEN: string
  href: string
  accent: string
  accentSoft: string
  accentDark: string
  accentSoftDark: string
  live: boolean
  hasHtmlAuth: boolean // injects HTML auth gate on unlock
}

const THEMES: Theme[] = [
  {
    key: "resilienz",
    num: 1,
    titleDE: "Leadership-Resilienz",
    titleEN: "Leadership Resilience",
    subDE: "Was hält mich, auch wenn es stürmt?",
    subEN: "What holds me, even in the storm?",
    href: "/playbooks/resilienz.html",
    accent: "#3E6B4F",
    accentSoft: "#E3ECE4",
    accentDark: "#8FC2A0",
    accentSoftDark: "#1F2D25",
    live: true,
    hasHtmlAuth: true,
  },
  {
    key: "wertearbeit",
    num: 2,
    titleDE: "Wertearbeit",
    titleEN: "Values Work",
    subDE: "Wofür stehe ich als Leitung?",
    subEN: "What do I stand for as a leader?",
    href: "/playbooks/wertearbeit.html",
    accent: "#86561C",
    accentSoft: "#F2E7D6",
    accentDark: "#E2B87C",
    accentSoftDark: "#2D2417",
    live: true,
    hasHtmlAuth: true,
  },
  {
    key: "teamvision",
    num: 3,
    titleDE: "Teamvision und Ausrichtung",
    titleEN: "Team Vision & Direction",
    subDE: "Wohin wollen wir als Team?",
    subEN: "Where do we want to go as a team?",
    href: "/playbooks/teamvision.html",
    accent: "#2F5F8A",
    accentSoft: "#E1EAF3",
    accentDark: "#8DB8E0",
    accentSoftDark: "#1B2633",
    live: true,
    hasHtmlAuth: true,
  },
  {
    key: "kommunikation",
    num: 4,
    titleDE: "Kommunikation & Konflikte",
    titleEN: "Communication & Conflict",
    subDE: "Was steckt in meiner schwierigen Situation?",
    subEN: "What's really behind my difficult situation?",
    href: "/playbooks/kommunikation.html",
    accent: "#7A4040",
    accentSoft: "#F0DEDE",
    accentDark: "#C28080",
    accentSoftDark: "#2D1A1A",
    live: true,
    hasHtmlAuth: true,
  },
  {
    key: "komm-resilienz",
    num: 5,
    titleDE: "Kommunikation trifft Resilienz",
    titleEN: "Communication meets Resilience",
    subDE: "Stärke deine Widerstandskraft und fördere Teamarbeit.",
    subEN: "Build your resilience and strengthen teamwork.",
    href: "/playbooks/kommunikation-trifft-resilienz.html",
    accent: "#5C3D8A",
    accentSoft: "#EDE5F5",
    accentDark: "#A97FD4",
    accentSoftDark: "#251840",
    live: true,
    hasHtmlAuth: false,
  },
  {
    key: "science-ai",
    num: 6,
    titleDE: "Science × AI",
    titleEN: "Science × AI",
    subDE: "Fundiertes wissenschaftliches Arbeiten mit KI-Unterstützung.",
    subEN: "Evidence-based research with AI support.",
    href: "/playbooks/science-ai.html",
    accent: "#007D79",
    accentSoft: "#E7F6F1",
    accentDark: "#4FC9C1",
    accentSoftDark: "#0D2E2C",
    live: true,
    hasHtmlAuth: false,
  },
]

function loadPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY)
    if (raw) return { ...PLAYBOOK_PASSWORDS_DEFAULT, ...JSON.parse(raw) }
  } catch {}
  return { ...PLAYBOOK_PASSWORDS_DEFAULT }
}

export default function PlaybooksPage() {
  const router = useRouter()
  const [lang, setLang] = useState<"de" | "en">("de")
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({})
  const [modal, setModal] = useState<string | null>(null) // key of playbook being unlocked
  const [pw, setPw] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [passwords, setPasswords] = useState<Record<string, string>>({})

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPasswords(loadPasswords())
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(LANG_KEY) === "en") setLang("en")
    } catch {}
    // Restore session unlocks
    const unlockState: Record<string, boolean> = {}
    for (const t of THEMES) {
      try {
        if (sessionStorage.getItem(`hub-unlock-${t.key}`) === "1") {
          unlockState[t.key] = true
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(unlockState)
  }, [])

  useEffect(() => {
    if (modal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPw("")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [modal])

  function toggleLang() {
    const next = lang === "de" ? "en" : "de"
    setLang(next)
    try { localStorage.setItem(LANG_KEY, next) } catch {}
  }

  function openCard(t: Theme) {
    if (!t.live) return
    if (unlocked[t.key]) {
      navigate(t)
      return
    }
    setModal(t.key)
  }

  function navigate(t: Theme) {
    if (t.hasHtmlAuth) {
      try { sessionStorage.setItem(HTML_AUTH_KEY, "1") } catch {}
    }
    router.push(t.href)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modal) return
    const correct = passwords[modal] ?? PLAYBOOK_PASSWORDS_DEFAULT[modal] ?? ""
    if (pw === correct) {
      try { sessionStorage.setItem(`hub-unlock-${modal}`, "1") } catch {}
      setUnlocked(prev => ({ ...prev, [modal]: true }))
      const t = THEMES.find(x => x.key === modal)!
      setModal(null)
      navigate(t)
    } else {
      setError(lang === "de" ? "Falsches Passwort." : "Incorrect password.")
      setPw("")
      inputRef.current?.focus()
    }
  }

  const copy = lang === "de"
    ? {
        label: "Deine Playbooks",
        heading: "Wähle dein Thema",
        body: "Jedes Playbook begleitet dich durch den Tag — mit Impulsen, Bauaufträgen und Platz für deine Gedanken. Erstelle regelmäßig ein PDF.",
        badge: "Verfügbar",
        soon: "Demnächst",
        footer: "Deine Einträge bleiben nur auf diesem Gerät.",
        logout: "Sitzung zurücksetzen",
        dozenLabel: "Für Dozentinnen",
        dozenLink: "Moderationsguide →",
        thema: "Thema",
        cancel: "Abbrechen",
        unlock: "Zugang →",
        pwPlaceholder: "Passwort",
        pwHint: "Nur für Kursteilnehmende.",
      }
    : {
        label: "Your Playbooks",
        heading: "Choose your topic",
        body: "Each playbook guides you through the day — with prompts, build tasks, and space for your thoughts. Export a PDF regularly.",
        badge: "Available",
        soon: "Coming soon",
        footer: "Your entries stay on this device only.",
        logout: "Reset session",
        dozenLabel: "For facilitators",
        dozenLink: "Facilitation guide →",
        thema: "Topic",
        cancel: "Cancel",
        unlock: "Access →",
        pwPlaceholder: "Password",
        pwHint: "For course participants only.",
      }

  const activeTheme = modal ? THEMES.find(t => t.key === modal) : null

  function handleLogout() {
    try {
      for (const t of THEMES) {
        sessionStorage.removeItem(`hub-unlock-${t.key}`)
      }
      sessionStorage.removeItem(HTML_AUTH_KEY)
    } catch {}
    setUnlocked({})
  }

  return (
    <div
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      className="min-h-screen"
    >
      {/* Password modal */}
      {modal && activeTheme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-5"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-1">
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: activeTheme.accent }}
              >
                {copy.thema} {activeTheme.num}
              </p>
              <h2 className="text-2xl font-light tracking-tight">
                {lang === "de" ? activeTheme.titleDE : activeTheme.titleEN}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                ref={inputRef}
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder={copy.pwPlaceholder}
                autoComplete="current-password"
                className="w-full text-center text-lg tracking-wider rounded-2xl border px-4 py-3 bg-background focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--border)" }}
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full font-semibold py-3 text-white transition-opacity hover:opacity-85"
                style={{ background: activeTheme.accent }}
              >
                {copy.unlock}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full text-sm text-muted-foreground py-1"
              >
                {copy.cancel}
              </button>
            </form>
            <p className="text-xs text-muted-foreground text-center">{copy.pwHint}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-14 flex flex-col gap-12">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {copy.label}
            </p>
            <button
              onClick={toggleLang}
              className="text-xs font-semibold tracking-widest border rounded-full px-3 py-1 transition-colors hover:text-foreground"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              aria-label={lang === "de" ? "Switch to English" : "Zu Deutsch wechseln"}
            >
              {lang === "de" ? "EN" : "DE"}
            </button>
          </div>
          <h1 className="text-4xl font-light tracking-tight leading-tight">
            {copy.heading}
          </h1>
          <p className="text-muted-foreground max-w-prose">
            {copy.body}
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {THEMES.map((t) => {
            const isUnlocked = unlocked[t.key]
            return (
              <button
                key={t.key}
                onClick={() => openCard(t)}
                className="rounded-3xl border flex flex-col justify-between gap-4 p-6 min-h-52 transition-all duration-200 text-left"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--background)",
                  opacity: t.live ? 1 : 0.5,
                  cursor: t.live ? "pointer" : "default",
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
                    {copy.thema} {t.num}
                  </p>
                  <h2 className="text-xl font-normal leading-snug mb-2">
                    {lang === "de" ? t.titleDE : t.titleEN}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {lang === "de" ? t.subDE : t.subEN}
                  </p>
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
                      style={{ background: isUnlocked ? t.accent : "transparent", border: isUnlocked ? "none" : `1.5px solid ${t.accent}` }}
                    />
                  )}
                  {!t.live
                    ? copy.soon
                    : isUnlocked
                      ? copy.badge
                      : (lang === "de" ? "🔒 Passwort" : "🔒 Password")
                  }
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {copy.footer}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground border rounded-full px-4 py-1.5 hover:text-foreground transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            {copy.logout}
          </button>
        </div>

        <div
          className="border-t pt-6 flex items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs text-muted-foreground">
            {copy.dozenLabel}
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
            {copy.dozenLink}
          </a>
        </div>
      </div>
    </div>
  )
}
