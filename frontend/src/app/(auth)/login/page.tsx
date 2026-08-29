"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Boxes, ClipboardList, Loader2, Building2, ShieldCheck } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAppDispatch } from "@/lib/hooks"
import { login } from "@/features/auth/authSlice"

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

type LoginValues = z.infer<typeof loginSchema>

const demoUsers = [
  { label: "Super Admin", email: "superadmin@distribuidoraandina.com" },
  { label: "Administrador", email: "admin@distribuidoraandina.com" },
  { label: "Comercial", email: "comercial@distribuidoraandina.com" },
  { label: "Inventario", email: "inventario@distribuidoraandina.com" },
  { label: "Vendedor", email: "vendedor@distribuidoraandina.com" },
]

const featureItems = [
  { label: "Seguro", icon: ShieldCheck },
  { label: "Multiempresa", icon: Building2 },
  { label: "Flujos claros", icon: ClipboardList },
]

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeDemoEmail, setActiveDemoEmail] = useState<string>()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@distribuidoraandina.com", password: "password" },
  })

  async function submitLogin(values: LoginValues, demoEmail?: string) {
    setIsSubmitting(true)
    setActiveDemoEmail(demoEmail)
    try {
      await dispatch(login(values)).unwrap()
      router.push("/dashboard")
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined)
        : undefined
      toast.error(message ?? "No se pudo iniciar sesión")
    } finally {
      setIsSubmitting(false)
      setActiveDemoEmail(undefined)
    }
  }

  function handleDemoLogin(email: string) {
    const values = { email, password: "password" }
    form.reset(values)
    void submitLogin(values, email)
  }

  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section className="flex min-h-[40svh] flex-col justify-center bg-primary px-6 py-10 text-primary-foreground sm:px-10 lg:min-h-svh lg:px-14 xl:px-20">
        <div className="max-w-md">
          <div className="mb-14 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
            <Boxes className="size-4" />
            CRM + Inventario
          </div>

          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Gestiona clientes, ventas e inventario desde un solo lugar
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/80">
            Contactos, oportunidades, productos, stock y movimientos conectados en una sola
            plataforma.
          </p>

          <div className="mt-9 flex max-w-sm flex-col gap-3">
            {featureItems.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="flex h-11 items-center gap-3 rounded-lg bg-white/10 px-4 text-xs font-medium"
                >
                  <Icon className="size-4" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-90">
          <div className="mb-7 flex justify-center">
            <div className="flex h-11 items-center gap-2 rounded-lg border bg-card px-4 shadow-elevation-1">
              <Boxes className="size-5 text-primary" />
              <div className="leading-none">
                <div className="text-sm font-bold">CRM</div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-primary">
                  Inventario
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-semibold">Iniciar sesión</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Usa un usuario demo para entrar al panel y probar roles.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => submitLogin(values))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Correo</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="Correo" {...field} />
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
                    <FormLabel className="sr-only">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="button"
                className="ml-auto block text-[11px] font-medium text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
                {isSubmitting && !activeDemoEmail && <Loader2 className="animate-spin" />}
                Entrar al panel
              </Button>
            </form>
          </Form>

          <div className="mt-6 rounded-xl border bg-card p-3 shadow-elevation-1">
            <div className="mb-3 px-1">
              <h3 className="text-xs font-semibold">Usuarios demo</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Password para todos: password
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleDemoLogin(user.email)}
                  disabled={isSubmitting}
                  className="rounded-lg border px-3 py-2 text-left transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-xs font-semibold">{user.label}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                    {activeDemoEmail === user.email && (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
