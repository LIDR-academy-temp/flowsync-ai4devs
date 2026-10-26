# Hallazgos

Módulo 13: la imagen de la API, el pipeline y lo que ninguno de los dos comprueba. Todo lo de
abajo está medido en esta máquina (Windows 11, Git Bash, Docker Desktop 29.8.2, Node 24.19.0); no
hay ninguna cifra supuesta.

## 1. Cuánto pesa la imagen y qué hubo que declarar

- `docker images flowsync-api:local` imprimió: `flowsync-api:local`, `5ad692b2e75a`, **431MB** de
  uso en disco, **99.1MB** de contenido.
- Ningún `apk` ni toolchain: las dos etapas son `node:24-alpine`. `pg` es JavaScript puro, el hash
  es `scrypt` de Node y el único install script del lockfile es `@swc/core`, que es dev y trae
  binario musl. `node ace build` no necesitó `.env`.
- El primer `make image` falló con `EACCES` porque `USER node` iba antes de `npm ci --omit=dev`. La
  corrección, en la misma pasada, fue instalar como root y pasar a `USER node` después.
- Dentro de la imagen final no hay `.ts` fuera de `node_modules` ni ficheros `.env*`. Sí quedan
  `typescript@6.0.3` y `@adonisjs/assembler@8.4.0`, porque `@adonisjs/core`, `auth`, `lucid`,
  `session`, `shield`, `cors` y `@tuyau/core` los declaran como peerDependencies y
  `npm ci --omit=dev` los instala igual. Por el mismo camino entran tres devDependencies del
  `package.json`: `@japa/runner@5.3.0` (y con él `@japa/assert` y `@japa/plugin-adonisjs`), que
  es peer de `@japa/api-client`, declarado en `dependencies`; y `pino-pretty@13.1.3` y
  `youch@4.1.1`, peers de `@adonisjs/core`. `eslint`, `prettier`, `hot-hook` y
  `@adonisjs/eslint-config` sí quedan fuera.

## 2. Qué reclamó el contenedor al arrancar sin variables

`docker run --rm flowsync-api:local`, sin `--env-file` ni `-e`, salió con código 1 y esto:

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

Son 12 variables, las mismas que declara `backend/start/env.ts`.

- **Secretos**, porque conocerlos da acceso: `APP_KEY` y `DB_PASSWORD`.
- **Configuración**, porque salir en un log no da acceso: las otras diez (`NODE_ENV`, `PORT`,
  `HOST`, `LOG_LEVEL`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`,
  `DB_DATABASE`).

## 3. Qué NO comprueba el pipeline

- `image` solo construye; no arranca el contenedor ni comprueba `{"hello":"world"}`.
- Ningún job mira si la imagen lleva `.env`, TypeScript o esas peerDependencies.
- `test` publica pgvector en el 54411 y luego `make test` vuelve a levantar `db-test` por Compose en
  el mismo puerto. El choque está comentado en el job y no está resuelto.
- No hay pruebas de carga, ni migraciones de producción, ni rollback.
- `infra-plan` e `infra-apply` no corren en este cambio: no existe `.railway/`. En un fork tampoco
  verían `RAILWAY_TOKEN`.
- En Git Bash, sin `MSYS_NO_PATHCONV=1`, `ci-lint` ni llega a actionlint. Con esa variable,
  `make ci-lint` salió con código 0 y actionlint no imprimió avisos.
