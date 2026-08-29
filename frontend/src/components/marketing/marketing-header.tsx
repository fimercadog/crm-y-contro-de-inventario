"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Boxes, Menu } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { CtaLink } from "@/components/marketing/cta-link"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={site.name}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Boxes className="size-4" />
      </span>
      <span className="text-sm font-bold leading-none">
        CRM
        <span className="block text-[10px] font-medium uppercase tracking-wide text-primary">
          Inventario
        </span>
      </span>
    </Link>
  )
}

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        scrolled ? "border-border bg-background/90 backdrop-blur" : "border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full motion-reduce:transition-none" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CtaLink href="/login" variant="ghost" size="default">
            Iniciar sesión
          </CtaLink>
          <CtaLink href="#demo" size="default">
            Solicitar demostración
          </CtaLink>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menú" />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2" aria-label="Móvil">
              {site.nav.map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <a
                      href={item.href}
                      className="rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              <SheetClose
                render={
                  <Link href="/login" className={buttonVariants({ variant: "outline" })}>
                    Iniciar sesión
                  </Link>
                }
              />
              <SheetClose
                render={
                  <a href="#demo" className={buttonVariants()}>
                    Solicitar demostración
                  </a>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
