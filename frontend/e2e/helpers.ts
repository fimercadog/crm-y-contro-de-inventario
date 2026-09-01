import { expect, type Page } from "@playwright/test"

/**
 * The "Versión beta" notice opens once per browser session and its modal makes
 * the rest of the page inert. Dismiss it so role-based queries see the page.
 * Only the first call per browser context actually waits — after that the
 * notice stays dismissed (sessionStorage).
 */
export async function dismissBeta(page: Page) {
  const ok = page.getByRole("button", { name: "Entendido" })
  try {
    await ok.waitFor({ state: "visible", timeout: 4000 })
    await ok.click()
  } catch {
    /* already dismissed this session */
  }
}

/** Log in through the demo-user shortcut on /login and land on the dashboard. */
export async function loginAs(
  page: Page,
  label = "Administrador",
  { dismissBeta: dismiss = true } = {},
) {
  await page.goto("/login")
  await page.getByRole("button", { name: label, exact: false }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  if (dismiss) await dismissBeta(page)
}
