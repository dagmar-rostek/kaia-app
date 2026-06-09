import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { logoutAction } from "./actions"
import { LayoutDashboard, CheckSquare, ScrollText, Network, Euro, BookOpen, LogOut, Map, Users, GraduationCap, Sparkles, ClipboardList, MessageSquare } from "lucide-react"

const NAV = [
  { href: "/admin", label: "Übersicht", icon: LayoutDashboard },
  { href: "/admin/chat-test", label: "Chat testen", icon: MessageSquare },
  { href: "/admin/users", label: "Teilnehmende", icon: Users },
  { href: "/admin/vorregistrierung", label: "Voranmeldungen", icon: ClipboardList },
  { href: "/admin/roadmap", label: "Roadmap", icon: Map },
  { href: "/admin/prompts", label: "Prompts & Sandbox", icon: Sparkles },
  { href: "/admin/thesis", label: "Masterthesis", icon: GraduationCap },
  { href: "/admin/production-readiness", label: "Production Readiness", icon: CheckSquare },
  { href: "/admin/release-notes", label: "Release Notes", icon: ScrollText },
  { href: "/admin/architektur", label: "Architektur", icon: Network },
  { href: "/admin/kosten", label: "Kosten", icon: Euro },
  { href: "/admin/daily-log", label: "Tagebuch", icon: BookOpen },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <span className="font-semibold text-sm tracking-tight">KAIA Admin</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-border space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">Design</span>
            <ThemeToggle />
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Abmelden
            </button>
          </form>
          <div className="px-3 pt-2 flex gap-3 text-xs text-muted-foreground/60">
            <Link href="/impressum" className="hover:text-muted-foreground transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-muted-foreground transition-colors">Datenschutz</Link>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
