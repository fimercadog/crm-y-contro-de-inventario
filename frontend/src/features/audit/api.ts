import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"

export type AuditEvent = "created" | "updated" | "deleted"

export interface AuditLog {
  id: number
  event: AuditEvent
  entity: string
  auditable_type: string
  auditable_id: number
  user_id: number | null
  user_name?: string | null
  changes: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AuditListParams {
  page?: number
  per_page?: number
  event?: AuditEvent
  entity?: string
  user_id?: number
  search?: string
}

export function listAuditLogs(params: AuditListParams) {
  return api.get<PaginatedResponse<AuditLog>>("/audit-logs", { params })
}
