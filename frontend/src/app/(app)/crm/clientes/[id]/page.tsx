"use client"

import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal, Plus, Star } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteContact, getCustomer } from "@/features/customers/api"
import type { Contact, Customer } from "@/features/customers/types"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { ContactFormDialog } from "@/components/customers/contact-form-dialog"

const statusLabel: Record<Customer["status"], string> = {
  activo: "Activo",
  prospecto: "Prospecto",
  inactivo: "Inactivo",
}

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  const fetchCustomer = useCallback(() => {
    setIsLoading(true)
    getCustomer(Number(id))
      .then(({ data }) => setCustomer(data.data))
      .catch(() => toast.error("No se pudo cargar el cliente"))
      .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  async function handleDeleteContact() {
    if (!deletingContact) return
    try {
      await deleteContact(deletingContact.id)
      toast.success("Contacto eliminado")
      setDeletingContact(null)
      fetchCustomer()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo eliminar el contacto")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!customer) {
    return <p className="text-muted-foreground">Cliente no encontrado.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/crm/clientes")}>
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight">{customer.name}</h2>
          <p className="text-sm text-muted-foreground">
            {customer.type === "empresa" ? "Empresa" : "Persona"} ·{" "}
            {statusLabel[customer.status]}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Editar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Documento" value={[customer.document_type, customer.document_number].filter(Boolean).join(" ")} />
            <Field label="Correo" value={customer.email} />
            <Field label="Teléfono" value={customer.phone} />
            <Field label="Celular" value={customer.mobile} />
            <Field label="Ciudad" value={customer.city} />
            <Field label="País" value={customer.country} />
            <Field label="Dirección" value={customer.address} className="col-span-2" />
            <Field label="Sitio web" value={customer.website} />
            <Field label="Responsable" value={customer.assigned_user_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {customer.notes || "Sin notas registradas."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Contactos</CardTitle>
            <CardDescription>Personas de contacto en este cliente.</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingContact(null)
              setContactDialogOpen(true)
            }}
          >
            <Plus />
            Agregar contacto
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {customer.contacts?.length ? (
            customer.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {contact.full_name}
                    {contact.is_primary && (
                      <Badge variant="secondary">
                        <Star className="size-3" /> Principal
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[contact.job_title, contact.email, contact.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingContact(contact)
                        setContactDialogOpen(true)
                      }}
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeletingContact(contact)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Este cliente todavía no tiene contactos.
            </p>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        onSaved={fetchCustomer}
      />
      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        customerId={customer.id}
        contact={editingContact}
        onSaved={fetchCustomer}
      />
      <AlertDialog
        open={!!deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a &quot;{deletingContact?.full_name}&quot; de este cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p>{value || "—"}</p>
    </div>
  )
}
