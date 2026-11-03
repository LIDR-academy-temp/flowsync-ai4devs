import { test } from '@japa/runner'

/**
 * `GET /health` con la base de pruebas levantada: responde sin token y solo
 * con el estado global y el de cada comprobación.
 */
test.group('Health', () => {
  test('con la base levantada responde 200 y solo los estados', async ({ client, assert }) => {
    const response = await client.get('/health')

    response.assertStatus(200)

    const body = response.body()
    assert.deepEqual(Object.keys(body).sort(), ['checks', 'status'])
    assert.equal(body.status, 'ok')
    assert.isNotEmpty(body.checks)
    for (const check of body.checks) {
      assert.deepEqual(Object.keys(check).sort(), ['name', 'status'])
      assert.equal(check.status, 'ok')
    }
  })
})
