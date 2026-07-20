import Link from "next/link"
import {
  MessageSquare, Brain, ClipboardList, Video,
  Clock, Shield, CheckCircle2, ArrowRight,
  Star, Users, Calendar, BookOpen, AlertTriangle,
  Target, Sparkles, Map,
} from "lucide-react"
import { StudyCountdown } from "@/components/StudyCountdown"

export const metadata = {
  title: "Mitmachen — KAIA Pilotstudie",
  description:
    "Werde Teil der KAIA-Pilotstudie: Ein KI-Begleiter für das Wissen, das du schon hast — aber noch nicht wirklich lebst. Vom Verstehen ins Tun. Start: 1. August 2026.",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

function StepCard({
  number, icon: Icon, title, duration, children, accent = false,
}: {
  number: string
  icon: React.ElementType
  title: string
  duration: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-6 space-y-4 ${accent ? "border-foreground/20 bg-foreground/3" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0 ${accent ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
            {number}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{title}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{duration}</span>
            </div>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-muted shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  )
}

function TrustItem({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MitmachenPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-20">

      {/* ── COUNTDOWN BANNER ── */}
      <section className="rounded-xl border border-border bg-muted/20 p-6 text-center space-y-4">
        <p className="text-sm font-medium">
          Registrierung öffnet am <strong>1. August 2026</strong>
        </p>
        <StudyCountdown label="Noch" />
        <p className="text-xs text-muted-foreground">
          Lies schon mal weiter — du weißt dann genau worauf du dich einlässt.
        </p>
      </section>

      {/* ── HERO ── */}
      <section className="space-y-6 text-center">
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge>Masterthesis · SRH Fernhochschule</Badge>
          <Badge>Start: 1. August 2026</Badge>
          <Badge>~20 Teilnehmende gesucht</Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          Du weißt es bereits.{" "}
          <span className="italic">Jetzt lebst du es auch.</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          KAIA ist nicht für Einsteiger. KAIA ist für Menschen, die Methoden
          kennen, Workshops hinter sich haben, Bücher gelesen haben —
          aber im Alltag trotzdem nicht umsetzen, was sie wissen.
          Diesen Gap schließt KAIA: vom Verstehen ins Tun.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
            href="/vorregistrierung"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Jetzt vorregistrieren <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#ablauf"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            Wie läuft es ab?
          </a>
        </div>
      </section>

      {/* ── WHAT IS KAIA ── */}
      <section className="rounded-xl border border-border bg-muted/20 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-muted-foreground shrink-0" />
          <h2 className="text-lg font-semibold">Was ist KAIA?</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Kennst du das? Du warst in Workshops, hast Bücher gelesen, verstehst
          die Prinzipien — aber Delegieren, Feedbackgespräche führen,
          Konflikte direkt ansprechen passiert im Alltag trotzdem nicht.
          Das ist keine Schwäche. Das ist das größte ungelöste Problem
          beim Lernen: der Gap zwischen Wissen und Tun.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          KAIA stellt Fragen — sokratisch, konsequent, ohne Ratschläge.
          Fragen, die dich zwingen, selbst zu durchdenken was dich wirklich aufhält.
          Was zwischen Verstehen und konsequentem Handeln steht.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Das erfordert etwas: Du musst ein Thema mitbringen, das du schon kennst.
          Kein Wissenserwerb von Null — das kann KAIA nicht.
          Aber den Schritt vom Wissen ins Tun: dafür ist KAIA gemacht.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: MessageSquare, text: "Chatbasiert — kein App-Download" },
            { icon: Sparkles,      text: "Passt sich deinem Tempo an" },
            { icon: Shield,        text: "DSGVO-konform, Server in der EU" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 rounded-lg border border-border p-3">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-muted/40 border border-border p-4 text-xs space-y-2">
          <p className="font-medium text-foreground">Was KAIA ist — und was nicht</p>
          <p className="text-muted-foreground leading-relaxed">
            KAIA ist eine Künstliche Intelligenz, kein Mensch.
            Ihre Einfühlsamkeit basiert auf Sprachmustern, nicht auf echtem Mitgefühl.
            Sie ist kein Therapeut, kein Coach und kein Notfalldienst.
            Das kommunizieren wir offen — du bestätigst das einmalig bei der Registrierung.
          </p>
        </div>
      </section>

      {/* ── ABLAUF ── */}
      <section id="ablauf" className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Wie läuft die Teilnahme ab?</h2>
          <p className="text-muted-foreground text-sm">
            Fünf Schritte — insgesamt ca. <strong className="text-foreground">2–3 Stunden über 4 Wochen</strong>.
            Du entscheidest wann und wie lange — mindestens 10 Sessions à mind. 5 Minuten.
          </p>
        </div>

        <div className="space-y-4">

          <StepCard
            number="1"
            icon={ClipboardList}
            title="Registrierung & Kurzfragebogen"
            duration="ca. 10 Minuten · einmalig vor dem Start"
          >
            <p>
              Du erstellst ein Konto und beantwortest{" "}
              <strong className="text-foreground">10 kurze Fragen</strong> — das dauert etwa 3 Minuten.
              Die Fragen beschäftigen sich damit, wie zuversichtlich du dich einschätzt,
              neue oder schwierige Aufgaben aus eigener Kraft zu bewältigen.
            </p>
            <p>
              Außerdem bestätigst du, dass KAIA eine KI ist und kein Mensch —
              das ist uns wichtig, transparent zu kommunizieren.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1">
              <p className="font-medium text-foreground">Was wird gemessen?</p>
              <p className="text-muted-foreground">
                Nicht wie gut du bist oder wie viel du weißt —
                sondern wie zuversichtlich du dich <em>selbst</em> einschätzt,
                Schwieriges zu meistern. Es gibt keine richtigen oder falschen Antworten.
                Wir vergleichen deine Antworten am Anfang und am Ende der vier Wochen.
              </p>
            </div>
          </StepCard>

          <StepCard
            number="2"
            icon={Map}
            title="Deine persönliche Lernroadmap erstellen"
            duration="5–10 Minuten · einmalig"
            accent
          >
            <p>
              Du wählst ein Thema — etwas, das du schon kennst oder verstehst,
              aber noch nicht konsequent in deinem Alltag lebst.{" "}
              <strong className="text-foreground">Konkrete Beispiele:</strong>{" "}
              Feedbackgespräche die du immer wieder aufschiebst, besser delegieren
              obwohl du weißt wie es geht, Konflikte direkt ansprechen, überzeugender
              präsentieren, Zeitblöcke wirklich einhalten.
            </p>
            <p>
              Du trägst ein, was du erreichen möchtest — und verfolgst
              deinen Fortschritt selbst. KAIA schlägt dir nichts vor und bewertet dich nicht.
              Du bist der Maßstab für dich.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1">
              <p className="font-medium text-foreground">Wichtig: Kein Neueinsteiger-Thema</p>
              <p className="text-muted-foreground">
                KAIA funktioniert nicht für &bdquo;Ich will Python lernen&ldquo; oder &bdquo;Ich will
                Spanisch für den Urlaub üben&ldquo; — das wäre Wissenserwerb von Null.
                KAIA ist für den Schritt danach: wenn das Wissen schon da ist,
                aber die Umsetzung fehlt.
              </p>
            </div>
          </StepCard>

          <StepCard
            number="3"
            icon={MessageSquare}
            title="Mindestens 10 Sessions mit KAIA"
            duration="je mind. 5 Minuten · über 4 Wochen verteilt"
          >
            <p>
              Du chatterst mit KAIA über dein Lernthema — kurz, fokussiert, wann du willst.
              Mindestens zehn Sessions über vier Wochen sind für die Auswertung nötig —
              das sind im Schnitt zweieinhalb pro Woche, also alle 2–3 Tage eine.
            </p>

            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-2">
              <p className="text-muted-foreground leading-relaxed">
                Was in einer Session passiert, lässt sich schwer vorausschreiben —
                das ist auch der Sinn der Sache.
                KAIA beginnt mit einer Frage. Du antwortest.
                Irgendwo dazwischen entsteht meistens etwas, womit du nicht gerechnet hast.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Was du am Ende einer Session mitnimmst: mindestens eine Erkenntnis,
                die du selbst erarbeitet hast — und einen konkreten nächsten Schritt,
                den du dir selbst gesetzt hast.
              </p>
            </div>
          </StepCard>

          <StepCard
            number="4"
            icon={Target}
            title="Abschluss-Fragebogen"
            duration="ca. 3 Minuten · einmalig nach Woche 4"
          >
            <p>
              Nach vier Wochen beantwortest du dieselben 10 Fragen wie am Anfang.
              Dieser Vergleich ist das Herzstück der wissenschaftlichen Auswertung —
              hat sich deine Einschätzung der eigenen Lernfähigkeit verändert?
            </p>
            <p>
              Außerdem hast du die Möglichkeit, deinen Lernroadmap-Fortschritt
              einzutragen: Was hast du in diesen vier Wochen tatsächlich gelernt?
            </p>
          </StepCard>

          <StepCard
            number="5"
            icon={Video}
            title="Abschlussinterview"
            duration="ca. 45 Minuten · optional, aber wertvoll"
          >
            <p>
              Ich lade dich zu einem persönlichen Gespräch ein —
              per Video oder persönlich, ganz wie du möchtest.
              Es wird mit deiner Einwilligung aufgezeichnet und anonymisiert ausgewertet.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1.5">
              <p className="font-medium text-foreground">Was besprechen wir?</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Wie hat sich das Lernen mit KAIA angefühlt?</li>
                <li>Was hat dich überrascht — positiv oder negativ?</li>
                <li>Hat sich etwas an deinem Umgang mit schwierigen Aufgaben verändert?</li>
                <li>Was würdest du an KAIA verändern?</li>
              </ul>
              <p className="text-muted-foreground pt-1">
                Kein Test, keine richtigen Antworten. Das Interview ist der Raum,
                in dem <em>deine</em> Erfahrung zählt — nicht das System.
                Das ist freiwillig, aber es macht aus Zahlen eine Geschichte.
              </p>
            </div>
          </StepCard>

        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="rounded-xl border border-border p-8 space-y-5">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Was du davon hast</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              title: "Wissen endlich in Wirkung bringen",
              desc: "Du verlässt diese vier Wochen nicht mit mehr Theorie — sondern mit konkreten ersten Schritten, die du wirklich gemacht hast. Das ist der Unterschied.",
            },
            {
              title: "Verstehen, was dich aufhält",
              desc: "KAIA hilft dir zu erkennen, was zwischen Wissen und Handeln steckt. Oft ist es nicht fehlendes Wissen — sondern etwas anderes, das erst durch Fragen sichtbar wird.",
            },
            {
              title: "Selbstkenntnis mitnehmen",
              desc: "Der Fragebogen am Anfang und Ende zeigt dir, wie sich deine eigene Einschätzung verändert hat. Interessant auch jenseits der Studie.",
            },
            {
              title: "Erste Reihe in einem echten Forschungsprojekt",
              desc: "KAIA ist noch nicht öffentlich. Deine Erfahrungen fließen direkt in eine Masterthesis und möglicherweise in zukünftige Veröffentlichungen ein.",
            },
            {
              title: "Teilnahmebestätigung auf Wunsch",
              desc: "Auf Anfrage bekommst du eine Bestätigung — nutzbar für Portfolio, Bewerbungen oder als Nachweis gesellschaftlichen Engagements in der Forschung.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REQUIREMENTS ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Wer kann mitmachen?</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Du brauchst kein technisches Vorwissen — aber du solltest ein Thema
          mitbringen, das du bereits kennst oder verstehst und endlich umsetzen willst.
          KAIA ist am stärksten für Menschen, die schon wissen was sie tun sollten,
          es aber im Alltag nicht tun.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { ok: true,  text: "Volljährig (18+)" },
            { ok: true,  text: "Deutschsprachig" },
            { ok: true,  text: "Hast ein Thema — und weißt eigentlich wie es geht" },
            { ok: true,  text: "Zugang zu Computer oder Tablet" },
            { ok: true,  text: "~2–3 Stunden Kapazität über 4 Wochen" },
            { ok: false, text: "Aktuell in psychiatrischer Behandlung wegen einer Krise" },
          ].map(({ ok, text }) => (
            <div key={text} className={`flex items-center gap-2.5 rounded-lg border p-3 ${ok ? "border-border" : "border-border/40 opacity-60"}`}>
              {ok
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              }
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Die letzte Bedingung dient deinem Schutz — KAIA ist kein therapeutisches
          Werkzeug und kein Ersatz für professionelle Unterstützung.
        </p>
      </section>

      {/* ── TIMELINE ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Zeitplan auf einen Blick</h2>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {[
              { phase: "Vor Start",     dur: "~10 Min",    desc: "Registrierung, Einwilligung, KI-Disclosure, Kurzfragebogen (10 Fragen)" },
              { phase: "Tag 1",         dur: "~10 Min",    desc: "Persönliche Lernroadmap anlegen — Thema, Ziel, persönliche Motivation" },
              { phase: "Woche 1–4",     dur: "10× mind. 5 Min", desc: "Mindestens 10 Sessions mit KAIA — flexibel, wann du willst" },
              { phase: "Nach Woche 4",  dur: "~5 Min",     desc: "Abschluss-Fragebogen (dieselben 10 Fragen + Roadmap-Update)" },
              { phase: "Optional",      dur: "~45 Min",    desc: "Abschlussinterview mit der Forscherin (Video oder persönlich, aufgezeichnet)" },
            ].map(({ phase, dur, desc }) => (
              <div key={phase} className="grid grid-cols-[110px_1fr] gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-xs font-medium">{phase}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{dur}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / DSGVO ── */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold">Deine Daten sind sicher</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TrustItem
            icon={Shield}
            title="DSGVO-konform"
            desc="Alle Daten auf einem Hetzner-Server in Helsinki, Finnland (EU). Keine US-Clouds für deine persönlichen Daten."
          />
          <TrustItem
            icon={CheckCircle2}
            title="Anonymisierte Auswertung"
            desc="In Thesis und Veröffentlichungen ausschließlich anonymisierte Ergebnisse. Kein Rückschluss auf dich als Person."
          />
          <TrustItem
            icon={Calendar}
            title="Automatische Löschung"
            desc="Alle Daten werden spätestens 1 Jahr nach Bekanntgabe der Abschlussnote vollständig gelöscht oder anonymisiert — in der Regel deutlich früher."
          />
          <TrustItem
            icon={BookOpen}
            title="Jederzeit aufhören — wirklich"
            desc="Du kannst aufhören, wann du willst. Ohne Begründung, ohne schlechtes Gewissen, ohne Folgen. Das ist ein echtes Angebot, kein Kleingedrucktes."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Vollständige Informationen in der{" "}
          <Link href="/datenschutz" className="underline hover:text-foreground transition-colors">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-xl border border-foreground/20 bg-foreground/3 p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Fast so weit.</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Die Registrierung ist geöffnet. Die Studie startet am <strong className="text-foreground">1. August 2026</strong>.
          </p>
        </div>
        <StudyCountdown label="Noch" />
        <Link
          href="/vorregistrierung"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-8 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Jetzt vorregistrieren <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-muted-foreground">
          Noch Fragen?{" "}
          <a href="mailto:Dagmar.Rostek@stud.mobile-university.de" className="underline hover:text-foreground transition-colors">
            Dagmar.Rostek@stud.mobile-university.de
          </a>
        </p>
      </section>

      {/* ── FOOTER NOTE ── */}
      <section className="border-t border-border pt-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Diese Studie wurde im Rahmen einer Masterthesis an der{" "}
          <strong className="text-foreground">SRH Fernhochschule</strong>{" "}
          (M.Sc. Data Science & Analytics) entwickelt und wird durch das
          Ethikkomitee der SRH geprüft.
        </p>
        <p className="text-xs text-muted-foreground">
          Bei Anzeichen psychischer Belastung: Telefonseelsorge{" "}
          <strong className="text-foreground">0800 111 0 111</strong>{" "}
          (kostenlos, 24/7) · Notruf <strong className="text-foreground">112</strong>
        </p>
      </section>

    </main>
  )
}
