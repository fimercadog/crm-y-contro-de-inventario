import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

/** Every module reachable from the sidebar, with the title the header shows. */
const MODULES: { url: string; title: string }[] = [
  { url: "/dashboard", title: "Dashboard" },
  { url: "/crm/clientes", title: "Clientes" },
  { url: "/crm/contactos", title: "Contactos" },
  { url: "/crm/oportunidades", title: "Oportunidades" },
  { url: "/crm/pipeline", title: "Pipeline" },
  { url: "/crm/actividades", title: "Actividades" },
  { url: "/inventario/productos", title: "Productos" },
  { url: "/inventario/categorias", title: "Categorías" },
  { url: "/inventario/marcas", title: "Marcas" },
  { url: "/inventario/unidades", title: "Unidades" },
  { url: "/inventario/proveedores", title: "Proveedores" },
  { url: "/inventario/stock", title: "Stock" },
  { url: "/inventario/movimientos", title: "Movimientos" },
  { url: "/inventario/entradas", title: "Entradas" },
  { url: "/inventario/salidas", title: "Salidas" },
  { url: "/reportes", title: "Reportes" },
  { url: "/ia", title: "IA" },
  { url: "/admin/usuarios", title: "Usuarios" },
  { url: "/admin/roles", title: "Roles" },
  { url: "/admin/auditoria", title: "Auditoría" },
  { url: "/admin/configuracion", title: "Configuración" },
]

test.describe("modules — administrador", () => {
  test("every module loads with content and no load error", async ({ page }) => {
    test.setTimeout(120_000)
    await loginAs(page, "Administrador")

    for (const { url, title } of MODULES) {
      await page.goto(url)
      await expect(page).toHaveURL(new RegExp(`${url}$`))
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title)

      // The module rendered something substantial (retries while it fetches)...
      await expect
        .poll(async () => (await page.locator("main").innerText()).trim().length, {
          message: `"${title}" rendered almost nothing`,
        })
        .toBeGreaterThan(40)

      // ...and no fetch fell over.
      await expect(page.getByText(/no se pudo cargar|no se pudieron cargar/i)).toHaveCount(0)
    }
  })
})

test.describe("API role enforcement + scoped menu", () => {
  test("vendedor only sees CRM modules", async ({ page }) => {
    await loginAs(page, "Vendedor")

    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav.getByRole("link", { name: "Clientes" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Productos" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Usuarios" })).toHaveCount(0)
    await expect(nav.getByText("Administración")).toHaveCount(0)
    await expect(nav.getByText("Inventario", { exact: true })).toHaveCount(0)
  })

  test("IA shows as a locked premium item when the role lacks ai.use", async ({ page }) => {
    await loginAs(page, "Vendedor")

    const nav = page.locator('[data-slot="sidebar"]')
    const ia = nav.getByText("IA", { exact: true })
    await expect(ia).toBeVisible()
    // Not navigable...
    await expect(nav.getByRole("link", { name: "IA" })).toHaveCount(0)
    // ...and flagged Premium.
    await expect(nav.getByText("Premium")).toBeVisible()
  })

  test("administrador gets IA as a real link", async ({ page }) => {
    await loginAs(page, "Administrador")
    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav.getByRole("link", { name: "IA" })).toBeVisible()
  })

  test("inventario role sees inventory but not CRM or admin", async ({ page }) => {
    await loginAs(page, "Inventario")

    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav.getByRole("link", { name: "Productos" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Categorías" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Clientes" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Usuarios" })).toHaveCount(0)
  })

  test("comercial sees CRM + read-only inventory, not catalogs or admin", async ({ page }) => {
    await loginAs(page, "Comercial")

    const nav = page.locator('[data-slot="sidebar"]')
    await expect(nav.getByRole("link", { name: "Clientes" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Productos" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Stock" })).toBeVisible()
    await expect(nav.getByRole("link", { name: "Categorías" })).toHaveCount(0)
    await expect(nav.getByRole("link", { name: "Usuarios" })).toHaveCount(0)
  })

  test("a forbidden module hit directly degrades to an error, not a crash", async ({ page }) => {
    await loginAs(page, "Vendedor")

    await page.goto("/admin/usuarios")
    // Header still renders (no white screen)...
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Usuarios")
    // ...and the API 403 surfaces as a handled message.
    await expect(page.getByText("No se pudieron cargar los usuarios.")).toBeVisible()
  })
})

test.describe("mobile dashboard menu", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("the sidebar opens from the trigger and closes after navigating", async ({ page }) => {
    await loginAs(page, "Administrador")

    const clientes = page.getByRole("link", { name: "Clientes" })
    await expect(clientes).toHaveCount(0) // sheet closed → nav not mounted

    await page.getByRole("button", { name: "Toggle Sidebar" }).click()
    await expect(clientes).toBeVisible()

    await clientes.click()
    await expect(page).toHaveURL(/\/crm\/clientes/)
    await expect(page.getByRole("link", { name: "Clientes" })).toHaveCount(0) // closed again
  })
})
