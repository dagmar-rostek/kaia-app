import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ["/chat/:path*", "/onboarding/:path*", "/gse/:path*"],
}
