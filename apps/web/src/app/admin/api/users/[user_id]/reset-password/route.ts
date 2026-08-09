import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
  "Content-Type": "application/json",
})

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
): Promise<NextResponse> {
  const { user_id } = await params
  try {
    const res = await fetch(`${API}/v1/admin/users/${user_id}/reset-password`, {
      method: "POST",
      headers: adminHeaders(),
    })
    if (!res.ok) {
      return NextResponse.json({ error: "Reset fehlgeschlagen" }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
