import { type NextRequest, NextResponse } from "next/server"

async function expectedToken(): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ADMIN_PASSWORD ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode("kaia-admin-v1"))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("kaia_admin")?.value
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url))
    const expected = await expectedToken()
    if (token !== expected) return NextResponse.redirect(new URL("/admin/login", request.url))
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
  matcher: ["/admin/:path*", "/chat/:path*", "/onboarding/:path*", "/gse/:path*"],
}
