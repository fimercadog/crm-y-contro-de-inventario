import Link from "next/link"
import { Boxes } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Boxes className="size-6" />
      </span>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          La dirección que buscas no existe o cambió de lugar.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants()}>
          Volver al inicio
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}
