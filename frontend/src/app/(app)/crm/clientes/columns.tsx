"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { RowActions } from "@/components/data-table/row-actions"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { Customer } from "@/features/customers/types"

const statusVariant: Record<Customer["status"], "success" | "warning" | "outline"> = {
  activo: "success",
  prospecto: "warning",
  inactivo: "outline",
}

const statusLabel: Record<Customer["status"], string> = {
  activo: "Activo",
  prospecto: "Prospecto",
  inactivo: "Inactivo",
}

interface ColumnActions {
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onRestore: (customer: Customer) => void
}

export function customerColumns({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): AppColumnDef<Customer>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <Link
          href={`/crm/clientes/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (row.original.type === "empresa" ? "Empresa" : "Persona"),
    },
    {
      accessorKey: "email",
      header: "Correo",
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ciudad" />,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) =>
        row.original.deleted_at ? (
          <Badge variant="destructive">Eliminado</Badge>
        ) : (
          <Badge variant={statusVariant[row.original.status]}>
            {statusLabel[row.original.status]}
          </Badge>
        ),
    },
    {
      accessorKey: "assigned_user_name",
      header: "Responsable",
      cell: ({ row }) => row.original.assigned_user_name ?? "—",
    },
    {
      accessorKey: "contacts_count",
      header: "Contactos",
      cell: ({ row }) => row.original.contacts_count ?? 0,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ),
    },
  ]
}
