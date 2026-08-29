"use client"

import Link from "next/link"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { useRipple } from "@/components/marketing/ripple"
import { cn } from "@/lib/utils"

type Variants = VariantProps<typeof buttonVariants>

/**
 * A link styled as a Material button — pill shape, elevation on filled
 * variants, and a touch ripple. Avoids Base UI's `Button render={<a>}`
 * warning. External `href` (http, mailto) renders a plain <a>; internal <Link>.
 */
export function CtaLink({
  href,
  variant,
  size = "lg",
  className,
  external,
  children,
}: {
  href: string
  external?: boolean
  className?: string
  children: React.ReactNode
} & Pick<Variants, "variant" | "size">) {
  const { rippleProps, ripple } = useRipple()

  const filled = !variant || variant === "default" || variant === "secondary"
  const classes = cn(
    buttonVariants({ variant, size }),
    "relative overflow-hidden transition-[box-shadow,transform] duration-200 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
    filled && "shadow-elevation-1 hover:shadow-elevation-2",
    className
  )
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...rippleProps}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {ripple}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...rippleProps}>
      {children}
      {ripple}
    </Link>
  )
}
