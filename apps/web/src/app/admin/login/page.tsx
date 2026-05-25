"use client"

import { useActionState } from "react"
import { loginAction } from "../actions"
import { Lock } from "lucide-react"

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">KAIA Admin</h1>
          <p className="text-sm text-muted-foreground">Passwort eingeben um fortzufahren</p>
        </div>

        <form action={action} className="space-y-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Admin-Passwort"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {pending ? "Wird geprüft…" : "Einloggen"}
          </button>
        </form>
      </div>
    </div>
  )
}
