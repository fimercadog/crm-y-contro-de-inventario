"use client"

import { useDroppable } from "@dnd-kit/core"

import { Badge } from "@/components/ui/badge"
import type { PipelineStage } from "@/features/opportunities/types"
import { OpportunityCard } from "./opportunity-card"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

export function StageColumn({ stage }: { stage: PipelineStage }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  const total = stage.opportunities.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{stage.name}</h3>
          <Badge variant="secondary">{stage.opportunities.length}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{currency.format(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-40 flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors ${
          isOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        {stage.opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
        {stage.opportunities.length === 0 && (
          <p className="p-2 text-center text-xs text-muted-foreground">Sin oportunidades</p>
        )}
      </div>
    </div>
  )
}
