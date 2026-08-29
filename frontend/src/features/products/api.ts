import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"
import type { Product } from "@/features/products/types"

export interface ProductListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  category_id?: number
  brand_id?: number
  low_stock?: "1"
  out_of_stock?: "1"
  sort?: string
  direction?: "asc" | "desc"
}

export function listProducts(params: ProductListParams) {
  return api.get<PaginatedResponse<Product>>("/products", { params })
}

export function getProduct(id: number) {
  return api.get<{ data: Product }>(`/products/${id}`)
}

export type ProductPayload = Omit<
  Product,
  | "id"
  | "created_at"
  | "updated_at"
  | "category_name"
  | "brand_name"
  | "unit_name"
  | "unit_abbreviation"
  | "current_stock"
  | "stock_status"
  | "suppliers"
>

export function createProduct(payload: Partial<ProductPayload>) {
  return api.post<{ data: Product }>("/products", payload)
}

export function updateProduct(id: number, payload: Partial<ProductPayload>) {
  return api.put<{ data: Product }>(`/products/${id}`, payload)
}

export function deleteProduct(id: number) {
  return api.delete(`/products/${id}`)
}

export function restoreProduct(id: number) {
  return api.post<{ data: Product }>(`/products/${id}/restore`)
}
