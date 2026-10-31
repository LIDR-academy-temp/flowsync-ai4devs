# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte A a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

> La plantilla que trae `s13/start` es la de un ejercicio de migraciones (filas que cambian, rama del
> árbol de reversibilidad). Los tres apartados de abajo son los que pide el ejercicio de la s13.
>
> Tras la revisión del PR, cada punto empieza por su línea, y debajo va el detalle en viñetas.

## 1. Cuánto pesa la imagen y qué tuvo que escribir el Dockerfile que tu máquina daba por hecho

Una dependencia del sistema, una versión, un paso de construcción.

- `flowsync-api:local` pesaba 436 MB en disco y 100 MB comprimida al entregar (`docker images flowsync-api:local`), y el Dockerfile tuvo que escribir cuatro cosas que en mi máquina ya estaban.
  - La línea de Node, que el proyecto no declara en ningún `engines` ni `.nvmrc`: en WSL la pone nvm, 24.14, y la imagen, con la etiqueta móvil `node:24-alpine`, salió con 24.22.1.
  - El paso de compilación `npm run build`: en local la API corre desde TypeScript con `node ace serve --hmr`, y en la imagen hace falta `build/`.
  - Las dependencias desde el lockfile, con `npm ci`.
  - Un usuario sin privilegios dueño de `/app`.
  - Fuera del Dockerfile, en `make image-run`, hubo que escribir que el servidor escuche en `0.0.0.0` y que la base está en `host.docker.internal`, porque en local todo es `localhost`. El agente añadió por su cuenta `--add-host=host.docker.internal:host-gateway`.
  - De los 436 MB, 116 MB son `node_modules` de producción. Aun con `--omit=dev` traen `typescript`, `@adonisjs/assembler` y `@japa/runner`, porque `@adonisjs/core` y `@japa/api-client`, que está en `dependencies`, los declaran como dependencias de producción.
  - Otros 28 MB eran la caché que el `npm ci` de la etapa final dejaba en `/home/node/.npm`. Tras la revisión del PR, `npm cache clean --force` en la misma capa la deja en 200 KB, y la imagen en 388 MB en disco y 81 MB comprimida. La comparación no es solo de la caché: la reconstrucción trajo Node 24.22.2 en lugar de 24.22.1.

## 2. Qué reclamó el contenedor al arrancar sin variables

La lista literal, cuántas son, y cuáles son un secreto y cuáles configuración.

- `docker run --rm flowsync-api:local` murió en 1,5 segundos con `EnvValidationException` y 12 variables: dos son secretos y diez, configuración.
  - Las 12 son `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`: las 14 de `backend/.env` menos `TZ` y `DB_RO_PASSWORD`, que la aplicación no exige al arrancar.
  - Los dos secretos son `APP_KEY`, con la que la aplicación firma y cifra, y `DB_PASSWORD`, que da acceso a la base. `start/env.ts` ya los declara con `Env.schema.secret()`.
  - Las otras diez son configuración, aunque `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_DATABASE` le dan a quien tenga la contraseña todo lo demás que necesita para entrar.
  - Fuera de la lista queda un secreto que viaja igual: `make image-run` pasa `backend/.env` entero con `--env-file`, así que `DB_RO_PASSWORD` entra en el entorno del contenedor aunque la API no lo use.

Mensaje literal, sin los códigos de color:

```
ℹ EnvValidationException: Validation failed for one or more environment variables

◉ - Missing environment variable "NODE_ENV"
- Missing environment variable "PORT"
- Missing environment variable "HOST"
- Missing environment variable "LOG_LEVEL"
- Missing environment variable "APP_KEY"
- Missing environment variable "APP_URL"
- Missing environment variable "SESSION_DRIVER"
- Missing environment variable "DB_HOST"
- Missing environment variable "DB_PORT"
- Missing environment variable "DB_USER"
- Missing environment variable "DB_PASSWORD"
- Missing environment variable "DB_DATABASE"

 ⁃ at new EnvValidator (node_modules/@adonisjs/env/build/index.js:127:17)
 ⁃ at Env.rules (node_modules/@adonisjs/env/build/index.js:221:10)
 ⁃ at Env.create (node_modules/@adonisjs/env/build/index.js:205:23)
 ⁃ (async file://start/env.js:2:16)
```

## 3. Qué NO comprueba tu pipeline

Lo que ninguno de los cinco trabajos afirma.

- Ninguno de los cinco trabajos afirma que la imagen arranque ni lo que lleva dentro, y tal como los escribió el agente, ni siquiera que la suite pase.
  - **La suite.** El paso `make test 2>&1 | tee` no declaraba `shell:`, y Actions lo ejecuta con `bash -e`, sin `pipefail`. Simulando en local el trabajo `test` (worktree limpio sin `.env`, PostgreSQL en el 54411 como contenedor de servicio y su mismo entorno) con un test en rojo a propósito, el paso salió con 0 mientras el resumen decía `Tests 69 passed, 1 failed (70)`. actionlint no lo cantó, el agente afirmaba lo contrario en un comentario, y lo arregló un prompt de corrección con `shell: bash`.
  - **La imagen.** `image` solo construye, y lo dice. Nadie comprueba que arranque ni responda, ni qué lleva dentro: que falten `.env` o código fuente, o que sobren `typescript` o la caché de npm.
  - **Lo que cambia sin avisar.** Ni vulnerabilidades de la imagen base o de las dependencias, ni que `node:24-alpine` y `pgvector/pgvector:pg17` sigan siendo las mismas: son etiquetas, no digest.
  - **Los datos y el frontend.** Ni que las migraciones funcionen contra una base con datos y no vacía, ni nada del frontend.
  - **La infraestructura.** Ni que `infra-plan` e `infra-apply` funcionen: no hay `.railway/` ni `RAILWAY_TOKEN`, un PR desde fork los salta, y no se han ejecutado nunca. Tal como los entregué, ni siquiera fallaban cuando no podían saber si el PR tocaba `.railway/`: el `gh api ... | grep -q` iba en la condición de un `if`, y con un `gh` falso que sale con 1 los dos pasos escribían `touched=false` y salían con 0, así que `infra-apply` se habría saltado en verde. Lo señaló la revisión del PR y lo arregló otro prompt de corrección, que guarda la lista con `files=$(gh api ...)` antes de buscar en ella.
  - **Dónde está validado.** Con actionlint y con simulaciones locales del trabajo `test` y de esos dos pasos, no en GitHub: en el pull request, los cuatro workflows (CI, OpenAPI, revisor y chromatic) quedaron en `action_required`, esperando a que alguien del curso los apruebe.
  - **El workflow de OpenAPI, que ya existía.** Desde `s13/start`, `npm run openapi:check` salía con 1 y `Invalid command exported from "openapi_check.js" file. Invalid URL`, porque el `package-lock.json` traía `jsonschema` 1.5.0 a través de `@adonisjs/core` y `@adonisjs/ace`. No lo vi al entregar porque no ejecuté los workflows que ya existían, y salió al contrastar la rama con el directo. Lo arregló otro prompt de corrección con un `overrides` que fija `jsonschema` a 1.4.1, como hace `s13/end`: tras `npm ci`, `openapi:check` sale con 0 y dice que `docs/api/openapi.json` está al día, y `make test` sigue en 69 de 69.
