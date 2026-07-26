"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, LogOut } from "lucide-react"
import { LegalFooter } from "@/components/LegalFooter"
import { apiLogout } from "@/lib/auth"

export default function AbschlussPage() {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await apiLogout().catch(() => null)
    router.replace("/login")
  }, [router])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 text-center">

          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Studie abgeschlossen</h1>
            <p className="text-muted-foreground leading-relaxed">
              Du hast alle 10 Sessions und beide Fragebögen abgeschlossen.
              Das war eine echte Leistung — danke, dass du dabei warst.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Die Ergebnisse fließen in die Masterthesis ein.
              Du wirst über die Ergebnisse informiert, sobald die Auswertung abgeschlossen ist.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-5 text-left space-y-3">
            <p className="text-sm font-medium">Was jetzt noch passiert</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>→ Deine Gesprächsdaten werden pseudonymisiert ausgewertet</li>
              <li>→ Nach 6 Monaten nach Studienende werden alle Daten gelöscht</li>
              <li>→ Du kannst jederzeit Auskunft zu deinen Daten anfragen</li>
            </ul>
          </div>

          <button
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-muted transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>

          <p className="text-xs text-muted-foreground/50">
            Diese Seite bleibt erreichbar — du kannst dich jederzeit wieder einloggen und nachschauen.
          </p>
        </div>
      </div>
      <LegalFooter />
    </div>
  )
}
