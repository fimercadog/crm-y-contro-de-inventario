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
import type { AppColumnDef } from "@/components/data-table/data-table"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { UnitFormDialog } from "@/components/catalog/unit-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Unit } from "@/features/catalog/types"

const unitApi = createCatalogApi<Unit>("units")

function columns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: Unit) => void
  onDelete: (item: Unit) => void
}): AppColumnDef<Unit>[] {
  return [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "abbreviation", header: "Abreviatura" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "activo" ? "success" : "outline"}>
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

export default function UnidadesPage() {
  return (
    <CatalogPage
      title="Unidades"
      itemLabel="Unidad"
      gender="f"
      exportFileBase="unidades"
      resourceApi={unitApi}
      columns={columns}
      renderDialog={({ open, onOpenChange, entry, onSaved }) => (
        <UnitFormDialog open={open} onOpenChange={onOpenChange} entry={entry} onSaved={onSaved} />
      )}
    />
  )
}
