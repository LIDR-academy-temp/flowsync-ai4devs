# Capability: `comments`

El hilo de comentarios de cada tarea: apuntar una aclaración o una novedad junto a la tarea, sin
tocar su título, su estado ni su responsable.

> **Dónde está la verdad.** Las reglas de esta capability viven en
> **[`openspec/specs/comments/spec.md`](../../../openspec/specs/comments/spec.md)** —4 requisitos, 16
> scenarios— y este README **no las repite**: enlaza a cada una y dice dónde está implementada. Lo que
> sí describe de primera mano es lo que se lee del código. Si algo de aquí y la spec no concuerdan,
> manda la spec (ver [ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)).

**Estado: implementados los 4 requisitos.** Se puede comentar una tarea y leer su hilo, del
comentario más antiguo al más reciente.

## Endpoints

Bajo `/api/v1`, declarado en [`backend/start/routes.ts`](../../../backend/start/routes.ts) dentro del
grupo `tasks`, así que exige `Authorization: Bearer <token>` (`.use(middleware.auth())`).

| Método y ruta | Entrada | Controlador | Devuelve |
|---|---|---|---|
| `GET /tasks/:id/comments` | — | [`TaskCommentsController.index`](../../../backend/app/controllers/task_comments_controller.ts) | `200` · el hilo, del más antiguo al más reciente |
| `POST /tasks/:id/comments` | `{ "body": "..." }` | [`TaskCommentsController.store`](../../../backend/app/controllers/task_comments_controller.ts) | `201` · el comentario creado |

Cada respuesta va envuelta en `{ "data": ... }` por el serializer de
[`providers/api_provider.ts`](../../../backend/providers/api_provider.ts), con la forma de
[`CommentTransformer`](../../../backend/app/transformers/comment_transformer.ts); el `GET` devuelve una
lista de elementos con esa misma forma (`{ "data": [] }` si la tarea no tiene comentarios):

```json
{ "id": 1, "body": "Falta el informe del trimestre", "createdAt": "...",
  "author": { "id": 1, "fullName": "Ada Lovelace", "initials": "AL" } }
```

El `author` sale por
[`TaskAssigneeTransformer`](../../../backend/app/transformers/task_assignee_transformer.ts), el mismo
que recorta al responsable de una tarea a `id`, `fullName` e `initials`: nunca el email.

Códigos: `401` sin token o con uno inválido; `404` si la tarea no existe o está en la papelera (en el
`POST` se comprueba **antes** que el cuerpo); en el `POST`, `422` con `{ "errors": [{ "message", "rule", "field": "body" }] }`
si el texto no vale o repite el anterior. En ningún error se crea nada.

### El contrato, servido

Las dos operaciones llevan los decoradores de `@foadonis/openapi` (`GET`: `200`/`401`/`404`; `POST`:
`201`/`401`/`404`/`422`), y sus formas (`Comment`, `CommentResponse`, `CommentListResponse`,
`CreateCommentBody`) están en
[`backend/app/openapi/schemas.ts`](../../../backend/app/openapi/schemas.ts). El documento se sirve en
**`/api.json`** (y la interfaz en `/api`).

## Persistencia

Tabla `comments`, creada por la migración
[`create_comments_table`](../../../backend/database/migrations/1792549790939_create_comments_table.ts):
`id`, `task_id`, `author_id`, `body varchar(500)`, `created_at`, `updated_at`. Las dos claves foráneas
son `ON DELETE CASCADE`, con el porqué escrito en la propia migración. Un `CHECK` impide un `body` en
blanco también fuera de la API, y un índice `(task_id, author_id)` sirve a la búsqueda del último
comentario y, por su primera columna, también a la lectura del hilo por `task_id`. El modelo es [`Comment`](../../../backend/app/models/comment.ts), que extiende la clase
generada en `database/schema.ts`.

## Reglas de negocio: dónde vive cada una

| Área | Implementada en | Requisito que manda |
|---|---|---|
| Comentar una tarea viva | `TaskCommentsController.store`: `Task.findOrFail` primero (lo borrado no existe para `Task`), después el validador | [Comentar una tarea](../../../openspec/specs/comments/spec.md#requirement-comentar-una-tarea) |
| El autor es quien envía | `auth.getUserOrFail()`; el validador no declara `author` ni `authorId`, así que se ignoran | [Comentar una tarea](../../../openspec/specs/comments/spec.md#requirement-comentar-una-tarea) |
| Comentar no cambia la tarea | [`CommentService.create`](../../../backend/app/services/comment_service.ts) bloquea la fila de la tarea pero no la guarda | [Comentar una tarea](../../../openspec/specs/comments/spec.md#requirement-comentar-una-tarea) |
| Vacío, solo espacios, más de 500 | `createCommentValidator` · [`validators/comment.ts`](../../../backend/app/validators/comment.ts): `trim()` antes de `minLength(1)` y `maxLength(500)`. Respaldo en la base: `varchar(500)` y `CHECK (btrim(body) <> '')` | [Ningún comentario vacío ni excesivo](../../../openspec/specs/comments/spec.md#requirement-ningún-comentario-vacío-ni-excesivo) |
| No repetir seguido | `CommentService.create`: compara con el último comentario de esa cuenta en esa tarea (por `created_at` y desempate por `id`) dentro de una transacción con `FOR UPDATE` sobre la tarea, para que dos envíos casi simultáneos no pasen los dos. Lanza un `E_VALIDATION_ERROR` de VineJS sobre `body` (regla `notRepeated`) | [Un mismo comentario no se repite seguido](../../../openspec/specs/comments/spec.md#requirement-un-mismo-comentario-no-se-repite-seguido) |
| Leer el hilo | `TaskCommentsController.index`: `Task.findOrFail` primero (tarea inexistente o en la papelera → `404`), después `Comment` por `taskId` con el autor precargado, ordenado por `created_at` ascendente y desempate por `id`. El autor sale recortado por `CommentTransformer` → `TaskAssigneeTransformer`, sin email. Sin filtros ni paginación | [Leer los comentarios de una tarea](../../../openspec/specs/comments/spec.md#requirement-leer-los-comentarios-de-una-tarea) |

## Datos de desarrollo

[`CommentFactory`](../../../backend/database/factories/comment_factory.ts) da textos ya recortados y
dentro del máximo, y crea autor y tarea con `UserFactory` y `TaskFactory` si no se le dan
(`.with('author')`, `.with('task')`). No sabe nada del «no repetir seguido»: quien cree varios de la
misma cuenta en la misma tarea tiene que dar textos distintos.

[`comment_seeder.ts`](../../../backend/database/seeders/comment_seeder.ts) (solo `development`,
idempotente) lanza antes el seeder principal, así que funciona con la base vacía, y da hilo de 1 a 4
comentarios a las 12 tareas más antiguas del equipo que todavía no tengan ninguno.

```bash
cd backend
node ace db:seed --files=database/seeders/comment_seeder.ts
```

## Cómo se prueba en local

```bash
make test                                       # desde la raíz: db-up + migrate + toda la suite
cd backend && node ace test --files=comments/read_comments   # un fichero: --files=comments/<fichero>
```

Los tests están en [`backend/tests/functional/comments/`](../../../backend/tests/functional/comments/):
25 tests, uno o más por scenario de los cuatro requisitos: 17 de escritura (`create_comment.spec.ts`,
`comment_body.spec.ts`, `repeated_comment.spec.ts`) y 8 de lectura (`read_comments.spec.ts`).
`--files=comment` no sirve para filtrarlos: hay que nombrar el fichero con su carpeta. Pegan contra `db-test` y aíslan con
`testUtils.db().withGlobalTransaction()`.

A mano, con el servidor levantado (`node ace serve --hmr`) y un `$TOKEN` sacado como en el
[README de `tasks`](../tasks/README.md#a-mano-contra-el-servidor-real):

```bash
# Leer el hilo — 200, del más antiguo al más reciente ({"data": []} si no tiene)
curl -s http://localhost:3333/api/v1/tasks/1/comments -H "Authorization: Bearer $TOKEN"

# Comentar — 201, con el texto recortado
curl -s -X POST http://localhost:3333/api/v1/tasks/1/comments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"body":"  Falta el informe del trimestre  "}'

# El mismo texto otra vez — 422 sobre body
curl -s -X POST http://localhost:3333/api/v1/tasks/1/comments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"body":"Falta el informe del trimestre"}'
```

Ojo: esto **escribe en la base de datos de desarrollo**.

### Antes de dar algo por terminado

```bash
cd backend && npm run lint && npm run typecheck && node ace test
```
