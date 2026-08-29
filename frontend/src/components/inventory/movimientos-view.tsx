"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import type { AppColumnDef } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { api } from "@/lib/api"
import { listMovements } from "@/features/inventory/api"
import type { InventoryMovement, MovementType } from "@/features/inventory/types"
import { MovementFormDialog } from "@/components/inventory/movement-form-dialog"

const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" })

const typeVariant: Record<MovementType, "default" | "secondary" | "outline" | "destructive"> = {
  entrada: "default",
  salida: "destructive",
  ajuste: "outline",
}

const typeLabel: Record<MovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
}

const typeOptions = [
  { label: "Entrada", value: "entrada" },
  { label: "Salida", value: "salida" },
  { label: "Ajuste", value: "ajuste" },
]

const columns: AppColumnDef<InventoryMovement>[] = [
  {
    accessorKey: "occurred_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => dateTime.format(new Date(row.original.occurred_at)),
  },
  {
    accessorKey: "product_name",
    header: "Producto",
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.original.product_name}</span>
        <span className="block text-xs text-muted-foreground">{row.original.product_sku}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant={typeVariant[row.original.type]}>{typeLabel[row.original.type]}</Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.previous_stock} → <span className="text-foreground">{row.original.new_stock}</span>
      </span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Referencia",
    cell: ({ row }) => row.original.reference ?? "—",
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ row }) => row.original.user_name ?? "—",
  },
]

interface MovimientosViewProps {
  title: string
  lockedType?: MovementType
}

export function MovimientosView({ title, lockedType }: MovimientosViewProps) {
  const [data, setData] = useState<InventoryMovement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const effectiveType = (lockedType ?? type[0]) as MovementType | undefined
  const isFiltered = !lockedType && (type.length > 0 || search.length > 0)

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      type: effectiveType,
    }),
    [pagination, search, effectiveType]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listMovements(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar los movimientos."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(true)
    try {
      const response = await api.get(`/inventory-movements/export/${format}`, {
        params: queryParams,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `movimientos.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setErrorMessage("No se pudo generar la exportación.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {total} movimiento{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus />
          Registrar movimiento
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay movimientos que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por producto, SKU o referencia..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setType([])
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              lockedType ? null : (
                <DataTableFacetedFilter
                  title="Tipo"
                  options={typeOptions}
                  value={type}
                  onChange={(value) => {
                    setType(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
              )
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

      <MovementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lockedType={lockedType}
        onSaved={fetchData}
      />
    </div>
  )
}
