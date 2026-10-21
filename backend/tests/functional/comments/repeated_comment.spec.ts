import User from '#models/user'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Requirement «Un mismo comentario no se repite seguido» de
 * `openspec/specs/comments/spec.md`. Se compara el texto ya recortado contra
 * el ÚLTIMO comentario de esa misma cuenta en esa misma tarea.
 */
test.group('Comments | un mismo comentario no se repite seguido', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function cuenta(client: any, fullName: string, email: string) {
    const user = await User.create({ fullName, email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    login.assertStatus(200)
    return { user, token: login.body().data.token as string }
  }

  async function crearTarea(client: any, token: string) {
    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)
    return creada.body().data.id as number
  }

  function comentar(client: any, token: string, id: number, body: string) {
    return client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', `Bearer ${token}`)
      .json({ body })
  }

  async function comentariosConTexto(taskId: number, body: string) {
    const [fila] = await db
      .from('comments')
      .where('task_id', taskId)
      .where('body', body)
      .count('* as total')
    return Number(fila.total)
  }

  test('El mismo texto dos veces seguidas: 201 y luego 422 sobre body, queda uno solo', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const primero = await comentar(client, ada.token, id, 'Ya está subido')
    primero.assertStatus(201)

    const segundo = await comentar(client, ada.token, id, 'Ya está subido')
    segundo.assertStatus(422)
    segundo.assertBodyContains({ errors: [{ field: 'body' }] })

    assert.equal(await comentariosConTexto(id, 'Ya está subido'), 1)
  })

  test('El mismo texto dos veces seguidas: el segundo con espacios en los extremos también da 422', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const primero = await comentar(client, ada.token, id, 'Ya está subido')
    primero.assertStatus(201)

    const segundo = await comentar(client, ada.token, id, '   Ya está subido  ')
    segundo.assertStatus(422)
    segundo.assertBodyContains({ errors: [{ field: 'body' }] })

    const [fila] = await db.from('comments').where('task_id', id).count('* as total')
    assert.equal(Number(fila.total), 1)
    assert.equal(await comentariosConTexto(id, 'Ya está subido'), 1)
  })

  test('Lo repetido pero no seguido sí se admite: A, B y A otra vez dan 201 los tres', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const id = await crearTarea(client, ada.token)

    const a1 = await comentar(client, ada.token, id, 'Ya está subido')
    a1.assertStatus(201)
    const b = await comentar(client, ada.token, id, 'Falta revisarlo')
    b.assertStatus(201)
    const a2 = await comentar(client, ada.token, id, 'Ya está subido')
    a2.assertStatus(201)

    assert.equal(await comentariosConTexto(id, 'Ya está subido'), 2)
    assert.equal(await comentariosConTexto(id, 'Falta revisarlo'), 1)
  })

  test('Otra cuenta puede decir lo mismo: el mismo texto de dos cuentas da 201 a ambas', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta(client, 'Ada Lovelace', 'ada@example.com')
    const grace = await cuenta(client, 'Grace Hopper', 'grace@example.com')
    const id = await crearTarea(client, ada.token)

    const deAda = await comentar(client, ada.token, id, 'De acuerdo')
    deAda.assertStatus(201)
    assert.equal(deAda.body().data.author.id, ada.user.id)

    const deGrace = await comentar(client, grace.token, id, 'De acuerdo')
    deGrace.assertStatus(201)
    assert.equal(deGrace.body().data.author.id, grace.user.id)

    assert.equal(await comentariosConTexto(id, 'De acuerdo'), 2)
  })
})
