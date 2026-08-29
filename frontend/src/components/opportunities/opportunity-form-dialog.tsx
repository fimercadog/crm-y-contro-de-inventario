"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { z } from "zod"
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
import { listCustomers } from "@/features/customers/api"
import type { Customer } from "@/features/customers/types"
import { listProducts } from "@/features/products/api"
import type { Product } from "@/features/products/types"
import {
  createOpportunity,
  getOpportunity,
  updateOpportunity,
} from "@/features/opportunities/api"
import type { SaveOpportunityPayload } from "@/features/opportunities/api"
import type { Opportunity, PipelineStage } from "@/features/opportunities/types"
import { listCompanyUsers, type CompanyUser } from "@/features/users/api"

const UNASSIGNED = "unassigned"

const opportunityItemSchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce.number().int().min(1, "Debe ser mayor a 0"),
  unit_price: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  discount_amount: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
})

const opportunitySchema = z
  .object({
    customer_id: z.string().min(1, "Selecciona un cliente"),
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().optional(),
    amount: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
    probability: z.coerce.number().min(0).max(100),
    stage_id: z.string().min(1, "Selecciona una etapa"),
    expected_close_date: z.string().optional(),
    assigned_user_id: z.string(),
    source: z.string().optional(),
    status: z.enum(["abierta", "ganada", "perdida"]),
    lost_reason: z.string().optional(),
    items: z.array(opportunityItemSchema),
  })
  .superRefine((values, ctx) => {
    values.items.forEach((item, index) => {
      if (item.discount_amount > item.quantity * item.unit_price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El descuento no puede superar el subtotal bruto",
          path: ["items", index, "discount_amount"],
        })
      }
    })
  })

type OpportunityFormValues = z.infer<typeof opportunitySchema>

const emptyValues: OpportunityFormValues = {
  customer_id: "",
  title: "",
  description: "",
  amount: 0,
  probability: 50,
  stage_id: "",
  expected_close_date: "",
  assigned_user_id: UNASSIGNED,
  source: "",
  status: "abierta",
  lost_reason: "",
  items: [],
}

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })

interface OpportunityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity | null
  stages: PipelineStage[]
  onSaved: () => void
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
  stages,
  onSaved,
}: OpportunityFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [hadProductItems, setHadProductItems] = useState(false)

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const status = useWatch({ control: form.control, name: "status" })
  const items = useWatch({ control: form.control, name: "items" })

  const productById = useMemo(
    () => new Map(products.map((product) => [String(product.id), product])),
    [products]
  )

  const calculatedAmount = useMemo(
    () =>
      items.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        const discount = Number(item.discount_amount) || 0

        return total + Math.max(0, quantity * unitPrice - discount)
      }, 0),
    [items]
  )

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setIsLoadingDetail(true)

    Promise.all([
      listCompanyUsers(),
      listCustomers({ per_page: 100 }),
      listProducts({ per_page: 100, status: "activo" }),
      opportunity ? getOpportunity(opportunity.id) : Promise.resolve(null),
    ])
      .then(([usersResponse, customersResponse, productsResponse, opportunityResponse]) => {
        if (cancelled) return

        setUsers(usersResponse.data.data)
        setCustomers(customersResponse.data.data)
        setProducts(productsResponse.data.data)

        const detail = opportunityResponse?.data.data ?? opportunity
        setHadProductItems((detail?.items?.length ?? 0) > 0)
        form.reset(
          detail
            ? {
                customer_id: String(detail.customer_id),
                title: detail.title,
                description: detail.description ?? "",
                amount: detail.amount,
                probability: detail.probability,
                stage_id: String(detail.stage_id),
                expected_close_date: detail.expected_close_date ?? "",
                assigned_user_id: detail.assigned_user_id
                  ? String(detail.assigned_user_id)
                  : UNASSIGNED,
                source: detail.source ?? "",
                status: detail.status,
                lost_reason: detail.lost_reason ?? "",
                items:
                  detail.items?.map((item) => ({
                    product_id: String(item.product_id),
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount,
                  })) ?? [],
              }
            : { ...emptyValues, stage_id: stages[0] ? String(stages[0].id) : "" }
        )
      })
      .catch(() => toast.error("No se pudieron cargar los datos de la oportunidad"))
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false)
      })

    return () => {
      cancelled = true
    }
  }, [form, open, opportunity, stages])

  function handleAddItem() {
    const firstProduct = products[0]
    if (!firstProduct) return

    append({
      product_id: String(firstProduct.id),
      quantity: 1,
      unit_price: firstProduct.sale_price,
      discount_amount: 0,
    })
  }

  async function onSubmit(values: OpportunityFormValues) {
    setIsSubmitting(true)
    try {
      const { items: formItems, ...opportunityValues } = values
      const hasItems = formItems.length > 0
      const payload: SaveOpportunityPayload = {
        ...opportunityValues,
        amount: hasItems ? calculatedAmount : values.amount,
        customer_id: Number(values.customer_id),
        stage_id: Number(values.stage_id),
        assigned_user_id:
          values.assigned_user_id === UNASSIGNED ? null : Number(values.assigned_user_id),
        expected_close_date: values.expected_close_date || null,
      }

      if (hasItems || hadProductItems) {
        Object.assign(payload, {
          items: formItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount_amount: Number(item.discount_amount),
          })),
        })
      }

      if (opportunity) {
        await updateOpportunity(opportunity.id, payload)
        toast.success("Oportunidad actualizada")
      } else {
        await createOpportunity(payload)
        toast.success("Oportunidad creada")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar la oportunidad")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Editar oportunidad" : "Nueva oportunidad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="opportunity-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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
              name="customer_id"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Cliente</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona un cliente"
                    options={customers.map((customer) => ({
                      value: String(customer.id),
                      label: customer.name,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      disabled={items.length > 0}
                      value={items.length > 0 ? calculatedAmount.toFixed(2) : field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="probability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Probabilidad (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stage_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={stages.map((stage) => ({
                      value: String(stage.id),
                      label: stage.name,
                    }))}
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
                      { value: "abierta", label: "Abierta" },
                      { value: "ganada", label: "Ganada" },
                      { value: "perdida", label: "Perdida" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expected_close_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha esperada de cierre</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigned_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: UNASSIGNED, label: "Sin asignar" },
                      ...users.map((user) => ({ value: String(user.id), label: user.name })),
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origen</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status === "perdida" && (
              <FormField
                control={form.control}
                name="lost_reason"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Motivo de pérdida</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <FormLabel>Productos cotizados</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={products.length === 0 || isLoadingDetail}
                >
                  <Plus />
                  Agregar producto
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {fields.map((field, index) => {
                  const selectedProduct = productById.get(items[index]?.product_id)
                  const subtotal = Math.max(
                    0,
                    (Number(items[index]?.quantity) || 0) *
                      (Number(items[index]?.unit_price) || 0) -
                      (Number(items[index]?.discount_amount) || 0)
                  )

                  return (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(220px,1fr)_88px_120px_120px_120px_40px]"
                    >
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Producto</FormLabel>
                            <IdSelect
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value)
                                const product = productById.get(value)
                                if (product) {
                                  form.setValue(`items.${index}.unit_price`, product.sale_price)
                                }
                              }}
                              options={products.map((product) => ({
                                value: String(product.id),
                                label: `${product.sku} · ${product.name}`,
                              }))}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cant.</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount_amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desc.</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col gap-2">
                        <FormLabel>Subtotal</FormLabel>
                        <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                          {currency.format(subtotal)}
                        </div>
                        {selectedProduct && (
                          <span className="text-xs text-muted-foreground">
                            Stock: {selectedProduct.current_stock}
                          </span>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {fields.length > 0 && (
                  <div className="flex justify-end text-sm font-medium">
                    Total cotizado: {currency.format(calculatedAmount)}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="opportunity-form" disabled={isSubmitting || isLoadingDetail}>
            {(isSubmitting || isLoadingDetail) && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
