import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Contact,
  Handshake,
  KanbanSquare,
  ListChecks,
  Package,
  Tags,
  Award,
  Ruler,
  Truck,
  Boxes,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Sparkles,
  UserCog,
  ShieldCheck,
  History,
  Settings,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  /** Small tag shown after the label, e.g. "Premium" for paid add-ons. */
  badge?: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: "General",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "CRM",
    items: [
      { title: "Clientes", url: "/crm/clientes", icon: Users },
      { title: "Contactos", url: "/crm/contactos", icon: Contact },
      { title: "Oportunidades", url: "/crm/oportunidades", icon: Handshake },
      { title: "Pipeline", url: "/crm/pipeline", icon: KanbanSquare },
      { title: "Actividades", url: "/crm/actividades", icon: ListChecks },
    ],
  },
  {
    title: "Inventario",
    items: [
      { title: "Productos", url: "/inventario/productos", icon: Package },
      { title: "Categorías", url: "/inventario/categorias", icon: Tags },
      { title: "Marcas", url: "/inventario/marcas", icon: Award },
      { title: "Unidades", url: "/inventario/unidades", icon: Ruler },
      { title: "Proveedores", url: "/inventario/proveedores", icon: Truck },
      { title: "Stock", url: "/inventario/stock", icon: Boxes },
      { title: "Movimientos", url: "/inventario/movimientos", icon: ArrowLeftRight },
      { title: "Entradas", url: "/inventario/entradas", icon: ArrowDownToLine },
      { title: "Salidas", url: "/inventario/salidas", icon: ArrowUpFromLine },
    ],
  },
  {
    title: "Análisis",
    items: [
      { title: "Reportes", url: "/reportes", icon: BarChart3 },
      { title: "IA", url: "/ia", icon: Sparkles, badge: "Premium" },
    ],
  },
  {
    title: "Administración",
    items: [
      { title: "Usuarios", url: "/admin/usuarios", icon: UserCog },
      { title: "Roles", url: "/admin/roles", icon: ShieldCheck },
      { title: "Auditoría", url: "/admin/auditoria", icon: History },
      { title: "Configuración", url: "/admin/configuracion", icon: Settings },
    ],
  },
]
