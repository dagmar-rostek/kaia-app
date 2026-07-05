import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LegalFooter } from "@/components/LegalFooter"

const NAV = [
  { href: "/mitmachen",     label: "Mitmachen" },
  { href: "/kontakt",       label: "Kontakt" },
  { href: "/tagebuch",      label: "Tagebuch" },
  { href: "/roadmap",       label: "Roadmap" },
  { href: "/wissenschaft",  label: "Wissenschaft" },
  { href: "/release-notes", label: "Release Notes" },
  { href: "/architektur",   label: "Architektur" },
  { href: "/datenschutz",   label: "Datenschutz" },
  { href: "/admin",         label: "Admin", admin: true },
] as const

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
          KAIA
        </Link>
        <nav className="flex items-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "admin" in item && item.admin
                  ? "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1 hover:bg-muted"
                  : "text-sm text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </header>
      {children}
      <LegalFooter />
    </div>
  )
}
