import Task from '#models/task'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import { CommentSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Un comentario sobre una tarea. Las columnas vienen de `CommentSchema`, generada
 * desde la migración; aquí solo va lo que el esquema no sabe.
 *
 * La relación va en un solo sentido: `Task` no declara sus comentarios. El hilo
 * se lee consultando `Comment` por `taskId` (`TaskCommentsController.index`),
 * después de comprobar la tarea con `Task.findOrFail`, así que no hace falta
 * recorrerlo desde la tarea.
 */
export default class Comment extends CommentSchema {
  /**
   * Quien lo escribió: siempre la cuenta dueña del token con que se envió, nunca
   * la que diga el cuerpo de la petición.
   */
  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  /**
   * La tarea comentada. Pasa por `Task`, así que una tarea en la papelera no se
   * carga por aquí. Hoy solo la usa `CommentFactory` para crear la tarea cuando no
   * se le da una.
   */
  @belongsTo(() => Task, { foreignKey: 'taskId' })
  declare task: BelongsTo<typeof Task>
}
