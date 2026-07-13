"use client"

import { Info, X } from "lucide-react"

const CHARACTER_INFO = [
  {
    id: "warm",
    label: "🌸 Begleitend",
    desc: "KAIA stellt ruhige, aufbauende Fragen. Gut für den Einstieg in ein neues Thema oder wenn du gerade Orientierung brauchst.",
  },
  {
    id: "challenging",
    label: "⚡ Konfrontierend",
    desc: "KAIA hinterfragt direkt und bringt dich zum Widerspruch. Gut wenn du weißt, was du denkst — und es auf den Prüfstand stellen willst.",
  },
  {
    id: "wild",
    label: "🎭 Perspektivwechselnd",
    desc: "KAIA stellt unerwartete Verbindungen her. Gut wenn du aus eingefahrenen Denkmustern herauswillst.",
  },
]

const BUTTON_INFO = [
  {
    label: "Muss ich weiterdenken",
    desc: "Markiert eine Einsicht — für deine Reflexion und die Studie.",
  },
  {
    label: "Wow — das trifft was",
    desc: "Positives Signal: diese Frage hat etwas ausgelöst.",
  },
  {
    label: "Ich hänge gerade",
    desc: "KAIA stellt eine neue Frage, um dich weiterzubringen.",
  },
  {
    label: "Das verstehe ich noch nicht",
    desc: "KAIA formuliert die Frage anders.",
  },
  {
    label: "Session beenden",
    desc: "Leitet den bewussten Abschluss ein. KAIA stellt eine letzte Frage, dann wird die Session gespeichert.",
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function ChatInfoPanel({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Anleitung"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-background border border-border shadow-xl">

        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Anleitung</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Anleitung schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-7">

          {/* Charaktere */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Die drei KAIA-Charaktere
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Du kannst den Charakter jederzeit oben im Header wechseln — auch mitten in der Studie.
              Eine neue Session startet dann mit dem neuen Charakter.
            </p>
            <div className="space-y-2.5">
              {CHARACTER_INFO.map(c => (
                <div key={c.id} className="rounded-lg border border-border p-3 space-y-1">
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Regeln */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Spielregeln
            </h3>
            <div className="space-y-3 text-sm">
              {[
                {
                  n: "1",
                  title: "Maximal eine Session pro Tag.",
                  body: "Das Lernen passiert auch zwischen den Sessions — lass dir Zeit.",
                },
                {
                  n: "2",
                  title: "Beende jede Session bewusst.",
                  body: 'Eine Session ist fertig, wenn du etwas hast, womit du jetzt weiterarbeiten kannst — einen Gedanken, eine Frage, ein Vorhaben. Oder wenn du merkst, dass du dich wiederholst.',
                },
                {
                  n: "3",
                  title: "Kein Zeitdruck.",
                  body: "Es gibt keine Mindestzeit. Qualität schlägt Quantität.",
                },
                {
                  n: "4",
                  title: "10 Sessions in 4 Wochen.",
                  body: "Das macht 2–3 Sessions pro Woche. Nicht jeden Tag nötig.",
                },
              ].map(r => (
                <div key={r.n} className="flex gap-2.5">
                  <span className="text-muted-foreground shrink-0">{r.n}.</span>
                  <p>
                    <strong>{r.title}</strong>{" "}
                    <span className="text-muted-foreground">{r.body}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Was die Buttons bedeuten
            </h3>
            <div className="space-y-2.5">
              {BUTTON_INFO.map(btn => (
                <div key={btn.label} className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium border border-border rounded px-1.5 py-0.5 w-fit text-foreground/80">
                    {btn.label}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-0.5">
                    {btn.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
