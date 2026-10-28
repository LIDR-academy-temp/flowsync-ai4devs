# Hallazgos

Las tres líneas del ejercicio de la sesión 13 (imagen y pipeline), con lo medido.

## 1. Cuánto pesa la imagen y qué hubo que declarar

- `flowsync-api:local` ocupa **382 MB en disco y 80,8 MB de contenido** (`docker images`), frente a los 177 MB de `backend/` en mi máquina, y lo que el Dockerfile tuvo que escribir que mi portátil daba por hecho es: la línea de Node (24, que aquí ya tenía con nvm), un `npm ci` desde el lockfile en vez de mi `node_modules` de macOS/arm64, el paso de compilación `node ace build` (en local `npm run dev` ejecuta TypeScript directamente y nunca compila), un segundo `npm ci --omit=dev` dentro de `build/`, un usuario sin privilegios, y al arrancar `HOST=0.0.0.0`, `DB_HOST=host.docker.internal` y un `APP_URL` literal, porque Docker no expande el `${HOST}:${PORT}` del `.env`; y de propina la imagen destapó que "producción" no es tan de producción: `typescript` (24 MB), `@ts-morph` y `@japa/*` viajan dentro porque los arrastran `@adonisjs/auth` y `@japa/api-client` (declarado en `dependencies`), y `build/tests/` va compilado dentro.

## 2. Qué reclamó el contenedor sin variables

- **12 variables**: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`; **secretos 2** (`APP_KEY`, que firma y cifra, y `DB_PASSWORD`, que abre la base: son justo los dos `Env.schema.secret()`), **configuración 10** (las otras; `DB_HOST` y `DB_USER` ayudan a quien ya tiene la contraseña pero solas no dan acceso), y de las 14 claves de mi `backend/.env` sobran `TZ` (no está en el esquema) y `DB_RO_PASSWORD`, que es un tercer secreto que la app no pide y que `make image-run` le mete igualmente al contenedor por `--env-file`.

Mensaje literal de `docker run --rm flowsync-api:local` (salida con los códigos de color quitados):

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

## 3. Qué NO comprueba el pipeline

- Que la imagen **arranque** (`image` solo la construye; el `{"hello":"world"}` lo vi yo con `make image-run`), que las migraciones funcionen contra una base con datos o que su `down` funcione (la suite migra una base vacía hacia arriba), el tipado y el lint del backend (`tsc` y `eslint` no corren; Japa ejecuta TypeScript sin comprobar tipos), el frontend entero (ni build, ni oxlint, ni `make test-ui`), la capability `tasks` (la suite solo tiene tests funcionales de `auth`), vulnerabilidades de dependencias o de la imagen, que `infra-plan`/`infra-apply` funcionen de verdad (no hay `.railway/` ni token: nunca han corrido, y actionlint solo valida sintaxis y expresiones), y que lo que se despliega sea esta imagen (no se publica en ningún registro); además solo las acciones van fijadas a SHA: `rhysd/actionlint:1.7.12`, `pgvector/pgvector:pg17` y las bases `node:24`/`node:24-alpine` van por etiqueta, que se puede mover. Y en este PR, que llega desde un fork, las Actions pueden quedar a la espera de aprobación y los dos trabajos de infraestructura se saltan: si no corre, el pipeline solo está validado en local (actionlint + simulación de `make test` con `CI=true`).
