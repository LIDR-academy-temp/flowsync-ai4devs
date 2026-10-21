import User from '#models/user'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Requirement «Comentar una tarea» de `openspec/specs/comments/spec.md`.
 * Un test (o más) por scenario, todo por HTTP. Lo único que se mira fuera de
 * la API es la tabla `comments`, para poder afirmar «no se crea ningún
 * comentario».
 */
test.group('Comments | comentar una tarea', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // `GET /api/v1/tasks/:id` exige el día de quien mira; fecha fija, sin reloj.
  const DIA_DE_REFERENCIA = '2026-08-20'

  async function cuenta(client: any, fullName: string, email: string) {
    const user = await User.create({ fullName, email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    login.assertStatus(200)
    return { user, token: login.body().data.token as string }
  }

  async function crearTarea(client: any, token: string, title = 'Revisar el informe') {
    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title })
    creada.assertStatus(201)
    return creada.body().data.id as number
  }

  async function comentariosDe(taskId: number) {
    const [fila] = await db.from('comments').where('task_id', taskId).count('* as total')
    return Number(fila.total)
  }

  async function totalComentarios() {
    const [fila] = await db.from('comments').count('* as total')
    return Number(fila.total)
  }

  test('Alta con el texto como único dato: 201 con id, body, author y createdAt', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const response = await client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', `Bearer ${ada.token}`)
      .json({ body: 'Falta el informe del trimestre' })

    response.assertStatus(201)

    const body = response.body()
    assert.deepEqual(Object.keys(body), ['data'])

    const comentario = body.data
    assert.deepEqual(Object.keys(comentario).sort(), ['author', 'body', 'createdAt', 'id'])
    assert.isNumber(comentario.id)
    assert.equal(comentario.body, 'Falta el informe del trimestre')
    assert.isString(comentario.createdAt)
    assert.isFalse(Number.isNaN(Date.parse(comentario.createdAt)))

    // El autor lleva exactamente id, nombre e iniciales: ni email ni nada más.
    assert.deepEqual(Object.keys(comentario.author).sort(), ['fullName', 'id', 'initials'])
    assert.equal(comentario.author.id, ada.user.id)
    assert.equal(comentario.author.fullName, 'Ada Lovelace')
    assert.equal(comentario.author.initials, 'AL')
    assert.notInclude(JSON.stringify(body), 'ada@example.com')

    assert.equal(await comentariosDe(id), 1)
  })

  test('El comentario nace a nombre de quien lo envía aunque el cuerpo traiga author y authorId', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const id = await crearTarea(client, ada.token)

    const response = await client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', `Bearer ${ada.token}`)
      .json({
        body: 'Lo firmo yo',
        authorId: grace.user.id,
        author: { id: grace.user.id, fullName: 'Grace Hopper', initials: 'GH' },
      })

    response.assertStatus(201)
    const author = response.body().data.author
    assert.equal(author.id, ada.user.id)
    assert.equal(author.fullName, 'Ada Lovelace')
    assert.equal(author.initials, 'AL')

    const filas = await db.from('comments').where('task_id', id).select('author_id')
    assert.lengthOf(filas, 1)
    assert.equal(Number(filas[0].author_id), ada.user.id)
  })

  test('Comentar no cambia la tarea: título, estado y responsable iguales antes y después', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const id = await crearTarea(client, ada.token, 'Preparar la demo')

    // Un estado distinto del de nacimiento, para que «sigue igual» no pueda
    // confundirse con «vuelve al valor por defecto».
    const cambio = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .header('Authorization', `Bearer ${ada.token}`)
      .json({ status: 'in_progress' })
    cambio.assertStatus(200)

    const leer = () =>
      client
        .get(`/api/v1/tasks/${id}`)
        .qs({ today: DIA_DE_REFERENCIA })
        .header('Authorization', `Bearer ${ada.token}`)

    const antes = await leer()
    antes.assertStatus(200)

    // Comenta otra cuenta, que no es la responsable.
    const comentario = await client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', `Bearer ${grace.token}`)
      .json({ body: 'Yo me encargo de las diapositivas' })
    comentario.assertStatus(201)

    const despues = await leer()
    despues.assertStatus(200)

    const a = antes.body().data
    const d = despues.body().data
    assert.equal(a.title, 'Preparar la demo')
    assert.equal(a.status, 'in_progress')
    assert.equal(a.assignee.id, ada.user.id)

    assert.equal(d.title, a.title)
    assert.equal(d.status, a.status)
    assert.deepEqual(d.assignee, a.assignee)
  })

  test('Una tarea que no existe no se comenta: 404 y ningún comentario', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const existente = await crearTarea(client, ada.token)
    const inexistente = existente + 999999

    const response = await client
      .post(`/api/v1/tasks/${inexistente}/comments`)
      .header('Authorization', `Bearer ${ada.token}`)
      .json({ body: 'Comentario sobre nada' })

    response.assertStatus(404)
    assert.equal(await comentariosDe(inexistente), 0)
    assert.equal(await totalComentarios(), 0)
  })

  test('Una tarea que no existe no se comenta: 404 también con un cuerpo inválido', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const existente = await crearTarea(client, ada.token)
    const inexistente = existente + 999999

    for (const cuerpo of [{ body: '' }, {}, { body: 'x'.repeat(501) }]) {
      const response = await client
        .post(`/api/v1/tasks/${inexistente}/comments`)
        .header('Authorization', `Bearer ${ada.token}`)
        .json(cuerpo)

      response.assertStatus(404)
    }

    assert.equal(await totalComentarios(), 0)
  })

  test('Sin sesión no se comenta: 401 sin token y ningún comentario', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const response = await client
      .post(`/api/v1/tasks/${id}/comments`)
      .json({ body: 'Sin credenciales' })

    response.assertStatus(401)
    assert.equal(await comentariosDe(id), 0)
  })

  test('Sin sesión no se comenta: 401 con un token que no es válido y ningún comentario', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const response = await client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', 'Bearer oat_1.esto-no-es-un-token')
      .json({ body: 'Con un token inventado' })

    response.assertStatus(401)
    assert.equal(await comentariosDe(id), 0)
  })
})
