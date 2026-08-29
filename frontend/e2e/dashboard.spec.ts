import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("dashboard shows real KPIs and a movements feed", async ({ page }) => {
  await loginAs(page, "Administrador")

  await expect(page.getByText("Pipeline abierto")).toBeVisible()
  await expect(page.getByText("Valor en stock")).toBeVisible()
  await expect(page.getByText("Últimos movimientos de inventario")).toBeVisible()

  // Clicking a stat card navigates to its module.
  await page.getByRole("link").filter({ hasText: "Pipeline abierto" }).click()
  await expect(page).toHaveURL(/\/crm\/pipeline/)
})
