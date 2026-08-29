import { test, expect } from "@playwright/test"
import { loginAs } from "./helpers"

test("create a contact from the standalone screen, soft-delete it, then restore it", async ({
  page,
}) => {
  await loginAs(page, "Administrador")
  await page.goto("/crm/contactos")

  const name = `E2E Contacto ${Date.now()}`

  // Create — the dialog asks which customer the contact belongs to.
  await page.getByRole("button", { name: "Nuevo contacto" }).click()
  await page.getByRole("combobox").first().click()
  await page.getByRole("option").first().click()
  await page.getByLabel("Nombre").fill(name)
  await page.getByLabel("Apellido").fill("Prueba")
  await page.getByRole("button", { name: "Guardar" }).click()

  await page.getByPlaceholder("Buscar por nombre o correo...").fill(name)
  const row = page.getByRole("row", { name: new RegExp(name) })
  await expect(row).toBeVisible()

  // Soft delete — the row stays in the list, now flagged as deleted.
  await row.getByRole("button").click()
  await page.getByRole("menuitem", { name: "Eliminar" }).click()
  await page.getByRole("button", { name: "Eliminar" }).click()
  await expect(page.getByText(`Contacto "${name} Prueba" eliminado`)).toBeVisible()

  const deletedRow = page.getByRole("row", { name: new RegExp(name) })
  await expect(deletedRow.getByText("Eliminado")).toBeVisible()

  // Restore it from the same row.
  await deletedRow.getByRole("button").click()
  await page.getByRole("menuitem", { name: "Restaurar" }).click()
  await expect(page.getByText(`Contacto "${name} Prueba" restaurado`)).toBeVisible()
})
