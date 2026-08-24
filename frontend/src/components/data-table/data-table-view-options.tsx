import { Settings2 } from "lucide-react"
import type { RowData } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppColumn, AppTable } from "@/components/data-table/data-table"

interface DataTableViewOptionsProps<TData extends RowData> {
  table: AppTable<TData>
}

function humanize(id: string) {
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Every sortable column in this app defines its header as
 * `({ column }) => <DataTableColumnHeader column={column} title="X" />`,
 * so the human label lives in that element's `title` prop rather than in
 * TanStack's own column metadata. Render it and read the prop back instead
 * of duplicating the title string in a second place per column.
 */
function columnLabel<TData extends RowData>(column: AppColumn<TData>): string {
  const header = column.columnDef.header

  if (typeof header === "string") return header

  if (typeof header === "function") {
    try {
      const rendered = (header as (ctx: { column: typeof column }) => unknown)({ column })
      const title = (rendered as { props?: { title?: unknown } } | null)?.props?.title
      if (typeof title === "string") return title
    } catch {
      // fall through to the id-based fallback below
    }
  }

  return humanize(column.id)
}

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 />
            Columnas
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnLabel(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
