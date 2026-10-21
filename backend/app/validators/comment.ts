import vine from '@vinejs/vine'

/**
 * El máximo de un comentario, contado sobre el texto ya recortado. Lo usan
 * también la factory y el documento OpenAPI, para que no haya dos quinientos.
 */
export const COMMENT_BODY_MAX_LENGTH = 500

/**
 * El texto es lo único que se lee de la petición. Un `author` o un `authorId`
 * que vengan en el cuerpo no se rechazan, se ignoran: el validador no los
 * declara y no salen de aquí. El autor es la cuenta dueña del token.
 *
 * Igual que el título de una tarea, `trim()` corre antes que `minLength()`: un
 * texto de solo espacios se queda vacío y se rechaza como si no se hubiera
 * escrito nada. El máximo se comprueba sobre lo ya recortado, y pasarse es un
 * error, nunca un recorte silencioso.
 *
 * Lo que este validador no puede ver es el «no repetir seguido», porque depende
 * de otras filas: eso vive en `CommentService`.
 */
export const createCommentValidator = vine.create({
  body: vine.string().trim().minLength(1).maxLength(COMMENT_BODY_MAX_LENGTH),
})
