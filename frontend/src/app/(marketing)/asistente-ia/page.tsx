import type { Metadata } from "next"
import { MessageSquareText, ShieldCheck, Tag, UsersRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { PremiumBadge } from "@/components/marketing/premium-badge"
import { Reveal } from "@/components/marketing/reveal"
import {
  DemoCta,
  FeatureRow,
  Section,
  SectionHeading,
  container,
} from "@/components/marketing/marketing-ui"

export const metadata: Metadata = {
  title: "Asistente IA (premium)",
  description:
    "Complemento premium: un asistente que responde en lenguaje natural sobre los clientes, el inventario y las oportunidades de tu empresa. Se contrata aparte.",
  alternates: { canonical: "/asistente-ia" },
}

const providers = [
  {
    name: "Modo local",
    detail: "Sin proveedor configurado. Devuelve el contexto y la pregunta — sirve para probar el flujo.",
  },
  {
    name: "OpenAI",
    detail: "Respuestas reales con el modelo que elijas (por defecto gpt-4o-mini). Requiere tu API key.",
  },
  {
    name: "Anthropic",
    detail: "Respuestas reales con Claude (por defecto claude-3-5-haiku). Requiere tu API key.",
  },
]

export default function AsistenteIaPage() {
  return (
    <>
      <PageHero
        badge={<PremiumBadge />}
        eyebrow="Asistente IA"
        title="Pregúntale a tus datos"
        lead="Un asistente que responde en lenguaje natural sobre los clientes, el inventario y las oportunidades de tu empresa."
        actions={<CtaLink href="/demo">Consultar precio</CtaLink>}
        note="No automatiza tareas ni ejecuta acciones — responde preguntas sobre un resumen de tus datos."
      />

      {/* Promo strip — this module is a paid add-on */}
      <div className="border-b border-navy/10 bg-navy text-navy-foreground">
        <div
          className={`${container} flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <p className="text-sm leading-6">
              <span className="font-semibold">Este módulo se contrata aparte.</span>{" "}
              No viene incluido en el plan base de CRM + Inventario — se activa como
              complemento con costo adicional.
            </p>
          </div>
          <CtaLink
            href="/demo"
            size="default"
            className="shrink-0 bg-amber-400 text-navy hover:bg-amber-300"
          >
            Consultar precio
          </CtaLink>
        </div>
      </div>

      <div className="border-b bg-card">
        <FeatureRow
          eyebrow="Cómo se usa"
          title="Escribes una pregunta, responde con tus números"
          lead="El asistente arma un resumen de solo lectura de tu empresa y responde sobre eso."
          reverse
          screenshot="/product/ia.png"
          alt="Asistente de IA con preguntas sugeridas sobre stock, oportunidades y movimientos"
          points={[
            {
              icon: MessageSquareText,
              text: "Responde sobre tu operación: stock bajo, pipeline abierto, últimos movimientos.",
            },
            {
              icon: ShieldCheck,
              text: "Solo ve los datos de tu empresa; no cruza información entre empresas.",
            },
            { icon: UsersRound, text: "Disponible para los roles de administración." },
          ]}
        />
      </div>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Proveedor"
            title="Tú eliges qué IA responde"
            lead="El proveedor se configura del lado del servidor; la app funciona igual con o sin él."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {providers.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <Card className="h-full">
                <CardContent>
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{p.detail}</p>
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
