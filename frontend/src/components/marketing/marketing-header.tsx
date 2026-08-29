"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    <Link href="/" className="flex items-center gap-2.5" aria-label={site.name}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-primary">
        <Boxes className="size-5" />
      </span>
      <span className="text-base font-black leading-none tracking-tight">
        CRM
        <span className="text-primary">+</span>
        Inventario
      </span>
    </Link>
  )
}

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
          {site.nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative text-sm transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 group-hover:w-full motion-reduce:transition-none",
                    active ? "w-full" : "w-0"
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <CtaLink href="/demo" size="sm">
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
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm hover:bg-accent",
                        pathname === item.href && "bg-accent font-medium text-accent-foreground"
                      )}
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
                  <Link href="/demo" className={buttonVariants()}>
                    Solicitar demostración
                  </Link>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
