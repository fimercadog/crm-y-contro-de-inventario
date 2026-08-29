"use client"

import type { AppColumnDef } from "@/components/data-table/data-table"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { SimpleCatalogFormDialog } from "@/components/catalog/simple-catalog-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Brand } from "@/features/catalog/types"

const brandApi = createCatalogApi<Brand>("brands")

const dataColumns: AppColumnDef<Brand>[] = [
  { accessorKey: "name", header: "Nombre" },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => row.original.description ?? "—",
  },
]

export default function MarcasPage() {
  return (
    <CatalogPage
      title="Marcas"
      itemLabel="Marca"
      gender="f"
      exportFileBase="marcas"
      resourceApi={brandApi}
      dataColumns={dataColumns}
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
