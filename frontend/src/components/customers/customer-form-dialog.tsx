"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCustomer, updateCustomer } from "@/features/customers/api"
import type { Customer } from "@/features/customers/types"
import { listCompanyUsers, type CompanyUser } from "@/features/users/api"

const UNASSIGNED = "unassigned"

const customerSchema = z.object({
  type: z.enum(["persona", "empresa"]),
  name: z.string().min(1, "El nombre es obligatorio"),
  document_type: z.string().optional(),
  document_number: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  status: z.enum(["activo", "prospecto", "inactivo"]),
  notes: z.string().optional(),
  assigned_user_id: z.string(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

const emptyValues: CustomerFormValues = {
  type: "empresa",
  name: "",
  document_type: "",
  document_number: "",
  email: "",
  phone: "",
  mobile: "",
  address: "",
  city: "",
  country: "",
  website: "",
  status: "prospecto",
  notes: "",
  assigned_user_id: UNASSIGNED,
}

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSaved: () => void
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSaved,
}: CustomerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<CompanyUser[]>([])

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    listCompanyUsers().then(({ data }) => setUsers(data.data))
    form.reset(
      customer
        ? {
            type: customer.type,
            name: customer.name,
            document_type: customer.document_type ?? "",
            document_number: customer.document_number ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            mobile: customer.mobile ?? "",
            address: customer.address ?? "",
            city: customer.city ?? "",
            country: customer.country ?? "",
            website: customer.website ?? "",
            status: customer.status,
            notes: customer.notes ?? "",
            assigned_user_id: customer.assigned_user_id
              ? String(customer.assigned_user_id)
              : UNASSIGNED,
          }
        : emptyValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer])

  async function onSubmit(values: CustomerFormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        assigned_user_id:
          values.assigned_user_id === UNASSIGNED ? null : Number(values.assigned_user_id),
      }

      if (customer) {
        await updateCustomer(customer.id, payload)
        toast.success("Cliente actualizado")
      } else {
        await createCustomer(payload)
        toast.success("Cliente creado")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar el cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {customer
              ? "Actualiza los datos del cliente."
              : "Completa los datos para registrar un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="customer-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="persona">Persona</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="prospecto">Prospecto</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de documento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de documento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Responsable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Sin asignar</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="customer-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
