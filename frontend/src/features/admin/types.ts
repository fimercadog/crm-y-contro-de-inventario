export type UserRole = "super-admin" | "administrador" | "comercial" | "inventario" | "vendedor"
export type UserStatus = "active" | "inactive"

export interface ManagedUser {
  id: number
  company_id: number
  name: string
  email: string
  status: UserStatus
  role: UserRole
  roles: UserRole[]
}

export interface RoleOverview {
  name: UserRole
  description: string
  users_count: number
}
