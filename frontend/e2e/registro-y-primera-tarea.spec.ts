import { expect, test } from '@playwright/test'

// El único recorrido de extremo a extremo: alguien sin cuenta se registra,
// llega a la lista y apunta una tarea. Login, filtros y cambios de estado son
// estados de componente y se comprueban en sus historias, no aquí.
test('una persona sin cuenta se registra y crea su primera tarea', async ({
  page,
}) => {
  // Correo y título distintos en cada pase: el segundo no choca con el
  // registro del primero, y la tarea se reconoce aunque la lista sea compartida.
  const marca = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `e2e-${marca}@example.com`
  const titulo = `Preparar la demo ${marca}`

  await page.goto('/register')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill('secreto-e2e')
  await page.getByLabel('Repite la contraseña').fill('secreto-e2e')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  await expect(page).toHaveURL(/\/tasks$/)
  await expect(
    page.getByRole('heading', { name: 'Tareas del equipo' }),
  ).toBeVisible()

  await page.getByLabel('Título de la tarea').fill(titulo)
  await page.getByRole('button', { name: 'Crear tarea' }).click()

  await expect(
    page.getByRole('list').getByRole('link', { name: titulo }),
  ).toBeVisible()
})
