import { api } from "@/lib/api"
import type { PaginatedResponse } from "@/features/customers/types"

export interface CatalogListParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
  /** Omit for all rows; "none" hides deleted; "only" shows deleted only. */
  trashed?: "only" | "none"
}

export function createCatalogApi<T extends { id: number }>(uri: string) {
  return {
    list: (params: CatalogListParams) =>
      api.get<PaginatedResponse<T>>(`/${uri}`, { params }),
    create: (payload: Partial<T>) => api.post<{ data: T }>(`/${uri}`, payload),
    update: (id: number, payload: Partial<T>) =>
      api.put<{ data: T }>(`/${uri}/${id}`, payload),
    remove: (id: number) => api.delete(`/${uri}/${id}`),
    restore: (id: number) => api.post<{ data: T }>(`/${uri}/${id}/restore`),
    exportUrl: (format: "csv" | "pdf") => `/${uri}/export/${format}`,
  }
}
