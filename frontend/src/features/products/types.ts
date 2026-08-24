export type ProductStatus = "activo" | "inactivo"
export type StockStatus = "normal" | "bajo" | "critico" | "agotado"

export interface ProductSupplier {
  id: number
  name: string
}

export interface Product {
  id: number
  sku: string
  barcode: string | null
  name: string
  description: string | null
  category_id: number
  category_name?: string
  brand_id: number | null
  brand_name?: string | null
  unit_id: number
  unit_name?: string
  unit_abbreviation?: string
  cost: number
  sale_price: number
  minimum_stock: number
  maximum_stock: number | null
  current_stock: number
  stock_status: StockStatus
  status: ProductStatus
  image: string | null
  supplier_ids?: number[]
  suppliers?: ProductSupplier[]
  created_at: string
  updated_at: string
}
