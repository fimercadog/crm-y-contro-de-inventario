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
import { deactivateManagedUser, listManagedUsers, listRoles } from "@/features/admin/api"
import type { ManagedUser } from "@/features/admin/types"
import { useAppSelector } from "@/lib/hooks"
import { userColumns } from "./columns"
import { UserFormDialog } from "@/components/admin/user-form-dialog"

const statusOptions = [
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
]

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function UsuariosPage() {
  const currentUserId = useAppSelector((state) => state.auth.user?.id)

  const [data, setData] = useState<ManagedUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [role, setRole] = useState<string[]>([])
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [deactivating, setDeactivating] = useState<ManagedUser | null>(null)

  const { isExporting, exportAs } = useTableExport("admin/users", "usuarios")

  const isFiltered = status.length > 0 || role.length > 0 || search.length > 0

  useEffect(() => {
    listRoles()
      .then(({ data }) =>
        setRoleOptions(data.data.map((r) => ({ label: cap(r.name), value: r.name })))
      )
      .catch(() => setRoleOptions([]))
  }, [])

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
      role: role[0],
    }),
    [pagination, search, status, role]
  )

  const fetchData = useCallback(() => {
    setIsLoading(true)
    setErrorMessage(undefined)
    listManagedUsers(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar los usuarios."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDeactivate() {
    if (!deactivating) return
    try {
      await deactivateManagedUser(deactivating.id)
      toast.success("Usuario desactivado")
      setDeactivating(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo desactivar el usuario")
    }
  }

  const columns = useMemo(
    () =>
      userColumns({
        onEdit: (user) => {
          setEditing(user)
          setFormOpen(true)
        },
        onDeactivate: setDeactivating,
        currentUserId,
      }),
    [currentUserId]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            {total} usuario{total === 1 ? "" : "s"} en la empresa
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          Nuevo usuario
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay usuarios que coincidan con los filtros."
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={(table) => (
          <DataTableToolbar
            table={table}
            searchPlaceholder="Buscar por nombre o correo..."
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            isFiltered={isFiltered}
            onReset={() => {
              setSearch("")
              setStatus([])
              setRole([])
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
                  title="Rol"
                  options={roleOptions}
                  value={role}
                  onChange={(value) => {
                    setRole(value)
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

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={fetchData}
      />

      <AlertDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deactivating?.name}&quot; no podrá iniciar sesión hasta que se reactive.
              Su historial (actividades, clientes asignados, etc.) se conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate}>Desactivar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
