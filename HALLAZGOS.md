# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Casos nuevos que fallaron y casos previos que siguieron en verde

De 15 casos nuevos fallaron 5, y los 40 casos que ya existían siguieron en verde. Cifras de la pantalla:

- `make test-e2e` (los 7 nuevos de `overdue.spec.ts` más los 40 previos): `Tests  44 passed, 3 failed (47)`. Los 3 rojos son nuevos: «fecha del día anterior», «darla por hecha» y «aplazar».
- `node ace test unit` (los 8 nuevos de `is_overdue_on.spec.ts`): `Tests  6 passed, 2 failed (8)`. Los 2 rojos son «hecha con la fecha pasada» y «Date con fecha anterior».

## 2. Qué caso nuevo pasó y por qué

Pasaron 10 de los 15, pero varios pasan por casualidad. Todos los rojos esperan `true` o dependen de una fecha pasada, y los verdes más sospechosos esperan `false`, que es lo que la regla devuelve casi siempre.

- **E2E, «hecha con la fecha pasada»:** pasa, pero no porque `isOverdueOn` mire `status`. Pasa porque por HTTP una fecha pasada nunca llega vencida: «fecha del día anterior» da `false` en vez de `true`.
- **Por qué:** deduzco, sin haberlo medido, que la fecha llega a `isOverdueOn` como `Date` y no como texto. `Date < string` convierte el texto a `NaN` y siempre da `false`. Encaja con el unit: «Date con fecha anterior» da `false` donde el texto da `true`.
- **Unit, igual y posterior con `Date`:** pasan por la misma razón, porque `false` coincide con lo esperado en esos dos bordes.
- **Unit, «hecha con la fecha pasada»:** falla con texto, porque la regla no mira `status`. Es un bug distinto del anterior y por HTTP queda tapado por el de `Date`.

## 3. Dudas y lo que no pude comprobar

- No medí qué tipo trae `dueDate` en la ruta HTTP; lo deduzco de que el unit con `Date` da la misma lectura errónea. Hay que confirmarlo con un `console.log(typeof this.dueDate)` o mirando `schema_rules.ts`.
- No sé si el caso `Date` es realista en producción. Por HTTP parece que sí, y el e2e lo sugiere, pero no lo comprobé.
