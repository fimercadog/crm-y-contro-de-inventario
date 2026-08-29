import { api } from "@/lib/api"

export type ChatRole = "user" | "assistant"

export interface ChatTurn {
  role: ChatRole
  content: string
}

export interface AskResponse {
  answer: string
  provider: "stub" | "openai" | "anthropic"
}

export function askAssistant(message: string, history: ChatTurn[]) {
  return api.post<AskResponse>("/ai/ask", { message, history })
}
