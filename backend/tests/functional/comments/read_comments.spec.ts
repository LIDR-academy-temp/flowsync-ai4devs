import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Requirement «Leer los comentarios de una tarea» de `openspec/specs/comments/spec.md`.
 * Un test (o más) por scenario, todo por HTTP: los comentarios se escriben con
 * `POST /api/v1/tasks/:id/comments` y se leen con `GET /api/v1/tasks/:id/comments`.
 * No se consulta ninguna tabla.
 */
test.group('Comments | leer los comentarios de una tarea', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

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

  async function comentar(client: any, token: string, taskId: number, body: string) {
    const creado = await client
      .post(`/api/v1/tasks/${taskId}/comments`)
      .header('Authorization', `Bearer ${token}`)
      .json({ body })
    creado.assertStatus(201)
    return creado.body().data
  }

  function leerHilo(client: any, token: string, taskId: number) {
    return client.get(`/api/v1/tasks/${taskId}/comments`).header('Authorization', `Bearer ${token}`)
  }

  test('Orden de escritura: 200 con los tres comentarios en el orden en que se escribieron', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const id = await crearTarea(client, ada.token)

    // Textos que no siguen orden alfabético, para que un orden por `body`
    // no pase por orden de escritura.
    const primero = await comentar(client, ada.token, id, 'Tercero en el alfabeto: zeta')
    const segundo = await comentar(client, grace.token, id, 'Antes que nadie en el alfabeto')
    const tercero = await comentar(client, ada.token, id, 'Más o menos en medio')

    const response = await leerHilo(client, ada.token, id)
    response.assertStatus(200)

    const body = response.body()
    assert.deepEqual(Object.keys(body), ['data'])
    assert.isArray(body.data)
    assert.lengthOf(body.data, 3)

    assert.deepEqual(
      body.data.map((c: any) => c.body),
      ['Tercero en el alfabeto: zeta', 'Antes que nadie en el alfabeto', 'Más o menos en medio']
    )
    assert.deepEqual(
      body.data.map((c: any) => c.id),
      [primero.id, segundo.id, tercero.id]
    )
    assert.deepEqual(
      body.data.map((c: any) => c.author.id),
      [ada.user.id, grace.user.id, ada.user.id]
    )

    // Cada elemento tiene la misma forma que el comentario devuelto por el POST.
    const creados = [primero, segundo, tercero]
    body.data.forEach((comentario: any, i: number) => {
      assert.deepEqual(Object.keys(comentario).sort(), ['author', 'body', 'createdAt', 'id'])
      assert.isNumber(comentario.id)
      assert.isString(comentario.createdAt)
      assert.isFalse(Number.isNaN(Date.parse(comentario.createdAt)))
      assert.equal(Date.parse(comentario.createdAt), Date.parse(creados[i].createdAt))
      assert.deepEqual(comentario.author, creados[i].author)
    })
  })

  test('El autor no filtra datos de cuenta: cada author trae exactamente id, fullName e initials, sin email', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const id = await crearTarea(client, ada.token)

    await comentar(client, ada.token, id, 'Empiezo yo con la introducción')
    await comentar(client, grace.token, id, 'Yo sigo con las conclusiones')

    const response = await leerHilo(client, ada.token, id)
    response.assertStatus(200)

    const data = response.body().data
    assert.lengthOf(data, 2)

    for (const comentario of data) {
      assert.deepEqual(Object.keys(comentario.author).sort(), ['fullName', 'id', 'initials'])
      assert.notProperty(comentario.author, 'email')
    }

    assert.deepEqual(data[0].author, { id: ada.user.id, fullName: 'Ada Lovelace', initials: 'AL' })
    assert.deepEqual(data[1].author, {
      id: grace.user.id,
      fullName: 'Grace Hopper',
      initials: 'GH',
    })

    const crudo = JSON.stringify(response.body())
    assert.notInclude(crudo, 'ada@example.com')
    assert.notInclude(crudo, 'grace@example.com')
    assert.notInclude(crudo, 'email')
  })

  test('Una tarea sin comentarios es una lista vacía: 200 con data igual a []', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const response = await leerHilo(client, ada.token, id)
    response.assertStatus(200)
    assert.deepEqual(response.body(), { data: [] })
  })

  test('Una tarea sin comentarios es una lista vacía: 200 con [] aunque otra tarea sí tenga comentarios', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const comentada = await crearTarea(client, ada.token, 'Tarea con hilo')
    const callada = await crearTarea(client, ada.token, 'Tarea sin hilo')

    await comentar(client, ada.token, comentada, 'Esto solo va en la tarea con hilo')

    const response = await leerHilo(client, ada.token, callada)
    response.assertStatus(200)
    assert.deepEqual(response.body(), { data: [] })
  })

  test('Los comentarios son de su tarea: el hilo de cada tarea trae solo los suyos', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const tareaA = await crearTarea(client, ada.token, 'Preparar la demo')
    const tareaB = await crearTarea(client, ada.token, 'Cerrar el presupuesto')

    // Intercalados entre las dos tareas y entre las dos cuentas.
    await comentar(client, ada.token, tareaA, 'Demo: guion listo')
    await comentar(client, grace.token, tareaB, 'Presupuesto: falta la partida de viajes')
    await comentar(client, grace.token, tareaA, 'Demo: yo hago las diapositivas')
    await comentar(client, ada.token, tareaB, 'Presupuesto: lo reviso el lunes')
    await comentar(client, ada.token, tareaA, 'Demo: ensayo el jueves')

    const hiloA = await leerHilo(client, ada.token, tareaA)
    hiloA.assertStatus(200)
    assert.deepEqual(
      hiloA.body().data.map((c: any) => c.body),
      ['Demo: guion listo', 'Demo: yo hago las diapositivas', 'Demo: ensayo el jueves']
    )

    const hiloB = await leerHilo(client, ada.token, tareaB)
    hiloB.assertStatus(200)
    assert.deepEqual(
      hiloB.body().data.map((c: any) => c.body),
      ['Presupuesto: falta la partida de viajes', 'Presupuesto: lo reviso el lunes']
    )

    const idsA = hiloA.body().data.map((c: any) => c.id)
    const idsB = hiloB.body().data.map((c: any) => c.id)
    assert.deepEqual(
      idsA.filter((x: number) => idsB.includes(x)),
      []
    )
  })

  test('Una tarea que no existe no tiene hilo: 404 con un identificador que no corresponde a ninguna tarea', async ({
    client,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const existente = await crearTarea(client, ada.token)
    await comentar(client, ada.token, existente, 'Este sí tiene tarea')
    const inexistente = existente + 999999

    const response = await leerHilo(client, ada.token, inexistente)
    response.assertStatus(404)
  })

  test('Una tarea que no existe no tiene hilo: 401 sin token', async ({ client, assert }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)
    await comentar(client, ada.token, id, 'Solo para quien tenga sesión')

    const response = await client.get(`/api/v1/tasks/${id}/comments`)
    response.assertStatus(401)
    assert.notInclude(JSON.stringify(response.body()), 'Solo para quien tenga sesión')
  })

  test('Una tarea que no existe no tiene hilo: 401 con un token que no es válido', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)
    await comentar(client, ada.token, id, 'Solo para quien tenga sesión')

    const response = await client
      .get(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', 'Bearer oat_1.esto-no-es-un-token')
    response.assertStatus(401)
    assert.notInclude(JSON.stringify(response.body()), 'Solo para quien tenga sesión')
  })
})
