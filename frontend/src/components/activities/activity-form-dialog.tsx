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
import { Textarea } from "@/components/ui/textarea"
import { IdSelect } from "@/components/forms/id-select"
import { createActivity, updateActivity } from "@/features/activities/api"
import type { Activity } from "@/features/activities/types"
import { listCustomers } from "@/features/customers/api"
import type { Customer } from "@/features/customers/types"

const NONE = "none"

const activitySchema = z.object({
  type: z.enum(["llamada", "reunion", "email", "whatsapp", "tarea", "seguimiento", "nota", "otro"]),
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  customer_id: z.string(),
  scheduled_at: z.string().optional(),
  status: z.enum(["pendiente", "completada", "cancelada"]),
  priority: z.enum(["baja", "media", "alta"]),
})

type ActivityFormValues = z.infer<typeof activitySchema>

const emptyValues: ActivityFormValues = {
  type: "llamada",
  title: "",
  description: "",
  customer_id: NONE,
  scheduled_at: "",
  status: "pendiente",
  priority: "media",
}

const typeLabels: Record<ActivityFormValues["type"], string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  email: "Email",
  whatsapp: "WhatsApp",
  tarea: "Tarea",
  seguimiento: "Seguimiento",
  nota: "Nota",
  otro: "Otro",
}

interface ActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
  onSaved: () => void
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  onSaved,
}: ActivityFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    listCustomers({ per_page: 100 }).then(({ data }) => setCustomers(data.data))
    form.reset(
      activity
        ? {
            type: activity.type,
            title: activity.title,
            description: activity.description ?? "",
            customer_id: activity.customer_id ? String(activity.customer_id) : NONE,
            scheduled_at: activity.scheduled_at ? activity.scheduled_at.slice(0, 16) : "",
            status: activity.status,
            priority: activity.priority,
          }
        : emptyValues
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activity])

  async function onSubmit(values: ActivityFormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        customer_id: values.customer_id === NONE ? null : Number(values.customer_id),
        scheduled_at: values.scheduled_at || null,
      }

      if (activity) {
        await updateActivity(activity.id, payload)
        toast.success("Actividad actualizada")
      } else {
        await createActivity(payload)
        toast.success("Actividad creada")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar la actividad")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="activity-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={Object.entries(typeLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "baja", label: "Baja" },
                      { value: "media", label: "Media" },
                      { value: "alta", label: "Alta" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Cliente relacionado</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: NONE, label: "Ninguno" },
                      ...customers.map((customer) => ({
                        value: String(customer.id),
                        label: customer.name,
                      })),
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha programada</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
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
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "pendiente", label: "Pendiente" },
                      { value: "completada", label: "Completada" },
                      { value: "cancelada", label: "Cancelada" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Descripción</FormLabel>
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
          <Button type="submit" form="activity-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
