import Link from "next/link"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variants = VariantProps<typeof buttonVariants>

/**
 * A link styled as a button. Used for marketing CTAs — avoids Base UI's
 * `Button render={<a>}` warning (button semantics on a non-button element).
 * External `href` (http, mailto) renders a plain <a>; internal uses <Link>.
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
  const classes = cn(
    buttonVariants({ variant, size }),
    "transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100",
    className
  )
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
