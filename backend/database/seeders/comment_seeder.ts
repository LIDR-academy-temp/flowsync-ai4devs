import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Task from '#models/task'
import User from '#models/user'
import MainSeeder, { EQUIPO } from '#database/seeders/main_seeder'
import { CommentFactory, TEXTOS_COMENTARIO } from '#database/factories/comment_factory'
import { emailPara } from '#database/factories/user_factory'

/**
 * Cuántas tareas llevan hilo. No todas: una tarea sin comentarios es lo normal, y
 * el dato de desarrollo tiene que enseñar las dos cosas.
 */
const TAREAS_CON_HILO = 12

/** Cuántos comentarios lleva cada hilo, como mucho. */
const MAX_POR_HILO = 4

export default class extends BaseSeeder {
  /**
   * Solo en desarrollo, igual que el seeder principal: las cuentas que usa llevan
   * una contraseña pública.
   */
  static environment = ['development']

  /**
   * Se puede lanzar las veces que haga falta y en cualquier orden respecto al
   * seeder principal.
   *
   * Primero se asegura de que existan el equipo y sus tareas lanzando el seeder
   * principal, que es idempotente: con la base vacía los crea, y si ya están no
   * hace nada. Así este seeder deja comentarios aunque se lance solo, y no
   * repite aquí cómo se siembran cuentas y tareas.
   *
   * Después elige las tareas más antiguas del equipo y le da hilo a las que aún
   * no tienen ningún comentario; una tarea que ya tiene alguno no se toca. Todo
   * va en una transacción: o se siembra entero o no queda nada a medias.
   */
  async run() {
    await new MainSeeder(this.client).run()

    await db.transaction(async (trx) => {
      // Las cinco personas del seeder principal, en su mismo orden.
      const equipo: User[] = []
      for (const fullName of EQUIPO) {
        equipo.push(
          await User.query({ client: trx }).where('email', emailPara(fullName)).firstOrFail()
        )
      }

      const tareas = await Task.query({ client: trx })
        .whereIn(
          'assigneeId',
          equipo.map((persona) => persona.id)
        )
        .orderBy('createdAt', 'asc')
        .orderBy('id', 'asc')
        .limit(TAREAS_CON_HILO)

      const conHilo = await trx
        .from('comments')
        .whereIn(
          'task_id',
          tareas.map((tarea) => tarea.id)
        )
        .distinct('task_id')
      const yaComentadas = new Set(conHilo.map((fila) => Number(fila.task_id)))

      const ahora = DateTime.now()

      for (const [i, tarea] of tareas.entries()) {
        if (yaComentadas.has(tarea.id)) continue

        const cuantos = 1 + (i % MAX_POR_HILO)

        // Textos distintos dentro del hilo: así ninguna cuenta repite seguido, que
        // es la regla que la base no impone y la API sí.
        const textos = shuffle(TEXTOS_COMENTARIO).slice(0, cuantos)

        // Los comentarios caen entre la creación de la tarea y ahora, en orden.
        const tramo = ahora.diff(tarea.createdAt).as('milliseconds') / (cuantos + 1)

        const primera = equipo.findIndex((persona) => persona.id === tarea.assigneeId)

        for (const [j, body] of textos.entries()) {
          const createdAt = tarea.createdAt.plus({ milliseconds: Math.floor((j + 1) * tramo) })

          await CommentFactory.client(trx)
            .merge({
              taskId: tarea.id,
              // Empieza por la responsable y va rotando por el equipo.
              authorId: equipo[(primera + j) % equipo.length].id,
              body,
              createdAt,
              updatedAt: createdAt,
            })
            .create()
        }
      }
    })
  }
}

function shuffle<T>(items: readonly T[]): T[] {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
