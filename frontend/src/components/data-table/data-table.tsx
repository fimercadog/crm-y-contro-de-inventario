"use client"

import * as React from "react"
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnVisibilityState,
  OnChangeFn,
  PaginationState,
  ReactTable,
  RowData,
  RowSelectionState,
  SortingState,
  flexRender,
  useTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { tableFeatureSet, type AppTableFeatures } from "@/components/data-table/table-features"

export type AppColumnDef<
  TData extends RowData,
  TValue = unknown
> = ColumnDef<AppTableFeatures, TData, TValue>

export type AppTable<TData extends RowData> = ReactTable<AppTableFeatures, TData>

export type AppColumn<TData extends RowData, TValue = unknown> = Column<
  AppTableFeatures,
  TData,
  TValue
>

interface DataTableProps<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a column array mixes many cell value types
  columns: AppColumnDef<TData, any>[]
  data: TData[]
  /** Total rows across all pages, as reported by the backend. */
  total: number
  isLoading?: boolean
  errorMessage?: string
  emptyMessage?: string
  toolbar?: (table: AppTable<TData>) => React.ReactNode
  selectable?: boolean

  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  total,
  isLoading,
  errorMessage,
  emptyMessage = "Sin resultados.",
  toolbar,
  selectable,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})

  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

  const table = useTable({
    features: tableFeatureSet,
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: selectable,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
  })

  return (
    <div className="flex flex-col gap-4">
      {toolbar?.(table)}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize > 10 ? 10 : pagination.pageSize }).map(
                (_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : errorMessage ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-destructive"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} total={total} selectable={selectable} />
    </div>
  )
}
