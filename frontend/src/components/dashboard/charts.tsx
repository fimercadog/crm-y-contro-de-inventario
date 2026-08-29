"use client"

/**
 * Monochrome charts for the dashboard — the whole app is grayscale, so every
 * chart is a single series (one hue), which sidesteps categorical-palette
 * concerns entirely. Bars carry magnitude; values are labelled directly.
 */

interface BarDatum {
  label: string
  value: number
  hint?: string
}

export function BarList({
  data,
  format = (n) => n.toLocaleString("es-CO"),
  emptyMessage = "Sin datos.",
}: {
  data: BarDatum[]
  format?: (n: number) => string
  emptyMessage?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">{d.label}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {format(d.value)}
              {d.hint && <span className="ml-1 text-xs text-muted-foreground">{d.hint}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-[4px] bg-muted">
            <div
              className="h-full rounded-[4px] bg-foreground"
              style={{ width: `${Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

const dayFmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" })

export function Sparkbars({ data }: { data: Array<{ day: string; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <div className="flex h-28 items-end gap-1">
        {data.map((d) => (
          <div
            key={d.day}
            className="flex-1 rounded-[3px] bg-foreground/80 transition-colors hover:bg-foreground"
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 1)}%` }}
            title={`${dayFmt.format(new Date(d.day))}: ${d.count} movimiento${d.count === 1 ? "" : "s"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{dayFmt.format(new Date(data[0].day))}</span>
        <span>{total} en 14 días</span>
        <span>{dayFmt.format(new Date(data[data.length - 1].day))}</span>
      </div>
    </div>
  )
}
