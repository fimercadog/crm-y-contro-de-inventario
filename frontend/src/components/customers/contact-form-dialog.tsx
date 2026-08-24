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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createContact, updateContact } from "@/features/customers/api"
import type { Contact } from "@/features/customers/types"

const contactSchema = z.object({
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  job_title: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  is_primary: z.boolean(),
  status: z.enum(["activo", "inactivo"]),
})

type ContactFormValues = z.infer<typeof contactSchema>

const emptyValues: ContactFormValues = {
  first_name: "",
  last_name: "",
  job_title: "",
  email: "",
  phone: "",
  mobile: "",
  is_primary: false,
  status: "activo",
}

interface ContactFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: number
  contact?: Contact | null
  onSaved: () => void
}

export function ContactFormDialog({
  open,
  onOpenChange,
  customerId,
  contact,
  onSaved,
}: ContactFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      contact
        ? {
            first_name: contact.first_name,
            last_name: contact.last_name,
            job_title: contact.job_title ?? "",
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            mobile: contact.mobile ?? "",
            is_primary: contact.is_primary,
            status: contact.status,
          }
        : emptyValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact])

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    try {
      if (contact) {
        await updateContact(contact.id, values)
        toast.success("Contacto actualizado")
      } else {
        await createContact(customerId, values)
        toast.success("Contacto creado")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar el contacto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="contact-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
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
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Cargo</FormLabel>
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
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel>Contacto principal</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="contact-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
