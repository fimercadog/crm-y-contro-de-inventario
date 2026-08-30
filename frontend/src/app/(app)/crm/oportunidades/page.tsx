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
import { api } from "@/lib/api"
import {
  deleteOpportunity,
  getPipeline,
  listOpportunities,
  restoreOpportunity,
} from "@/features/opportunities/api"
import type { Opportunity, PipelineStage } from "@/features/opportunities/types"
import { opportunityColumns } from "./columns"
import { OpportunityFormDialog } from "@/components/opportunities/opportunity-form-dialog"

const statusOptions = [
  { label: "Abierta", value: "abierta" },
  { label: "Ganada", value: "ganada" },
  { label: "Perdida", value: "perdida" },
]

export default function OportunidadesPage() {
  const [data, setData] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [stages, setStages] = useState<PipelineStage[]>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [view, setView] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Opportunity | null>(null)
  const [deleting, setDeleting] = useState<Opportunity | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const isFiltered = status.length > 0 || search.length > 0 || view.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
      trashed: view[0] as "none" | "only" | undefined,
    }),
    [pagination, search, status, view]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listOpportunities(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar las oportunidades."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    getPipeline().then(({ data }) => setStages(data))
  }, [])

  function handleEdit(opportunity: Opportunity) {
    setEditing(opportunity)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteOpportunity(deleting.id)
      toast.success("Oportunidad eliminada")
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar la oportunidad")
    }
  }

  async function handleExport(format: "csv" | "pdf") {
    setIsExporting(true)
    try {
      const response = await api.get(`/opportunities/export/${format}`, {
        params: queryParams,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `oportunidades.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("No se pudo generar la exportación")
    } finally {
      setIsExporting(false)
    }
  }

  async function handleRestore(opportunity: Opportunity) {
    try {
      await restoreOpportunity(opportunity.id)
      toast.success(`Oportunidad "${opportunity.title}" restaurada`)
      fetchData()
    } catch {
      toast.error("No se pudo restaurar la oportunidad")
    }
  }

  const columns = useMemo(
    () =>
      opportunityColumns({
        onEdit: handleEdit,
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
          <h2 className="text-xl font-bold tracking-tight">Oportunidades</h2>
          <p className="text-sm text-muted-foreground">
            {total} oportunidad{total === 1 ? "" : "es"} registradas
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus />
          Nueva oportunidad
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay oportunidades que coincidan con los filtros."
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
                onExportCsv={() => handleExport("csv")}
                onExportPdf={() => handleExport("pdf")}
              />
            }
          />
        )}
      />

      <OpportunityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        opportunity={editing}
        stages={stages}
        onSaved={fetchData}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar oportunidad?</AlertDialogTitle>
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
