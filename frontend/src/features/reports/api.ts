import { api } from "@/lib/api"

export interface ReportResponse {
  title: string
  columns: Record<string, string>
  rows: Array<Record<string, string | number>>
  meta: Record<string, string>
}

export type ReportKey =
  | "inventory-valuation"
  | "movements-summary"
  | "opportunities-by-stage"
  | "sales-by-product"

export interface ReportParams {
  from?: string
  to?: string
}

export function getReport(key: ReportKey, params: ReportParams = {}) {
  return api.get<ReportResponse>(`/reports/${key}`, { params })
}

export async function downloadReport(
  key: ReportKey,
  format: "csv" | "pdf",
  params: ReportParams = {}
) {
  const response = await api.get(`/reports/${key}`, {
    params: { ...params, format },
    responseType: "blob",
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement("a")
  link.href = url
  link.download = `${key}.${format}`
  link.click()
  window.URL.revokeObjectURL(url)
}
