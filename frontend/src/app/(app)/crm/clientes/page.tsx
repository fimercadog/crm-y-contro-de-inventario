"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState, SortingState } from "@tanstack/react-table"
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
import { deleteCustomer, listCustomers, restoreCustomer } from "@/features/customers/api"
import type { Customer } from "@/features/customers/types"
import { customerColumns } from "./columns"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Prospecto", value: "prospecto" },
  { label: "Inactivo", value: "inactivo" },
]

const typeOptions = [
  { label: "Persona", value: "persona" },
  { label: "Empresa", value: "empresa" },
]

export default function ClientesPage() {
  const [data, setData] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [type, setType] = useState<string[]>([])
  const [view, setView] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const isFiltered =
    status.length > 0 || type.length > 0 || search.length > 0 || view.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
      type: type[0],
      trashed: view[0] as "none" | "only" | undefined,
      sort: sorting[0]?.id,
      direction: sorting[0] ? (sorting[0].desc ? ("desc" as const) : ("asc" as const)) : undefined,
    }),
    [pagination, search, status, type, view, sorting]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listCustomers(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar los clientes."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleEdit(customer: Customer) {
    setEditing(customer)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteCustomer(deleting.id)
      toast.success("Cliente eliminado")
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el cliente")
    }
  }

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(true)
    try {
      const response = await api.get(`/customers/export/${format}`, {
        params: queryParams,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `clientes.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setIsExporting(false)
    }
  }

  async function handleRestore(customer: Customer) {
    try {
      await restoreCustomer(customer.id)
      toast.success(`Cliente "${customer.name}" restaurado`)
      fetchData()
    } catch {
      toast.error("No se pudo restaurar el cliente")
    }
  }

  const columns = useMemo(
    () =>
      customerColumns({ onEdit: handleEdit, onDelete: setDeleting, onRestore: handleRestore }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {total} cliente{total === 1 ? "" : "s"} registrados
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          Nuevo cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay clientes que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por nombre, correo o documento..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setStatus([])
              setType([])
              setView([])
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
                <DataTableFacetedFilter
                  title="Tipo"
                  options={typeOptions}
                  value={type}
                  onChange={(value) => {
                    setType(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
                <DataTableFacetedFilter
                  title="Ver"
                  options={[
                    { label: "Vigentes", value: "none" },
                    { label: "Eliminados", value: "only" },
                  ]}
                  value={view}
                  onChange={(value) => {
                    setView(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
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

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editing}
        onSaved={fetchData}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a &quot;{deleting?.name}&quot;. Podrás recuperarlo desde
              soporte si fue un error.
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
