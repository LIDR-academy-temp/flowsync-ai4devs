# Hallazgos

1. De los 13 casos nuevos (7 en `overdue.spec.ts`, 6 en `tests/unit/`) fallaron 5 —3 funcionales («fecha del día anterior: llega vencida», «darla por hecha…», «aplazar…») y 2 unitarios («hecha (done) con la fecha pasada», «da lo mismo… como Date de pg»)— y los 40 que ya había siguieron en verde (`make test`: 48 passed, 5 failed de 53; `test-e2e`: 44/47; `test-unit`: 4/6).

2. Pasaron 8 nuevos, pero el que pasa por la razón equivocada es el funcional «una tarea hecha con la fecha pasada no llega vencida»: su gemelo unitario falla porque `isOverdueOn` no mira `status`, y en HTTP pasa igual porque al releer de la base `dueDate` llega como `Date` (columna `date` + `@column()` sin `consume`), `Date < 'AAAA-MM-DD'` siempre da `false`, y por eso fallan justo los tres funcionales que esperan `isOverdue: true` tras un GET y pasan todos los que esperan `false`.

3. No comprobé en ejecución que `dueDate` llegue como `Date` desde la base (lo deduzco del fallo unitario con `new Date(2026, 7, 19)`, del `@column()` sin `consume` de `database/schema.ts` y de que solo falle lo leído por GET, no lo que devuelve el PUT con el valor recién asignado como texto), y no sé si la medianoche local del `Date` añadiría además un desfase de un día según el huso de la máquina.
