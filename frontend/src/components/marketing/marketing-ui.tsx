import {
  BarChart3,
  Boxes,
  Handshake,
  History,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { CtaLink } from "@/components/marketing/cta-link"
import { Reveal } from "@/components/marketing/reveal"
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame"
import { site } from "@/lib/site"

export const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"

/** Card lift on hover — same micro-interaction as the FidelOS landing. */
export const cardHover =
  "transition duration-300 hover:-translate-y-1.5 hover:shadow-(--marketing-shadow) motion-reduce:transition-none motion-reduce:hover:translate-y-0"

export function Section({
  children,
  muted = false,
  className,
}: {
  children: React.ReactNode
  muted?: boolean
  className?: string
}) {
  return (
    <section className={`${muted ? "border-y bg-card" : ""} py-20 ${className ?? ""}`}>
      <div className={container}>{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = false,
}: {
  eyebrow: string
  title: string
  lead?: string
  center?: boolean
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-lg leading-8 text-muted-foreground">{lead}</p>}
    </div>
  )
}

export function FeatureRow({
  eyebrow,
  title,
  lead,
  points,
  screenshot,
  alt,
  reverse = false,
  note,
  premium = false,
}: {
  eyebrow: string
  title: string
  lead: string
  points: { icon: React.ElementType; text: string }[]
  screenshot: string
  alt: string
  reverse?: boolean
  note?: string
  premium?: boolean
}) {
  return (
    <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-2`}>
      <Reveal className={reverse ? "lg:order-2" : undefined}>
        {premium && (
          <Badge variant="secondary" className="mb-4 gap-1">
            <Sparkles className="size-3" />
            Complemento premium · se contrata aparte
          </Badge>
        )}
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
        <ul className="mt-8 space-y-3">
          {points.map((p) => (
            <li key={p.text} className="group flex gap-3 text-sm leading-6">
              <p.icon className="mt-0.5 size-4 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
        {note && <p className="mt-6 text-xs text-muted-foreground">{note}</p>}
      </Reveal>
      <Reveal zoom delay={0.12} className={reverse ? "lg:order-1" : undefined}>
        <ScreenshotFrame src={screenshot} alt={alt} className={cardHover} />
      </Reveal>
    </div>
  )
}

const platformItems = [
  { icon: Handshake, label: "CRM" },
  { icon: Boxes, label: "Inventario" },
  { icon: BarChart3, label: "Reportes" },
  { icon: Sparkles, label: "Asistente IA", tag: "Premium" },
  { icon: ShieldCheck, label: "Control de acceso" },
  { icon: History, label: "Auditoría" },
]

export function PlataformaGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          center
          eyebrow="La solución"
          title="Una sola plataforma"
          lead="CRM, inventario, reportes, control de acceso y auditoría sobre la misma base de datos — con un asistente de IA opcional."
        />
      </Reveal>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
        {platformItems.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.04}>
            <div
              className={`group flex h-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-medium shadow-elevation-1 ${cardHover}`}
            >
              <item.icon className="size-4 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
              {item.label}
              {"tag" in item && item.tag && (
                <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px] font-semibold">
                  {item.tag}
                </Badge>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

const tourShots = [
  { src: "/product/clientes.png", alt: "Listado de clientes con filtros y exportación" },
  { src: "/product/productos.png", alt: "Catálogo de productos con estado de stock" },
  { src: "/product/stock.png", alt: "Vista de stock con valor en existencias" },
  { src: "/product/auditoria.png", alt: "Bitácora de auditoría con el detalle de cada cambio" },
]

export function TourGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          center
          eyebrow="El producto real"
          title="Así se ve por dentro"
          lead="Capturas del sistema en funcionamiento — no maquetas."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {tourShots.map((shot, i) => (
          <Reveal key={shot.src} zoom delay={i * 0.08}>
            <ScreenshotFrame src={shot.src} alt={shot.alt} className={cardHover} />
          </Reveal>
        ))}
      </div>
    </>
  )
}

/** Navy CTA band — closes every marketing page. */
export function DemoCta() {
  return (
    <Section>
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-2xl bg-navy px-6 py-14 text-navy-foreground shadow-elevation-2 sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_100%_0%,rgba(47,208,122,0.18),transparent)]"
          />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Conoce cómo CRM + Inventario puede organizar tu operación
            </h2>
            <p className="mt-4 text-lg leading-8 text-navy-foreground/80">
              Te mostramos el sistema con tus casos de uso y resolvemos tus dudas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/demo">Solicitar demostración</CtaLink>
              <CtaLink
                href="/login"
                variant="ghost"
                className="text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
              >
                Ya tengo cuenta
              </CtaLink>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/** Contact channels — WhatsApp / email / login. Used on /demo. */
export function ContactChannels() {
  return (
    <div className="flex flex-wrap gap-3">
      {site.whatsappUrl ? (
        <CtaLink href={site.whatsappUrl}>Escríbenos por WhatsApp</CtaLink>
      ) : null}
      <CtaLink
        href={`mailto:${site.email}?subject=Solicitud de demostración`}
        variant={site.whatsappUrl ? "outline" : "default"}
      >
        Escríbenos por correo
      </CtaLink>
      <CtaLink href="/login" variant="ghost">
        Ya tengo cuenta
      </CtaLink>
    </div>
  )
}
