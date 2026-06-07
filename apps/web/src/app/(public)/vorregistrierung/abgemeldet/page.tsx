"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

const API = ""

function AbgemeldetContent() {
  const params = useSearchParams()
  const token = params.get("token")
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setTimeout(() => setStatus("error"), 0)
      return
    }
    fetch(`${API}/api/v1/preregister/unsubscribe/${token}`)
      .then(r => r.ok ? setStatus("ok") : setStatus("error"))
      .catch(() => setStatus("error"))
  }, [token])

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
      {status === "loading" && <p className="text-muted-foreground text-sm">Einen Moment…</p>}

      {status === "ok" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold">Abgemeldet.</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Du bist von der Voranmeldeliste entfernt. Kein Drama, kein schlechtes Gewissen.
            Du kannst dich jederzeit wieder anmelden.
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Hm.</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Der Link ist ungültig oder bereits verwendet.
            Schreib direkt an{" "}
            <a href="mailto:dagmar@ecoaching-rostek.de" className="underline hover:text-foreground">
              dagmar@ecoaching-rostek.de
            </a>
          </p>
        </>
      )}

      <Link href="/" className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Zur Startseite
      </Link>
    </main>
  )
}

export default function AbgemeldetPage() {
  return (
    <Suspense fallback={<main className="max-w-md mx-auto px-6 py-24 text-center"><p className="text-muted-foreground text-sm">Einen Moment…</p></main>}>
      <AbgemeldetContent />
    </Suspense>
  )
}
