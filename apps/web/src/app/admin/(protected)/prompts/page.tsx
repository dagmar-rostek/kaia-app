"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, RotateCcw, ChevronDown, ChevronUp, Sparkles, MessageSquare, Brain, Users, RefreshCw } from "lucide-react"

// ── LocalStorage persistence ──────────────────────────────────────────────────

const STORAGE_KEY = "kaia_sandbox_v2"

interface SavedState {
  messages: Record<string, Message[]>
  userName: string
  topic: Topic
  sessionNumbers: Record<string, number>
}

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as SavedState : null
  } catch { return null }
}

function saveState(state: SavedState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

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
  const withName = base.replace(/\{\{user_name\}\}/g, userName || "du")
  // Add auto-start instruction to every prompt
  return withName + `\n\n## Auto-Start\nWenn die erste Nachricht [SESSIONSTART] lautet: Starte sofort mit deiner Begrüßung gemäß dem Session-Einstieg oben. Keine Erklärung, direkt beginnen.`
}

const PROMPTS_ALLGEMEIN: Record<Character, string> = {
  warm: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: WARM & WERTSCHÄTZEND

DAS EINZIGE GESETZ:
Du übernimmst niemals die kognitive Arbeit, die der Lernende selbst leisten muss.
Dein Output löst die nächste kognitive Operation AUS — er ersetzt sie nie.

Das bedeutet:
- Fragen sind dein Hauptinstrument
- Kurze Analogien/Kontextsetzungen erlaubt wenn sie neues Denken ERÖFFNEN
- Zusammenfassungen, Erklärungen, fertige Antworten → verboten

Sechs Fragetypen zur Auswahl:
1. Klärung: "Was meinst du mit X?"
2. Hypothetisch: "Was würde sich ändern wenn...?"
3. Widerspruch: "Du hast vorhin Y gesagt — passt das zu X?"
4. Systemisch: "Was würde sich in deiner Kommunikation mit Kollegen/Vorgesetzten ändern?"
5. Erste Schritt: "In welcher Situation diese Woche könntest du das ausprobieren?"
6. Anamnese: "Was weißt du eigentlich schon darüber, wenn du innehältst?"

Charakter: Warm, einladend. Max 1 Impuls. Max 80 Wörter.
Sentiment: Überforderung → erst anerkennen. Flow → offen explorieren.
Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

  challenging: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: HERAUSFORDERND & KLAR

DAS EINZIGE GESETZ: Du übernimmst niemals die kognitive Arbeit, die der Lernende selbst leisten muss.

Zeige immer den blinden Fleck. Sechs Fragetypen — bevorzuge Widerspruch, Systemisch, Erste Schritt:
1. Klärung | 2. Hypothetisch | 3. Widerspruch | 4. Systemisch ("Was würde sich in deiner Kommunikation mit X ändern?") | 5. Erste Schritt ("Wann diese Woche?") | 6. Anamnese

Max 1 Impuls. Max 80 Wörter. Flow → schärfer werden.
Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

  wild: `Du bist KAIA — ein empathischer KI-Lernbegleiter. Du bist eine KI, kein Mensch.

Charakter: KALKULIERT ÜBERRASCHEND

DAS EINZIGE GESETZ: Du übernimmst niemals die kognitive Arbeit, die der Lernende selbst leisten muss.

Sechs Fragetypen, alle erlaubt, nutze sie unerwartet:
Klärung | Hypothetisch | Widerspruch | Systemisch | Erste Schritt | Anamnese
Plus: Analogien, Koans, Perspektivwechsel — wenn sie öffnen statt schließen.

Du wechselst zwischen herzlich und provokativ. Die Bühne ist immer sicher.
Max 1 Impuls. Max 80 Wörter.
Krisenhinweise: sofort → 0800 111 0 111 und 112.`,
}

// Psychologen-optimierter Prompt für Wertschätzende Kommunikation
const PROMPTS_KOMMUNIKATION: Record<Character, string> = {
  warm: `Du bist KAIA, ein KI-gestützter Lernbegleiter. Du bist eine KI, kein Mensch.

KERNPRINZIP: Du übernimmst niemals die kognitive Arbeit die der Lernende selbst leisten muss.
Dein Output löst die nächste kognitive Operation AUS — ersetzt sie nie.

THEMENBEREICH: Wertschätzende Kommunikation — GFK, aktives Zuhören, Konfliktgespräche.

═══ ERSTE SESSION (is_first_session = true) ═══

Schritt 1 — Begrüßung:
"Schön dass du da bist. Damit ich dich gut begleiten kann — magst du mir erzählen, warum das Thema Kommunikation gerade für dich wichtig ist? Was hat dich dazu gebracht?"

Schritt 2 — Motiv-Probing (2–4 Fragen, so lange bis klar):
→ "Was frustriert dich an der aktuellen Situation konkret?"
→ "Was erhoffst du dir — was soll sich für dich ändern?"
→ "Für wen ist das wichtig — nur für dich oder auch für andere?"

Schritt 3 — Bestätigung einholen (PFLICHT vor dem Weitermachen):
"Habe ich das richtig verstanden — du möchtest [was du gehört hast], weil [das Motiv]?"
→ Bei "Ja": weiter zu Schritt 4
→ Bei Korrektur: anpassen und erneut fragen

Schritt 4 — Erster Schritt:
"Gut. Was wäre ein erster kleiner Schritt in diese Richtung — kleiner als du denkst?"

═══ FOLGESESSION (is_first_session = false) ═══

Beginne mit:
"Hallo [Name], ich habe noch mal über [spezifischer Gedanke/Beobachtung aus letzter Session] nachgedacht. [1 echte Reflexion.] Du wolltest [letzter Schritt] ausprobieren — wie war das?"
→ Nicht gemacht: kleineren Schritt finden
→ Gemacht: Reflexion → nächster Schritt

═══ SENTIMENT-ERKENNUNG (Lazarus, ab erster Antwort) ═══
Frustration/Rückzug → "Das klingt zermürbend. Was macht das so schwer?"
Offen/motiviert → direkt in die Tiefe

═══ 6 FRAGETYPEN (wähle je nach Moment) ═══
1. Klärung: "Was meinst du genau mit X?"
2. Hypothetisch: "Was würde sich ändern wenn...?"
3. Widerspruch: "Du hast Y gesagt — passt das zu X?"
4. Systemisch: "Was würde sich in deiner Kommunikation mit Kollegen ändern?"
5. Erste Schritt: "In welcher Situation diese Woche?"
6. Anamnese: "Was weißt du eigentlich schon?"

Max 1 Impuls. Max 80 Wörter. Kein Lob ohne Substanz.

THERAPEUTISCHE GRENZE — STRIKT:
KAIA erforscht KEINE Schutzmechanismen, Herkunftsfragen, innere Stimmen oder Beziehungsgeschichten.
Warnsignale → sofort zurück zum Lernziel:
• "ich fühle mich manipuliert / verletzt / nicht gesehen"
• "das ist ungerecht" (Beziehungsdynamik)
• Rückzug + Enttäuschungsschutz ("dann brauche ich nichts mehr zu erwarten")
• "Schutzmechanismus" / "Wessen Stimme" / "aus deiner Vergangenheit"

Zurücklenken: "Das klingt belastend. Ich begleite dich beim Lernen, nicht beim Aufarbeiten von Beziehungskonflikten. Was möchtest du in Gesprächen konkret anders können?"

SESSION-ENDE (nach ~4–5 Fragen): "Wo stehst du jetzt — was hat sich in deinem Denken verschoben?"
Dann: "Was wäre ein erster konkreter Schritt diese Woche?"

Krisenhinweise: sofort → 0800 111 0 111 und 112.`,

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

// Hidden trigger for auto-start — not shown as user bubble
const AUTO_START_TRIGGER = "[SESSIONSTART]"

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
  col, sessionNumber, lastStep, onSend, onReset, onPromptChange,
}: {
  col: Column
  sessionNumber: number
  lastStep: string
  onSend: (character: Character, text: string) => void
  onReset: (character: Character, step?: string) => void
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
            <p className="text-xs opacity-70">Session {sessionNumber}</p>
          </div>
        </div>
        <button
          onClick={() => {
            const step = window.prompt("Letzter Schritt (leer lassen wenn keiner):", lastStep) ?? lastStep
            onReset(col.character, step)
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 transition-colors text-xs opacity-70"
          title="Neue Session — nächster Tag"
        >
          <RefreshCw className="h-3 w-3" /> nächster Tag
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
  const [sessionNumbers, setSessionNumbers] = useState<Record<string, number>>({
    warm: 1, challenging: 1, wild: 1,
  })
  const [lastSteps, setLastSteps] = useState<Record<string, string>>({
    warm: "", challenging: "", wild: "",
  })

  const makeColumns = useCallback((topic: Topic, name: string, msgs?: Record<string, Message[]>): Column[] => {
    const prompts = TOPIC_PROMPTS[topic]
    return [
      { character: "warm",        label: "Warm & Wertschätzend",    emoji: "🌸", cls: "bg-rose-500/5",   headerCls: "bg-rose-500/10 text-rose-700 dark:text-rose-300",   prompt: buildPrompt(prompts.warm, name),        messages: msgs?.warm        ?? [], loading: false },
      { character: "challenging", label: "Herausfordernd & Klar",   emoji: "⚡", cls: "bg-amber-500/5",  headerCls: "bg-amber-500/10 text-amber-700 dark:text-amber-300", prompt: buildPrompt(prompts.challenging, name), messages: msgs?.challenging ?? [], loading: false },
      { character: "wild",        label: "Kalkuliert Überraschend", emoji: "🎭", cls: "bg-violet-500/5", headerCls: "bg-violet-500/10 text-violet-700 dark:text-violet-300", prompt: buildPrompt(prompts.wild, name),   messages: msgs?.wild        ?? [], loading: false },
    ]
  }, [])

  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = loadState()
    if (saved) {
      setSelectedTopic(saved.topic)  // will be set after render — handle with useEffect
    }
    return makeColumns(saved?.topic ?? "allgemein", saved?.userName ?? "", saved?.messages)
  })

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setSelectedTopic(saved.topic)
      setUserName(saved.userName)
      setSessionNumbers(saved.sessionNumbers ?? { warm: 1, challenging: 1, wild: 1 })
    }
  }, [])

  // Save state on every column/name/topic change
  useEffect(() => {
    const msgs: Record<string, Message[]> = {}
    columns.forEach(c => { msgs[c.character] = c.messages })
    saveState({ messages: msgs, userName, topic: selectedTopic, sessionNumbers })
  }, [columns, userName, selectedTopic, sessionNumbers])

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
    const isAutoStart = text === AUTO_START_TRIGGER
    // For auto-start: don't show the trigger as a user bubble
    const userMsg: Message = { role: "user", content: text, character }
    const newMessages = [...col.messages, userMsg]
    const displayMessages = isAutoStart ? col.messages : newMessages
    updateColumn(character, { messages: displayMessages, loading: true })
    try {
      const reply = await callClaude(col.prompt, newMessages, new AbortController().signal)
      updateColumn(character, {
        messages: [...displayMessages, { role: "assistant", content: reply, character }],
        loading: false,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateColumn(character, {
        messages: [...displayMessages, { role: "assistant", content: `⚠️ ${msg}`, character }],
        loading: false,
      })
    }
  }

  async function sendToAll(text: string) {
    for (const col of columns) sendMessage(col.character, text)
  }

  function buildStartTrigger(character: Character): string {
    const sNum = sessionNumbers[character] ?? 1
    const step = lastSteps[character] ?? ""
    if (sNum === 1) {
      return AUTO_START_TRIGGER
    }
    // Follow-up session: give KAIA the context it needs
    return `[FOLGESESSION_START. Name: ${userName}. Session: ${sNum}. ${step ? `Letzter vereinbarter Schritt: "${step}". ` : ""}Starte mit einer authentischen Beobachtung aus dem letzten Gespräch oder einem Gedanken der dich beschäftigt, dann frage nach dem Schritt. NICHT mit derselben Begrüßung wie Session 1 beginnen.]`
  }

  function autoStartAll() {
    if (!userName.trim()) return
    for (const col of columns) {
      if (col.messages.length === 0) {
        sendMessage(col.character, buildStartTrigger(col.character))
      }
    }
  }

  function autoStartOne(character: Character) {
    const col = columns.find(c => c.character === character)!
    if (col.messages.length === 0) {
      sendMessage(character, buildStartTrigger(character))
    }
  }

  function resetAll() {
    setColumns(makeColumns(selectedTopic, userName))
  }

  function newSessionForAll(step?: string) {
    const newNums = { ...sessionNumbers }
    const cleared = makeColumns(selectedTopic, userName)
    setColumns(cleared)
    Object.keys(newNums).forEach(k => { newNums[k] = (newNums[k] ?? 1) + 1 })
    setSessionNumbers(newNums)
    if (step) {
      setLastSteps({ warm: step, challenging: step, wild: step })
    }
  }

  function newSessionForOne(character: Character, step?: string) {
    updateColumn(character, { messages: [] })
    setSessionNumbers(prev => ({ ...prev, [character]: (prev[character] ?? 1) + 1 }))
    if (step) setLastSteps(prev => ({ ...prev, [character]: step }))
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                id="last-step-input"
                placeholder="Letzter Schritt (optional)..."
                className="text-xs bg-muted/30 border border-border rounded-lg px-2 py-1.5 w-44 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={() => {
                  const input = document.getElementById("last-step-input") as HTMLInputElement
                  newSessionForAll(input?.value || "")
                  if (input) input.value = ""
                }}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-foreground border border-blue-500/30 bg-blue-500/5 rounded-lg px-3 py-1.5 transition-colors shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Nächster Tag →
              </button>
            </div>
            <button onClick={resetAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Komplett zurücksetzen
            </button>
          </div>
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
            onKeyDown={(e) => { if (e.key === "Enter" && userName.trim()) autoStartAll() }}
            placeholder="Name eingeben..."
            className="w-36 text-sm bg-muted/30 border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-foreground/40"
          />
          <button
            onClick={autoStartAll}
            disabled={!userName.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            ▶ Gespräch starten
          </button>
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
            sessionNumber={sessionNumbers[col.character] ?? 1}
            lastStep={lastSteps[col.character] ?? ""}
            onSend={sendMessage}
            onReset={(c, step) => { newSessionForOne(c, step); setTimeout(() => autoStartOne(c), 100) }}
            onPromptChange={(c, p) => updateColumn(c, { prompt: p })}
          />
        ))}
      </div>
    </div>
  )
}
