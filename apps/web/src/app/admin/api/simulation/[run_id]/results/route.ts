import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ run_id: string }> },
): Promise<NextResponse> {
  const { run_id } = await params
  const internalUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
  const adminPassword = process.env.ADMIN_PASSWORD ?? ""

  try {
    const res = await fetch(`${internalUrl}/v1/admin/simulation/results/${run_id}`, {
      headers: { Authorization: `Bearer ${adminPassword}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ error: body }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
