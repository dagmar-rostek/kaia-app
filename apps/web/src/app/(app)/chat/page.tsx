"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { DoorOpen, Loader2, Plus, Send } from "lucide-react"
import { LegalFooter } from "@/components/LegalFooter"
import { tokenStore } from "@/lib/auth"

const API_BASE = ""  // relative — Caddy proxies /api/* to FastAPI

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface ChatMessage {
  id: string
  role: Role
  content: string
  streaming?: boolean
  isClosing?: boolean  // marks the closure bubble
}

// Closure state machine:
//   idle            → normal chat
//   loading         → /closing SSE in flight
//   awaiting_confirm→ KAIA's closing bubble done, showing [Antworten] / [Jetzt beenden]
//   ended           → /end called, session over
type ClosureState = "idle" | "loading" | "awaiting_confirm" | "ended"

interface SSEDelta { type: "delta";  content: string }
interface SSEDone  { type: "done";   message_id: number; input_tokens: number; output_tokens: number }
interface SSEError { type: "error";  message: string }
type SSEEvent = SSEDelta | SSEDone | SSEError

// ── Auth helper ───────────────────────────────────────────────────────────────

declare global {
  interface Window { __kaia_access_token?: string }
}

function getAuthHeader(): Record<string, string> {
  const token =
    tokenStore.get() ??
    (typeof window !== "undefined" ? window.__kaia_access_token : undefined) ??
    (typeof localStorage !== "undefined" ? localStorage.getItem("kaia_access_token") : null) ??
    ""
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── SSE stream reader ─────────────────────────────────────────────────────────

async function readSSEStream(
  response: Response,
  onDelta: (content: string) => void,
  onDone: (messageId?: number) => void,
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) return
  const decoder = new TextDecoder()
  let buf = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split("\n")
    buf = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      try {
        const evt = JSON.parse(line.slice(6)) as SSEEvent
        if (evt.type === "delta") onDelta(evt.content)
        else if (evt.type === "done") onDone(evt.message_id)
      } catch { /* ignore malformed lines */ }
    }
  }
}

// ── Chat page ─────────────────────────────────────────────────────────────────

const CHARACTER_LABELS = {
  warm:        "🌸 Warm",
  challenging: "⚡ Herausfordernd",
  wild:        "🎭 Überraschend",
} as const

type Character = keyof typeof CHARACTER_LABELS

// Inactivity timeout after closure bubble appears (10 min)
const CLOSURE_TIMEOUT_MS = 10 * 60 * 1000

export default function ChatPage() {
  const router = useRouter()
  const [sessionId,    setSessionId]    = useState<number | null>(null)
  const [sessionNumber, setSessionNumber] = useState<number | null>(null)
  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [input,        setInput]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [character,    setCharacter]    = useState<Character>("warm")
  const [openTrigger,  setOpenTrigger]  = useState(0)
  const [closureState,     setClosureState]     = useState<ClosureState>("idle")
  const [closureExchanges, setClosureExchanges] = useState(0)
  const [lastKaiaMessageId, setLastKaiaMessageId] = useState<number | null>(null)
  const [activeFeedback,   setActiveFeedback]   = useState<string | null>(null)

  const bottomRef        = useRef<HTMLDivElement>(null)
  const textareaRef      = useRef<HTMLTextAreaElement>(null)
  const closureTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userTurnCountRef = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  // Clear inactivity timer on unmount
  useEffect(() => {
    return () => {
      if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    }
  }, [])

  // Auto-create session + fetch KAIA opening on mount and after reset
  useEffect(() => {
    let cancelled = false
    const streamId = `a-open-${Date.now()}`

    const run = async () => {
      setLoading(true)
      setClosureState("idle")
      setClosureExchanges(0)
      try {
        const sessRes = await fetch(`${API_BASE}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ character }),
        })
        if (sessRes.status === 403) {
          const body = await sessRes.json().catch(() => ({})) as { code?: string; redirect?: string }
          if (body.redirect) { router.replace(body.redirect); return }
          if (body.code === "study_completed") {
            setError("Die Studie ist abgeschlossen. Danke für deine Teilnahme!")
            setLoading(false)
            return
          }
        }
        if (!sessRes.ok) throw new Error(`Session-Start fehlgeschlagen (${sessRes.status})`)
        const sessData = await sessRes.json() as { id: number; session_number: number }
        if (cancelled) return
        const sid = sessData.id
        setSessionId(sid)
        setSessionNumber(sessData.session_number)
        setMessages([{ id: streamId, role: "assistant", content: "", streaming: true }])

        const openRes = await fetch(`${API_BASE}/api/v1/chat/sessions/${sid}/opening`, {
          method: "POST",
          headers: { ...getAuthHeader() },
        })
        if (!openRes.ok) throw new Error("Opening fehlgeschlagen")
        await readSSEStream(
          openRes,
          (content) => {
            if (!cancelled) setMessages(prev => prev.map(m =>
              m.id === streamId ? { ...m, content: m.content + content } : m
            ))
          },
          () => {
            if (!cancelled) setMessages(prev => prev.map(m =>
              m.id === streamId ? { ...m, streaming: false } : m
            ))
          },
        )
      } catch (e) {
        if (!cancelled) {
          setMessages([])
          setError(e instanceof Error ? e.message : "Verbindungsfehler")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [openTrigger, character])

  const resetSession = useCallback((newChar?: Character) => {
    if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    if (newChar) setCharacter(newChar)
    setSessionId(null)
    setSessionNumber(null)
    setMessages([])
    setError(null)
    setClosureState("idle")
    setClosureExchanges(0)
    setOpenTrigger(t => t + 1)
  }, [])

  // ── Closure flow ──────────────────────────────────────────────────────────────
  // NOTE: endSession is declared before startClosure because startClosure
  // references it in a setTimeout callback.

  const endSession = useCallback(async () => {
    if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    if (!sessionId) { setClosureState("ended"); return }

    try {
      await fetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { ...getAuthHeader() },
      })
    } catch { /* best-effort */ }

    setClosureState("ended")
  }, [sessionId])

  const startClosure = useCallback(async () => {
    if (!sessionId || closureState !== "idle" || loading) return
    setClosureState("loading")
    setError(null)

    const streamId = `a-close-${Date.now()}`
    setMessages(prev => [...prev, {
      id: streamId, role: "assistant", content: "", streaming: true, isClosing: true,
    }])

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/closing`, {
        method: "POST",
        headers: { ...getAuthHeader() },
      })
      if (!res.ok) throw new Error("Abschluss fehlgeschlagen")

      await readSSEStream(
        res,
        (content) => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: m.content + content } : m
        )),
        () => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, streaming: false } : m
        )),
      )

      setClosureState("awaiting_confirm")

      // 10-min inactivity timeout → auto-end
      closureTimerRef.current = setTimeout(() => { void endSession() }, CLOSURE_TIMEOUT_MS)

    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== streamId))
      setError(e instanceof Error ? e.message : "Verbindungsfehler")
      setClosureState("idle")
    }
  }, [sessionId, closureState, loading, endSession])

  // User clicks "Antworten" after a closure bubble → back to normal chat
  const replyAfterClosure = useCallback(() => {
    if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    setClosureExchanges(n => n + 1)
    setClosureState("idle")
    textareaRef.current?.focus()
  }, [])

  // ── Feedback buttons ──────────────────────────────────────────────────────────

  const sendFeedback = useCallback(async (feedbackType: string) => {
    if (!sessionId || loading || closureState === "ended") return
    setActiveFeedback(feedbackType)
    // Flash visual confirmation — clear after 1.5s regardless of outcome
    setTimeout(() => setActiveFeedback(null), 1500)

    try {
      await fetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ feedback_type: feedbackType, message_id: lastKaiaMessageId }),
      })
    } catch { /* best-effort — EMA signal, not blocking */ }

    // Active types: also stream KAIA's metacognitive reaction
    if (feedbackType === "stuck" || feedbackType === "unclear") {
      const streamId = `a-meta-${Date.now()}`
      setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/chat/sessions/${sessionId}/meta-question?feedback_type=${feedbackType}`,
          { method: "POST", headers: { ...getAuthHeader() } },
        )
        if (!res.ok) throw new Error("Meta-Frage fehlgeschlagen")
        await readSSEStream(
          res,
          (content) => setMessages(prev => prev.map(m =>
            m.id === streamId ? { ...m, content: m.content + content } : m
          )),
          (messageId) => {
            setMessages(prev => prev.map(m =>
              m.id === streamId ? { ...m, streaming: false } : m
            ))
            if (messageId) setLastKaiaMessageId(messageId)
          },
        )
      } catch (e) {
        setMessages(prev => prev.filter(m => m.id !== streamId))
        setError(e instanceof Error ? e.message : "Verbindungsfehler")
      } finally {
        setLoading(false)
        textareaRef.current?.focus()
      }
    }
  }, [sessionId, loading, closureState, lastKaiaMessageId])

  // ── Send message ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userContent = input.trim()
    setInput("")
    setLoading(true)
    setError(null)

    let sid = sessionId
    if (!sid) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ character }),
        })
        if (!res.ok) throw new Error(`Session-Start fehlgeschlagen (${res.status})`)
        const data = await res.json() as { id: number }
        sid = data.id
        setSessionId(sid)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Verbindungsfehler")
        setLoading(false)
        return
      }
    }

    userTurnCountRef.current += 1
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: userContent }])
    const streamId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])

    let streamOk = false
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ content: userContent }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Unbekannter Fehler" })) as { detail: string }
        throw new Error(body.detail)
      }
      await readSSEStream(
        res,
        (content) => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: m.content + content } : m
        )),
        (messageId) => {
          setMessages(prev => prev.map(m =>
            m.id === streamId ? { ...m, streaming: false } : m
          ))
          if (messageId) setLastKaiaMessageId(messageId)
        },
      )
      streamOk = true
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== streamId))
      setError(e instanceof Error ? e.message : "Verbindungsfehler")
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }

    // After 2 post-closure exchanges, re-trigger the closure bubble
    if (streamOk && closureExchanges >= 2) {
      void startClosure()
      return
    }
    // Auto-trigger closure after 10 user turns (safety net for endless sessions)
    if (streamOk && closureState === "idle" && userTurnCountRef.current >= 10) {
      void startClosure()
    }
  }, [input, loading, sessionId, character, closureExchanges, closureState, startClosure])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const inputDisabled = loading
    || closureState === "loading"
    || closureState === "awaiting_confirm"
    || closureState === "ended"

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">KAIA</span>
          {sessionNumber !== null && (
            <span className="text-xs text-muted-foreground">
              Session {sessionNumber} von 10
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(CHARACTER_LABELS) as Character[]).map(c => (
            <button
              key={c}
              onClick={() => resetSession(c)}
              disabled={closureState === "ended"}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                character === c
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {CHARACTER_LABELS[c]}
            </button>
          ))}
          <button
            onClick={() => resetSession()}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Neue Session starten"
            aria-label="Neue Session starten"
          >
            <Plus className="h-4 w-4" />
          </button>
          {/* Session beenden — prominent, weil Studienteilnehmende das aktiv tun müssen */}
          {closureState === "idle" && sessionId && messages.length > 1 && (
            <button
              onClick={() => void startClosure()}
              title="Beendet diese Session — KAIA stellt eine Abschlussfrage, danach wird die Session gespeichert"
              aria-label="Session beenden"
              className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <DoorOpen className="h-3.5 w-3.5" />
              Session beenden
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        aria-live="polite"
        aria-label="Chat-Verlauf"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Silent context sentence for Sessions 9 and 10 */}
          {sessionNumber !== null && sessionNumber >= 9 && messages.length > 0 && (
            <p className="text-center text-xs text-muted-foreground/50 pt-2 pb-1">
              {sessionNumber === 10
                ? "Das ist deine letzte Session."
                : "Das ist deine vorletzte Session."}
            </p>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-foreground text-background rounded-br-sm"
                  : msg.isClosing
                    ? "bg-muted/60 text-foreground rounded-bl-sm border border-border"
                    : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {msg.content || (msg.streaming && (
                  <span className="inline-flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Closure actions — appear below last message, no modal */}
          {closureState === "awaiting_confirm" && (
            <div className="flex flex-col items-start gap-2 pl-0 sm:pl-1 pt-1">
              {closureExchanges < 2 && (
                <button
                  onClick={replyAfterClosure}
                  className="text-sm px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
                  aria-label="Auf KAIAs Abschlussfrage antworten"
                >
                  Antworten
                </button>
              )}
              <button
                onClick={() => void endSession()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                aria-label="Session jetzt beenden"
              >
                Jetzt wirklich beenden
              </button>
            </div>
          )}

          {/* Session ended notice */}
          {closureState === "ended" && (
            <div
              className="text-center text-xs text-muted-foreground/60 py-2"
              aria-live="assertive"
            >
              Session beendet.{" "}
              <button
                onClick={() => resetSession()}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Neue Session starten
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Feedback buttons — EMA signals, sticky above input */}
      {sessionId && closureState !== "ended" && messages.length > 1 && (
        <div
          className="shrink-0 border-t border-border/40 px-4 pt-2 pb-1.5"
          role="group"
          aria-label="Momentan-Feedback"
        >
          <div className="max-w-2xl mx-auto space-y-1.5">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
              Wie war diese Antwort?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {([
                {
                  type: "transfer_marker",
                  label: "Muss ich weiterdenken",
                  title: "Markiert diese Einsicht — für deine Reflexion und die Studie",
                },
                {
                  type: "wow",
                  label: "Wow — das trifft was",
                  title: "Positives Signal: diese Frage hat etwas ausgelöst",
                },
                {
                  type: "stuck",
                  label: "Ich hänge gerade",
                  title: "KAIA stellt eine neue Frage um dich weiterzubringen",
                },
                {
                  type: "unclear",
                  label: "Das verstehe ich noch nicht",
                  title: "KAIA formuliert die Frage anders",
                },
              ] as const).map(btn => (
                <button
                  key={btn.type}
                  onClick={() => void sendFeedback(btn.type)}
                  disabled={loading || closureState === "loading" || closureState === "awaiting_confirm"}
                  title={btn.title}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeFeedback === btn.type
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                  aria-pressed={activeFeedback === btn.type}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={closureState === "ended" ? "Session beendet" : "Antworte KAIA…"}
            rows={1}
            disabled={inputDisabled}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 leading-relaxed overflow-y-auto"
            style={{ maxHeight: "200px" }}
            aria-label="Nachricht an KAIA"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={inputDisabled || !input.trim()}
            className="shrink-0 p-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Nachricht senden"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </div>

        <p className="max-w-2xl mx-auto mt-2 text-xs text-muted-foreground/40">
          Enter senden · Shift+Enter neue Zeile
        </p>
      </div>

      <LegalFooter />
    </div>
  )
}
