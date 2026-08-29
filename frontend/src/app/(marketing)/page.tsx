import type { Metadata } from "next"
import { ArrowRight, BarChart3, Boxes, ShieldCheck } from "lucide-react"

import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { RippleLink } from "@/components/marketing/ripple"
import {
  DemoCta,
  PlataformaGrid,
  Section,
  SectionHeading,
  TourGrid,
  cardHover,
} from "@/components/marketing/marketing-ui"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

const explore = [
  {
    href: "/producto",
    icon: Boxes,
    title: "Producto",
    text: "El problema que resuelve y cómo se organiza todo en una plataforma.",
  },
  {
    href: "/funciones",
    icon: BarChart3,
    title: "Funciones",
    text: "CRM, control de inventario y reportes, con capturas del sistema real.",
  },
  {
    href: "/seguridad",
    icon: ShieldCheck,
    title: "Seguridad",
    text: "Roles y permisos por módulo, auditoría de cada cambio y aislamiento por empresa.",
  },
]

export default function HomePage() {
  return (
    <>
      <PageHero
        title={
          <>
            CRM + Inventario{" "}
            <span className="animate-marketing-gradient-text bg-[linear-gradient(90deg,var(--primary),#22c55e,var(--primary))] bg-size-[200%_auto] bg-clip-text text-transparent">
              en un solo lugar
            </span>
          </>
        }
        lead={site.description}
        actions={
          <>
            <CtaLink href="/demo">Solicitar demostración</CtaLink>
            <CtaLink href="/producto" variant="outline">
              Ver cómo funciona
            </CtaLink>
          </>
        }
        note="Multiempresa · roles y permisos · auditoría de cada cambio"
        screenshot={{
          src: "/product/dashboard.png",
          alt: "Panel de CRM + Inventario con indicadores de clientes, pipeline y stock",
        }}
      />

      <Section>
        <PlataformaGrid />
      </Section>

      <Section muted>
        <Reveal>
          <SectionHeading
            eyebrow="Explora"
            title="Recorre el sistema por partes"
            lead="Cada página entra en detalle sobre una parte de la plataforma."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {explore.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.06}>
              <RippleLink
                href={item.href}
                className={`group flex h-full flex-col rounded-xl bg-background p-5 ${cardHover}`}
              >
                <item.icon className="size-5 text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Ver más
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </RippleLink>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <TourGrid />
      </Section>

      <DemoCta />
    </>
  )
}
