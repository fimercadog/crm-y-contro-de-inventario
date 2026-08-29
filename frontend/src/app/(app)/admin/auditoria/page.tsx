"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import type { AppColumnDef } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { listAuditLogs } from "@/features/audit/api"
import type { AuditEvent, AuditLog } from "@/features/audit/api"

const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" })

const eventVariant: Record<AuditEvent, "default" | "secondary" | "destructive" | "outline"> = {
  created: "default",
  updated: "secondary",
  deleted: "destructive",
  restored: "outline",
}

const eventLabel: Record<AuditEvent, string> = {
  created: "Creado",
  updated: "Actualizado",
  deleted: "Eliminado",
  restored: "Restaurado",
}

const eventOptions = [
  { label: "Creado", value: "created" },
  { label: "Actualizado", value: "updated" },
  { label: "Eliminado", value: "deleted" },
  { label: "Restaurado", value: "restored" },
]

const entityOptions = [
  { label: "Cliente", value: "Customer" },
  { label: "Contacto", value: "Contact" },
  { label: "Producto", value: "Product" },
  { label: "Oportunidad", value: "Opportunity" },
  { label: "Usuario", value: "User" },
  { label: "Empresa", value: "Company" },
]

const entityLabel = Object.fromEntries(entityOptions.map((o) => [o.value, o.label]))

function summarizeChanges(log: AuditLog): string {
  if (!log.changes) return "—"
  const keys = Object.keys(log.changes)
  if (keys.length === 0) return "—"
  if (log.event === "updated") return keys.join(", ")
  return `${keys.length} campo${keys.length === 1 ? "" : "s"}`
}

const columns: AppColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Fecha",
    cell: ({ row }) => dateTime.format(new Date(row.original.created_at)),
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ row }) => row.original.user_name ?? "Sistema",
  },
  {
    accessorKey: "event",
    header: "Evento",
    cell: ({ row }) => (
      <Badge variant={eventVariant[row.original.event]}>{eventLabel[row.original.event]}</Badge>
    ),
  },
  {
    accessorKey: "entity",
    header: "Entidad",
    cell: ({ row }) => (
      <span>
        {entityLabel[row.original.entity] ?? row.original.entity}{" "}
        <span className="text-muted-foreground">#{row.original.auditable_id}</span>
      </span>
    ),
  },
  {
    id: "changes",
    header: "Cambios",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{summarizeChanges(row.original)}</span>
    ),
  },
  {
    accessorKey: "ip_address",
    header: "IP",
    cell: ({ row }) => row.original.ip_address ?? "—",
  },
]

export default function AuditoriaPage() {
  const [data, setData] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const [search, setSearch] = useState("")
  const [event, setEvent] = useState<string[]>([])
  const [entity, setEntity] = useState<string[]>([])

  const isFiltered = search.length > 0 || event.length > 0 || entity.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      event: event[0] as AuditEvent | undefined,
      entity: entity[0],
    }),
    [pagination, search, event, entity]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listAuditLogs(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudo cargar la auditoría."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Auditoría</h2>
        <p className="text-sm text-muted-foreground">
          {total} registro{total === 1 ? "" : "s"} · quién cambió qué y cuándo
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay registros de auditoría que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por usuario o IP..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setEvent([])
              setEntity([])
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <>
                <DataTableFacetedFilter
                  title="Evento"
                  options={eventOptions}
                  value={event}
                  onChange={(value) => {
                    setEvent(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
                <DataTableFacetedFilter
                  title="Entidad"
                  options={entityOptions}
                  value={entity}
                  onChange={(value) => {
                    setEntity(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
              </>
            }
          />
        )}
      />
    </div>
  )
}
