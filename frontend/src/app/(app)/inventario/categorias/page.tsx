"use client"

import type { AppColumnDef } from "@/components/data-table/data-table"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { SimpleCatalogFormDialog } from "@/components/catalog/simple-catalog-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Category } from "@/features/catalog/types"

const categoryApi = createCatalogApi<Category>("categories")

const dataColumns: AppColumnDef<Category>[] = [
  { accessorKey: "name", header: "Nombre" },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => row.original.description ?? "—",
  },
]

export default function CategoriasPage() {
  return (
    <CatalogPage
      title="Categorías"
      itemLabel="Categoría"
      gender="f"
      exportFileBase="categorias"
      resourceApi={categoryApi}
      dataColumns={dataColumns}
      renderDialog={({ open, onOpenChange, entry, onSaved }) => (
        <SimpleCatalogFormDialog
          open={open}
          onOpenChange={onOpenChange}
          entry={entry}
          onSaved={onSaved}
          resourceApi={categoryApi}
          itemLabel="Categoría"
        />
      )}
    />
  )
}
