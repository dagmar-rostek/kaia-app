"use client"

import { useState, useEffect } from "react"
import { Check, Copy, RotateCcw } from "lucide-react"
import {
  PLAYBOOK_PASSWORDS_DEFAULT,
  PASSWORDS_STORAGE_KEY,
} from "@/lib/playbook-passwords"

type Playbook = {
  key: string
  num: number
  title: string
  href: string
  accent: string
}

const PLAYBOOKS: Playbook[] = [
  { key: "resilienz",        num: 1, title: "Leadership-Resilienz",          href: "/playbooks/resilienz.html",                     accent: "#3E6B4F" },
  { key: "wertearbeit",      num: 2, title: "Wertearbeit",                   href: "/playbooks/wertearbeit.html",                   accent: "#86561C" },
  { key: "teamvision",       num: 3, title: "Teamvision und Ausrichtung",    href: "/playbooks/teamvision.html",                    accent: "#2F5F8A" },
  { key: "kommunikation",    num: 4, title: "Kommunikation & Konflikte",     href: "/playbooks/kommunikation.html",                 accent: "#7A4040" },
  { key: "komm-resilienz",   num: 5, title: "Kommunikation trifft Resilienz",href: "/playbooks/kommunikation-trifft-resilienz.html",accent: "#5C3D8A" },
  { key: "science-ai",       num: 6, title: "Science × AI",                  href: "/playbooks/science-ai.html",                   accent: "#007D79" },
]

function loadPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY)
    if (raw) return { ...PLAYBOOK_PASSWORDS_DEFAULT, ...JSON.parse(raw) }
  } catch {}
  return { ...PLAYBOOK_PASSWORDS_DEFAULT }
}

function savePasswords(passwords: Record<string, string>) {
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords))
  } catch {}
}

export default function AdminPlaybooksPage() {
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPasswords(loadPasswords())
  }, [])

  function updatePassword(key: string, value: string) {
    const next = { ...passwords, [key]: value }
    setPasswords(next)
    savePasswords(next)
    setSaved(key)
    setTimeout(() => setSaved(null), 1500)
  }

  function resetToDefault(key: string) {
    updatePassword(key, PLAYBOOK_PASSWORDS_DEFAULT[key] ?? "")
  }

  async function copyPw(key: string) {
    const pw = passwords[key] ?? ""
    try {
      await navigator.clipboard.writeText(pw)
    } catch {
      // fallback
      const el = document.createElement("textarea")
      el.value = pw
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      el.remove()
    }
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  function resetAll() {
    if (!confirm("Alle Passwörter auf Standard zurücksetzen?")) return
    const defaults = { ...PLAYBOOK_PASSWORDS_DEFAULT }
    setPasswords(defaults)
    savePasswords(defaults)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Playbook-Passwörter</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Passwörter in Klartext verwalten · werden lokal in diesem Browser gespeichert
            </p>
          </div>
          <button
            onClick={resetAll}
            className="text-xs text-zinc-500 border border-zinc-700 rounded-full px-3 py-1.5 hover:text-zinc-300 hover:border-zinc-500 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Alle zurücksetzen
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 text-xs text-zinc-500 flex items-start gap-2">
          <span className="text-amber-400 mt-0.5">⚠</span>
          <span>
            Die Passwörter werden im <strong className="text-zinc-400">localStorage dieses Browsers</strong> gespeichert.
            Sie gelten nur auf diesem Gerät. Teile Passwörter per Chat, E-Mail oder persönlich mit den Teilnehmenden.
          </span>
        </div>

        <div className="space-y-3">
          {PLAYBOOKS.map((pb) => {
            const pw = passwords[pb.key] ?? PLAYBOOK_PASSWORDS_DEFAULT[pb.key] ?? ""
            const isDefault = pw === PLAYBOOK_PASSWORDS_DEFAULT[pb.key]
            return (
              <div
                key={pb.key}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: pb.accent + "22", color: pb.accent }}>
                  {pb.num}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 mb-1.5">{pb.title}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pw}
                      onChange={e => updatePassword(pb.key, e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 font-mono tracking-wider focus:outline-none focus:border-zinc-500 transition-colors min-w-0"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button
                      onClick={() => copyPw(pb.key)}
                      className="flex-shrink-0 p-2 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 text-zinc-500 transition-colors"
                      title="Passwort kopieren"
                    >
                      {copied === pb.key
                        ? <Check className="w-4 h-4 text-emerald-400" />
                        : <Copy className="w-4 h-4" />
                      }
                    </button>
                    {!isDefault && (
                      <button
                        onClick={() => resetToDefault(pb.key)}
                        className="flex-shrink-0 p-2 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 text-zinc-500 transition-colors"
                        title="Standard wiederherstellen"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 w-16 text-right">
                  {saved === pb.key && (
                    <span className="text-xs text-emerald-400">Gespeichert</span>
                  )}
                  {!isDefault && saved !== pb.key && (
                    <span className="text-xs text-amber-500">Geändert</span>
                  )}
                  {isDefault && saved !== pb.key && (
                    <span className="text-xs text-zinc-600">Standard</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            Standard-Passwörter:{" "}
            {Object.entries(PLAYBOOK_PASSWORDS_DEFAULT).map(([k, v]) => (
              <span key={k} className="mr-3 font-mono text-zinc-500">{k}: <strong className="text-zinc-400">{v}</strong></span>
            ))}
          </p>
        </div>

        <div className="pt-2 pb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Playbooks direkt öffnen
          </h2>
          <div className="flex flex-wrap gap-2">
            {PLAYBOOKS.map(pb => (
              <a
                key={pb.key}
                href={pb.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border border-zinc-800 rounded-full px-3 py-1.5 hover:border-zinc-600 transition-colors"
                style={{ color: pb.accent }}
              >
                {pb.title} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
