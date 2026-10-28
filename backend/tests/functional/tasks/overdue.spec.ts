import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito
 * «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`.
 *
 * Todo entra por HTTP, igual que el frontend: login, `POST /api/v1/tasks`,
 * `PUT /api/v1/tasks/:id/due-date`, `PATCH /api/v1/tasks/:id/status` y
 * `GET /api/v1/tasks/:id`. Lo que se comprueba es el `isOverdue` que viaja en
 * el cuerpo de la respuesta, no lo que diga un método del modelo.
 *
 * El día de referencia es siempre un valor fijo enviado en `today`: ningún
 * test consulta ningún reloj.
 */
test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  const con = (token: string) => ({ Authorization: `Bearer ${token}` })

  async function persona(client: any) {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const login = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })
    login.assertStatus(200)

    return login.body().data.token as string
  }

  async function crearTarea(client: any, token: string) {
    const creada = await client
      .post('/api/v1/tasks')
      .headers(con(token))
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)

    return creada.body().data.id as number
  }

  function fijarFecha(client: any, token: string, id: number, dueDate: string | null, today = HOY) {
    return client.put(`/api/v1/tasks/${id}/due-date`).headers(con(token)).json({ dueDate, today })
  }

  async function cambiarEstado(client: any, token: string, id: number, status: string) {
    const response = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .headers(con(token))
      .json({ status })
    response.assertStatus(200)
    return response
  }

  async function leer(client: any, token: string, id: number, today = HOY) {
    const response = await client.get(`/api/v1/tasks/${id}`).qs({ today }).headers(con(token))
    response.assertStatus(200)
    return response.body().data
  }

  /** Crea una tarea con la fecha dada y devuelve su id. */
  async function tareaConFecha(client: any, token: string, dueDate: string) {
    const id = await crearTarea(client, token)
    const response = await fijarFecha(client, token, id, dueDate)
    response.assertStatus(200)
    return id
  }

  test('fecha del día anterior: llega vencida', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await tareaConFecha(client, token, AYER)

    const tarea = await leer(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isTrue(tarea.isOverdue)
  })

  test('vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await tareaConFecha(client, token, HOY)

    const tarea = await leer(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isFalse(tarea.isOverdue)
  })

  test('fecha futura: no llega vencida', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await tareaConFecha(client, token, MANANA)

    const tarea = await leer(client, token, id)

    assert.isFalse(tarea.isOverdue)
  })

  test('sin fecha no se vence nunca, por antigua que sea', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await crearTarea(client, token)

    // «Creada hace semanas»: no se puede envejecer la tarea sin tocar el reloj
    // ni la base, así que se mira desde un día fijo muy posterior a cualquier
    // creación posible. Para quien mira ese día, la tarea tiene años.
    const tarea = await leer(client, token, id, '2099-12-31')

    assert.equal(tarea.status, 'pending')
    assert.isNull(tarea.dueDate)
    assert.isFalse(tarea.isOverdue)
  })

  test('darla por hecha la deja de vencer y conserva la fecha', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await tareaConFecha(client, token, AYER)

    const antes = await leer(client, token, id)
    assert.isTrue(antes.isOverdue)

    await cambiarEstado(client, token, id, 'done')

    const despues = await leer(client, token, id)
    assert.equal(despues.status, 'done')
    assert.isFalse(despues.isOverdue)
    assert.equal(despues.dueDate, antes.dueDate)
  })

  test('una tarea hecha con la fecha pasada no llega vencida', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await crearTarea(client, token)
    await cambiarEstado(client, token, id, 'done')
    const conFecha = await fijarFecha(client, token, id, AYER)
    conFecha.assertStatus(200)

    const tarea = await leer(client, token, id)

    assert.equal(tarea.status, 'done')
    assert.isFalse(tarea.isOverdue)
  })

  test('aplazar resuelve el vencimiento en la misma respuesta', async ({ client, assert }) => {
    const token = await persona(client)
    const id = await tareaConFecha(client, token, AYER)

    const antes = await leer(client, token, id)
    assert.isTrue(antes.isOverdue)

    const aplazada = await fijarFecha(client, token, id, MANANA)

    aplazada.assertStatus(200)
    assert.equal(aplazada.body().data.id, id)
    assert.isFalse(aplazada.body().data.isOverdue)
  })
})
