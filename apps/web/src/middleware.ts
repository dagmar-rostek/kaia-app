import { type NextRequest, NextResponse } from "next/server"

const STUDY_CLOSED = process.env.STUDY_CLOSED === "true"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (STUDY_CLOSED) {
    // Studie beendet — Chat und Mitmachen-Seiten auf Abschlussseite umleiten
    if (
      pathname.startsWith("/chat") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/gse") ||
      pathname.startsWith("/mitmachen") ||
      pathname.startsWith("/vorregistrierung")
    ) {
      return NextResponse.redirect(new URL("/pilotstudie-abschluss", request.url))
    }
  }

  // App-Routen — kaia_session als Session-Indikator (gesetzt bei Login/Refresh)
  if (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/gse")
  ) {
    const session = request.cookies.get("kaia_session")?.value
    if (!session) return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/onboarding/:path*",
    "/gse/:path*",
    "/mitmachen/:path*",
    "/mitmachen",
    "/vorregistrierung/:path*",
    "/vorregistrierung",
  ],
}
