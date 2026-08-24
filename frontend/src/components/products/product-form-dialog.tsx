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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IdSelect } from "@/components/forms/id-select"
import { createCatalogApi } from "@/features/catalog/api"
import type { Category, Brand, Unit, Supplier } from "@/features/catalog/types"
import { createProduct, getProduct, updateProduct } from "@/features/products/api"
import type { Product } from "@/features/products/types"

const categoryApi = createCatalogApi<Category>("categories")
const brandApi = createCatalogApi<Brand>("brands")
const unitApi = createCatalogApi<Unit>("units")
const supplierApi = createCatalogApi<Supplier>("suppliers")

const NONE = "none"

const schema = z
  .object({
    sku: z.string().min(1, "El SKU es obligatorio"),
    barcode: z.string().optional(),
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    category_id: z.string().min(1, "Selecciona una categoría"),
    brand_id: z.string(),
    unit_id: z.string().min(1, "Selecciona una unidad"),
    cost: z.coerce.number().min(0),
    sale_price: z.coerce.number().min(0),
    minimum_stock: z.coerce.number().int().min(0),
    // Kept as a raw string (not z.coerce.number()): coercion turns an empty
    // string into 0 *during validation*, before "empty means no cap" can
    // be handled in onSubmit, which silently sent maximum_stock: 0 and
    // failed the backend's gte:minimum_stock rule whenever it wasn't 0.
    maximum_stock: z.string(),
    status: z.enum(["activo", "inactivo"]),
    supplier_ids: z.array(z.number()),
  })
  .superRefine((values, ctx) => {
    if (values.maximum_stock === "") return

    const max = Number(values.maximum_stock)
    if (!Number.isInteger(max) || max < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["maximum_stock"],
        message: "Debe ser un número entero mayor o igual a 0",
      })
      return
    }

    if (max < values.minimum_stock) {
      ctx.addIssue({
        code: "custom",
        path: ["maximum_stock"],
        message: "Debe ser mayor o igual al stock mínimo",
      })
    }
  })

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  sku: "",
  barcode: "",
  name: "",
  description: "",
  category_id: "",
  brand_id: NONE,
  unit_id: "",
  cost: 0,
  sale_price: 0,
  minimum_stock: 0,
  maximum_stock: "",
  status: "activo",
  supplier_ids: [],
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSaved: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    categoryApi.list({ per_page: 100, status: "activo" }).then(({ data }) => setCategories(data.data))
    brandApi.list({ per_page: 100, status: "activo" }).then(({ data }) => setBrands(data.data))
    unitApi.list({ per_page: 100, status: "activo" }).then(({ data }) => setUnits(data.data))
    supplierApi.list({ per_page: 100, status: "activo" }).then(({ data }) => setSuppliers(data.data))

    if (!product) {
      form.reset(emptyValues)
      return
    }

    // The list endpoint doesn't eager-load suppliers (every row would pay
    // for a pivot join just for this dialog), so fetch the full product
    // here to get supplier_ids for the checkboxes below.
    getProduct(product.id).then(({ data }) => {
      const full = data.data
      form.reset({
        sku: full.sku,
        barcode: full.barcode ?? "",
        name: full.name,
        description: full.description ?? "",
        category_id: String(full.category_id),
        brand_id: full.brand_id ? String(full.brand_id) : NONE,
        unit_id: String(full.unit_id),
        cost: full.cost,
        sale_price: full.sale_price,
        minimum_stock: full.minimum_stock,
        maximum_stock: full.maximum_stock === null ? "" : String(full.maximum_stock),
        status: full.status,
        supplier_ids: full.supplier_ids ?? [],
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        category_id: Number(values.category_id),
        brand_id: values.brand_id === NONE ? null : Number(values.brand_id),
        unit_id: Number(values.unit_id),
        maximum_stock: values.maximum_stock === "" ? null : Number(values.maximum_stock),
      }

      if (product) {
        await updateProduct(product.id, payload)
        toast.success("Producto actualizado")
      } else {
        await createProduct(payload)
        toast.success("Producto creado")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar el producto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
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
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de barras</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona"
                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: NONE, label: "Sin marca" },
                      ...brands.map((b) => ({ value: String(b.id), label: b.name })),
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona"
                    options={units.map((u) => ({ value: String(u.id), label: u.name }))}
                  />
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
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de venta</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimum_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maximum_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock máximo</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {product && (
              <FormItem>
                <FormLabel>Stock actual</FormLabel>
                <Input value={product.current_stock} disabled />
                <p className="text-xs text-muted-foreground">
                  Solo se modifica mediante entradas, salidas y ajustes.
                </p>
              </FormItem>
            )}
            <FormField
              control={form.control}
              name="supplier_ids"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Proveedores</FormLabel>
                  <ScrollArea className="h-32 rounded-md border p-2">
                    <div className="flex flex-col gap-2">
                      {suppliers.map((supplier) => {
                        const inputId = `supplier-${supplier.id}`
                        return (
                          <div key={supplier.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              id={inputId}
                              checked={field.value.includes(supplier.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, supplier.id]
                                    : field.value.filter((id) => id !== supplier.id)
                                )
                              }}
                            />
                            <label htmlFor={inputId}>{supplier.name}</label>
                          </div>
                        )
                      })}
                      {suppliers.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No hay proveedores activos.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
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
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
