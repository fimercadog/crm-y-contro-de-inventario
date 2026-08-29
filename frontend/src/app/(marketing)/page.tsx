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
        eyebrow="CRM + Control de inventario"
        title={
          <>
            Tu operación
            <br />
            en un solo lugar
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
        visual="cluster"
      />

      <Section>
        <PlataformaGrid />
      </Section>

      <Section className="border-t border-border">
        <Reveal>
          <SectionHeading
            eyebrow="Explora"
            title="Recorre el sistema por partes"
            lead="Cada página entra en detalle sobre una parte de la plataforma."
          />
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
          {explore.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.06}>
              <RippleLink
                href={item.href}
                className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-6 ${cardHover}`}
              >
                <span className="grid size-11 place-items-center rounded-xl border border-border text-primary transition-colors group-hover:border-primary/50">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-bold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Ver más
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </RippleLink>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <TourGrid />
      </Section>

      <DemoCta />
    </>
  )
}
