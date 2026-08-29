import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("the AI assistant answers a suggested question", async ({ page }) => {
  await loginAs(page, "Administrador")

  await page.goto("/ia")
  await page.getByRole("button", { name: "¿Qué productos tengo con stock bajo?" }).click()

  // Default provider is the offline stub; it echoes the business snapshot.
  await expect(page.getByText(/modo local|Contexto disponible del negocio/i)).toBeVisible({
    timeout: 15_000,
  })
})
