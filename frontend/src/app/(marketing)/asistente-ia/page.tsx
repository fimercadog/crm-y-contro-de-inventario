import type { Metadata } from "next"
import { MessageSquareText, ShieldCheck, Sparkles, UsersRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, FeatureRow, Section, SectionHeading } from "@/components/marketing/marketing-ui"

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
        badge={
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            Complemento premium · se contrata aparte
          </Badge>
        }
        eyebrow="Asistente IA"
        title="Pregúntale a tus datos"
        lead="Un asistente que responde en lenguaje natural sobre los clientes, el inventario y las oportunidades de tu empresa."
        actions={<CtaLink href="/demo">Consultar precio</CtaLink>}
        note="No viene en el plan base. No automatiza tareas ni ejecuta acciones — responde preguntas sobre un resumen de tus datos."
      />

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
