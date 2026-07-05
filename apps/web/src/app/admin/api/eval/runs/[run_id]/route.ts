import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ run_id: string }> }
): Promise<NextResponse> {
  const { run_id } = await params
  try {
    const res = await fetch(`${API}/v1/admin/eval/runs/${run_id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    })
    const body = await res.text()
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API nicht erreichbar"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
