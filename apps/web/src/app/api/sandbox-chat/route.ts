import { NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface RequestBody {
  system: string
  messages: ChatMessage[]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 })
  }

  const body = await req.json() as RequestBody
  const { system, messages } = body

  if (!system || !messages?.length) {
    return NextResponse.json({ error: "system and messages required" }, { status: 400 })
  }

  // Keep last 10 messages to stay within context
  const recentMessages = messages.slice(-10)

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 256,   // short responses per design
      system,
      messages: recentMessages,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: response.status })
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }
  const content = data.content?.[0]?.text ?? ""

  return NextResponse.json({ content })
}
