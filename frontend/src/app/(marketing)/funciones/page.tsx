import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  FileDown,
  Handshake,
  KanbanSquare,
  PackageSearch,
  ShieldCheck,
  Undo2,
  UsersRound,
} from "lucide-react"

import { CtaLink } from "@/components/marketing/cta-link"
import { PageHero } from "@/components/marketing/page-hero"
import { PremiumBadge } from "@/components/marketing/premium-badge"
import { Reveal } from "@/components/marketing/reveal"
import { DemoCta, FeatureRow, Section } from "@/components/marketing/marketing-ui"

export const metadata: Metadata = {
  title: "Funciones",
  description:
    "CRM con pipeline y actividades, control de inventario con movimientos, y cuatro reportes exportables a CSV o PDF.",
  alternates: { canonical: "/funciones" },
}

export default function FuncionesPage() {
  return (
    <>
      <PageHero
        eyebrow="Funciones"
        title="Lo que hace el sistema"
        lead="Tres bloques que trabajan juntos: CRM, control de inventario y reportes. Todo lo de abajo está verificado contra el producto real."
        actions={<CtaLink href="/demo">Solicitar demostración</CtaLink>}
      />

      <div className="border-b bg-card">
        <FeatureRow
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
            {
              icon: KanbanSquare,
              text: "Pipeline Kanban: arrastra la oportunidad entre etapas y queda registrado.",
            },
            {
              icon: ClipboardList,
              text: "Actividades — llamadas, reuniones, tareas y seguimientos — ligadas a un cliente u oportunidad.",
            },
            { icon: FileDown, text: "Exporta cualquier lista a CSV o PDF respetando los filtros activos." },
          ]}
        />
      </div>

      <FeatureRow
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

      <div className="border-y bg-card">
        <FeatureRow
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

      <Section>
        <Reveal>
          <Link
            href="/asistente-ia"
            className="group flex flex-col gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-3">
              <PremiumBadge className="w-fit" />
              <p className="text-sm leading-6 text-muted-foreground">
                El <span className="font-medium text-foreground">Asistente IA</span> responde
                preguntas sobre tus datos en lenguaje natural. Es un complemento de pago aparte
                del plan base.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
              Ver el asistente
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </span>
          </Link>
        </Reveal>
      </Section>

      <DemoCta />
    </>
  )
}
