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
  whatsappNumber,
  whatsappUrl: whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hola, quiero una demostración de CRM + Inventario."
      )}`
    : null,
  nav: [
    { label: "Producto", href: "/producto" },
    { label: "Funciones", href: "/funciones" },
    { label: "Beneficios", href: "/beneficios" },
    { label: "IA", href: "/asistente-ia" },
    { label: "Seguridad", href: "/seguridad" },
    { label: "Demo", href: "/demo" },
    { label: "Contacto", href: "/contacto" },
  ],
} as const

/**
 * Landing section paths (no #hash) → id of the section element on `/`.
 * Kept in sync with the rewrites in next.config.ts. SmoothAnchors uses this
 * to scroll on click and on deep-link load while keeping the clean URL.
 */
export const landingSections: Record<string, string> = {
  "/producto": "producto",
  "/funciones": "funciones",
  "/beneficios": "beneficios",
  "/asistente-ia": "ia",
  "/seguridad": "seguridad",
  "/demo": "demo",
  "/contacto": "contacto",
}
