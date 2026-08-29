"use client"

import { motion, useReducedMotion } from "framer-motion"

/**
 * Fade + rise on scroll — same motion as the FidelOS landing:
 * opacity 0→1, y 24→0, 0.55s ease-out, once, viewport margin -80px.
 * `mount` triggers on load instead of on scroll (above-the-fold content).
 * `zoom` swaps the rise for a subtle scale-down (hero screenshot).
 * Static under prefers-reduced-motion.
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
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  const hidden = zoom ? { opacity: 0, scale: 1.06 } : { opacity: 0, y: 24 }
  const shown = zoom ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }
  const trigger = mount
    ? { animate: shown }
    : { whileInView: shown, viewport: { once: true, margin: "-80px" } }

  return (
    <motion.div
      className={className}
      initial={hidden}
      {...trigger}
      transition={{ duration: zoom ? 0.9 : 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
