"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
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

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">Alles abgeschlossen.</h1>
            <p className="text-muted-foreground leading-relaxed">
              10 Sessions, beide Fragebögen — alles da. Die Daten fließen in die Masterthesis ein.
              Du wirst über die Ergebnisse informiert.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eine letzte Sache, bevor du gehst — optional, aber es lohnt sich:
              Was nimmst du mit? Nicht für die Studie. Für dich. Schreib es auf, dann weg damit.
            </p>
            <textarea
              rows={4}
              placeholder="Was hast du gelernt — wirklich gelernt?"
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            />
            <p className="text-[11px] text-muted-foreground/40">
              Diese Notiz verlässt deinen Browser nicht — sie wird nicht gespeichert, nicht gesendet.
            </p>
          </div>

          <button
            onClick={() => void handleLogout()}
            className="w-full rounded-xl bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Fertig.
          </button>

          <p className="text-xs text-muted-foreground/50">
            Du kannst dich jederzeit wieder einloggen und deine Gesprächsprotokolle einsehen.
          </p>
        </div>
      </div>
      <LegalFooter />
    </div>
  )
}
