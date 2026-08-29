import type { NextConfig } from "next"

// Landing-page sections get a real path (e.g. /beneficios) instead of a #hash.
// Each rewrites to "/" so the URL stays clean while serving the one-page site;
// SmoothAnchors scrolls to the matching section on click and on deep-link load.
const sectionSlugs = [
  "producto",
  "funciones",
  "beneficios",
  "asistente-ia",
  "seguridad",
  "demo",
  "contacto",
]

const nextConfig: NextConfig = {
  async rewrites() {
    return sectionSlugs.map((slug) => ({ source: `/${slug}`, destination: "/" }))
  },
}

export default nextConfig
