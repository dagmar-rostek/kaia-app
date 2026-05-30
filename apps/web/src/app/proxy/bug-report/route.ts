import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API = process.env.INTERNAL_API_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${INTERNAL_API}/api/v1/bug-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: res.status })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
