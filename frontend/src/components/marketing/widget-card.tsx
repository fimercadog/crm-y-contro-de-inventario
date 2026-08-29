import { cn } from "@/lib/utils"

/**
 * The dark rounded "UI widget" cards from the Divi SaaS Product layout —
 * a gauge, a bar chart, a headline stat, or a contact chip. Rendered in
 * overlapping clusters (`WidgetCluster`) over a gradient blob.
 */

function Gauge({ value }: { value: number }) {
  return (
    <div className="relative size-24">
      <div
        className="size-full rounded-full"
        style={{
          background: `conic-gradient(var(--primary) ${value * 3.6}deg, #2b2b2e 0)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-ink" />
      <span className="absolute inset-0 grid place-items-center text-xl font-bold text-white">
        {value}%
      </span>
    </div>
  )
}

function Bars() {
  const heights = [45, 72, 38, 90, 55, 78, 48]
  return (
    <div className="flex h-20 items-end gap-1.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-t-sm"
          style={{ height: `${h}%`, background: "var(--primary)" }}
        />
      ))}
    </div>
  )
}

function Spark() {
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" fill="none" aria-hidden>
      <path
        d="M2 30 L20 22 L38 26 L56 12 L74 18 L92 6 L118 14"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type WidgetKind =
  | { kind: "gauge"; value: number; label: string }
  | { kind: "bars"; label: string }
  | { kind: "stat"; value: string; label: string }
  | { kind: "spark"; label: string }
  | { kind: "avatar"; name: string; sub: string }

export function WidgetCard({ w, className }: { w: WidgetKind; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-ink p-4 text-ink-foreground shadow-[0_24px_50px_-12px_rgb(15_16_18/0.4)] ring-1 ring-white/5",
        className
      )}
    >
      {w.kind === "gauge" && (
        <div className="flex flex-col items-center gap-2">
          <Gauge value={w.value} />
          <span className="text-[11px] text-white/55">{w.label}</span>
        </div>
      )}
      {w.kind === "bars" && (
        <div className="flex flex-col gap-2">
          <Bars />
          <span className="text-[11px] text-white/55">{w.label}</span>
        </div>
      )}
      {w.kind === "spark" && (
        <div className="flex flex-col gap-2">
          <Spark />
          <span className="text-[11px] text-white/55">{w.label}</span>
        </div>
      )}
      {w.kind === "stat" && (
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-white">{w.value}</span>
          <span className="text-[11px] text-white/55">{w.label}</span>
        </div>
      )}
      {w.kind === "avatar" && (
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {w.name.charAt(0)}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">{w.name}</span>
            <span className="block text-[11px] text-white/55">{w.sub}</span>
          </span>
        </div>
      )}
    </div>
  )
}

/** Overlapping collage of widget cards, floating over a green gradient blob. */
export function WidgetCluster({ className }: { className?: string }) {
  return (
    <div className={cn("relative min-h-[24rem]", className)}>
      <div
        aria-hidden
        className="absolute left-[8%] top-[6%] size-[78%] animate-marketing-float"
        style={{
          background: "var(--blob)",
          borderRadius: "48% 52% 58% 42% / 52% 45% 55% 48%",
        }}
      />
      <WidgetCard
        w={{ kind: "bars", label: "Movimientos · 14 días" }}
        className="absolute left-0 top-[14%] w-40 -rotate-3"
      />
      <WidgetCard
        w={{ kind: "stat", value: "US$ 65k", label: "Valor en stock" }}
        className="absolute left-[26%] top-0 w-44 rotate-2"
      />
      <WidgetCard
        w={{ kind: "gauge", value: 90, label: "Pipeline ganado" }}
        className="absolute right-[6%] top-[8%] rotate-3"
      />
      <WidgetCard
        w={{ kind: "avatar", name: "Laura Gómez", sub: "Responsable comercial" }}
        className="absolute right-0 bottom-[6%] w-52 -rotate-2"
      />
      <WidgetCard
        w={{ kind: "spark", label: "Ventas del mes" }}
        className="absolute left-[10%] bottom-0 w-44 rotate-1"
      />
    </div>
  )
}
