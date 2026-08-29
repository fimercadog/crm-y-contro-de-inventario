"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  downloadReport,
  getReport,
  type ReportKey,
  type ReportParams,
  type ReportResponse,
} from "@/features/reports/api"

const reports: Array<{ key: ReportKey; description: string; dated: boolean }> = [
  {
    key: "inventory-valuation",
    description: "Valor del stock actual agrupado por categoría.",
    dated: false,
  },
  {
    key: "opportunities-by-stage",
    description: "Oportunidades abiertas y su monto por etapa del pipeline.",
    dated: false,
  },
  {
    key: "movements-summary",
    description: "Movimientos de inventario y unidades por tipo en el período.",
    dated: true,
  },
  {
    key: "sales-by-product",
    description: "Cantidad y total vendido por producto en oportunidades ganadas.",
    dated: true,
  },
]

function ReportCard({ reportKey, description, dated, params }: {
  reportKey: ReportKey
  description: string
  dated: boolean
  params: ReportParams
}) {
  const [data, setData] = useState<ReportResponse>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [downloading, setDownloading] = useState<"csv" | "pdf">()

  const effectiveParams = dated ? params : {}

  const load = useCallback(() => {
    setIsLoading(true)
    setError(undefined)
    getReport(reportKey, effectiveParams)
      .then(({ data }) => setData(data))
      .catch(() => setError("No se pudo cargar el reporte."))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, effectiveParams.from, effectiveParams.to])

  useEffect(() => {
    load()
  }, [load])

  async function handleDownload(format: "csv" | "pdf") {
    setDownloading(format)
    try {
      await downloadReport(reportKey, format, effectiveParams)
    } catch {
      setError("No se pudo generar la exportación.")
    } finally {
      setDownloading(undefined)
    }
  }

  const columnKeys = data ? Object.keys(data.columns) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data?.title ?? "Reporte"}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data || !!downloading}
            onClick={() => handleDownload("csv")}
          >
            {downloading === "csv" ? <Loader2 className="animate-spin" /> : <Download />}
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data || !!downloading}
            onClick={() => handleDownload("pdf")}
          >
            {downloading === "pdf" ? <Loader2 className="animate-spin" /> : <Download />}
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {data && !isLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                {columnKeys.map((key) => (
                  <TableHead key={key}>{data.columns[key]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnKeys.length} className="text-muted-foreground">
                    Sin datos para el período.
                  </TableCell>
                </TableRow>
              )}
              {data.rows.map((row, i) => (
                <TableRow key={i}>
                  {columnKeys.map((key) => (
                    <TableCell key={key}>{row[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function firstOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export default function ReportesPage() {
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Reportes</h2>
        <p className="text-sm text-muted-foreground">
          Solo disponible para administradores. Los reportes con período usan el rango de abajo.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="to">Hasta</Label>
          <Input
            id="to"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {reports.map((report) => (
          <ReportCard
            key={report.key}
            reportKey={report.key}
            description={report.description}
            dated={report.dated}
            params={{ from, to }}
          />
        ))}
      </div>
    </div>
  )
}
