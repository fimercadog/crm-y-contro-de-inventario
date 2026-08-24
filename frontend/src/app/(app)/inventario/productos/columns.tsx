"use client"

import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { Product, StockStatus } from "@/features/products/types"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

const stockStatusVariant: Record<StockStatus, "default" | "secondary" | "outline" | "destructive"> = {
  normal: "default",
  bajo: "secondary",
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
}

export function productColumns({ onEdit, onDelete }: ColumnActions): AppColumnDef<Product>[] {
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
      cell: ({ row }) => (
        <Badge variant={row.original.status === "activo" ? "default" : "outline"}>
          {row.original.status === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
