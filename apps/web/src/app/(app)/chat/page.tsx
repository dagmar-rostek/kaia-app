"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, HelpCircle, LogOut, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { LegalFooter } from "@/components/LegalFooter"
import { tokenStore, authFetch, apiLogout } from "@/lib/auth"
import { ChatInfoPanel } from "./ChatInfoPanel"
import { ChatDayBanner } from "./ChatDayBanner"
import { ChatReportModal } from "./ChatReportModal"

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

interface ApiMessage {
  id: number
  role: string
  content: string
}

interface SessionData {
  id: number
  session_number: number
  messages?: ApiMessage[]
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
  warm:        "🌸 Begleitend",
  challenging: "⚡ Konfrontierend",
  wild:        "🎭 Perspektivwechselnd",
} as const

type Character = keyof typeof CHARACTER_LABELS

// Inactivity timeout after closure bubble appears (10 min)
const CLOSURE_TIMEOUT_MS = 10 * 60 * 1000

export default function ChatPage() {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    await apiLogout().catch(() => null)
    router.replace("/login")
  }, [router])

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
  const [resumed,          setResumed]          = useState(false)  // true wenn bestehende Session fortgesetzt
  const [showInfoPanel,    setShowInfoPanel]    = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showReportModal,  setShowReportModal]  = useState(false)
  // Derived: show banner only when no user message sent yet AND not manually dismissed
  const showDayBanner = !bannerDismissed && !messages.some(m => m.role === "user")

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

  // Best-effort: end session when user closes the browser tab/window.
  // navigator.sendBeacon is more reliable than fetch in beforeunload.
  useEffect(() => {
    const handleUnload = () => {
      if (!sessionId || closureState === "ended") return
      const token = tokenStore.get() ?? (typeof localStorage !== "undefined" ? localStorage.getItem("kaia_access_token") : null) ?? ""
      navigator.sendBeacon(
        `${API_BASE}/api/v1/chat/sessions/${sessionId}/end`,
        new Blob([JSON.stringify({ token })], { type: "application/json" }),
      )
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [sessionId, closureState])

  // On mount: try to resume an existing open session, otherwise create a new one.
  // This ensures the user doesn't lose their mid-session chat when they close the tab.
  useEffect(() => {
    let cancelled = false
    const streamId = `a-open-${Date.now()}`

    const run = async () => {
      setLoading(true)
      setClosureState("idle")
      setClosureExchanges(0)
      setResumed(false)

      try {
        // 1. Check for an existing open session
        const activeRes = await authFetch(`${API_BASE}/api/v1/chat/sessions/active`)

        if (activeRes.ok) {
          // Resume: load existing session + its messages
          const sessData = await activeRes.json() as SessionData
          if (cancelled) return
          setSessionId(sessData.id)
          setSessionNumber(sessData.session_number)
          setResumed(true)

          const history: ChatMessage[] = (sessData.messages ?? [])
            .filter((m: ApiMessage) => m.content)
            .map((m: ApiMessage) => ({
              id: `h-${m.id}`,
              role: m.role as Role,
              content: m.content,
            }))
          setMessages(history)
          userTurnCountRef.current = history.filter(m => m.role === "user").length
          setLoading(false)
          return
        }

        if (activeRes.status === 403) {
          const raw = await activeRes.json().catch(() => ({}))
          const body = (raw.detail ?? raw) as { code?: string; redirect?: string }
          if (body.redirect) { router.replace(body.redirect); return }
          if (body.code === "study_completed") {
            setError("Die Studie ist abgeschlossen. Danke für deine Teilnahme!")
            setLoading(false)
            return
          }
        }

        // 2. No active session — create a new one
        const sessRes = await authFetch(`${API_BASE}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ character }),
        })
        if (sessRes.status === 403) {
          const raw = await sessRes.json().catch(() => ({}))
          const body = (raw.detail ?? raw) as { code?: string; redirect?: string }
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

        const openRes = await authFetch(`${API_BASE}/api/v1/chat/sessions/${sid}/opening`, {
          method: "POST",
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
    setResumed(false)
    setBannerDismissed(false)
    setOpenTrigger(t => t + 1)
  }, [])

  // ── Closure flow ──────────────────────────────────────────────────────────────
  // NOTE: endSession is declared before startClosure because startClosure
  // references it in a setTimeout callback.

  const endSession = useCallback(async () => {
    if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    if (!sessionId) { setClosureState("ended"); return }

    try {
      await authFetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/end`, { method: "POST" })
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
      const res = await authFetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/closing`, {
        method: "POST",
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
      await authFetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_type: feedbackType, message_id: lastKaiaMessageId }),
      })
    } catch { /* best-effort — EMA signal, not blocking */ }

    // Active types: also stream KAIA's metacognitive reaction
    if (feedbackType === "stuck" || feedbackType === "unclear") {
      const streamId = `a-meta-${Date.now()}`
      setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])
      setLoading(true)
      try {
        const res = await authFetch(
          `${API_BASE}/api/v1/chat/sessions/${sessionId}/meta-question?feedback_type=${feedbackType}`,
          { method: "POST" },
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
        const res = await authFetch(`${API_BASE}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const res = await authFetch(`${API_BASE}/api/v1/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    // After 1 post-closure exchange, end the session — no second closing round
    if (streamOk && closureExchanges >= 1) {
      void endSession()
      return
    }
    // Auto-trigger closure after 10 user turns (safety net for endless sessions)
    if (streamOk && closureState === "idle" && userTurnCountRef.current >= 10) {
      void startClosure()
    }
  }, [input, loading, sessionId, character, closureExchanges, closureState, startClosure, endSession])

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
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Startseite
          </Link>
          <span className="text-border/60 select-none">|</span>
          <span className="font-semibold tracking-tight">KAIA</span>
          {sessionNumber !== null && (
            <span className="text-xs text-muted-foreground">
              Session {sessionNumber} von 10
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInfoPanel(v => !v)}
            title="Hilfe & Anleitung"
            aria-label="Hilfe & Anleitung anzeigen"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {sessionId && (
            <button
              onClick={() => setShowReportModal(true)}
              title="KAIA melden — wenn sich KAIA seltsam verhält oder etwas Unangemessenes schreibt"
              aria-label="KAIA-Verhalten melden"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-muted transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => void handleLogout()}
            title="Abmelden"
            aria-label="Abmelden"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {sessionNumber !== null && (
        <ChatDayBanner
          sessionNumber={sessionNumber}
          show={showDayBanner}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Ton-Selector — direkt über dem Chat */}
      {sessionId && closureState !== "ended" && (
        <div className="shrink-0 border-b border-border/40 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2.5">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide shrink-0">
              Ton
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(CHARACTER_LABELS) as Character[]).map(c => (
                <button
                  key={c}
                  onClick={() => resetSession(c)}
                  disabled={closureState !== "idle"}
                  title={`Gesprächston wechseln zu: ${CHARACTER_LABELS[c]} — startet eine neue Session`}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 ${
                    character === c
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {CHARACTER_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        aria-live="polite"
        aria-label="Chat-Verlauf"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Resume notice — shown when a previously open session was restored */}
          {resumed && messages.length > 0 && (
            <p className="text-center text-xs text-muted-foreground/50 pt-2 pb-1">
              Dein letztes Gespräch wurde fortgesetzt.
            </p>
          )}

          {/* Explanation for completed sessions — previous chats are not shown here */}
          {!resumed && sessionNumber !== null && sessionNumber > 1 && messages.length === 1 && (
            <p className="text-center text-xs text-muted-foreground/40 pt-1 pb-2">
              Deine früheren Sessions wurden gespeichert. KAIA trägt den Kontext weiter —
              auch wenn du den Verlauf hier nicht siehst.
            </p>
          )}

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
            <div className="flex items-center gap-2 pl-0 sm:pl-1 pt-1">
              {closureExchanges < 1 && (
                <button
                  onClick={replyAfterClosure}
                  className="text-sm px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
                  aria-label="Auf KAIAs Abschlussfrage antworten"
                >
                  Noch etwas sagen
                </button>
              )}
              <button
                onClick={() => void endSession()}
                className="text-sm px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                aria-label="Sitzung jetzt abschließen"
              >
                Sitzung abschließen
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
          {closureState === "idle" && closureExchanges === 0 && sessionId && messages.length > 1 && (
            <button
              onClick={() => void startClosure()}
              title="Beendet die Session bewusst — wenn du heute genug besprochen hast"
              aria-label="Sitzung abschließen"
              className="shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/60 hover:bg-muted transition-colors whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">Beenden</span>
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground/40 max-w-2xl mx-auto mt-1.5">
          Enter senden · Shift+Enter neue Zeile
        </p>
      </div>

      <LegalFooter />

      <ChatInfoPanel open={showInfoPanel} onClose={() => setShowInfoPanel(false)} />

      {showReportModal && sessionId && (
        <ChatReportModal
          sessionId={sessionId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}
