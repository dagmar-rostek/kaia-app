"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

export function SilentDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!confirm(`${name} endgültig löschen? Kein E-Mail wird verschickt.`)) return
    setLoading(true)
    try {
      await fetch("/admin/api/preregister-silent-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-40"
      title="Endgültig löschen — kein E-Mail"
    >
      <X className="h-4 w-4" />
    </button>
  )
}
