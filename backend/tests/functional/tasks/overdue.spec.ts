import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito del mismo
 * nombre de `openspec/specs/tasks/spec.md`, con su título literal.
 *
 * Todo entra por la API, por los mismos caminos que usa el frontend (`lib/api.ts`): la
 * cuenta se registra, la tarea se crea, se le pone fecha y se le cambia el estado por
 * HTTP, y lo que se comprueba es el `isOverdue` que llega en el cuerpo. «Se consulta»
 * es `GET /api/v1/tasks/:id?today=...`, la lectura que informa del vencimiento; el
 * scenario de aplazar mira, como dice, la respuesta del propio cambio de fecha. Cuando
 * un scenario compara un antes y un después, los dos se leen por el mismo camino.
 *
 * El día de referencia va siempre en la petición y es fijo. Ninguna fecha sale del
 * reloj: la antigüedad de «creada hace semanas» se cuenta desde el `createdAt` que
 * devuelve la propia creación.
 */
test.group('Tasks | cuándo una tarea está vencida', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-08-20'
  const AYER = '2026-08-19'
  const MANANA = '2026-08-21'

  /** Lo leído, para que un fallo diga qué llegó y contra qué día. */
  const leida = (tarea: any, today: string) =>
    `status=${tarea.status} dueDate=${tarea.dueDate} today=${today} isOverdue=${tarea.isOverdue}`

  async function sesion(client: any) {
    const signup = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })
    signup.assertStatus(200)
    const auth = { Authorization: `Bearer ${signup.body().data.token}` }

    return {
      async crear() {
        const response = await client
          .post('/api/v1/tasks')
          .headers(auth)
          .json({ title: 'Revisar el informe' })
        response.assertStatus(201)
        return response.body().data
      },

      async fijarFecha(id: number, dueDate: string | null, today = HOY) {
        const response = await client
          .put(`/api/v1/tasks/${id}/due-date`)
          .headers(auth)
          .json({ dueDate, today })
        response.assertStatus(200)
        return response.body().data
      },

      async cambiarEstado(id: number, status: string) {
        const response = await client
          .patch(`/api/v1/tasks/${id}/status`)
          .headers(auth)
          .json({ status })
        response.assertStatus(200)
        return response.body().data
      },

      async consultar(id: number, today = HOY) {
        const response = await client.get(`/api/v1/tasks/${id}`).qs({ today }).headers(auth)
        response.assertStatus(200)
        return response.body().data
      },
    }
  }

  test('Fecha del día anterior', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()
    await ada.fijarFecha(id, AYER)

    const tarea = await ada.consultar(id)

    assert.equal(tarea.id, id)
    assert.notEqual(tarea.status, 'done')
    assert.isTrue(tarea.isOverdue, leida(tarea, HOY))
  })

  test('Vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()
    await ada.fijarFecha(id, HOY)

    const tarea = await ada.consultar(id)

    assert.equal(tarea.id, id)
    assert.notEqual(tarea.status, 'done')
    assert.isFalse(tarea.isOverdue, leida(tarea, HOY))
  })

  test('Fecha futura', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()
    await ada.fijarFecha(id, MANANA)

    const tarea = await ada.consultar(id)

    assert.equal(tarea.id, id)
    assert.isFalse(tarea.isOverdue, leida(tarea, HOY))
  })

  test('Sin fecha no se vence nunca', async ({ client, assert }) => {
    const ada = await sesion(client)
    const creada = await ada.crear()
    const creadaEl = DateTime.fromISO(creada.createdAt, { zone: 'utc' })

    // «Hace semanas» y «por antigua que sea»: el día de quien mira, contado desde la creación.
    for (const antiguedad of [{ weeks: 6 }, { years: 10 }]) {
      const today = creadaEl.plus(antiguedad).toFormat('yyyy-MM-dd')

      const tarea = await ada.consultar(creada.id, today)

      assert.equal(tarea.id, creada.id)
      assert.equal(tarea.status, 'pending')
      assert.isNull(tarea.dueDate)
      assert.isFalse(tarea.isOverdue, leida(tarea, today))
    }
  })

  test('Darla por hecha la deja de vencer', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()
    await ada.fijarFecha(id, AYER)

    const antes = await ada.consultar(id)
    assert.isTrue(antes.isOverdue, `antes de darla por hecha: ${leida(antes, HOY)}`)

    await ada.cambiarEstado(id, 'done')

    const despues = await ada.consultar(id)
    assert.equal(despues.status, 'done')
    assert.isFalse(despues.isOverdue, `después de darla por hecha: ${leida(despues, HOY)}`)
    assert.equal(despues.dueDate, antes.dueDate)
  })

  test('Una tarea hecha con la fecha pasada', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()
    await ada.cambiarEstado(id, 'done')
    await ada.fijarFecha(id, AYER)

    const tarea = await ada.consultar(id)

    assert.equal(tarea.id, id)
    assert.equal(tarea.status, 'done')
    assert.isNotNull(tarea.dueDate)
    assert.isFalse(tarea.isOverdue, leida(tarea, HOY))
  })

  test('Aplazar resuelve el vencimiento', async ({ client, assert }) => {
    const ada = await sesion(client)
    const { id } = await ada.crear()

    const vencida = await ada.fijarFecha(id, AYER)
    assert.isTrue(vencida.isOverdue, `antes de aplazarla: ${leida(vencida, HOY)}`)

    const aplazada = await ada.fijarFecha(id, MANANA)

    assert.equal(aplazada.id, id)
    assert.notEqual(aplazada.dueDate, vencida.dueDate)
    assert.isFalse(aplazada.isOverdue, `en la respuesta de aplazarla: ${leida(aplazada, HOY)}`)
  })
})
