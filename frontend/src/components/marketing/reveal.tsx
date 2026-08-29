import { cn } from "@/lib/utils"

/**
 * A subtle fade + rise entrance (CSS only, via tw-animate-css). Content is
 * always visible at rest — if animations are disabled or CSS fails to load,
 * nothing is hidden. Skipped under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 ease-out motion-reduce:animate-none",
        className
      )}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
