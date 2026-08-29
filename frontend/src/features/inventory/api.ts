import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { InventoryMovement, MovementType } from "@/features/inventory/types"

export interface MovementListParams {
  page?: number
  per_page?: number
  search?: string
  type?: MovementType
  product_id?: number
  sort?: string
  direction?: "asc" | "desc"
}

export function listMovements(params: MovementListParams) {
  return api.get<PaginatedResponse<InventoryMovement>>("/inventory-movements", { params })
}

export interface MovementPayload {
  product_id: number
  type: MovementType
  quantity: number
  unit_cost?: number | null
  reference?: string | null
  notes?: string | null
  occurred_at?: string | null
}

export function createMovement(payload: MovementPayload) {
  return api.post<{ data: InventoryMovement }>("/inventory-movements", payload)
}

export type MovementUpdatePayload = Pick<
  MovementPayload,
  "quantity" | "unit_cost" | "reference" | "notes" | "occurred_at"
>

export function updateMovement(id: number, payload: MovementUpdatePayload) {
  return api.put<{ data: InventoryMovement }>(`/inventory-movements/${id}`, payload)
}

export function deleteMovement(id: number) {
  return api.delete(`/inventory-movements/${id}`)
}
