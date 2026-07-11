"use client"

import { useState, useTransition } from "react"
import { setUserModel } from "./actions"

const MODELS = [
  { id: "", label: "System-Standard" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini" },
  { id: "mistral-large-latest", label: "Mistral Large" },
  { id: "mistral-small-latest", label: "Mistral Small" },
]

function modelColor(model: string | null) {
  if (!model) return "text-zinc-400"
  if (model.includes("claude")) return "text-blue-400"
  if (model.includes("gpt") || model.includes("gpt-5")) return "text-green-400"
  if (model.includes("mistral")) return "text-purple-400"
  return "text-zinc-400"
}

export function UserModelSelector({
  userId,
  currentModel,
}: {
  userId: number
  currentModel: string | null
}) {
  const [value, setValue] = useState(currentModel ?? "")
  const [pending, startTransition] = useTransition()

  const handleChange = (newVal: string) => {
    setValue(newVal)
    startTransition(async () => {
      await setUserModel(userId, newVal || null)
    })
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={pending}
      className={`text-xs bg-transparent border border-zinc-700 rounded px-1.5 py-0.5
                  focus:outline-none focus:border-zinc-500 disabled:opacity-50
                  ${modelColor(value || null)}`}
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-200">
          {m.label}
        </option>
      ))}
    </select>
  )
}
