import { HeroBackdrop } from "@/components/marketing/hero-backdrop"
import { Reveal } from "@/components/marketing/reveal"
import { ScreenshotFrame } from "@/components/marketing/screenshot-frame"
import { container } from "@/components/marketing/marketing-ui"

/**
 * Hero band for every marketing page. With `screenshot` it's the two-column
 * home hero (text + floating product shot); without it, a compact centred
 * intro for an interior page.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  badge,
  actions,
  note,
  screenshot,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  note?: string
  screenshot?: { src: string; alt: string }
}) {
  const text = (
    <div className={screenshot ? undefined : "mx-auto max-w-3xl text-center"}>
      {badge && (
        <Reveal mount>
          <div className={screenshot ? "mb-5" : "mb-5 flex justify-center"}>{badge}</div>
        </Reveal>
      )}
      {eyebrow && (
        <Reveal mount delay={0.05}>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal mount delay={0.1}>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          {title}
        </h1>
      </Reveal>
      {lead && (
        <Reveal mount delay={0.2}>
          <p
            className={`mt-5 text-lg leading-8 text-muted-foreground ${
              screenshot ? "max-w-xl" : "mx-auto max-w-2xl"
            }`}
          >
            {lead}
          </p>
        </Reveal>
      )}
      {actions && (
        <Reveal mount delay={0.3}>
          <div className={`mt-8 flex flex-wrap gap-3 ${screenshot ? "" : "justify-center"}`}>
            {actions}
          </div>
        </Reveal>
      )}
      {note && (
        <Reveal mount delay={0.4}>
          <p className="mt-6 text-xs text-muted-foreground">{note}</p>
        </Reveal>
      )}
    </div>
  )

  return (
    <section className="relative isolate overflow-hidden border-b">
      <HeroBackdrop />
      {screenshot ? (
        <div
          className={`${container} grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24`}
        >
          {text}
          <Reveal mount zoom delay={0.25}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 animate-marketing-pulse-glow rounded-[2rem] bg-primary/20 blur-3xl"
              />
              <div className="animate-marketing-float">
                <ScreenshotFrame src={screenshot.src} alt={screenshot.alt} priority />
              </div>
            </div>
          </Reveal>
        </div>
      ) : (
        <div className={`${container} py-20 lg:py-28`}>{text}</div>
      )}
    </section>
  )
}
