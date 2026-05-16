"use client";

import { useState } from "react";
import { Bug, X, Send } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function BugReportWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ vorname: "", email: "", beschreibung: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API}/api/v1/bug-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Bug melden"
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Bug melden</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Bug melden</h2>
              <button onClick={() => { setOpen(false); setStatus("idle"); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === "sent" ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Danke! Deine Meldung ist direkt bei der Entwicklung angekommen.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Vorname</label>
                  <input
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="z.B. Anna"
                    value={form.vorname}
                    onChange={e => setForm(f => ({ ...f, vorname: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">E-Mail</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="du@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Was ist passiert?</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Was hast du gemacht, was hat nicht funktioniert?"
                    value={form.beschreibung}
                    onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))}
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-destructive">Senden fehlgeschlagen. Bitte versuche es erneut.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {status === "sending" ? "Wird gesendet…" : "Bug-Report senden"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
