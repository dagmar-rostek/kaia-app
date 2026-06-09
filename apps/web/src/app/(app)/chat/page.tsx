"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Send, Plus, Loader2 } from "lucide-react"
import { LegalFooter } from "@/components/LegalFooter"

const API_BASE = ""  // relative — Caddy proxies /api/* to FastAPI

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface ChatMessage {
  id: string
  role: Role
  content: string
  streaming?: boolean
}

interface SSEDelta { type: "delta"; content: string }
interface SSEDone  { type: "done";  message_id: number; input_tokens: number; output_tokens: number }
interface SSEError { type: "error"; message: string }
type SSEEvent = SSEDelta | SSEDone | SSEError

// ── Auth helper ───────────────────────────────────────────────────────────────

declare global {
  interface Window { __kaia_access_token?: string }
}

function getAuthHeader(): Record<string, string> {
  const token =
    (typeof window !== "undefined" ? window.__kaia_access_token : undefined) ??
    (typeof localStorage !== "undefined" ? localStorage.getItem("kaia_access_token") : null) ??
    ""
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── SSE stream reader ─────────────────────────────────────────────────────────

async function readSSEStream(
  response: Response,
  onDelta: (content: string) => void,
  onDone: () => void,
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
        else if (evt.type === "done") onDone()
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

export default function ChatPage() {
  const [sessionId,   setSessionId]   = useState<number | null>(null)
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [input,       setInput]       = useState("")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [character,   setCharacter]   = useState<Character>("warm")
  const [openTrigger, setOpenTrigger] = useState(0)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-create session + fetch KAIA opening on mount and after reset
  useEffect(() => {
    let cancelled = false
    const streamId = `a-open-${Date.now()}`

    const run = async () => {
      setLoading(true)
      try {
        // Create session
        const sessRes = await fetch(`${API_BASE}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ character }),
        })
        if (!sessRes.ok) throw new Error(`Session-Start fehlgeschlagen (${sessRes.status})`)
        const { id: sid } = await sessRes.json() as { id: number }
        if (cancelled) return
        setSessionId(sid)
        setMessages([{ id: streamId, role: "assistant", content: "", streaming: true }])

        // Fetch opening
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
    if (newChar) setCharacter(newChar)
    setSessionId(null)
    setMessages([])
    setError(null)
    setOpenTrigger(t => t + 1)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userContent = input.trim()
    setInput("")
    setLoading(true)
    setError(null)

    // Session should exist from opening — fallback: create one
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

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: userContent }])
    const streamId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])

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
        () => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, streaming: false } : m
        )),
      )
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== streamId))
      setError(e instanceof Error ? e.message : "Verbindungsfehler")
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, loading, sessionId, character])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">KAIA</span>
          {sessionId && (
            <span className="text-xs text-muted-foreground font-mono">#{sessionId}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(CHARACTER_LABELS) as Character[]).map(c => (
            <button
              key={c}
              onClick={() => resetSession(c)}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
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
            className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Neue Session"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-foreground text-background rounded-br-sm"
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

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Antworte KAIA…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 leading-relaxed overflow-y-auto"
            style={{ maxHeight: "128px" }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            className="shrink-0 p-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground/40 mt-2">
          Enter senden · Shift+Enter neue Zeile
        </p>
      </div>

      <LegalFooter />
    </div>
  )
}
