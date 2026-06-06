"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  CheckCircle2, Clock, Lightbulb, AlertTriangle, BookOpen, FlaskConical,
  Users, Shield, Database, MessageSquare, Brain, BarChart3, Mail, Lock,
  Eye, Zap, Sparkles, Calendar, Target, HelpCircle, FileText, Activity,
  ChevronDown, ChevronUp, X, GitCommit,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "done" | "active" | "planned" | "idea" | "blocker"
type Month  = "done" | "juni" | "juli" | "august" | "ideas"
type AgentId =
  | "coordinator" | "product-owner" | "discovery-researcher" | "psychologist"
  | "compliance"  | "architect"     | "ai-engineer"          | "ai-ethics"
  | "ux-designer" | "security"      | "qa-tester"            | "mlops"
  | "didaktiker"

interface Feature {
  title: string
  desc: string
  status: Status
  month: Month
  chapter?: string
  tags?: string[]
  agents?: AgentId[]
  aufwand?: string
  sha?: string
  icon?: React.ElementType
  week?: 1 | 2 | 3 | 4   // which week within Juni (1-4)
  sprint?: boolean         // active this week → appears in 7-day view
  day?: number            // specific day of month (1-31) for sprint items
}

// ── Agent config ──────────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<AgentId, { label: string; cls: string }> = {
  coordinator:            { label: "Koordinator", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300" },
  "product-owner":        { label: "PO",          cls: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400" },
  "discovery-researcher": { label: "Discovery",   cls: "bg-pink-500/10 text-pink-700 border-pink-500/20 dark:text-pink-400" },
  psychologist:           { label: "Psychologe",  cls: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400" },
  compliance:             { label: "Compliance",  cls: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" },
  architect:              { label: "Architect",   cls: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400" },
  "ai-engineer":          { label: "AI Eng.",     cls: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" },
  "ai-ethics":            { label: "AI Ethics",   cls: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400" },
  "ux-designer":          { label: "UX",          cls: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400" },
  security:               { label: "Security",    cls: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400" },
  "qa-tester":            { label: "QA",          cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" },
  mlops:                  { label: "MLOps",       cls: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400" },
  didaktiker:             { label: "Didaktiker",  cls: "bg-lime-500/10 text-lime-700 border-lime-500/20 dark:text-lime-400" },
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  // ── FERTIG ──
  { title: "Monorepo-Skeleton", desc: "Next.js 14 + FastAPI Monorepo, CI/CD, Docker Compose, Caddy + Let's Encrypt auf Hetzner CX23.", status: "done", month: "done", chapter: "Kap. 4", tags: ["Infra"], agents: ["architect","mlops"], aufwand: "3h", sha: "426aa27", icon: Database },
  { title: "Landing Page & öffentliche Seiten", desc: "/wissenschaft, /architektur, /release-notes mit gemeinsamer Navigation und Dark-Mode.", status: "done", month: "done", chapter: "Kap. 1", tags: ["Frontend"], agents: ["ux-designer","architect"], aufwand: "2h", sha: "da909b5", icon: Eye },
  { title: "Admin-Bereich Basis", desc: "Dashboard, Production Readiness, Kosten, Tagebuch, Release Notes — passwortgeschützt via HMAC-Cookie.", status: "done", month: "done", chapter: "Kap. 4", tags: ["Frontend","Admin"], agents: ["ux-designer","security","architect"], aufwand: "3h", sha: "8085cb7", icon: Shield },
  { title: "Sentry Monitoring", desc: "Vollständige Sentry-Integration Frontend + Backend — DSN via Docker Build-Arg, global-error.tsx Boundary.", status: "done", month: "done", chapter: "Kap. 4", tags: ["Observability"], agents: ["mlops"], aufwand: "1h", sha: "464820f", icon: Activity },
  { title: "BugReport-Widget", desc: "Floating Bug-Button sendet Reports direkt in Slack-Kanal mit Screenshot-Option.", status: "done", month: "done", chapter: "Kap. 4", tags: ["Observability"], agents: ["ux-designer","mlops"], aufwand: "30min", sha: "8085cb7", icon: MessageSquare },
  { title: "Auth Backend", desc: "JWT Access (15min) + Refresh (30d) rotierend, bcrypt-12, User-Approval-Flow, Token-Family-Reuse-Detection.", status: "done", month: "done", chapter: "Kap. 4", tags: ["Security","Backend"], agents: ["security","architect"], aufwand: "3h 30min", sha: "7bc1929", icon: Lock },
  { title: "Auth Frontend", desc: "Login, Registrierung mit Multi-Step-DSGVO-Consent, AuthContext, AuthGuard, Next.js Middleware-Schutz.", status: "done", month: "done", chapter: "Kap. 4 · Kap. 6", tags: ["Frontend","DSGVO"], agents: ["ux-designer","security","compliance"], aufwand: "2h", sha: "f82d263", icon: Users },
  { title: "Admin User-Approval UI", desc: "Freigabe/Ablehnung von Teilnehmenden, Slack-Notification bei Approval, Server Actions — Token nie im Browser.", status: "done", month: "done", chapter: "Kap. 4 · Kap. 6", tags: ["Admin","Studie"], agents: ["product-owner","ux-designer","security"], aufwand: "1h 30min", sha: "cd2155c", icon: Users },
  { title: "Crisis-Detection Pre-Filter", desc: "20+ deutsche Regex-Muster, bei Treffer keine LLM-Verarbeitung → Telefonseelsorge 0800 111 0 111.", status: "done", month: "done", chapter: "Kap. 6", tags: ["Ethik"], agents: ["ai-engineer","ai-ethics","security"], aufwand: "3h", sha: "b89d594", icon: AlertTriangle },
  { title: "KI-Disclosure + Datenschutzerklärung", desc: "KI-Disclosure-Seite /ki-disclosure, Datenschutzerklärung /datenschutz mit allen DSGVO Art. 15–21 Rechten.", status: "done", month: "done", chapter: "Kap. 6", tags: ["DSGVO","Ethik"], agents: ["compliance","ai-ethics","ux-designer"], aufwand: "2h", sha: "b89d594", icon: Eye },
  { title: "Studienprotokoll + Einwilligungserklärung", desc: "Vollständiges Studienprotokoll (v1.0), Teilnahmevereinbarung druckfertig, R-basierte Power-Analyse N=32.", status: "done", month: "done", chapter: "Kap. 6", tags: ["Wissenschaft","Ethik"], agents: ["psychologist","compliance","discovery-researcher"], aufwand: "1h 15min", sha: "7404aa3", icon: FileText },

  // ── JUNI — Woche 1 (1.–7. Juni) — KRITISCHER PFAD ──
  { title: "Ethikvotum-Antrag einreichen", desc: "HEUTE oder morgen einreichen — spätestens 06.06.2026. Studienprotokoll + Einwilligungserklärung + Datenschutzerklärung. Wartezeit: 4–8 Wochen.", status: "blocker", month: "juni", chapter: "Kap. 6", tags: ["Wissenschaft","Ethik","Blocker"], agents: ["compliance","psychologist"], aufwand: "2h", week: 1, sprint: true, day: 5, icon: AlertTriangle },
  { title: "DB-Schema (Alembic)", desc: "Vollständiges DB-Schema: users, sessions, messages, gse_results, consent_logs — pgvector Extension. Blockiert Chat-Entwicklung.", status: "active", month: "juni", chapter: "Kap. 4", tags: ["Backend","DB"], agents: ["architect","security"], aufwand: "3h", week: 1, sprint: true, day: 6, icon: Database },

  // ── JUNI — Woche 2 (8.–14. Juni) ──
  { title: "Chat Core mit SSE-Streaming", desc: "Echtzeit-Textstrom via SSE, React Query, Message-History in PostgreSQL. Kritischer Pfad für Studienstart 15.07.", status: "planned", month: "juni", chapter: "Kap. 4", tags: ["Backend","Frontend"], agents: ["ai-engineer","architect","ux-designer"], aufwand: "5h", week: 2, icon: MessageSquare },
  { title: "KI-Disclosure Flow vollständig", desc: "Middleware prüft ki_disclosure_seen_at — redirect nach /ki-disclosure wenn noch nicht gesehen.", status: "planned", month: "juni", chapter: "Kap. 6", tags: ["Ethik","DSGVO"], agents: ["compliance","ai-ethics","ux-designer"], aufwand: "1h", week: 2, icon: Eye },

  // ── JUNI — Woche 3 (15.–21. Juni) ──
  { title: "LLM-Integration (3 Modelle)", desc: "Gemeinsames Abstraktions-Interface Claude/GPT-4o/Mistral. Versionierte Model-IDs. DPAs vor Integration.", status: "planned", month: "juni", chapter: "Kap. 4 · Kap. 5", tags: ["AI","LLM-Eval"], agents: ["ai-engineer","security","mlops"], aufwand: "4h", week: 3, icon: Zap },
  { title: "Transparenz-Layer + user_mode_override", desc: "Sichtbarkeit aktiver Modus + Inferenz-Begründung. user_mode_override als First-Class-Konzept: Lernende können Modus überschreiben, Profil korrigieren, Session-Schätzungen widersprechen. DSGVO Art. 22 Compliance.", status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 4", tags: ["DSGVO","UX","AI"], agents: ["ux-designer","ai-engineer","compliance","didaktiker"], aufwand: "3h", week: 3, icon: Eye },
  { title: "GSE Pre-Measurement", desc: "10 Items, 4-stufige Likert-Skala vor erster Session. Pflicht für Studienstart.", status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 6", tags: ["Psychometrie","Studie"], agents: ["psychologist","ux-designer","ai-ethics"], aufwand: "3h", week: 3, icon: FlaskConical },
  { title: "Lernroadmap-Feature", desc: "Persönliche Lernroadmap: Ziele, Fortschritt (user-owned), Domänen. Fließt als aktives Ziel in jeden Session-Kontext ein.", status: "planned", month: "juni", chapter: "Kap. 3", tags: ["Frontend","Studie"], agents: ["ux-designer","product-owner","didaktiker"], aufwand: "3h", week: 3, icon: Target },

  // ── JUNI — Woche 4 (22.–30. Juni) ──
  { title: "LLM-Evaluation (synthetische Daten)", desc: "Claude/GPT-4o/Mistral: Sokratik, Empathie, Konsistenz, Datenschutz. VOR Study-Lock.", status: "planned", month: "juni", chapter: "Kap. 5", tags: ["LLM-Eval","Wissenschaft"], agents: ["ai-engineer","mlops","psychologist","didaktiker"], aufwand: "6h", week: 4, icon: FlaskConical },
  { title: "DPAs Anthropic / OpenAI / Mistral", desc: "Data Processing Agreements abschließen. Standard-DPA-Prozess.", status: "planned", month: "juni", chapter: "Kap. 6", tags: ["DSGVO","Rechtlich"], agents: ["compliance"], aufwand: "1h", week: 4, icon: FileText },
  { title: "Pre-Registration OSF.io + Study-Lock", desc: "H1–H3 auf osf.io registrieren. Dann Study-Lock aktivieren. Bis 12.07. erledigt — Studie startet 15.07.", status: "planned", month: "juni", chapter: "Kap. 6", tags: ["Wissenschaft","Studie"], agents: ["discovery-researcher","psychologist","mlops"], aufwand: "1h", week: 4, icon: Lock },

  // ── JUNI — Woche 4 (22.–30. Juni) — ergänzt ──
  { title: "Outcome-Formulierung beim Lernziel-Setup", desc: "KAIA akzeptiert kein vages Thema. Progressiver 3-Fragen-Dialog (Kontext → Vermeidungsmotiv → Annäherungsmotiv) transformiert 'KI lernen' in konkretes Lernergebnis nach Bloom (Biggs & Tang). Outcome-Anker: kollabierbare Leiste oben im Chat, immer sichtbar, editierbar.", status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 4", tags: ["AI","UX","Studie","Psychologie"], agents: ["ai-engineer","ux-designer","psychologist","didaktiker"], aufwand: "3h", week: 4, icon: Target },
  { title: "Ressourcen-Agent (3-Pfad-Modell)", desc: "Separater Prompt-Modus (Tab/Sidebar): immer 3 fundamental verschiedene Lernwege — (1) Strukturiert (Buch/Kurs/Doku), (2) Menschlich (LinkedIn-Expert/Forum), (3) Durch Tun (eigenes Projekt/Hackathon). Prompt-Constraint erzwingt das Format. Web-Search optional+transparent. URLs immer als 'zum Verifizieren'.", status: "planned", month: "juli", chapter: "Kap. 3 · Kap. 4", tags: ["AI","UX","Frontend"], agents: ["ai-engineer","ux-designer","didaktiker"], aufwand: "4h", icon: Zap },
  { title: "Session-Ende-Detektion + Ende-Karte", desc: "System beendet Session nach 10–15 Min. bei natürlichem Abschluss (Zeit + semantische Kohärenz + Gesprächsenergie). Stille nicht-modale Ende-Karte: 'Das war heute gut. Hier ist was du heute selbst entwickelt hast.' + offene Frage für nächste Session.", status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 4", tags: ["AI","UX","Frontend"], agents: ["ai-engineer","ux-designer","psychologist","didaktiker"], aufwand: "3h", week: 4, icon: Sparkles },
  { title: "'Deine Gedanken' — Lernfaden-View", desc: "Nach jeder Session extrahiert LLM die 2–3 stärksten eigenen Formulierungen des Lernenden (wörtlich, nicht zusammengefasst). Wächst als persönliche Timeline. Nächste Session beginnt mit offener Frage der letzten. Keine KI-Texte, keine Fortschrittsbalken.", status: "planned", month: "juni", chapter: "Kap. 3 · Kap. 4 · Kap. 6", tags: ["AI","UX","Studie","Psychometrie"], agents: ["ai-engineer","ux-designer","psychologist","didaktiker"], aufwand: "4h", week: 4, icon: BookOpen },

  // ── JULI ──
  { title: "Chat Core mit SSE-Streaming", desc: "Echtzeit-Textstrom via Server-Sent Events, React Query für State, Message-History in PostgreSQL.", status: "planned", month: "juli", chapter: "Kap. 4", tags: ["Backend","Frontend"], agents: ["ai-engineer","architect","ux-designer"], aufwand: "5h", icon: MessageSquare },
  { title: "Prompt-Management in DB", desc: "Sokratische Prompt-Templates in PostgreSQL, Jinja2-Rendering, live editierbar — Study-Lock bei STUDY_MODE=locked.", status: "planned", month: "juli", chapter: "Kap. 3 · Kap. 4", tags: ["AI","Backend"], agents: ["ai-engineer","mlops","architect"], aufwand: "3h", icon: Brain },
  { title: "LLM Single API (Claude · GPT-4o · Mistral)", desc: "Gemeinsames Abstraktions-Interface für alle drei LLMs — versionierte Model-IDs, DPAs vor Integration.", status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 5", tags: ["AI","LLM-Eval"], agents: ["ai-engineer","security","mlops"], aufwand: "4h", icon: Zap },
  { title: "LLM-Evaluation (synthetische Daten)", desc: "Vergleich Claude/GPT-4o/Mistral: Empathiequalität, Sokratik, Konsistenz, Datenschutz — VOR Studienstart.", status: "planned", month: "juli", chapter: "Kap. 5", tags: ["LLM-Eval","Wissenschaft"], agents: ["ai-engineer","mlops","psychologist"], aufwand: "6h", icon: FlaskConical },
  { title: "Zwei Interaktionsmodi", desc: "Modus A: rein sokratisch (nur Fragen). Modus B: unterstützend. Operationalisierung mit Psychologen.", status: "planned", month: "juli", chapter: "Kap. 3", tags: ["AI","Psychologie"], agents: ["ai-engineer","psychologist"], aufwand: "3h", icon: Brain },
  { title: "Character-System", desc: "10 KAIA-Charaktere + Normal + Crazy (täglicher Wechsel). Aktiver Charakter sichtbar, User kann wechseln.", status: "planned", month: "juli", chapter: "Kap. 3", tags: ["AI","UX"], agents: ["ai-engineer","ux-designer","psychologist"], aufwand: "4h", icon: Sparkles },
  { title: "Zwei-Schicht-Gedächtnis", desc: "PostgreSQL (strukturiert) + pgvector (semantisch) — Row-Level-Security, user_id als Pflichtparameter.", status: "planned", month: "juli", chapter: "Kap. 3 · Kap. 4", tags: ["AI","Security","DB"], agents: ["architect","security","ai-engineer"], aufwand: "4h", icon: Database },
  { title: "KAIA Cross-Session-Gedächtnis", desc: "KAIA referenziert frühere Sessions natürlich im Gespräch. Semantische Suche via pgvector.", status: "planned", month: "juli", chapter: "Kap. 3", tags: ["AI"], agents: ["ai-engineer","architect"], aufwand: "3h", icon: Brain },
  { title: "30-Tage-Zugangs-Timer", desc: "Jede Tester:in hat 30 Tage Zugang ab Freischaltung. Im Admin sichtbar + manuell verlängerbar.", status: "planned", month: "juli", chapter: "Kap. 6", tags: ["Admin","Studie"], agents: ["product-owner","ux-designer"], aufwand: "1h", icon: Calendar },
  { title: "Token-Budget pro User", desc: "Standard $5/User. Im Admin individuell anpassbar — Übersicht mit verbrauchtem Budget in Echtzeit.", status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 6", tags: ["Admin","Cost"], agents: ["mlops","product-owner"], aufwand: "2h", icon: BarChart3 },
  { title: "SMTP + E-Mail-System", desc: "Passwort-Reset, Benachrichtigung bei Freigabe, opt. Reminder. Hetzner SMTP oder Postmark.", status: "planned", month: "juli", chapter: "Kap. 4", tags: ["Backend"], agents: ["architect","security"], aufwand: "2h", icon: Mail },
  { title: "Study-Lock + LLM Model-Pinning", desc: "STUDY_MODE=locked blockiert CI bei Prompt-Änderungen. Jedes Modell mit expliziter versionierter Model-ID.", status: "planned", month: "juli", chapter: "Kap. 4 · Kap. 5", tags: ["Studie","AI"], agents: ["mlops","ai-engineer","security"], aufwand: "1h", icon: Lock },

  // ── AUGUST ──
  { title: "GSE Post-Measurement + Visualisierung", desc: "GSE nach Studienende (10 Items). Prä/Post-Vergleich grafisch, PDF-Download, opt-in Sharing.", status: "planned", month: "august", chapter: "Kap. 6", tags: ["Psychometrie","Studie"], agents: ["psychologist","ux-designer"], aufwand: "4h", icon: BarChart3 },
  { title: "Per-Session Structured Observation", desc: "Nach jeder Session: neuroadaptiver Modus, Sentiment, Selbstwirksamkeitseinschätzung automatisch gespeichert.", status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6", tags: ["AI","Analytics"], agents: ["ai-engineer","psychologist","mlops"], aufwand: "3h", icon: Target },
  { title: "LLM-Transcript-Analyse", desc: "Fremdwahrnehmung aus Transkripten: Handlungskontrolle, Problemlösezuversicht, Bewältigungserwartung.", status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6", tags: ["AI","Psychologie"], agents: ["ai-engineer","ai-ethics","psychologist"], aufwand: "5h", icon: Brain },
  { title: "Konvergenz/Divergenz-Visualisierung", desc: "Zeitreihe: Selbstwahrnehmung (GSE) vs. Fremdwahrnehmung (LLM-Analyse) — Basis für Thesis-Ergebnisse.", status: "planned", month: "august", chapter: "Kap. 3 · Kap. 6", tags: ["Analytics","Wissenschaft"], agents: ["ux-designer","psychologist"], aufwand: "3h", icon: BarChart3 },
  { title: "Feedback/Wünsche-Seite", desc: "Alle eingeloggten User sehen und schreiben Feedback. Admin labelt: Roadmap / In Entwicklung / Abgelehnt.", status: "planned", month: "august", chapter: "Kap. 6", tags: ["Frontend","Studie"], agents: ["ux-designer","product-owner"], aufwand: "2h", icon: MessageSquare },
  { title: "Admin Analytics Dashboard", desc: "Nutzungsstatistiken: Login-Zeit, Chat-Dauer, Topics, Token-Verbrauch — nur mit consent_analytics=true.", status: "planned", month: "august", chapter: "Kap. 4 · Kap. 6", tags: ["Admin","Analytics","DSGVO"], agents: ["mlops","compliance","ux-designer"], aufwand: "4h", icon: BarChart3 },
  { title: "DSGVO Art. 15–21 vollständig", desc: "Auskunftsrecht, Löschrecht, Berichtigung, Portabilität, Widerspruch — Self-Service im Profil.", status: "planned", month: "august", chapter: "Kap. 6", tags: ["DSGVO"], agents: ["compliance","ux-designer"], aufwand: "3h", icon: FileText },
  { title: "Easter Eggs", desc: "Versteckte Überraschungen auf 404, Loading, Edge Cases — Admin wird per Slack notifiziert.", status: "planned", month: "august", tags: ["UX"], agents: ["ux-designer"], aufwand: "1h", icon: Sparkles },

  // ── IDEEN / BACKLOG ──
  { title: "Reminder-System", desc: "Automatische Erinnerungen für Tester:innen (Mail oder In-App). Frequenz mit Psychologen abstimmen.", status: "idea", month: "ideas", chapter: "evtl. Kap. 6", tags: ["UX","Psychologie"], agents: ["psychologist","ux-designer","product-owner"], aufwand: "2h", icon: Mail },
  { title: "Surprise Mode", desc: "KAIA verhält sich unerwartet anders — ethische Fragen (Transparenz, Vertrauen) mit Psychologen klären.", status: "idea", month: "ideas", chapter: "evtl. Kap. 3", tags: ["AI","Psychologie"], agents: ["ai-ethics","psychologist"], icon: HelpCircle },
]

// ── Status / Tag config ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  done:    { label: "Fertig",          cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", bar: "bg-emerald-500",         icon: CheckCircle2 },
  active:  { label: "In Entwicklung", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",           bar: "bg-blue-500",             icon: Clock },
  planned: { label: "Geplant",        cls: "bg-muted text-muted-foreground border-border",                                  bar: "bg-muted-foreground/40",  icon: Calendar },
  idea:    { label: "Idee",           cls: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",    bar: "bg-violet-500",           icon: Lightbulb },
  blocker: { label: "Blocker",        cls: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",               bar: "bg-red-500",              icon: AlertTriangle },
}

const TAG_COLORS: Record<string, string> = {
  DSGVO:       "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Ethik:       "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
  Security:    "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  Psychometrie:"bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Psychologie: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
  Wissenschaft:"bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
  "LLM-Eval":  "bg-cyan-500/10 text-cyan-700 border-cyan-500/20 dark:text-cyan-400",
  Studie:      "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-400",
  AI:          "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  Analytics:   "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  Rechtlich:   "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-400",
}

const SCIENCE_OBLIGATIONS = [
  { label: "Crisis-Detection",              detail: "Keyword-Filter vor LLM — Eskalationshinweis Telefonseelsorge",         done: true,  critical: true  },
  { label: "Ethikvotum SRH",               detail: "Antrag noch nicht eingereicht — Woche 3 Juni geplant",                  done: false, critical: true  },
  { label: "KI-Disclosure",                detail: "/ki-disclosure Seite + disclosure-ack Endpoint implementiert",           done: true,  critical: true  },
  { label: "Multi-Step-Consent",           detail: "2 getrennte Checkboxen: Datenverarbeitung + Analytics",                  done: true,  critical: false },
  { label: "Datenschutzerklärung",         detail: "/datenschutz mit allen Art. 15–21 Rechten, Schrems-II, Löschfrist",      done: true,  critical: false },
  { label: "Studienprotokoll (v1.0)",      detail: "docs/STUDIENPROTOKOLL.md — Forschungsfrage, H1–H3, Power-Analyse",       done: true,  critical: false },
  { label: "Einwilligungserklärung",       detail: "docs/TEILNAHMEVEREINBARUNG.md — druckfertig",                            done: true,  critical: false },
  { label: "Pre-Registration OSF.io",      detail: "Geplant KW 3 Juni — VOR Datensicht Pflicht",                             done: false, critical: false },
  { label: "Power-Analyse G*Power/R",      detail: "docs/power_analyse.R — N=32 (80% Power), Rekrutierungsziel 46",          done: true,  critical: false },
  { label: "LLM Model-Pinning",            detail: "Immer versionierte IDs — nie generisch",                                 done: false, critical: false },
  { label: "Study-Lock",                   detail: "Prompt-Freeze während Datenerhebung (STUDY_MODE=locked)",                done: false, critical: false },
  { label: "pgvector Row-Level-Security",  detail: "user_id als Pflichtparameter, kein Cross-User-Leak",                    done: false, critical: false },
  { label: "DPAs Anthropic/OpenAI/Mistral",detail: "Geplant KW 4 Juni — vor Studienstart",                                  done: false, critical: false },
  { label: "LLM-Evaluationsbericht",       detail: "Claude vs. GPT-4o vs. Mistral nach definierten Kriterien",              done: false, critical: false },
]

const THESIS_CHAPTERS = [
  { num: "Kap. 1", title: "Einleitung & Motivation",        color: "text-slate-500"   },
  { num: "Kap. 2", title: "Theoretischer Hintergrund",      color: "text-violet-500"  },
  { num: "Kap. 3", title: "Konzeptionelles Rahmenwerk",     color: "text-sky-500"     },
  { num: "Kap. 4", title: "Technische Implementierung",     color: "text-emerald-500" },
  { num: "Kap. 5", title: "LLM-Evaluationsbericht",         color: "text-cyan-500"    },
  { num: "Kap. 6", title: "Pilotstudie & Evaluation",       color: "text-orange-500"  },
]

// ── Date helpers ──────────────────────────────────────────────────────────────

const DE_DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const DE_MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

function getNext7Days(from: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    return d
  })
}

function fmtDay(d: Date) {
  return `${DE_DAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`
}

function isToday(d: Date, today: Date) {
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
}

function isPast(d: Date, today: Date) {
  return d < today && !isToday(d, today)
}

function juniWeekRange(week: 1 | 2 | 3 | 4) {
  const ranges: Record<number, string> = { 1: "1.–7. Juni", 2: "8.–14. Juni", 3: "15.–21. Juni", 4: "22.–30. Juni" }
  return ranges[week]
}

function currentJuniWeek(today: Date): number {
  if (today.getMonth() !== 5) return 0 // not June
  const d = today.getDate()
  if (d <= 7) return 1
  if (d <= 14) return 2
  if (d <= 21) return 3
  return 4
}

// ── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ f, compact }: { f: Feature; compact?: boolean }) {
  const s = STATUS_CONFIG[f.status]
  const Icon = f.icon ?? Zap
  return (
    <div className="rounded-lg border border-border bg-background hover:bg-muted/20 transition-colors p-3 space-y-2 group">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 p-1 rounded bg-muted shrink-0">
          <Icon className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium leading-tight">{f.title}</span>
            <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${s.cls}`}>
              <s.icon className="h-2.5 w-2.5" />{s.label}
            </span>
          </div>
          {!compact && <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/50 pt-1.5">
        {f.chapter && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{f.chapter}</span>
          </div>
        )}
        {f.aufwand && (
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{f.aufwand}</span>
          </div>
        )}
        {f.sha && (
          <div className="flex items-center gap-1">
            <GitCommit className="h-2.5 w-2.5 text-muted-foreground" />
            <code className="text-xs text-muted-foreground font-mono">{f.sha}</code>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {f.tags?.map((tag) => (
          <span key={tag} className={`inline-flex items-center rounded border px-1 py-0.5 text-xs font-medium ${TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"}`}>{tag}</span>
        ))}
        {f.agents?.map((a) => {
          const ac = AGENT_CONFIG[a]
          return <span key={a} className={`inline-flex items-center rounded border px-1 py-0.5 text-xs ${ac.cls}`}>{ac.label}</span>
        })}
      </div>
    </div>
  )
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({ label, options, active, onChange }: {
  label: string
  options: { value: T; label: string; cls?: string }[]
  active: T[]
  onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  function toggle(v: T) { onChange(active.includes(v) ? active.filter((x) => x !== v) : [...active, v]) }
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-pointer ${active.length > 0 ? "border-foreground/40 bg-foreground/5 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
        {label}
        {active.length > 0 && <span className="inline-flex items-center justify-center rounded-full bg-foreground text-background text-xs font-bold h-4 w-4">{active.length}</span>}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-44 rounded-lg border border-border bg-background shadow-lg py-1">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/40 transition-colors">
              <input type="checkbox" checked={active.includes(opt.value)} onChange={() => toggle(opt.value)} className="h-3.5 w-3.5 rounded border-border accent-foreground cursor-pointer" />
              {opt.cls ? <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${opt.cls}`}>{opt.label}</span> : <span className="text-sm">{opt.label}</span>}
            </label>
          ))}
          {active.length > 0 && (<>
            <div className="my-1 border-t border-border" />
            <button onClick={() => { onChange([]); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3 w-3" /> Zurücksetzen
            </button>
          </>)}
        </div>
      )}
    </div>
  )
}

// ── Science Section ───────────────────────────────────────────────────────────

function ScienceSection() {
  const [open, setOpen] = useState(false)
  const done = SCIENCE_OBLIGATIONS.filter((o) => o.done).length
  const critical = SCIENCE_OBLIGATIONS.filter((o) => o.critical && !o.done).length
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Wissenschaftliche Pflichten</span>
          <span className="text-xs text-muted-foreground font-mono">{done}/{SCIENCE_OBLIGATIONS.length} erfüllt</span>
          {critical > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />{critical} Blocker
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {SCIENCE_OBLIGATIONS.map((o) => (
            <div key={o.label} className={`flex items-start gap-3 px-5 py-3 transition-colors ${o.done ? "bg-emerald-500/5" : o.critical ? "bg-red-500/5 hover:bg-red-500/10" : "hover:bg-muted/20"}`}>
              {o.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : o.critical ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${o.done ? "line-through text-muted-foreground" : o.critical ? "text-red-600 dark:text-red-400" : ""}`}>{o.label}</span>
                  {o.critical && !o.done && <span className="text-xs text-red-500 font-medium">· Pflicht für Ethikvotum</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{o.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Week Section (collapsible) ────────────────────────────────────────────────

function WeekSection({ label, range, features, defaultOpen = false }: { label: string; range: string; features: Feature[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{range}</span>
          <span className="text-xs font-mono text-muted-foreground">{features.length} Features</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {features.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-full text-center py-4">Keine Features für diese Woche</p>
          ) : features.map((f) => <FeatureCard key={f.title} f={f} />)}
        </div>
      )}
    </div>
  )
}

// ── Month Section (collapsible) ───────────────────────────────────────────────

function MonthSection({ title, subtitle, accentCls, features, defaultOpen = false }: { title: string; subtitle: string; accentCls: string; features: Feature[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-4 py-3 border-l-4 ${accentCls} hover:bg-muted/20 transition-colors`}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
          <span className="text-xs font-mono text-muted-foreground">{features.length} Features</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {features.map((f) => <FeatureCard key={f.title} f={f} />)}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const today = new Date()
  const next7 = getNext7Days(today)
  const curWeek = currentJuniWeek(today)
  const isJune = today.getMonth() === 5

  const [activeStatuses, setActiveStatuses] = useState<Status[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([])

  const allTags   = useMemo(() => [...new Set(FEATURES.flatMap((f) => f.tags ?? []))].sort(), [])
  const allAgents = useMemo(() => [...new Set(FEATURES.flatMap((f) => f.agents ?? []))].sort() as AgentId[], [])

  const filtered = useMemo(() => FEATURES.filter((f) => {
    if (activeStatuses.length && !activeStatuses.includes(f.status)) return false
    if (activeTags.length && !activeTags.some((t) => f.tags?.includes(t))) return false
    if (activeAgents.length && !activeAgents.some((a) => f.agents?.includes(a))) return false
    return true
  }), [activeStatuses, activeTags, activeAgents])

  const hasFilter = activeStatuses.length > 0 || activeTags.length > 0 || activeAgents.length > 0

  const stats = {
    done:     FEATURES.filter((f) => f.status === "done").length,
    active:   FEATURES.filter((f) => f.status === "active").length,
    planned:  FEATURES.filter((f) => f.status === "planned").length,
    ideas:    FEATURES.filter((f) => f.status === "idea").length,
    blockers: FEATURES.filter((f) => f.status === "blocker").length,
  }

  // Sprint features (next 7 days) — sprint=true or active, in current month
  const sprintFeatures = filtered.filter((f) => f.sprint || f.status === "active")

  // Group sprint by day (for the 7-day view)
  const sprintByDay = (day: number) => sprintFeatures.filter((f) => f.day === day)
  const sprintUnscheduled = sprintFeatures.filter((f) => !f.day)

  // Juni features by week
  const juniFeatures = (week: 1|2|3|4) => filtered.filter((f) => f.month === "juni" && f.week === week)
  const juniUnassigned = filtered.filter((f) => f.month === "juni" && !f.week)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">Produktroadmap</h1>
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {DE_DAYS[today.getDay()]} {today.getDate()}. {DE_MONTHS[today.getMonth()]} {today.getFullYear()}
          </span>
          <span className="text-xs text-muted-foreground">7 Tage · Monatssicht · Fertig</span>
        </div>
        <p className="text-muted-foreground text-sm">KAIA Pilotstudie — kein Wochenende, jeder Tag zählt</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {([["done","Fertig","text-emerald-500"],["active","Aktiv","text-blue-500"],["planned","Geplant","text-muted-foreground"],["ideas","Ideen","text-violet-500"],["blockers","Blocker","text-red-500"]] as const).map(([k,label,cls]) => (
          <div key={k} className="rounded-lg border border-border p-3 space-y-0.5">
            <p className={`text-xl font-bold ${cls}`}>{stats[k as keyof typeof stats]}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Science obligations */}
      <ScienceSection />

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium mr-1">Filter:</span>
        <FilterDropdown
          label="Status"
          options={(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([k,v]) => ({ value: k, label: v.label, cls: v.cls }))}
          active={activeStatuses} onChange={setActiveStatuses}
        />
        <FilterDropdown
          label="Tags"
          options={allTags.map((tag) => ({ value: tag, label: tag, cls: TAG_COLORS[tag] }))}
          active={activeTags} onChange={setActiveTags}
        />
        <FilterDropdown
          label="Agents"
          options={allAgents.map((a) => ({ value: a, label: AGENT_CONFIG[a].label, cls: AGENT_CONFIG[a].cls }))}
          active={activeAgents} onChange={setActiveAgents}
        />
        {hasFilter && (
          <button onClick={() => { setActiveStatuses([]); setActiveTags([]); setActiveAgents([]) }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">
            <X className="h-3 w-3" /> Zurücksetzen
          </button>
        )}
      </div>

      {/* ── NÄCHSTE 7 TAGE ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-sm font-semibold">Nächste 7 Tage</h2>
          <span className="text-xs text-muted-foreground">
            {fmtDay(next7[0])} – {fmtDay(next7[6])}
          </span>
        </div>

        {/* Day strip */}
        <div className="grid grid-cols-7 gap-1">
          {next7.map((d, i) => {
            const dayFeatures = sprintByDay(d.getDate())
            const todayMark = isToday(d, today)
            const pastMark = isPast(d, today)
            return (
              <div key={i} className={`rounded-lg border p-2 min-h-20 space-y-1.5 ${todayMark ? "border-blue-500/50 bg-blue-500/5" : pastMark ? "border-border/50 bg-muted/20 opacity-60" : "border-border"}`}>
                <div className={`text-xs font-medium text-center ${todayMark ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
                  {fmtDay(d)}
                  {todayMark && <span className="ml-1 text-xs">●</span>}
                </div>
                {dayFeatures.map((f) => {
                  const Icon = f.icon ?? Zap
                  return (
                    <div key={f.title} className="rounded bg-background border border-border px-1.5 py-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Icon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span className="text-xs leading-tight line-clamp-2">{f.title}</span>
                      </div>
                      {f.aufwand && <span className="text-xs text-muted-foreground">{f.aufwand}</span>}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Unscheduled sprint features */}
        {sprintUnscheduled.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Diese Woche — noch nicht terminiert</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {sprintUnscheduled.map((f) => <FeatureCard key={f.title} f={f} />)}
            </div>
          </div>
        )}

        {sprintFeatures.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
            Keine Sprint-Features — markiere Features mit sprint=true
          </p>
        )}
      </div>

      {/* ── JUNI — WOCHENWEISE ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isJune ? "bg-blue-500 animate-pulse" : "bg-muted-foreground"}`} />
          <h2 className="text-sm font-semibold">Juni 2026 — Wochenweise</h2>
        </div>
        {([1,2,3,4] as const).map((w) => (
          <WeekSection
            key={w}
            label={`Woche ${w}`}
            range={juniWeekRange(w)}
            features={juniFeatures(w)}
            defaultOpen={isJune && curWeek === w}
          />
        ))}
        {juniUnassigned.length > 0 && (
          <WeekSection label="Juni — nicht zugeordnet" range="ohne Woche" features={juniUnassigned} />
        )}
      </div>

      {/* ── JULI ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Juli 2026</h2>
        <MonthSection title="Juli 2026" subtitle="Chat · LLM · Gedächtnis · Characters · Budget" accentCls="border-violet-500" features={filtered.filter((f) => f.month === "juli")} />
      </div>

      {/* ── AUGUST ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">August 2026</h2>
        <MonthSection title="August 2026" subtitle="GSE End · Analytics · DSGVO · Pre-Reg" accentCls="border-orange-500" features={filtered.filter((f) => f.month === "august")} />
      </div>

      {/* ── BACKLOG ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Backlog</h2>
        <MonthSection title="Ideen" subtitle="noch ohne Termin" accentCls="border-violet-400" features={filtered.filter((f) => f.month === "ideas")} />
      </div>

      {/* ── FERTIG ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Fertig</h2>
        <MonthSection title="Bereits abgeschlossen" subtitle={`${filtered.filter((f) => f.month === "done").length} Features`} accentCls="border-emerald-500" features={filtered.filter((f) => f.month === "done")} />
      </div>

      {/* ── THESIS CHAPTER MAPPING ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          Thesis-Kapitel-Mapping
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-3 divide-y divide-border lg:divide-y-0 lg:divide-x">
            {THESIS_CHAPTERS.map((ch) => {
              const chFeatures = FEATURES.filter((f) => f.chapter?.includes(ch.num))
              return (
                <div key={ch.num} className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${ch.color}`}>{ch.num}</span>
                    <span className="text-xs font-medium">{ch.title}</span>
                  </div>
                  <div className="space-y-0.5">
                    {chFeatures.slice(0, 4).map((f) => (
                      <div key={f.title} className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[f.status].bar} shrink-0`} />
                        <span className="text-xs text-muted-foreground truncate">{f.title}</span>
                      </div>
                    ))}
                    {chFeatures.length > 4 && <span className="text-xs text-muted-foreground">+{chFeatures.length - 4} weitere</span>}
                    {chFeatures.length === 0 && <span className="text-xs text-muted-foreground italic">Theoretische Grundlagen</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── STUDIENZIEL ── */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Studienziel</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Studie</p><p>N=32 Teilnehmende (Rekrutierungsziel 46), 3 Sessions über 4 Wochen.</p></div>
          <div><p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Datenhaltung</p><p>6 Monate nach Studienende automatisch gelöscht.</p></div>
          <div><p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Token-Budget</p><p>Standard $5/User. Individuell anpassbar im Admin.</p></div>
        </div>
      </div>
    </div>
  )
}
