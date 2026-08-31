import {
  BarChart3,
  Boxes,
  Building2,
  Handshake,
  History,
  UsersRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { CtaLink } from "@/components/marketing/cta-link"
import { DeviceMockup } from "@/components/marketing/device-mockup"
import { GradientBlob } from "@/components/marketing/gradient-blob"
import { Reveal } from "@/components/marketing/reveal"
import { WidgetCluster } from "@/components/marketing/widget-card"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

export const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"

/** Divi feature card: hairline border, small line icon, title, body. */
export const cardHover = "transition-colors duration-200 hover:border-primary/50"

export function Section({
  children,
  dark = false,
  className,
}: {
  children: React.ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <section className={cn(dark && "bg-ink text-ink-foreground", "py-20 lg:py-28", className)}>
      <div className={container}>{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = true,
  dark = false,
}: {
  eyebrow?: string
  title: string
  lead?: string
  center?: boolean
  dark?: boolean
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-8", dark ? "text-white/70" : "text-muted-foreground")}>
          {lead}
        </p>
      )}
    </div>
  )
}

export function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType
  title: string
  text: string
}) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-border bg-card p-6",
        cardHover
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl border border-border text-primary transition-colors group-hover:border-primary/50">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

/** Alternating detail row: copy + pill on one side, widget cluster on the other. */
export function FeatureRow({
  eyebrow,
  title,
  lead,
  points,
  screenshot,
  alt,
  reverse = false,
  note,
  cta = { href: site.demos.crmInventario, label: "Ver demostración" },
}: {
  eyebrow: string
  title: string
  lead: string
  points: { icon: React.ElementType; text: string }[]
  screenshot?: string
  alt?: string
  reverse?: boolean
  note?: string
  cta?: { href: string; label: string }
}) {
  return (
    <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-2`}>
      <Reveal className={reverse ? "lg:order-2" : undefined}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{lead}</p>
        <ul className="mt-7 space-y-3">
          {points.map((p) => (
            <li key={p.text} className="flex gap-3 text-sm leading-6">
              <p.icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
        {note && <p className="mt-5 text-xs text-muted-foreground">{note}</p>}
        <div className="mt-8">
          <CtaLink href={cta.href} variant="outline" size="sm">
            {cta.label}
          </CtaLink>
        </div>
      </Reveal>
      <Reveal delay={0.12} className={cn("relative", reverse ? "lg:order-1" : undefined)}>
        {screenshot ? (
          <>
            <GradientBlob
              className={cn("size-[65%]", reverse ? "left-[-8%] top-[-8%]" : "right-[-8%] top-[-8%]")}
              float
            />
            <DeviceMockup src={screenshot} alt={alt ?? title} tilt={reverse ? "left" : "right"} />
          </>
        ) : (
          <WidgetCluster />
        )}
      </Reveal>
    </div>
  )
}

const useCases = [
  {
    icon: Boxes,
    title: "CRM + Inventario",
    text: "Ventas, clientes, productos, stock y movimientos conectados en una sola operación.",
    href: site.demos.crmInventario,
  },
  {
    icon: Building2,
    title: "CRM inmobiliaria",
    text: "Seguimiento de clientes, inmuebles, oportunidades y proceso comercial inmobiliario.",
    href: site.demos.inmobiliaria,
  },
  {
    icon: UsersRound,
    title: "Recursos humanos",
    text: "Gestión de colaboradores, procesos internos y datos clave del equipo.",
    href: site.demos.rrhh,
  },
]

export function UseCasesGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="Casos de uso"
          title="Elige la demostración que quieres ver"
          lead="Cada demo abre una experiencia separada para que puedas revisar el flujo que más se parece a tu operación."
        />
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {useCases.map((item, i) => (
          <Reveal key={item.href} delay={i * 0.05}>
            <div className={cn("flex h-full flex-col rounded-2xl border border-border bg-card p-6", cardHover)}>
              <span className="grid size-11 place-items-center rounded-xl border border-border text-primary">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-bold">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
              <div className="mt-6">
                <CtaLink href={item.href} variant="outline" size="sm">
                  Ver demostración
                </CtaLink>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

const platformItems = [
  { icon: Handshake, title: "CRM", text: "Clientes, contactos, oportunidades y actividades con responsable claro." },
  { icon: Boxes, title: "Inventario", text: "Productos, catálogos y movimientos que mueven el stock en el momento." },
  { icon: BarChart3, title: "Reportes", text: "Cuatro reportes agregados, exportables a CSV o PDF." },
  { icon: ShieldCheck, title: "Control de acceso", text: "Roles y permisos por módulo, con roles a medida." },
  { icon: History, title: "Auditoría", text: "Quién cambió qué y cuándo, con el detalle y la IP." },
  { icon: Sparkles, title: "Asistente IA", text: "Complemento premium: pregunta en lenguaje natural sobre tus datos." },
]

export function PlataformaGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="La solución"
          title="Una sola plataforma"
          lead="Todo sobre la misma base de datos — con un asistente de IA opcional."
        />
      </Reveal>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platformItems.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <FeatureCard icon={item.icon} title={item.title} text={item.text} />
          </Reveal>
        ))}
      </div>
    </>
  )
}

const tourShots = [
  { src: "/product/clientes.png", alt: "Listado de clientes con filtros y exportación", tilt: "right" as const },
  { src: "/product/stock.png", alt: "Vista de stock con valor en existencias", tilt: "left" as const },
]

export function TourGrid() {
  return (
    <>
      <Reveal>
        <SectionHeading
          eyebrow="El producto real"
          title="Así se ve por dentro"
          lead="Capturas del sistema en funcionamiento — no maquetas."
        />
      </Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {tourShots.map((shot, i) => (
          <Reveal key={shot.src} delay={i * 0.1} className="relative">
            <GradientBlob
              className={cn("size-[55%]", shot.tilt === "right" ? "right-0 top-[-6%]" : "left-0 top-[-6%]")}
            />
            <DeviceMockup src={shot.src} alt={shot.alt} tilt={shot.tilt} />
          </Reveal>
        ))}
      </div>
    </>
  )
}

/** Dark "Get on Track" closing band with a gradient blob and a laptop mockup. */
export function DemoCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-ink-foreground lg:py-28">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-2`}>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Empieza</p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Pon tu operación sobre rieles
          </h2>
          <p className="mt-4 max-w-md text-lg leading-8 text-white/70">
            Te mostramos el sistema con tus casos de uso y resolvemos tus dudas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={site.demos.crmInventario}>Ver demostración</CtaLink>
            <CtaLink
              href="/login"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Ya tengo cuenta
            </CtaLink>
          </div>
        </Reveal>
        <Reveal delay={0.12} className="relative">
          <GradientBlob className="left-[-6%] top-[-10%] size-[70%]" float />
          <DeviceMockup src="/product/dashboard.png" alt="Panel de CRM + Inventario" tilt="left" />
        </Reveal>
      </div>
    </section>
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
