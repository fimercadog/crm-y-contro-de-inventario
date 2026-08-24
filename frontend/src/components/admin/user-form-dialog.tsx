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
import { IdSelect } from "@/components/forms/id-select"
import { createManagedUser, updateManagedUser } from "@/features/admin/api"
import type { ManagedUser } from "@/features/admin/types"

const roleOptions = [
  { value: "super-admin", label: "Super Admin" },
  { value: "administrador", label: "Administrador" },
  { value: "comercial", label: "Comercial" },
  { value: "inventario", label: "Inventario" },
  { value: "vendedor", label: "Vendedor" },
]

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
]

const baseSchema = {
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  role: z.string().min(1, "Selecciona un rol"),
  status: z.enum(["active", "inactive"]),
}

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, "Mínimo 8 caracteres"),
})

const editSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, "Mínimo 8 caracteres").optional().or(z.literal("")),
})

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: ManagedUser | null
  onSaved: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const schema = user ? editSchema : createSchema
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "", status: "active" },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      user
        ? { name: user.name, email: user.email, password: "", role: user.role, status: user.status }
        : { name: "", email: "", password: "", role: "", status: "active" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        ...(values.password ? { password: values.password } : {}),
      }

      if (user) {
        await updateManagedUser(user.id, payload)
        toast.success("Usuario actualizado")
      } else {
        await createManagedUser({ ...payload, password: values.password! })
        toast.success("Usuario creado")
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo guardar el usuario")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Actualiza los datos, el rol o el estado del usuario."
              : "El usuario podrá iniciar sesión con el correo y la contraseña indicados."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="user-form"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contraseña {user && <span className="text-muted-foreground">(opcional)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <IdSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona un rol"
                    options={roleOptions}
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
                  <IdSelect value={field.value} onChange={field.onChange} options={statusOptions} />
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
          <Button type="submit" form="user-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
