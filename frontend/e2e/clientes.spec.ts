import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("create a customer and find it in the table", async ({ page }) => {
  await loginAs(page, "Administrador")

  await page.goto("/crm/clientes")
  await page.getByRole("button", { name: "Nuevo cliente" }).click()

  const name = `Cliente E2E ${Date.now()}`
  await page.getByLabel("Nombre").fill(name)
  await page.getByRole("button", { name: "Guardar" }).click()

  await page.getByPlaceholder("Buscar por nombre, correo o documento...").fill(name)

  await expect(page.getByRole("cell", { name })).toBeVisible()
})
