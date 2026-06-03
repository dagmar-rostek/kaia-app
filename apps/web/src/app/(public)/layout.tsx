import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

const NAV = [
  { href: "/release-notes", label: "Release Notes" },
  { href: "/architektur", label: "Architektur" },
  { href: "/wissenschaft", label: "Wissenschaft" },
  { href: "/datenschutz", label: "Datenschutz" },
]

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
          KAIA
        </Link>
        <nav className="flex items-center gap-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </header>
      {children}
    </div>
  )
}
