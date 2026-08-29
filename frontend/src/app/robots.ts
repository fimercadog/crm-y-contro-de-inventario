import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The application itself is behind auth; no value in crawling it.
        disallow: ["/dashboard", "/crm/", "/inventario/", "/admin/", "/reportes", "/ia"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
