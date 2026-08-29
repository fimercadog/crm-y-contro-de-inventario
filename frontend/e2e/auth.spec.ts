import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("demo login lands on the dashboard and survives a reload", async ({ page }) => {
  await loginAs(page, "Administrador")

  await page.reload()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole("button", { name: /admin@distribuidoraandina\.com/ })).toBeVisible()
})

test("logout returns to /login and protects app routes", async ({ page }) => {
  await loginAs(page, "Administrador")

  await page.getByRole("button", { name: /admin@distribuidoraandina\.com/ }).click()
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click()

  await expect(page).toHaveURL(/\/login/)

  await page.goto("/crm/clientes")
  await expect(page).toHaveURL(/\/login/)
})

test("invalid credentials show an error and stay on /login", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("textbox").first().fill("nope@example.com")
  await page.locator('input[type="password"]').fill("wrongpass")
  await page.getByRole("button", { name: "Entrar al panel" }).click()

  await expect(page.getByText(/no se pudo iniciar sesión|credenciales/i)).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})
