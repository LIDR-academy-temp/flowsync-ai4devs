# Hallazgos — sesión 13: imagen y pipeline

Las tres líneas del ejercicio, con lo que se midió y no con lo que se suponía.

## 1. Cuánto pesa la imagen y qué tuvo que declarar el Dockerfile

`flowsync-api:local` ocupa **388 MB en disco (81,1 MB de contenido)**, medido con
`docker images flowsync-api:local`. Lo que mi portátil daba por hecho y el Dockerfile tuvo que escribir:

- **La versión de Node:** `node:24-alpine` en las dos etapas, porque `@adonisjs/lucid` exige `node >=24`
  y en mi máquina ya estaba instalada.
- **Un paso de construcción que en desarrollo no existe:** `npm run build` (`node ace build`). En local
  la API corre el TypeScript directamente con `node ace serve --hmr`; la imagen arranca JavaScript
  compilado (`node bin/server.js`).
- **Las dependencias, dos veces:** `npm ci` completo para compilar y `npm ci --omit=dev` dentro de
  `build/` para la imagen final. En local hay un único `node_modules` con todo.
- **El usuario:** la imagen corre como `node`, sin privilegios; en local la API corre como yo.
- **La red, al arrancar (Makefile):** `HOST=0.0.0.0` porque el `HOST` de `.env` solo escucha dentro
  del contenedor; `DB_HOST=host.docker.internal` porque `localhost` es el propio contenedor; y, en
  Linux/WSL, `--add-host=host.docker.internal:host-gateway`, porque ese nombre no existe sin él.
- **Esperar a que la API arranque:** `make image-run` falló la primera vez con `Error 56`. El proxy de
  Docker acepta en el puerto publicado antes de que Node escuche y corta la conexión; en local el
  servidor ya estaba levantado cuando lo llamaba. Hubo que pedir la corrección (`--retry-all-errors`).

No hizo falta ninguna dependencia del sistema: `pg` es JavaScript puro y funciona en Alpine sin compilar nada.

## 2. Qué reclamó el contenedor al arrancar sin variables

`docker run --rm flowsync-api:local`, sin ninguna variable, murió con este mensaje (literal):

```text
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

**Doce variables:**

| Tipo | Variables |
|---|---|
| **Secreto** (2): conocerlas da acceso | `APP_KEY` (firma y cifra; con ella se falsifican cookies y sesiones), `DB_PASSWORD` |
| **Configuración** (10): no pasaría nada si salieran en un registro público | `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_DATABASE` |

Comparadas con `backend/.env`, la lista coincide con sus variables salvo dos que el contenedor **no**
reclama y que aun así le llegan, porque `make image-run` le pasa el `.env` entero con `--env-file`:

- `TZ`: configuración; no está en el schema de `start/env.ts` (la lee Node, no la aplicación).
- `DB_RO_PASSWORD`: **un secreto que la API no usa** (solo lo lee el Makefile para el rol `flowsync_ro`).
  Viaja al contenedor sin necesidad y se ve con `docker inspect flowsync-api-local`.

`CORS_ORIGIN` aparece en `.env` solo comentada y tampoco la exige el arranque.

## 3. Qué NO comprueba el pipeline

_Pendiente de la parte B (`.github/workflows/ci.yml`)._
