"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { navGroups } from "@/config/nav"

function currentTitle(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname.startsWith(item.url)) return item.title
    }
  }
  return "Dashboard"
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-base font-medium">{currentTitle(pathname)}</h1>
    </header>
  )
}
