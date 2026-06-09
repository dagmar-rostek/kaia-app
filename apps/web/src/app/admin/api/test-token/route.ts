import { NextResponse } from "next/server"

export async function POST(): Promise<NextResponse> {
  const internalUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
  const adminPassword = process.env.ADMIN_PASSWORD ?? ""

  try {
    const res = await fetch(`${internalUrl}/v1/admin/test-token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminPassword}` },
    })

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ error: body }, { status: res.status })
    }

    const data = await res.json() as { access_token: string }
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
