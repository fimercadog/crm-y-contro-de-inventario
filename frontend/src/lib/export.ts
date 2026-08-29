import { useState } from "react"
import { toast } from "sonner"

import { api } from "@/lib/api"

/**
 * Downloads a table export (CSV/PDF) from `/{resource}/export/{format}`,
 * passing the current filter params so the file matches what's on screen.
 */
export function useTableExport(resource: string, filename = resource) {
  const [isExporting, setIsExporting] = useState(false)

  async function exportAs(format: "csv" | "pdf", params?: Record<string, unknown>) {
    setIsExporting(true)
    try {
      const response = await api.get(`/${resource}/export/${format}`, {
        params,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setIsExporting(false)
    }
  }

  return { isExporting, exportAs }
}
