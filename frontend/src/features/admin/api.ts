import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { ManagedUser, Role, RolePayload, RolesResponse } from "@/features/admin/types"

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
  return api.get<RolesResponse>("/admin/roles")
}

export function createRole(payload: RolePayload) {
  return api.post<{ data: Role }>("/admin/roles", payload)
}

export function updateRole(id: number, payload: RolePayload) {
  return api.put<{ data: Role }>(`/admin/roles/${id}`, payload)
}

export function deleteRole(id: number) {
  return api.delete(`/admin/roles/${id}`)
}
