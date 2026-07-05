import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ run_id: string }> }
): Promise<NextResponse> {
  const { run_id } = await params
  try {
    const body = await req.json()
    const res = await fetch(`${API}/v1/admin/eval/runs/${run_id}/retest`, {
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
