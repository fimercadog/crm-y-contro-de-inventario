export interface Company {
  id: number
  name: string
  tax_id: string | null
  email: string | null
  phone: string | null
  address: string | null
  logo_path: string | null
  currency: string
  allow_negative_stock: boolean
}
