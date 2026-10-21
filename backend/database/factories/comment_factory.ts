import factory from '@adonisjs/lucid/factories'
import Comment from '#models/comment'
import { TaskFactory } from '#database/factories/task_factory'
import { UserFactory } from '#database/factories/user_factory'

/**
 * Textos inventados, escritos como los dejaría un equipo junto a una tarea: una
 * aclaración, una novedad, una pregunta. Ninguno lleva espacios sobrantes, ninguno
 * está vacío, todos quedan muy por debajo de los 500 caracteres y no hay dos
 * iguales, de modo que tomar varios distintos nunca repite texto.
 */
export const TEXTOS_COMENTARIO = [
  'Falta el informe del trimestre',
  'Lo miro esta tarde y os cuento',
  'Ya está subido a la carpeta compartida',
  'He hablado con soporte: el cliente lo necesita antes del viernes',
  '¿Esto incluye también la versión móvil?',
  'Bloqueado hasta que nos den acceso al entorno de pruebas',
  'Lo dejo en curso; mañana termino las pruebas',
  'Revisado. Solo falta el visto bueno de diseño',
  'He encontrado otro caso que falla con fechas de fin de mes',
  'Lo hablamos en la reunión del lunes',
  'Pasado a la rama de trabajo, pendiente de revisión',
  'Me encargo yo de las diapositivas',
  'Hay que avisar a quien usa la API antigua antes de cambiarlo',
  'Hecho, pero conviene repasarlo con datos reales',
  'Añado una captura con el error en el hilo de soporte',
  'No consigo reproducirlo en local; ¿alguien tiene los pasos exactos?',
  'Prioridad alta según producto',
  'Lo aplazo una semana: depende de la migración de la base',
]

/**
 * Un comentario. Lo que el esquema deja pasar y la factory no:
 *
 * - **Texto presentable.** `body` solo exige no nulo, no en blanco y ≤ 500: con
 *   espacios en los extremos pasaría el esquema. Aquí siempre sale ya recortado,
 *   que es como lo guarda la API.
 * - **Autor y tarea registrados.** Las dos claves foráneas lo exigen; las
 *   relaciones `author` y `task` los crean con `UserFactory` y `TaskFactory` si no
 *   se da uno (`.with('author')`, `.with('task')`) o se fijan con `merge`.
 *
 * Lo que la factory **no** comprueba es el «no repetir seguido», porque mira otras
 * filas: quien cree varios comentarios de la misma cuenta en la misma tarea tiene
 * que dar textos distintos a dos seguidos (como hace el seeder).
 */
export const CommentFactory = factory
  .define(Comment, ({ faker }) => {
    return {
      body: faker.helpers.arrayElement(TEXTOS_COMENTARIO),
    }
  })
  .relation('author', () => UserFactory)
  .relation('task', () => TaskFactory)
  .build()
