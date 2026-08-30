import type { Metadata } from "next"
import { Check } from "lucide-react"

import { DemoContactForm } from "@/components/marketing/demo-contact-form"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { ContactChannels, Section } from "@/components/marketing/marketing-ui"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Solicita una demostración",
  description:
    "Te mostramos CRM + Inventario con tus casos de uso y resolvemos tus dudas. Escríbenos por WhatsApp o correo.",
  alternates: { canonical: "/demo" },
}

const includes = [
  "Recorrido por CRM, inventario y reportes con datos parecidos a los tuyos.",
  "Cómo se configuran roles, permisos y el aislamiento por empresa.",
  "Resolución de dudas sobre migración de tus datos actuales.",
  "Si aplica, cómo se activa el asistente de IA (complemento premium).",
]

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Demo"
        title="Solicita una demostración"
        lead="Te mostramos el sistema con tus casos de uso y resolvemos tus dudas. Sin compromiso."
        actions={<ContactChannels />}
        note={
          site.whatsappUrl
            ? undefined
            : "El canal de WhatsApp se activa configurando NEXT_PUBLIC_WHATSAPP."
        }
      />

      <Section className="border-t border-border">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-2xl font-black tracking-tight">Qué incluye la demo</h2>
          </Reveal>
          <ul className="mt-8 grid gap-3">
            {includes.map((text, i) => (
              <Reveal key={text} delay={i * 0.05}>
                <li className="flex gap-3 text-sm leading-6">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{text}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="border-t border-border">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <h2 className="text-2xl font-black tracking-tight">Escríbenos</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cuéntanos qué necesitas y te contactamos. Al enviar se abre tu correo con el mensaje
              listo.
            </p>
          </Reveal>
          <div className="mt-8">
            <DemoContactForm />
          </div>
        </div>
      </Section>
    </>
  )
}
