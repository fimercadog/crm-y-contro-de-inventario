import { ImageResponse } from "next/og"

import { site } from "@/lib/site"

export const alt = `${site.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #6c5ce7 0%, #5a4bd1 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            CI
          </div>
          CRM + Inventario
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{site.tagline}</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.85)", maxWidth: 900 }}>
            Clientes, oportunidades, productos, stock y movimientos en una sola plataforma.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
