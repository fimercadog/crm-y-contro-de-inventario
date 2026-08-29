import type { Metadata } from "next"

import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, Section } from "@/components/marketing/marketing-ui"

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
        title="Cada beneficio sale de una función real"
        lead="Nada de promesas genéricas: esto es lo que cambia en tu operación cuando todo vive en un mismo sistema."
        actions={<CtaLink href="/demo">Solicitar demostración</CtaLink>}
      />

      <Section className="border-t border-border">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {benefits.map((b, i) => (
            <Reveal key={b.fn} delay={i * 0.04}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {b.fn}
                </span>
                <p className="mt-3 text-sm leading-6">{b.benefit}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </>
  )
}
