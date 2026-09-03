import { type NextRequest, NextResponse } from "next/server"

const STUDY_CLOSED = process.env.STUDY_CLOSED === "true"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // App-Routen — kaia_session als Session-Indikator (gesetzt bei Login/Refresh)
  if (
    pathname.startsWith("/chat") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/gse")
  ) {
    if (STUDY_CLOSED) {
      return NextResponse.redirect(new URL("/pilotstudie-abschluss", request.url))
    }
    const session = request.cookies.get("kaia_session")?.value
    if (!session) return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/chat/:path*", "/onboarding/:path*", "/gse/:path*"],
}
