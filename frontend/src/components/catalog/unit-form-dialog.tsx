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
import { IdSelect } from "@/components/forms/id-select"
import type { Unit } from "@/features/catalog/types"
import { createCatalogApi } from "@/features/catalog/api"

const unitApi = createCatalogApi<Unit>("units")

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  abbreviation: z.string().min(1, "La abreviatura es obligatoria").max(10),
  status: z.enum(["activo", "inactivo"]),
})

type FormValues = z.infer<typeof schema>

interface UnitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: Unit | null
  onSaved: () => void
}

export function UnitFormDialog({ open, onOpenChange, entry, onSaved }: UnitFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", abbreviation: "", status: "activo" },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      entry
        ? { name: entry.name, abbreviation: entry.abbreviation, status: entry.status }
        : { name: "", abbreviation: "", status: "activo" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (entry) {
        await unitApi.update(entry.id, values)
        toast.success("Unidad actualizada")
      } else {
        await unitApi.create(values)
        toast.success("Unidad creada")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar la unidad")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? "Editar unidad" : "Nueva unidad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="unit-form"
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
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura</FormLabel>
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
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="unit-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
