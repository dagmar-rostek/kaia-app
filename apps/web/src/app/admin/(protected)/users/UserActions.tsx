"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { approveUser, rejectUser } from "./actions"

export function ApproveButton({ userId }: { userId: number }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => approveUser(userId))}
      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      Freigeben
    </button>
  )
}

export function RejectButton({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" />
        Ablehnen
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Grund (optional)"
        className="rounded border border-border bg-background px-2 py-1 text-xs w-36 focus:outline-none focus:border-foreground/40"
      />
      <button
        disabled={pending}
        onClick={() => startTransition(() => rejectUser(userId, reason || "rejected_by_admin"))}
        className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Bestätigen"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Abbrechen
      </button>
    </div>
  )
}
