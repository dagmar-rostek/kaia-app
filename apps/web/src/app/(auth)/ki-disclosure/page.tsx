"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Brain, Shield, AlertTriangle, Eye, CheckCircle2 } from "lucide-react"

export default function KiDisclosurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAcknowledge() {
    setLoading(true)
    setError(null)
    try {
      await api.post("/v1/auth/disclosure-ack", {})
      router.push("/onboarding")
    } catch {
      setError("Fehler beim Speichern. Bitte versuche es erneut.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-muted">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bevor du beginnst</h1>
          <p className="text-muted-foreground text-sm">
            Bitte lies diese Information sorgfältig durch.
          </p>
        </div>

        {/* Disclosure content */}
        <div className="rounded-xl border border-border bg-card space-y-0 overflow-hidden">

          <div className="p-5 space-y-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">KAIA ist eine Künstliche Intelligenz</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KAIA ist kein Mensch und kein Therapeut. Du kommunizierst mit einem
              KI-Sprachmodell (Large Language Model). Die empathische Kommunikation
              basiert auf <em>Computational Empathy</em> — statistischen Mustern aus
              Trainingsdaten, nicht auf echtem Mitgefühl oder Verständnis.
            </p>
          </div>

          <div className="p-5 space-y-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Wie KAIA funktioniert</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KAIA begleitet dich beim Lernen durch sokratische Fragen — es gibt dir
              keine Antworten vor, sondern hilft dir, eigene Lösungen zu entwickeln.
              KAIA erinnert sich an frühere Gespräche. Diese Erinnerungen werden
              pseudonymisiert gespeichert und nach Studienende gelöscht.
            </p>
          </div>

          <div className="p-5 space-y-2 border-b border-border bg-amber-500/5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Kein Ersatz für professionelle Hilfe
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KAIA ist kein psychologischer Notfalldienst und kein Therapeut. Bei
              persönlichen Krisen, psychischen Notlagen oder dem Wunsch nach
              professioneller Unterstützung wende dich bitte an ausgebildete Fachkräfte.
            </p>
            <p className="text-sm font-medium">
              Telefonseelsorge:{" "}
              <span className="font-mono text-foreground">0800 111 0 111</span>
              {" "}(kostenlos, 24/7) · Notruf:{" "}
              <span className="font-mono text-foreground">112</span>
            </p>
          </div>

          <div className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <h2 className="text-sm font-semibold">Deine Daten</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deine Gespräche werden für die Forschungsstudie gespeichert und nach
              6 Monaten nach Studienende vollständig gelöscht. Nur anonymisierte
              Ergebnisse fließen in die Thesis ein. Du kannst deine Daten jederzeit
              löschen lassen.
            </p>
            <p className="text-sm text-muted-foreground">
              Vollständige Details:{" "}
              <Link href="/datenschutz" className="underline hover:text-foreground transition-colors" target="_blank">
                Datenschutzerklärung
              </Link>
            </p>
          </div>
        </div>

        {/* Confirmation */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAcknowledge}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Wird gespeichert…"
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Ich habe das gelesen und verstanden
              </>
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Mit dem Fortfahren bestätigst du, dass KAIA eine KI ist und kein Mensch.
          </p>
        </div>
      </div>
    </div>
  )
}
