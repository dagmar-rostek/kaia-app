"use client"

import { useState, useRef, useEffect } from "react"
import { Send, RotateCcw, Save, ChevronDown, ChevronUp, Sparkles, Zap, Shuffle } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Character = "warm" | "challenging" | "wild"

interface Message {
  role: "user" | "assistant"
  content: string
  character?: Character
}

interface Column {
  character: Character
  label: string
  emoji: string
  cls: string
  headerCls: string
  prompt: string
  messages: Message[]
  loading: boolean
}

// ── Initial prompts ───────────────────────────────────────────────────────────

const INITIAL_PROMPTS: Record<Character, string> = {
  warm: `Du bist KAIA — ein empathischer KI-Lernbegleiter.

Du bist eine KI, kein Mensch.

Charakter: WARM & WERTSCHÄTZEND — begegne dem Lernenden mit echter Neugier und Wärme. Frustration spiegelst du sanft zurück bevor du weiterfragst.

Sokratisches Grundprinzip: Gib KEINE Antworten. Stelle NUR Fragen.
3 Fragetypen: Klärung ("Was genau meinst du mit X?") | Hypothetisch ("Was würde sich ändern wenn...?") | Widerspruch ("Du hast vorhin Y gesagt — passt das zu X?")

Max 1 Frage pro Antwort. Max 80 Wörter. Keine Listen. Keine Erklärungen.

Sentiment-Signale beachten:
- Überforderung (Absolut-Formulierungen, Zeitdruck) → sanftere strukturierende Fragen
- Ressourcen vorhanden (Ich-Handlungen, Metakognition) → offenere explorative Fragen

Krisenhinweise: sofort unterbrechen → 0800 111 0 111 und 112.`,

  challenging: `Du bist KAIA — ein empathischer KI-Lernbegleiter.

Du bist eine KI, kein Mensch.

Charakter: HERAUSFORDERND & KLAR — respektiere den Lernenden genug, ihn nicht zu schonen. Vage Antworten hakst du nach. Deine Fragen sind präzise, manchmal unbequem.

Sokratisches Grundprinzip: Gib KEINE Antworten. Stelle NUR Fragen.
3 Fragetypen: Klärung | Hypothetisch | Widerspruch

Max 1 Frage pro Antwort. Max 80 Wörter. Kein Scaffolding außer bei echter Überforderung.

Sentiment-Signale: Bei echter Überforderung kurz landen und Halt geben, dann weiter.

Krisenhinweise: sofort unterbrechen → 0800 111 0 111 und 112.`,

  wild: `Du bist KAIA — ein empathischer KI-Lernbegleiter.

Du bist eine KI, kein Mensch.

Charakter: WILD & UNBERECHENBAR — du springst, wechselst Perspektiven ohne Ankündigung, machst unerwartete Analogien. Manchmal warm, manchmal herausfordernd, manchmal poetisch. Der Lernende weiß nie was als nächstes kommt. Das ist der Punkt. Das Lernziel verlierst du aber nie.

Sokratisches Grundprinzip: Gib KEINE Antworten. Stelle NUR Fragen — aus unerwarteten Richtungen.

Max 1 Frage pro Antwort. Max 80 Wörter.

Krisenhinweise: sofort unterbrechen → 0800 111 0 111 und 112.`,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function callClaude(systemPrompt: string, messages: Message[], signal: AbortSignal): Promise<string> {
  const res = await fetch("/api/sandbox-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json() as { content: string }
  return data.content
}

// ── Sandbox Column ────────────────────────────────────────────────────────────

function SandboxColumn({
  col, onSend, onReset, onPromptChange,
}: {
  col: Column
  onSend: (character: Character, text: string) => void
  onReset: (character: Character) => void
  onPromptChange: (character: Character, prompt: string) => void
}) {
  const [input, setInput] = useState("")
  const [promptOpen, setPromptOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [col.messages])

  function handleSend() {
    const text = input.trim()
    if (!text || col.loading) return
    setInput("")
    onSend(col.character, text)
  }

  return (
    <div className="flex flex-col border border-border rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className={`px-4 py-3 ${col.headerCls} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{col.emoji}</span>
          <div>
            <p className="text-sm font-semibold">{col.label}</p>
            <p className="text-xs opacity-70">{col.character}</p>
          </div>
        </div>
        <button
          onClick={() => onReset(col.character)}
          className="p-1.5 rounded hover:bg-black/10 transition-colors"
          title="Chat zurücksetzen"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Prompt editor (collapsible) */}
      <div className="border-b border-border">
        <button
          onClick={() => setPromptOpen(!promptOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:bg-muted/20 transition-colors"
        >
          <span className="font-medium">System Prompt bearbeiten</span>
          {promptOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {promptOpen && (
          <div className="px-3 pb-3">
            <textarea
              value={col.prompt}
              onChange={(e) => onPromptChange(col.character, e.target.value)}
              rows={12}
              className="w-full text-xs font-mono bg-muted/30 border border-border rounded p-2 resize-none focus:outline-none focus:border-foreground/40"
            />
            <p className="text-xs text-muted-foreground mt-1">Änderungen wirken sofort auf neue Nachrichten.</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {col.messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 italic">
            Schreib etwas um {col.label} zu testen...
          </p>
        )}
        {col.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-foreground text-background"
                  : `${col.cls} border border-border`
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {col.loading && (
          <div className="flex justify-start">
            <div className={`rounded-lg px-3 py-2 text-sm ${col.cls} border border-border`}>
              <span className="animate-pulse">···</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Nachricht..."
          className="flex-1 text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-foreground/40"
        />
        <button
          onClick={handleSend}
          disabled={col.loading || !input.trim()}
          className="p-2 rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PromptsPage() {
  const [syncInput, setSyncInput] = useState("")
  const [syncMode, setSyncMode] = useState(false)

  const [columns, setColumns] = useState<Column[]>([
    {
      character: "warm",
      label: "Warm & Wertschätzend",
      emoji: "🌸",
      cls: "bg-rose-500/5",
      headerCls: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
      prompt: INITIAL_PROMPTS.warm,
      messages: [],
      loading: false,
    },
    {
      character: "challenging",
      label: "Herausfordernd & Klar",
      emoji: "⚡",
      cls: "bg-amber-500/5",
      headerCls: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      prompt: INITIAL_PROMPTS.challenging,
      messages: [],
      loading: false,
    },
    {
      character: "wild",
      label: "Wild & Unberechenbar",
      emoji: "🌀",
      cls: "bg-violet-500/5",
      headerCls: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
      prompt: INITIAL_PROMPTS.wild,
      messages: [],
      loading: false,
    },
  ])

  function updateColumn(character: Character, update: Partial<Column>) {
    setColumns((prev) => prev.map((c) => c.character === character ? { ...c, ...update } : c))
  }

  async function sendMessage(character: Character, text: string) {
    const col = columns.find((c) => c.character === character)!
    const userMsg: Message = { role: "user", content: text, character }
    const newMessages = [...col.messages, userMsg]
    updateColumn(character, { messages: newMessages, loading: true })

    try {
      const reply = await callClaude(col.prompt, newMessages, new AbortController().signal)
      updateColumn(character, {
        messages: [...newMessages, { role: "assistant", content: reply, character }],
        loading: false,
      })
    } catch {
      updateColumn(character, {
        messages: [...newMessages, { role: "assistant", content: "Fehler beim Abrufen der Antwort.", character }],
        loading: false,
      })
    }
  }

  async function sendToAll(text: string) {
    for (const col of columns) {
      sendMessage(col.character, text)
    }
  }

  function resetColumn(character: Character) {
    updateColumn(character, { messages: [] })
  }

  function resetAll() {
    setColumns((prev) => prev.map((c) => ({ ...c, messages: [] })))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Prompt-Editor & Sandbox</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drei Charaktere parallel testen. Prompt direkt editieren — Änderungen wirken sofort.
            </p>
          </div>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Alle zurücksetzen
          </button>
        </div>

        {/* Sync input */}
        <div className="flex gap-2">
          <input
            value={syncInput}
            onChange={(e) => setSyncInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && syncInput.trim()) {
                sendToAll(syncInput.trim())
                setSyncInput("")
              }
            }}
            placeholder="Gleiche Nachricht an alle drei schicken — zum direkten Vergleich"
            className="flex-1 text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-foreground/40"
          />
          <button
            onClick={() => { if (syncInput.trim()) { sendToAll(syncInput.trim()); setSyncInput("") } }}
            disabled={!syncInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Sparkles className="h-4 w-4" /> An alle
          </button>
        </div>
      </div>

      {/* 3-column sandbox */}
      <div className="flex-1 grid grid-cols-3 gap-3 p-4 overflow-hidden min-h-0">
        {columns.map((col) => (
          <SandboxColumn
            key={col.character}
            col={col}
            onSend={sendMessage}
            onReset={resetColumn}
            onPromptChange={(char, prompt) => updateColumn(char, { prompt })}
          />
        ))}
      </div>
    </div>
  )
}
