import { NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ run_id: string; persona_id: string; session_number: string }> }
): Promise<NextResponse> {
  const { run_id, persona_id, session_number } = await params
  try {
    const res = await fetch(
      `${API}/v1/admin/eval/runs/${run_id}/sessions/${persona_id}/${session_number}`,
      { headers: adminHeaders() }
    )
    const body = await res.text()
    return new NextResponse(body, { status: res.status, headers: { "Content-Type": "application/json" } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API nicht erreichbar"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
