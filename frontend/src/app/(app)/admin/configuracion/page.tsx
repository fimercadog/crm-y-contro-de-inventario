"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAppSelector } from "@/lib/hooks"
import type { Company } from "@/features/company/types"

const companySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  tax_id: z.string().nullable().optional(),
  email: z.string().email("Correo inválido").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  currency: z.string().length(3, "Usa un código de 3 letras (USD, EUR...)"),
  allow_negative_stock: z.boolean(),
})

type CompanyValues = z.infer<typeof companySchema>

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()
  const roles = useAppSelector((state) => state.auth.user?.roles ?? [])
  const canEdit = roles.includes("super-admin") || roles.includes("administrador")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      tax_id: "",
      email: "",
      phone: "",
      address: "",
      currency: "USD",
      allow_negative_stock: false,
    },
  })

  useEffect(() => {
    api.get<{ data: Company }>("/company").then(({ data }) => {
      form.reset({
        name: data.data.name,
        tax_id: data.data.tax_id ?? "",
        email: data.data.email ?? "",
        phone: data.data.phone ?? "",
        address: data.data.address ?? "",
        currency: data.data.currency,
        allow_negative_stock: data.data.allow_negative_stock,
      })
      setIsLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: CompanyValues) {
    setIsSaving(true)
    try {
      await api.put("/company", values)
      toast.success("Configuración de la empresa actualizada")
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>
            Datos generales de la empresa y configuración de inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form
                id="company-form"
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
                        <Input disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIT / identificación fiscal</FormLabel>
                      <FormControl>
                        <Input disabled={!canEdit} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo</FormLabel>
                        <FormControl>
                          <Input disabled={!canEdit} {...field} value={field.value ?? ""} />
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
                          <Input disabled={!canEdit} {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input disabled={!canEdit} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!canEdit}
                          maxLength={3}
                          className="w-24 uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allow_negative_stock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Permitir stock negativo</FormLabel>
                        <FormDescription>
                          Si está desactivado, InventoryService rechaza salidas que dejen el
                          stock por debajo de cero.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={!canEdit}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </CardContent>
        {canEdit && (
          <CardFooter className="justify-end">
            <Button type="submit" form="company-form" disabled={isLoading || isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige cómo se ve la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={theme === option.value ? "default" : "outline"}
              onClick={() => setTheme(option.value)}
            >
              <option.icon />
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
