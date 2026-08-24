import { Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableExportProps {
  onExportCsv?: () => void
  onExportPdf?: () => void
  onPrint?: () => void
  isExporting?: boolean
}

export function DataTableExport({
  onExportCsv,
  onExportPdf,
  onPrint,
  isExporting,
}: DataTableExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8" disabled={isExporting}>
            <Download />
            Exportar
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {onExportCsv && (
          <DropdownMenuItem onClick={onExportCsv}>CSV</DropdownMenuItem>
        )}
        {onExportPdf && (
          <DropdownMenuItem onClick={onExportPdf}>PDF</DropdownMenuItem>
        )}
        {onPrint && (
          <DropdownMenuItem onClick={onPrint}>
            <Printer />
            Imprimir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
