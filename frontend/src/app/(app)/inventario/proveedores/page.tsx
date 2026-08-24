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
import { SupplierFormDialog } from "@/components/catalog/supplier-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Supplier } from "@/features/catalog/types"

const supplierApi = createCatalogApi<Supplier>("suppliers")

function columns({
  onEdit,
  onDelete,
}: {
  onEdit: (item: Supplier) => void
  onDelete: (item: Supplier) => void
}): AppColumnDef<Supplier>[] {
  return [
    { accessorKey: "name", header: "Nombre" },
    {
      accessorKey: "contact_name",
      header: "Contacto",
      cell: ({ row }) => row.original.contact_name ?? "—",
    },
    {
      accessorKey: "email",
      header: "Correo",
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "phone",
      header: "Teléfono",
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "city",
      header: "Ciudad",
      cell: ({ row }) => row.original.city ?? "—",
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

export default function ProveedoresPage() {
  return (
    <CatalogPage
      title="Proveedores"
      itemLabel="Proveedor"
      gender="m"
      exportFileBase="proveedores"
      resourceApi={supplierApi}
      columns={columns}
      renderDialog={({ open, onOpenChange, entry, onSaved }) => (
        <SupplierFormDialog
          open={open}
          onOpenChange={onOpenChange}
          entry={entry}
          onSaved={onSaved}
        />
      )}
    />
  )
}
