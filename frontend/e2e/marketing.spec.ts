import { test, expect } from "@playwright/test"

test.describe("landing page", () => {
  test("loads with title, single H1 and hero CTAs", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
    page.on("pageerror", (e) => errors.push(String(e)))

    await page.goto("/")
    await expect(page).toHaveTitle(/CRM \+ Inventario/)
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("un solo lugar")
    await expect(page.getByRole("link", { name: "Solicitar demostración" }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: "Ver cómo funciona" })).toBeVisible()

    expect(errors, errors.join("\n")).toHaveLength(0)
  })

  test("landmarks and image alt text are present", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("main")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()

    const imgs = page.locator("main img")
    const count = await imgs.count()
    expect(count).toBeGreaterThan(3)
    for (let i = 0; i < count; i++) {
      await expect(imgs.nth(i)).toHaveAttribute("alt", /.+/)
    }
  })

  test("anchor navigation reaches every section", async ({ page }) => {
    await page.goto("/")
    for (const label of ["Producto", "Funciones", "IA", "Seguridad", "Beneficios", "Demo"]) {
      await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: label }).click()
      await page.waitForTimeout(400)
      expect(page.url()).toContain("#")
    }
    await expect(
      page.getByRole("heading", { name: /Conoce cómo CRM \+ Inventario/ })
    ).toBeInViewport()
  })

  test("hero screenshot loads", async ({ page }) => {
    await page.goto("/")
    const hero = page.locator("main img").first()
    await expect(hero).toBeVisible()
    expect(await hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true)
  })

  test("WhatsApp and email CTAs point to real channels", async ({ page }) => {
    await page.goto("/#demo")
    const demo = page.locator("#contacto")
    const wa = demo.getByRole("link", { name: "Escríbenos por WhatsApp" })
    if (await wa.count()) {
      await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+/)
    }
    await expect(demo.getByRole("link", { name: "Solicitar una demostración" })).toHaveAttribute(
      "href",
      /^mailto:/
    )
  })

  test("floating WhatsApp button is pinned and links to the number", async ({ page }) => {
    await page.goto("/")
    const fab = page.getByRole("link", { name: "Escríbenos por WhatsApp" }).last()
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute("href", /^https:\/\/wa\.me\/573027029498/)
    expect(await fab.evaluate((el) => getComputedStyle(el).position)).toBe("fixed")
  })

  test("login link goes to the app", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Iniciar sesión" }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("robots and sitemap are served", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200)
    const sitemap = await request.get("/sitemap.xml")
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain("<loc>")
  })

  test("unknown route renders a 404", async ({ page }) => {
    const res = await page.goto("/no-existe-esta-pagina")
    expect(res?.status()).toBe(404)
    await expect(page.locator("body")).toContainText(/404|no.*encontr|not found/i)
  })
})

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test("hamburger menu opens, navigates and closes", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.locator("header").getByRole("link", { name: "Solicitar demostración" })
    ).toBeHidden()
    await page.getByRole("button", { name: "Abrir menú" }).click()
    const menu = page.getByRole("navigation", { name: "Móvil" })
    await expect(menu).toBeVisible()
    await menu.getByRole("link", { name: "Funciones" }).click()
    await expect(menu).toBeHidden()
    expect(page.url()).toContain("#funciones")
  })

  test("hero heading and a CTA are visible on a phone", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("link", { name: "Solicitar demostración" })).toBeVisible()
  })
})
