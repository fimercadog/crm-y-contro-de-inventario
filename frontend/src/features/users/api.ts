import { api } from "@/lib/api"

export interface CompanyUser {
  id: number
  name: string
  email: string
}

export function listCompanyUsers() {
  return api.get<{ data: CompanyUser[] }>("/users")
}
