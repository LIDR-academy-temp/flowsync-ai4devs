import type Comment from '#models/comment'
import { BaseTransformer } from '@adonisjs/core/transformers'
import TaskAssigneeTransformer from '#transformers/task_assignee_transformer'

export default class CommentTransformer extends BaseTransformer<Comment> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'body', 'createdAt']),
      // Del autor viaja lo mismo que del responsable de una tarea —id, nombre e
      // iniciales, nunca el email—, así que se reutiliza ese transformer en vez
      // de repetirlo. Si algún día las dos formas tienen que separarse, se
      // separan aquí. `updatedAt` no sale: un comentario no se edita.
      author: TaskAssigneeTransformer.transform(this.whenLoaded(this.resource.author)),
    }
  }
}
