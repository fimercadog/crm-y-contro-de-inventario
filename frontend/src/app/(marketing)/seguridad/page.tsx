import type { Metadata } from "next"
import { BadgeCheck, Boxes, History, RotateCcw, ShieldCheck, UsersRound } from "lucide-react"

import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, FeatureCard, Section } from "@/components/marketing/marketing-ui"

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
        title="Cada persona ve lo que le corresponde"
        lead="El control de acceso y la trazabilidad no son un módulo aparte: están en toda la plataforma, y todo queda registrado."
        actions={<CtaLink href="/demo">Solicitar demostración</CtaLink>}
        visual="screenshot"
        screenshot={{ src: "/product/auditoria.png", alt: "Bitácora de auditoría con el detalle de cada cambio" }}
      />

      <Section className="border-t border-border">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.04}>
              <FeatureCard icon={item.icon} title={item.title} text={item.text} />
            </Reveal>
          ))}
        </div>
      </Section>

      <DemoCta />
    </>
  )
}
