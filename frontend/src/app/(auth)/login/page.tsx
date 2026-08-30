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
import { GradientBlob } from "@/components/marketing/gradient-blob"
import { Reveal } from "@/components/marketing/reveal"
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
    <main className="marketing-theme grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section className="relative isolate flex min-h-[40svh] flex-col justify-center overflow-hidden bg-ink px-6 py-12 text-ink-foreground sm:px-10 lg:min-h-svh lg:px-14 xl:px-20">
        <GradientBlob className="right-[-20%] top-[-10%] size-[70%]" float />
        <GradientBlob className="bottom-[-25%] left-[-15%] size-[55%] opacity-70" />
        <div className="relative max-w-md">
          <Reveal mount>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              CRM + Control de inventario
            </p>
          </Reveal>

          <Reveal mount delay={0.1}>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Tu operación
              <br />
              en un solo lugar
            </h1>
          </Reveal>
          <Reveal mount delay={0.2}>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              Contactos, oportunidades, productos, stock y movimientos conectados en una sola
              plataforma.
            </p>
          </Reveal>

          <div className="mt-9 flex max-w-sm flex-col gap-3">
            {featureItems.map((item, i) => {
              const Icon = item.icon

              return (
                <Reveal mount delay={0.3 + i * 0.08} key={item.label}>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 text-xs font-semibold">
                    <Icon className="size-4 text-primary" />
                    {item.label}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-90">
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
                <Boxes className="size-5" />
              </span>
              <span className="text-base font-black tracking-tight">
                CRM<span className="text-primary">+</span>Inventario
              </span>
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight">Iniciar sesión</h2>
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

              <Button
                type="submit"
                className="h-11 w-full rounded-full text-sm font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting && !activeDemoEmail && <Loader2 className="animate-spin" />}
                Entrar al panel
              </Button>
            </form>
          </Form>

          <div className="mt-6 rounded-2xl border border-border p-3">
            <div className="mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Usuarios demo
              </h3>
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
                  className="rounded-xl border border-border px-3 py-2 text-left transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
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
