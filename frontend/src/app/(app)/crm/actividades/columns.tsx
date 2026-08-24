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
import type { Activity } from "@/features/activities/types"

const typeLabels: Record<Activity["type"], string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  email: "Email",
  whatsapp: "WhatsApp",
  tarea: "Tarea",
  seguimiento: "Seguimiento",
  nota: "Nota",
  otro: "Otro",
}

const statusVariant: Record<Activity["status"], "default" | "secondary" | "outline"> = {
  pendiente: "secondary",
  completada: "default",
  cancelada: "outline",
}

const priorityVariant: Record<Activity["priority"], "outline" | "secondary" | "destructive"> = {
  baja: "outline",
  media: "secondary",
  alta: "destructive",
}

interface ColumnActions {
  onEdit: (activity: Activity) => void
  onDelete: (activity: Activity) => void
}

export function activityColumns({ onEdit, onDelete }: ColumnActions): AppColumnDef<Activity>[] {
  return [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => typeLabels[row.original.type],
    },
    {
      accessorKey: "customer_name",
      header: "Cliente",
      cell: ({ row }) => row.original.customer_name ?? "—",
    },
    {
      accessorKey: "scheduled_at",
      header: "Programada",
      cell: ({ row }) =>
        row.original.scheduled_at
          ? new Date(row.original.scheduled_at).toLocaleString("es-CO")
          : "—",
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => (
        <Badge variant={priorityVariant[row.original.priority]}>
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "user_name",
      header: "Usuario",
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
