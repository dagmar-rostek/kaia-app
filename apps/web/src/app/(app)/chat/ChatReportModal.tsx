"use client"

import { useState } from "react"
import { Flag, X } from "lucide-react"
import { authFetch } from "@/lib/auth"

interface Props {
  sessionId: number
  onClose: () => void
}

export function ChatReportModal({ sessionId, onClose }: Props) {
  const [reason, setReason] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit() {
    setSending(true)
    setError(false)
    try {
      const res = await authFetch(`/api/v1/chat/sessions/${sessionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || null }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      setTimeout(onClose, 2000)
    } catch {
      setError(true)
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sitzung unterbrechen"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-background border border-border shadow-xl p-6 space-y-5">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-amber-500 shrink-0" />
            <h2 className="text-sm font-semibold">Sitzung unterbrechen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 pb-2">
            Danke. Die Forscherin wurde benachrichtigt und schaut sich an, was passiert ist.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Du hast die Sitzung unterbrochen — das ist vollkommen in Ordnung.
              Die Forscherin wird benachrichtigt.
            </p>
            <p className="text-xs text-muted-foreground/70 leading-relaxed -mt-2">
              Dieser Button ist für den Fall, dass KAIA sich seltsam verhält oder
              etwas Unangemessenes sagt. Für persönliche Krisen wende dich bitte an die
              Telefonseelsorge: <strong className="text-foreground">0800 111 0 111</strong> (kostenlos, 24/7).
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Was hat dich gestört?{" "}
                <span className="font-normal">(optional — hilft bei der Auswertung)</span>
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="z.B. KAIA hat etwas Seltsames geschrieben, sich wiederholt, …"
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            {error && (
              <p className="text-xs text-destructive">
                Meldung konnte nicht gesendet werden. Bitte schreib Dagmar direkt an.
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {sending ? "…" : "Fertig"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
