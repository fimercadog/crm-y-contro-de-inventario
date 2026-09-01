"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const BetaNoticeContext = createContext<() => void>(() => {})

/** Re-open the beta notice from anywhere in the app shell. */
export function useBetaNotice() {
  return useContext(BetaNoticeContext)
}

const SEEN_KEY = "beta-notice-seen"

/**
 * Shows a "beta" dialog the first time the app is opened in a browser session
 * (survives client-side navigation and page reloads; shows again in a new tab
 * or the next day). The warning button in the header reopens it any time.
 */
export function BetaNoticeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SEEN_KEY)) setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      try {
        sessionStorage.setItem(SEEN_KEY, "1")
      } catch {
        /* private mode — it'll just show again */
      }
    }
  }

  return (
    <BetaNoticeContext.Provider value={() => setOpen(true)}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-warning" />
              Versión beta
            </DialogTitle>
            <DialogDescription>
              Estás usando una versión de demostración de CRM + Inventario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Esta versión ya superó las pruebas de desarrollo y control de calidad en un
              entorno de laboratorio. Ahora está en <strong className="text-foreground">beta</strong>{" "}
              para validarla con uso real.
            </p>
            <p>
              Los datos que ves son de ejemplo: puedes crear, editar y eliminar sin problema —
              cada eliminación es reversible.
            </p>
            <p>
              Algunas pantallas y funciones pueden cambiar antes del lanzamiento final. Si algo
              se ve raro o no funciona como esperas, cuéntanos.
            </p>
          </div>

          <DialogFooter>
            <DialogClose render={<Button />}>Entendido</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BetaNoticeContext.Provider>
  )
}

/** Warning icon in the header that re-opens the beta notice. */
export function BetaNoticeButton() {
  const openNotice = useBetaNotice()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={openNotice}
      aria-label="Ver el aviso de versión beta"
      title="Versión beta"
    >
      <TriangleAlert className="size-4 text-warning" />
    </Button>
  )
}
