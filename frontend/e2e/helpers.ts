import { expect, type Page } from "@playwright/test"

/** Log in through the demo-user shortcut on /login and land on the dashboard. */
export async function loginAs(page: Page, label = "Administrador") {
  await page.goto("/login")
  await page.getByRole("button", { name: label, exact: false }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}
