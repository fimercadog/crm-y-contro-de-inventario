"use client"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { RowActions } from "@/components/data-table/row-actions"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { Product, StockStatus } from "@/features/products/types"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

const stockStatusVariant: Record<
  StockStatus,
  "success" | "warning" | "destructive" | "outline"
> = {
  normal: "success",
  bajo: "warning",
  critico: "destructive",
  agotado: "destructive",
}

const stockStatusLabel: Record<StockStatus, string> = {
  normal: "Normal",
  bajo: "Bajo",
  critico: "Crítico",
  agotado: "Agotado",
}

interface ColumnActions {
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onRestore: (product: Product) => void
}

export function productColumns({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): AppColumnDef<Product>[] {
  return [
    {
      accessorKey: "sku",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "category_name",
      header: "Categoría",
    },
    {
      accessorKey: "brand_name",
      header: "Marca",
      cell: ({ row }) => row.original.brand_name ?? "—",
    },
    {
      accessorKey: "sale_price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
      cell: ({ row }) => currency.format(row.original.sale_price),
    },
    {
      accessorKey: "current_stock",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.current_stock}</span>
          <Badge variant={stockStatusVariant[row.original.stock_status]}>
            {stockStatusLabel[row.original.stock_status]}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) =>
        row.original.deleted_at ? (
          <Badge variant="destructive">Eliminado</Badge>
        ) : (
          <Badge variant={row.original.status === "activo" ? "success" : "outline"}>
            {row.original.status === "activo" ? "Activo" : "Inactivo"}
          </Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ]
}
