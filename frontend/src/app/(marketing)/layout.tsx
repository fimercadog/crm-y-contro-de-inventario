import type { Metadata } from "next"

import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { WhatsappFab } from "@/components/marketing/whatsapp-fab"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "CRM",
    "control de inventario",
    "gestión de clientes",
    "pipeline de ventas",
    "control de stock",
    "software para pymes",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-theme flex min-h-svh flex-col scroll-smooth bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <WhatsappFab />
    </div>
  )
}
