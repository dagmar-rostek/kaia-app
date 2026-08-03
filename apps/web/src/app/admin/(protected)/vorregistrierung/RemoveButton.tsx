"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, X } from "lucide-react"

export function RemoveButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleWithEmail() {
    if (!confirm(`${name} wirklich entfernen? Die Person bekommt eine E-Mail.`)) return
    setLoading(true)
    try {
      await fetch("/admin/api/preregister-remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleSilent() {
    if (!confirm(`${name} still löschen? Kein E-Mail wird verschickt.`)) return
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
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={handleSilent}
        disabled={loading}
        className="p-1.5 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-40"
        title="Still löschen — kein E-Mail"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        onClick={handleWithEmail}
        disabled={loading}
        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
        title="Entfernen + E-Mail senden"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
