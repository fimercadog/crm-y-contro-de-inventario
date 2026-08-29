"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Reveal on scroll (or on mount): rise + blur-in + fade, 0.7s spring-out.
 * `mount` fires on load instead of on scroll (above-the-fold content).
 * `zoom` swaps the rise for a scale-down (hero screenshot).
 * Under prefers-reduced-motion, the *scroll* variant degrades to an
 * opacity-only cross-fade (scroll-linked movement is the vestibular risk);
 * the `mount` entrance keeps its full motion since it fires once on load.
 * CSS transitions + IntersectionObserver: SSR-safe, no hydration divergence.
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
        "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
        !mount &&
          "motion-reduce:transition-opacity motion-reduce:duration-500 motion-reduce:translate-y-0! motion-reduce:scale-100! motion-reduce:blur-0!",
        shown
          ? "translate-y-0 scale-100 blur-0 opacity-100"
          : zoom
            ? "scale-[1.08] opacity-0 blur-sm"
            : "translate-y-8 opacity-0 blur-xs",
        className
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
