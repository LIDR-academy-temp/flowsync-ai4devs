# Hallazgos: tests de «Cuándo una tarea está vencida»

Tests nuevos:

- Funcionales: `backend/tests/functional/tasks/overdue.spec.ts`, uno por Scenario del requisito de `openspec/specs/tasks/spec.md`. Salida en `backend/tests/output-e2e.txt`.
- Unitarios: `backend/tests/unit/task_is_overdue_on.spec.ts`, sobre `Task.isOverdueOn`. Salida en `backend/tests/output-unit.txt`.

El día de referencia es siempre `2026-08-20`, escrito en el test.

## 1. Cifras

`make test-e2e`, tal como salió en pantalla:

```
Tests  44 passed, 3 failed (47)
```

- **Nuevos funcionales: 7.** Fallaron 3 y pasaron 4.
- **Los que ya había: 40.** Siguieron los 40 en verde. Los 44 que pasan son esos 40 más 4 de los nuevos.

`node ace test unit`:

```
Tests  5 passed, 2 failed (7)
```

- **Nuevos unitarios: 7.** Fallaron 2 y pasaron 5. No había ninguno antes: `tests/unit/` no existía.

## 2. Cuáles pasaron y por qué

### Funcionales

| Test | Resultado | Esperado | Obtenido |
|---|---|---|---|
| Fecha del día anterior | falla | `true` | `false` |
| Vencer hoy todavía no es estar vencida | **pasa** | `false` | `false` |
| Fecha futura | **pasa** | `false` | `false` |
| Sin fecha no se vence nunca | **pasa** | `false` | `false` |
| Darla por hecha la deja de vencer | falla | `true` (antes del `done`) | `false` |
| Una tarea hecha con la fecha pasada | **pasa** | `false` | `false` |
| Aplazar resuelve el vencimiento | falla | `true` (antes de aplazar) | `false` |

**Lo que tienen en común los que fallaron:** los tres necesitan que la API diga `isOverdue: true` en algún momento, y la API no lo dijo ni una sola vez. Los cuatro que pasaron esperan `false`. La línea entre pasar y fallar no la marca el Scenario: la marca el valor esperado.

**Por qué creo que pasa:** `isOverdueOn` compara `this.dueDate < referenceDay` como si las dos fueran texto `AAAA-MM-DD`. Pero el valor que compara, cuando la tarea se lee de Postgres, no es texto:

- La columna `due_date` es de tipo `date`.
- El driver `pg` convierte ese tipo (OID 1082) en un `Date` de JS (`pg-types`, `textParsers.js:174`), y `config/database.ts` no lo cambia.
- El tipo `string` que declara el esquema generado (`schema_rules.ts`) solo existe para TypeScript; en ejecución no convierte nada.

JavaScript, al comparar `Date < string`, convierte los dos lados a número. El `Date` pasa a milisegundos y `'2026-08-20'` pasa a `NaN`, y cualquier comparación con `NaN` da `false`. Lo comprobé suelto en Node: `new Date('2026-08-19T00:00:00') < '2026-08-20'` da `false`, y `< '2099-01-01'` también. **Para una tarea leída de la base, `isOverdue` sale `false` siempre**, sea cual sea la fecha.

Por eso los cuatro que pasan no valen lo mismo:

- **«Sin fecha no se vence nunca»** pasa de verdad: `dueDate === null` devuelve `false` antes de llegar a comparar.
- **«Vencer hoy…» y «Fecha futura»** dan el valor correcto, pero por casualidad. Pasarían igual con un `<=` o con cualquier otra fecha.
- **«Una tarea hecha con la fecha pasada»** es el caso más revelador. Pasa aunque `isOverdueOn` **no mira el estado**: la spec exige «su estado no es `done`» y el código no lo comprueba. Un defecto tapa al otro. Como la comparación de fechas siempre da `false`, que falte la condición de `done` no se nota.

### Unitarios

Lo confirman: en memoria, con la fecha como texto, la comparación sí funciona, y aparece el segundo defecto.

| Caso | Resultado | Esperado | Obtenido |
|---|---|---|---|
| 1. Anterior, sin hacer | pasa | `true` | `true` |
| 2. Igual al día de referencia | pasa | `false` | `false` |
| 3. Posterior | pasa | `false` | `false` |
| 4. Sin fecha | pasa | `false` | `false` |
| 5. Hecha, con la fecha pasada | **falla** | `false` | `true` |
| 6a. Fecha pasada, texto frente a `Date` | **falla** | `true` (lo mismo que con texto) | `false` con `Date` |
| 6b. Fecha igual, texto frente a `Date` | pasa | `false` | `false` en los dos |

- El **caso 5** es el defecto del estado `done`, ya sin el otro defecto que lo tapaba.
- El **caso 6a** reproduce en pequeño lo que pasa con la API: la misma fecha pasada da `true` como texto y `false` como `Date`.
- El caso 6b pasa por la misma casualidad que «Vencer hoy».

**En resumen, son dos defectos que se tapan entre sí:**

1. `isOverdueOn` no comprueba que el estado no sea `done`.
2. Con la fecha leída de la base, la comparación siempre da `false`.

Con datos reales solo se ve el segundo. El primero solo aparece cuando la fecha llega como texto, en los tests unitarios o en la respuesta de un `PUT` antes de releer la tarea.

## 3. Dudas y lo que no pude comprobar

- **Que la fecha llegue como `Date` de la base no lo he visto en ejecución.** Lo deduzco del código de `pg-types` y de la configuración, y lo respalda el caso unitario 6a. No imprimí el valor de `dueDate` dentro del modelo ni miré cómo sale en el JSON.
- **Zona horaria.** En el test unitario emulo el `Date` del driver con medianoche local. No he comprobado el `TZ` del proceso ni el `timezone` de Postgres. Si la conversión ocurriera en otra zona, el `Date` sería otro instante, aunque la comparación con texto seguiría dando `NaN`.
- **Partes de Scenarios que no se ejecutaron.** En «Darla por hecha…» y «Aplazar…» el test se detiene en la comprobación previa («está vencida»). La transición a `done` y la respuesta del `PUT` con la fecha aplazada no se han llegado a probar. Japa solo informa del primer fallo de cada test.
- **Dónde va `today`.** La spec dice «parámetro» sin decir dónde. Lo mandé en query para `GET` y en body para `PUT due-date`, como los tests que ya había. El validador acepta las dos cosas porque lee `request.all()`.
- **«Creada hace semanas».** Lo interpreté como semanas antes del día de referencia y retrasé `createdAt` a `2026-07-09` a través del modelo, porque la API no deja fijarlo. Es la única vez que los tests tocan el modelo, y solo para preparar datos.
- **«Darla por hecha…».** `PATCH /status` no devuelve `isOverdue`, así que el Scenario solo se puede comprobar con un `GET` posterior. La spec no dice en qué respuesta debe «dejar de llegar marcada».
- **«Una fecha ya pasada se acepta»** (otro requisito) habla de «el día de hoy» y no del día de referencia. No lo he cubierto.
- **Base real.** El MCP `dbhub` no conectó. Todo sale de `db-test` y del código; no he mirado los datos de desarrollo.
- **Comando de los unitarios.** Los ejecuté con `node ace test unit` y no con `make test-unit`, para no pasar por la migración de las bases.
- **Ficheros generados.** En el árbol de trabajo hay cambios en `.adonisjs/*`, `.env.example` y los `package-lock.json` que ya estaban antes de empezar. No he comprobado si las ejecuciones de tests han tocado los de `.adonisjs/`.
