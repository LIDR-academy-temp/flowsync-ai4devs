import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que una tarea enseña de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, ningún dato de
 * cuenta junto a la tarea, y responsable sin nombre.
 *
 * Cada scenario se comprueba por los dos caminos por los que se obtiene una
 * tarea —la lista y la tarea suelta— porque hoy los sirven transformers
 * distintos: que uno cumpla no dice nada del otro.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // La tarea suelta exige el día de quien mira; aquí da igual cuál sea.
  const HOY = '2026-11-08'

  async function sesion(client: any, fullName: string | null, email: string) {
    await User.create({ fullName, email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function crearTarea(client: any, token: string, title = 'Revisar el informe') {
    const response = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title })

    response.assertStatus(201)
    return response.body().data.id as number
  }

  async function enLaLista(client: any, token: string, id: number) {
    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const tarea = response.body().data.find((t: { id: number }) => t.id === id)
    if (!tarea) throw new Error(`La tarea ${id} no aparece en la lista`)
    return tarea
  }

  async function suelta(client: any, token: string, id: number) {
    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    return response.body().data
  }

  test('en la lista, el responsable llega con su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await enLaLista(client, token, id)

    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('suelta, el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await suelta(client, token, id)

    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('el nombre y las iniciales distinguen a quién lleva cada tarea', async ({
    client,
    assert,
  }) => {
    const ada = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await sesion(client, 'Grace Hopper', 'grace@example.com')
    const deAda = await crearTarea(client, ada, 'Tarea de Ada')
    const deGrace = await crearTarea(client, grace, 'Tarea de Grace')

    const primera = await enLaLista(client, ada, deAda)
    const segunda = await enLaLista(client, ada, deGrace)

    assert.equal(primera.assignee.fullName, 'Ada Lovelace')
    assert.equal(primera.assignee.initials, 'AL')
    assert.equal(segunda.assignee.fullName, 'Grace Hopper')
    assert.equal(segunda.assignee.initials, 'GH')
  })

  test('en la lista, el responsable no trae el email ni datos de acceso', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await enLaLista(client, token, id)

    assert.notProperty(assignee, 'email')
    assert.notProperty(assignee, 'password')
    // Por si el email se colara bajo otro nombre de campo.
    const serializado = JSON.stringify(assignee)
    assert.notInclude(serializado, 'ada@example.com')
    assert.notInclude(serializado, 'secreto123')
  })

  test('suelta, el responsable no trae el email ni datos de acceso', async ({ client, assert }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await suelta(client, token, id)

    assert.notProperty(assignee, 'email')
    assert.notProperty(assignee, 'password')
    const serializado = JSON.stringify(assignee)
    assert.notInclude(serializado, 'ada@example.com')
    assert.notInclude(serializado, 'secreto123')
  })

  test('en la lista, un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, null, 'sin-nombre@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await enLaLista(client, token, id)

    assert.property(assignee, 'fullName')
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
  })

  test('suelta, un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, null, 'sin-nombre@example.com')
    const id = await crearTarea(client, token)

    const { assignee } = await suelta(client, token, id)

    assert.property(assignee, 'fullName')
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
  })
})
