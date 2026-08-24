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
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { deleteContact, listContacts } from "@/features/customers/api"
import type { Contact } from "@/features/customers/types"
import { contactColumns } from "./columns"
import { ContactFormDialog } from "@/components/customers/contact-form-dialog"

const statusOptions = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
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

  const [editing, setEditing] = useState<Contact | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Contact | null>(null)

  const isFiltered = status.length > 0 || search.length > 0

  const queryParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
      search: search || undefined,
      status: status[0],
    }),
    [pagination, search, status]
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
      toast.success("Contacto eliminado")
      setDeleting(null)
      fetchData()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el contacto")
    }
  }

  const columns = useMemo(
    () =>
      contactColumns({
        onEdit: (contact) => {
          setEditing(contact)
          setFormOpen(true)
        },
        onDelete: setDeleting,
      }),
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Contactos</h2>
        <p className="text-sm text-muted-foreground">
          {total} contacto{total === 1 ? "" : "s"} en todos los clientes. Para agregar uno
          nuevo, ábrelo desde la ficha del cliente correspondiente.
        </p>
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
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
            filters={
              <DataTableFacetedFilter
                title="Estado"
                options={statusOptions}
                value={status}
                onChange={(value) => {
                  setStatus(value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
              />
            }
          />
        )}
      />

      {editing && (
        <ContactFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          customerId={editing.customer_id}
          contact={editing}
          onSaved={fetchData}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a &quot;{deleting?.full_name}&quot;.
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
