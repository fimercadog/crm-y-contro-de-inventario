import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * A real product screenshot inside a lightweight browser-chrome frame.
 * Screenshots live in /public/product and are captured from the running app.
 */
export function ScreenshotFrame({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-elevation-2",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-warning/40" />
        <span className="size-2.5 rounded-full bg-success/40" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={2880}
        height={1800}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 720px"
        className="h-auto w-full"
      />
    </div>
  )
}
