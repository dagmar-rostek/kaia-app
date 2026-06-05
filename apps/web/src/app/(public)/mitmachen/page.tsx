import Link from "next/link"
import {
  MessageSquare, Brain, ClipboardList, Video,
  Clock, Shield, CheckCircle2, ArrowRight,
  Star, Users, Calendar, BookOpen, AlertTriangle,
} from "lucide-react"

export const metadata = {
  title: "Mitmachen — KAIA Pilotstudie",
  description:
    "Werde Teil der KAIA-Pilotstudie: Teste einen KI-Lernbegleiter, der dir keine Antworten gibt — nur die richtigen Fragen. 4 Wochen, flexibel, aus der Forschung.",
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

      {/* ── HERO ── */}
      <section className="space-y-6 text-center">
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge>Masterthesis · SRH Riedlingen</Badge>
          <Badge>Sommer 2026</Badge>
          <Badge>~32 Teilnehmende gesucht</Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          Eine KI, die dir{" "}
          <span className="italic">keine Antworten</span>{" "}
          gibt.
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          KAIA stellt nur Fragen — und genau das macht sie besonders.
          Erlebe einen neuen Ansatz des KI-gestützten Lernens und hilf dabei,
          ihn wissenschaftlich zu verstehen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/registrierung"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Jetzt anmelden <ArrowRight className="h-4 w-4" />
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
      <section className="rounded-xl border border-border bg-muted/20 p-8 space-y-5">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-muted-foreground shrink-0" />
          <h2 className="text-lg font-semibold">Was ist KAIA?</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          KAIA ist ein KI-Lernbegleiter — aber kein gewöhnlicher. Die meisten KI-Tools
          liefern sofort Antworten, Erklärungen, Lösungen. KAIA macht das Gegenteil:
          Sie stellt Fragen, die dich selbst zum Denken bringen.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dieses Prinzip hat einen Namen: <strong className="text-foreground">Sokratische Methode</strong> —
          benannt nach dem griechischen Philosophen, der Wissen nicht vermittelte,
          sondern es durch gezieltes Nachfragen zum Vorschein brachte.
          Forschung zeigt: Wissen, das man selbst erarbeitet, sitzt tiefer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { icon: MessageSquare, text: "Chatbasiert — kein App-Download nötig" },
            { icon: BookOpen,      text: "Dein Lernthema, dein Tempo" },
            { icon: Shield,        text: "DSGVO-konform, Server in der EU" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 rounded-lg border border-border p-3">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABLAUF ── */}
      <section id="ablauf" className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Wie läuft die Teilnahme ab?</h2>
          <p className="text-muted-foreground text-sm">
            Vier Schritte — insgesamt ca. <strong className="text-foreground">3–5 Stunden über 4 Wochen</strong>.
            Du entscheidest wann, wie oft und wie lange.
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
              Du erstellst ein Konto und beantwortest einen kurzen Fragebogen mit{" "}
              <strong className="text-foreground">10 Fragen</strong> — das dauert etwa 3 Minuten.
              Die Fragen beschäftigen sich damit, wie du deine eigene
              Lernfähigkeit einschätzt.
            </p>
            <p>
              Außerdem bestätigst du kurz, dass KAIA eine KI ist und kein Mensch —
              das ist uns wichtig, transparent zu kommunizieren.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1">
              <p className="font-medium text-foreground">Was wird gemessen?</p>
              <p>
                Der Fragebogen misst, wie zuversichtlich du dich einschätzt,
                neue oder schwierige Aufgaben aus eigener Kraft zu bewältigen —
                <em> nicht</em>, wie gut du bist oder wie viel du weißt.
                Es gibt keine richtigen oder falschen Antworten.
                Wir vergleichen deine Antworten vor und nach den vier Wochen mit KAIA.
              </p>
            </div>
          </StepCard>

          <StepCard
            number="2"
            icon={BookOpen}
            title="Lernthema wählen"
            duration="5 Minuten · einmalig"
            accent
          >
            <p>
              Du wählst ein Thema, mit dem du dich in den nächsten vier Wochen
              beschäftigen möchtest. <strong className="text-foreground">Alles ist möglich:</strong>{" "}
              ein Studienfach, ein Berufsprojekt, ein Buch das du verstehen willst,
              eine neue Sprache, ein technisches Konzept — du bestimmst.
            </p>
            <p>
              KAIA passt sich an dein Thema an. Du musst nichts vorbereiten
              und kein Vorwissen haben.
            </p>
          </StepCard>

          <StepCard
            number="3"
            icon={MessageSquare}
            title="Mindestens 3 Sessions mit KAIA"
            duration="je ~20–30 Minuten · über 4 Wochen verteilt"
          >
            <p>
              Du chatterst mit KAIA über dein Lernthema — wann du willst,
              so oft du willst. Mindestens drei Sessions über vier Wochen
              sind für die Auswertung nötig, aber du kannst jederzeit mehr machen.
            </p>
            <p>
              KAIA wird dir <strong className="text-foreground">keine fertigen Antworten</strong> geben.
              Das kann am Anfang ungewohnt wirken — und ist gleichzeitig
              das Herzstück des Experiments.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs">
              <p className="font-medium text-foreground">Was passiert in einer Session?</p>
              <p className="mt-1 text-muted-foreground">
                Du schreibst KAIA, womit du dich gerade beschäftigst.
                KAIA fragt nach. Du denkst nach. Manchmal ist es wie ein
                Gespräch mit einer sehr neugierigen Freundin, die alles hinterfragt —
                und dich dadurch selbst weiterdenken lässt.
              </p>
            </div>
          </StepCard>

          <StepCard
            number="4"
            icon={Video}
            title="Abschluss: Fragebogen + Interview"
            duration="Fragebogen ~3 Min · Interview ~45 Min (optional, aber wertvoll)"
          >
            <p>
              Nach vier Wochen beantwortest du dieselben 10 Fragen wie am Anfang —
              das dauert wieder 3 Minuten. Dieser Vergleich ist das Herzstück
              der wissenschaftlichen Auswertung.
            </p>
            <p>
              Zusätzlich lade ich dich zu einem optionalen
              <strong className="text-foreground"> Abschlussinterview von ca. 45 Minuten</strong> ein —
              per Video oder persönlich, ganz wie du möchtest.
            </p>
            <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1.5">
              <p className="font-medium text-foreground">Was besprechen wir im Interview?</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Wie hat sich das Lernen mit KAIA angefühlt?</li>
                <li>Was hat dich überrascht — positiv oder negativ?</li>
                <li>Hat sich etwas an deinem Umgang mit schwierigen Aufgaben verändert?</li>
                <li>Was würdest du an KAIA verändern?</li>
              </ul>
              <p className="text-muted-foreground pt-1">
                Das Interview wird mit deiner Einwilligung aufgezeichnet und
                anonymisiert ausgewertet. Kein Test, keine richtigen Antworten —
                das Interview ist der Raum, in dem <em>deine</em> Erfahrung zählt,
                nicht das System.
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
              title: "Eine neue Art zu lernen — gratis ausprobieren",
              desc: "KAIA ist noch nicht öffentlich. Als Teilnehmende:r bist du unter den Ersten, die einen sokratischen KI-Lernbegleiter im Einsatz erleben.",
            },
            {
              title: "Selbstkenntnis mitnehmen",
              desc: "Der Fragebogen am Anfang und Ende gibt dir ein kleines Fenster in deine eigene Selbstwirksamkeitsüberzeugung — die Überzeugung, Schwieriges aus eigener Kraft zu meistern. Interessant auch für dich persönlich.",
            },
            {
              title: "Teil einer Masterthesis sein",
              desc: "Deine anonymisierten Erfahrungen fließen in eine echte wissenschaftliche Arbeit ein — ein konkreter Beitrag zur KI-Bildungsforschung.",
            },
            {
              title: "Teilnahmebestätigung auf Wunsch",
              desc: "Auf Anfrage bekommst du eine Bestätigung über deine Studienteilnahme — nutzbar für Portfolios, Bewerbungen oder einfach als Andenken.",
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
          Kein Vorwissen nötig, keine besonderen Anforderungen —
          nur ein paar grundlegende Voraussetzungen:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { ok: true,  text: "Volljährig (18+)" },
            { ok: true,  text: "Deutschsprachig" },
            { ok: true,  text: "Gerade am Lernen — Studium, Job, Hobby" },
            { ok: true,  text: "Zugang zu Computer oder Tablet" },
            { ok: true,  text: "~3–5 Stunden Zeit über 4 Wochen" },
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
          Die letzte Bedingung dient zum Schutz — KAIA ist kein therapeutisches
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
              { phase: "Vor Start",    dur: "10 Min",    desc: "Registrierung, Einwilligung, Kurzfragebogen (10 Fragen)" },
              { phase: "Woche 1–4",   dur: "3× 20–30 Min", desc: "Mindestens 3 Chat-Sessions mit KAIA — flexibel, wann du willst" },
              { phase: "Nach Woche 4", dur: "3 Min",      desc: "Abschluss-Fragebogen (dieselben 10 Fragen wie am Start)" },
              { phase: "Optional",    dur: "~45 Min",    desc: "Abschlussinterview mit der Forscherin (Video oder persönlich)" },
            ].map(({ phase, dur, desc }) => (
              <div key={phase} className="grid grid-cols-[100px_1fr] gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
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
            desc="Alle Daten werden auf einem Hetzner-Server in Helsinki, Finnland (EU) gespeichert. Keine US-Clouds für deine persönlichen Daten."
          />
          <TrustItem
            icon={CheckCircle2}
            title="Anonymisierte Auswertung"
            desc="In der Thesis und in Veröffentlichungen werden ausschließlich anonymisierte Ergebnisse verwendet. Kein Rückschluss auf dich als Person."
          />
          <TrustItem
            icon={Calendar}
            title="Automatische Löschung"
            desc="Alle deine Daten werden 6 Monate nach Studienende automatisch und vollständig gelöscht."
          />
          <TrustItem
            icon={BookOpen}
            title="Jederzeit aussteigen — wirklich"
            desc="Du kannst aufhören, wann du willst — ohne Begründung, ohne schlechtes Gewissen, ohne Folgen. Das ist ein echtes Angebot, kein Kleingedrucktes."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Vollständige Informationen findest du in der{" "}
          <Link href="/datenschutz" className="underline hover:text-foreground transition-colors">
            Datenschutzerklärung
          </Link>
          .
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-xl border border-foreground/20 bg-foreground/3 p-8 text-center space-y-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Bereit mitzumachen?</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Die Studie startet sobald das Ethikvotum der SRH vorliegt.
            Registriere dich jetzt — du wirst per E-Mail benachrichtigt,
            sobald es losgeht.
          </p>
        </div>
        <Link
          href="/registrierung"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-8 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Jetzt anmelden <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-xs text-muted-foreground">
          Noch Fragen?{" "}
          <a href="mailto:dagmar.rostek@wbstraining.de" className="underline hover:text-foreground transition-colors">
            dagmar.rostek@wbstraining.de
          </a>
        </p>
      </section>

      {/* ── FOOTER NOTE ── */}
      <section className="border-t border-border pt-8 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Diese Studie wurde im Rahmen einer Masterthesis an der{" "}
          <strong className="text-foreground">SRH Fernhochschule Riedlingen</strong>{" "}
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
