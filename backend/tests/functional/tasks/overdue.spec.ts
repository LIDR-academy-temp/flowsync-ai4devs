import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito
 * «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`.
 *
 * Todo entra por HTTP y se mira en el cuerpo de la respuesta: `isOverdue`
 * viaja en la tarea. El día de referencia se pasa siempre en `today`; no se
 * usa el reloj del sistema en ningún punto, ni para la fecha de vencimiento ni
 * para el día de quien mira.
 */
test.group('Tasks | vencida', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const DIA_DE_REFERENCIA = '2026-08-20'
  const DIA_ANTERIOR = '2026-08-19'
  const DIA_POSTERIOR = '2026-08-21'

  /** Cuenta con sesión iniciada; devuelve su token. */
  async function sesion(client: any): Promise<string> {
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

  /** Crea una tarea y devuelve el id que responde el servidor. */
  async function crearTarea(client: any, token: string): Promise<number> {
    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)

    return creada.body().data.id as number
  }

  /** Fija o retira la fecha por HTTP y devuelve la respuesta. */
  async function fijarFecha(
    client: any,
    token: string,
    id: number,
    dueDate: string | null,
    today: string = DIA_DE_REFERENCIA
  ) {
    const respuesta = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate, today })
    respuesta.assertStatus(200)

    return respuesta
  }

  /** Consulta la tarea suelta contra el día de referencia indicado. */
  async function consultar(client: any, token: string, id: number, today: string) {
    const respuesta = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today })
      .header('Authorization', `Bearer ${token}`)
    respuesta.assertStatus(200)

    return respuesta.body().data
  }

  /** Cambia el estado por HTTP. */
  async function cambiarEstado(client: any, token: string, id: number, status: string) {
    const respuesta = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .header('Authorization', `Bearer ${token}`)
      .json({ status })
    respuesta.assertStatus(200)
  }

  test('una tarea no hecha con la fecha del día anterior llega vencida', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_ANTERIOR)

    const tarea = await consultar(client, token, id, DIA_DE_REFERENCIA)

    assert.strictEqual(tarea.isOverdue, true)
  })

  test('vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_DE_REFERENCIA)

    const tarea = await consultar(client, token, id, DIA_DE_REFERENCIA)

    assert.strictEqual(tarea.isOverdue, false)
  })

  test('una fecha futura no llega vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_POSTERIOR)

    const tarea = await consultar(client, token, id, DIA_DE_REFERENCIA)

    assert.strictEqual(tarea.isOverdue, false)
  })

  test('sin fecha no se vence nunca, por antigua que sea la tarea', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)

    // «Creada hace semanas»: el día de referencia queda muy por delante de
    // cualquier momento de creación, y aun así no hay fecha que vencer.
    const tarea = await consultar(client, token, id, '2030-01-01')

    assert.isNull(tarea.dueDate)
    assert.strictEqual(tarea.isOverdue, false)
  })

  test('darla por hecha deja de vencerla y conserva su fecha', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_ANTERIOR)

    const antes = await consultar(client, token, id, DIA_DE_REFERENCIA)
    assert.strictEqual(antes.isOverdue, true)

    await cambiarEstado(client, token, id, 'done')

    const despues = await consultar(client, token, id, DIA_DE_REFERENCIA)
    assert.strictEqual(despues.isOverdue, false)
    assert.equal(despues.dueDate, antes.dueDate)
    assert.equal(despues.dueDate, DIA_ANTERIOR)
  })

  test('una tarea hecha con la fecha ya pasada no llega vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_ANTERIOR)
    await cambiarEstado(client, token, id, 'done')

    const tarea = await consultar(client, token, id, DIA_DE_REFERENCIA)

    assert.equal(tarea.status, 'done')
    assert.strictEqual(tarea.isOverdue, false)
  })

  test('aplazar una tarea vencida la deja de mostrar vencida en la misma respuesta', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const id = await crearTarea(client, token)
    await fijarFecha(client, token, id, DIA_ANTERIOR)

    const vencida = await consultar(client, token, id, DIA_DE_REFERENCIA)
    assert.strictEqual(vencida.isOverdue, true)

    const aplazada = await fijarFecha(client, token, id, DIA_POSTERIOR)

    assert.equal(aplazada.body().data.dueDate, DIA_POSTERIOR)
    assert.strictEqual(aplazada.body().data.isOverdue, false)
  })
})
