"use client"

import type { AppColumnDef } from "@/components/data-table/data-table"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { UnitFormDialog } from "@/components/catalog/unit-form-dialog"
import { createCatalogApi } from "@/features/catalog/api"
import type { Unit } from "@/features/catalog/types"

const unitApi = createCatalogApi<Unit>("units")

const dataColumns: AppColumnDef<Unit>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "abbreviation", header: "Abreviatura" },
]

export default function UnidadesPage() {
  return (
    <CatalogPage
      title="Unidades"
      itemLabel="Unidad"
      gender="f"
      exportFileBase="unidades"
      resourceApi={unitApi}
      dataColumns={dataColumns}
      renderDialog={({ open, onOpenChange, entry, onSaved }) => (
        <UnitFormDialog open={open} onOpenChange={onOpenChange} entry={entry} onSaved={onSaved} />
      )}
    />
  )
}
