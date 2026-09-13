import {
  Mic, Brain, FileText,
  BookOpen, Video, MessageCircle, CheckCircle2,
  Sparkles, Users, Clock, Heart,
} from "lucide-react"
import { WaitlistForm } from "./_waitlist"

export const metadata = {
  title: "CLARA — NVC Communication Practice · by KAIA",
  description:
    "Das erste KI-Übungstool für Gewaltfreie Kommunikation im Klinikalltag. Für alle, die im Krankenhaus arbeiten — egal in welchem Bereich, egal in welcher Position.",
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

function FeatureItem({ icon: Icon, title, desc }: {
  icon: React.ElementType; title: string; desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function PriceCard({
  name, price, per, features, highlight = false,
}: {
  name: string; price: string; per: string; features: string[]; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-6 space-y-5 ${highlight ? "border-foreground/20 bg-foreground/3" : "border-border"}`}>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          {name}
        </p>
        <p className="text-4xl font-bold tracking-tight">{price}</p>
        <p className="text-xs text-muted-foreground mt-1">{per}</p>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ClaraPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-20">

      {/* ── HERO ── */}
      <section className="space-y-6 text-center">
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge>by KAIA</Badge>
          <Badge>Gewaltfreie Kommunikation · NVC</Badge>
          <Badge>Demnächst verfügbar</Badge>
        </div>

        <div>
          <h1 className="text-6xl font-bold tracking-tight leading-none mb-3">
            CLARA
          </h1>
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Nonviolent Communication Practice
          </p>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Das erste KI-Übungstool für Gewaltfreie Kommunikation im Klinikalltag —
          für alle, die im Krankenhaus arbeiten. Egal in welchem Bereich,
          egal in welcher Position.
        </p>

        {/* Waitlist */}
        <div className="rounded-xl border border-border bg-muted/20 p-6 text-left max-w-md mx-auto space-y-4">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
              Early Access
            </span>
            <p className="text-sm font-semibold">Sei dabei, wenn CLARA startet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Die ersten 20 Personen erhalten 2 Freigespräche kostenlos beim Launch.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── FÜR WEN ── */}
      <section className="space-y-5">
        <SectionLabel>Für alle im Krankenhaus</SectionLabel>
        <h2 className="text-2xl font-bold tracking-tight">
          Egal ob Pflege, Verwaltung oder Chefarzt.<br />
          Kommunikation betrifft jeden.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          GFK ist kein Führungsthema und kein Therapeuten-Tool.
          Jeder Konflikt, jedes schwierige Gespräch, jede Spannung im Klinikalltag —
          das ist das Terrain von CLARA. Von der Reinigungskraft bis zur Klinikleitung.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Pflege", "Ärzteschaft", "Stationsleitung", "Verwaltung",
            "Physiotherapie", "Sozialdienst", "Geschäftsführung",
            "Reinigung & Versorgung", "Personalentwicklung",
          ].map((r) => (
            <span
              key={r}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {r}
            </span>
          ))}
        </div>
      </section>

      {/* ── ZWEI MODI ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>Zwei Wege zu üben</SectionLabel>
          <h2 className="text-2xl font-bold tracking-tight">
            Wähle wie du mit CLARA arbeiten möchtest.
          </h2>
        </div>

        <div className="space-y-4">

          {/* Modus A */}
          <div className="rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold shrink-0">
                  A
                </div>
                <div>
                  <p className="font-semibold leading-tight">Ich will Feedback und Empathie</p>
                  <p className="text-xs text-muted-foreground mt-0.5">GFK-Reflexion</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Heart className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pl-12">
              <p>
                CLARA spielt die GFK-Expertin. Du schilderst deine Situation —
                und bekommst Empathie, Spiegelung und konkretes Feedback.
                Für den Moment nach einem schwierigen Gespräch.
              </p>
              <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs italic text-muted-foreground">
                &bdquo;Ich hatte heute einen Konflikt mit der Stationsleitung
                und weiß nicht, wie ich darauf reagieren soll.&ldquo;
              </div>
            </div>
          </div>

          {/* Modus B */}
          <div className="rounded-xl border border-foreground/20 bg-foreground/3 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold shrink-0">
                  B
                </div>
                <div>
                  <p className="font-semibold leading-tight">Ich will die GFK-Rolle selbst üben</p>
                  <p className="text-xs text-muted-foreground mt-0.5">GFK-Praxis</p>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pl-12">
              <p>
                Du schlüpfst in die GFK-Rolle. CLARA spielt das schwierige Gegenüber —
                basierend auf der echten Person aus deinem Alltag.
                Ideal zur Vorbereitung auf ein wichtiges Gespräch.
              </p>
              <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs italic text-muted-foreground">
                &bdquo;Ich möchte mit meinem Kollegen sprechen, der mich immer wieder triggert —
                ich will es diesmal anders angehen.&ldquo;
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SO FUNKTIONIERT ES ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>So funktioniert CLARA</SectionLabel>
          <h2 className="text-2xl font-bold tracking-tight">
            Vier Schritte — von der Situation zum Lernen.
          </h2>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {[
              {
                n: "01",
                title: "Kurzinterview",
                dur: "2–3 Minuten",
                desc: "Wer ist dein Gegenüber? Welche Situation willst du üben? CLARA hört zu und stellt gezielte Fragen.",
              },
              {
                n: "02",
                title: "Persona-Erstellung",
                dur: "im Hintergrund",
                desc: "Ein realistisches Profil der anderen Person entsteht — ihr Kommunikationsstil, ihre Trigger, die typische Dynamik zwischen euch.",
              },
              {
                n: "03",
                title: "Gespräch",
                dur: "max. 30 Minuten",
                desc: "Du sprichst oder schreibst — in deinem eigenen Tempo, per Sprache oder Text.",
              },
              {
                n: "04",
                title: "Analyse",
                dur: "direkt danach",
                desc: "Was lief gut? Was konnte missverstanden werden? Schriftlich und als Sprachzusammenfassung.",
              },
            ].map(({ n, title, dur, desc }) => (
              <div key={n} className="grid grid-cols-[64px_1fr] gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="pt-0.5">
                  <p className="text-xs font-bold text-muted-foreground/40">{n}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{dur}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="rounded-xl border border-border bg-muted/20 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Was CLARA mitbringt</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FeatureItem
            icon={Mic}
            title="Sprache und Text"
            desc="Beides möglich — je nachdem was gerade passt. Über die KI-Sprachschnittstelle oder als Texteingabe."
          />
          <FeatureItem
            icon={Users}
            title="Persona-Engine"
            desc="Kein generischer Chatbot — ein realistisches Gegenüber, das auf deiner echten Situation basiert."
          />
          <FeatureItem
            icon={FileText}
            title="Gesprächsanalyse"
            desc="Schriftlich und gesprochen nach jedem Gespräch — Höhen, Tiefen, was GFK-konform war, was missverstanden werden konnte."
          />
          <FeatureItem
            icon={BookOpen}
            title="Materialbibliothek"
            desc="Kuratierte GFK-Ressourcen — Texte, Videos, PDFs, Links. Passend zu deiner Situation vorgeschlagen."
          />
          <FeatureItem
            icon={MessageCircle}
            title="Expertenchat"
            desc="Direkte Verbindung zur GFK-Expertin — asynchron, persönlich, ohne Wartezeiten im System."
          />
          <FeatureItem
            icon={Video}
            title="Videocall buchbar"
            desc="20 Minuten persönliches Gespräch wenn mehr Tiefe gefragt ist. Direkt buchbar über CLARA."
          />
        </div>
      </section>

      {/* ── PREISE ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>Preise</SectionLabel>
          <h2 className="text-2xl font-bold tracking-tight">Einfach, klar, fair.</h2>
          <p className="text-sm text-muted-foreground">
            Kein Abo. Pakete nachkaufen wenn du willst, solange du willst.
          </p>
        </div>

        {/* Free entry */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 shrink-0">
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold">Zum Einstieg: 2 Gespräche kostenlos</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kein Kreditkarte, keine Verpflichtung — einfach ausprobieren und schauen
              ob CLARA zu dir passt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PriceCard
            name="Starter"
            price="€14.99"
            per="10 Gespräche · max. 30 Min je"
            features={[
              "Beide Modi (A: Empfangen + B: Üben)",
              "Persona-Erstellung vor jedem Gespräch",
              "Gesprächsanalyse schriftlich + Sprache",
              "Kein Ablaufdatum, kein Abo",
              "Weitere Pakete jederzeit nachkaufbar",
            ]}
          />
          <PriceCard
            name="Pro"
            price="€29.99"
            per="10 Gespräche + alle Extras"
            features={[
              "Alles aus Starter",
              "Zugang zur Materialbibliothek",
              "Asynchroner Expertenchat",
              "1 Videocall inklusive (20 Minuten)",
              "Weitere Videocalls à €20 buchbar",
            ]}
            highlight
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Alle Preise inkl. MwSt. · Gespräche verfallen nicht · Pakete sind nicht übertragbar.
        </p>
      </section>

      {/* ── FOOTER NOTE ── */}
      <section className="border-t border-border pt-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          CLARA ist ein Produkt im{" "}
          <strong className="text-foreground">KAIA Universe</strong> —
          entwickelt von Dagmar Rostek.
        </p>
        <p className="text-xs text-muted-foreground">
          CLARA ist eine Künstliche Intelligenz, kein Mensch. Ihre Empathie basiert
          auf Sprachmustern, nicht auf echtem Mitgefühl. Kein Ersatz für therapeutische
          oder seelsorgerische Unterstützung.
        </p>
        <p className="text-xs text-muted-foreground">
          Bei akuter psychischer Belastung:{" "}
          <strong className="text-foreground">0800 111 0 111</strong> · Notruf{" "}
          <strong className="text-foreground">112</strong>
        </p>
      </section>

    </main>
  )
}
