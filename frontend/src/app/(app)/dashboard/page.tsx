"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarList, Sparkbars } from "@/components/dashboard/charts"
import { getDashboard, type DashboardData } from "@/features/dashboard/api"

const currency = new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" })
const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" })

const movementIcon = {
  entrada: ArrowDownToLine,
  salida: ArrowUpFromLine,
  ajuste: ArrowLeftRight,
}

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <Card className={href ? "transition-colors hover:bg-accent" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>()
  const [error, setError] = useState(false)

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
  }, [])

  if (error) {
    return <p className="text-sm text-destructive">No se pudo cargar el panel.</p>
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  const {
    customers,
    opportunities,
    activities,
    inventory,
    recent_movements,
    pipeline_by_stage,
    inventory_by_category,
    movements_by_day,
  } = data

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Clientes"
          value={String(customers.total)}
          hint={`${customers.active} activos · ${customers.prospects} prospectos`}
          href="/crm/clientes"
        />
        <Stat
          label="Pipeline abierto"
          value={currency.format(Number(opportunities.open_amount))}
          hint={`${opportunities.open} oportunidades abiertas`}
          href="/crm/pipeline"
        />
        <Stat
          label="Ganado este mes"
          value={currency.format(Number(opportunities.won_amount_this_month))}
          hint={`${opportunities.won_this_month} oportunidades ganadas`}
          href="/crm/oportunidades"
        />
        <Stat
          label="Actividades pendientes"
          value={String(activities.pending)}
          hint={activities.overdue > 0 ? `${activities.overdue} vencidas` : "al día"}
          href="/crm/actividades"
        />
        <Stat label="Productos" value={String(inventory.products)} href="/inventario/productos" />
        <Stat
          label="Stock bajo"
          value={String(inventory.low_stock)}
          hint={`${inventory.out_of_stock} agotados`}
          href="/inventario/stock"
        />
        <Stat
          label="Valor en stock"
          value={currency.format(Number(inventory.stock_value))}
          href="/inventario/stock"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              data={pipeline_by_stage.map((s) => ({
                label: s.stage,
                value: Number(s.amount),
                hint: `${s.count} opp.`,
              }))}
              format={(n) => currency.format(n)}
              emptyMessage="No hay oportunidades abiertas."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor de inventario por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              data={inventory_by_category.map((c) => ({
                label: c.category,
                value: Number(c.value),
              }))}
              format={(n) => currency.format(n)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos de inventario · últimos 14 días</CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkbars data={movements_by_day} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos movimientos de inventario</CardTitle>
        </CardHeader>
        <CardContent>
          {recent_movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
          ) : (
            <ul className="divide-y">
              {recent_movements.map((m) => {
                const Icon = movementIcon[m.type]
                return (
                  <li key={m.id} className="flex items-center gap-3 py-2 text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{m.product ?? "—"}</span>
                    <span className="capitalize text-muted-foreground">{m.type}</span>
                    <span className="w-16 text-right tabular-nums">{m.quantity}</span>
                    <span className="w-24 text-right text-muted-foreground">
                      {dateTime.format(new Date(m.occurred_at))}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
