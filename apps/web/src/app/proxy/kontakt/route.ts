import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) {
    return NextResponse.json({ ok: false, error: "no webhook" }, { status: 500 })
  }

  const body = await req.json() as {
    name?: string
    kontakt?: string
    nachricht: string
    kontaktart?: string
  }

  const name     = body.name?.trim()     || "Anonym"
  const kontakt  = body.kontakt?.trim()  || "–"
  const art      = body.kontaktart       || "keine Angabe"
  const nachricht = body.nachricht?.trim() || "(leer)"

  const text = [
    `💌 *Neue Nachricht von kaia.rostek-dagmar.eu*`,
    ``,
    `*Von:* ${name}`,
    `*Kontakt:* ${kontakt} (${art})`,
    ``,
    `*Nachricht:*`,
    `> ${nachricht.replace(/\n/g, "\n> ")}`,
  ].join("\n")

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
