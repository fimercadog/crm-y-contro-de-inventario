import Link from "next/link"
import { Boxes } from "lucide-react"

import { site } from "@/lib/site"

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Producto", href: "/producto" },
      { label: "Funciones", href: "/funciones" },
      { label: "Beneficios", href: "/beneficios" },
      { label: "Asistente IA", href: "/asistente-ia" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Seguridad", href: "/seguridad" },
      { label: "Solicitar demo", href: "/demo" },
      { label: "Iniciar sesión", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [...site.legal],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
              <Boxes className="size-5" />
            </span>
            <span className="text-base font-black tracking-tight">
              CRM<span className="text-primary">+</span>Inventario
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{site.description}</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} CRM + Inventario. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
