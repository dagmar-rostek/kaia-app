import { NextRequest, NextResponse } from "next/server"

const INTERNAL_API = process.env.INTERNAL_API_URL ?? "http://localhost:8000/api"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ""

export async function DELETE(req: NextRequest) {
  const { id } = await req.json() as { id: string }
  if (!id) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const res = await fetch(`${INTERNAL_API}/v1/preregister/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` },
    })
    if (!res.ok) return NextResponse.json({ ok: false }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
