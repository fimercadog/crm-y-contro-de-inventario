"use client"

import Link from "next/link"
import { MoreHorizontal, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { Contact } from "@/features/customers/types"

interface ColumnActions {
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
  onRestore: (contact: Contact) => void
}

export function contactColumns({
  onEdit,
  onDelete,
  onRestore,
}: ColumnActions): AppColumnDef<Contact>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          {row.original.full_name}
          {row.original.is_primary && <Star className="size-3 text-muted-foreground" />}
        </div>
      ),
    },
    {
      id: "customer",
      header: "Cliente",
      cell: ({ row }) =>
        row.original.customer ? (
          <Link
            href={`/crm/clientes/${row.original.customer.id}`}
            className="hover:underline"
          >
            {row.original.customer.name}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "job_title",
      header: "Cargo",
      cell: ({ row }) => row.original.job_title ?? "—",
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
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) =>
        row.original.deleted_at ? (
          <Badge variant="destructive">Eliminado</Badge>
        ) : (
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
            {row.original.deleted_at ? (
              <DropdownMenuItem onClick={() => onRestore(row.original)}>
                Restaurar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original)}
                >
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
