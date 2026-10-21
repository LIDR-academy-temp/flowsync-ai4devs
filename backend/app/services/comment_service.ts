import db from '@adonisjs/lucid/services/db'
import { errors } from '@vinejs/vine'
import Comment from '#models/comment'
import Task from '#models/task'
import type User from '#models/user'

/**
 * Las reglas del alta de un comentario que no caben en un validador porque
 * dependen de lo que ya hay en la base.
 */
export class CommentService {
  /**
   * Crea el comentario de `author` sobre `task`, con el texto ya validado y
   * recortado.
   *
   * Rechaza el texto idéntico al **último** comentario de esa misma cuenta en
   * esa misma tarea, para que un doble envío accidental no deje el mismo
   * mensaje dos veces. Solo el último: repetir algo que no fue lo inmediatamente
   * anterior es legítimo, y lo que diga otra cuenta no cuenta.
   *
   * El doble envío accidental es justamente el de dos peticiones casi a la vez,
   * así que comprobar y escribir van en una transacción que bloquea la fila de
   * la tarea: la segunda petición espera a que la primera termine y entonces ya
   * ve su comentario. Sin el bloqueo, las dos leerían «no hay ninguno» y las dos
   * pasarían.
   *
   * La tarea no se modifica: el bloqueo es de lectura para escribir, y no se
   * guarda nada en ella.
   */
  async create(task: Task, author: User, body: string): Promise<Comment> {
    const comment = await db.transaction(async (trx) => {
      // Se vuelve a leer por `Task`, así que si la mandaron a la papelera entre
      // tanto, esto es el mismo 404 que habría dado al principio.
      await Task.query({ client: trx }).where('id', task.id).forUpdate().firstOrFail()

      const last = await Comment.query({ client: trx })
        .where('taskId', task.id)
        .where('authorId', author.id)
        .orderBy('createdAt', 'desc')
        // Desempate estable: dos comentarios en el mismo milisegundo.
        .orderBy('id', 'desc')
        .first()

      if (last?.body === body) {
        // La misma forma que un error de VineJS (`{ errors: [{ message, rule,
        // field }] }`, 422): para quien llama es un texto inválido más, no un
        // tipo de error aparte.
        throw new errors.E_VALIDATION_ERROR([
          {
            message: 'The body field must not repeat your previous comment on this task',
            rule: 'notRepeated',
            field: 'body',
          },
        ])
      }

      return Comment.create({ taskId: task.id, authorId: author.id, body }, { client: trx })
    })

    comment.$setRelated('author', author)

    return comment
  }
}
