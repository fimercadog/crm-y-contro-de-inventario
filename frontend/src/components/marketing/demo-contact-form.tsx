"use client"

import { useState } from "react"

import { site } from "@/lib/site"

const field =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

/**
 * Contact form for /demo. No backend: on submit it opens the visitor's mail
 * client with the message pre-filled. The Ley 1581 consent checkbox is a
 * native `required` input, so the browser blocks submission until it is ticked.
 */
export function DemoContactForm() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const nombre = String(data.get("nombre") ?? "")
    const correo = String(data.get("correo") ?? "")
    const empresa = String(data.get("empresa") ?? "")
    const mensaje = String(data.get("mensaje") ?? "")

    const body = [
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      empresa ? `Empresa: ${empresa}` : null,
      "",
      mensaje,
      "",
      "Autorizo el tratamiento de mis datos personales conforme a la Política de Privacidad (Ley 1581 de 2012).",
    ]
      .filter((l) => l !== null)
      .join("\n")

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      `Solicitud de demostración — ${nombre}`
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="block text-sm font-medium">
        Nombre
        <input name="nombre" type="text" required autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-medium">
        Correo
        <input name="correo" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="block text-sm font-medium">
        Empresa <span className="font-normal text-muted-foreground">(opcional)</span>
        <input name="empresa" type="text" autoComplete="organization" className={field} />
      </label>
      <label className="block text-sm font-medium">
        Mensaje
        <textarea name="mensaje" required rows={4} className={field} />
      </label>

      <label className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
        <input
          name="consentimiento"
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-primary"
        />
        <span>
          Autorizo el tratamiento de mis datos personales de acuerdo con la{" "}
          <a href="/privacidad" className="font-medium text-primary underline">
            Política de privacidad
          </a>{" "}
          (Ley 1581 de 2012).
        </span>
      </label>

      <button
        type="submit"
        className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Enviar solicitud
      </button>

      {sent && (
        <p className="text-xs text-muted-foreground" role="status">
          Abrimos tu correo con el mensaje listo. Si no se abrió, escríbenos a{" "}
          <a href={`mailto:${site.email}`} className="text-primary underline">
            {site.email}
          </a>
          .
        </p>
      )}
    </form>
  )
}
