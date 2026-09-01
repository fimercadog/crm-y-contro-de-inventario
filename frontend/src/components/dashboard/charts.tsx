"use client"

/**
 * Dashboard charts (Recharts). One brand hue (green) carries magnitude; the
 * donut uses a light→dark green ramp for its slices and direct-labels every
 * one, so identity never rests on colour alone. Colours come from CSS tokens
 * so light/dark themes follow automatically.
 */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface BarDatum {
  label: string
  value: number
  hint?: string
}

const AXIS = "var(--color-muted-foreground)"
const fmtNumber = (n: number) => n.toLocaleString("es-CO")

function TooltipCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{title}</p>
      {rows.map((r) => (
        <p key={r} className="text-muted-foreground">
          {r}
        </p>
      ))}
    </div>
  )
}

/* ── Horizontal bars: pipeline by stage, etc. ─────────────────────────── */

export function BarList({
  data,
  format = fmtNumber,
  emptyMessage = "Sin datos.",
}: {
  data: BarDatum[]
  format?: (n: number) => string
  emptyMessage?: string
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 120)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 72, bottom: 4, left: 4 }}
        barCategoryGap={10}
      >
        <defs>
          <linearGradient id="bar-green" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={128}
          tickLine={false}
          axisLine={false}
          tick={{ fill: AXIS, fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipCard
                title={String(payload[0].payload.label)}
                rows={[
                  format(Number(payload[0].value)),
                  ...(payload[0].payload.hint ? [String(payload[0].payload.hint)] : []),
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="value" fill="url(#bar-green)" radius={[4, 4, 4, 4]} isAnimationActive>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: unknown) => format(Number(v))}
            className="fill-foreground text-xs font-medium"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Donut: value split by category ──────────────────────────────────── */

// dark → light green ramp; slices are sorted by value, so the biggest gets the
// deepest green. Floored at a saturated mid-green so 1–2% slivers stay visible.
const GREENS = ["#166534", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac"]

export function CategoryDonut({
  data,
  format = fmtNumber,
  emptyMessage = "Sin datos.",
}: {
  data: { label: string; value: number }[]
  format?: (n: number) => string
  emptyMessage?: string
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  // fold anything past the 5th slice into "Otras"
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5)
  const slices = rest.length
    ? [...top, { label: "Otras", value: rest.reduce((s, d) => s + d.value, 0) }]
    : top
  const total = slices.reduce((s, d) => s + d.value, 0)
  const color = (i: number) => GREENS[Math.min(i, GREENS.length - 1)]

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke="var(--color-card)"
              strokeWidth={2}
              isAnimationActive
            >
              {slices.map((s, i) => (
                <Cell key={s.label} fill={color(i)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipCard
                    title={String(payload[0].name)}
                    rows={[
                      format(Number(payload[0].value)),
                      `${Math.round((Number(payload[0].value) / total) * 100)}% del total`,
                    ]}
                  />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="text-sm font-semibold tabular-nums">{format(total)}</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {slices.map((s, i) => (
          <li key={s.label} className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: color(i) }}
            />
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Area: movements over time ───────────────────────────────────────── */

const dayFmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" })

export function Sparkbars({ data }: { data: Array<{ day: string; count: number }> }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={168}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="mov-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tick={{ fill: AXIS, fontSize: 11 }}
            tickFormatter={(d: string) => dayFmt.format(new Date(d))}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.4 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipCard
                  title={dayFmt.format(new Date(String(label)))}
                  rows={[
                    `${payload[0].value} movimiento${Number(payload[0].value) === 1 ? "" : "s"}`,
                  ]}
                />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#mov-green)"
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">{total} en 14 días</p>
    </div>
  )
}
