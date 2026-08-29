"use client"

import { useEffect } from "react"

import { landingSections } from "@/lib/site"

/** id of the section for a link's href, or "" if it isn't a section link. */
function sectionId(href: string): string {
  if (href.startsWith("#")) return href.slice(1)
  try {
    const path = href.startsWith("/") ? href : new URL(href, window.location.origin).pathname
    return landingSections[path] ?? ""
  } catch {
    return ""
  }
}

/** clean path (no #hash) for a section id, e.g. "beneficios" -> "/beneficios". */
function sectionPath(id: string): string {
  return Object.keys(landingSections).find((p) => landingSections[p] === id) ?? "/"
}

/**
 * Landing-page navigation with clean paths instead of #hashes. Clicking a
 * section link (href="/beneficios" or "#beneficios") smooth-scrolls to the
 * section and sets the address bar to /beneficios — no "#". Opening
 * /beneficios directly (rewritten to "/" by next.config) scrolls there on load.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const scrollToId = (id: string) => {
      const el = id ? document.getElementById(id) : null
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      return !!el
    }

    const deepLink = landingSections[window.location.pathname]
    if (deepLink) requestAnimationFrame(() => scrollToId(deepLink))

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.("a")
      if (!link || link.target === "_blank") return

      const id = sectionId(link.getAttribute("href") || "")
      if (!id || !document.getElementById(id)) return

      e.preventDefault()
      scrollToId(id)
      window.history.replaceState(null, "", sectionPath(id))
    }

    // capture phase so we run before Next's <Link> click handler
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  return null
}
