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
    console.error("[sandbox-chat] ANTHROPIC_API_KEY not set in web container")
    return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt — bitte in der .env setzen und Web neu deployen" }, { status: 500 })
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
  const raw = data.content?.[0]?.text ?? ""

  // Strip <thinking>...</thinking> blocks — internal reasoning, never shown to user
  const withoutThinking = raw.replace(/<thinking>[\s\S]*?<\/thinking>/g, "").trim()

  // Extract <final_answer> content if present, otherwise use stripped text
  const finalAnswerMatch = withoutThinking.match(/<final_answer>([\s\S]*?)<\/final_answer>/)
  const content = finalAnswerMatch ? finalAnswerMatch[1].trim() : withoutThinking

  return NextResponse.json({ content })
}
