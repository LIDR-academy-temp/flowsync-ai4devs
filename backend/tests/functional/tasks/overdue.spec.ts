import User from '#models/user'
import Task from '#models/task'
import { DateTime } from 'luxon'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito «Cuándo una
 * tarea está vencida» de `openspec/specs/tasks/spec.md`, con su mismo título y sin
 * ninguno de más.
 *
 * Se lee por la API, como lo lee el cliente: la condición de vencida es el campo
 * `isOverdue` de la tarea en el cuerpo de la respuesta. El día de referencia es un día
 * fijo y viaja en el parámetro `today` de cada petición que informa del vencimiento
 * (requisito «El día de referencia lo pone quien mira»): ningún test mira el reloj.
 */
test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  async function persona(client: any) {
    const email = 'ada@example.com'
    const user = await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return { user, token: login.body().data.token as string }
  }

  const con = (token: string) => ({ Authorization: `Bearer ${token}` })

  /** Crea la tarea por la API y devuelve el identificador que da la propia creación. */
  async function crearTarea(client: any, token: string) {
    const response = await client
      .post('/api/v1/tasks')
      .headers(con(token))
      .json({ title: 'Revisar el informe' })
    response.assertStatus(201)

    return response.body().data.id as number
  }

  async function ponerFecha(client: any, token: string, id: number, dueDate: string) {
    const response = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .qs({ today: HOY })
      .headers(con(token))
      .json({ dueDate })
    response.assertStatus(200)

    return response.body().data
  }

  async function marcarHecha(client: any, token: string, id: number) {
    const response = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .headers(con(token))
      .json({ status: 'done' })
    response.assertStatus(200)
  }

  /** La tarea suelta tal como la recibe quien mira desde `HOY`. */
  async function consultar(client: any, token: string, id: number) {
    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: HOY })
      .headers(con(token))
    response.assertStatus(200)

    return response.body().data
  }

  test('Fecha del día anterior', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, AYER)

    const tarea = await consultar(client, token, id)

    assert.isTrue(tarea.isOverdue)
  })

  test('Vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, HOY)

    const tarea = await consultar(client, token, id)

    assert.isFalse(tarea.isOverdue)
  })

  test('Fecha futura', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, MANANA)

    const tarea = await consultar(client, token, id)

    assert.isFalse(tarea.isOverdue)
  })

  test('Sin fecha no se vence nunca', async ({ client, assert }) => {
    const { user, token } = await persona(client)
    // Por la API una tarea nace en el instante de pedirla, así que «creada hace semanas»
    // solo se puede preparar fijando la fecha de creación al crearla: siete semanas
    // antes del día de referencia.
    const creada = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: user.id,
      createdAt: DateTime.fromISO('2026-07-01T09:00:00Z'),
    })

    const tarea = await consultar(client, token, creada.id)

    // Lo que dice el WHEN, visto por la API: sin fecha, antigua y pendiente.
    assert.isNull(tarea.dueDate)
    assert.equal(tarea.status, 'pending')
    assert.isBelow(Date.parse(tarea.createdAt), Date.parse('2026-08-06'))

    assert.isFalse(tarea.isOverdue)
  })

  test('Darla por hecha la deja de vencer', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, AYER)

    const antes = await consultar(client, token, id)
    // El WHEN parte de una tarea vencida: si no lo estuviera, el test no probaría nada.
    assert.isTrue(antes.isOverdue)

    await marcarHecha(client, token, id)

    const despues = await consultar(client, token, id)

    assert.isFalse(despues.isOverdue)
    assert.equal(despues.dueDate, antes.dueDate)
  })

  test('Una tarea hecha con la fecha pasada', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, AYER)
    await marcarHecha(client, token, id)

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'done')
    assert.isFalse(tarea.isOverdue)
  })

  test('Aplazar resuelve el vencimiento', async ({ client, assert }) => {
    const { token } = await persona(client)
    const id = await crearTarea(client, token)
    await ponerFecha(client, token, id, AYER)

    const antes = await consultar(client, token, id)
    // El WHEN parte de una tarea vencida.
    assert.isTrue(antes.isOverdue)

    // La comprobación es sobre la respuesta del propio cambio, no sobre una consulta
    // posterior.
    const aplazada = await ponerFecha(client, token, id, MANANA)

    assert.isFalse(aplazada.isOverdue)
  })
})
