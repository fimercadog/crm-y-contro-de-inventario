import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { ManagedUser, RoleOverview } from "@/features/admin/types"

export interface ManagedUserListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  role?: string
}

export function listManagedUsers(params: ManagedUserListParams) {
  return api.get<PaginatedResponse<ManagedUser>>("/admin/users", { params })
}

export interface ManagedUserPayload {
  name: string
  email: string
  password?: string
  role: string
  status: string
}

export function createManagedUser(payload: ManagedUserPayload) {
  return api.post<{ data: ManagedUser }>("/admin/users", payload)
}

export function updateManagedUser(id: number, payload: ManagedUserPayload) {
  return api.put<{ data: ManagedUser }>(`/admin/users/${id}`, payload)
}

export function deactivateManagedUser(id: number) {
  return api.delete<{ data: ManagedUser }>(`/admin/users/${id}`)
}

export function listRoles() {
  return api.get<{ data: RoleOverview[] }>("/admin/roles")
}
