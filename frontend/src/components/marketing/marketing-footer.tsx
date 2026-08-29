import Link from "next/link"
import { Boxes } from "lucide-react"

import { site } from "@/lib/site"

export function MarketingFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="size-4" />
              </span>
              <span className="text-sm font-bold">CRM + Inventario</span>
            </div>
            <p className="mt-3 text-sm text-navy-foreground/70">{site.description}</p>
          </div>

          <nav className="flex flex-wrap gap-x-10 gap-y-2" aria-label="Pie de página">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-navy-foreground/70 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CRM + Inventario. Todos los derechos reservados.</p>
          <a
            href="/demo"
            className="font-medium underline underline-offset-4 hover:text-navy-foreground"
          >
            Solicitar una demostración
          </a>
        </div>
      </div>
    </footer>
  )
}
