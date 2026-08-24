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
import type { ManagedUser, UserRole } from "@/features/admin/types"

const roleLabels: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  administrador: "Administrador",
  comercial: "Comercial",
  inventario: "Inventario",
  vendedor: "Vendedor",
}

interface ColumnActions {
  onEdit: (user: ManagedUser) => void
  onDeactivate: (user: ManagedUser) => void
  currentUserId?: number
}

export function userColumns({
  onEdit,
  onDeactivate,
  currentUserId,
}: ColumnActions): AppColumnDef<ManagedUser>[] {
  return [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "email", header: "Correo" },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => <Badge variant="outline">{roleLabels[row.original.role]}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "outline"}>
          {row.original.status === "active" ? "Activo" : "Inactivo"}
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
            {row.original.status === "active" && row.original.id !== currentUserId && (
              <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(row.original)}>
                Desactivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
