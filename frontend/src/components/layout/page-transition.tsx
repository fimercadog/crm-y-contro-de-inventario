"use client"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/**
 * Re-keyed on the route so every page mount replays a short rise + fade.
 * Static under prefers-reduced-motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className={cn(
        "flex flex-1 flex-col gap-4",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:ease-out"
      )}
    >
      {children}
    </div>
  )
}
