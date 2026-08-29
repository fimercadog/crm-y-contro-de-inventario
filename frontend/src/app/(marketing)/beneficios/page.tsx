import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, Section, cardHover } from "@/components/marketing/marketing-ui"

export const metadata: Metadata = {
  title: "Beneficios",
  description:
    "Lo que cambia en tu operación con CRM + Inventario: menos oportunidades olvidadas, control real del stock y trazabilidad de cada acción.",
  alternates: { canonical: "/beneficios" },
}

const benefits = [
  {
    fn: "CRM + actividades",
    benefit: "Menos oportunidades olvidadas: cada una tiene etapa, responsable y próximas acciones.",
  },
  {
    fn: "Stock + movimientos",
    benefit: "Control real sobre las existencias, no un número que nadie mantiene.",
  },
  {
    fn: "Cotización en la oportunidad",
    benefit: "El monto de venta sale de productos y precios reales, no de un cálculo aparte.",
  },
  {
    fn: "Roles y permisos",
    benefit: "Cada empleado ve lo que le corresponde y nada más.",
  },
  {
    fn: "Auditoría",
    benefit: "Trazabilidad sobre las acciones: siempre sabes quién hizo qué.",
  },
  {
    fn: "Reportes + exportación",
    benefit: "Información lista para analizar en Excel o compartir en PDF.",
  },
]

export default function BeneficiosPage() {
  return (
    <>
      <PageHero
        eyebrow="Beneficios"
        title="Cada beneficio sale de una función que ya existe"
        lead="Nada de promesas genéricas: esto es lo que cambia en tu operación cuando todo vive en un mismo sistema."
        actions={<CtaLink href="/demo">Solicitar demostración</CtaLink>}
      />

      <Section muted>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((b, i) => (
            <Reveal key={b.fn} delay={i * 0.04}>
              <Card className={`h-full ${cardHover}`}>
                <CardContent>
                  <Badge variant="secondary">{b.fn}</Badge>
                  <p className="mt-3 text-sm leading-6">{b.benefit}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </>
  )
}
