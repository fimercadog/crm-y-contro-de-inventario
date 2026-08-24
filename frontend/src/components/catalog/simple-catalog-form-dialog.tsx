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
import type { Category, Brand } from "@/features/catalog/types"
import type { createCatalogApi } from "@/features/catalog/api"

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  status: z.enum(["activo", "inactivo"]),
})

type FormValues = z.infer<typeof schema>

interface SimpleCatalogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: (Category | Brand) | null
  onSaved: () => void
  resourceApi: ReturnType<typeof createCatalogApi<Category | Brand>>
  itemLabel: string
}

export function SimpleCatalogFormDialog({
  open,
  onOpenChange,
  entry,
  onSaved,
  resourceApi,
  itemLabel,
}: SimpleCatalogFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", status: "activo" },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      entry
        ? { name: entry.name, description: entry.description ?? "", status: entry.status }
        : { name: "", description: "", status: "activo" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (entry) {
        await resourceApi.update(entry.id, values)
        toast.success(`${itemLabel} actualizada`)
      } else {
        await resourceApi.create(values)
        toast.success(`${itemLabel} creada`)
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? `No se pudo guardar: ${itemLabel.toLowerCase()}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? `Editar ${itemLabel.toLowerCase()}` : `Nueva ${itemLabel.toLowerCase()}`}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="simple-catalog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "activo", label: "Activo" },
                      { value: "inactivo", label: "Inactivo" },
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
                <FormItem>
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
          <Button type="submit" form="simple-catalog-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
