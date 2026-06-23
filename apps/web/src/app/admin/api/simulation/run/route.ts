import { NextResponse } from "next/server"

export async function POST(): Promise<NextResponse> {
  const internalUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
  const adminPassword = process.env.ADMIN_PASSWORD ?? ""

  try {
    const res = await fetch(`${internalUrl}/v1/admin/simulation/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminPassword}` },
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
