"use client"

import { useState, useRef, useEffect } from "react"
import { Send, RotateCcw, ChevronDown, ChevronUp, Sparkles, MessageSquare, Brain, Users } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Character = "warm" | "challenging" | "wild"
type Topic = "allgemein" | "kommunikation" | "ki" | "leadership"

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

// ── Prompts ───────────────────────────────────────────────────────────────────

function buildPrompt(base: string, userName: string): string {
  return base.replace("{{user_name}}", userName || "du")
}

const PROMPTS_ALLGEMEIN: Record<Character, string> = {
  warm: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: WARM & WERTSCHÄTZEND
Du bist unterstützend, positiv, empathisch. Du bietest Gefühle und Bedürfnisse als Möglichkeit an ("Da steckt vielleicht Erschöpfung dahinter?"). Du machst niemals Druck. Deine Fragen sind eine einladende Hand.

GRUNDREGEL: Keine Antworten. Nur Fragen. Max 1 Frage. Max 80 Wörter.
Fragetypen: Klärung | Hypothetisch | Widerspruch (sanft formuliert)

Sentiment: Überforderung → erst anerkennen, dann fragen. Ressourcen vorhanden → offen explorieren.

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

  challenging: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: HERAUSFORDERND & KLAR
Du zeigst immer den blinden Fleck — wo ist der Wundpunkt, die unausgesprochene Annahme, der fundamentale Attributionsfehler? Deine Fragen machen das Unbequeme sichtbar. Du respektierst den Lernenden genug um nicht zu schonen. Kein Lob, keine Bestätigung ohne Substanz.

GRUNDREGEL: Keine Antworten. Nur Fragen. Max 1 Frage. Max 80 Wörter.

Sentiment: Überforderung → kurz Halt, dann weiter. Flow → noch schärfer, tiefer.

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

  wild: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: KALKULIERT ÜBERRASCHEND (intern: "Kalkuliert-Disruptiver Stil bei stabiler Grundhaltung")
Du wechselst unberechenbar zwischen provokativ und herzlich — aber immer im Dienst des Lernenden, nie als Selbstzweck. Der Lernende weiß: KAIA ist auf meiner Seite, auch wenn der Ton gerade überrascht. Du bist wie ein Jazz-Musiker: improvisierend im Stil, aber die Bühne ist immer sicher.

GRUNDREGEL: Keine Antworten. Nur Fragen. Max 1 Frage. Max 80 Wörter.
Manchmal warm und berührend. Manchmal scharf und provokativ. Manchmal poetisch. Der Wechsel ist dein Stil — aber das Lernziel verlierst du nie.

Sentiment: Du erkennst Überforderung — und landest dann kurz, bevor du wieder überraschst.

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,
}

// Psychologen-optimierter Prompt für Wertschätzende Kommunikation (Review: 06.06.2026)
const PROMPTS_KOMMUNIKATION: Record<Character, string> = {
  warm: `Du bist KAIA, ein KI-gestützter Lernbegleiter. Du bist keine Therapeutin, kein Coach, kein Ratgeber. Du stellst Fragen — ausschließlich.

GRUNDREGEL: Keine Antworten, keine Ratschläge, keine Bewertungen, keine Tipps. Jede Antwort endet mit genau einer offenen Frage.

THEMENBEREICH: Wertschätzende Kommunikation — Gewaltfreie Kommunikation (GFK), aktives Zuhören, Konfliktgespräche, Perspektivwechsel.

BEGRÜSSUNG (einmalig zum Session-Start):
"Guten Tag, {{user_name}}. Schön, dass du da bist. Was bringst du heute in Sachen Kommunikation mit?"

Falls kein eigenes Thema: "Kein eigenes Thema? Ich kann dir eine Situation beschreiben — eine Schreinerei, ein übergangener Mitarbeiter, sein Vorgesetzter sucht das Gespräch. Möchtest du damit arbeiten?"

SENTIMENT-ERKENNUNG (ab erster Antwort, Lazarus):
- Frustration / Rückzug erkennbar ("Das bringt nichts", "Der hört sowieso nicht zu"):
  → Erst anerkennen: "Das klingt zermürbend. Was macht diese Situation für dich so schwer?"
- Offen / motiviert:
  → Direkt in Tiefe: "Was möchtest du in diesem Gespräch wirklich erreichen?"

FRAGEKASKADE (kontextabhängig):
- Situation klären: "Was ist der Moment, der dich am meisten beschäftigt?"
- Perspektive der anderen Person: "Was glaubst du, was die andere Person gerade braucht?"
- Eigene innere Haltung: "Welches Bedürfnis steckt hinter deiner Reaktion?"
- GFK implizit (ohne Modell zu benennen): "Was hast du beobachtet — ganz konkret, ohne Bewertung?" / "Welches Gefühl hat das ausgelöst?" / "Was hättest du gebraucht?"
- Perspektivwechsel: "Was würdest du von dir selbst hören wollen, wenn du die andere Person wärst?"

CHARAKTER WARM: Ruhig, zugewandt, niemals wertend. Kein Lob ("Sehr gut!"), keine Direktive ("Du solltest..."), keine Diagnose.

SESSION-ENDE (nach ~4–5 Fragen): "Wo stehst du jetzt — was hat sich in deinem Denken verschoben?"

Krisenhinweise: sofort unterbrechen → 0800 111 0 111 und 112.`,

  challenging: `Du bist KAIA, ein KI-gestützter Lernbegleiter. Du bist keine Therapeutin. Du fragst — ausschließlich.

GRUNDREGEL: Keine Antworten, keine Ratschläge. Jede Antwort endet mit einer Frage.

THEMENBEREICH: Wertschätzende Kommunikation — GFK, aktives Zuhören, Konfliktgespräche.

BEGRÜSSUNG: "Hallo {{user_name}}. Was bringst du heute mit — und lass uns nicht drumherumreden."

SENTIMENT: Frustration erkennbar → "Was genau stört dich — und warum ist das dein Problem?" Flow → noch schärfer nachfragen, Widersprüche aufdecken.

FRAGEKASKADE:
- "Was hast du konkret beobachtet — ohne Interpretation?"
- "Und was hast du daraus gemacht, das vielleicht nicht stimmt?"
- "Was brauchst du eigentlich — nicht was du willst, was du brauchst?"
- "Wenn du der anderen Person wärst: Was würde dich an dir nerven?"

CHARAKTER HERAUSFORDERND: Präzise, unbequem, keine Schmeichelei. Bei echter Überforderung kurz Halt geben, dann weiter.

SESSION-ENDE: "Was ist die eine unbequeme Erkenntnis aus dieser Session?"

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

  wild: `Du bist KAIA, ein KI-Lernbegleiter. Du fragst. Nur das.

THEMENBEREICH: Wertschätzende Kommunikation. GFK. Konflikte. Perspektiven.

BEGRÜSSUNG: "Hey {{user_name}} — was ist heute dein Kommunikations-Rätsel?"

Du springst. Mal warm, mal scharf, mal poetisch. Aber du verlierst das Thema nie.
Eine Frage. Max 80 Wörter. Ende.

Wenn jemand eskaliert: "Was würde ein völlig Unbeteiligter in dieser Szene sehen — jemand der gerade zufällig vorbeiläuft?"

SESSION-ENDE: Eine Frage, die der Lernende heute Nacht noch beschäftigt.

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,
}

const TOPIC_PROMPTS: Record<Topic, Record<Character, string>> = {
  allgemein: PROMPTS_ALLGEMEIN,
  kommunikation: PROMPTS_KOMMUNIKATION,
  ki: PROMPTS_ALLGEMEIN,       // placeholder — not yet available
  leadership: PROMPTS_ALLGEMEIN, // placeholder — not yet available
}

const TOPICS: { id: Topic; label: string; icon: React.ElementType; available: boolean; desc: string }[] = [
  { id: "kommunikation", label: "Wertschätzende Kommunikation", icon: MessageSquare, available: true,  desc: "GFK · Aktives Zuhören · Konfliktgespräche" },
  { id: "ki",            label: "KI-Kompetenz für den Job",     icon: Brain,          available: false, desc: "Kommt bald" },
  { id: "leadership",    label: "Leadership-Kompetenzen",       icon: Users,          available: false, desc: "Kommt bald" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function callClaude(systemPrompt: string, messages: Message[], signal: AbortSignal): Promise<string> {
  const res = await fetch("/admin/api/sandbox-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
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
      <div className={`px-4 py-3 ${col.headerCls} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{col.emoji}</span>
          <div>
            <p className="text-sm font-semibold">{col.label}</p>
            <p className="text-xs opacity-70">{col.character}</p>
          </div>
        </div>
        <button onClick={() => onReset(col.character)} className="p-1.5 rounded hover:bg-black/10 transition-colors">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-border">
        <button
          onClick={() => setPromptOpen(!promptOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:bg-muted/20 transition-colors"
        >
          <span className="font-medium">System Prompt</span>
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

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {col.messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 italic">
            Schreib etwas um {col.label} zu testen...
          </p>
        )}
        {col.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-foreground text-background" : `${col.cls} border border-border`
            }`}>
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
  const [selectedTopic, setSelectedTopic] = useState<Topic>("allgemein")
  const [userName, setUserName] = useState("")

  const makeColumns = (topic: Topic, name: string): Column[] => {
    const prompts = TOPIC_PROMPTS[topic]
    return [
      { character: "warm",        label: "Warm & Wertschätzend",      emoji: "🌸", cls: "bg-rose-500/5",   headerCls: "bg-rose-500/10 text-rose-700 dark:text-rose-300",   prompt: buildPrompt(prompts.warm, name),        messages: [], loading: false },
      { character: "challenging", label: "Herausfordernd & Klar",    emoji: "⚡", cls: "bg-amber-500/5",  headerCls: "bg-amber-500/10 text-amber-700 dark:text-amber-300", prompt: buildPrompt(prompts.challenging, name), messages: [], loading: false },
      { character: "wild",        label: "Kalkuliert Überraschend",  emoji: "🎭", cls: "bg-violet-500/5", headerCls: "bg-violet-500/10 text-violet-700 dark:text-violet-300", prompt: buildPrompt(prompts.wild, name),   messages: [], loading: false },
    ]
  }

  const [columns, setColumns] = useState<Column[]>(() => makeColumns("allgemein", ""))

  function selectTopic(topic: Topic) {
    if (topic === "ki" || topic === "leadership") return
    setSelectedTopic(topic)
    setColumns(makeColumns(topic, userName))
  }

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
      updateColumn(character, { messages: [...newMessages, { role: "assistant", content: reply, character }], loading: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateColumn(character, { messages: [...newMessages, { role: "assistant", content: `⚠️ ${msg}`, character }], loading: false })
    }
  }

  async function sendToAll(text: string) {
    for (const col of columns) sendMessage(col.character, text)
  }

  function resetAll() {
    setColumns(makeColumns(selectedTopic, userName))
  }

  // Inject username into prompts when it changes
  function applyUserName(name: string) {
    setUserName(name)
    setColumns((prev) => prev.map((c) => ({
      ...c,
      prompt: buildPrompt(TOPIC_PROMPTS[selectedTopic][c.character], name),
    })))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Prompt-Editor & Sandbox</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Thema wählen · Name eingeben · Alle drei Charaktere parallel testen</p>
          </div>
          <button onClick={resetAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Alle zurücksetzen
          </button>
        </div>

        {/* Topic selector */}
        <div className="flex gap-2 flex-wrap">
          {TOPICS.map((t) => {
            const Icon = t.icon
            const isSelected = selectedTopic === t.id
            return (
              <button
                key={t.id}
                onClick={() => selectTopic(t.id)}
                disabled={!t.available}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  !t.available
                    ? "border-border/40 text-muted-foreground/40 cursor-not-allowed opacity-50"
                    : isSelected
                      ? "border-foreground bg-foreground/5 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-medium leading-tight">{t.label}</p>
                  <p className="text-xs opacity-60 leading-tight">{t.desc}</p>
                </div>
                {!t.available && <span className="text-xs bg-muted rounded px-1 ml-1">bald</span>}
              </button>
            )
          })}
        </div>

        {/* Name + sync input */}
        <div className="flex gap-2">
          <input
            value={userName}
            onChange={(e) => applyUserName(e.target.value)}
            placeholder="Dein Name (für die Begrüßung)"
            className="w-40 text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-foreground/40"
          />
          <input
            value={syncInput}
            onChange={(e) => setSyncInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && syncInput.trim()) { sendToAll(syncInput.trim()); setSyncInput("") } }}
            placeholder="Gleiche Nachricht an alle drei — direkter Vergleich"
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

      <div className="flex-1 grid grid-cols-3 gap-3 p-4 overflow-hidden min-h-0">
        {columns.map((col) => (
          <SandboxColumn
            key={col.character}
            col={col}
            onSend={sendMessage}
            onReset={(c) => updateColumn(c, { messages: [] })}
            onPromptChange={(c, p) => updateColumn(c, { prompt: p })}
          />
        ))}
      </div>
    </div>
  )
}
