"use client"

import type { AppColumnDef } from "@/components/data-table/data-table"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { SupplierFormDialog } from "@/components/catalog/supplier-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Supplier } from "@/features/catalog/types"

const supplierApi = createCatalogApi<Supplier>("suppliers")

const dataColumns: AppColumnDef<Supplier>[] = [
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
]

export default function ProveedoresPage() {
  return (
    <CatalogPage
      title="Proveedores"
      itemLabel="Proveedor"
      gender="m"
      exportFileBase="proveedores"
      resourceApi={supplierApi}
      dataColumns={dataColumns}
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
