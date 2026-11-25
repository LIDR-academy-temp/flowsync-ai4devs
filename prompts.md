# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Lee entero el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md, con todos sus Scenarios. Esos Scenarios son el enunciado: no añadas casos ni quites ninguno.

Escribe un único archivo de tests funcionales en backend/tests/functional/ que los ejerza entrando por HTTP, igual que entra el cliente que consume este backend. Escribe un test por Scenario y ponle el título del Scenario.

Reglas:
1. No toques ni una línea fuera de backend/tests/. Si para escribir un test necesitas cambiar algo fuera de ahí, para y dímelo en vez de cambiarlo.
2. Comprueba lo que sale en la respuesta, no lo que devuelve un método interno. El campo se llama isOverdue y viaja en el cuerpo.
3. El día de referencia se le pasa a la petición. Ningún test usa la fecha de hoy ni ningún reloj.
4. Aísla los datos como lo hacen los tests que ya hay en backend/tests/functional/. No inventes otra forma.
5. No des por hecho ningún identificador: usa el que te devuelva la creación.
6. El resultado esperado de cada test sale de su Scenario, no del código. Puedes mirar el código para saber cómo se hacen las peticiones, pero no para decidir qué deben responder. Si la spec no dice algo que necesitas, como cómo se pasa el día de referencia, pregúntame antes de decidirlo tú.

Deja los tests tal como salgan. Si alguno falla, no arregles la implementación ni ajustes el test para que pase.

Cuando esté escrito, ejecútalo con make test-e2e desde la raíz y pégame la salida entera, sin resumirla ni recortarla. Después dime, Scenario por Scenario, si su test pasó o falló.

Esta petición no cierra la unidad de trabajo, así que no abras PR.
```

**Qué salió:** escribió `backend/tests/functional/tasks/overdue.spec.ts` con 7 tests, uno por Scenario (4 pasan, 3 fallan): una tarea con fecha del día anterior al de referencia llega con `isOverdue: false`, lo que tumba «Fecha del día anterior» y deja «Darla por hecha la deja de vencer» y «Aplazar resuelve el vencimiento» parados en su comprobación previa, sin llegar a su THEN. No preguntó cómo pasar el día de referencia: lo mandó como `today` en la query tras ver en el validador que lee `request.all()`. Para «creada hace semanas» creó la tarea con `Task.create` en vez de por HTTP.

## Prompt 2

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
La unidad de trabajo es el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md. Sus Scenarios son el enunciado.

La regla vive en isOverdueOn, en backend/app/models/task.ts. Crea backend/tests/unit/, que hoy no existe, y escribe ahí tests que la llamen directamente, sin servidor y sin base de datos. Que cubran sus bordes:
- Fecha anterior al día de referencia, y la tarea sin hacer.
- Fecha exactamente igual al día de referencia.
- Fecha posterior.
- Sin fecha.
- Tarea ya hecha, con la fecha pasada.

Añade un caso más que no sale de la spec: que la regla se comporte igual reciba la fecha como texto o como objeto de fecha.

Restricciones:
- No toques ni una línea fuera de backend/tests/.
- No toques la implementación ni la arregles.
- Ningún test usa la fecha de hoy ni ningún reloj.
```

**Qué salió:** escribió `backend/tests/unit/tasks/overdue.spec.ts` con 6 tests sobre una `Task` en memoria (4 pasan, 2 fallan). «Una tarea hecha con la fecha pasada» falla porque `isOverdueOn` no mira el estado. El caso texto/objeto falla porque con un `Date` de JS (lo que entrega `pg` para una columna `date`) la fecha del día anterior no sale vencida. Ese segundo defecto explica los 3 fallos funcionales del Prompt 1 y deja ver que allí la tarea hecha pasaba por casualidad.

## Prompt 3

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
HALLAZGOS.md ya existe en la raíz del repositorio. Rellénalo con tres líneas que sean concretas: una sola línea por punto, con tus palabras y con lo que mediste, no con lo que suponías.

Los puntos 1 y 2 que trae el fichero no son los de este ejercicio. Sustituye su encabezado y su texto por los dos primeros de abajo. El punto 3 se queda como está:

1. Cuántos de tus casos nuevos fallaron y cuántos de los que ya había siguieron en verde, con la cifra que dio la pantalla. La cifra sale de la salida de make test-e2e.
2. Cuál de tus casos nuevos pasó, si alguno pasó, y por qué crees que pasó. La respuesta no está en ningún sitio: se deduce mirando qué tienen en común los que fallaron.
3. De qué dudaste, o qué no pudiste comprobar.
```

**Qué salió:** sustituyó los puntos 1 y 2 de `HALLAZGOS.md`, dejó el 3 y escribió una línea en cada uno. En el 1: 3 de 7 casos nuevos fallaron y los 40 que ya había siguieron en verde («Tests 44 passed, 3 failed (47)»); el 40 lo sacó restando del total los 7 nuevos. En el 2: los 4 que pasaron solo esperan `isOverdue: false`, y los que fallan son los que necesitan un `true`. En el 3: decidió por su cuenta cómo mandar `today`, y no pudo comprobar el THEN de dos Scenarios. La línea 2 quedó larga porque mezcla la deducción con lo medido en los unitarios.

## Prompt 4

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Aplica los arreglos de la revisión adversarial del PR #1 (rama tests-epo). La unidad de trabajo sigue siendo el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md, y sus Scenarios siguen siendo el enunciado.

Arreglos en los tests:
1. En backend/tests/functional/tasks/overdue.spec.ts, el PUT /api/v1/tasks/:id/due-date manda today en el cuerpo, junto a dueDate. Así lo manda el cliente (frontend/src/lib/api.ts) y así lo documenta docs/capabilities/tasks/README.md. El GET /api/v1/tasks/:id lo sigue llevando en la query.
2. En ese mismo archivo, quita de «Sin fecha no se vence nunca» la comprobación de createdAt, porque la spec no pide ese campo en la tarea suelta. La tarea se sigue creando con la fecha de creación fija.
3. Las comprobaciones previas de «Darla por hecha la deja de vencer» y «Aplazar resuelve el vencimiento» llevan un mensaje que diga que son la precondición, para que en la salida no se confundan con un THEN que falla.
4. En backend/tests/unit/tasks/overdue.spec.ts, añade un caso: una tarea en in_progress con fecha anterior al día de referencia. La regla dice «su estado no es done», y hoy ningún test prueba in_progress.

No cambies nada más de los tests: ni los títulos, ni el resto de las aserciones, ni el caso de texto frente a objeto de fecha.

Arreglos en HALLAZGOS.md:
5. Punto 2: «Sin fecha no se vence nunca» no pasa por casualidad, porque pasaría igual con la regla bien hecha. Sepáralo de los otros tres.
6. Punto 3: la duda sobre cómo mandar today en el PUT no estaba abierta. El README de la capability ya lo decía, y lo decidí sin preguntar y mal. Corrígelo para que lo diga.
Sigue siendo una sola línea por punto. El punto 1 solo se toca si cambia la cifra.

Comprobación, sin dejar test:
7. Mide cómo llega dueDate en la respuesta de GET /api/v1/tasks/:id: como AAAA-MM-DD o como un instante. Mídelo con una petición real, no lo deduzcas del código. Si usas un test temporal, bórralo antes de commitear. No lo arregles.

Reglas:
- No toques ni una línea fuera de backend/tests/ y HALLAZGOS.md.
- No toques la implementación ni la arregles.
- Ningún test usa la fecha de hoy ni ningún reloj.
- Si alguno falla, déjalo fallar. No lo ajustes para que pase.

Cuando esté, ejecuta make test-e2e y make test-unit desde la raíz y pégame las dos salidas enteras. La vez anterior dieron 44 passed, 3 failed en e2e y 4 passed, 2 failed en unit. Dime test por test si cambió algo respecto a esas cifras, sin contar el caso nuevo, y si cambió, por qué.

Commitea y sube la rama para que se actualice el PR #1; no abras otro. Al final, vuelve a pasar el adversarial-reviewer sobre el PR.
```

**Qué salió:** aplicó los siete puntos, lo commiteó y lo subió al PR #1 (`4718793`). Los resultados no cambiaron: e2e siguió en `44 passed, 3 failed (47)`, y las dos precondiciones ahora fallan con su mensaje; unit pasó a `5 passed, 2 failed (7)`, con el caso nuevo de `in_progress` en verde. Medido: el `GET` devuelve `dueDate` como un instante (`"2026-08-19T00:00:00.000Z"`, `isOverdue: false`), y el `PUT` de la misma tarea, como `"2026-08-19"` con `isOverdue: true`. La segunda revisión adversarial no encontró nada grave, pero señaló que esa medición desmiente el punto 2 de `HALLAZGOS.md` («el endpoint nunca devuelve `true`», pero el `PUT` sí lo devuelve). También señaló que la descripción del PR y este archivo seguían diciendo que `today` va en la query.
