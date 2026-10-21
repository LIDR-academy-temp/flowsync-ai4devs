import User from '#models/user'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Requirement «Ningún comentario vacío ni excesivo» de
 * `openspec/specs/comments/spec.md`. Máximo de 500 caracteres contados sobre
 * el texto ya recortado; pasarse es un 422, nunca un recorte silencioso.
 */
test.group('Comments | ningún comentario vacío ni excesivo', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function preparar(client: any) {
    const email = 'ada@example.com'
    await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    login.assertStatus(200)
    const token = login.body().data.token as string

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)

    return { token, id: creada.body().data.id as number }
  }

  function comentar(client: any, token: string, id: number, cuerpo: Record<string, unknown>) {
    return client
      .post(`/api/v1/tasks/${id}/comments`)
      .header('Authorization', `Bearer ${token}`)
      .json(cuerpo)
  }

  async function comentariosDe(taskId: number) {
    const [fila] = await db.from('comments').where('task_id', taskId).count('* as total')
    return Number(fila.total)
  }

  test('Texto ausente, vacío o de solo espacios: sin body da 422 sobre body y nada creado', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)

    const response = await comentar(client, token, id, {})

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'body' }] })
    assert.equal(await comentariosDe(id), 0)
  })

  test('Texto ausente, vacío o de solo espacios: body "" da 422 sobre body y nada creado', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)

    const response = await comentar(client, token, id, { body: '' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'body' }] })
    assert.equal(await comentariosDe(id), 0)
  })

  test('Texto ausente, vacío o de solo espacios: body "   " da 422 sobre body y nada creado', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)

    const response = await comentar(client, token, id, { body: '   ' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'body' }] })
    assert.equal(await comentariosDe(id), 0)
  })

  test('Texto demasiado largo: 501 caracteres dan 422 sobre body y nada creado', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)
    const texto = 'x'.repeat(501)
    assert.lengthOf(texto, 501)

    const response = await comentar(client, token, id, { body: texto })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'body' }] })
    assert.equal(await comentariosDe(id), 0)
  })

  test('Los espacios de los extremos no cuentan: "  Hecho  " se guarda como "Hecho"', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)

    const response = await comentar(client, token, id, { body: '  Hecho  ' })

    response.assertStatus(201)
    assert.equal(response.body().data.body, 'Hecho')

    const filas = await db.from('comments').where('task_id', id).select('body')
    assert.lengthOf(filas, 1)
    assert.equal(filas[0].body, 'Hecho')
  })

  test('Los espacios de los extremos no cuentan: 500 caracteres rodeados de espacios se aceptan', async ({
    client,
    assert,
  }) => {
    const { token, id } = await preparar(client)
    const texto = 'y'.repeat(500)

    const response = await comentar(client, token, id, { body: `   ${texto}   ` })

    response.assertStatus(201)
    assert.equal(response.body().data.body, texto)
    assert.lengthOf(response.body().data.body, 500)
    assert.equal(await comentariosDe(id), 1)
  })
})
