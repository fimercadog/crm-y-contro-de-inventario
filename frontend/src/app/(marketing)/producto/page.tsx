import type { Metadata } from "next"

import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import {
  DemoCta,
  PlataformaGrid,
  Section,
  SectionHeading,
  TourGrid,
} from "@/components/marketing/marketing-ui"

export const metadata: Metadata = {
  title: "Producto",
  description:
    "Qué problema resuelve CRM + Inventario y cómo centraliza clientes, oportunidades, productos, stock y movimientos en una sola plataforma.",
  alternates: { canonical: "/producto" },
}

const problems = [
  "Datos repartidos entre Excel, WhatsApp y varios sistemas.",
  "Clientes que quedan sin seguimiento.",
  "Oportunidades comerciales que se olvidan.",
  "No saber con certeza cuánto stock hay disponible.",
  "Movimientos de inventario difíciles de rastrear.",
  "Información operativa dispersa y sin trazabilidad.",
]

export default function ProductoPage() {
  return (
    <>
      <PageHero
        eyebrow="Producto"
        title="Toda tu operación en una plataforma"
        lead="Clientes, oportunidades, productos, stock y movimientos sobre la misma base de datos, con control de acceso y auditoría en todo."
        actions={
          <>
            <CtaLink href="/demo">Solicitar demostración</CtaLink>
            <CtaLink href="/funciones" variant="outline">
              Ver funciones
            </CtaLink>
          </>
        }
        visual="screenshot"
        screenshot={{
          src: "/product/dashboard.png",
          alt: "Panel de CRM + Inventario con indicadores de clientes, pipeline y stock",
        }}
      />

      <Section className="border-t border-border">
        <Reveal>
          <SectionHeading
            eyebrow="El problema"
            title="Tu operación repartida en mil lugares"
            lead="La información del día a día vive en hojas de cálculo, chats y sistemas que no se hablan entre sí. Nadie tiene la foto completa."
          />
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((text, i) => (
            <Reveal key={text} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
                {text}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border">
        <PlataformaGrid />
      </Section>

      <Section className="border-t border-border">
        <TourGrid />
      </Section>

      <DemoCta />
    </>
  )
}
