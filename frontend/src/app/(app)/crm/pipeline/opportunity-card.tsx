"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Opportunity } from "@/features/opportunities/types"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 10 }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab touch-none gap-2 py-3 shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="flex flex-col gap-2 px-3">
        <p className="text-sm font-medium">{opportunity.title}</p>
        <p className="text-xs text-muted-foreground">{opportunity.customer_name}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{currency.format(opportunity.amount)}</span>
          <Badge variant="outline">{opportunity.probability}%</Badge>
        </div>
        {opportunity.expected_close_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            {opportunity.expected_close_date}
          </div>
        )}
        {opportunity.assigned_user_name && (
          <p className="text-xs text-muted-foreground">{opportunity.assigned_user_name}</p>
        )}
      </CardContent>
    </Card>
  )
}
