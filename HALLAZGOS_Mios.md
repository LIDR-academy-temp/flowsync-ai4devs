# Hallazgos: imagen, entorno y pipeline

Medido el 2026-10-27 sobre `pipeline-bernardo-paroli`. Cada dato lleva al lado el comando que lo produjo.

## 1. Peso de la imagen y lo que el Dockerfile tuvo que declarar

### Tamaño

`make image` reconstruyó la imagen con todas las capas en caché (`#10`–`#13 CACHED`, `#14 DONE 0.4s`).

| Medida | Valor | Comando |
|---|---|---|
| Tamaño en disco | 388 MB | `docker image ls flowsync-api:local` |
| Tamaño del contenido (comprimido) | 81.2 MB | `docker image ls flowsync-api:local` |
| Capa `npm ci --omit=dev` | 124 MB | `docker history --no-trunc flowsync-api:local` |
| Capa `COPY … /app/build` (la app compilada) | 1.18 MB | `docker history --no-trunc flowsync-api:local` |
| Capas de `node:24-alpine` (rootfs + Node + yarn) | 9.08 MB + 167 MB + 5.48 MB | `docker history --no-trunc flowsync-api:local` |
| `node_modules` dentro de la imagen | 115.8 MB | `docker run --rm --entrypoint sh flowsync-api:local -c 'du -sh /app/node_modules'` |

El código de la aplicación pesa 1.18 MB. El resto son la base y las dependencias. Entre las dependencias de producción, las más pesadas son de compilación:

| Paquete | Tamaño | Comando |
|---|---|---|
| `typescript` | 23.6 MB | `du -s node_modules/*` dentro de la imagen |
| `@ts-morph` | 11.7 MB | ídem |
| `@ast-grep` | 7.2 MB | ídem |

Están ahí porque `@adonisjs/auth` arrastra `@adonisjs/assembler` y este los arrastra a ellos, no por error del Dockerfile:

```
$ docker run --rm --entrypoint sh flowsync-api:local -c 'cd /app && npm ls --omit=dev @ts-morph/common @ast-grep/napi'
backend@0.0.0 /app
`-- @adonisjs/auth@10.1.0
  `-- @adonisjs/assembler@8.4.0
    +-- @ast-grep/napi@0.42.3
    `-- ts-morph@27.0.2
      `-- @ts-morph/common@0.28.1
```

### Lo que en esta máquina ya estaba y el Dockerfile tuvo que declarar

Esta máquina: `whoami` → `root`; `node --version` → `v24.22.1`; `ls -la backend/.env` → existe.

| Línea del Dockerfile | Qué declara | En esta máquina |
|---|---|---|
| `FROM node:24-alpine AS build` / `FROM node:24-alpine` | La versión de Node. La imagen trae `ENV NODE_VERSION=24.22.1` (`docker history`). | Node 24.22.1 ya instalado. La etiqueta `24-alpine` es flotante: fija la versión mayor, no el parche ni el digest. |
| `WORKDIR /app` | Directorio de trabajo, en las dos etapas. | Se trabaja en `backend/`. |
| `COPY package.json package-lock.json ./` | Los manifiestos, para que `npm ci` instale exactamente el lockfile. | Ya están en el árbol. |
| `RUN npm ci` | Las dependencias, dev incluidas, para compilar. | Se instalan a mano con `npm ci`. |
| `COPY . .` (filtrado por `backend/.dockerignore`) | El código, sin `node_modules`, `build`, `tmp` ni ningún `.env`. | El código está en el árbol junto a `backend/.env`. |
| `RUN npm run build` | Un paso de compilación: `node ace build` corre `tsc` y deja `build/`. | En desarrollo no hay compilación: `npm run dev` es `node ace serve --hmr`, que ejecuta el TypeScript directamente. |
| `COPY --from=build --chown=node:node /app/build ./` | Solo la salida compilada, y con dueño. | No aplica. |
| `RUN chown node:node /app` | Que el usuario sin privilegios pueda escribir en el directorio de trabajo. | Aquí se trabaja como `root`. |
| `USER node` | El usuario que ejecuta el proceso. | `root`. |
| `RUN npm ci --omit=dev && npm cache clean --force` | Las dependencias de producción, dentro de lo que fue `build/`. | No aplica. |
| `EXPOSE 3333` / `CMD ["node", "bin/server.js"]` | El puerto y el arranque en producción. | Se arranca con `npm run dev` o `make start`. |

Sin `RUN chown node:node /app`, la imagen no se construye. `WORKDIR` crea `/app` como root y `npm ci` falla al ejecutarse como `node`:

```
$ grep -v '^RUN chown node:node /app$' backend/Dockerfile > Dockerfile.sin-chown
$ docker build -q -f Dockerfile.sin-chown -t probe-sin-chown backend
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci --omit=dev && npm cache clean --force" did not complete successfully: exit code: 243
```

El Dockerfile **no** declara ninguna dependencia del sistema: no hay ningún `apk add`. Las que hay (`libatomic`, `libstdc++`…) vienen en la capa de 167 MB de la imagen base (`docker history --no-trunc`).

## 2. Lo que reclama el contenedor al arrancar sin variables

### Sin ninguna variable

```
$ docker run --rm flowsync-api:local

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

Código de salida: 1 (`docker run --rm flowsync-api:local >/dev/null 2>&1; echo $?`). Los códigos de color se quitaron con `sed -E 's/\x1b\[[0-9;]*m//g'`.

El contenedor reporta **las 12 de una vez**, no solo la primera. Salen en el mismo orden en que están declaradas en `backend/start/env.ts`, que declara exactamente estas 12: ni falta ni sobra ninguna.

### Lo que pide además de que existan

Faltar es solo el primer filtro. Fui poniendo valores ficticios hasta que el contenedor arrancó:

| Paso | Variables (cambios respecto al paso anterior) | Lo que reclamó | Quién lo comprueba |
|---|---|---|---|
| 1 | Las 12 con `=x` | `NODE_ENV` debe ser `development,production,test`; `PORT` y `DB_PORT` deben ser números; `APP_URL` debe ser una URL; `SESSION_DRIVER` debe ser `cookie,memory,database`. `HOST=x` sí pasa. | El esquema de `start/env.ts` |
| 2 | `NODE_ENV=production`, `PORT=3333`, `APP_URL=http://x.example.com`, `SESSION_DRIVER=cookie`, `DB_PORT=5432` | `Error: default level:x must be included in custom levels` | pino. `LOG_LEVEL` es `Env.schema.string()` y acepta cualquier cadena. |
| 3 | `LOG_LEVEL=info` | `Exception: The value of your key should be at least 16 characters long` | El cifrado (`@boringnode/encryption`). El esquema no exige longitud a `APP_KEY`. |
| 4 | `APP_KEY=xxxxxxxxxxxxxxxx` (16 caracteres) | `Error: getaddrinfo ENOTFOUND x` | El servidor HTTP al escuchar. `HOST=x` pasa el `format: 'host'` del esquema pero no resuelve. |
| 5 | `HOST=0.0.0.0` | Nada: `started HTTP server on 0.0.0.0:3333`, y `curl localhost:3399/` → `{"hello":"world"}` | — |

En el paso 5, las cuatro `DB_*` de texto (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`) seguían valiendo `x` y el contenedor arrancó igual. La base no se toca hasta la primera consulta: `POST /api/v1/auth/login` → `{"message":"getaddrinfo ENOTFOUND x"}`. Esa respuesta salió **con `NODE_ENV=production`** y trae el detalle del error interno.

### Clasificación

Las 12 variables de `start/env.ts`. La columna «Esquema» es su tipo en ese fichero.

| Variable | Esquema | Clase | Por qué |
|---|---|---|---|
| `NODE_ENV` | `enum` | Configuración | Uno de tres valores conocidos. |
| `PORT` | `number` | Configuración | Puerto interno del contenedor. |
| `HOST` | `string` (host) | Configuración | Interfaz donde escucha (`0.0.0.0`). |
| `LOG_LEVEL` | `string` | Configuración | Nivel de log. |
| `APP_KEY` | `secret` | **Secreto** | Es la clave del cifrado (paso 3) y firma la cookie `adonis-session`. Con ella se pueden falsificar o descifrar valores firmados por la aplicación. |
| `APP_URL` | `string` (url) | Configuración, **dudosa** | La URL pública no es secreta. Si fuera la de un entorno interno o de staging, revelaría un nombre que no tiene por qué ser público. |
| `SESSION_DRIVER` | `enum` | Configuración | Uno de tres valores conocidos. |
| `DB_HOST` | `string` | Configuración, **dudosa** | No da acceso por sí sola, pero en producción expone el nombre o la IP interna de la base. |
| `DB_PORT` | `number` | Configuración | Puerto. |
| `DB_USER` | `string` | **Dudosa** | No da acceso sin `DB_PASSWORD`, pero es la mitad de la credencial. |
| `DB_PASSWORD` | `secret` | **Secreto** | Con ella y `DB_USER` se entra en la base. |
| `DB_DATABASE` | `string` | Configuración | Nombre de la base. |

Total: 12 variables. 2 son secretos (`APP_KEY` y `DB_PASSWORD`, las mismas que `start/env.ts` declara como `Env.schema.secret()`), 7 son configuración clara y 3 son dudosas (`APP_URL`, `DB_HOST`, `DB_USER`).

## 3. Lo que no comprueba el pipeline

Leído de `.github/workflows/ci.yml`.

### `test`
- **Afirma:** con un PostgreSQL `pgvector/pgvector:pg17` vacío, `make test` aplica las migraciones (`migration:run`, solo hacia arriba) y la suite de Japa pasa con Node 24.
- **No afirma:**
  - Que el `down` de las migraciones funcione: nunca se ejecuta, y la regla 4 de `docs/convenciones/base-de-datos.md` (ida, vuelta e ida) no la hace cumplir nadie.
  - Que las migraciones funcionen sobre datos existentes: la base empieza vacía.
  - Nada del código compilado ni de la imagen: los tests ejecutan el TypeScript fuente a través de `ace.js` y `@poppinss/ts-exec`.
  - Nada del frontend.

### `image`
- **Afirma:** `make image` termina, y con ello `node ace build` compila sin errores de TypeScript. En `@adonisjs/core/build/commands/build.js`, si `bundler.bundle` falla, `this.exitCode = 1`.
- **No afirma:**
  - Que el contenedor arranque ni responda: no se lanza (así lo dice su comentario).
  - Que no lleve ningún `.env` ni código fuente: eso lo comprobé a mano, no en CI.
  - La imagen no se etiqueta con el SHA ni se publica: se construye y se tira.

### `lint-workflows`
- **Afirma:** los ficheros de `.github/workflows/` pasan actionlint 1.7.12, incluido shellcheck 0.11.0 sobre los `run:`. La imagen lo trae: `docker run --rm --entrypoint sh rhysd/actionlint:1.7.12 -c 'which shellcheck pyflakes; shellcheck --version'`.
- **No afirma:**
  - Que las acciones hagan lo que se espera, ni que los secretos existan.
  - La imagen de actionlint se toma por etiqueta, no por digest (`sha256:b1934ee5…`, en `docker image inspect`).

### `infra-plan`
- **Afirma:** en un PR del propio repositorio que toca `.railway/`, `railway config plan` genera un plan y se publica como comentario.
- **No afirma:**
  - Nada mientras no exista `.railway/`. Hoy no existe (`ls .railway` → `No such file or directory`), así que el trabajo acaba siempre en su primer paso.
  - Los pasos internos de `railwayapp/config@v1.2.0` usan `actions/setup-node@v4`, `actions/upload-artifact@v4` y `actions/github-script@v7` sin fijar a un SHA. Está en su `action.yml`.

### `infra-apply`
- **Afirma:** al fusionar un PR del propio repositorio que toca `.railway/`, se aplica el plan guardado para el último commit del PR.
- **No afirma:**
  - Que el commit fusionado haya pasado `test` e `image`: no tiene `needs`, y en el evento `closed` esos trabajos no corren. Corren en paralelo, en la ejecución del `push` a la rama base.
  - Que se aplique si el plan no está: el `action.yml` sale con error si no encuentra el artefacto de ese SHA o si el entorno se ha movido desde el plan.

### Lo que no comprueba ninguno de los cinco

- **Que la imagen arranque y responda.** Nadie la ejecuta.
- **Que el entorno de producción tenga las 12 variables del apartado 2**, ni que cumplan las restricciones que el esquema no expresa (`LOG_LEVEL` válido para pino, `APP_KEY` de 16 caracteres o más, `HOST` que resuelva). Los tres fallos solo se ven al arrancar.
- **Que las credenciales de la base sean buenas.** Ni siquiera al arrancar: con `DB_*` falsas el contenedor arranca y falla en la primera petición.
- **Las migraciones hacia atrás**, ni sobre una base con datos.
- **Los PR de forks que tocan `.railway/`.** No tienen plan, y al fusionarlos tampoco se aplican. Los dos trabajos salen como omitidos, no como fallidos, y el cambio de infraestructura queda en `main` sin aplicar sin que nada lo avise.
- **Un `apply` que falla después de fusionar.** El PR ya está en `main` y la ejecución en rojo sobre un PR cerrado es la única señal. No hay reintento, ni marcha atrás, ni aviso.
- **Vulnerabilidades.** No hay escaneo de dependencias ni de la imagen: `grep -niE "audit|trivy|grype|snyk|codeql|scan" .github/workflows/*.yml` no da nada, y no hay `.github/dependabot.yml`.
- **Que la imagen probada sea la que se despliega.** `image` no publica nada, y en el repositorio no hay nada que diga cómo construye Railway lo que despliega.
- **El frontend.** `ci.yml` no ejecuta ni su lint, ni su build, ni `make test-ui`.
- **El lint y el typecheck del backend** (`npm run lint`, `npm run typecheck`). Solo hay typecheck como efecto lateral del build de `image`.
