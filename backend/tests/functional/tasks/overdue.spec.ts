import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito
 * «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`: vencida
 * si, y solo si, tiene fecha, esa fecha es anterior al día de referencia y su
 * estado no es `done`.
 *
 * Todo entra por HTTP, como un cliente: la tarea se crea con `POST`, la fecha
 * se pone con `PUT /due-date`, el estado se cambia con `PATCH /status` y el
 * vencimiento se lee en el `isOverdue` de `GET /:id` (o de la propia respuesta
 * del cambio de fecha). El día de referencia va siempre explícito en `today`:
 * ningún test depende del reloj.
 */
test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'
  const HACE_UN_MES = '2026-07-20'

  const con = (token: string) => ({ Authorization: `Bearer ${token}` })

  async function sesion(client: any) {
    const email = 'ada@example.com'
    await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    login.assertStatus(200)

    return login.body().data.token as string
  }

  /** Crea la tarea por la API y devuelve el id que la API le haya dado. */
  async function crear(client: any, token: string) {
    const creada = await client
      .post('/api/v1/tasks')
      .headers(con(token))
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)

    return creada.body().data.id as number
  }

  async function ponerFecha(client: any, token: string, id: number, dueDate: string | null) {
    const response = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .headers(con(token))
      .json({ dueDate, today: HOY })
    response.assertStatus(200)

    return response
  }

  async function ponerEstado(client: any, token: string, id: number, status: string) {
    const response = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .headers(con(token))
      .json({ status })
    response.assertStatus(200)
  }

  async function consultar(client: any, token: string, id: number, today = HOY) {
    const response = await client.get(`/api/v1/tasks/${id}`).qs({ today }).headers(con(token))
    response.assertStatus(200)

    return response.body().data
  }

  test('fecha del día anterior: la tarea llega vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerFecha(client, token, id, AYER)

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isTrue(tarea.isOverdue)
  })

  test('vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerFecha(client, token, id, HOY)

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isFalse(tarea.isOverdue)
  })

  test('fecha futura: la tarea no llega vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerFecha(client, token, id, MANANA)

    const tarea = await consultar(client, token, id)

    assert.isFalse(tarea.isOverdue)
  })

  test('sin fecha no se vence nunca, por antigua que sea', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    // Solo preparación: la API no deja fijar la fecha de creación, y el scenario
    // pide una tarea creada hace semanas respecto del día de referencia.
    await Task.query().where('id', id).update({ created_at: `${HACE_UN_MES}T09:00:00Z` })

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isNull(tarea.dueDate)
    assert.isFalse(tarea.isOverdue)
  })

  test('darla por hecha la deja de vencer y conserva su fecha', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerFecha(client, token, id, AYER)

    const antes = await consultar(client, token, id)
    assert.isTrue(antes.isOverdue)

    await ponerEstado(client, token, id, 'done')

    const despues = await consultar(client, token, id)
    assert.equal(despues.status, 'done')
    assert.isFalse(despues.isOverdue)
    assert.equal(despues.dueDate, antes.dueDate)
  })

  test('una tarea hecha con la fecha pasada no llega vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerEstado(client, token, id, 'done')
    await ponerFecha(client, token, id, HACE_UN_MES)

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'done')
    assert.isFalse(tarea.isOverdue)
  })

  test('aplazar resuelve el vencimiento en la misma respuesta del cambio', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const id = await crear(client, token)
    await ponerFecha(client, token, id, AYER)
    assert.isTrue((await consultar(client, token, id)).isOverdue)

    const aplazada = await ponerFecha(client, token, id, MANANA)

    assert.equal(aplazada.body().data.id, id)
    assert.isFalse(aplazada.body().data.isOverdue)
  })
})
