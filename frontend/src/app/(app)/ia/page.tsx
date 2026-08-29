"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { askAssistant, type ChatTurn } from "@/features/ai/api"

const SUGGESTIONS = [
  "¿Qué productos tengo con stock bajo?",
  "¿Cuántas oportunidades abiertas hay y por cuánto monto?",
  "Resume los últimos movimientos de inventario.",
]

export default function IaPage() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [turns, isLoading])

  async function send(message: string) {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return

    const history = turns
    setTurns([...history, { role: "user", content: trimmed }])
    setInput("")
    setIsLoading(true)

    try {
      const { data } = await askAssistant(trimmed, history)
      setTurns((prev) => [...prev, { role: "assistant", content: data.answer }])
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { message?: string } } }
      toast.error(err.response?.data?.message ?? "No se pudo obtener respuesta del asistente.")
      setTurns((prev) => prev.slice(0, -1))
      setInput(trimmed)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Asistente IA</h2>
        <p className="text-sm text-muted-foreground">
          Pregunta sobre tus clientes, inventario y oportunidades. Solo ve los datos de tu empresa.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border p-4">
        {turns.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Prueba con:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="w-fit rounded-md border px-3 py-1.5 text-left text-sm hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {turns.map((turn, i) => (
          <div
            key={i}
            className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                turn.role === "user"
                  ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "max-w-[80%] rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap"
              }
            >
              {turn.role === "assistant" && (
                <Badge variant="secondary" className="mb-1">
                  Asistente
                </Badge>
              )}
              <div className={turn.role === "assistant" ? "whitespace-pre-wrap" : ""}>
                {turn.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Escribe tu pregunta…"
          rows={1}
          className="max-h-32 resize-none"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
