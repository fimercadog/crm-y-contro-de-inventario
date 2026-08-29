export type UserStatus = "active" | "inactive"

export interface ManagedUser {
  id: number
  company_id: number
  name: string
  email: string
  status: UserStatus
  role: string
  roles: string[]
}

export interface Role {
  id: number
  name: string
  description: string | null
  is_system: boolean
  permissions: string[]
  users_count: number
}

export interface PermissionInfo {
  name: string
  label: string
}

export interface RolesResponse {
  data: Role[]
  available_permissions: PermissionInfo[]
}

export interface RolePayload {
  name: string
  description?: string | null
  permissions: string[]
}
