"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Send, Plus, Loader2, RefreshCw, Brain, ChevronDown, ChevronRight } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

const CHARACTER_LABELS = {
  warm:        "🌸 Warm",
  challenging: "⚡ Herausfordernd",
  wild:        "🎭 Überraschend",
} as const

type Character = keyof typeof CHARACTER_LABELS
type Role = "user" | "assistant"

interface ChatMessage {
  id: string
  role: Role
  content: string
  streaming?: boolean
  thinkingRef?: string  // links to an entry in thinkingLog
}

interface ThinkingEntry {
  id: string          // matches ChatMessage.thinkingRef
  index: number       // 1-based display counter
  content: string     // raw thinking text (inner content of <thinking>)
  phase: string       // conversation phase label
  fragetyp: string | null  // extracted [N=Label] from Fragetyp line
  lazarus: string | null   // extracted [signal] from Lazarus line
}

function getPhase(index: number): string {
  if (index === 1) return "Eröffnung"
  if (index === 2) return "Einstieg"
  if (index <= 5)  return "Hauptteil"
  return "Abschluss-Phase"
}

function extractBracket(content: string, label: string): string | null {
  const m = new RegExp(`${label}[^[]*\\[([^\\]]+)\\]`).exec(content)
  return m ? m[1] : null
}

interface SSEDelta   { type: "delta";    content: string }
interface SSEThink   { type: "thinking"; content: string }
interface SSEDone    { type: "done";     message_id: number; input_tokens: number; output_tokens: number }
interface SSEError   { type: "error";   message: string }
type SSEEvent = SSEDelta | SSEThink | SSEDone | SSEError

// ── SSE helper ─────────────────────────────────────────────────────────────────

async function readSSEStream(
  response: Response,
  onDelta:   (content: string) => void,
  onThink:   (content: string) => void,
  onDone:    () => void,
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
        if (evt.type === "delta")    onDelta(evt.content)
        else if (evt.type === "thinking") onThink(evt.content)
        else if (evt.type === "done")     onDone()
      } catch { /* ignore malformed */ }
    }
  }
}

// ── Thinking panel helpers ─────────────────────────────────────────────────────

/** Render thinking content with XML tag syntax highlighting */
function ThinkingContent({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="font-mono text-xs leading-relaxed">
      <span className="text-amber-400/80">&lt;thinking&gt;</span>
      {lines.map((line, i) => {
        // Split line by XML-like tags
        const parts = line.split(/(<[^>]+>)/g)
        return (
          <div key={i} className="pl-2">
            {parts.map((part, j) => {
              if (/^<[^>]+>$/.test(part)) {
                return <span key={j} className="text-amber-400/80">{part}</span>
              }
              // Highlight [bracket] values
              const bp = part.split(/(\[[^\]]*\])/g)
              return bp.map((chunk, k) =>
                /^\[[^\]]*\]$/.test(chunk)
                  ? <span key={`${j}-${k}`} className="text-sky-400 font-semibold">{chunk}</span>
                  : <span key={`${j}-${k}`} className="text-zinc-300">{chunk}</span>
              )
            })}
          </div>
        )
      })}
      <span className="text-amber-400/80">&lt;/thinking&gt;</span>
    </div>
  )
}

const PHASE_COLORS: Record<string, string> = {
  "Eröffnung":      "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Einstieg":       "text-sky-400 bg-sky-400/10 border-sky-400/20",
  "Hauptteil":      "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "Abschluss-Phase":"text-rose-400 bg-rose-400/10 border-rose-400/20",
}

function ThinkingBlock({ entry, autoOpen }: { entry: ThinkingEntry; autoOpen: boolean }) {
  const [open, setOpen] = useState(autoOpen)
  const phaseColor = PHASE_COLORS[entry.phase] ?? "text-amber-400 bg-amber-400/10 border-amber-400/20"
  return (
    <div className="rounded-lg border border-amber-500/20 overflow-hidden text-left">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex flex-col gap-1.5 px-3 py-2.5 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="text-xs font-mono text-amber-400">Analyse #{entry.index}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${phaseColor}`}>
              {entry.phase}
            </span>
          </div>
          {open
            ? <ChevronDown className="h-3 w-3 text-amber-400/60 shrink-0" />
            : <ChevronRight className="h-3 w-3 text-amber-400/60 shrink-0" />
          }
        </div>
        {(entry.fragetyp || entry.lazarus) && (
          <div className="flex items-center gap-3 pl-5">
            {entry.lazarus && (
              <span className="text-xs text-muted-foreground/60">
                Lazarus: <span className="text-sky-400 font-mono">[{entry.lazarus}]</span>
              </span>
            )}
            {entry.fragetyp && (
              <span className="text-xs text-muted-foreground/60">
                Fragetyp: <span className="text-sky-400 font-mono">[{entry.fragetyp}]</span>
              </span>
            )}
          </div>
        )}
      </button>
      {open && (
        <div className="px-3 py-3 bg-zinc-950 overflow-x-auto max-h-[500px] overflow-y-auto">
          <ThinkingContent content={entry.content} />
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminChatTestPage() {
  const [token,        setToken]        = useState<string | null>(null)
  const [tokenError,   setTokenError]   = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)
  const [sessionId,    setSessionId]    = useState<number | null>(null)
  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [thinkingLog,  setThinkingLog]  = useState<ThinkingEntry[]>([])
  const thinkCounterRef = useRef(0)
  const [input,        setInput]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [character,    setCharacter]    = useState<Character>("warm")
  const [chatError,    setChatError]    = useState<string | null>(null)
  const [openTrigger,  setOpenTrigger]  = useState(0)

  const chatBottomRef     = useRef<HTMLDivElement>(null)
  const analysisBottomRef = useRef<HTMLDivElement>(null)
  const textareaRef       = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])
  useEffect(() => { analysisBottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [thinkingLog])

  // Fetch admin test token
  useEffect(() => {
    let cancelled = false
    fetch("/admin/api/test-token", { method: "POST" })
      .then(async res => {
        if (!res.ok) throw new Error(`Token-Fehler (${res.status})`)
        return res.json() as Promise<{ access_token: string }>
      })
      .then(data => { if (!cancelled) { setToken(data.access_token); setTokenError(null) } })
      .catch(e  => { if (!cancelled) setTokenError(e instanceof Error ? e.message : "Fehler") })
    return () => { cancelled = true }
  }, [fetchTrigger])

  const authHeader = useMemo(
    (): Record<string, string> => token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  )

  // Auto-create session + KAIA opening on token ready or reset
  useEffect(() => {
    if (!token) return
    let cancelled = false
    const streamId = `a-open-${Date.now()}`
    const thinkId  = `t-open-${Date.now()}`

    const run = async () => {
      setLoading(true)
      try {
        const sessRes = await fetch("/api/v1/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ character }),
        })
        if (!sessRes.ok) throw new Error(`Session-Start fehlgeschlagen (${sessRes.status})`)
        const { id: sid } = await sessRes.json() as { id: number }
        if (cancelled) return
        setSessionId(sid)
        setMessages([{ id: streamId, role: "assistant", content: "", streaming: true }])

        const openRes = await fetch(`/api/v1/chat/sessions/${sid}/opening?debug=true`, {
          method: "POST",
          headers: { ...authHeader },
        })
        if (!openRes.ok) throw new Error("Opening fehlgeschlagen")

        await readSSEStream(
          openRes,
          (content) => {
            if (!cancelled) setMessages(prev => prev.map(m =>
              m.id === streamId ? { ...m, content: m.content + content } : m
            ))
          },
          (thinking) => {
            if (!cancelled) {
              const idx = ++thinkCounterRef.current
              setThinkingLog(log => [...log, {
                id: thinkId, index: idx, content: thinking,
                phase: getPhase(idx),
                fragetyp: extractBracket(thinking, "Fragetyp"),
                lazarus:  extractBracket(thinking, "Lazarus-Signal"),
              }])
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, thinkingRef: thinkId } : m
              ))
            }
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
          setChatError(e instanceof Error ? e.message : "Verbindungsfehler")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [token, openTrigger, character, authHeader])

  const resetSession = useCallback((newChar?: Character) => {
    if (newChar) setCharacter(newChar)
    setSessionId(null)
    setMessages([])
    setThinkingLog([])
    thinkCounterRef.current = 0
    setChatError(null)
    setOpenTrigger(t => t + 1)
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
    const thinkId  = `t-${Date.now()}`
    setMessages(prev => [...prev, { id: streamId, role: "assistant", content: "", streaming: true }])

    try {
      const res = await fetch(`/api/v1/chat/sessions/${sid}/messages?debug=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ content: userContent }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Fehler" })) as { detail: string }
        throw new Error(body.detail)
      }
      await readSSEStream(
        res,
        (content) => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, content: m.content + content } : m
        )),
        (thinking) => {
          const idx = ++thinkCounterRef.current
          setThinkingLog(log => [...log, {
            id: thinkId, index: idx, content: thinking,
            phase: getPhase(idx),
            fragetyp: extractBracket(thinking, "Fragetyp"),
            lazarus:  extractBracket(thinking, "Lazarus-Signal"),
          }])
          setMessages(prev => prev.map(m =>
            m.id === streamId ? { ...m, thinkingRef: thinkId } : m
          ))
        },
        () => setMessages(prev => prev.map(m =>
          m.id === streamId ? { ...m, streaming: false } : m
        )),
      )
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== streamId))
      setChatError(e instanceof Error ? e.message : "Verbindungsfehler")
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, loading, sessionId, character, token, authHeader])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage() }
  }

  if (tokenError) return (
    <div className="fixed top-0 left-56 right-0 bottom-0 flex flex-col items-center justify-center gap-4 p-8 bg-background">
      <p className="text-sm text-red-500">{tokenError}</p>
      <button
        onClick={() => { setToken(null); setTokenError(null); setFetchTrigger(t => t + 1) }}
        className="text-sm underline"
      >Erneut versuchen</button>
    </div>
  )

  if (!token) return (
    <div className="fixed top-0 left-56 right-0 bottom-0 flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground animate-pulse">Token wird vorbereitet…</p>
    </div>
  )

  return (
    <div className="fixed top-0 left-56 right-0 bottom-0 flex overflow-hidden bg-background">

      {/* ── Left: Chat ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-border">

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
              >{CHARACTER_LABELS[c]}</button>
            ))}
            <button
              onClick={() => resetSession()}
              className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Neue Session"
            ><Plus className="h-4 w-4" /></button>
            <button
              onClick={() => { setToken(null); setTokenError(null); setFetchTrigger(t => t + 1) }}
              className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Token erneuern"
            ><RefreshCw className="h-4 w-4" /></button>
          </div>
        </div>

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
            {chatError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {chatError}
              </div>
            )}
            <div ref={chatBottomRef} />
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

      {/* ── Right: Analyse-Panel ───────────────────────────────────────────── */}
      <div className="flex flex-col w-[420px] shrink-0 bg-zinc-950/50">

        {/* Panel Header */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/10">
          <Brain className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">Analyse-Log</span>
          {thinkingLog.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {thinkingLog.length} {thinkingLog.length === 1 ? "Eintrag" : "Einträge"}
            </span>
          )}
        </div>

        {/* Thinking blocks */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {thinkingLog.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <Brain className="h-8 w-8 text-amber-400/20" />
              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                Hier erscheinen KAIAs interne Analysen.<br/>
                Jede Antwort zeigt Lazarus-Signale,<br/>
                Fragetyp, Crisis-Check und mehr.
              </p>
            </div>
          )}
          {thinkingLog.map((entry, i) => (
            <ThinkingBlock
              key={entry.id}
              entry={entry}
              autoOpen={i === thinkingLog.length - 1}
            />
          ))}
          <div ref={analysisBottomRef} />
        </div>

        {/* Legend */}
        <div className="shrink-0 border-t border-border px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wide mb-2">Legende</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400/80">&lt;tag&gt;</span>
            <span className="text-xs text-muted-foreground/60">XML-Struktur</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-sky-400 font-semibold">[wert]</span>
            <span className="text-xs text-muted-foreground/60">Klassifikations-Tag</span>
          </div>
        </div>
      </div>

    </div>
  )
}
