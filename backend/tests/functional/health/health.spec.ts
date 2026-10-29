import { test } from '@japa/runner'

/**
 * `GET /health` con la base de pruebas levantada. El cuerpo se compara entero,
 * no por claves: así el test también falla si el informe deja escapar algo más
 * que el estado global y el de cada comprobación (mensajes, metadatos de la
 * conexión, `debugInfo`).
 */
test.group('Health | comprobación de vida', () => {
  test('responde 200, sin sesión, cuando la base de datos contesta', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBody({
      data: {
        status: 'ok',
        checks: [{ name: 'Database health check (pg)', status: 'ok' }],
      },
    })
  })
})
