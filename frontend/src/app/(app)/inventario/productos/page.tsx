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
import { deleteProduct, listProducts } from "@/features/products/api"
import type { Product } from "@/features/products/types"
import { productColumns } from "./columns"
import { ProductFormDialog } from "@/components/products/product-form-dialog"

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
]

export default function ProductosPage() {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [lowStock, setLowStock] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const isFiltered = status.length > 0 || search.length > 0 || lowStock

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
      low_stock: lowStock ? ("1" as const) : undefined,
    }),
    [pagination, search, status, lowStock]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listProducts(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar los productos."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteProduct(deleting.id)
      toast.success("Producto eliminado")
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el producto")
    }
  }

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(true)
    try {
      const response = await api.get(`/products/export/${format}`, {
        params: queryParams,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `productos.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setIsExporting(false)
    }
  }

  const columns = useMemo(
    () => productColumns({ onEdit: (p) => { setEditing(p); setFormOpen(true) }, onDelete: setDeleting }),
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            {total} producto{total === 1 ? "" : "s"} registrados
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          Nuevo producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay productos que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por nombre, SKU o código de barras..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setStatus([])
              setLowStock(false)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <>
                <DataTableFacetedFilter
                  title="Estado"
                  options={statusOptions}
                  value={status}
                  onChange={(value) => {
                    setStatus(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
                <Button
                  variant={lowStock ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setLowStock((v) => !v)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                >
                  Stock bajo
                </Button>
              </>
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSaved={fetchData}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará &quot;{deleting?.name}&quot;. Podrás recuperarlo desde soporte
              si fue un error.
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
