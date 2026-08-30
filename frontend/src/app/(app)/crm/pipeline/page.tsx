"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { toast } from "sonner"
import axios from "axios"

import { Skeleton } from "@/components/ui/skeleton"
import { getPipeline, moveOpportunityStage } from "@/features/opportunities/api"
import type { PipelineStage } from "@/features/opportunities/types"
import { StageColumn } from "./stage-column"

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const fetchPipeline = useCallback(() => {
    setIsLoading(true)
    getPipeline()
      .then(({ data }) => setStages(data))
      .catch(() => toast.error("No se pudo cargar el pipeline"))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const opportunityId = Number(active.id)
    const newStageId = Number(over.id)

    const currentStage = stages.find((stage) =>
      stage.opportunities.some((o) => o.id === opportunityId)
    )
    if (!currentStage || currentStage.id === newStageId) return

    const opportunity = currentStage.opportunities.find((o) => o.id === opportunityId)!

    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === currentStage.id) {
          return {
            ...stage,
            opportunities: stage.opportunities.filter((o) => o.id !== opportunityId),
          }
        }
        if (stage.id === newStageId) {
          return { ...stage, opportunities: [...stage.opportunities, opportunity] }
        }
        return stage
      })
    )

    try {
      await moveOpportunityStage(opportunityId, newStageId)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo mover la oportunidad")
      fetchPipeline()
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Arrastra las oportunidades entre etapas para actualizar su estado.
        </p>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn key={stage.id} stage={stage} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
