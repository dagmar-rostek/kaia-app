"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, AlertTriangle, Sparkles, Heart, ArrowUp, ArrowDown, Minus, Printer } from "lucide-react"
import { authFetch } from "@/lib/auth"

// ── GSE items (Schwarzer & Jerusalem, 1995) ───────────────────────────────────

const GSE_ITEMS_RAW = [
  "Wenn sich Schwierigkeiten auftürmen, bin ich sicher, dass ich damit fertig werde.",
  "Wenn jemand gegen mich vorgeht, finde ich Mittel und Wege, um mein Ziel zu bekommen.",
  "Es bereitet mir keine Schwierigkeiten, meine Absichten und Ziele zu verwirklichen.",
  "In unerwarteten Situationen weiß ich immer, wie ich mich verhalten soll.",
  "Auch bei überraschenden Ereignissen glaube ich, dass ich gut mit ihnen umgehen kann.",
  "Schwierigkeiten sehe ich gelassen entgegen, weil ich meinen Fähigkeiten immer vertrauen kann.",
  "Was auch immer passiert, ich werde schon klarkommen.",
  "Für jedes Problem kann ich eine Lösung finden.",
  "Wenn eine neue Sache auf mich zukommt, weiß ich, wie ich damit umgehen kann.",
  "Wenn ich mit einem Problem konfrontiert werde, habe ich meist mehrere Ideen, wie ich damit fertig werde.",
]

// ── MSLQ items (Pintrich et al., 1991 — KAIA-Adaptation) ─────────────────────

type MslqItem = { num: number; text: string; subscale: string }

const MSLQ_ITEMS_RAW: MslqItem[] = [
  // Intrinsic Goal Orientation
  { num: 1,  subscale: "Zielorientierung",        text: "Ich bevorzuge Lerninhalte, die mich wirklich herausfordern, weil ich dabei Neues lerne." },
  { num: 16, subscale: "Zielorientierung",        text: "Ich beschäftige mich lieber mit Inhalten, die meine Neugier wecken — auch wenn sie schwieriger sind." },
  { num: 22, subscale: "Zielorientierung",        text: "Das Befriedigendste beim Lernen ist für mich, etwas wirklich in der Tiefe zu verstehen." },
  { num: 24, subscale: "Zielorientierung",        text: "Ich wähle Lernwege, bei denen ich am meisten lerne — auch wenn sie aufwändiger sind." },
  // Self-Efficacy
  { num: 5,  subscale: "Selbstwirksamkeit",       text: "Ich bin überzeugt, dass ich mein Lernthema wirklich durchdringen kann." },
  { num: 6,  subscale: "Selbstwirksamkeit",       text: "Ich bin sicher, dass ich auch schwierige Inhalte meines Lernthemas verstehen kann." },
  { num: 12, subscale: "Selbstwirksamkeit",       text: "Ich bin zuversichtlich, die grundlegenden Konzepte meines Lernthemas zu verstehen." },
  { num: 15, subscale: "Selbstwirksamkeit",       text: "Ich traue mir zu, auch komplexe Zusammenhänge in meinem Lernthema zu durchdringen." },
  { num: 20, subscale: "Selbstwirksamkeit",       text: "Ich bin sicher, dass ich beim Lernen gute Ergebnisse erzielen kann, wenn ich mich anstrenge." },
  { num: 21, subscale: "Selbstwirksamkeit",       text: "Ich erwarte, dass ich mit meinem Lernthema gut vorankomme." },
  { num: 29, subscale: "Selbstwirksamkeit",       text: "Ich bin überzeugt, dass ich die Fähigkeiten, die ich mir vornehme, wirklich erwerben kann." },
  { num: 31, subscale: "Selbstwirksamkeit",       text: "Angesichts der Anforderungen meines Lernthemas und meiner bisherigen Fähigkeiten bin ich zuversichtlich, erfolgreich zu sein." },
  // Elaboration
  { num: 53, subscale: "Elaboration",             text: "Beim Lernen verknüpfe ich Informationen aus verschiedenen Quellen miteinander." },
  { num: 62, subscale: "Elaboration",             text: "Ich versuche, neue Ideen mit dem zu verbinden, was ich aus anderen Bereichen weiß." },
  { num: 64, subscale: "Elaboration",             text: "Wenn ich neue Inhalte lerne, versuche ich sie mit dem zu verknüpfen, was ich bereits weiß." },
  { num: 67, subscale: "Elaboration",             text: "Ich schreibe kurze Zusammenfassungen der wichtigsten Gedanken, um sie zu festigen." },
  { num: 69, subscale: "Elaboration",             text: "Ich versuche, Inhalte zu verstehen, indem ich Verbindungen zwischen verschiedenen Konzepten herstelle." },
  { num: 81, subscale: "Elaboration",             text: "Ich versuche, Ideen aus meinem Lernthema in anderen Situationen anzuwenden." },
  // Metacognitive Self-Regulation
  { num: 33, subscale: "Metakognition",           text: "Beim Lernen verpasse ich oft Wichtiges, weil ich an anderes denke." },
  { num: 36, subscale: "Metakognition",           text: "Ich stelle mir selbst Fragen, um mein Lernen zu fokussieren." },
  { num: 41, subscale: "Metakognition",           text: "Wenn mir etwas unklar ist, kehre ich zurück und versuche es zu klären." },
  { num: 44, subscale: "Metakognition",           text: "Wenn Inhalte schwer zu verstehen sind, ändere ich meine Lernstrategie." },
  { num: 54, subscale: "Metakognition",           text: "Bevor ich etwas gründlich lerne, verschaffe ich mir erst einen Überblick über die Struktur." },
  { num: 55, subscale: "Metakognition",           text: "Ich stelle mir selbst Fragen, um zu prüfen ob ich den Stoff wirklich verstanden habe." },
  { num: 56, subscale: "Metakognition",           text: "Ich passe meine Lernweise an, wenn ich merke, dass mein Vorgehen nicht funktioniert." },
  { num: 57, subscale: "Metakognition",           text: "Ich merke oft, dass ich gelernt habe, ohne wirklich aufgenommen zu haben, worum es ging." },
  { num: 61, subscale: "Metakognition",           text: "Ich denke ein Thema durch und überlege, was ich daraus mitnehmen will — statt es nur zu wiederholen." },
  { num: 76, subscale: "Metakognition",           text: "Beim Lernen versuche ich herauszufinden, welche Konzepte mir noch unklar sind." },
  { num: 78, subscale: "Metakognition",           text: "Ich setze mir Lernziele, um meine Aktivitäten in jeder Lerneinheit zu steuern." },
  { num: 79, subscale: "Metakognition",           text: "Wenn mir etwas unklar bleibt, sorge ich dafür, dass ich es im Nachgang kläre." },
  // Control of Learning Beliefs (Pintrich et al., 1991, items 2/9/18/25)
  { num: 2,  subscale: "Kontrollüberzeugungen",   text: "Wenn ich auf die richtige Weise lerne, werde ich die Inhalte meines Lernthemas wirklich verstehen." },
  { num: 9,  subscale: "Kontrollüberzeugungen",   text: "Wenn ich etwas in meinem Lernthema nicht verstehe, liegt das an mir — ich hätte mich besser vorbereiten können." },
  { num: 18, subscale: "Kontrollüberzeugungen",   text: "Wenn ich mich genug anstrenge, werde ich auch schwierige Inhalte meines Lernthemas durchdringen." },
  { num: 25, subscale: "Kontrollüberzeugungen",   text: "Wenn ich Inhalte nicht beherrsche, liegt das daran, dass ich mich nicht ausreichend angestrengt habe." },
]

const MSLQ_LABELS: [string, string] = ["Trifft gar nicht zu", "Trifft vollständig zu"]
const GSE_LABELS = ["Stimmt nicht", "Stimmt kaum", "Stimmt eher", "Stimmt genau"]

// ── Shuffle helper (Fisher-Yates) ─────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── Likert components ─────────────────────────────────────────────────────────

function LikertRow7({ text, value, onChange, index, total }: {
  text: string; value: number | null; onChange: (v: number) => void; index: number; total: number
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground flex-1">{text}</p>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{index + 1}/{total}</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <span className="text-xs text-muted-foreground w-24 shrink-0 hidden sm:block">{MSLQ_LABELS[0]}</span>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded text-xs font-semibold transition-all border ${
              value === n
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
            aria-label={`${n} von 7`}
          >
            {n}
          </button>
        ))}
        <span className="text-xs text-muted-foreground w-24 shrink-0 text-right hidden sm:block">{MSLQ_LABELS[1]}</span>
      </div>
    </div>
  )
}

function LikertRow4({ text, value, onChange, index, total }: {
  text: string; value: number | null; onChange: (v: number) => void; index: number; total: number
}) {
  return (
    <div className="space-y-2.5 py-3 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground flex-1">{text}</p>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{index + 1}/{total}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {GSE_LABELS.map((label, idx) => {
          const n = idx + 1
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`py-2 px-1 rounded text-xs font-medium transition-all border ${
                value === n
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Evaluation display ────────────────────────────────────────────────────────

interface MslqResult {
  subscale_scores: Record<string, number>
}
interface GseResult {
  total_score: number
}

type ScoreLevel = "niedrig" | "mittel" | "hoch"

function gseLevel(s: number): ScoreLevel {
  if (s < 2.5) return "niedrig"
  if (s > 3.4) return "hoch"
  return "mittel"
}
function mslqLevel(s: number): ScoreLevel {
  if (s < 3.5) return "niedrig"
  if (s > 5.0) return "hoch"
  return "mittel"
}

const LEVEL_STYLE: Record<ScoreLevel, { bar: string; badge: string; label: string }> = {
  niedrig: { bar: "bg-amber-500",   badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20", label: "Niedrig ausgeprägt"  },
  mittel:  { bar: "bg-blue-500",    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",     label: "Mittel ausgeprägt"   },
  hoch:    { bar: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", label: "Hoch ausgeprägt" },
}

interface SubscaleMeta {
  label: string
  description: string
  meaning: (level: ScoreLevel, isPost: boolean) => string
  itemCount: number
}

const SUBSCALE_META: Record<string, SubscaleMeta> = {
  self_efficacy: {
    label: "Selbstwirksamkeit (lernbezogen)",
    itemCount: 8,
    description: "Wie überzeugt du bist, dass du dein Lernthema wirklich durchdringen kannst — auch bei schwierigen Inhalten. Lernspezifische Selbstwirksamkeit nach Bandura (1997) ist einer der stärksten Prädiktoren für Lernausdauer und Lernerfolg.",
    meaning: (l, isPost) => ({
      niedrig: isPost
        ? "Deine lernbezogene Selbstwirksamkeit ist noch niedrig. Das ist normal bei anspruchsvollen Themen — beobachte, ob KAIA hier eine Verschiebung erzeugt hat."
        : "Deine lernbezogene Selbstwirksamkeit startet niedrig. KAIA setzt hier gezielt an: sokratische Fragen stärken das Erleben eigener Erkenntnisfähigkeit.",
      mittel: isPost
        ? "Deine lernbezogene Selbstwirksamkeit liegt im mittleren Bereich — vergleiche mit deiner Eingangsmessung."
        : "Deine lernbezogene Selbstwirksamkeit liegt im Durchschnittsbereich. KAIA kann hier durch wiederholte Erfolgserlebnisse im Dialog weiter aufbauen.",
      hoch: isPost
        ? "Starke lernbezogene Selbstwirksamkeit — vergleiche mit deinem Ausgangswert für die Effektgröße."
        : "Gute Ausgangslage: hohe lernbezogene Überzeugung. KAIA kann dieses Fundament für tieferes Explorieren nutzen.",
    }[l]),
  },
  intrinsic_goal: {
    label: "Intrinsische Zielorientierung",
    itemCount: 4,
    description: "Ob du lernst, um das Thema wirklich zu verstehen und zu können — oder primär für externe Ziele (Noten, Anerkennung). Hohe intrinsische Motivation geht empirisch mit tieferer Verarbeitung und nachhaltigerem Lernen einher (Pintrich, 2003).",
    meaning: (l, isPost) => ({
      niedrig: isPost
        ? "Intrinsische Motivation blieb niedrig — prüfe, ob das Lernthema ausreichend persönliche Relevanz hatte."
        : "Eher extrinsische Orientierung. KAIA arbeitet bewusst sokratisch, um latente Neugier zu aktivieren und das Thema mit eigenen Fragen zu verknüpfen.",
      mittel: isPost
        ? "Mittlere intrinsische Motivation — schaue, ob sich etwas gegenüber dem Ausgangswert verschoben hat."
        : "Gemischte Motivation. KAIAs Fragen zielen darauf ab, den Verstehenswunsch über externe Ziele zu stellen.",
      hoch: isPost
        ? "Hohe intrinsische Motivation am Ende — das deutet auf echtes Engagement mit dem Lernthema hin."
        : "Starker Einstieg: du lernst, weil du verstehen willst. Das ist die ideale Ausgangslage für sokratischen Dialog.",
    }[l]),
  },
  elaboration: {
    label: "Elaborationsstrategien",
    itemCount: 6,
    description: "Wie aktiv du neue Informationen mit bestehendem Wissen verknüpfst und in anderen Kontexten anwendest. Elaboration ist ein Marker für tiefe Verarbeitung — im Gegensatz zu reinem Auswendiglernen (Craik & Lockhart, 1972).",
    meaning: (l, isPost) => ({
      niedrig: isPost
        ? "Elaborationsstrategien blieben niedrig — KAIA-Fragen wie 'Womit würdest du das verknüpfen?' sollen genau das fördern."
        : "Du nutzt bisher wenig Verknüpfungsstrategien. KAIAs Kerntechnik ist Elaboration durch Fragen: 'Was weißt du schon darüber? Wo hast du das schon gesehen?'",
      mittel: isPost
        ? "Mittlere Elaboration — vergleiche mit Eingang, ob KAIA eine Verschiebung zu aktiverer Verknüpfung erzeugt hat."
        : "Mittelstarke Elaboration. KAIA wird gezielt Verknüpfungsfragen stellen, um diesen Bereich zu stärken.",
      hoch: isPost
        ? "Starke Elaboration am Ende — du denkst in Verbindungen, nicht in Inseln."
        : "Du verknüpfst von Natur aus. KAIA kann darauf aufbauen und noch tiefere Transferfragen stellen.",
    }[l]),
  },
  metacognitive_sr: {
    label: "Metakognitive Selbstregulation",
    itemCount: 12,
    description: "Wie gut du dein eigenes Lernen planst, überwachst und anpasst — also weißt, wann du etwas wirklich verstanden hast und wann nicht. Metakognition ist nach Hattie & Timperley (2007) einer der effektstärksten Lernfaktoren.",
    meaning: (l, isPost) => ({
      niedrig: isPost
        ? "Metakognition blieb niedrig — das Erkennen eigener Lücken ist schwer erlernbar, aber zentral für nachhaltiges Lernen."
        : "Geringe metakognitive Selbstregulation — ein häufiges Muster. KAIAs Fragen zielen genau darauf: 'Was weißt du schon? Was ist noch unklar?'",
      mittel: isPost
        ? "Mittlere Metakognition — vergleiche mit Ausgangswert für Veränderungsrichtung."
        : "Mittlere Metakognition. KAIA unterstützt explizit durch Rückfragen, die dich zum Überprüfen deines Verständnisses anleiten.",
      hoch: isPost
        ? "Starke metakognitive Selbstregulation am Ende — du weißt, was du weißt und was nicht."
        : "Gute Ausgangslage: hohe Metakognition. KAIA kann anspruchsvollere Selbstreflexionsfragen nutzen.",
    }[l]),
  },
  control_of_learning: {
    label: "Kontrollüberzeugungen für Lernen",
    itemCount: 4,
    description: "Ob du glaubst, dass deine eigene Anstrengung und Lernstrategie wirklich einen Unterschied machen — dass du das Steuer in der Hand hast. Anders als Selbstwirksamkeit ('Kann ich das?') fragt dieses Konstrukt: 'Liegt es an mir?' (Pintrich et al., 1991).",
    meaning: (l, isPost) => ({
      niedrig: isPost
        ? "Niedrige Lernkontrollüberzeugung am Ende — du schreibst Lernerfolg eher äußeren Faktoren zu. Schaue, ob sich das gegenüber dem Ausgangswert verändert hat."
        : "Du schreibst Lernresultate weniger dir selbst zu — eher dem Stoff, dem System oder dem Zufall. KAIAs sokratische Haltung zielt darauf ab, Erfolgserlebnisse durch eigene Einsicht zu erzeugen.",
      mittel: isPost
        ? "Mittlere Lernkontrollüberzeugung — vergleiche mit dem Ausgangswert für Veränderungsrichtung."
        : "Mittlere Kontrollüberzeugung. Du siehst dich teils als Gestalter, teils als Reagierenden. KAIA arbeitet daran, eigene Einsichten zu stärken.",
      hoch: isPost
        ? "Starke Lernkontrollüberzeugung am Ende — du weißt, dass dein Einsatz den Unterschied macht."
        : "Gute Ausgangslage: du bist überzeugt, dass Lernerfolg von dir abhängt. Das ist die ideale Haltung für aktive Auseinandersetzung mit KAIA.",
    }[l]),
  },
}

function ScoreCard({
  score, max, level, meta, isPost,
}: {
  score: number; max: number; level: ScoreLevel; meta: SubscaleMeta; isPost: boolean
}) {
  const pct = Math.round((score / max) * 100)
  const style = LEVEL_STYLE[level]
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{meta.label}</p>
          <p className="text-xs text-muted-foreground">{meta.itemCount} Items</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold tabular-nums">{score.toFixed(2)}<span className="text-xs font-normal text-muted-foreground"> /{max}</span></span>
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
      <p className="text-xs text-foreground/80 leading-relaxed border-l-2 border-border pl-3">
        {meta.meaning(level, isPost)}
      </p>
    </div>
  )
}

function GseCard({ score, isPost }: { score: number; isPost: boolean }) {
  const level = gseLevel(score)
  const pct = Math.round((score / 4) * 100)
  const style = LEVEL_STYLE[level]
  const NORM_MEAN = 2.97
  const diff = score - NORM_MEAN
  const diffLabel = Math.abs(diff) < 0.1
    ? "entspricht dem deutschen Normmittelwert"
    : diff > 0
      ? `${diff.toFixed(2)} über dem deutschen Normmittelwert`
      : `${Math.abs(diff).toFixed(2)} unter dem deutschen Normmittelwert`

  const meanings: Record<ScoreLevel, string> = {
    niedrig: isPost
      ? "Unterdurchschnittliche allgemeine Selbstwirksamkeit. Vergleiche mit deinem Ausgangswert — eine Verschiebung nach oben durch KAIA wäre das zentrale Studienergebnis."
      : "Unterdurchschnittliche allgemeine Selbstwirksamkeit als Ausgangspunkt. Das bedeutet nicht, dass du scheitern wirst — aber KAIA hat hier besonders viel Spielraum. Sokratische Begleitung zielt genau darauf: das Erleben 'Ich habe es selbst herausgefunden' stärkt Selbstwirksamkeit durch Handlungsergebniserfahrungen (Bandura, 1977).",
    mittel: isPost
      ? "Allgemeine Selbstwirksamkeit im Durchschnittsbereich. Vergleiche mit deiner Eingangsmessung für die Veränderungsrichtung."
      : "Allgemeine Selbstwirksamkeit im Durchschnitt — eine gesunde Ausgangslage. KAIA arbeitet daran, durch wiederholte eigenständige Erkenntnisse diesen Wert zu festigen und zu erhöhen.",
    hoch: isPost
      ? "Überdurchschnittliche allgemeine Selbstwirksamkeit. Prüfe den Unterschied zur Eingangsmessung."
      : "Überdurchschnittliche Ausgangslage — du bist überzeugt, Schwierigkeiten meistern zu können. Das ist eine starke Basis für sokratischen Dialog.",
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Allgemeine Selbstwirksamkeit (GSE)</p>
          <p className="text-xs text-muted-foreground">10 Items · Schwarzer & Jerusalem, 1995</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold tabular-nums">{score.toFixed(2)}<span className="text-xs font-normal text-muted-foreground"> /4</span></span>
          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${style.badge}`}>
            {style.label}
          </span>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1 — stimmt nicht</span>
          <span className="text-xs font-medium text-foreground/60">{diffLabel}</span>
          <span>4 — stimmt genau</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Misst die generalisierte Überzeugung, Anforderungen und Schwierigkeiten des Lebens aus eigener Kraft bewältigen zu können — unabhängig vom konkreten Lernthema. Normwert: dt. Erwachsenenstichprobe M=2,97 · SD=0,55 (Schwarzer & Jerusalem, 1995).
      </p>
      <p className="text-xs text-foreground/80 leading-relaxed border-l-2 border-border pl-3">
        {meanings[level]}
      </p>
    </div>
  )
}

// ── Pre/Post comparison row ────────────────────────────────────────────────────

function ComparisonRow({
  label, preScore, postScore, maxScore,
}: {
  label: string; preScore: number; postScore: number; maxScore: number
}) {
  const prePct = Math.round((preScore / maxScore) * 100)
  const postPct = Math.round((postScore / maxScore) * 100)
  const delta = postScore - preScore
  const absD = Math.abs(delta).toFixed(2)
  const DeltaIcon = delta > 0.04 ? ArrowUp : delta < -0.04 ? ArrowDown : Minus
  const deltaColor = delta > 0.04
    ? "text-emerald-600 dark:text-emerald-400"
    : delta < -0.04
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground"
  const postBarColor = delta > 0.04
    ? "bg-emerald-500"
    : delta < -0.04
      ? "bg-amber-500"
      : "bg-blue-500"

  return (
    <div className="space-y-2 print:space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`flex items-center gap-0.5 text-sm font-bold tabular-nums ${deltaColor}`}>
          <DeltaIcon className="h-3.5 w-3.5" />
          {absD}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-14 shrink-0">Vorher</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${prePct}%` }} />
          </div>
          <span className="w-9 text-right tabular-nums">{preScore.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-14 shrink-0 font-medium">Nachher</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${postBarColor}`} style={{ width: `${postPct}%` }} />
          </div>
          <span className="w-9 text-right tabular-nums font-semibold">{postScore.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Post-study celebration panel ──────────────────────────────────────────────

interface SurveyResultsData {
  pre: { mslq: MslqResult | null; gse: GseResult | null }
  post: { mslq: MslqResult | null; gse: GseResult | null }
}

function PostCompletionPanel({ postMslqResult, postGseResult }: {
  postMslqResult: MslqResult
  postGseResult: GseResult
}) {
  const [comparison, setComparison] = useState<SurveyResultsData | null>(null)
  const [loadingComparison, setLoadingComparison] = useState(true)

  useEffect(() => {
    authFetch("/api/v1/survey/results")
      .then(r => r.json())
      .then((data: SurveyResultsData) => setComparison(data))
      .catch(() => {/* silently degrade — show current results only */})
      .finally(() => setLoadingComparison(false))
  }, [])

  const preGse = comparison?.pre.gse
  const preMslq = comparison?.pre.mslq
  const hasComparison = !loadingComparison && preGse && preMslq

  const subscaleKeys = Object.keys(postMslqResult.subscale_scores)

  return (
    <>
      {/* Print styles — hide nav/header, keep comparison visible */}
      <style>{`
        @media print {
          nav, header, [data-print-hide] { display: none !important; }
          [data-print-show] { display: block !important; }
          body { background: white !important; color: black !important; }
          .print\\:break-before-page { break-before: page; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 print:py-4 print:space-y-4">

        {/* ── Celebration header ── */}
        <div data-print-hide className="text-center space-y-5 py-4">
          <div className="relative inline-flex">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-emerald-500" />
            </div>
            <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Du hast es vollständig abgeschlossen.
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              10 Sessions. Zwei Fragebögen. Eine vollständige Reise.
              Das ist selten — und es macht einen echten Unterschied.
            </p>
          </div>
        </div>

        {/* ── Karma-Kasse ── */}
        <div data-print-hide className="rounded-xl border border-amber-200 dark:border-amber-800 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Du hast auf die Karma-Kasse eingezahlt.
            </p>
          </div>
          <p className="text-sm text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
            Jede Teilnahme an dieser Studie hilft zu verstehen, wie KI-gestützte Lernbegleitung
            wirkt — ob sokratische Gesprächsführung Selbstwirksamkeit stärkt, ob es einen Unterschied
            macht, mit welchem Modell man spricht. Das sind Fragen, die Bildung verändern können.
            Du hast dazu beigetragen. Danke.
          </p>
        </div>

        {/* ── Comparison section ── */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Dein Lernprofil — Vorher &amp; Nachher</h2>
            {!loadingComparison && !hasComparison && (
              <span className="text-xs text-muted-foreground">Vergleich nicht verfügbar</span>
            )}
          </div>

          {loadingComparison && (
            <div className="text-sm text-muted-foreground animate-pulse">Vergleichsdaten werden geladen…</div>
          )}

          {hasComparison && (
            <div className="space-y-5 divide-y divide-border">
              {/* GSE */}
              <div className="space-y-2 pt-2 first:pt-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Allgemeine Selbstwirksamkeit (GSE)
                  <span className="ml-1 font-normal normal-case">· Schwarzer &amp; Jerusalem, 1995 · Skala 1–4</span>
                </p>
                <ComparisonRow
                  label="GSE Gesamtscore"
                  preScore={preGse.total_score}
                  postScore={postGseResult.total_score}
                  maxScore={4}
                />
                <p className="text-xs text-muted-foreground">
                  Normmittelwert dt. Erwachsenenstichprobe: 2,97 (SD 0,55)
                </p>
              </div>

              {/* MSLQ subscales */}
              <div className="space-y-4 pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Lernstrategien &amp; Motivation (MSLQ)
                  <span className="ml-1 font-normal normal-case">· Pintrich et al., 1991/1993 · Skala 1–7</span>
                </p>
                {subscaleKeys.map(key => {
                  const meta = SUBSCALE_META[key]
                  if (!meta) return null
                  const preScore = (preMslq.subscale_scores as Record<string, number>)[key] ?? 0
                  const postScore = (postMslqResult.subscale_scores as Record<string, number>)[key] ?? 0
                  return (
                    <ComparisonRow
                      key={key}
                      label={meta.label}
                      preScore={preScore}
                      postScore={postScore}
                      maxScore={7}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Fallback: show post results only when no pre data */}
          {!loadingComparison && !hasComparison && (
            <div className="space-y-3">
              <GseCard score={postGseResult.total_score} isPost />
              {subscaleKeys.map(key => {
                const meta = SUBSCALE_META[key]
                if (!meta) return null
                return (
                  <ScoreCard
                    key={key}
                    score={(postMslqResult.subscale_scores as Record<string, number>)[key] ?? 0}
                    max={7}
                    level={mslqLevel((postMslqResult.subscale_scores as Record<string, number>)[key] ?? 0)}
                    meta={meta}
                    isPost
                  />
                )
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
          Diese Werte sind Forschungsinstrumente, keine klinischen Diagnosen. Individuelle Scores
          haben Messfehlerbandbreiten — für die Studie relevant ist die Prä-Post-Veränderung
          auf Gruppenebene. Die Pfeile zeigen die Richtung deiner persönlichen Entwicklung.
        </p>

        {/* ── Download / Print ── */}
        <div data-print-hide className="pt-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Printer className="h-4 w-4" />
            Ergebnisse drucken / als PDF speichern
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Im Browser-Druckdialog &bdquo;Als PDF speichern&ldquo; wählen, um eine Kopie zu behalten.
          </p>
        </div>

        {/* ── Print header (only visible when printing) ── */}
        <div data-print-show className="hidden print:block text-xs text-muted-foreground pt-4 border-t border-border">
          KAIA-Studie — Persönliches Lernprofil · Masterthesis Dagmar Rostek, SRH Fernhochschule Riedlingen · Daten vertraulich
        </div>
      </div>
    </>
  )
}

function EvaluationPanel({ mslqResult, gseResult, measurementType, redirectTo }: {
  mslqResult: MslqResult
  gseResult: GseResult
  measurementType: "pre" | "post"
  redirectTo: string
}) {
  const router = useRouter()
  const isPost = measurementType === "post"

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <h1 className="text-xl font-semibold">
            {isPost ? "Abschlussbefragung gespeichert" : "Eingangsbefragung gespeichert"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {isPost
            ? "Deine Messwerte wurden gespeichert. Hier ist dein Abschlussprofil — vergleiche es mit deiner Eingangsmessung, sobald die Studie ausgewertet wird."
            : "Deine Ausgangswerte sind gesichert. Sie bilden die Vergleichsbasis für die Auswertung nach 10 Sessions mit KAIA."}
        </p>
      </div>

      {/* GSE */}
      <GseCard score={gseResult.total_score} isPost={isPost} />

      {/* MSLQ subscales */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Lernstrategien & Motivation (MSLQ)
          </p>
          <span className="text-xs text-muted-foreground">Pintrich et al., 1991/1993</span>
        </div>
        {Object.entries(mslqResult.subscale_scores).map(([key, score]) => {
          const meta = SUBSCALE_META[key]
          if (!meta) return null
          return (
            <ScoreCard
              key={key}
              score={score}
              max={7}
              level={mslqLevel(score)}
              meta={meta}
              isPost={isPost}
            />
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center px-4">
        Diese Werte sind Forschungsinstrumente, keine klinischen Diagnosen. Individuelle Werte haben große Messfehlerbandbreiten — für die Studie relevant ist die Prä-Post-Veränderung auf Gruppenebene.
      </p>

      <button
        onClick={() => router.push(redirectTo)}
        className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {isPost ? "Zur Übersicht →" : "Zu KAIA →"}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  measurementType: "pre" | "post"
  redirectTo: string
}

export function SurveyForm({ measurementType, redirectTo }: Props) {
  const [step, setStep] = useState<"intro" | "mslq" | "gse" | "done">("intro")
  const [mslqAnswers, setMslqAnswers] = useState<Record<string, number>>({})
  const [gseAnswers, setGseAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mslqResult, setMslqResult] = useState<MslqResult | null>(null)
  const [gseResult, setGseResult] = useState<GseResult | null>(null)

  // Shuffle once per form instance — stable within a session
  const shuffledMslq = useMemo<MslqItem[]>(() => shuffle(MSLQ_ITEMS_RAW), [])
  const shuffledGse = useMemo<Array<{ text: string; originalIdx: number }>>(
    () => shuffle(GSE_ITEMS_RAW.map((text, idx) => ({ text, originalIdx: idx }))),
    []
  )

  const mslqDone = shuffledMslq.every((i) => mslqAnswers[String(i.num)] != null)
  const gseDone = shuffledGse.every((i) => gseAnswers[i.originalIdx] != null)

  const mslqAnsweredCount = Object.keys(mslqAnswers).length
  const gseAnsweredCount = Object.keys(gseAnswers).length

  const setMslq = useCallback((num: number, val: number) => {
    setMslqAnswers((prev) => ({ ...prev, [String(num)]: val }))
  }, [])

  const setGse = useCallback((originalIdx: number, val: number) => {
    setGseAnswers((prev) => ({ ...prev, [originalIdx]: val }))
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const headers = { "Content-Type": "application/json" }

      // Submit MSLQ
      const mslqRes = await authFetch("/api/v1/survey/mslq", {
        method: "POST",
        headers,
        body: JSON.stringify({ measurement_type: measurementType, items: mslqAnswers }),
      })
      if (!mslqRes.ok) {
        const msg = await mslqRes.text().catch(() => mslqRes.statusText)
        throw new Error(msg)
      }
      const mslqData = await mslqRes.json() as MslqResult
      setMslqResult(mslqData)

      // Submit GSE (items as 1-indexed array in original order)
      const gseItems = GSE_ITEMS_RAW.map((_, idx) => gseAnswers[idx])
      const gseRes = await authFetch("/api/v1/survey/gse", {
        method: "POST",
        headers,
        body: JSON.stringify({ measurement_type: measurementType, items: gseItems }),
      })
      if (!gseRes.ok) {
        const msg = await gseRes.text().catch(() => gseRes.statusText)
        throw new Error(msg)
      }
      const gseData = await gseRes.json() as GseResult
      setGseResult(gseData)

      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler. Bitte nochmal versuchen.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Evaluation ──────────────────────────────────────────────────────────────

  if (step === "done" && mslqResult && gseResult) {
    if (measurementType === "post") {
      return (
        <PostCompletionPanel
          postMslqResult={mslqResult}
          postGseResult={gseResult}
        />
      )
    }
    return (
      <EvaluationPanel
        mslqResult={mslqResult}
        gseResult={gseResult}
        measurementType={measurementType}
        redirectTo={redirectTo}
      />
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (step === "intro") {
    const isPost = measurementType === "post"
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {isPost ? "Abschlussbefragung" : "Eingangsbefragung"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isPost ? "Wie hat sich dein Lernen verändert?" : "Wie lernst du bisher?"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isPost
              ? "Du hast mindestens 10 Sessions mit KAIA abgeschlossen. Jetzt schauen wir gemeinsam, was sich verändert hat — in deinen Lernstrategien, deiner Selbstwirksamkeit und deiner Überzeugung, das Steuer beim Lernen in der Hand zu haben."
              : "Bevor du mit KAIA startest, machen wir eine kurze Bestandsaufnahme. Wie gehst du ans Lernen heran? Was glaubst du, was funktioniert? Das dauert ca. 12 Minuten — und lohnt sich."}
          </p>
        </div>

        {/* Warum + Was du davon hast */}
        {!isPost && (
          <div className="rounded-lg border border-border p-5 space-y-4 text-sm">
            <p className="font-medium text-foreground">Warum dieser Fragebogen?</p>
            <p className="text-muted-foreground leading-relaxed">
              KAIA ist kein generisches Chatbot-System. Dein Lernprofil — Motivation, Strategien, Selbstwirksamkeit — fließt direkt in die Art ein, wie KAIA mit dir arbeitet. Je ehrlicher deine Antworten, desto besser kann KAIA auf dich eingehen.
            </p>
            <div className="border-t border-border pt-4 space-y-2">
              <p className="font-medium text-foreground">Was du davon hast</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">→</span>
                  <span>Direkt nach dem Fragebogen siehst du dein persönliches Lernprofil mit Erklärung zu jeder Dimension.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">→</span>
                  <span>Nach Abschluss der Studie erhältst du eine detaillierte Gegenüberstellung: Vorher vs. Nachher — konkret und lesbar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">→</span>
                  <span>Deine Antworten werden nie bewertet. Es gibt kein Richtig oder Falsch — nur dein tatsächlicher Ausgangspunkt.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {isPost && (
          <div className="rounded-lg border border-border p-5 space-y-3 text-sm">
            <p className="font-medium text-foreground">Was dich am Ende erwartet</p>
            <p className="text-muted-foreground leading-relaxed">
              Sobald du diesen Fragebogen abgeschlossen hast, siehst du deine vollständige Entwicklung — alle Messdimensionen im Vergleich Vorher vs. Nachher, mit Erklärung was sich verändert hat und was das bedeutet.
            </p>
          </div>
        )}

        {/* Was dich erwartet */}
        <div className="rounded-lg border border-border p-5 space-y-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Was dich erwartet</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">34</span><span>Aussagen zu Lernstrategien, Motivation und Lernkontrolle (7-stufige Skala)</span></div>
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">10</span><span>Aussagen zur allgemeinen Selbstwirksamkeit (4-stufige Skala)</span></div>
            <div className="flex items-center gap-2"><span className="text-foreground font-medium w-6">~12</span><span>Minuten Gesamtzeit</span></div>
          </div>
        </div>

        {/* DSGVO */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
          Deine Antworten werden ausschließlich für die Masterthesis-Studie verwendet und nicht mit Dritten geteilt. Du hast jederzeit das Recht auf Auskunft und Löschung (DSGVO Art. 15–17).
        </div>

        <button
          onClick={() => setStep("mslq")}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {isPost ? "Abschlussbefragung starten" : "Jetzt starten"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ── MSLQ & GSE ─────────────────────────────────────────────────────────────

  const totalAnswered = mslqAnsweredCount + gseAnsweredCount
  const totalItems = shuffledMslq.length + shuffledGse.length
  const overallPct = Math.round((totalAnswered / totalItems) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Global progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{totalAnswered} von {totalItems} Aussagen beantwortet</span>
          <span className="font-medium">{overallPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        {/* Section tabs */}
        <div className="flex gap-4 pt-1">
          <button
            onClick={() => setStep("mslq")}
            className={`flex items-center gap-1.5 text-xs pb-0.5 transition-colors ${
              step === "mslq" ? "text-foreground border-b border-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              mslqDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
            }`}>{mslqDone ? "✓" : mslqAnsweredCount}</span>
            Lernstrategien ({shuffledMslq.length})
          </button>
          <button
            onClick={() => mslqDone && setStep("gse")}
            disabled={!mslqDone}
            className={`flex items-center gap-1.5 text-xs pb-0.5 transition-colors ${
              step === "gse" ? "text-foreground border-b border-foreground"
              : mslqDone ? "text-muted-foreground hover:text-foreground"
              : "opacity-40 cursor-not-allowed text-muted-foreground"
            }`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
              gseDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
            }`}>{gseDone ? "✓" : gseAnsweredCount}</span>
            Selbstwirksamkeit ({shuffledGse.length})
          </button>
        </div>
      </div>

      {step === "mslq" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Lernstrategien & Motivation</h2>
            <span className="text-xs text-muted-foreground">{mslqAnsweredCount}/{shuffledMslq.length}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Bewerte jede Aussage: <strong>1</strong> = trifft gar nicht zu · <strong>7</strong> = trifft vollständig zu.
            Die Aussagen sind gemischt dargestellt.
          </p>
          <div>
            {shuffledMslq.map((item, idx) => (
              <LikertRow7
                key={item.num}
                text={item.text}
                value={mslqAnswers[String(item.num)] ?? null}
                onChange={(v) => setMslq(item.num, v)}
                index={idx}
                total={shuffledMslq.length}
              />
            ))}
          </div>
          <div className="pt-6">
            <button
              onClick={() => setStep("gse")}
              disabled={!mslqDone}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter zu Selbstwirksamkeit
              <ChevronRight className="h-4 w-4" />
            </button>
            {!mslqDone && (
              <p className="text-xs text-muted-foreground mt-2">
                Noch {shuffledMslq.length - mslqAnsweredCount} Aussagen offen.
              </p>
            )}
          </div>
        </div>
      )}

      {step === "gse" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">Allgemeine Selbstwirksamkeit</h2>
            <span className="text-xs text-muted-foreground">{gseAnsweredCount}/{shuffledGse.length}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Schwarzer & Jerusalem, 1995 · Wähle für jede Aussage wie sehr sie auf dich zutrifft.
          </p>
          <div>
            {shuffledGse.map((item, idx) => (
              <LikertRow4
                key={item.originalIdx}
                text={item.text}
                value={gseAnswers[item.originalIdx] ?? null}
                onChange={(v) => setGse(item.originalIdx, v)}
                index={idx}
                total={shuffledGse.length}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-6 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={!gseDone || submitting}
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed w-fit"
            >
              {submitting ? "Wird gespeichert…" : "Abschicken"}
              {!submitting && <CheckCircle2 className="h-4 w-4" />}
            </button>
            {!gseDone && (
              <p className="text-xs text-muted-foreground">
                Noch {shuffledGse.length - gseAnsweredCount} Aussagen offen.
              </p>
            )}
            <button
              onClick={() => setStep("mslq")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              ← Zurück zu Lernstrategien
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
