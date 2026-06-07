import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
          KAIA
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
