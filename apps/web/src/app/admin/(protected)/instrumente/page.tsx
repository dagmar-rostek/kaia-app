"use client"

import { useState } from "react"
import {
  Scale, BarChart2, CheckCircle2, AlertTriangle,
  FileText, ChevronRight, Info, Lightbulb, RotateCcw, Printer
} from "lucide-react"

// ── MSLQ Item data ────────────────────────────────────────────────────────────

type Subscale = {
  key: string
  name: string
  nameDe: string
  items: number
  alpha: number
  construct: string
  relevance: string
  color: string
}

const SUBSCALES: Subscale[] = [
  {
    key: "self_efficacy",
    name: "Self-Efficacy for Learning and Performance",
    nameDe: "Lernbezogene Selbstwirksamkeitserwartung",
    items: 8,
    alpha: 0.93,
    construct: "Überzeugung, das eigene Lernziel durch eigene Kompetenz erreichen zu können — auch bei schwierigen Inhalten.",
    relevance: "Kernkonstrukt der KAIA-Hypothese: Sokratische Begleitung stärkt das Vertrauen in die eigene Lernfähigkeit.",
    color: "blue",
  },
  {
    key: "intrinsic_goal",
    name: "Intrinsic Goal Orientation",
    nameDe: "Intrinsische Zielorientierung",
    items: 4,
    alpha: 0.74,
    construct: "Lernmotivation aus eigenem Interesse, Neugier und Mastery-Orientierung — nicht um externe Belohnungen.",
    relevance: "KAIA-Interaktion ist vollständig intrinsisch ausgerichtet: keine Bewertungen, keine Noten, keine extrinsischen Anreize.",
    color: "green",
  },
  {
    key: "elaboration",
    name: "Elaboration",
    nameDe: "Elaboration (kognitive Tiefenverarbeitung)",
    items: 6,
    alpha: 0.76,
    construct: "Strategie, Neues mit Vorwissen zu verbinden, Inhalte aus verschiedenen Quellen zusammenzuführen und zu transferieren.",
    relevance: "Sokratische Fragen fördern aktive Verknüpfung: KAIA fordert explizit zu Übertragung und Kontextualisierung auf.",
    color: "purple",
  },
  {
    key: "metacognitive_sr",
    name: "Metacognitive Self-Regulation",
    nameDe: "Metakognitive Selbstregulation",
    items: 12,
    alpha: 0.79,
    construct: "Planung, Monitoring und Steuerung der eigenen Lernprozesse — Kernkompetenz selbstregulierten Lernens.",
    relevance: "Übergeordnetes Lernziel von KAIA: Lernende sollen nicht Inhalte, sondern Lernkompetenz aufbauen.",
    color: "orange",
  },
]

type MslqItem = {
  num: number
  subscale: string
  de: string
  en: string
  reverse?: boolean
}

const MSLQ_ITEMS: MslqItem[] = [
  // Intrinsic Goal Orientation
  { num: 1, subscale: "intrinsic_goal", de: "Ich bevorzuge Lerninhalte, die mich wirklich herausfordern, weil ich dabei Neues lerne.", en: "In a class like this, I prefer course material that really challenges me so I can learn new things." },
  { num: 16, subscale: "intrinsic_goal", de: "Ich beschäftige mich lieber mit Inhalten, die meine Neugier wecken — auch wenn sie schwieriger sind.", en: "In a class like this, I prefer course material that arouses my curiosity, even if it is difficult to learn." },
  { num: 22, subscale: "intrinsic_goal", de: "Das Befriedigendste beim Lernen ist für mich, etwas wirklich in der Tiefe zu verstehen.", en: "The most satisfying thing for me in this course is trying to understand the content as thoroughly as possible." },
  { num: 24, subscale: "intrinsic_goal", de: "Ich wähle Lernwege, bei denen ich am meisten lerne — auch wenn sie aufwändiger sind.", en: "When I have the opportunity in this class, I choose course assignments that I can learn from even if they don't guarantee a good grade." },

  // Self-Efficacy
  { num: 5, subscale: "self_efficacy", de: "Ich bin überzeugt, dass ich mein Lernthema wirklich durchdringen kann.", en: "I believe I will receive an excellent grade in this class." },
  { num: 6, subscale: "self_efficacy", de: "Ich bin sicher, dass ich auch schwierige Inhalte meines Lernthemas verstehen kann.", en: "I'm certain I can understand the most difficult material presented in the readings for this course." },
  { num: 12, subscale: "self_efficacy", de: "Ich bin zuversichtlich, die grundlegenden Konzepte meines Lernthemas zu verstehen.", en: "I'm confident I can understand the basic concepts taught in this course." },
  { num: 15, subscale: "self_efficacy", de: "Ich traue mir zu, auch komplexe Zusammenhänge in meinem Lernthema zu durchdringen.", en: "I'm confident I can understand the most complex material presented by the instructor in this course." },
  { num: 20, subscale: "self_efficacy", de: "Ich bin sicher, dass ich beim Lernen gute Ergebnisse erzielen kann, wenn ich mich anstrenge.", en: "I'm confident I can do an excellent job on the assignments and tests in this course." },
  { num: 21, subscale: "self_efficacy", de: "Ich erwarte, dass ich mit meinem Lernthema gut vorankomme.", en: "I expect to do well in this class." },
  { num: 29, subscale: "self_efficacy", de: "Ich bin überzeugt, dass ich die Fähigkeiten, die ich mir vornehme, wirklich erwerben kann.", en: "I'm certain I can master the skills being taught in this class." },
  { num: 31, subscale: "self_efficacy", de: "Angesichts der Anforderungen meines Lernthemas und meiner bisherigen Fähigkeiten bin ich zuversichtlich, erfolgreich zu sein.", en: "Considering the difficulty of this course, the teacher, and my skills, I think I will do well in this class." },

  // Elaboration
  { num: 53, subscale: "elaboration", de: "Beim Lernen verknüpfe ich Informationen aus verschiedenen Quellen miteinander.", en: "When I study for this class, I pull together information from different sources, such as lectures, readings, and discussions." },
  { num: 62, subscale: "elaboration", de: "Ich versuche, neue Ideen mit dem zu verbinden, was ich aus anderen Bereichen weiß.", en: "I try to relate ideas in this subject to those in other courses whenever possible." },
  { num: 64, subscale: "elaboration", de: "Wenn ich neue Inhalte lerne, versuche ich sie mit dem zu verknüpfen, was ich bereits weiß.", en: "When reading for this class, I try to relate the material to what I already know." },
  { num: 67, subscale: "elaboration", de: "Ich schreibe kurze Zusammenfassungen der wichtigsten Gedanken, um sie zu festigen.", en: "When I study for this course, I write brief summaries of the main ideas from the readings and the concepts from the lectures." },
  { num: 69, subscale: "elaboration", de: "Ich versuche, Inhalte zu verstehen, indem ich Verbindungen zwischen verschiedenen Konzepten herstelle.", en: "I try to understand the material in this class by making connections between the readings and the concepts from the lectures." },
  { num: 81, subscale: "elaboration", de: "Ich versuche, Ideen aus meinem Lernthema in anderen Situationen anzuwenden.", en: "I try to apply ideas from course readings in other class activities such as lecture and discussion." },

  // Metacognitive Self-Regulation
  { num: 33, subscale: "metacognitive_sr", de: "Beim Lernen verpasse ich oft Wichtiges, weil ich an anderes denke.", en: "During class time I often miss important points because I'm thinking of other things.", reverse: true },
  { num: 36, subscale: "metacognitive_sr", de: "Ich stelle mir selbst Fragen, um mein Lernen zu fokussieren.", en: "When reading I make up questions to help focus my reading." },
  { num: 41, subscale: "metacognitive_sr", de: "Wenn mir etwas unklar ist, kehre ich zurück und versuche es zu klären.", en: "When I become confused about something I'm reading for this class, I go back and try to figure it out." },
  { num: 44, subscale: "metacognitive_sr", de: "Wenn Inhalte schwer zu verstehen sind, ändere ich meine Lernstrategie.", en: "If course material is difficult to understand, I change the way I read the material." },
  { num: 54, subscale: "metacognitive_sr", de: "Bevor ich etwas gründlich lerne, verschaffe ich mir erst einen Überblick über die Struktur.", en: "Before I study new course material thoroughly, I often skim it to see how it is organized." },
  { num: 55, subscale: "metacognitive_sr", de: "Ich stelle mir selbst Fragen, um zu prüfen ob ich den Stoff wirklich verstanden habe.", en: "I ask myself questions to make sure I understand the material I have been studying." },
  { num: 56, subscale: "metacognitive_sr", de: "Ich passe meine Lernweise an, wenn ich merke, dass mein Vorgehen nicht funktioniert.", en: "I try to change the way I study in order to fit the course requirements and the instructor's teaching style." },
  { num: 57, subscale: "metacognitive_sr", de: "Ich merke oft, dass ich gelernt habe, ohne wirklich aufgenommen zu haben, worum es ging.", en: "I often find that I have been reading for this class but don't know what it was about.", reverse: true },
  { num: 61, subscale: "metacognitive_sr", de: "Ich denke ein Thema durch und überlege, was ich daraus mitnehmen will — statt es nur zu wiederholen.", en: "I think through a topic and decide what I am supposed to learn from it rather than just reading it through." },
  { num: 76, subscale: "metacognitive_sr", de: "Beim Lernen versuche ich herauszufinden, welche Konzepte mir noch unklar sind.", en: "When I'm reading for this class, I try to determine which concepts I don't understand well." },
  { num: 78, subscale: "metacognitive_sr", de: "Ich setze mir Lernziele, um meine Aktivitäten in jeder Lerneinheit zu steuern.", en: "I often set goals for myself in order to direct my activities in each class period." },
  { num: 79, subscale: "metacognitive_sr", de: "Wenn mir etwas unklar bleibt, sorge ich dafür, dass ich es im Nachgang kläre.", en: "If I get confused taking notes in class, I make sure I sort it out afterwards." },
]

// ── Color helpers ──────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300", badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
}


const TABS = ["Übersicht", "Subskalen", "Items", "Auswertung", "Literatur"]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InstrumentePage() {
  const [activeTab, setActiveTab] = useState("Übersicht")
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleItem = (num: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Scale className="h-4 w-4" />
          <span>Messinstrumente</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">MSLQ — Motivated Strategies for Learning Questionnaire</h1>
        <p className="text-muted-foreground">
          Pintrich, Smith, García & McKeachie (1991/1993) · 4 Subskalen · 30 Items · Pre/Post-Design
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Übersicht ──────────────────────────────────────────────────── */}
      {activeTab === "Übersicht" && (
        <div className="space-y-6">
          {/* Why MSLQ */}
          <div className="rounded-lg border border-border p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Warum MSLQ?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              KAIA ist kein Wissenstransfertool — es ist ein sokratischer Begleiter zur Stärkung selbstregulierten Lernens (SRL). Das MSLQ ist das einzige validierte Instrument, das sowohl motivationale Komponenten (Selbstwirksamkeit, Zielorientierung) als auch kognitive Lernstrategien (Elaboration, metakognitive Steuerung) in einem konsistenten Rahmenmodell erfasst.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Alternativen wie der <em>Problemlösekompetenzfragebogen</em> messen das falsche Konstrukt (Problemlösekompetenz ≠ SRL). Die GSE-Skala (Schwarzer & Jerusalem, 1995) erfasst stabile Trait-Selbstwirksamkeit, die sich in 4 Wochen kaum verändert — sie wird parallel als Kontrollvariable eingesetzt.
            </p>
          </div>

          {/* Study Design */}
          <div className="rounded-lg border border-border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" />
              Studiendesign: Pre/Post-Messung
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Pre-Messung</div>
                <div className="text-sm font-medium">Vor Session 1</div>
                <div className="text-sm text-muted-foreground">Im Onboarding-Flow nach Consent-Seite, vor dem ersten Chat-Zugang. Pflichtschranke — kein Chat ohne abgeschlossene Pre-Messung.</div>
                <div className="text-xs text-muted-foreground">30 Items + 10 GSE-Items = 40 Items · ca. 8–10 min</div>
              </div>
              <div className="rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 space-y-2">
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Post-Messung</div>
                <div className="text-sm font-medium">Nach Session 10 (min. 28 Tage)</div>
                <div className="text-sm text-muted-foreground">Automatischer Redirect nach Abschluss von Session 10. Chat bleibt danach gesperrt bis Post abgeschlossen.</div>
                <div className="text-xs text-muted-foreground">30 Items + 10 GSE-Items = 40 Items · ca. 8–10 min</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Pre-Messung</span>
              </div>
              <ChevronRight className="h-3 w-3" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Sessions 1–10 (max 1/Tag · 4 Wochen)</span>
              </div>
              <ChevronRight className="h-3 w-3" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Post-Messung</span>
              </div>
            </div>
          </div>

          {/* Instrument overview */}
          <div className="rounded-lg border border-border p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              Instrument im Überblick
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Original</div>
                <div className="font-medium">81 Items, 15 Subskalen</div>
                <div className="text-muted-foreground">6 Motivation + 9 Lernstrategie</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">KAIA-Auswahl</div>
                <div className="font-medium">30 Items, 4 Subskalen</div>
                <div className="text-muted-foreground">Motivational + SRL-Strategien</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Skala</div>
                <div className="font-medium">7-stufig Likert</div>
                <div className="text-muted-foreground">1 = gar nicht · 7 = vollständig</div>
              </div>
            </div>
          </div>

          {/* Adaptation note */}
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Methodische Limitation (Pflicht in der Thesis)
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              Das MSLQ wurde ursprünglich für formalen Hochschulkontext entwickelt. Für KAIA wurden kontextspezifische Anpassungen vorgenommen: <em>„course&quot;</em> → <em>„Lernthema&quot;</em>, Notenreferenzen inhaltlich ersetzt, Dozent-Referenzen entfernt. Diese Anpassungen sind als Limitation in Kapitel 3 (Methodik) explizit auszuweisen.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Subskalen ──────────────────────────────────────────────────── */}
      {activeTab === "Subskalen" && (
        <div className="space-y-4">
          {SUBSCALES.map(s => {
            const c = COLOR_MAP[s.color]
            return (
              <div key={s.key} className={`rounded-lg border ${c.border} ${c.bg} p-5 space-y-3`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className={`font-semibold ${c.text}`}>{s.nameDe}</h3>
                    <p className="text-xs text-muted-foreground italic">{s.name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>α = {s.alpha.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{s.items} Items</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-0.5">Konstrukt</span>
                    <p className="text-muted-foreground leading-relaxed">{s.construct}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-0.5">Relevanz für KAIA</span>
                    <p className="text-muted-foreground leading-relaxed">{s.relevance}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {MSLQ_ITEMS.filter(i => i.subscale === s.key).map(i => (
                    <span key={i.num} className={`text-xs px-1.5 py-0.5 rounded font-mono ${c.badge} ${i.reverse ? "ring-1 ring-current ring-offset-1" : ""}`}>
                      {i.num}{i.reverse ? "R" : ""}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          <p className="text-xs text-muted-foreground">R = reverse-coded (Scoring: 8 − Original)</p>
        </div>
      )}

      {/* ── Tab: Items ───────────────────────────────────────────────────────── */}
      {activeTab === "Items" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              30 Items in KAIA-Deutsch · Klick auf Item für englisches Original
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Drucken (Anhang)
            </button>
          </div>

          {SUBSCALES.map(s => {
            const c = COLOR_MAP[s.color]
            const items = MSLQ_ITEMS.filter(i => i.subscale === s.key)
            return (
              <div key={s.key} className="space-y-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${c.bg} border ${c.border}`}>
                  <span className={`text-sm font-semibold ${c.text}`}>{s.nameDe}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.badge}`}>{items.length} Items · α = {s.alpha.toFixed(2)}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div key={item.num} className="rounded-md border border-border bg-card overflow-hidden">
                      <button
                        onClick={() => toggleItem(item.num)}
                        className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground font-mono w-6 shrink-0 pt-0.5">{idx + 1}.</span>
                        <span className="text-sm flex-1 leading-relaxed">{item.de}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.reverse && (
                            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                              <RotateCcw className="h-3 w-3" />
                              R
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-mono">#{item.num}</span>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </div>
                      </button>
                      {expandedItems.has(item.num) && (
                        <div className="px-4 pb-3 pt-0 border-t border-border bg-muted/20">
                          <p className="text-xs text-muted-foreground italic leading-relaxed">
                            Original: &ldquo;{item.en}&rdquo;
                          </p>
                          {item.reverse && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              Reverse-coded: Skalenwert = 8 − Rohwert
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Likert scale legend */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h3 className="text-sm font-medium">Antwortskala (7-stufig)</h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {[1,2,3,4,5,6,7].map(n => (
                <div key={n} className="space-y-1">
                  <div className="text-sm font-semibold">{n}</div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {n === 1 ? "Trifft gar nicht zu" : n === 7 ? "Trifft voll­stän­dig zu" : ""}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Instruktion: „Bitte bewerte jede Aussage danach, wie sehr sie auf dich zutrifft.&quot;</p>
          </div>
        </div>
      )}

      {/* ── Tab: Auswertung ──────────────────────────────────────────────────── */}
      {activeTab === "Auswertung" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Scoring-Regeln
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                <p>Skalenwert = <strong>Mittelwert</strong> der zugehörigen Items (nicht Summe)</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                <p>Reverse-coded Items (33, 57): vor Mittelwertbildung transformieren: <code className="bg-muted px-1 rounded">score = 8 − raw</code></p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                <p>Fehlende Werte: Falls ≤ 1 Item pro Subskala fehlt, Mittelwert der vorhandenen Items. Bei mehr: Subskala als missing markieren.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                <p>Kein Cut-off. Keine Diagnostik. Auswertung nur im Pre/Post-Vergleich (within-person Δ).</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-5 space-y-4">
            <h2 className="font-semibold">Subskalen-Übersicht mit Item-IDs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Subskala</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Reverse</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">α</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {SUBSCALES.map(s => (
                    <tr key={s.key}>
                      <td className="py-2 pr-4">{s.nameDe}</td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {MSLQ_ITEMS.filter(i => i.subscale === s.key).map(i => i.num).join(", ")}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {MSLQ_ITEMS.filter(i => i.subscale === s.key && i.reverse).map(i => i.num).join(", ") || "—"}
                      </td>
                      <td className="py-2 font-mono">{s.alpha.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border p-5 space-y-3">
            <h2 className="font-semibold">Hypothese (Pre-registriert)</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>H₁:</strong> Teilnehmende zeigen nach ≥ 10 KAIA-Sessions (min. 28 Tage) signifikant höhere Werte in den MSLQ-Subskalen Selbstwirksamkeit, Elaboration und Metakognitive Selbstregulation (Post &gt; Pre, gerichtet, α = .05).</p>
              <p><strong>H₀:</strong> Es gibt keinen Unterschied zwischen Pre- und Post-Messung.</p>
              <p className="text-xs">Statistik: Wilcoxon-Vorzeichen-Rang-Test (n ≈ 20, nicht-normalverteilt). Power-Analyse: G*Power, Effektgröße d = 0.5 → n = 34 (80% Power, α = .05). Mit n ≈ 20 ist die Studie explorativ.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Literatur ───────────────────────────────────────────────────── */}
      {activeTab === "Literatur" && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pflicht-Zitierungen (APA 7th / DGPs 4. Aufl.)
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Manual (Primärquelle für Item-Texte)</div>
                <p className="text-sm leading-relaxed bg-muted/40 rounded p-3 font-mono text-xs">
                  Pintrich, P. R., Smith, D. A. F., García, T., & McKeachie, W. J. (1991). <em>A manual for the use of the Motivated Strategies for Learning Questionnaire (MSLQ)</em> (NCRIPTAL Report No. 91-B-004). National Center for Research to Improve Postsecondary Teaching and Learning, University of Michigan. ERIC Document Reproduction Service No. ED338122.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Validierungsstudie (Quelle für Reliabilitätswerte)</div>
                <p className="text-sm leading-relaxed bg-muted/40 rounded p-3 font-mono text-xs">
                  Pintrich, P. R., Smith, D. A. F., García, T., & McKeachie, W. J. (1993). Reliability and predictive validity of the Motivated Strategies for Learning Questionnaire (MSLQ). <em>Educational and Psychological Measurement, 53</em>(3), 801–813. https://doi.org/10.1177/0013164493053003024
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">GSE (Kontrollvariable)</div>
                <p className="text-sm leading-relaxed bg-muted/40 rounded p-3 font-mono text-xs">
                  Schwarzer, R., & Jerusalem, M. (1995). Generalized self-efficacy scale. In J. Weinman, S. Wright, & M. Johnston (Eds.), <em>Measures in health psychology: A user&apos;s portfolio. Causal and control beliefs</em> (pp. 35–37). NFER-Nelson.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Zitierhinweis Adaptation
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              In Kapitel 3 (Methodik) explizit formulieren: <em>„Die deutschen Items wurden aus dem englischen Original (Pintrich et al., 1991) übersetzt und für den informellen Lernkontext adaptiert. Kurskontext-Referenzen (&apos;course&apos;, &apos;instructor&apos;, Notenangaben) wurden durch lernthemenbezogene Formulierungen ersetzt. Diese Adaptation ist als Limitation zu werten, da die Normwerte des Originalinstruments nicht direkt übertragbar sind.&quot;</em>
            </p>
          </div>

          <div className="rounded-lg border border-border p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Nutzungsrecht
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Das MSLQ ist als ERIC-Dokument (ED338122) öffentlich zugänglich und frei nutzbar für Forschungszwecke. Es besteht keine kommerzielle Lizenz. Für die Masterthesis und den Prototyp-Betrieb ist keine Genehmigung erforderlich, solange das Instrument korrekt zitiert und die Urheberschaft kenntlich gemacht wird.
            </p>
            <p className="text-sm text-muted-foreground">
              Verfügbar über: ERIC (ed.gov, ED338122) · ResearchGate · Semantic Scholar (CorpusID 149249261)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
