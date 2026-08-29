import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { Opportunity, PipelineStage } from "@/features/opportunities/types"

export interface OpportunityListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  stage_id?: number
  sort?: string
  direction?: "asc" | "desc"
}

export function listOpportunities(params: OpportunityListParams) {
  return api.get<PaginatedResponse<Opportunity>>("/opportunities", { params })
}

export function getOpportunity(id: number) {
  return api.get<{ data: Opportunity }>(`/opportunities/${id}`)
}

export type OpportunityPayload = Omit<
  Opportunity,
  | "id"
  | "created_at"
  | "updated_at"
  | "customer_name"
  | "stage_name"
  | "assigned_user_name"
  | "items"
>

export interface OpportunityItemPayload {
  product_id: number
  quantity: number
  unit_price?: number | null
  discount_amount?: number | null
}

export type SaveOpportunityPayload = Partial<OpportunityPayload> & {
  items?: OpportunityItemPayload[]
}

export function createOpportunity(payload: SaveOpportunityPayload) {
  return api.post<{ data: Opportunity }>("/opportunities", payload)
}

export function updateOpportunity(id: number, payload: SaveOpportunityPayload) {
  return api.put<{ data: Opportunity }>(`/opportunities/${id}`, payload)
}

export function deleteOpportunity(id: number) {
  return api.delete(`/opportunities/${id}`)
}

export function moveOpportunityStage(id: number, stageId: number) {
  return api.patch<{ data: Opportunity }>(`/opportunities/${id}/stage`, { stage_id: stageId })
}

export function getPipeline() {
  return api.get<PipelineStage[]>("/pipeline")
}
