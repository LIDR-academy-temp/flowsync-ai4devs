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
  servidor ya estaba levantado cuando lo llamaba. Hubo que pedir la corrección (`--retry-all-errors`);
  con ella, `make image-run` responde `{"hello":"world"}` desde dentro del contenedor.
- **Limpiar lo anterior:** `make image-run` no es idempotente. Si queda vivo el contenedor de una
  ejecución previa, muere con `Error 125` (el nombre `flowsync-api-local` ya está en uso) y hay que
  hacer antes `make image-stop`. No se corrigió: queda como observación.

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

`make ci-lint` salió en silencio con código 0 a la primera. Lo que **ninguno** de los cinco trabajos
de `ci.yml` afirma:

- **Que la imagen arranque.** `image` solo la construye: nadie comprueba que con las doce variables
  de arriba arranque, que responda en el 3333 ni que llegue a la base. Eso solo lo vi yo, en local,
  con `make image-run`, y solo contra la raíz `/`, que no toca la base.
- **Qué lleva dentro la imagen.** Ni su tamaño, ni que no viaje ningún `.env`, ni que no vaya el
  código fuente ni las dependencias de desarrollo. Si mañana alguien quita una línea del
  `.dockerignore`, `image` sigue en verde.
- **Que la API funcione contra los datos que hay.** `test` migra una base vacía y corre la suite, y la
  suite solo cubre `auth`: `tasks` no tiene ni un test y `tests/unit/` no existe. Tampoco se prueba
  ningún `down` de las migraciones.
- **Lint y tipos del backend.** `npm run lint` no corre en ningún trabajo. Y del frontend, nada: ni
  lint, ni build, ni `make test-ui` (`chromatic.yml` publica el catálogo, no lo comprueba).
- **La infraestructura.** `.railway/` no existe y `RAILWAY_TOKEN` no está dado de alta: `infra-plan`
  e `infra-apply` no han corrido nunca y no sé si funcionan. En los PR del propio repo arrancan
  siempre y salen en verde sin hacer nada si el PR no toca `.railway/`; en un PR desde un fork, ni eso.
- **Que lo fijado siga fijo.** Las acciones van por SHA, pero `railwayapp/config` llama por dentro a
  `actions/setup-node@v4`, `actions/upload-artifact@v4` y `actions/github-script@v7` por etiqueta, y
  las imágenes de Docker (`pgvector:pg17`, `node:24-alpine`, `rhysd/actionlint:1.7.12`) van por
  etiqueta, no por digest: `1.7.12` resolvió hoy a `sha256:b1934ee5…9315667`, y mañana puede no ser así.
- **Nada, sobre mi propio PR.** En el PR #31 (de mi fork a `LIDR-academy-temp/flowsync-ai4devs`,
  base `s13/start`) las cuatro ejecuciones —CI, OpenAPI, revisor y chromatic— se quedaron en
  `action_required`: el repo del curso no ejecuta las Actions de quien colabora por primera vez hasta
  que alguien las aprueba. Ninguno de los cinco trabajos ha corrido todavía en ningún runner, y cuando
  corran, `infra-plan` e `infra-apply` se saltarán igual: el PR viene de un fork y no recibe secretos.
- **Que el filtro de `.railway/` diga la verdad.** En `infra-plan` e `infra-apply` (`ci.yml:164-170`
  y `207-213`), `gh api ... --paginate | grep -q '^\.railway/'` corre con `pipefail`: `grep -q` sale en
  la primera coincidencia, `gh` puede morir por SIGPIPE mientras sigue escribiendo y el `if` cae al
  `else`. Con un PR grande que sí toca `.railway/`, el plan o el apply se saltan **y el trabajo sale
  en verde**. No se corrigió.
- **Que el recuento de tests llegue siempre al resumen.** Si Japa muere antes de imprimir la línea
  `Tests` (una migración rota, un cambio de formato), el `grep` sin coincidencias aborta el paso por
  `pipefail` y el mensaje de reserva (`ci.yml:104`) no se escribe nunca. No se corrigió.
- **Que la imagen llegue a la base.** `make image-run` dice arrancar «contra la base de desarrollo»,
  pero `db` solo escucha en `127.0.0.1:54410` (`compose.yaml`) y desde el contenedor se llega por la
  IP del puente de Docker, no por el loopback. La raíz `/` respondió porque no toca la base; una
  ruta que sí la toque probablemente falle en Docker nativo de Linux. No lo comprobé.
- **Los dos primeros los encontró la revisión adversarial del PR, no actionlint.** `make ci-lint`
  salió limpio con los dos dentro: actionlint valida la sintaxis y las expresiones, no lo que hace
  un `run:` en un runner.
- **Dos piezas que solo existen en GitHub.** Que `make db-up` se salte compose con `CI` definido y que
  el recuento de la línea `Tests …` de Japa llegue al resumen no se han probado en ningún runner:
  actionlint valida la sintaxis, no ejecuta nada.
