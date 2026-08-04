"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, XCircle, Loader2, Trash2, Mail, FlaskConical } from "lucide-react"
import { approveUser, rejectUser, deleteUser, sendStudyStartMails, sendUserStudyStartMail, seedCompletion } from "./actions"

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

export function RejectButton({ userId, compact = false }: { userId: number; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  if (!open) {
    return compact ? (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
        title="Ablehnen"
      >
        <XCircle className="h-3.5 w-3.5" />
      </button>
    ) : (
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

export function DeleteButton({ userId, compact = false }: { userId: number; compact?: boolean }) {
  const [confirm, setConfirm] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirm) {
    return compact ? (
      <button
        onClick={() => setConfirm(true)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
        title="Löschen"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    ) : (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Löschen
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Wirklich löschen?</span>
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteUser(userId))}
        className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Ja, löschen"}
      </button>
      <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Abbrechen
      </button>
    </div>
  )
}

export function UserMailButton({ userId, username }: { userId: number; username: string }) {
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (done) {
    return (
      <span className="p-1.5 text-emerald-500" title="Mail gesendet">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => {
        if (!confirm(`Studienstart-Mail an ${username} senden?`)) return
        const ok = await sendUserStudyStartMail(userId)
        if (ok) setDone(true)
      })}
      className="p-1.5 rounded-md text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors disabled:opacity-40"
      title="Studienstart-Mail senden"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
    </button>
  )
}

export function SeedCompletionButton({ userId }: { userId: number }) {
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (done) {
    return (
      <span className="p-1.5 text-emerald-500" title="Post-Survey angelegt">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!confirm("Synthetische Post-Survey-Daten anlegen (pre = post)?")) return
          const ok = await seedCompletion(userId)
          if (ok) setDone(true)
        })
      }
      className="p-1.5 rounded-md text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 transition-colors disabled:opacity-40"
      title="Auf COMPLETED setzen (Sim)"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
    </button>
  )
}

export function StudyStartMailButton({ activeCount }: { activeCount: number }) {
  const [confirm, setConfirm] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  if (sent !== null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {sent} Mails versendet
      </span>
    )
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        <Mail className="h-3.5 w-3.5" />
        Studienstart-Mail ({activeCount})
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
      <span className="text-xs text-muted-foreground">An {activeCount} aktive User senden?</span>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => {
          const result = await sendStudyStartMails()
          setSent(result.sent)
        })}
        className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin inline" /> : "Ja, senden"}
      </button>
      <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Abbrechen
      </button>
    </div>
  )
}
