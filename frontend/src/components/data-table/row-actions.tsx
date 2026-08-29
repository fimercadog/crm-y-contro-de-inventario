"use client"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Standard row actions for a soft-deletable record: Editar / Eliminar while
 * active, Restaurar once it's been deleted (deleted_at set).
 */
export function RowActions<T extends { deleted_at?: string | null }>({
  row,
  onEdit,
  onDelete,
  onRestore,
  extra,
}: {
  row: T
  onEdit?: (row: T) => void
  onDelete: (row: T) => void
  onRestore: (row: T) => void
  extra?: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {row.deleted_at ? (
          <DropdownMenuItem onClick={() => onRestore(row)}>Restaurar</DropdownMenuItem>
        ) : (
          <>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row)}>Editar</DropdownMenuItem>
            )}
            {extra}
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)}>
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
