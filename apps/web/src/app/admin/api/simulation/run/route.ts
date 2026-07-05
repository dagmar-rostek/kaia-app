import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown = null
    try { body = await req.json() } catch { /* no body is fine */ }

    const res = await fetch(`${API}/v1/admin/simulation/run`, {
      method: "POST",
      headers: adminHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
