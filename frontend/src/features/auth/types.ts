export interface AuthUser {
  id: number
  company_id: number | null
  name: string
  email: string
  status: string
  roles: string[]
  permissions: string[]
}
