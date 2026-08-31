import { test, expect } from "@playwright/test"

const PAGES: Array<{ nav: string; path: string; h1: RegExp }> = [
  { nav: "Producto", path: "/producto", h1: /Toda tu operación/ },
  { nav: "Funciones", path: "/funciones", h1: /Lo que hace el sistema/ },
  { nav: "Beneficios", path: "/beneficios", h1: /Cada beneficio/ },
  { nav: "IA", path: "/asistente-ia", h1: /Pregúntale a tus datos/ },
  { nav: "Seguridad", path: "/seguridad", h1: /Cada persona ve lo que le corresponde/ },
  { nav: "Demo", path: "/demo", h1: /Solicita una demostración/ },
]

test.describe("marketing site", () => {
  test("home loads with title, single H1 and hero CTAs", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto("/")
    await expect(page).toHaveTitle(/CRM \+ Inventario/)
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("un solo lugar")
    await expect(page.getByRole("link", { name: "Ver demostración" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Ver cómo funciona" })).toBeVisible()

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("landmarks and image alt text are present", async ({ page }) => {
    await page.goto("/producto")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("main")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()

    const imgs = page.locator("main img")
    const count = await imgs.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(imgs.nth(i)).toHaveAttribute("alt", /.+/)
    }
  })

  test("every nav item is its own page (real path, no #)", async ({ page }) => {
    await page.goto("/")
    for (const { nav, path, h1 } of PAGES) {
      await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: nav }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      expect(new URL(page.url()).hash).toBe("")
      await expect(page.locator("h1")).toHaveCount(1)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1)
    }
  })

  test("each page opens directly and has its own title + canonical", async ({ page }) => {
    for (const { path, h1 } of PAGES) {
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1)
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
      expect(canonical).toContain(path)
    }
  })

  test("active nav item is marked on its page", async ({ page }) => {
    await page.goto("/funciones")
    const active = page
      .getByRole("navigation", { name: "Principal" })
      .getByRole("link", { name: "Funciones" })
    await expect(active).toHaveAttribute("aria-current", "page")
  })

  test("hero screenshot loads", async ({ page }) => {
    await page.goto("/producto")
    const hero = page.locator("main img").first()
    await expect(hero).toBeVisible()
    expect(await hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
  })

  test("demo page exposes real contact channels", async ({ page }) => {
    await page.goto("/demo")
    const main = page.locator("main")
    const wa = main.getByRole("link", { name: "Escríbenos por WhatsApp" })
    if (await wa.count()) {
      await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+/)
    }
    await expect(main.getByRole("link", { name: "Escríbenos por correo" })).toHaveAttribute(
      "href",
      /^mailto:/
    )
  })

  test("floating WhatsApp button is pinned and links to the number", async ({ page }) => {
    await page.goto("/")
    const fab = page.getByRole("link", { name: "Escríbenos por WhatsApp" }).last()
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute("href", /^https:\/\/wa\.me\/573027029498/)
    const pinned = await fab.evaluate((el) => {
      const box = el.closest("div")
      return box ? getComputedStyle(box).position : null
    })
    expect(pinned).toBe("fixed")
    const pulsing = await fab.evaluate((el) =>
      [...(el.closest("div")?.querySelectorAll("span") ?? [])].some((s) =>
        getComputedStyle(s).animationName.includes("ping")
      )
    )
    expect(pulsing).toBe(true)
  })

  test("use case demo links point to their own demo sites", async ({ page }) => {
    await page.goto("/")
    const main = page.locator("main")
    await expect(main.getByText("Casos de uso", { exact: true })).toBeVisible()
    await expect(main.getByRole("heading", { name: "CRM + Inventario" })).toBeVisible()
    await expect(main.getByRole("heading", { name: "CRM inmobiliaria" })).toBeVisible()
    await expect(main.getByRole("heading", { name: "Recursos humanos" })).toBeVisible()

    await expect(main.getByRole("link", { name: "Ver demostración" }).nth(1)).toHaveAttribute(
      "href",
      "https://crm-inventario-demo.fidelmercadotech.com/"
    )
    await expect(main.getByRole("link", { name: "Ver demostración" }).nth(2)).toHaveAttribute(
      "href",
      "https://crminmobiliaria.fidelmercadotech.com/"
    )
    await expect(main.getByRole("link", { name: "Ver demostración" }).nth(3)).toHaveAttribute(
      "href",
      "https://demorrhh.fidelmercadotech.com/"
    )
  })

  test("login link goes to the app", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Iniciar sesión" }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("robots and sitemap list the marketing pages", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200)
    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.status()).toBe(200)
    const xml = await sitemap.text()
    expect(xml).toContain("<loc>")
    expect(xml).toContain("/funciones")
    expect(xml).toContain("/privacidad")
    expect(xml).toContain("/terminos")
  })

  test("legal pages load and are linked from the footer", async ({ page }) => {
    for (const { path, link, h1 } of [
      { path: "/privacidad", link: "Política de privacidad", h1: /Política de privacidad/ },
      { path: "/terminos", link: "Términos y condiciones", h1: /Términos y condiciones/ },
    ]) {
      await page.goto("/")
      await page.locator("footer").getByRole("link", { name: link }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1)

      // Canonical from a direct load (SSR): exactly one, pointing at this page.
      await page.goto(path)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${path}$`)
      )
    }
  })

  test("demo contact form requires the Ley 1581 consent checkbox", async ({ page }) => {
    await page.goto("/demo")
    const form = page.locator("main form")
    await form.getByLabel("Nombre").fill("Ana")
    await form.getByLabel("Correo").fill("ana@example.com")
    await form.getByLabel("Mensaje").fill("Quiero una demo")
    const consent = form.getByRole("checkbox")
    await expect(consent).toHaveAttribute("required", "")

    // Unchecked: native validation blocks submission.
    await form.getByRole("button", { name: "Enviar solicitud" }).click()
    expect(await consent.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false)

    await consent.check()
    expect(await consent.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true)
    await expect(form.getByRole("link", { name: "Política de privacidad" })).toHaveAttribute(
      "href",
      "/privacidad"
    )
  })

  test("unknown route renders a 404", async ({ page }) => {
    const res = await page.goto("/no-existe-esta-pagina")
    expect(res?.status()).toBe(404)
    await expect(page.locator("body")).toContainText(/404|no.*encontr|not found/i)
  })
})

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test("hamburger menu opens, navigates to a page and closes", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.locator("header").getByRole("link", { name: "Ver demostración" })
    ).toBeHidden()
    await page.getByRole("button", { name: "Abrir menú" }).click()
    const menu = page.getByRole("navigation", { name: "Móvil" })
    await expect(menu).toBeVisible()
    await menu.getByRole("link", { name: "Funciones" }).click()
    await expect(page).toHaveURL(/\/funciones$/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Lo que hace el sistema/)
  })

  test("hero heading and a CTA are visible on a phone", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("link", { name: "Ver demostración" }).first()).toBeVisible()
  })
})
