/**
 * Marketing site configuration. Contact channels come from env so the owner
 * can set them without touching code (see .env.local.example).
 */
// Business WhatsApp, international format without "+". Override with NEXT_PUBLIC_WHATSAPP.
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP ?? "573027029498"

export const site = {
  name: "CRM + Inventario",
  tagline: "CRM + Inventario en un solo lugar",
  description:
    "Gestiona clientes, oportunidades, productos, stock y movimientos desde una plataforma que centraliza la operación de tu empresa.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@example.com",
  // Datos del responsable del tratamiento (Ley 1581 de 2012). El propietario
  // debe reemplazar estos valores por los reales antes de publicar.
  company: {
    legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "CRM + Inventario S.A.S.",
    nit: process.env.NEXT_PUBLIC_LEGAL_NIT ?? "79.904.410-4",
    city: process.env.NEXT_PUBLIC_LEGAL_CITY ?? "Bogotá D.C., Colombia",
  },
  whatsappNumber,
  whatsappUrl: whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hola, quiero una demostración de CRM + Inventario."
      )}`
    : null,
  demos: {
    crmInventario: "https://crm-inventario-demo.fidelmercadotech.com/",
    inmobiliaria: "https://crminmobiliaria.fidelmercadotech.com/",
    rrhh: "https://demorrhh.fidelmercadotech.com/",
  },
  nav: [
    { label: "Producto", href: "/producto" },
    { label: "Funciones", href: "/funciones" },
    { label: "Beneficios", href: "/beneficios" },
    { label: "IA", href: "/asistente-ia" },
    { label: "Seguridad", href: "/seguridad" },
    { label: "Demo", href: "/demo" },
  ],
  legal: [
    { label: "Política de privacidad", href: "/privacidad" },
    { label: "Términos y condiciones", href: "/terminos" },
  ],
} as const
