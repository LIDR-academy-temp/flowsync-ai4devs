# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

> La plantilla que trae `s11/start` es la del módulo 10 (filas que cambian, rama de reversibilidad).
> Los tres apartados de abajo son los que pide el ejercicio de la s11.

## 1. Cuántos casos nuevos fallaron y cuántos de los que había siguieron en verde

Con la cifra que dio la pantalla.

- De mis 13 casos nuevos fallaron 4 y pasaron 9, y los 40 que ya había siguieron en verde: de los 7 funcionales, uno por Scenario, fallaron 2 (`make test-e2e`: `Tests  45 passed, 2 failed (47)`); de los 6 unitarios fallaron 2 (`make test-unit`: `Tests  4 passed, 2 failed (6)`, la misma orden que antes de empezar respondía `NO TESTS EXECUTED` y salía con 0); y la suite entera quedó en `Tests  49 passed, 4 failed (53)` con `make test`.

## 2. Cuál de tus casos nuevos pasó, y por qué crees que pasó

Se deduce mirando qué tienen en común los que fallaron.

- Los dos funcionales que fallaron («Fecha del día anterior» y «Darla por hecha la deja de vencer») tienen en común que esperan `isOverdue: true` de una tarea leída de la base con `GET`, y ahí `pg` entrega `due_date` como `Date` mientras `isOverdueOn` lo compara con el día en texto, una comparación que da siempre `false` (el `Date` pasa a milisegundos y el texto a `NaN`); por eso «Vencer hoy», «Fecha futura» y «Una tarea hecha con la fecha pasada» pasaron sin probar nada, porque esperan `false` por un `GET` y los satisface una respuesta constante, y el último esconde además un segundo defecto que solo la unitaria pone en rojo (la regla no mira el estado `done`); «Aplazar resuelve el vencimiento» sí espera `true` y pasa porque lo lee en la respuesta del `PUT`, donde la fecha todavía es el texto recién recibido, y «Sin fecha no se vence nunca» pasa con razón, porque con `null` la regla sale antes de comparar.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- No comprobé qué día sale en un servidor con un huso distinto de UTC, porque `pg` construye el `Date` a medianoche local y WSL corre en UTC, así que no sé si con un huso positivo la fecha leída cae un día antes; dudé de si la unitaria debe importar `pg-types`, que llega como dependencia de `pg` pero no está en `package.json`, a cambio de construir el `Date` igual que el conector y no con un `new Date(2026, 7, 19)` escrito a mano; y mi rojo no es una predicción limpia, porque hice el ejercicio tarde, después del directo y del módulo 10, donde ya había visto que leer de PostgreSQL rompía `isOverdue`: por eso los prompts no nombran la causa y el diagnóstico es del agente, pero el criterio del caso «como lo entrega el conector» ya venía informado.
