"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
import { listProducts } from "@/features/products/api"
import type { Product } from "@/features/products/types"
import { createMovement } from "@/features/inventory/api"
import type { MovementType } from "@/features/inventory/types"

const schema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  type: z.enum(["entrada", "salida", "ajuste"]),
  quantity: z.coerce.number().int().min(0, "Cantidad inválida"),
  unit_cost: z.string(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const typeOptions = [
  { value: "entrada", label: "Entrada" },
  { value: "salida", label: "Salida" },
  { value: "ajuste", label: "Ajuste (conteo físico)" },
]

interface MovementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lockedType?: MovementType
  onSaved: () => void
}

export function MovementFormDialog({
  open,
  onOpenChange,
  lockedType,
  onSaved,
}: MovementFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_id: "",
      type: lockedType ?? "entrada",
      quantity: 0,
      unit_cost: "",
      reference: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      product_id: "",
      type: lockedType ?? "entrada",
      quantity: 0,
      unit_cost: "",
      reference: "",
      notes: "",
    })
    listProducts({ per_page: 100, status: "activo", sort: "name", direction: "asc" }).then(
      ({ data }) => setProducts(data.data)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lockedType])

  const selectedType = useWatch({ control: form.control, name: "type" })
  const selectedProductId = useWatch({ control: form.control, name: "product_id" })
  const selectedProduct = products.find((p) => String(p.id) === selectedProductId)

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await createMovement({
        product_id: Number(values.product_id),
        type: values.type,
        quantity: values.quantity,
        unit_cost: values.unit_cost === "" ? null : Number(values.unit_cost),
        reference: values.reference?.trim() || null,
        notes: values.notes?.trim() || null,
      })
      toast.success("Movimiento registrado")
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo registrar el movimiento")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="movement-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {!lockedType && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <IdSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={typeOptions}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona"
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: `${p.name} (${p.sku})`,
                    }))}
                  />
                  {selectedProduct && (
                    <p className="text-xs text-muted-foreground">
                      Stock actual: {selectedProduct.current_stock}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedType === "ajuste" ? "Conteo físico final" : "Cantidad"}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  {selectedType === "ajuste" && (
                    <p className="text-xs text-muted-foreground">
                      El stock del producto quedará igual a este número.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo unitario (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Factura, orden, remisión..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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
          <Button type="submit" form="movement-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
