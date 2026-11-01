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

## Prompt 1 · las instrucciones al agente que orquestó el ejercicio

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code Desktop en Windows, sesión abierta en otro repositorio y operando sobre WSL, con la suscripción de Claude

```
@"C:\Users\renel\Videos\Curso LDIR\Sesion 11 - Backend TDD y Piramide de Test\S11-backend-tdd-piramide-test.md"
Te paso el texto de la s11
```

```
Y te adjunto el de la grabación: Analízalo dime que harás.
```

```
@"C:\Users\renel\AppData\Local\Temp\chat.md" @"C:\Users\renel\AppData\Local\Temp\chat.txt"
Analiza los chat, ahi viene lo que se tiene que hacer, en este S11 y los demás por venir
```

```
Ok, realiza todo lo que se tenga que hacer. hasta que estés listo con el S12 y me pidas su texto .
```

**Qué salió:** entre los dos primeros mensajes iba pegado el texto del ejercicio, y el adjunto era la transcripción de la grabación del directo. El agente encontró `LIDR-academy/flowsync-ai4devs` en 404 y sin `s11/start` en ningún sitio. Del chat del grupo sacó solo las instrucciones del curso: el repositorio original está bloqueado desde el 14 de octubre y hay una copia temporal, `LIDR-academy-temp/flowsync-ai4devs`. Esa copia no es un fork del original, así que hizo un fork nuevo, `rene2bcore/flowsync-ai4devs-temp`, y desde ahí sale este PR. Antes del primer prompt al agente midió la línea de partida: `make test` daba `Tests  40 passed (40)` y `make test-unit` respondía `NO TESTS EXECUTED` con código de salida 0. `make setup` dejó `backend/.env.example` modificado (le quita el salto de línea final), y se deshizo antes de empezar para que el diff no saliera de `backend/tests/`.

---

## Prompt 2 · Parte A, primer intento (no funcionó)

**Modelo:** ninguno, no llegó a llamar al modelo
**Herramienta:** Claude Code CLI 2.1.272 en WSL, sin interfaz (`claude -p`, con la suscripción de Claude y los permisos concedidos de antemano), lanzado desde la raíz del repositorio en la rama `tests-RLL`, con `Edit` y `Write` denegados en `backend/app`, `backend/start`, `backend/database`, `backend/config`, `backend/providers`, `frontend`, `openspec`, `Makefile` y `compose.yaml`, y con `Read(backups/**)`, `pg_restore`, `git commit`, `git push`, `git checkout`, `git switch` y `gh` denegados en la invocación

```
Cubre con tests el Requirement «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`, que hoy no tiene ninguno. Léelo entero, con todos sus Scenarios: son el enunciado y el contrato, y están escritos desde antes que el código. No elijas otro Requirement ni te inventes casos.

Escribe un único archivo de tests funcionales que ejerza esos Scenarios entrando por HTTP, igual que entra la aplicación que consume este backend. Un test por Scenario.

Estas restricciones no se negocian:

- No toques ni una línea fuera de `backend/tests/`: ni el modelo, ni el transformer, ni el controlador, ni las rutas, ni las migraciones. Si crees que hay que cambiar la implementación, para y dímelo en vez de cambiarla.
- Los tests comprueban lo que sale en la respuesta, no lo que devuelve un método interno. El campo se llama `isOverdue` y viaja en el cuerpo.
- El día de referencia se le pasa a la petición. Nada de la fecha de hoy ni de ningún reloj.
- Sigue la forma de aislamiento que ya usan los tests de `backend/tests/functional/`, sin inventar otra.
- No des por hecho ningún identificador: usa el que te devuelva la creación.
- No hagas commit ni cambies de rama.

Cuando lo tengas, córrelo desde la raíz con `make test-e2e` y enséñame la salida entera, no solo si pasó. Después dime, con la cifra de la pantalla, cuántos tests nuevos fallan y cuántos de los que ya había siguen en verde, y de cada test nuevo si pasa o falla.
```

**Qué salió:** `Failed to authenticate: OAuth session expired and could not be refreshed`, en un turno y sin tocar nada. Renovar la sesión del CLI de WSL exige iniciarla en el navegador, así que el mismo encargo se lanzó por otro camino (Prompt 3).

---

## Prompt 3 · Parte A, el contrato primero

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** Claude Code Desktop en Windows, subagente `general-purpose` lanzado por la sesión del Prompt 1, sin su contexto, operando sobre el repositorio de WSL con `wsl.exe`. A diferencia del Prompt 2, las restricciones solo iban en el texto, sin permisos que las impusieran, y se comprobaron después con `git status` y `git diff --stat`

```
Entorno: el repositorio está en WSL (Ubuntu), en `~/projects/ai4devs/flowsync-temp`, en la rama `tests-RLL`. Tú corres en Windows: lee y escribe ficheros por su ruta Windows, `\\wsl.localhost\Ubuntu\home\renelo\projects\ai4devs\flowsync-temp\`, y ejecuta cualquier orden dentro de WSL con PowerShell, así: `wsl.exe bash -lc 'cd ~/projects/ai4devs/flowsync-temp && . ~/.nvm/nvm.sh && <orden>'`. Las instrucciones del proyecto están en el `CLAUDE.md` de su raíz: léelo antes de empezar. La carpeta `backups/` lleva datos personales reales: no la abras ni la leas.

El encargo:

Cubre con tests el Requirement «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`, que hoy no tiene ninguno. Léelo entero, con todos sus Scenarios: son el enunciado y el contrato, y están escritos desde antes que el código. No elijas otro Requirement ni te inventes casos.

Escribe un único archivo de tests funcionales que ejerza esos Scenarios entrando por HTTP, igual que entra la aplicación que consume este backend. Un test por Scenario.

Estas restricciones no se negocian:

- No toques ni una línea fuera de `backend/tests/`: ni el modelo, ni el transformer, ni el controlador, ni las rutas, ni las migraciones. Si crees que hay que cambiar la implementación, para y dímelo en vez de cambiarla.
- Los tests comprueban lo que sale en la respuesta, no lo que devuelve un método interno. El campo se llama `isOverdue` y viaja en el cuerpo.
- El día de referencia se le pasa a la petición. Nada de la fecha de hoy ni de ningún reloj.
- Sigue la forma de aislamiento que ya usan los tests de `backend/tests/functional/`, sin inventar otra.
- No des por hecho ningún identificador: usa el que te devuelva la creación.
- No hagas commit ni cambies de rama.

Cuando lo tengas, córrelo desde la raíz con `make test-e2e` y enséñame la salida entera, no solo si pasó. Después dime, con la cifra de la pantalla, cuántos tests nuevos fallan y cuántos de los que ya había siguen en verde, y de cada test nuevo si pasa o falla.
```

**Qué salió:** 34 llamadas a herramientas, unos 8 minutos. Escribió `backend/tests/functional/tasks/overdue.spec.ts`, con los 7 Scenarios por su título literal, todo por HTTP (`POST /auth/signup`, `POST /tasks`, `PUT /tasks/:id/due-date`, `PATCH /tasks/:id/status` y `GET /tasks/:id?today=`) y el aislamiento `withGlobalTransaction` de los tests vecinos. Para «Sin fecha no se vence nunca» calculó los días de referencia sumando seis semanas y diez años al `createdAt` que devuelve la creación, sin leer el reloj. Resultado: `Tests  45 passed, 2 failed (47)`. Diagnosticó los dos defectos sin tocar la implementación, y avisó de que tres de los cinco verdes pasarían igual con un `return false`. Para confirmar el segundo defecto hizo una sonda temporal (un `PUT` sobre una tarea ya hecha, que responde `isOverdue: true`) y la borró: no queda en el diff.

---

## Prompt 4 · Parte B, bajar la regla

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión del subagente del Prompt 3, continuada con su contexto

```
Antes de arreglar nada, baja la regla a un test que la llame directamente, donde sus bordes salen baratos. La regla vive en `isOverdueOn`, en `backend/app/models/task.ts`. Crea `backend/tests/unit/`, que hoy no existe, y escribe ahí sus bordes, sin servidor y sin base de datos:

- Fecha anterior al día de referencia, y la tarea sin hacer.
- Fecha exactamente igual al día de referencia.
- Fecha posterior.
- Sin fecha.
- Tarea ya hecha, con la fecha pasada.

Y un caso más que no sale de la spec: que la regla dé el mismo resultado reciba la fecha como texto o como objeto de fecha. El objeto de fecha constrúyelo como lo entrega el conector de PostgreSQL al leer una columna `date`, no como te resulte cómodo, porque lo que quiero saber es cómo se comporta con el dato que le llega de verdad.

Sigues sin tocar nada fuera de `backend/tests/`, y sin commit ni cambio de rama. Córrelo con `make test-unit` desde la raíz y enséñame la salida entera. Después dime qué casos pasan y cuáles fallan, y de los que fallan, por qué.
```

**Qué salió:** 13 llamadas a herramientas, unos 3 minutos. Escribió `backend/tests/unit/models/task.spec.ts`, con los cinco bordes (los de «sin hacer», en `pending` y en `in_progress`) y el caso del texto contra el `Date`. Ese `Date` no lo construyó a mano: usó el parser que `pg` registra para `DATE` (`getTypeParser(builtins.DATE, 'text')` de `pg-types`), e hidrató la tarea desde una fila con `Task.$createFromAdapterResult`, como hace Lucid. Antes de comparar comprueba que lo que llega al modelo es un `Date`, aunque `database/schema.ts` lo declare `string`. Resultado: `Tests  4 passed, 2 failed (6)`; fallan «tarea ya hecha, con la fecha pasada» (devuelve `true`) y «da lo mismo con la fecha en texto que con la que entrega PostgreSQL» (con el día anterior da `true` en texto y `false` con el `Date`). Avisó de que importa `pg-types`, que no está en `package.json`, y de que `CLAUDE.md` todavía dice que `tests/unit/` no existe.

---

## Prompt 5 · la instrucción al orquestador para comprobar la duda del huso

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión de Claude Code Desktop que el Prompt 1

```
Cierra también los huecos de S9, S10 y S11
```

**Qué salió:** respondía a la lista de huecos que el orquestador lleva de las sesiones anteriores; de la s11 quedaba la duda del punto 3 de `HALLAZGOS.md`. Comprobó primero la premisa: WSL está en `America/Mexico_City`, y la API sale en UTC por el `TZ=UTC` de `backend/.env`, que `@adonisjs/env` 7.0.0 solo aplica si el proceso no trae `TZ`. Con `TZ=Asia/Tokyo`, `Env.create` no lo cambia y `new Date(2026, 7, 19)` es `2026-08-18T15:00:00.000Z`. En un worktree aparte de `9d37657`, con su propio proyecto de compose, `make test` dio `Tests  49 passed, 4 failed (53)` en UTC, en México y en Tokio, con los mismos cuatro en rojo. En ese momento solo se anotó fuera del repositorio.

---

## Prompt 6 · la instrucción al orquestador para llevar la comprobación al PR

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión de Claude Code Desktop que el Prompt 1

```
Sí, añade la corrección al PR #33 y actualiza "Estatus S1-S13.md"
```

**Qué salió:** antes de escribir, el orquestador midió el `GET` sobre esta rama, en otro worktree aparte y solo contra `db-test`: con la API en Tokio, una tarea que vence el 19 vuelve como `2026-08-18T15:00:00.000Z`; en México, como `2026-08-19T06:00:00.000Z`, y en UTC, como `2026-08-19T00:00:00.000Z`. `isOverdue` sale `false` con `today=2026-08-20` en los tres. Añadió la comprobación como viñeta debajo de la línea del punto 3 de `HALLAZGOS.md`, sin cambiar la línea entregada, y la misma corrección a la descripción del PR.
