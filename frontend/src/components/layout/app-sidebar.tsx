"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Boxes, Lock } from "lucide-react"

import { navGroups } from "@/config/nav"
import { useAppSelector } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/layout/nav-user"

export function AppSidebar() {
  const pathname = usePathname()
  const permissions = useAppSelector((state) => state.auth.user?.permissions)
  const { setOpenMobile } = useSidebar()

  // On mobile the menu is a Sheet that stays open across client-side
  // navigation — close it whenever the route changes.
  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const allowed = (perm?: string) => !perm || !!permissions?.includes(perm)

  // Hide modules the current user's role can't reach (the API enforces the
  // same permissions via policies). `premium` items are the exception: they
  // stay visible but render locked, as an upsell. While the user is still
  // loading, only permission-free items show so the shell doesn't flash the
  // full menu.
  const groups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.premium || allowed(item.permission)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Boxes className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">CRM + Inventario</span>
                <span className="truncate text-xs text-muted-foreground">
                  One platform
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const locked = !!item.premium && !allowed(item.permission)
                  const isActive = !locked && pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={locked ? `${item.title} — complemento premium` : item.title}
                        aria-disabled={locked || undefined}
                        className={locked ? "cursor-not-allowed opacity-60" : undefined}
                        render={
                          locked ? (
                            <span />
                          ) : (
                            <Link href={item.url} />
                          )
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {(locked || item.badge) && (
                          <span className="ml-auto flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
                            {locked && <Lock className="size-3.5" />}
                            {item.badge && (
                              <Badge
                                variant="warning"
                                className="h-4 px-1.5 text-[10px] font-bold uppercase"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
