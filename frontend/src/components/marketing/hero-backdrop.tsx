import { cn } from "@/lib/utils"

/**
 * Ambient hero background: an aurora gradient field that slowly breathes and
 * drifts, a receding blueprint grid, a rotating conic glow and a periodic
 * sheen sweep. Pure CSS — every loop freezes under prefers-reduced-motion
 * (see globals.css), leaving a rich static gradient. `variant="navy"` tunes
 * it for the dark navy panels (login, marketing CTA).
 */
export function HeroBackdrop({
  variant = "light",
  className,
}: {
  variant?: "light" | "navy"
  className?: string
}) {
  const navy = variant === "navy"

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      {/* base wash */}
      <div
        className={cn(
          "absolute inset-0",
          navy
            ? "bg-[radial-gradient(90%_70%_at_50%_-15%,rgba(47,208,122,0.38),transparent_65%)]"
            : "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_16%,var(--background)),var(--background)_60%)]"
        )}
      />

      {/* rotating conic halo */}
      <div
        className={cn(
          "absolute left-1/2 top-0 aspect-square w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 animate-marketing-orbit rounded-full",
          navy ? "opacity-40" : "opacity-25"
        )}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--primary) 60deg, transparent 130deg, transparent 230deg, var(--chart-4) 300deg, transparent 360deg)",
          maskImage: "radial-gradient(circle at 50% 50%, black 10%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 10%, transparent 62%)",
        }}
      />

      {/* aurora blobs — same animation, offset phase */}
      <div
        className={cn(
          "absolute left-[-12%] top-[-30%] size-168 animate-marketing-aurora rounded-full blur-[60px]",
          navy ? "opacity-80" : "opacity-70"
        )}
        style={{
          background:
            "radial-gradient(circle at 35% 35%, var(--primary), transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute right-[-12%] top-[6%] size-152 animate-marketing-aurora rounded-full blur-[70px] [animation-delay:-6s]",
          navy ? "opacity-75" : "opacity-60"
        )}
        style={{
          background:
            "radial-gradient(circle at 60% 40%, var(--chart-2), transparent 68%)",
        }}
      />
      <div
        className={cn(
          "absolute bottom-[-25%] left-[26%] size-128 animate-marketing-pulse-glow rounded-full blur-[70px]",
          navy ? "bg-[#2fd07a]/55" : "bg-primary/40"
        )}
      />

      {/* receding blueprint grid */}
      <div className="perspective-midrange absolute inset-x-0 bottom-0 h-[62%]">
        <div
          className={cn(
            "absolute inset-0 origin-bottom animate-marketing-grid transform-[rotateX(70deg)] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-size-[46px_46px] mask-[linear-gradient(to_top,black_5%,transparent_75%)]",
            navy ? "text-white/35" : "text-primary/25"
          )}
        />
      </div>

      {/* sheen sweep */}
      <div
        className={cn(
          "absolute inset-y-0 left-[-33%] w-1/3 animate-marketing-sheen bg-linear-to-r from-transparent to-transparent",
          navy ? "via-[#2fd07a]/25" : "via-white/40"
        )}
      />
    </div>
  )
}
