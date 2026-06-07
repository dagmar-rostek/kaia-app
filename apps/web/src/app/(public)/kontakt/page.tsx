"use client"

import Link from "next/link"
import { useState } from "react"
import { Send, CheckCircle2, Phone, Mail, Ghost } from "lucide-react"

type Kontaktart = "email" | "telefon" | "keine"

export default function KontaktPage() {
  const [name,       setName]       = useState("")
  const [kontakt,    setKontakt]    = useState("")
  const [kontaktart, setKontaktart] = useState<Kontaktart>("email")
  const [nachricht,  setNachricht]  = useState("")
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState(false)

  async function send() {
    if (!nachricht.trim()) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/proxy/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kontakt, kontaktart, nachricht }),
      })
      if (res.ok) setDone(true)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main className="max-w-lg mx-auto px-6 py-24 text-center space-y-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight">Angekommen.</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Deine Nachricht ist bei Dagmar — sie meldet sich,
          wenn du Kontakt hinterlassen hast. Wenn nicht: danke fürs Schreiben.
          Es zählt trotzdem.
        </p>
        <Link
          href="/mitmachen"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Zurück zu KAIA
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-16 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight leading-tight">
          Liegt dir was auf der Seele?
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Feedback, eine Frage, ein Gedanke den du loswerden willst —
          oder einfach hallo sagen. Alles ist willkommen.
          Du kannst deinen Namen weglassen und anonym bleiben.
        </p>
      </div>

      <div className="space-y-5">

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Wie soll ich dich nennen?{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein Name, ein Spitzname, oder gar nichts"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
          />
        </div>

        {/* Kontaktart */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Soll ich mich melden?{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: "email" as Kontaktart,    icon: Mail,         label: "E-Mail" },
              { id: "telefon" as Kontaktart,  icon: Phone,        label: "Telefon" },
              { id: "keine" as Kontaktart,    icon: Ghost,        label: "Lieber nicht" },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setKontaktart(id)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors cursor-pointer ${
                  kontaktart === id
                    ? "border-foreground bg-foreground/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          {kontaktart !== "keine" && (
            <input
              type={kontaktart === "email" ? "email" : "tel"}
              value={kontakt}
              onChange={e => setKontakt(e.target.value)}
              placeholder={kontaktart === "email" ? "deine@email.de" : "+49 ..."}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
            />
          )}
        </div>

        {/* Nachricht */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Was liegt dir auf der Seele?
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={nachricht}
            onChange={e => setNachricht(e.target.value)}
            rows={5}
            placeholder="Schreib einfach drauf los. Es gibt keine falschen Nachrichten."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow resize-none leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            Kein Konto nötig. Kein Newsletter. Nur eine Nachricht.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">
            Ups — das hat leider nicht geklappt. Probiere es nochmal
            oder schreib direkt an{" "}
            <a href="mailto:dagmar@ecoaching-rostek.de" className="underline">
              dagmar@ecoaching-rostek.de
            </a>
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={send}
          disabled={!nachricht.trim() || loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Wird gesendet…" : (
            <>Abschicken <Send className="h-4 w-4" /></>
          )}
        </button>
      </div>

      {/* Direct contact */}
      <div className="border-t border-border pt-6 space-y-3">
        <p className="text-xs text-muted-foreground">Lieber direkt?</p>
        <div className="flex flex-col gap-2">
          <a
            href="mailto:dagmar@ecoaching-rostek.de"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            dagmar@ecoaching-rostek.de
          </a>
          <a
            href="tel:+4917661159403"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            +49 176 61159403
          </a>
        </div>
      </div>

    </main>
  )
}
