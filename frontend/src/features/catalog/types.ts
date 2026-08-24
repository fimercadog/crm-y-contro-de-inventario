export type CatalogStatus = "activo" | "inactivo"

export interface CatalogEntry {
  id: number
  name: string
  status: CatalogStatus
  created_at: string
}

export interface Category extends CatalogEntry {
  description: string | null
}

export interface Brand extends CatalogEntry {
  description: string | null
}

export interface Unit extends CatalogEntry {
  abbreviation: string
}

export interface Supplier extends CatalogEntry {
  document_type: string | null
  document_number: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  notes: string | null
}
