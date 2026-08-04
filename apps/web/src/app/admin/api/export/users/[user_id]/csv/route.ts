import { NextRequest, NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
): Promise<NextResponse> {
  const { user_id } = await params
  try {
    const res = await fetch(`${API}/v1/admin/users/${user_id}/export/csv`, {
      headers: adminHeaders(),
    })
    if (!res.ok) {
      return NextResponse.json({ error: "CSV-Export fehlgeschlagen" }, { status: res.status })
    }
    const buffer = await res.arrayBuffer()
    const contentDisposition =
      res.headers.get("Content-Disposition") ?? `attachment; filename="kaia_export_${user_id}.csv"`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": contentDisposition,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
