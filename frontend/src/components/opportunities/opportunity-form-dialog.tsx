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
import { listCustomers } from "@/features/customers/api"
import type { Customer } from "@/features/customers/types"
import {
  createOpportunity,
  updateOpportunity,
} from "@/features/opportunities/api"
import type { Opportunity, PipelineStage } from "@/features/opportunities/types"
import { listCompanyUsers, type CompanyUser } from "@/features/users/api"

const UNASSIGNED = "unassigned"

const opportunitySchema = z.object({
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
}

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
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: emptyValues,
  })

  const status = form.watch("status")

  useEffect(() => {
    if (!open) return
    listCompanyUsers().then(({ data }) => setUsers(data.data))
    listCustomers({ per_page: 100 }).then(({ data }) => setCustomers(data.data))
    form.reset(
      opportunity
        ? {
            customer_id: String(opportunity.customer_id),
            title: opportunity.title,
            description: opportunity.description ?? "",
            amount: opportunity.amount,
            probability: opportunity.probability,
            stage_id: String(opportunity.stage_id),
            expected_close_date: opportunity.expected_close_date ?? "",
            assigned_user_id: opportunity.assigned_user_id
              ? String(opportunity.assigned_user_id)
              : UNASSIGNED,
            source: opportunity.source ?? "",
            status: opportunity.status,
            lost_reason: opportunity.lost_reason ?? "",
          }
        : { ...emptyValues, stage_id: stages[0] ? String(stages[0].id) : "" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, opportunity])

  async function onSubmit(values: OpportunityFormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        customer_id: Number(values.customer_id),
        stage_id: Number(values.stage_id),
        assigned_user_id:
          values.assigned_user_id === UNASSIGNED ? null : Number(values.assigned_user_id),
        expected_close_date: values.expected_close_date || null,
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Editar oportunidad" : "Nueva oportunidad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="opportunity-form"
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
              name="customer_id"
              render={({ field }) => (
                <FormItem className="col-span-2">
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
                    <Input type="number" step="0.01" min={0} {...field} />
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
                  <FormItem className="col-span-2">
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
          <Button type="submit" form="opportunity-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
