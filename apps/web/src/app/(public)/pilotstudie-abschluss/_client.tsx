"use client"

import { useState } from "react"
import {
  CheckCircle2, Heart, Sparkles, Users, Brain,
  MessageSquare, Zap, ArrowRight, Loader2,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type ProductId = "gfk-leadership" | "gfk-business" | "ai-leaders" | "ai-builders"
type FormState = "idle" | "loading" | "success" | "error"

// ── Sub-Components ─────────────────────────────────────────────────────────────

function StatBubble({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold tracking-tight">{number}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

function WaitlistForm({ productId }: { productId: ProductId }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState<FormState>("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setState("loading")
    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), product: productId }),
      })
      if (!res.ok) throw new Error()
      setState("success")
    } catch {
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        <span>Du bist dabei. Wir melden uns sobald es losgeht.</span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-2 pt-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Dein Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
        />
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>
      {state === "error" && (
        <p className="text-xs text-red-500">Etwas ist schiefgelaufen. Bitte versuch es nochmal.</p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            Vorregistrieren <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </form>
  )
}

function ProductCard({
  id,
  icon: Icon,
  tag,
  title,
  description,
  teaser,
}: {
  id: ProductId
  icon: React.ElementType
  tag: string
  title: string
  description: string
  teaser: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 space-y-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tag}</div>
          <h3 className="text-base font-semibold leading-snug">{title}</h3>
        </div>
        <div className="p-2 rounded-lg bg-muted shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <p className="text-xs text-muted-foreground/70 italic border-l-2 border-border pl-3">{teaser}</p>
      <WaitlistForm productId={id} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PilotstudieAbschlussClient() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-20">

      {/* ── Hero ── */}
      <section className="space-y-6 text-center">
        <div className="text-5xl">🎓</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Die Pilotstudie ist abgeschlossen.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Vier Wochen. Echte Gespräche. Und eine KI, die gelernt hat, dass
            sokratische Geduld schwieriger ist als man denkt.
          </p>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-2 gap-6 rounded-xl border border-border bg-muted/20 p-6">
          <StatBubble number="~20" label="Teilnehmende" />
          <StatBubble number="1" label="KI, die fragt statt antwortet" />
        </div>
      </section>

      {/* ── Danke ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Tausend Dank.</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Ihr habt euch Zeit genommen für eine KI, die euch keine Antworten gegeben hat.
            Absichtlich. Das ist keine Selbstverständlichkeit — und genau das macht eure
            Daten zu echten Forschungsdaten.
          </p>
          <p>
            Jede Session, jede Rückmeldung, jeder Moment in dem ihr trotzdem
            weitergemacht habt, obwohl KAIA mal wieder eine Frage gestellt hat
            statt einfach die Antwort rauszurücken: das ist Wissenschaft.
          </p>
          <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Karma-Kasse
            </div>
            <p className="text-xs text-muted-foreground/80">
              Ihr habt nicht einfach an einer Studie teilgenommen — ihr habt auf
              die Karma-Kasse eingezahlt. Was ihr in diesen Sessions investiert habt,
              wird als Erkenntnisse zurückkommen. Für euch. Für andere.
              Für eine KI, die ein bisschen besser verstanden hat, was wirklich hilft.
            </p>
          </div>
        </div>
      </section>

      {/* ── Was jetzt ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Was als nächstes kommt.</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Die Pilotstudie war Version 0.1. Was danach kommt, ist KAIA als echtes Produkt —
            in vier Bereichen, in denen das Wissen-Tun-Gap am schmerzhaftesten ist.
            Registriere dich jetzt, um als Erste:r dabei zu sein wenn es losgeht.
          </p>
        </div>

        <div className="space-y-4">

          <ProductCard
            id="gfk-leadership"
            icon={Users}
            tag="Führung · GFK"
            title="Gewaltfreie Kommunikation im Business — für Leaders"
            description="Du führst Menschen, die du nicht kontrollieren kannst. Was wäre, wenn der Unterschied zwischen Eskalation und echter Verbindung buchstäblich ein Satz wäre — den du im richtigen Moment noch nie benutzt hast? KAIA entwickelt gemeinsam mit dir deine persönlichen Lernziele, begleitet dich mit Materialien, Videos und Übungen, die zu dir passen, und geht gleichzeitig in den sokratischen Transfer. Bis du nicht mehr nachdenkst, sondern einfach machst. Plus: 1:1-Zugang zu einem echten GFK-Experten, wenn's ernst wird."
            teaser="Für Führungskräfte, die wissen, dass Autorität nicht aus Lautstärke kommt."
          />

          <ProductCard
            id="gfk-business"
            icon={MessageSquare}
            tag="Kommunikation · GFK"
            title="Gewaltfreie Kommunikation im Business"
            description="Du weißt theoretisch, wie Gewaltfreie Kommunikation funktioniert. Du machst es trotzdem nicht, wenn es wirklich drauf ankommt. KAIA schließt genau diese Lücke. Keine Theorie-Vorlesung, keine generischen Übungen. Stattdessen: KAIA entwickelt mit dir deine eigenen Lernziele, stellt dir Materialien und Workshops bereit, die zu deiner Situation passen, und geht dann direkt in den sokratischen Transfer — Gespräch für Gespräch, bis die Veränderung nicht mehr Arbeit ist. 1:1-Expertenformat on demand inklusive."
            teaser="Für alle, die aufgehört haben zu glauben, dass noch ein Buch helfen würde."
          />

          <ProductCard
            id="ai-leaders"
            icon={Brain}
            tag="KI · Leadership"
            title="AI First Transformation — for Leaders"
            description="KI-Tools nutzen kann inzwischen jeder. Aber wie verändert KI wirklich die Art, wie du denkst, entscheidest und führst — und wie bereitest du dein Unternehmen auf eine Welt vor, in der sich das monatlich weiterentwickelt? KAIA begleitet dich durch den echten Mindset-Shift. Nicht mit Feature-Listen, nicht mit Buzzword-Bingo. Mit Gesprächen, Materialien und sokratischen Fragen, die dich zum Handeln bringen. Und wenn die Transformation bei dir im Unternehmen irgendwo stockt — da ist KAIA auch."
            teaser="Für Leader, die verstanden haben, dass es kein Technology-Problem ist."
          />

          <ProductCard
            id="ai-builders"
            icon={Zap}
            tag="KI · Praxis"
            title="AI First Transformation — for Builders"
            description="KI verändert sich wöchentlich. Dein Feed ist voll. Du weißt nicht mehr, was du noch lesen musst und was Lärm ist. KAIA hilft dir, im Rauschen des Neuen das Wesentliche zu erkennen — personalisiert auf deinen Stack, deine Rolle, deine echten Fragen. Nicht aktuell bleiben um des Aktuell-Bleibens willen. Wirksam arbeiten, während andere noch den Newsletter lesen. Mit sokratischer Begleitung beim Umsetzen und direktem Expertenzugang wenn du nicht weiterkommst."
            teaser="Für alle, die mit KI arbeiten und aufgehört haben, alles zu lesen."
          />

        </div>
      </section>

      {/* ── Footer-Note ── */}
      <section className="text-center space-y-2 pb-4">
        <p className="text-xs text-muted-foreground">
          Neue Registrierungen für die Pilotstudie sind geschlossen.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Fragen? <a href="/kontakt" className="underline underline-offset-2 hover:text-foreground transition-colors">Hier melden.</a>
        </p>
      </section>

    </main>
  )
}
