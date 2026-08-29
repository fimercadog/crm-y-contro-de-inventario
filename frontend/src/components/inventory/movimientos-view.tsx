"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import type { AppColumnDef } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { useTableExport } from "@/lib/export"
import { deleteMovement, listMovements } from "@/features/inventory/api"
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

interface ColumnOptions {
  onEdit?: (m: InventoryMovement) => void
  onVoid?: (m: InventoryMovement) => void
}

function buildColumns({ onEdit, onVoid }: ColumnOptions): AppColumnDef<InventoryMovement>[] {
  const columns: AppColumnDef<InventoryMovement>[] = [
    {
      accessorKey: "occurred_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ row }) => (
        <span className={row.original.voided ? "text-muted-foreground line-through" : undefined}>
          {dateTime.format(new Date(row.original.occurred_at))}
        </span>
      ),
    },
    {
      accessorKey: "product_name",
      header: "Producto",
      cell: ({ row }) => (
        <div className={row.original.voided ? "text-muted-foreground" : undefined}>
          <span className="font-medium">{row.original.product_name}</span>
          <span className="block text-xs text-muted-foreground">{row.original.product_sku}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={typeVariant[row.original.type]}>{typeLabel[row.original.type]}</Badge>
          {row.original.voided && <Badge variant="outline">Anulado</Badge>}
        </div>
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
          {row.original.previous_stock} →{" "}
          <span className="text-foreground">{row.original.new_stock}</span>
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

  if (onEdit && onVoid) {
    columns.push({
      id: "actions",
      cell: ({ row }) =>
        row.original.voided ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Corregir</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onVoid(row.original)}>
                Anular
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    })
  }

  return columns
}

interface MovimientosViewProps {
  title: string
  lockedType?: MovementType
  /** Movimientos screen: read-only consolidated ledger, no create/edit/delete. */
  readOnly?: boolean
}

export function MovimientosView({ title, lockedType, readOnly }: MovimientosViewProps) {
  const [data, setData] = useState<InventoryMovement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryMovement | null>(null)
  const [voiding, setVoiding] = useState<InventoryMovement | null>(null)

  const { isExporting, exportAs } = useTableExport("inventory-movements", "movimientos")

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

  async function handleConfirmVoid() {
    if (!voiding) return
    try {
      await deleteMovement(voiding.id)
      toast.success("Movimiento anulado")
      setVoiding(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo anular el movimiento")
    }
  }

  const editable = !readOnly && !!lockedType
  const columns = useMemo(
    () =>
      buildColumns(
        editable
          ? {
              onEdit: (m) => {
                setEditing(m)
                setFormOpen(true)
              },
              onVoid: setVoiding,
            }
          : {}
      ),
    [editable]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? `${total} movimiento${total === 1 ? "" : "s"} · registro consolidado, solo lectura`
              : `${total} movimiento${total === 1 ? "" : "s"}`}
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            Registrar movimiento
          </Button>
        )}
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
                onExportCsv={() => exportAs("csv", queryParams)}
                onExportPdf={() => exportAs("pdf", queryParams)}
              />
            }
          />
        )}
      />

      {!readOnly && (
        <MovementFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
          lockedType={lockedType}
          movement={editing}
          onSaved={fetchData}
        />
      )}

      <AlertDialog open={!!voiding} onOpenChange={(open) => !open && setVoiding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se revertirá su efecto en el stock. El movimiento no se borra: queda registrado
              como &quot;Anulado&quot;, con la fecha y el usuario que lo hizo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVoid}>Anular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
