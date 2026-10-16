# Prompts
---

## Prompt 1

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Antes de escribir nada, necesito que reconozcas el terreno. En este paso NO crees, edites ni borres ningún archivo, ni hagas commits.

1. Lee entero el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md, con todos sus Scenarios. Cópiame cada Scenario tal cual (GIVEN/WHEN/THEN o el formato que use).
2. Dime cómo se le pasa a la petición el día de referencia según la spec o el código: nombre del parámetro, si va en query, header o body, y en qué formato.
3. Localiza qué endpoint(s) devuelven el campo isOverdue en el cuerpo de la respuesta y en qué forma (objeto suelto, lista, envoltorio data, etc.).
4. Abre los tests existentes de backend/tests/functional/ y descríbeme exactamente cómo aíslan la base de datos entre tests (transacciones globales, truncado, hooks de grupo…), cómo crean datos y cómo hacen las peticiones HTTP. Cita archivo y líneas.
5. Dime el comando y la configuración de make test-e2e y si existe ya una suite "unit" en la configuración del runner (p. ej. bin/test.ts o adonisrc). Si no existe, dime qué haría falta, pero NO lo cambies todavía.
6. Lee isOverdueOn en backend/app/models/task.ts y dime su firma (qué tipos acepta para la fecha de la tarea y para el día de referencia). No me digas si está bien o mal: solo describe.

Termina con una lista de dudas o ambigüedades que veas entre la spec y el código.
```

**Qué salió:**
⏺ Todo lo de abajo lo he sacado leyendo los ficheros; no he ejecutado nada. No he creado, editado ni borrado ningún archivo. Un grep que incluía la palabra «truncate» lo bloqueó el hook sin-borrar-datos.sh. Era un falso positivo, porque solo buscaba texto, pero no he reescrito la orden para esquivarlo:  
leí los tests con la herramienta de lectura. El MCP dbhub no conectó (timeout), aunque para esto no hizo falta.

1. Scenarios del Requirement «Cuándo una tarea está vencida» (openspec/specs/tasks/spec.md:390-427)

Usa el formato WHEN/THEN, sin GIVEN:

▎ Scenario: Fecha del día anterior                                                                                                                                                                                                                                                                             
▎ - WHEN se consulta una tarea no hecha cuya fecha de vencimiento es el día anterior al de referencia                                                                                                                                                                                                          
▎ - THEN la tarea llega marcada como vencida                                                                                                                                                                                                                                                                   
▎                                                                                                                                                                                                                                                                                                              
▎ Scenario: Vencer hoy todavía no es estar vencida                                                                                                                                                                                                                                                             
▎ - WHEN se consulta una tarea no hecha cuya fecha de vencimiento es exactamente el día de referencia                                                                                                                                                                                                          
▎ - THEN la tarea NO llega marcada como vencida, porque la regla exige que la fecha sea anterior                                                                                                                                                                                                               
▎                                                                                                                                                                                                                                                                                                              
▎ Scenario: Fecha futura                                                                                                                                                                                                                                                                                       
▎ - WHEN se consulta una tarea cuya fecha de vencimiento es posterior al día de referencia                                                                                                                                                                                                                     
▎ - THEN la tarea no llega marcada como vencida

## Prompt 2

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Ahora escribe los tests funcionales del Requirement «Cuándo una tarea está vencida».

Qué quiero:
- Un archivo nuevo en backend/tests/functional/ con UN test por Scenario de la spec, en el mismo orden y con el título del Scenario en el nombre del test.
- Cada test entra por HTTP, como lo haría un cliente de la API, y comprueba el campo isOverdue en el cuerpo de la respuesta. Nada de llamar al modelo ni a métodos internos para la aserción.
- Usa la misma forma de aislamiento, creación de datos y cliente HTTP que los tests existentes de backend/tests/functional/. No inventes otra.
- No des por hecho ningún identificador: usa el id que devuelva la petición de creación.
- El día de referencia se le pasa a la petición explícitamente, con una fecha fija escrita en el test. Prohibido usar la fecha actual: nada de new Date() sin argumentos, Date.now(), DateTime.now(), DateTime.local() ni equivalentes, ni para el día de referencia ni para construir fechas relativas.

Restricciones duras:
- Solo puedes crear o modificar archivos dentro de backend/tests/. No toques modelos, transformers, controladores, validadores, migraciones ni configuración fuera de esa carpeta.
- Si un test falla, NO intentes arreglarlo cambiando la implementación ni relajando la aserción. Que falle es el resultado esperado: el requisito no está implementado del todo.
- Si para que el test compile o arranque crees que hace falta tocar algo fuera de backend/tests/, para y dímelo en vez de hacerlo.

Cuando termines:
1. Ejecuta make test-e2e y guarda la salida COMPLETA (stdout y stderr) en backend/tests/output-e2e.txt.
2. Enséñame la cifra del resumen final (tests pasados/fallidos totales) y separa: cuántos de MIS tests nuevos fallaron, cuántos de mis nuevos pasaron (y cuáles), y cuántos de los tests que ya existían siguen en verde.
3. Ejecuta git diff --stat y git status y enséñamelos, para comprobar que no hay nada fuera de backend/tests/.
4. Busca en los archivos que has creado cualquier llamada al reloj y enséñame el resultado de la búsqueda, aunque sea vacío.
```

**Qué salió:**
⏺ He creado los siete tests. Como esperabas, 3 de los 7 fallan, pero no por el motivo que yo había apuntado en el reconocimiento. Además, los 4 que pasan valen poco como red, porque la API no ha devuelto `isOverdue: true` en ningún caso.

He creado dos ficheros nuevos: `backend/tests/functional/tasks/overdue.spec.ts` (siete tests, uno por Scenario, en el orden de la spec) y `backend/tests/output-e2e.txt` (la salida completa de stdout y stderr). No he hecho commit. La tarea siempre se crea con `POST /api/v1/tasks` y uso el id que devuelve. La fecha la pongo con `PUT /:id/due-date`, el estado con `PATCH /:id/status`, y `isOverdue` lo leo de `GET /:id?today=2026-08-20`. En «Aplazar» lo leo de la propia respuesta del `PUT`. El aislamiento, el login y las cabeceras son los mismos que en `trash.spec.ts`.

En «Sin fecha no se vence nunca» toco el modelo una vez, solo para preparar los datos. La API no deja fijar la fecha de creación, así que retraso `createdAt` a mano a `2026-07-09`, una fecha fija. La comprobación sigue saliendo de la respuesta HTTP.

1. Resumen de `make test-e2e`

```
Tests  44 passed, 3 failed (47)
make: *** [test-e2e] Error 1
```

2. Desglose

**Mis tests nuevos que fallan (3):**
- «Fecha del día anterior»
- «Darla por hecha la deja de vencer»
- «Aplazar resuelve el vencimiento»

Los tres fallan por lo mismo: una tarea pendiente con fecha `2026-08-19`, consultada con `today=2026-08-20`, llega con `isOverdue: false` cuando el test espera `true`. En los dos últimos falla la comprobación previa que dice «está vencida», así que el test no llega a la parte del `done` ni a la del aplazamiento.

**Mis tests nuevos que pasan (4):** «Vencer hoy todavía no es estar vencida», «Fecha futura», «Sin fecha no se vence nunca» y «Una tarea hecha con la fecha pasada».

Los cuatro esperan `false`. Si la API nunca devuelve `true`, pasan sin demostrar nada. En particular, «Una tarea hecha con la fecha pasada» no prueba que se compruebe el estado `done`.

**Los tests que ya existían (40):** siguen todos en verde.

Mi hipótesis sobre la causa, sin comprobar: al leer la tarea de Postgres, `dueDate` llega como un `Date` y no como texto, y entonces `Date < '2026-08-20'` siempre da `false`. Es la segunda duda que te apunté en el reconocimiento. No he tocado nada fuera de `backend/tests/`.

3. `git diff --stat` y `git status`

```
 backend/.adonisjs/client/registry/index.ts    |  18 +++++
 backend/.adonisjs/client/registry/schema.d.ts |  36 +++++++++
 backend/.adonisjs/client/registry/tree.d.ts   |   5 ++
 backend/.adonisjs/server/routes.d.ts          |   9 +++
 backend/.env.example                          |   2 +-
 backend/package-lock.json                     |  30 --------
 frontend/package-lock.json                    |  66 ----------------
 prompts.md                                    | 107 +++++++++++++++++++++-----
 8 files changed, 156 insertions(+), 117 deletions(-)

On branch tests-gc
Changes not staged for commit:
	modified:   backend/.adonisjs/client/registry/index.ts
	modified:   backend/.adonisjs/client/registry/schema.d.ts
	modified:   backend/.adonisjs/client/registry/tree.d.ts
	modified:   backend/.adonisjs/server/routes.d.ts
	modified:   backend/.env.example
	modified:   backend/package-lock.json
	modified:   frontend/package-lock.json
	modified:   prompts.md
Untracked files:
	backend/tests/functional/tasks/overdue.spec.ts
	backend/tests/output-e2e.txt
```

Hay ficheros modificados fuera de `backend/tests/`, pero no los he editado yo:
- `.adonisjs/*`, `.env.example` y los dos `package-lock.json` ya estaban modificados en el `git status` del principio de la sesión. Los `.adonisjs/*` los regenera Adonis cada vez que arranca, incluido el arranque de los tests, así que esta ejecución puede haberlos reescrito. No he comprobado si el contenido ha cambiado.
- `prompts.md` lo tienes abierto en el IDE y es tuyo.

4. Búsqueda de llamadas al reloj en `overdue.spec.ts`

```
$ grep -nE "new Date\(\s*\)|Date\.now|DateTime\.(now|local|utc)\(|performance\.now|process\.hrtime|Temporal\.Now" backend/tests/functional/tasks/overdue.spec.ts
grep exit=1   (sin coincidencias)
```

La única construcción de fecha del fichero es `DateTime.fromISO('2026-07-09T09:00:00', { zone: 'utc' })`, con un valor fijo.

## Prompt 3

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Ahora baja la regla a tests unitarios.

- Crea backend/tests/unit/ y un archivo de tests para isOverdueOn de backend/app/models/task.ts.
- Sin servidor HTTP y sin base de datos: instancia la tarea en memoria (o llama a la función como corresponda según su firma) y comprueba el resultado de isOverdueOn directamente. Si instanciar el modelo exige conexión a base de datos, dímelo antes de buscar un rodeo.
- Si el runner no tiene una suite "unit" registrada, el único cambio permitido para registrarla es el mínimo imprescindible; antes de hacerlo, enséñame qué archivo tocarías y por qué, y espera mi confirmación si ese archivo está fuera de backend/tests/.

Casos, uno por test, todos con un día de referencia fijo escrito en el test:
1. Fecha anterior al día de referencia y tarea sin hacer.
2. Fecha exactamente igual al día de referencia.
3. Fecha posterior al día de referencia.
4. Sin fecha.
5. Tarea ya hecha y con la fecha pasada.
6. Caso extra: la regla da el mismo resultado si la fecha llega como texto (el formato en que llega de verdad por la API o desde la base de datos, compruébalo en el código) que si llega como objeto de fecha. Escríbelo para al menos una fecha pasada y para la fecha igual al día de referencia.

Para los casos 1-5, el resultado esperado sale de la spec (openspec/specs/tasks/spec.md), no de lo que haga hoy el código. Indica en un comentario de cada test qué Scenario o regla de la spec lo justifica. El caso 6 no sale de la spec: márcalo con un comentario que lo diga.

Las mismas restricciones que antes: no toques implementación, no relajes aserciones para que pasen, nada de reloj.

Al terminar:
1. Ejecuta los tests unitarios y guarda la salida completa en backend/tests/output-unit.txt.
2. Dime qué casos fallan, cuáles pasan, y para cada uno que falle, el valor esperado frente al obtenido.
3. Enséñame git diff --stat y git status.
```

**Qué salió:**
⏺ Hay 7 tests unitarios: **5 pasan y 2 fallan**. Los dos fallos señalan dos defectos distintos en `isOverdueOn`. El caso 6 respalda además la hipótesis que te di para los fallos funcionales.

La instancia se crea con `new Task()` sin tocar la base, así que no ha hecho falta ningún rodeo. La suite `unit` ya estaba registrada en `backend/adonisrc.ts:84-88`, de modo que no he tocado nada fuera de `backend/tests/`.

He creado `backend/tests/unit/task_is_overdue_on.spec.ts`. El día de referencia fijo es `2026-08-20`. Cada test de los casos 1 a 5 lleva un comentario con el Scenario de la spec que lo justifica, y los dos del caso 6 dicen que no salen de la spec.

Formato real de la fecha (caso 6)

- **Por la API:** texto `yyyy-MM-dd`, que sale de `toCalendarDay` (`app/validators/task.ts:59`).
- **Desde la base:** un `Date` de JS a medianoche local. `pg-types` convierte así la columna `date` (`node_modules/pg-types/lib/textParsers.js:174`) y `config/database.ts` no lo cambia. En el test lo simulo con `new Date('2026-08-19T00:00:00')`, que lleva argumento fijo y no consulta el reloj.

1. Ejecución

He usado `cd backend && node ace test unit` y he guardado la salida completa en `backend/tests/output-unit.txt`. No he usado `make test-unit` porque antes migra las bases, y estos tests no necesitan base de datos.

```
Tests  5 passed, 2 failed (7)
```

2. Resultado por caso

| Caso | Resultado | Esperado | Obtenido |
|---|---|---|---|
| 1. Fecha anterior, sin hacer | ✔ pasa | `true` | `true` |
| 2. Fecha igual al día de referencia | ✔ pasa | `false` | `false` |
| 3. Fecha posterior | ✔ pasa | `false` | `false` |
| 4. Sin fecha | ✔ pasa | `false` | `false` |
| 5. Hecha, con la fecha pasada | ✖ falla | `false` | `true` |
| 6. Fecha pasada, texto frente a `Date` | ✖ falla | `true` (lo mismo que como texto) | `false` con `Date` |
| 6. Fecha igual al día de referencia, texto frente a `Date` | ✔ pasa | `false` | `false` en los dos |

- **Caso 5:** `isOverdueOn` no mira el estado, como ya se veía en la firma.
- **Caso 6:** con la fecha como texto, la regla funciona. Con un `Date`, una fecha pasada da `false`, que es lo mismo que han dado los tres tests funcionales fallidos. Respalda la hipótesis de que, al leer de la base, `dueDate` llega como `Date`. No lo he comprobado en ejecución sobre la base real.
- **Caso 6 con fecha igual:** pasa, pero no demuestra nada, porque con un `Date` la comparación da `false` siempre.

3. `git diff --stat` y `git status`

```
 backend/.adonisjs/client/registry/index.ts    |  18 +++
 backend/.adonisjs/client/registry/schema.d.ts |  36 +++++
 backend/.adonisjs/client/registry/tree.d.ts   |   5 +
 backend/.adonisjs/server/routes.d.ts          |   9 ++
 backend/.env.example                          |   2 +-
 backend/package-lock.json                     |  30 ----
 frontend/package-lock.json                    |  66 ---------
 prompts.md                                    | 194 +++++++++++++++++++++++---
 8 files changed, 243 insertions(+), 117 deletions(-)

On branch tests-gc
Changes not staged for commit:
	modified:   backend/.adonisjs/client/registry/index.ts
	modified:   backend/.adonisjs/client/registry/schema.d.ts
	modified:   backend/.adonisjs/client/registry/tree.d.ts
	modified:   backend/.adonisjs/server/routes.d.ts
	modified:   backend/.env.example
	modified:   backend/package-lock.json
	modified:   frontend/package-lock.json
	modified:   prompts.md
Untracked files:
	backend/tests/functional/tasks/overdue.spec.ts
	backend/tests/output-e2e.txt
	backend/tests/output-unit.txt
	backend/tests/unit/
```

De los ficheros modificados fuera de `backend/tests/`, ninguno lo ha cambiado esta petición:
- `.adonisjs/*`, `.env.example` y los dos `package-lock.json` ya estaban modificados al empezar la sesión.
- En `prompts.md` solo he añadido el texto del Prompt 2 que me pediste antes.

No he hecho commit.

## Prompt 4

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
No escribas HALLAZGOS.md: lo escribo yo. Necesito que me prepares los datos.

1. Con las salidas guardadas en backend/tests/output-e2e.txt y backend/tests/output-unit.txt, hazme una tabla con cada test nuevo (funcional y unitario), si pasó o falló, y para cada fallo el valor esperado frente al obtenido.
2. Dame la cifra exacta del resumen de make test-e2e, copiada de la salida, y cuántos de los tests preexistentes siguen en verde.
3. Para los tests nuevos que PASARON, enumera qué condiciones tienen (tipo de fecha, si está hecha, relación con el día de referencia) frente a las de los que fallaron. No me des la conclusión: solo pon las condiciones en columnas para que pueda compararlas.
4. Lista lo que no hayas podido comprobar o en lo que tuviste que suponer algo (formato de fecha, zona horaria, cómo se pasa el día de referencia, etc.).
5. Dime en qué rama estás y enséñame git log --oneline -10 y git diff --stat contra s11/start.
```

**Qué salió:**
⏺ Ni `backend/tests/output-e2e.txt` ni `backend/tests/output-unit.txt` dicen en qué forma recibe `isOverdueOn` la fecha en los tests funcionales. Por eso, en la tabla de condiciones, esa columna sale del código y no de lo observado. No he escrito `HALLAZGOS.md`.

1. Tests nuevos: resultado, esperado y obtenido

| # | Suite | Test | Resultado | Esperado | Obtenido | Dónde falla |
|---|---|---|---|---|---|---|
| F1 | functional | Fecha del día anterior | ✖ falla | `true` | `false` | `overdue.spec.ts:91` |
| F2 | functional | Vencer hoy todavía no es estar vencida | ✔ pasa | — | — | — |
| F3 | functional | Fecha futura | ✔ pasa | — | — | — |
| F4 | functional | Sin fecha no se vence nunca | ✔ pasa | — | — | — |
| F5 | functional | Darla por hecha la deja de vencer | ✖ falla | `true` | `false` | `overdue.spec.ts:136`: la comprobación previa «está vencida» antes del `done` |
| F6 | functional | Una tarea hecha con la fecha pasada | ✔ pasa | — | — | — |
| F7 | functional | Aplazar resuelve el vencimiento | ✖ falla | `true` | `false` | `overdue.spec.ts:161`: la comprobación previa «está vencida» antes de aplazar |
| U1 | unit | 1. Fecha anterior al día de referencia y tarea sin hacer | ✔ pasa | — | — | — |
| U2 | unit | 2. Fecha exactamente igual al día de referencia | ✔ pasa | — | — | — |
| U3 | unit | 3. Fecha posterior al día de referencia | ✔ pasa | — | — | — |
| U4 | unit | 4. Sin fecha | ✔ pasa | — | — | — |
| U5 | unit | 5. Tarea ya hecha y con la fecha pasada | ✖ falla | `false` | `true` | `task_is_overdue_on.spec.ts:63` |
| U6a | unit | 6. Fecha pasada: mismo resultado como texto que como objeto de fecha | ✖ falla | `true` (el resultado con texto) | `false` (con `Date`) | `task_is_overdue_on.spec.ts:77` |
| U6b | unit | 6. Fecha igual al día de referencia: mismo resultado como texto que como objeto de fecha | ✔ pasa | — | — | — |

En F5 y F7 el test se detiene en la comprobación previa. La parte que da nombre al Scenario (pasar a `done` y aplazar) no llegó a ejecutarse.

2. Resumen de `make test-e2e`

Copiado de la salida (líneas 152-153 de `output-e2e.txt`):

```
Tests  44 passed, 3 failed (47)
 Time  4s
```

Los 47 tests son 7 nuevos y 40 que ya existían. De los nuevos pasan 4, así que los otros 40 que pasan son los que ya existían: siguen los 40 en verde. Para la suite unitaria (líneas 80-81 de `output-unit.txt`):

```
Tests  5 passed, 2 failed (7)
 Time  4ms
```

3. Condiciones de cada test

«Forma de la fecha» es lo que recibe `isOverdueOn` en la comprobación que decide el test. Las marcadas con † están deducidas del código y no observadas.

| # | Resultado | Forma de la fecha | Estado | Fecha frente al día de referencia (`2026-08-20`) | Valor esperado |
|---|---|---|---|---|---|
| F1 | ✖ | `Date` † (leída de la base en `GET`) | `pending` | anterior (`08-19`) | `true` |
| F5 | ✖ | `Date` † (leída de la base en `GET`) | `pending` | anterior (`08-19`) | `true` |
| F7 | ✖ | `Date` † (leída de la base en `GET`) | `pending` | anterior (`08-19`) | `true` |
| U5 | ✖ | texto | `done` | anterior (`08-19`) | `false` |
| U6a | ✖ | `Date` (construido en el test) | `pending` | anterior (`08-19`) | `true` |
| F2 | ✔ | `Date` † | `pending` | igual (`08-20`) | `false` |
| F3 | ✔ | `Date` † | `pending` | posterior (`08-21`) | `false` |
| F4 | ✔ | `null` | `pending` | sin fecha | `false` |
| F6 | ✔ | `Date` † | `done` | anterior (`08-19`) | `false` |
| U1 | ✔ | texto | `pending` | anterior (`08-19`) | `true` |
| U2 | ✔ | texto | `pending` | igual (`08-20`) | `false` |
| U3 | ✔ | texto | `pending` | posterior (`08-21`) | `false` |
| U4 | ✔ | `null` | `pending` | sin fecha | `false` |
| U6b | ✔ | texto y `Date` | `pending` | igual (`08-20`) | `false` |

4. Lo que no he comprobado o he supuesto

1. **Que `dueDate` llegue como `Date` al leer de la base.** Lo deduzco de que `pg-types` registra el tipo 1082 con `parseDate` (`textParsers.js:174`) y de que `config/database.ts` no lo cambia. No he observado el valor en ejecución, ni en el modelo ni en el JSON de la respuesta.
2. **Zona horaria.** En U6 emulo lo que entrega el driver con `new Date('AAAA-MM-DDT00:00:00')`, es decir, a medianoche en la hora local del proceso. Supongo que `postgres-date` hace lo mismo, pero no he leído su código ni he mirado el `TZ` del proceso de tests ni el `timezone` de Postgres.
3. **Dónde va `today`.** En `GET` lo mando en query y en `PUT due-date` en el body, copiando a los tests existentes. La spec no dice dónde va, y el validador lee los dos sitios con `request.all()`.
4. **«Sin fecha… creada hace semanas»** (F4). Lo interpreto como semanas antes del día de referencia y retraso `createdAt` a `2026-07-09` a través del modelo. La spec no dice contra qué día se miden esas semanas.
5. **«Darla por hecha»** (F5). Como `PATCH /status` no devuelve `isOverdue`, lo compruebo con un `GET` posterior. Esa parte no llegó a ejecutarse.
6. **La parte de «Aplazar»** (F7) que mira la respuesta del `PUT`. Tampoco llegó a ejecutarse, así que no sé qué devuelve.
7. **Primer fallo por test.** Japa solo informa de la primera comprobación que falla en cada test, así que no sé qué habrían dado las siguientes.
8. **Base real.** El MCP `dbhub` no conectó y no he consultado el esquema ni los datos reales. Todo sale de `db-test` y del código.
9. **Comando de la suite unitaria.** La ejecuté con `node ace test unit`, no con `make test-unit`, para no migrar las bases.
10. **`.adonisjs/*`.** No he comprobado si las ejecuciones de tests han cambiado su contenido respecto al del principio de la sesión.

5. Rama, log y diff

Estoy en la rama **`tests-gc`**. `s11/start` apunta al mismo commit que `HEAD` (`81a542a`).

```
$ git log --oneline -10
81a542a docs(s11): spec de comentarios, servers en OpenAPI, README del ejercicio y los atajos test-unit y test-e2e
ea8f59d fix(db): make copia-produccion vuelve a cargar la copia cuando la base ya impone RF-8
df0e5c1 chore(openspec): archiva add-task-trash y la papelera entra en la spec viva
a1be98f feat(tasks): papelera de tareas (E2-10, RF-12 enmendado)
5f9f857 feat(db): CHECK en tasks.status con los tres estados de RF-8
05ed3ed feat(db): make copia-produccion carga la copia de producción seudonimizada
fc0f9c9 feat(db): skill revisar-migracion y hook sin-borrar-datos
6377f6d docs(db): convenciones de base de datos como fuente única para Claude Code y OpenSpec
b20534c feat(mcp): servidor DBHub de solo lectura para consultar el esquema real
c5ec5a1 feat(db): rol de solo lectura flowsync_ro para la base de desarrollo

$ git diff --stat s11/start
 backend/.adonisjs/client/registry/index.ts    |  18 ++
 backend/.adonisjs/client/registry/schema.d.ts |  36 ++++
 backend/.adonisjs/client/registry/tree.d.ts   |   5 +
 backend/.adonisjs/server/routes.d.ts          |   9 +
 backend/.env.example                          |   2 +-
 backend/package-lock.json                     |  30 ---
 frontend/package-lock.json                    |  66 -------
 prompts.md                                    | 263 ++++++++++++++++++++++++--
 8 files changed, 312 insertions(+), 117 deletions(-)
```

`git diff --stat` no incluye los ficheros sin seguimiento, así que no aparecen los que he creado: `backend/tests/functional/tasks/overdue.spec.ts`, `backend/tests/unit/task_is_overdue_on.spec.ts`, `backend/tests/output-e2e.txt` y `backend/tests/output-unit.txt`. Todavía no he hecho commit de nada.