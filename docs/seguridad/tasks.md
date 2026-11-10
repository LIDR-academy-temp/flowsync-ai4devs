- **Fecha:** 2026-11-10 (UTC)
- **Commit:** 500cc31
- **Generado por:** skill `auditoria-seguridad`, subagente `security-auditor`. Sin revisar ni arreglar.

# Auditoría de seguridad — tasks

**Alcance:** las ocho rutas de `tasks` y las dos de comentarios (`GET/POST /api/v1/tasks/:id/comments`), con sus controladores, validadores, modelos `Task` y `TrashedTask`, transformers, la migración del CHECK de estado, el manejador de excepciones, el logger, CORS, el kernel, la instrumentación OTel y el collector. No he ejecutado nada contra un sistema levantado.

## Crítico
Ninguno. Regla (a) comprobada en `backend/start/routes.ts:56-72`: las diez rutas de tareas, papelera y comentarios están dentro del grupo `tasks`, que lleva `.use(middleware.auth())`. `trash` va declarada antes que `:id`.

## Alto
Ninguno.

## Medio

### Un `:id` que no es un número llega a PostgreSQL y probablemente sale como 500
- **Evidencia:** `backend/start/routes.ts:62-68` (`:id` sin `.where('id', router.matchers.number())`), `backend/app/controllers/tasks_controller.ts:131` y `:216`, `task_statuses_controller.ts:54`, `task_due_dates_controller.ts:56`, `task_trash_controller.ts:75`, `task_comments_controller.ts:64` y `:114`.
- **Categoría:** A10 Mishandling of Exceptional Conditions.
- **Por qué es explotable aquí:** cualquier cuenta con token puede hacer `GET /api/v1/tasks/abc?today=2026-01-01`, o lo mismo con `PATCH .../abc/status`, `DELETE`, `restore` y comentarios. `params.id` llega como texto a `findOrFail`, que lo pasa a una columna entera. Lo esperable es `invalid input syntax for type integer` y un 500, no el 404 que prometen la spec y los `@ApiResponse`.
  - El 500 sale por `report()` al log, con el error de la base de datos.
  - `handler.ts:9` pone `debug = !app.inProduction`, así que fuera de producción la respuesta lleva el stack trace.
  - Es una ruta de ruido y de fuga de información interna. Es un comportamiento esperado del driver que no he ejecutado.
- **Propuesta de arreglo:** añadir el matcher numérico a `:id` en `routes.ts` (el grupo entero), para que un id no numérico sea un 404 del router antes de tocar la base.

### El filtro `status` acepta cualquier cadena y devuelve una lista vacía
- **Evidencia:** `backend/app/validators/task.ts:29-31` (`vine.string().optional()`, no `vine.enum`) y `backend/app/controllers/tasks_controller.ts:75-76`. El README lo reconoce en `docs/capabilities/tasks/README.md:114`.
- **Categoría:** Regla de negocio (b/c) y A05, aunque no se llega a inyectar nada.
- **Por qué es explotable aquí:** quien pasa `?status=archivado` recibe un `200` con lista vacía en vez de un `422`, como exige el requisito «Un estado que no existe se rechaza». El valor va por parámetro de `.where('status', status)`, así que no hay inyección SQL (regla c cumplida). Lo que falla es el contrato: el comentario del controlador (`:38-44`) y del validador (`:21-27`) afirman lo contrario, y eso es un riesgo de integridad de la información.
- **Propuesta de arreglo:** cambiar el validador a `vine.enum(TASK_STATUSES).optional()` y corregir los comentarios y el `@ApiQuery`.

### El collector publica OTLP en todas las interfaces, sin autenticación, y vuelca las trazas enteras a su log
- **Evidencia:** `compose.yaml:58-60` (`'14317:4317'` y `'14318:4318'` sin `127.0.0.1`, a diferencia de `:71` y del puerto de `db`) y `otel-collector.yaml:8,10,13-14` (`0.0.0.0` y exportador `debug` con `verbosity: detailed`).
- **Categoría:** A02 Security Misconfiguration.
- **Por qué es explotable aquí:** quien llegue por red al equipo de desarrollo (Wi-Fi compartida) puede enviar trazas falsas a Tempo. Esas trazas aparecen luego en el dashboard del SLO de `/api/v1/tasks`. Además, el exportador `debug` escribe en el log del contenedor todos los atributos de cada span, incluidas las URLs completas con query, y ese log no tiene ninguna política escrita.
- **Propuesta de arreglo:** publicar los puertos solo en `127.0.0.1` y bajar `debug` a `normal`, o quitarlo del pipeline.

### No hay ninguna decisión escrita sobre qué datos de usuario salen en registros y trazas
- **Evidencia:** `backend/config/logger.ts:28-38` (sin `redact`), `backend/config/otel.ts:4-8` (sin `instrumentations` ni filtros), `backend/.env.example:8,38-39`, `otel-collector.yaml`. La búsqueda de `otel|log` en `docs/seguridad/analisis-de-amenazas-2026-09-25.md` solo dio coincidencias sobre el registro de bloqueos de commits y el hook, y ninguna sobre qué datos de usuario salen en registros o trazas. No leí el documento entero ni `docs/slo/api.md` ni `docs/architecture.md`.
- **Categoría:** A09 Security Logging and Alerting Failures.
- **Por qué es explotable aquí:** `@adonisjs/otel/otel_middleware` (`start/kernel.ts:36`) traza todas las rutas de tareas con la configuración por defecto. Qué captura esa configuración (URL con `?today=`, cabeceras, atributos de la base de datos) no está decidido ni escrito. El día que se cambie `OTEL_EXPORTER_OTLP_ENDPOINT` a un destino externo, saldrán de la máquina datos que nadie ha revisado. Los títulos de tarea y el texto de los comentarios son contenido libre del usuario y pasan por la base de datos.
- **Propuesta de arreglo:** escribir en `docs/seguridad/` qué se permite (por ejemplo: sin cuerpos, sin `Authorization`, sin parámetros de URL más allá de la ruta) y reflejarlo en `config/otel.ts` y en `logger.ts` con `redact`.

## Lo que sale de la máquina
| Dato | ¿Sale en registros? | ¿Sale en trazas? | ¿Decidido y escrito? (dónde) |
|---|---|---|---|
| Cuerpo de petición (`title`, `body` de comentario) | No lo veo escrito en los controladores de tasks. Sí podría salir en el error 500 de arriba. | No comprobado: depende de lo que instrumente por defecto `@adonisjs/otel` | No |
| `Authorization` / token | Ninguna llamada a `logger.*` ni `console.*` en los archivos de tasks. Faltan `redact` y la política. | No comprobado | No |
| Email | No sale en las respuestas de tasks: `TaskAssigneeTransformer` solo devuelve `id`, `fullName` e `initials` (`task_assignee_transformer.ts:15`) | No comprobado | Sí, por diseño del transformer (`:4-11`) y de la spec |
| Parámetros de URL (`status`, `today`, `:id`) | Probable en los registros de peticiones del framework, no comprobado | Probable en `url.full`, y el collector los vuelca con `debug` detallado (`otel-collector.yaml:13-14`) | No |
| Errores con stack | Sí, vía `report()` (`handler.ts:25`) | Probable como excepción en el span | No |

## Lo que no se pudo comprobar
- **Qué atributos captura `@adonisjs/otel` por defecto** (cabeceras, cuerpo, `db.statement`): hace falta leer `node_modules/@adonisjs/otel` o ver una traza real en Grafana. Tampoco he mirado si algo en el repo configura `OTEL_*` más allá del endpoint.
- **El 500 con `:id` no numérico:** es lo esperable de pg con `findOrFail`, pero no lo he ejecutado. Hace falta levantar la API y lanzar la petición.
- **Cómo se despliega en producción** (proxy, TLS, `NODE_ENV=production` real, valor de `CORS_ORIGIN`, qué puertos quedan expuestos). En `cors.ts:21` producción queda con lista vacía, pero con `credentials: true` y `headers: true`.
- **Si `compose.yaml` se usa fuera de desarrollo:** el collector sale por `0.0.0.0` en el host.
- **Sin límite de peticiones** en `POST /tasks` ni en comentarios. No he buscado un `throttle`, y sin despliegue no sé si lo pone un proxy.
- **Frontend** (`task-page.tsx` y compañía): fuera del alcance pedido.

## Archivos abiertos
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/start/routes.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/openspec/specs/tasks/spec.md`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/docs/capabilities/tasks/README.md`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/controllers/tasks_controller.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/controllers/task_statuses_controller.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/controllers/task_trash_controller.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/controllers/task_due_dates_controller.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/controllers/task_comments_controller.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/validators/task.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/validators/comment.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/models/task.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/models/trashed_task.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/services/comment_service.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/transformers/task_assignee_transformer.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/app/exceptions/handler.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/start/kernel.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/otel.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/config/otel.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/config/logger.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/config/cors.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/config/openapi.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/.env.example`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/backend/database/migrations/1790981112497_add_status_check_to_tasks_table.ts`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/otel-collector.yaml`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/compose.yaml`
- `/home/rpa-latam/Escritorio/personnel/projects/lidr/flowsync-ai4devs-temp/docs/seguridad/analisis-de-amenazas-2026-09-25.md`
