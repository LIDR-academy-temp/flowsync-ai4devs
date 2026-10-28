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

---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Lee el Requirement «Cuándo una tarea está vencida» de openspec/specs/tasks/spec.md y sus siete Scenarios. Quiero cubrirlo con tests funcionales, porque hoy no tiene ninguno.

Crea backend/tests/functional/tasks/overdue.spec.ts con un test por Scenario, entrando por HTTP igual que entra el frontend: login, crear la tarea con POST /api/v1/tasks, fijar la fecha con PUT /api/v1/tasks/:id/due-date, cambiar el estado con PATCH /api/v1/tasks/:id/status y leerla con GET /api/v1/tasks/:id.

Reglas:
- No toques ni una línea fuera de backend/tests/: ni el modelo, ni el transformer, ni el controlador, ni los validadores. Si un test falla, se queda en rojo; no arregles la implementación.
- Comprueba el campo isOverdue que viaja en el cuerpo de la respuesta, no lo que devuelve un método interno.
- El día de referencia se pasa siempre fijo en el parámetro today de la petición. Nada de new Date(), DateTime.now() ni ningún otro reloj.
- Aísla igual que los tests que ya hay en backend/tests/functional/ (mira assignee.spec.ts y trash.spec.ts), sin inventar otra forma.
- No des por hecho ningún id: usa el que devuelva la creación.
- Correos de prueba en example.com.

Cuando lo tengas, ejecuta make test-e2e desde la raíz del repo. Devuélveme qué tests nuevos fallan y con qué mensaje, cuáles pasan, y cuántos de los que ya existían siguen en verde. No commitees.

Repo: /Users/ivancortes/desarrollo/lidr/modulo11/flowsync-ai4devs (rama tests-Ivan-Cortes-Lexaris; las bases de datos ya están levantadas).
```

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Ahora baja la regla a un test que la llame directamente. Vive en isOverdueOn, en backend/app/models/task.ts. Crea backend/tests/unit/ (hoy no existe) y dentro un spec que llame a isOverdueOn sobre una instancia de Task en memoria, sin servidor y sin base de datos: no guardes el modelo ni uses testUtils.db().

Casos, todos con un día de referencia fijo:
- fecha anterior al día de referencia y tarea sin hacer → vencida
- fecha exactamente igual al día de referencia → no vencida
- fecha posterior → no vencida
- sin fecha → no vencida
- tarea ya hecha (done) con la fecha pasada → no vencida

Y uno más que no sale de la spec: la regla tiene que comportarse igual reciba dueDate como texto 'AAAA-MM-DD' o como objeto de fecha. Antes de escribirlo, comprueba cómo llega de verdad dueDate al modelo cuando sale de PostgreSQL (tipo de la columna en la migración, cómo lo parsea el driver pg, lo que declara database/schema.ts) y usa en el test el tipo de objeto que llega de verdad.

Sigue sin tocar ni una línea fuera de backend/tests/: nada de implementación. Nada de reloj: todas las fechas literales. Ejecuta make test-unit desde la raíz y dime cuáles fallan, con qué mensaje y por qué crees que fallan. No commitees.

Repo: /Users/ivancortes/desarrollo/lidr/modulo11/flowsync-ai4devs (rama tests-Ivan-Cortes-Lexaris).
```

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Corre make test-e2e, make test-unit y make test desde la raíz y, con lo que salga en pantalla, rellena HALLAZGOS.md en la raíz. La plantilla que trae es de otro ejercicio: sustitúyela por estos tres puntos, una sola línea cada uno, concretos y con las cifras de la pantalla, no con suposiciones:

1. Cuántos de los casos nuevos (los de backend/tests/functional/tasks/overdue.spec.ts y backend/tests/unit/) fallaron y cuántos de los que ya había siguieron en verde.
2. Cuál de los casos nuevos PASÓ, si alguno pasó, y por qué crees que pasó. Dedúcelo mirando qué tienen en común los que fallaron y cómo llega dueDate a isOverdueOn en backend/app/models/task.ts.
3. De qué dudé o qué no pude comprobar.

No toques ningún otro archivo ni la implementación. Al terminar, ejecuta git diff --stat y git status y confirma que fuera de backend/tests/ solo cambia HALLAZGOS.md. No commitees.

Repo: /Users/ivancortes/desarrollo/lidr/modulo11/flowsync-ai4devs (rama tests-Ivan-Cortes-Lexaris).
```
