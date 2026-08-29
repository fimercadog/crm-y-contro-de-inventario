import type { Metadata } from "next"
import {
  BadgeCheck,
  BarChart3,
  Boxes,
  ClipboardList,
  FileDown,
  Handshake,
  History,
  KanbanSquare,
  MessageSquareText,
  PackageSearch,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Undo2,
  UsersRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaLink } from "@/components/marketing/cta-link"
import { HeroBackdrop } from "@/components/marketing/hero-backdrop"
import { Reveal } from "@/components/marketing/reveal"
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"

// Card lift on hover — same micro-interaction as the FidelOS landing.
const cardHover =
  "transition duration-300 hover:-translate-y-1.5 hover:shadow-(--marketing-shadow) motion-reduce:transition-none motion-reduce:hover:translate-y-0"

function SectionHeading({
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

function FeatureRow({
  id,
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
  id: string
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
    <section id={id} className="scroll-mt-24 py-20">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-2`}>
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
    </section>
  )
}

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden border-b">
        <HeroBackdrop />
        <div className={`${container} grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24`}>
          <div>
            <Reveal mount>
              <Badge variant="secondary" className="mb-5">
                CRM + Control de Inventario
              </Badge>
            </Reveal>
            <Reveal mount delay={0.1}>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                CRM + Inventario{" "}
                <span className="animate-marketing-gradient-text bg-[linear-gradient(90deg,var(--primary),#22c55e,var(--primary))] bg-size-[200%_auto] bg-clip-text text-transparent">
                  en un solo lugar
                </span>
              </h1>
            </Reveal>
            <Reveal mount delay={0.2}>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                {site.description}
              </p>
            </Reveal>
            <Reveal mount delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink href="#demo">Solicitar demostración</CtaLink>
                <CtaLink href="#producto" variant="outline">
                  Ver cómo funciona
                </CtaLink>
              </div>
            </Reveal>
            <Reveal mount delay={0.4}>
              <p className="mt-6 text-xs text-muted-foreground">
                Multiempresa · roles y permisos · auditoría de cada cambio
              </p>
            </Reveal>
          </div>
          <Reveal mount zoom delay={0.25}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 animate-marketing-pulse-glow rounded-[2rem] bg-primary/20 blur-3xl"
              />
              <div className="animate-marketing-float">
                <ScreenshotFrame
                  src="/product/dashboard.png"
                  alt="Panel de CRM + Inventario con indicadores de clientes, pipeline y stock"
                  priority
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Problema ---------- */}
      <section className="scroll-mt-24 border-b bg-card py-20">
        <div className={container}>
          <Reveal>
            <SectionHeading
              eyebrow="El problema"
              title="Tu operación repartida en mil lugares"
              lead="La información del día a día vive en hojas de cálculo, chats y sistemas que no se hablan entre sí. Nadie tiene la foto completa."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Datos repartidos entre Excel, WhatsApp y varios sistemas.",
              "Clientes que quedan sin seguimiento.",
              "Oportunidades comerciales que se olvidan.",
              "No saber con certeza cuánto stock hay disponible.",
              "Movimientos de inventario difíciles de rastrear.",
              "Información operativa dispersa y sin trazabilidad.",
            ].map((text, i) => (
              <Reveal key={text} delay={i * 0.05}>
                <Card className={`h-full ${cardHover}`}>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Solución / plataforma ---------- */}
      <section id="producto" className="scroll-mt-24 py-20">
        <div className={container}>
          <Reveal>
            <SectionHeading
              center
              eyebrow="La solución"
              title="Una sola plataforma"
              lead="CRM, inventario, reportes, control de acceso y auditoría sobre la misma base de datos — con un asistente de IA opcional."
            />
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Handshake, label: "CRM" },
              { icon: Boxes, label: "Inventario" },
              { icon: BarChart3, label: "Reportes" },
              { icon: Sparkles, label: "Asistente IA", tag: "Premium" },
              { icon: ShieldCheck, label: "Control de acceso" },
              { icon: History, label: "Auditoría" },
            ].map((item) => (
              <div
                key={item.label}
                className={`group flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-medium shadow-elevation-1 ${cardHover}`}
              >
                <item.icon className="size-4 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" />
                {item.label}
                {"tag" in item && item.tag && (
                  <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px] font-semibold">
                    {item.tag}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CRM ---------- */}
      <div className="border-y bg-card">
        <FeatureRow
          id="funciones"
          eyebrow="CRM"
          title="Convierte contactos y oportunidades en un proceso comercial ordenado"
          lead="Cada cliente, cada conversación y cada oportunidad en un mismo lugar, con un responsable claro."
          screenshot="/product/pipeline.png"
          alt="Tablero Kanban del pipeline de ventas con oportunidades por etapa"
          points={[
            { icon: UsersRound, text: "Clientes y contactos centralizados, con responsable asignado." },
            { icon: Handshake, text: "Oportunidades con etapa, monto y probabilidad." },
            {
              icon: PackageSearch,
              text: "Cotiza productos dentro de la oportunidad: el monto se calcula solo desde el catálogo.",
            },
            { icon: KanbanSquare, text: "Pipeline Kanban: arrastra la oportunidad entre etapas y queda registrado." },
            {
              icon: ClipboardList,
              text: "Actividades — llamadas, reuniones, tareas y seguimientos — ligadas a un cliente u oportunidad.",
            },
            { icon: FileDown, text: "Exporta cualquier lista a CSV o PDF respetando los filtros activos." },
          ]}
        />
      </div>

      {/* ---------- Inventario ---------- */}
      <FeatureRow
        id="inventario"
        eyebrow="Control de inventario"
        title="Saber qué hay disponible y de dónde salió cada unidad"
        lead="El stock deja de ser un número que alguien recuerda: se mueve solo cuando registras una entrada, una salida o un ajuste."
        reverse
        screenshot="/product/movimientos.png"
        alt="Registro consolidado de movimientos de inventario con entradas, salidas y ajustes"
        points={[
          { icon: PackageSearch, text: "Productos con SKU, costo, precio y stock mínimo / máximo." },
          { icon: Boxes, text: "Catálogos de categorías, marcas, unidades y proveedores." },
          {
            icon: ClipboardList,
            text: "Registra entradas, salidas y ajustes por conteo físico. El stock se actualiza en el momento.",
          },
          {
            icon: ShieldCheck,
            text: "No deja el stock en negativo, salvo que tú lo autorices para la empresa.",
          },
          {
            icon: Undo2,
            text: "Corrige o anula un movimiento sin borrarlo: el efecto se revierte y queda con fecha y usuario.",
          },
          { icon: BarChart3, text: "Vista de stock con valor en existencias y alertas de stock bajo." },
        ]}
        note="Movimientos es un registro consolidado de solo lectura. Los ajustes de stock inicial no se modifican."
      />

      {/* ---------- Reportes ---------- */}
      <div className="border-y bg-card">
        <FeatureRow
          id="reportes"
          eyebrow="Reportes"
          title="Información preparada para decidir"
          lead="Cuatro reportes agregados sobre tus datos, listos para consultar y exportar."
          screenshot="/product/reportes.png"
          alt="Pantalla de reportes con inventario valorizado y oportunidades por etapa"
          points={[
            { icon: BarChart3, text: "Inventario valorizado por categoría." },
            { icon: BarChart3, text: "Resumen de movimientos por tipo y período." },
            { icon: BarChart3, text: "Oportunidades abiertas por etapa del pipeline." },
            { icon: BarChart3, text: "Ventas por producto sobre oportunidades ganadas." },
            { icon: FileDown, text: "Cada reporte se exporta a CSV o PDF." },
          ]}
          note="Los reportes se consultan cuando los necesitas; todavía no hay envíos programados por correo."
        />
      </div>

      {/* ---------- IA ---------- */}
      <FeatureRow
        id="ia"
        premium
        eyebrow="Asistente IA"
        title="Pregúntale a tus datos"
        lead="Un asistente que responde en lenguaje natural sobre los clientes, el inventario y las oportunidades de tu empresa."
        reverse
        screenshot="/product/ia.png"
        alt="Asistente de IA respondiendo una pregunta sobre productos con stock bajo"
        points={[
          {
            icon: MessageSquareText,
            text: "Responde sobre tu operación: stock bajo, pipeline abierto, últimos movimientos.",
          },
          { icon: ShieldCheck, text: "Solo ve los datos de tu empresa; no cruza información entre empresas." },
          {
            icon: Sparkles,
            text: "Se conecta con OpenAI o Anthropic (lo configuras tú). Sin proveedor, funciona en modo local de demostración.",
          },
          { icon: UsersRound, text: "Disponible para los roles de administración." },
        ]}
        note="Complemento premium: no viene en el plan base, se contrata aparte. No automatiza tareas ni ejecuta acciones — responde preguntas sobre un resumen de tus datos."
      />

      {/* ---------- Seguridad ---------- */}
      <section id="seguridad" className="scroll-mt-24 border-y bg-card py-20">
        <div className={container}>
          <Reveal>
            <SectionHeading
              eyebrow="Seguridad y control"
              title="Cada persona ve lo que le corresponde — y todo queda registrado"
              lead="El control de acceso y la trazabilidad no son un módulo aparte: están en toda la plataforma."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
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
            ].map((item, i) => (
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
        </div>
      </section>

      {/* ---------- Tour de producto ---------- */}
      <section className="scroll-mt-24 py-20">
        <div className={container}>
          <Reveal>
            <SectionHeading
              center
              eyebrow="El producto real"
              title="Así se ve por dentro"
              lead="Capturas del sistema en funcionamiento — no maquetas."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              { src: "/product/clientes.png", alt: "Listado de clientes con filtros y exportación" },
              { src: "/product/productos.png", alt: "Catálogo de productos con estado de stock" },
              { src: "/product/stock.png", alt: "Vista de stock con valor en existencias" },
              { src: "/product/auditoria.png", alt: "Bitácora de auditoría con el detalle de cada cambio" },
            ].map((shot, i) => (
              <Reveal key={shot.src} zoom delay={i * 0.08}>
                <ScreenshotFrame
                  src={shot.src}
                  alt={shot.alt}
                  className={cardHover}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Beneficios ---------- */}
      <section id="beneficios" className="scroll-mt-24 border-y bg-card py-20">
        <div className={container}>
          <Reveal>
            <SectionHeading
              eyebrow="Beneficios"
              title="Cada beneficio sale de una función que ya existe"
              lead="Nada de promesas genéricas: esto es lo que cambia en tu operación."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
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
            ].map((b, i) => (
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
        </div>
      </section>

      {/* ---------- Demo / CTA final ---------- */}
      <section id="demo" className="scroll-mt-24 py-20">
        <div className={container}>
          <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-14 text-navy-foreground shadow-elevation-2 sm:px-12">
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
              <div id="contacto" className="mt-8 flex flex-wrap gap-3 scroll-mt-24">
                {site.whatsappUrl ? (
                  <CtaLink href={site.whatsappUrl}>Escríbenos por WhatsApp</CtaLink>
                ) : null}
                <CtaLink
                  href={`mailto:${site.email}?subject=Solicitud de demostración`}
                  variant="secondary"
                >
                  Solicitar una demostración
                </CtaLink>
                <CtaLink
                  href="/login"
                  variant="ghost"
                  className="text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
                >
                  Ya tengo cuenta
                </CtaLink>
              </div>
              {!site.whatsappUrl && (
                <p className="mt-4 text-xs text-navy-foreground/70">
                  El canal de WhatsApp se activa configurando <code>NEXT_PUBLIC_WHATSAPP</code>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
