import type { Metadata } from "next"
import { BadgeCheck, Boxes, History, RotateCcw, ShieldCheck, UsersRound } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, Section, cardHover } from "@/components/marketing/marketing-ui"

export const metadata: Metadata = {
  title: "Seguridad y control",
  description:
    "Roles y permisos por módulo, auditoría de cada cambio, aislamiento por empresa y borrado reversible. El control de acceso está en toda la plataforma.",
  alternates: { canonical: "/seguridad" },
}

const items = [
  {
    icon: UsersRound,
    title: "Usuarios y roles",
    text: "Cada empleado accede únicamente a las funciones que necesita para su trabajo.",
  },
  {
    icon: BadgeCheck,
    title: "Permisos por módulo",
    text: "CRM, inventario, reportes, usuarios, auditoría y configuración se habilitan por separado. Puedes crear roles a medida.",
  },
  {
    icon: History,
    title: "Auditoría",
    text: "Quién cambió qué y cuándo, con el detalle del cambio y la dirección IP.",
  },
  {
    icon: Boxes,
    title: "Aislamiento por empresa",
    text: "Los datos de cada empresa están separados; nadie ve la información de otra.",
  },
  {
    icon: RotateCcw,
    title: "Nada se pierde por error",
    text: "Eliminar marca el registro como eliminado y lo puedes restaurar cuando quieras.",
  },
  {
    icon: ShieldCheck,
    title: "Acceso protegido",
    text: "Sesión con token y límite de intentos de inicio de sesión.",
  },
]

export default function SeguridadPage() {
  return (
    <>
      <PageHero
        eyebrow="Seguridad y control"
        title="Cada persona ve lo que le corresponde — y todo queda registrado"
        lead="El control de acceso y la trazabilidad no son un módulo aparte: están en toda la plataforma."
        actions={<CtaLink href="/demo">Solicitar demostración</CtaLink>}
      />

      <Section muted>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.04}>
              <Card className={`group h-full ${cardHover}`}>
                <CardContent className="flex gap-4">
                  <item.icon className="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
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
