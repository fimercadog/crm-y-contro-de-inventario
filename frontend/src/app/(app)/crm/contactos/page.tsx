"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { toast } from "sonner"
import axios from "axios"

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
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { deleteContact, listContacts, restoreContact } from "@/features/customers/api"
import type { Contact } from "@/features/customers/types"
import { contactColumns } from "./columns"
import { ContactFormDialog } from "@/components/customers/contact-form-dialog"

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
]

// Default (nothing selected) shows every row; this narrows by deletion state.
const viewOptions = [
  { label: "Vigentes", value: "none" },
  { label: "Eliminados", value: "only" },
]

export default function ContactosPage() {
  const [data, setData] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string[]>([])
  const [view, setView] = useState<string[]>([])

  const [editing, setEditing] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Contact | null>(null)

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
    listContacts(queryParams)
      .then(({ data }) => {
        setData(data.data)
        setTotal(data.meta.total)
      })
      .catch(() => setErrorMessage("No se pudieron cargar los contactos."))
      .finally(() => setIsLoading(false))
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleConfirmDelete() {
    if (!deleting) return
    try {
      await deleteContact(deleting.id)
      toast.success(`Contacto "${deleting.full_name}" eliminado`)
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el contacto")
    }
  }

  async function handleRestore(contact: Contact) {
    try {
      await restoreContact(contact.id)
      toast.success(`Contacto "${contact.full_name}" restaurado`)
      fetchData()
    } catch {
      toast.error("No se pudo restaurar el contacto")
    }
  }

  const columns = useMemo(
    () =>
      contactColumns({
        onEdit: (contact) => {
          setEditing(contact)
          setCreating(false)
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Contactos</h2>
          <p className="text-sm text-muted-foreground">
            {total} contacto{total === 1 ? "" : "s"} en todos los clientes.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setCreating(true)
            setFormOpen(true)
          }}
        >
          Nuevo contacto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="No hay contactos que coincidan con los filtros."
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
                  options={viewOptions}
                  value={view}
                  onChange={(value) => {
                    setView(value)
                    setPagination((p) => ({ ...p, pageIndex: 0 }))
                  }}
                />
              </>
            }
          />
        )}
      />

      {(editing || creating) && (
        <ContactFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) {
              setEditing(null)
              setCreating(false)
            }
          }}
          customerId={editing?.customer_id}
          contact={editing}
          onSaved={fetchData}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.full_name}&quot; se marcará como eliminado. Seguirá en la lista
              con la etiqueta &quot;Eliminado&quot; y podrás restaurarlo desde ahí.
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
