"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2, Download, HelpCircle, LogOut, Loader2, Send } from "lucide-react"
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

interface SessionSummary {
  session_id: number
  ready: boolean
  mood?: string | null
  topics: string[]
  strengths_observed?: string | null
  friction_points?: string | null
  first_step?: string | null
  strongest_quote?: string | null
  insight_for_next_session?: string | null
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

// ── Transcript download ───────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildTranscriptHTML(
  messages: ChatMessage[],
  sessionNumber: number | null,
  sessionName: string | null,
  summary: SessionSummary | null,
  participantName: string | null,
  topic: string | null,
): string {
  const date = new Date().toLocaleDateString("de-DE", { dateStyle: "long" })
  const sessionLabel = [sessionNumber ? `Session ${sessionNumber}` : null, sessionName].filter(Boolean).join(" · ")
  const pageTitle = ["KAIA", sessionLabel, topic, participantName, date].filter(Boolean).join(" — ")

  let html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(pageTitle)}</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.72;color:#111;max-width:660px;margin:0 auto;padding:36px 20px}
header{border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:28px}
header h1{font-size:13pt;font-weight:700;letter-spacing:.02em}
header .meta{font-size:9.5pt;color:#666;margin-top:5px}
h2{font-size:9.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#666;margin:28px 0 14px;border-top:1px solid #ddd;padding-top:14px}
.msg{margin-bottom:14px}
.lbl{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#aaa;margin-bottom:2px}
.lbl.k{color:#2563eb}
.txt{font-size:11pt;line-height:1.65}
.ri{margin-bottom:12px}
.rl{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#999;margin-bottom:2px}
.rv{font-size:11pt}
.quote{border-left:3px solid #2563eb;padding-left:12px;font-style:italic;color:#444;margin:3px 0}
.next{background:#f0f5ff;border-radius:5px;padding:10px 14px;margin-top:6px}
footer{margin-top:44px;padding-top:10px;border-top:1px solid #eee;font-size:8.5pt;color:#bbb}
@media print{body{padding:0}@page{margin:18mm 16mm}}
</style></head><body>
<header><h1>${esc(pageTitle.replace(` — ${date}`, ""))}</h1><div class="meta">${esc(date)}</div></header>
<h2>Gesprächsverlauf</h2>\n`

  for (const msg of messages) {
    if (msg.streaming) continue
    const isKaia = msg.role === "assistant"
    const content = esc(msg.content).replace(/\n/g, "<br>")
    html += `<div class="msg"><div class="lbl${isKaia ? " k" : ""}">${isKaia ? "KAIA" : "Du"}</div><div class="txt">${content}</div></div>\n`
  }

  if (summary) {
    html += `<h2>KAIAs Reflexion</h2>\n`
    if (summary.mood) html += `<div class="ri"><div class="rl">Stimmung</div><div class="rv">${esc(summary.mood)}</div></div>\n`
    if (summary.topics.length > 0) html += `<div class="ri"><div class="rl">Themen</div><div class="rv">${summary.topics.map(esc).join(" · ")}</div></div>\n`
    if (summary.strengths_observed) html += `<div class="ri"><div class="rl">Was KAIA beobachtet hat</div><div class="rv">${esc(summary.strengths_observed)}</div></div>\n`
    if (summary.strongest_quote) html += `<div class="ri"><div class="rl">Dein stärkster Moment</div><div class="rv"><div class="quote">&ldquo;${esc(summary.strongest_quote)}&rdquo;</div></div></div>\n`
    if (summary.first_step) html += `<div class="ri"><div class="rl">Nächster Schritt</div><div class="rv">${esc(summary.first_step)}</div></div>\n`
    if (summary.friction_points) html += `<div class="ri"><div class="rl">Wo es hakte</div><div class="rv">${esc(summary.friction_points)}</div></div>\n`
    if (summary.insight_for_next_session) html += `<div class="ri next"><div class="rl">Für die nächste Session</div><div class="rv"><em>${esc(summary.insight_for_next_session)}</em></div></div>\n`
  }

  html += `<footer>Erstellt mit KAIA · kaia.rostek-dagmar.eu</footer></body></html>`
  return html
}

function openPrintWindow(html: string): void {
  const w = window.open("", "_blank", "width=820,height=1000")
  if (!w) { alert("Bitte erlaube Pop-ups für diese Seite, um das PDF zu öffnen."); return }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 500)
}

// ── Chat page ─────────────────────────────────────────────────────────────────

const CHARACTER_LABELS = {
  warm:        "🌸 Begleitend",
  challenging: "⚡ Konfrontierend",
  wild:        "🎭 Perspektivwechselnd",
} as const

type Character = keyof typeof CHARACTER_LABELS

const SESSION_NAMES: Record<number, string> = {
  1: "Ankern",
  2: "Kartieren",
  3: "Erden",
  4: "Ausprobieren",
  5: "Spiegel",
  6: "Reiben",
  7: "Schärfen",
  8: "Übergeben",
  9: "Konsolidieren",
  10: "Loslassen",
}

// Inactivity timeout after closure bubble appears (10 min)
const CLOSURE_TIMEOUT_MS = 10 * 60 * 1000

const DAILY_LIMIT_MESSAGES = [
  "KAIA macht Pause. Lerntransfer braucht Zeit zum Setzen — das ist keine Entschuldigung, das ist Neurobiologie.",
  "Eine Session pro Tag, das war die Abmachung. Und Abmachungen hält man, auch wenn man selbst sie getroffen hat.",
  "Dein Gehirn verarbeitet das gerade im Hintergrund. Störe es nicht.",
  "Zu viel KAIA auf einmal ist wie zu viel von allem auf einmal. Gut dosiert wirkt es besser.",
  "Das war's für heute. Schlaf drüber — das ist keine Ausrede, das ist Wissenschaft.",
  "KAIA hat heute Feierabend. Du auch. Das ist kein Bug.",
  "Nächste Runde: ab 0:00 Uhr. Bis dahin: echtes Leben machen.",
  "21 Tage, 10 Sessions, unendlich viele Erkenntnisse. Der Plan war nie, alles heute zu klären.",
]

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceNew = searchParams.get("force_new") === "true"

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
  const [sessionSummary,   setSessionSummary]   = useState<SessionSummary | null>(null)
  const [showSummaryCard,  setShowSummaryCard]  = useState(false)

  // Name collection — first-time ask before session 1
  const [preferredName,  setPreferredName]  = useState<string | null>(null)
  const [nameStep,       setNameStep]       = useState(false)
  const [nameInput,      setNameInput]      = useState("")
  const [nameSaving,     setNameSaving]     = useState(false)

  // Topic confirmation — one-time opportunity in session 1 before opening stream
  const [topicStep,      setTopicStep]      = useState(false)
  const [topicInput,     setTopicInput]     = useState("")
  const [topicSaving,    setTopicSaving]    = useState(false)
  const [learningTopic,  setLearningTopic]  = useState("")
  // Fired after topic is confirmed — triggers the opening SSE stream
  const [openStreamTrigger, setOpenStreamTrigger] = useState(0)

  // Daily limit
  const [dailyLimitMsg,  setDailyLimitMsg]  = useState<string | null>(null)
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null)
  const [thinkingElapsed, setThinkingElapsed] = useState(0)
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
      setDailyLimitMsg(null)
      setNextAvailableAt(null)

      try {
        // 0. Fetch user profile to get preferred_name + learning_topic
        let storedLearningTopic = ""
        const meRes = await authFetch(`${API_BASE}/api/v1/users/me`)
        if (meRes.ok) {
          const meData = await meRes.json() as {
            preferred_name?: string | null
            learning_topic?: string | null
          }
          const name = meData.preferred_name ?? null
          storedLearningTopic = meData.learning_topic ?? ""
          setPreferredName(name)
          if (!name) {
            setNameStep(true)
            setLoading(false)
            return
          }
        }

        // 1. Check for an existing open session
        const activeRes = await authFetch(`${API_BASE}/api/v1/chat/sessions/active`)

        if (activeRes.ok && !forceNew) {
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

        if (activeRes.ok && forceNew) {
          // Force new session: end the active one, then fall through to create
          const sessData = await activeRes.json() as SessionData
          await authFetch(`${API_BASE}/api/v1/chat/sessions/${sessData.id}/end`, { method: "POST" })
        }

        if (activeRes.status === 403) {
          const raw = await activeRes.json().catch(() => ({}))
          const body = (raw.detail ?? raw) as { code?: string; redirect?: string }
          if (body.redirect) { router.replace(body.redirect); return }
          if (body.code === "study_completed") {
            router.replace("/abschluss")
            return
          }
        }

        // 1b. Check preferred_name — ask before first session if not set
        if (!preferredName) {
          setNameStep(true)
          setLoading(false)
          return
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
            router.replace("/abschluss")
            return
          }
        }
        if (sessRes.status === 429) {
          const raw = await sessRes.json().catch(() => ({}))
          const body = (raw.detail ?? raw) as { code?: string; next_available_at?: string }
          if (body.code === "daily_limit_reached") {
            const idx = Math.floor(Math.random() * DAILY_LIMIT_MESSAGES.length)
            setDailyLimitMsg(DAILY_LIMIT_MESSAGES[idx])
            setNextAvailableAt(body.next_available_at ?? null)
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

        // Session 1: pause before opening stream — show topic confirmation first
        if (sessData.session_number === 1) {
          setLearningTopic(storedLearningTopic)
          setTopicInput(storedLearningTopic)
          setTopicStep(true)
          setLoading(false)
          return
        }

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
  // character intentionally excluded: changing mode must not trigger a new session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTrigger, forceNew])

  const submitName = useCallback(async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setNameSaving(true)
    try {
      const res = await authFetch(`${API_BASE}/api/v1/users/me/name`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_name: trimmed }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setPreferredName(trimmed)
      setNameStep(false)
      setNameSaving(false)
      setOpenTrigger(t => t + 1)  // re-run mount effect to start session
    } catch {
      setNameSaving(false)
    }
  }, [nameInput])

  const confirmTopic = useCallback(async () => {
    if (!sessionId) return
    setTopicSaving(true)
    try {
      const trimmed = topicInput.trim()
      if (trimmed && trimmed !== learningTopic) {
        const res = await authFetch(`${API_BASE}/api/v1/users/me/topic`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ learning_topic: trimmed }),
        })
        // 409 = already locked (shouldn't happen here, but handle gracefully)
        if (!res.ok && res.status !== 409) throw new Error(String(res.status))
        if (res.ok) setLearningTopic(trimmed)
      }
      setTopicStep(false)
      setOpenStreamTrigger(t => t + 1)
    } catch {
      /* best-effort — proceed to opening stream regardless */
      setTopicStep(false)
      setOpenStreamTrigger(t => t + 1)
    } finally {
      setTopicSaving(false)
    }
  }, [sessionId, topicInput, learningTopic])

  // Stream opening message after topic is confirmed (session 1 only)
  useEffect(() => {
    if (openStreamTrigger === 0 || !sessionId) return
    let cancelled = false
    const streamId = `a-open-s1-${Date.now()}`

    const run = async () => {
      if (cancelled) return
      setLoading(true)
      setMessages([{ id: streamId, role: "assistant", content: "", streaming: true }])
      try {
        const openRes = await authFetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/opening`, {
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
  }, [openStreamTrigger, sessionId])

  const resetSession = useCallback((newChar?: Character) => {
    if (closureTimerRef.current) clearTimeout(closureTimerRef.current)
    // End the current session on the backend before creating a new one.
    // Without this, the old session stays open and get_active_session resumes it
    // instead of the new one — causing the session counter to appear to go backwards.
    if (sessionId) {
      void authFetch(`${API_BASE}/api/v1/chat/sessions/${sessionId}/end`, { method: "POST" })
    }
    if (newChar) setCharacter(newChar)
    setSessionId(null)
    setSessionNumber(null)
    setMessages([])
    setError(null)
    setClosureState("idle")
    setClosureExchanges(0)
    setResumed(false)
    setBannerDismissed(false)
    setSessionSummary(null)
    setShowSummaryCard(false)
    userTurnCountRef.current = 0
    setOpenTrigger(t => t + 1)
  }, [sessionId])

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

  // Poll for session summary after session ends — retry at 5s, 15s, 30s
  // Count seconds while KAIA is thinking (streaming msg with no content yet)
  // Reset happens in cleanup when messages change and isThinking becomes false
  useEffect(() => {
    const isThinking = messages.some(m => m.streaming && !m.content)
    if (!isThinking) return
    const interval = setInterval(() => setThinkingElapsed(s => s + 1), 1000)
    return () => { clearInterval(interval); setThinkingElapsed(0) }
  }, [messages])

  // Haiku extraction runs as background task and may take >5s to complete
  useEffect(() => {
    if (closureState !== "ended" || !sessionId) return
    const sid = sessionId
    const timers = [5000, 15000, 30000].map(delay =>
      setTimeout(async () => {
        try {
          const res = await authFetch(`${API_BASE}/api/v1/chat/sessions/${sid}/summary`)
          if (res.ok) {
            const data = await res.json() as SessionSummary
            if (data.ready) setSessionSummary(data)
          }
        } catch { /* best-effort */ }
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [closureState, sessionId])

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
        setTimeout(() => textareaRef.current?.focus(), 0)
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
        body: JSON.stringify({ content: userContent, is_final_exchange: closureExchanges >= 1 }),
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
      setTimeout(() => textareaRef.current?.focus(), 0)
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
    <div className="flex flex-col h-dvh bg-background">

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Startseite
          </Link>
          <span className="text-border/60 select-none">|</span>
          <span className="font-semibold tracking-tight">KAIA</span>
          {sessionNumber !== null && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">
                Session {sessionNumber}{SESSION_NAMES[sessionNumber] ? ` — ${SESSION_NAMES[sessionNumber]}` : ""}
              </span>
              <span className="text-[10px] text-muted-foreground/50 leading-none">von 10</span>
            </div>
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
          <button
            onClick={() => sessionId && setShowReportModal(true)}
            disabled={!sessionId}
            title={sessionId ? "KAIA melden — wenn sich KAIA seltsam verhält oder etwas Unangemessenes schreibt" : "Melden ist möglich, sobald eine Session aktiv ist"}
            aria-label="KAIA-Verhalten melden"
            className={`p-1.5 rounded-lg transition-colors ${
              sessionId
                ? "text-muted-foreground hover:text-amber-500 hover:bg-muted"
                : "text-muted-foreground/25 cursor-not-allowed"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
          </button>
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

      {/* Name collection screen — shown before first session if preferred_name is null */}
      {nameStep && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-6">
            <div className="rounded-2xl bg-muted px-5 py-4 text-sm leading-relaxed">
              Bevor wir anfangen — wie darf ich dich ansprechen? Wir werden eine Weile miteinander unterwegs sein.
            </div>
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") void submitName() }}
                maxLength={50}
                placeholder="Dein Name oder Spitzname"
                disabled={nameSaving}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
              />
              <button
                onClick={() => void submitName()}
                disabled={nameSaving || !nameInput.trim()}
                className="w-full rounded-xl bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {nameSaving ? "Einen Moment…" : "Los geht's"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic confirmation screen — session 1 only, between name and opening stream */}
      {topicStep && !nameStep && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-6">
            <div className="rounded-2xl bg-muted px-5 py-4 text-sm leading-relaxed space-y-3">
              <p>
                Gleich geht es los — aber kurz noch etwas Wichtiges.
              </p>
              <p>
                Die nächsten <strong>10 Sessions</strong> drehen sich alle um genau ein Thema:
                deinen Lerntransfer rund um das, was du unten siehst. Das Thema bleibt für alle Sessions fest.
              </p>
              <p className="text-muted-foreground">
                Das ist deine <strong>einzige Chance</strong>, es jetzt noch zu ändern — nach dieser ersten Session
                ist es dauerhaft gesperrt.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-muted-foreground uppercase tracking-wider px-1">
                Dein Thema
              </label>
              <textarea
                autoFocus
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                maxLength={500}
                rows={3}
                disabled={topicSaving}
                className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 resize-none"
              />
              <button
                onClick={() => void confirmTopic()}
                disabled={topicSaving || !topicInput.trim()}
                className="w-full rounded-xl bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {topicSaving
                  ? "Einen Moment…"
                  : topicInput.trim() !== learningTopic
                    ? "Thema übernehmen und starten"
                    : "Passt so — los geht's"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily limit screen */}
      {dailyLimitMsg && !nameStep && !topicStep && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-4 text-center">
            <div className="rounded-2xl bg-muted px-5 py-4 text-sm leading-relaxed text-left">
              {dailyLimitMsg}
            </div>
            {nextAvailableAt && (
              <p className="text-xs text-muted-foreground">
                Nächste Session ab{" "}
                <span className="font-medium text-foreground">
                  {new Date(nextAvailableAt).toLocaleString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })} Uhr
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground/50">
              <Link href="/admin/journey-test" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
                → Zur Testübersicht
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Ton-Selector — direkt über dem Chat */}
      {!nameStep && !topicStep && !dailyLimitMsg && sessionId && closureState !== "ended" && (
        <div className="shrink-0 border-b border-border/40 px-4 py-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2.5">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide shrink-0">
              Ton
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(CHARACTER_LABELS) as Character[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCharacter(c)}
                  disabled={closureState !== "idle"}
                  title={`Gesprächston wechseln zu: ${CHARACTER_LABELS[c]}`}
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
      {!nameStep && !topicStep && !dailyLimitMsg && <div
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
                  <div>
                    <span className="inline-flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    {thinkingElapsed >= 5 && (
                      <p className="text-xs text-muted-foreground/70 leading-relaxed mt-1.5">
                        KAIA denkt nach…
                      </p>
                    )}
                    {thinkingElapsed >= 10 && sessionNumber === 7 && (
                      <p className="text-xs text-muted-foreground/60 leading-relaxed mt-0.5">
                        Diese Session braucht mehr Nachdenken als andere — das ist so geplant.
                      </p>
                    )}
                  </div>
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
            <div className="space-y-4 py-4" aria-live="assertive">
              {sessionNumber === 10 ? (
                <div className="rounded-xl border border-border/60 bg-muted/40 p-5 space-y-3 text-center">
                  <p className="font-medium text-sm">10 Gespräche — fertig.</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Das war keine kleine Sache. Jetzt fehlt noch der Abschluss-Fragebogen —
                    5 Minuten, dann ist die Studie komplett.
                  </p>
                  <Link
                    href="/survey/post"
                    className="inline-block mt-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Zum Abschluss-Fragebogen →
                  </Link>
                </div>
              ) : (
                <>
                  {sessionNumber === 3 && (
                    <p className="text-center text-[11px] text-muted-foreground/40 pb-1">
                      — Einstiegsphase abgeschlossen —
                    </p>
                  )}
                  {sessionNumber === 5 && (
                    <p className="text-center text-[11px] text-muted-foreground/40 pb-1">
                      — Halbzeit —
                    </p>
                  )}
                  <p className="text-center text-xs text-muted-foreground/60">
                    Session beendet.{" "}
                    <Link
                      href="/chat?force_new=true"
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Neue Session starten
                    </Link>
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => openPrintWindow(buildTranscriptHTML(
                        messages, sessionNumber,
                        sessionNumber ? SESSION_NAMES[sessionNumber] ?? null : null,
                        sessionSummary, preferredName,
                        learningTopic || sessionSummary?.topics?.[0] || null,
                      ))}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Gespräch als PDF speichern
                    </button>
                  </div>
                </>
              )}

              {/* Loading: KAIA notiert — verschwindet wenn Reflexion bereit */}
              {!sessionSummary && !showSummaryCard && (
                <p className="text-center text-[11px] text-muted-foreground/50 pt-1">
                  Ich notiere kurz, was ich aus diesem Gespräch mitnehme.
                </p>
              )}

              {/* Button erscheint sobald Reflexion bereit */}
              {sessionSummary && !showSummaryCard && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <button
                    onClick={() => setShowSummaryCard(true)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-5 py-4 text-left hover:bg-muted hover:border-foreground/20 transition-all group focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    aria-label="KAIAs Reflexion über diese Session ansehen"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-foreground block">KAIAs Reflexion ansehen</span>
                        <span className="text-xs text-muted-foreground block">Was KAIA aus diesem Gespräch mitnimmt</span>
                      </div>
                      <span className="text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0 text-base leading-none select-none" aria-hidden="true">→</span>
                    </div>
                  </button>
                </div>
              )}

              {showSummaryCard && sessionSummary && (
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      KAIAs Reflexion
                    </p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      Was KAIA aus diesem Gespräch mitnimmt.
                    </p>
                  </div>

                  {sessionSummary.mood && (
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">Stimmung</span>
                      <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
                        sessionSummary.mood === "positiv"    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        sessionSummary.mood === "frustriert" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {sessionSummary.mood}
                      </span>
                    </p>
                  )}

                  {sessionSummary.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sessionSummary.topics.map(t => (
                        <span key={t} className="text-xs rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground border border-border/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {sessionSummary.strongest_quote && (
                    <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground text-xs leading-relaxed">
                      &ldquo;{sessionSummary.strongest_quote}&rdquo;
                    </blockquote>
                  )}

                  {sessionSummary.first_step && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Nächster Schritt</p>
                      <p className="text-xs leading-relaxed">{sessionSummary.first_step}</p>
                    </div>
                  )}

                  {sessionSummary.strengths_observed && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Was KAIA an dir beobachtet hat</p>
                      <p className="text-xs leading-relaxed">{sessionSummary.strengths_observed}</p>
                    </div>
                  )}

                  {sessionSummary.friction_points && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Wo es heute hakte</p>
                      <p className="text-xs leading-relaxed text-muted-foreground/80">{sessionSummary.friction_points}</p>
                    </div>
                  )}

                  {sessionSummary.insight_for_next_session && (
                    <div className="space-y-0.5 border-t border-border/40 pt-3">
                      <p className="text-xs text-muted-foreground">Für die nächste Session</p>
                      <p className="text-xs leading-relaxed italic">{sessionSummary.insight_for_next_session}</p>
                    </div>
                  )}

                  <div className="flex justify-end border-t border-border/40 pt-3">
                    <button
                      onClick={() => openPrintWindow(buildTranscriptHTML(
                        messages, sessionNumber,
                        sessionNumber ? SESSION_NAMES[sessionNumber] ?? null : null,
                        sessionSummary, preferredName,
                        learningTopic || sessionSummary?.topics?.[0] || null,
                      ))}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Gespräch als PDF speichern
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>}

      {/* Feedback buttons — EMA signals, sticky above input */}
      {!nameStep && !topicStep && !dailyLimitMsg && sessionId && closureState !== "ended" && messages.length > 1 && (
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
      {!nameStep && !topicStep && !dailyLimitMsg && <div className="shrink-0 border-t border-border px-4 py-3">

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
      </div>}

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
