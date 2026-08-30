"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableExport } from "@/components/data-table/data-table-export"
import { useTableExport } from "@/lib/export"
import { deleteActivity, listActivities, restoreActivity } from "@/features/activities/api"
import type { Activity } from "@/features/activities/types"
import { activityColumns } from "./columns"
import { ActivityFormDialog } from "@/components/activities/activity-form-dialog"

const statusOptions = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Completada", value: "completada" },
  { label: "Cancelada", value: "cancelada" },
]

const priorityOptions = [
  { label: "Baja", value: "baja" },
  { label: "Media", value: "media" },
  { label: "Alta", value: "alta" },
]

export default function ActividadesPage() {
  const [data, setData] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [priority, setPriority] = useState<string[]>([])
  const [view, setView] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [deleting, setDeleting] = useState<Activity | null>(null)

  const { isExporting, exportAs } = useTableExport("activities", "actividades")

  const isFiltered =
    status.length > 0 || priority.length > 0 || search.length > 0 || view.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
      priority: priority[0],
      trashed: view[0] as "none" | "only" | undefined,
    }),
    [pagination, search, status, priority, view]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listActivities(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar las actividades."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteActivity(deleting.id)
      toast.success("Actividad eliminada")
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar la actividad")
    }
  }

  async function handleRestore(activity: Activity) {
    try {
      await restoreActivity(activity.id)
      toast.success(`Actividad "${activity.title}" restaurada`)
      fetchData()
    } catch {
      toast.error("No se pudo restaurar la actividad")
    }
  }

  const columns = useMemo(
    () =>
      activityColumns({
        onEdit: (activity) => {
          setEditing(activity)
          setFormOpen(true)
        },
        onDelete: setDeleting,
        onRestore: handleRestore,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Actividades</h2>
          <p className="text-sm text-muted-foreground">
            {total} actividad{total === 1 ? "" : "es"} registradas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          Nueva actividad
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay actividades que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por título..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setStatus([])
              setPriority([])
              setView([])
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <>
                <DataTableFacetedFilter
                  title="Estado"
                  options={statusOptions}
                  value={status}
                  onChange={(value) => {
                    setStatus(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
                <DataTableFacetedFilter
                  title="Prioridad"
                  options={priorityOptions}
                  value={priority}
                  onChange={(value) => {
                    setPriority(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
                <DataTableFacetedFilter
                  title="Ver"
                  options={[
                    { label: "Vigentes", value: "none" },
                    { label: "Eliminados", value: "only" },
                  ]}
                  value={view}
                  onChange={(value) => {
                    setView(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
              </>
            }
            actions={
              <DataTableExport
                isExporting={isExporting}
                onExportCsv={() => exportAs("csv", queryParams)}
                onExportPdf={() => exportAs("pdf", queryParams)}
              />
            }
          />
        )}
      />

      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
        onSaved={fetchData}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará &quot;{deleting?.title}&quot; permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
