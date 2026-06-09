import { NextResponse } from "next/server"

export async function POST(): Promise<NextResponse> {
  const internalUrl = process.env.INTERNAL_API_URL ?? "http://api:8000"
  const adminPassword = process.env.ADMIN_PASSWORD ?? ""

  const res = await fetch(`${internalUrl}/api/v1/admin/test-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminPassword}` },
  })

  if (!res.ok) {
    const body = await res.text()
    return NextResponse.json({ error: body }, { status: res.status })
  }

  const data = await res.json() as { access_token: string }
  return NextResponse.json(data)
}
