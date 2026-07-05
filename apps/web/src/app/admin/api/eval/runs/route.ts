import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API}/v1/admin/eval/runs`, { headers: adminHeaders() })
    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API nicht erreichbar"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const res = await fetch(`${API}/v1/admin/eval/runs`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(body),
    })
    const resBody = await res.text()
    return new NextResponse(resBody, { status: res.status, headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API nicht erreichbar"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
