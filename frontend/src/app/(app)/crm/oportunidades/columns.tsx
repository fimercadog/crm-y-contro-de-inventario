"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { AppColumnDef } from "@/components/data-table/data-table"
import type { Opportunity } from "@/features/opportunities/types"

const statusVariant: Record<Opportunity["status"], "default" | "secondary" | "destructive"> = {
  abierta: "default",
  ganada: "secondary",
  perdida: "destructive",
}

const statusLabel: Record<Opportunity["status"], string> = {
  abierta: "Abierta",
  ganada: "Ganada",
  perdida: "Perdida",
}

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

interface ColumnActions {
  onEdit: (opportunity: Opportunity) => void
  onDelete: (opportunity: Opportunity) => void
}

export function opportunityColumns({
  onEdit,
  onDelete,
}: ColumnActions): AppColumnDef<Opportunity>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "customer_name",
      header: "Cliente",
      cell: ({ row }) => (
        <Link
          href={`/crm/clientes/${row.original.customer_id}`}
          className="hover:underline"
        >
          {row.original.customer_name}
        </Link>
      ),
    },
    {
      accessorKey: "stage_name",
      header: "Etapa",
      cell: ({ row }) => <Badge variant="outline">{row.original.stage_name}</Badge>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Monto" />,
      cell: ({ row }) => currency.format(row.original.amount),
    },
    {
      accessorKey: "probability",
      header: "Probabilidad",
      cell: ({ row }) => `${row.original.probability}%`,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
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
