"use client"

import { X } from "lucide-react"
import type { RowData } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import type { AppTable } from "@/components/data-table/data-table"

interface DataTableToolbarProps<TData extends RowData> {
  table: AppTable<TData>
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onReset?: () => void
  isFiltered?: boolean
  filters?: React.ReactNode
  actions?: React.ReactNode
}

export function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onReset,
  isFiltered,
  filters,
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 w-[180px] lg:w-[260px]"
        />
        {filters}
        {isFiltered && onReset && (
          <Button variant="ghost" onClick={onReset} className="h-8 px-2 lg:px-3">
            Reiniciar
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
