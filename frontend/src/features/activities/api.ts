import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { Activity } from "@/features/activities/types"

export interface ActivityListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  type?: string
  priority?: string
  customer_id?: number
  opportunity_id?: number
}

export function listActivities(params: ActivityListParams) {
  return api.get<PaginatedResponse<Activity>>("/activities", { params })
}

export type ActivityPayload = Omit<
  Activity,
  "id" | "created_at" | "user_id" | "user_name" | "customer_name" | "opportunity_title"
>

export function createActivity(payload: Partial<ActivityPayload>) {
  return api.post<{ data: Activity }>("/activities", payload)
}

export function updateActivity(id: number, payload: Partial<ActivityPayload>) {
  return api.put<{ data: Activity }>(`/activities/${id}`, payload)
}

export function deleteActivity(id: number) {
  return api.delete(`/activities/${id}`)
}

export function restoreActivity(id: number) {
  return api.post<{ data: Activity }>(`/activities/${id}/restore`)
}
