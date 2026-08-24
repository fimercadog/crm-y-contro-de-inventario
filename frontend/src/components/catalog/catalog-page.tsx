"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { api } from "@/lib/api"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { RowData } from "@tanstack/react-table"
import type { createCatalogApi } from "@/features/catalog/api"

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
]

interface CatalogPageProps<T extends RowData & { id: number; name: string }> {
  title: string
  itemLabel: string
  /** Grammatical gender of itemLabel in Spanish, for participle agreement
   * ("creada"/"creado", "Nueva"/"Nuevo"). */
  gender: "m" | "f"
  resourceApi: ReturnType<typeof createCatalogApi<T>>
  exportFileBase: string
  columns: (actions: {
    onEdit: (item: T) => void
    onDelete: (item: T) => void
  }) => AppColumnDef<T>[]
  renderDialog: (props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    entry: T | null
    onSaved: () => void
  }) => React.ReactNode
}

export function CatalogPage<T extends RowData & { id: number; name: string }>({
  title,
  itemLabel,
  gender,
  resourceApi,
  exportFileBase,
  columns,
  renderDialog,
}: CatalogPageProps<T>) {
  const newLabel = gender === "f" ? "Nueva" : "Nuevo"
  const deletedLabel = gender === "f" ? "eliminada" : "eliminado"
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const isFiltered = status.length > 0 || search.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
    }),
    [pagination, search, status]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    resourceApi
      .list(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage(`No se pudo cargar: ${itemLabel.toLowerCase()}.`))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await resourceApi.remove(deleting.id)
      toast.success(`${itemLabel} ${deletedLabel}`)
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? `No se pudo eliminar: ${itemLabel.toLowerCase()}`)
    }
  }

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(true)
    try {
      const response = await api.get(resourceApi.exportUrl(format), {
        params: queryParams,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `${exportFileBase}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setIsExporting(false)
    }
  }

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: (item) => {
          setEditing(item)
          setFormOpen(true)
        },
        onDelete: setDeleting,
      }),
    [columns]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {total} registro{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          {newLabel} {itemLabel.toLowerCase()}
        </Button>
      </div>

      <DataTable
        columns={tableColumns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay registros que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por nombre..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setStatus([])
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <DataTableFacetedFilter
                title="Estado"
                options={statusOptions}
                value={status}
                onChange={(value) => {
                  setStatus(value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
              />
            }
            actions={
              <DataTableExport
                isExporting={isExporting}
                onExportCsv={() => handleExport("csv")}
                onExportPdf={() => handleExport("pdf")}
              />
            }
          />
        )}
      />

      {renderDialog({
        open: formOpen,
        onOpenChange: setFormOpen,
        entry: editing,
        onSaved: fetchData,
      })}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {itemLabel.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará &quot;{deleting?.name}&quot; permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
