import { NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API}/v1/admin/simulation/runs`, { headers: adminHeaders() })
    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API nicht erreichbar"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
