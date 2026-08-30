import { PageHero } from "@/components/marketing/page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { Section } from "@/components/marketing/marketing-ui"

/**
 * Shared shell for legal pages (/privacidad, /terminos): compact hero + a
 * single readable prose column. Content is passed as children so each page
 * owns its own copy.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} note={`Última actualización: ${updated}`} />
      <Section className="border-t border-border">
        <Reveal>
          <div className="prose-legal mx-auto max-w-2xl text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:mt-1.5 [&_p]:mt-4 [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </Reveal>
      </Section>
    </>
  )
}
