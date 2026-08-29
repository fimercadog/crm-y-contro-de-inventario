"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import type { AppColumnDef } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { listProducts } from "@/features/products/api"
import type { Product, StockStatus } from "@/features/products/types"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

const statusVariant: Record<StockStatus, "default" | "secondary" | "outline" | "destructive"> = {
  normal: "default",
  bajo: "secondary",
  critico: "destructive",
  agotado: "destructive",
}

const statusLabel: Record<StockStatus, string> = {
  normal: "Normal",
  bajo: "Bajo",
  critico: "Crítico",
  agotado: "Agotado",
}

const columns: AppColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
  },
  {
    accessorKey: "name",
    header: "Producto",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "current_stock",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.current_stock}</span>
        <Badge variant={statusVariant[row.original.stock_status]}>
          {statusLabel[row.original.stock_status]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "minimum_stock",
    header: "Mínimo",
  },
  {
    accessorKey: "maximum_stock",
    header: "Máximo",
    cell: ({ row }) => row.original.maximum_stock ?? "—",
  },
  {
    id: "value",
    header: "Valor en stock",
    cell: ({ row }) => currency.format(row.original.current_stock * row.original.cost),
  },
]

export default function StockPage() {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")
  const [lowStock, setLowStock] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)

  const isFiltered = search.length > 0 || lowStock || outOfStock

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      low_stock: lowStock ? ("1" as const) : undefined,
      out_of_stock: outOfStock ? ("1" as const) : undefined,
      sort: "name",
      direction: "asc" as const,
    }),
    [pagination, search, lowStock, outOfStock]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listProducts(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudo cargar el stock."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const pageValue = data.reduce((sum, p) => sum + p.current_stock * p.cost, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Stock</h2>
        <p className="text-sm text-muted-foreground">
          {total} producto{total === 1 ? "" : "s"} · valor en esta página: {currency.format(pageValue)}
        </p>
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
            searchPlaceholder="Buscar por nombre o SKU..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setLowStock(false)
              setOutOfStock(false)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <>
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
                <Button
                  variant={outOfStock ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setOutOfStock((v) => !v)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                >
                  Agotado
                </Button>
              </>
            }
          />
        )}
      />
    </div>
  )
}
