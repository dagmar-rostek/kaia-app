import { readFileSync, existsSync } from "fs"
import { join } from "path"

// Production: docs/ ist via Volume nach /docs gemountet
// Lokal: docs/ liegt zwei Ebenen über dem Next.js app-Verzeichnis
function resolveDocsPath(filename: string): string {
  const prod = join("/docs", filename)
  if (existsSync(prod)) return prod
  return join(process.cwd(), "../../docs", filename)
}

export function readDoc(filename: string, fallback: string): string {
  try {
    return readFileSync(resolveDocsPath(filename), "utf-8")
  } catch {
    return fallback
  }
}
