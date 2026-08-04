import { NextResponse } from "next/server"

const API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const adminHeaders = () => ({
  Authorization: `Bearer ${process.env.ADMIN_PASSWORD ?? ""}`,
})

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API}/v1/admin/export/participants/summary`, {
      headers: adminHeaders(),
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung zur API fehlgeschlagen"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
