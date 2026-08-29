"use client"

import { useEffect } from "react"

/**
 * In-page navigation without the #hash in the address bar. Intercepts clicks
 * on `a[href^="#"]`, smooth-scrolls to the target (honouring scroll-margin),
 * and leaves the URL clean. Also strips a hash the page was opened with,
 * after jumping there once.
 */
export function SmoothAnchors() {
  useEffect(() => {
    const scrollToId = (id: string) => {
      const el = id ? document.getElementById(id) : null
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      return !!el
    }

    if (window.location.hash.length > 1) {
      const id = decodeURIComponent(window.location.hash.slice(1))
      requestAnimationFrame(() => {
        scrollToId(id)
        history.replaceState(null, "", window.location.pathname + window.location.search)
      })
    }

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!link) return
      const id = decodeURIComponent((link.getAttribute("href") || "").slice(1))
      if (scrollToId(id)) e.preventDefault()
    }

    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return null
}
