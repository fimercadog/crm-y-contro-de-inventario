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
  /**
   * Permission the API requires for this module (see backend RoleSeeder /
   * policies). The sidebar hides items the current user lacks. Undefined =
   * visible to any authenticated user.
   */
  permission?: string
  /**
   * Paid add-on. Stays visible even without `permission`, but renders locked
   * (padlock + badge, not clickable) as an upsell.
   */
  premium?: boolean
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
      { title: "Clientes", url: "/crm/clientes", icon: Users, permission: "crm.view" },
      { title: "Contactos", url: "/crm/contactos", icon: Contact, permission: "crm.view" },
      { title: "Oportunidades", url: "/crm/oportunidades", icon: Handshake, permission: "crm.view" },
      { title: "Pipeline", url: "/crm/pipeline", icon: KanbanSquare, permission: "crm.view" },
      { title: "Actividades", url: "/crm/actividades", icon: ListChecks, permission: "crm.view" },
    ],
  },
  {
    title: "Inventario",
    items: [
      { title: "Productos", url: "/inventario/productos", icon: Package, permission: "inventory.view" },
      { title: "Categorías", url: "/inventario/categorias", icon: Tags, permission: "inventory.manage" },
      { title: "Marcas", url: "/inventario/marcas", icon: Award, permission: "inventory.manage" },
      { title: "Unidades", url: "/inventario/unidades", icon: Ruler, permission: "inventory.manage" },
      { title: "Proveedores", url: "/inventario/proveedores", icon: Truck, permission: "inventory.manage" },
      { title: "Stock", url: "/inventario/stock", icon: Boxes, permission: "inventory.view" },
      { title: "Movimientos", url: "/inventario/movimientos", icon: ArrowLeftRight, permission: "inventory.manage" },
      { title: "Entradas", url: "/inventario/entradas", icon: ArrowDownToLine, permission: "inventory.manage" },
      { title: "Salidas", url: "/inventario/salidas", icon: ArrowUpFromLine, permission: "inventory.manage" },
    ],
  },
  {
    title: "Análisis",
    items: [
      { title: "Reportes", url: "/reportes", icon: BarChart3, permission: "reports.view" },
      { title: "IA", url: "/ia", icon: Sparkles, badge: "Premium", permission: "ai.use", premium: true },
    ],
  },
  {
    title: "Administración",
    items: [
      { title: "Usuarios", url: "/admin/usuarios", icon: UserCog, permission: "users.manage" },
      { title: "Roles", url: "/admin/roles", icon: ShieldCheck, permission: "users.manage" },
      { title: "Auditoría", url: "/admin/auditoria", icon: History, permission: "audit.view" },
      { title: "Configuración", url: "/admin/configuracion", icon: Settings, permission: "settings.manage" },
    ],
  },
]
