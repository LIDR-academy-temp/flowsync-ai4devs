import Task from '#models/task'
import Comment from '#models/comment'
import { inject } from '@adonisjs/core'
import { CommentService } from '#services/comment_service'
import { createCommentValidator } from '#validators/comment'
import type { HttpContext } from '@adonisjs/core/http'
import CommentTransformer from '#transformers/comment_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  CommentListResponse,
  CommentResponse,
  CreateCommentBody,
  ErrorResponse,
  ValidationErrorResponse,
} from '#openapi/schemas'

@ApiBearerAuth()
export default class TaskCommentsController {
  /**
   * El hilo de una tarea, del comentario más antiguo al más reciente, que es el
   * orden en que se escribieron. El desempate por identificador lo deja estable
   * aunque dos comentarios compartan instante.
   *
   * Primero la tarea: una que no existe, o que está en la papelera, no tiene hilo
   * y es un 404, no una lista vacía. Vacía es solo la de una tarea viva sin
   * comentarios. No admite filtros ni paginación: el hilo se devuelve entero.
   */
  @ApiOperation({
    summary: 'Leer los comentarios de una tarea',
    description:
      'Devuelve los comentarios de la tarea, del más antiguo al más reciente, cada uno con la misma forma que devuelve el alta. Del autor solo viajan su identificador, su nombre y sus iniciales, nunca su email. Es el mismo hilo para cualquier cuenta con sesión.',
  })
  @ApiResponse({
    status: 200,
    description:
      'El hilo entero. Vacío es una respuesta legítima: `data` es una lista sin filas si la tarea no tiene comentarios.',
    type: () => CommentListResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. No se devuelve ningún comentario.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description:
      'No existe ninguna tarea viva con ese identificador: no existe o está en la papelera.',
    type: () => ErrorResponse,
  })
  async index({ params, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)

    const comments = await Comment.query()
      .where('taskId', task.id)
      .preload('author')
      .orderBy('createdAt', 'asc')
      .orderBy('id', 'asc')

    return serialize(CommentTransformer.transform(comments))
  }

  /**
   * Comentar es apuntar algo junto a una tarea sin tocarla: ni su título, ni su
   * estado, ni su responsable cambian. Cualquier persona con sesión comenta
   * cualquier tarea viva, sea o no la responsable.
   *
   * El orden importa: primero la tarea y después el cuerpo, de modo que comentar
   * una tarea que no existe es un 404 aunque el texto sea inválido. Lo que está
   * en la papelera no existe para `Task`, y tampoco se comenta.
   */
  @ApiOperation({
    summary: 'Comentar una tarea',
    description:
      'El texto es el único dato que se lee, y el comentario nace a nombre de la cuenta dueña del token: un `author` o un `authorId` enviados en el cuerpo se ignoran, no se rechazan. Se recortan los espacios de los extremos. Un texto idéntico al último comentario de esa misma cuenta en esa misma tarea se rechaza. La tarea no cambia.',
  })
  @ApiBody({ type: () => CreateCommentBody })
  @ApiResponse({
    status: 201,
    description: 'El comentario ya creado, con el texto recortado y a nombre de quien lo envió.',
    type: () => CommentResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. No se crea ningún comentario.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description:
      'No existe ninguna tarea viva con ese identificador. Se comprueba antes que el cuerpo.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description:
      'El texto falta, está vacío, es solo espacios, pasa de 500 caracteres o repite el último comentario de esa cuenta en esa tarea. El error señala `body` y no se crea nada.',
    type: () => ValidationErrorResponse,
  })
  @inject()
  async store(
    { params, request, response, auth, serialize }: HttpContext,
    comments: CommentService
  ) {
    const task = await Task.findOrFail(params.id)
    const { body } = await request.validateUsing(createCommentValidator)

    const comment = await comments.create(task, auth.getUserOrFail(), body)

    // Como en `TasksController.store`: el estado aparte y el cuerpo devuelto,
    // porque `response.created()` con la promesa de `serialize()` lo deja vacío.
    response.status(201)
    return serialize(CommentTransformer.transform(comment))
  }
}
