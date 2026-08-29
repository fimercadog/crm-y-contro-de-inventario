export type CustomerType = "persona" | "empresa"
export type CustomerStatus = "activo" | "prospecto" | "inactivo"

export interface Contact {
  id: number
  customer_id: number
  first_name: string
  last_name: string
  full_name: string
  job_title: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  is_primary: boolean
  notes: string | null
  status: "activo" | "inactivo"
  customer?: Customer
  created_at: string
  deleted_at?: string | null
}

export interface Customer {
  id: number
  type: CustomerType
  name: string
  document_type: string | null
  document_number: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  country: string | null
  website: string | null
  status: CustomerStatus
  notes: string | null
  assigned_user_id: number | null
  assigned_user_name?: string | null
  contacts_count?: number
  contacts?: Contact[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
