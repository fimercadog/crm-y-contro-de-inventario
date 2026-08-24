import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"

export interface CatalogListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
}

export function createCatalogApi<T extends { id: number }>(uri: string) {
  return {
    list: (params: CatalogListParams) =>
      api.get<PaginatedResponse<T>>(`/${uri}`, { params }),
    create: (payload: Partial<T>) => api.post<{ data: T }>(`/${uri}`, payload),
    update: (id: number, payload: Partial<T>) =>
      api.put<{ data: T }>(`/${uri}/${id}`, payload),
    remove: (id: number) => api.delete(`/${uri}/${id}`),
    exportUrl: (format: "csv" | "pdf") => `/${uri}/export/${format}`,
  }
}
