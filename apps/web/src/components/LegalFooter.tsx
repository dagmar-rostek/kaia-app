import Link from "next/link"

export function LegalFooter() {
  return (
    <footer className="w-full border-t border-border bg-muted/20 px-6 py-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
      <Link href="/impressum" className="hover:text-foreground transition-colors">
        Impressum
      </Link>
      <span aria-hidden>·</span>
      <Link href="/datenschutz" className="hover:text-foreground transition-colors">
        Datenschutz
      </Link>
      <span aria-hidden>·</span>
      <span>© KAIA 2026</span>
    </footer>
  )
}
