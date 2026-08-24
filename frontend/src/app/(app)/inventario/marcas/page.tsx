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
import { SimpleCatalogFormDialog } from "@/components/catalog/simple-catalog-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Brand } from "@/features/catalog/types"

const brandApi = createCatalogApi<Brand>("brands")

function columns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: Brand) => void
  onDelete: (item: Brand) => void
}): AppColumnDef<Brand>[] {
  return [
    { accessorKey: "name", header: "Nombre" },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => row.original.description ?? "—",
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

export default function MarcasPage() {
  return (
    <CatalogPage
      title="Marcas"
      itemLabel="Marca"
      gender="f"
      exportFileBase="marcas"
      resourceApi={brandApi}
      columns={columns}
      renderDialog={({ open, onOpenChange, entry, onSaved }) => (
        <SimpleCatalogFormDialog
          open={open}
          onOpenChange={onOpenChange}
          entry={entry}
          onSaved={onSaved}
          resourceApi={brandApi}
          itemLabel="Marca"
        />
      )}
    />
  )
}
