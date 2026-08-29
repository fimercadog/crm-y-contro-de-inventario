import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import {
  DemoCta,
  PlataformaGrid,
  Section,
  SectionHeading,
  TourGrid,
  cardHover,
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
      />

      <Section muted>
        <Reveal>
          <SectionHeading
            eyebrow="El problema"
            title="Tu operación repartida en mil lugares"
            lead="La información del día a día vive en hojas de cálculo, chats y sistemas que no se hablan entre sí. Nadie tiene la foto completa."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((text, i) => (
            <Reveal key={text} delay={i * 0.05}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <PlataformaGrid />
      </Section>

      <Section muted>
        <TourGrid />
      </Section>

      <DemoCta />
    </>
  )
}
