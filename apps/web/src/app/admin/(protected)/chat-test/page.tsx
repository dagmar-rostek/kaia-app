"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Send, Plus, Loader2, RefreshCw } from "lucide-react"

const CHARACTER_LABELS = {
  warm:        "🌸 Warm",
  challenging: "⚡ Herausfordernd",
  wild:        "🎭 Überraschend",
} as const

type Character = keyof typeof CHARACTER_LABELS

type Role = "user" | "assistant"
interface ChatMessage { id: string; role: Role; content: string; streaming?: boolean }
interface SSEDelta { type: "delta"; content: string }
interface SSEDone  { type: "done";  message_id: number; input_tokens: number; output_tokens: number }
interface SSEError { type: "error"; message: string }
type SSEEvent = SSEDelta | SSEDone | SSEError

export default function AdminChatTestPage() {
  const [token,        setToken]        = useState<string | null>(null)
  const [tokenError,   setTokenError]   = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)
  const [sessionId,    setSessionId]    = useState<number | null>(null)
  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [input,        setInput]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [character,    setCharacter]    = useState<Character>("warm")
  const [chatError,    setChatError]    = useState<string | null>(null)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    let cancelled = false
    fetch("/admin/api/test-token", { method: "POST" })
      .then(async res => {
        if (!res.ok) throw new Error(`Token-Fehler (${res.status})`)
        return res.json() as Promise<{ access_token: string }>
      })
      .then(data => { if (!cancelled) { setToken(data.access_token); setTokenError(null) } })
      .catch(e => { if (!cancelled) { setTokenError(e instanceof Error ? e.message : "Fehler") } })
    return () => { cancelled = true }
  }, [fetchTrigger])

  const authHeader = useMemo(
    (): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  )

  const resetSession = useCallback((newChar?: Character) => {
    if (newChar) setCharacter(newChar)
    setSessionId(null)
    setMessages([])
    setChatError(null)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !token) return

    const userContent = input.trim()
    setInput("")
    setLoading(true)
    setChatError(null)

    let sid = sessionId
    if (!sid) {
      try {
        const res = await fetch("/api/v1/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ character }),
        })
        if (!res.ok) throw new Error(`Session-Start fehlgeschlagen (${res.status})`)
        const data = await res.json() as { id: number }
        sid = data.id
        setSessionId(sid)
      } catch (e) {
        setChatError(e instanceof Error ? e.message : "Verbindungsfehler")
        setLoading(false)
        return
      }
    }

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: userContent }])
    const streamId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])

    try {
      const res = await fetch(`/api/v1/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ content: userContent }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Fehler" })) as { detail: string }
        throw new Error(body.detail)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("Kein Stream")

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
            if (evt.type === "delta") {
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, content: m.content + evt.content } : m
              ))
            } else if (evt.type === "done") {
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, streaming: false } : m
              ))
            } else if (evt.type === "error") {
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, content: evt.message, streaming: false } : m
              ))
            }
          } catch { /* ignore malformed lines */ }
        }
      }
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== streamId))
      setChatError(e instanceof Error ? e.message : "Verbindungsfehler")
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, loading, sessionId, character, token, authHeader])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-sm text-red-500">{tokenError}</p>
        <button
          onClick={() => { setToken(null); setTokenError(null); setFetchTrigger(t => t + 1) }}
          className="text-sm underline"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground animate-pulse">Token wird vorbereitet…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">Chat-Test</span>
          {sessionId && <span className="text-xs text-muted-foreground font-mono">Session #{sessionId}</span>}
          <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded">admin_test@kaia.internal</span>
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
          <button
            onClick={() => { setToken(null); setTokenError(null); setFetchTrigger(t => t + 1) }}
            className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Token erneuern"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="max-w-md mx-auto text-center space-y-3 pt-16">
            <p className="text-lg font-medium">Bereit.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Echter Produktions-Chat — Prompt aus DB, SSE-Stream, llm_usage-Logging.
            </p>
          </div>
        )}
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
          {chatError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {chatError}
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
            placeholder="Nachricht schreiben…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: "128px" }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            className="shrink-0 p-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground/40 mt-2">Enter senden · Shift+Enter neue Zeile</p>
      </div>

    </div>
  )
}
