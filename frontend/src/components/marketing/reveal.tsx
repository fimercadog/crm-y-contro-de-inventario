"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Fade + rise on scroll — same motion as the FidelOS landing:
 * opacity 0→1, y 24→0, 0.55s ease-out, fires once, 80px before the edge.
 * `mount` fires on load instead of on scroll (above-the-fold content).
 * `zoom` swaps the rise for a subtle scale-down (hero screenshot).
 * CSS transitions + IntersectionObserver: SSR-safe, and static under
 * prefers-reduced-motion via the motion-reduce variant.
 */
export function Reveal({
  children,
  delay = 0,
  mount = false,
  zoom = false,
  className,
}: {
  children: React.ReactNode
  delay?: number
  mount?: boolean
  zoom?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (mount) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mount])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-550 ease-out will-change-[opacity,transform]",
        "motion-reduce:translate-y-0! motion-reduce:scale-100! motion-reduce:opacity-100! motion-reduce:transition-none",
        shown
          ? "translate-y-0 scale-100 opacity-100"
          : zoom
            ? "scale-[1.06] opacity-0"
            : "translate-y-6 opacity-0",
        className
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
