# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del
árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

- Mi cambio no modifica el esquema ni los datos: 0 filas, porque no hay migración; `git diff --stat s14/start -- backend/database` sale vacío y no hay cambios sin commitear ahí. El trabajo de esta rama es instrumentación OpenTelemetry y la definición del SLO, y las migraciones que existen en el repo son de otros autores.

## 2. Lo que la batería de pruebas no podía ver

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

- La suite no puede ver la instrumentación: corre con `NODE_ENV=test`, donde `@adonisjs/otel` se apaga por defecto (`OtelManager.isEnabled`), `bin/test.ts` no importa `otel.js` y en `tests/` no hay ninguna referencia a otel, span ni trace. Por eso los 70 tests pasarían igual aunque no se emitiera ningún span o faltaran `http.route`, el código de estado o la duración en que se basa el SLI.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- No pude comprobar qué atributos lleva el span de una petición que acaba en 5xx: no observé ninguna. El middleware escribe `http.response.status_code` después de `await next()`, así que con una excepción quizá solo quede `http.status_code`, y no sé cuál de los dos es fiable para contar los errores del SLI.
