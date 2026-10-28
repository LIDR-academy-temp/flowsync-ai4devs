# Prompts

---
## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Trabajas en el repositorio de FlowSync (backend AdonisJS en backend/). Necesito empaquetar la API en una imagen Docker que se construya desde cero en una máquina vacía. NO construyas la imagen, NO arranques contenedores y NO ejecutes make image ni docker: esos pasos los hago yo a mano después. Tampoco crees la carpeta .railway/ ni toques nada de despliegue.

1. Crea backend/Dockerfile multietapa:
   - Etapa de construcción: Node 24 (la misma línea que exige el proyecto; revisa package.json/.nvmrc y respétalo), `npm ci` con todas las dependencias y `npm run build`, que deja la app compilada en build/.
   - Etapa final: la imagen base de Node 24 más pequeña razonable. Solo copia build/, y dentro de build/ instala las dependencias de producción con `npm ci --omit=dev`, como documenta AdonisJS para desplegar. Ni código fuente, ni devDependencies, ni ningún .env en la imagen final.
   - Corre como usuario sin privilegios, `EXPOSE 3333`, arranca con `node bin/server.js`.
   - Ninguna variable de entorno con valor dentro del Dockerfile (ni ENV ni ARG con valores de configuración). La configuración entra al arrancar el contenedor.
   - Si necesitas declarar algo que mi portátil da por hecho (paquetes del sistema, toolchain para módulos nativos, versión concreta, un paso extra de build), hazlo y déjalo comentado en el propio Dockerfile con el motivo.

2. Crea backend/.dockerignore que excluya al menos node_modules, build, tmp y cualquier .env (incluidos .env.*).

3. Añade al Makefile de la raíz tres objetivos, con estos nombres exactos:
   - `image`: construye la imagen con la etiqueta `flowsync-api:local` a partir de backend/.
   - `image-run`: arranca en segundo plano un contenedor llamado `flowsync-api-local`, publicando `IMAGE_PORT` (por defecto 3334, sobreescribible con `make image-run IMAGE_PORT=...`) sobre el 3333 del contenedor, con `--env-file backend/.env` y forzando encima `HOST=0.0.0.0`, `DB_HOST=host.docker.internal` (dentro del contenedor localhost es el propio contenedor) y `APP_URL=http://localhost:$(IMAGE_PORT)` (Docker no expande el `${HOST}:${PORT}` de ese fichero). En Linux añade lo necesario para que host.docker.internal resuelva (`--add-host=host.docker.internal:host-gateway`). Termina con un `curl -s` a `http://localhost:$(IMAGE_PORT)/`, dejando unos segundos de margen para que el servidor levante.
   - `image-stop`: para y borra el contenedor sin fallar si no existe.
   Declara los tres en `.PHONY` y no rompas los objetivos que ya existen.

4. Registro en prompts.md (en la raíz; créalo si no existe). Al terminar, añade al final una sección:
   ## Parte A — Prompt 1
   ### Prompt
   (este prompt completo, literal, en un bloque de código)
   ### Salida
   - Archivos creados o modificados, con una línea por archivo.
   - Contenido completo final de backend/Dockerfile y backend/.dockerignore, y el fragmento añadido al Makefile.
   - Lista explícita de lo que añadiste por tu cuenta y que yo no pedí, con el motivo de cada cosa.
   - Las dudas o suposiciones que hiciste.

5. HALLAZGOS.md (en la raíz; créalo si no existe) con esta estructura exacta de tres apartados:
   ## 1. Peso de la imagen y lo que hubo que declarar
   ## 2. Qué reclamó el contenedor al arrancar sin variables
   ## 3. Qué NO comprueba el pipeline
   Rellena ahora solo el apartado 1 con lo que tuvo que declarar el Dockerfile que una máquina local da por hecho (dependencia del sistema, versión, paso de construcción…). Deja `PENDIENTE: tamaño (docker images flowsync-api:local)` en el lugar del peso. En el apartado 2 escribe, como hipótesis marcada como tal, qué variables crees que exigirá backend/start/env.ts leyéndolo, sin confundirlo con el resultado real. Deja el apartado 3 como PENDIENTE.

Hazlo en una sola pasada y no ejecutes nada que construya o arranque la imagen.
```

**Qué salió:** Funcionó a la primera sin construir nada: Dockerfile multietapa en `node:24-alpine` (usuario `node`, sin `ENV`/`ARG`), `.dockerignore`, objetivos `image`/`image-run`/`image-stop` en el Makefile y `HALLAZGOS.md` con el apartado 1 relleno y el 2 como hipótesis.
Avisó de varias dudas: Node 24 sin versión exacta, `@ast-grep/napi` nativo en producción, lockfile local sin campos `libc`, `NODE_ENV=development` heredado del `.env` y una base en `127.0.0.1` que no se ve desde el contenedor en Linux.

## Prompt 2

```
Seguimos en el repositorio de FlowSync. Ya existen backend/Dockerfile y los objetivos image/image-run/image-stop del Makefile. Ahora quiero el pipeline de CI. NO crees la carpeta .railway/, NO pidas planes a Railway, NO despliegues nada y NO escribas ningún secreto ni token en ningún archivo.

1. Añade al Makefile de la raíz el objetivo `ci-lint`: valida todos los workflows de .github/workflows/ con actionlint sin instalar nada, usando la imagen oficial `rhysd/actionlint:1.7.12`, montando la raíz del repositorio y con `-color`. Decláralo en .PHONY.

2. Crea .github/workflows/ci.yml con exactamente cinco trabajos, cada uno con un comentario arriba que diga la pregunta que responde:
   - `test`: ¿la suite del backend pasa en una máquina limpia? Servicio PostgreSQL con `pgvector/pgvector:pg17` publicado en el puerto 54411 (es el que espera backend/.env.test: usuario flowsync, contraseña flowsync, base flowsync_test), con healthcheck para esperar a que esté sano. Node 24. Ejecuta exactamente `make test`, sin `node ace` a mano. Lee backend/start/env.ts y backend/.env.test: las variables que env.ts exige y que no están en .env.test van en el `env:` del trabajo, siguiendo cómo lo hace .github/workflows/openapi.yml (léelo antes). Publica el recuento de tests (pasados/fallidos/total) en `$GITHUB_STEP_SUMMARY`, no en un echo del registro.
   - `image`: ¿el artefacto se puede fabricar desde cero? Ejecuta `make image` y nada más. Deja escrito en un comentario que este trabajo afirma que la imagen se construye, no que arranque.
   - `lint-workflows`: ¿los archivos del pipeline son válidos? `make ci-lint`.
   - `infra-plan`: ¿qué cambiaría en la infraestructura si se fusiona? Solo en pull requests que toquen `.railway/**` y solo si el PR viene del propio repositorio y no de un fork (`github.event.pull_request.head.repo.full_name == github.repository`). Acción oficial `railwayapp/config` versión v1.2.0, `command: plan`, token desde `secrets.RAILWAY_TOKEN`, y que el plan se publique como comentario del PR (dale el permiso mínimo para ello).
   - `infra-apply`: el mismo plan con `command: apply`, solo cuando el PR se fusiona (`pull_request` de tipo closed con `merged == true`), con las mismas condiciones de ruta y origen.
   Para el filtro por ruta, elige un mecanismo que no añada un sexto trabajo y explica en un comentario por qué lo elegiste.

3. Reglas para todo el archivo:
   - `permissions: {}` o mínimos a nivel de workflow, y permisos mínimos declarados por trabajo. Nunca write-all.
   - Cada acción de terceros fijada a su SHA de commit completo (40 caracteres), con la etiqueta de versión en un comentario al lado. Resuelve cada SHA por red (`git ls-remote https://github.com/<owner>/<repo> refs/tags/<tag>`, y si es un tag anotado, el commit al que apunta con `^{}`). No escribas ningún SHA de memoria. Si no puedes resolver uno por red, déjalo explícitamente marcado como `TODO-SHA` y dilo; no lo inventes.
   - test, image y lint-workflows en paralelo (sin `needs` entre ellos).
   - `concurrency` que cancele la ejecución anterior si llega otro push a la misma rama. Asegúrate de que esa cancelación no pueda interrumpir un `infra-apply` a medias y explica cómo lo resolviste.

4. Cuando termines puedes ejecutar `make ci-lint`. Si lo ejecutas y corriges algo, NO lo ocultes: anota la salida original del linter y qué cambiaste.

5. Registro en prompts.md: añade al final una sección
   ## Parte B — Prompt 1
   ### Prompt
   (este prompt completo, literal, en un bloque de código)
   ### Salida
   - Archivos creados o modificados.
   - Contenido completo final de ci.yml y el fragmento del Makefile.
   - Tabla acción → tag → SHA → comando con el que se resolvió.
   - Si ejecutaste `make ci-lint`: salida literal de cada ejecución, código de salida y correcciones hechas.
   - Lo que añadiste por tu cuenta y no se pedía, y las suposiciones.

6. HALLAZGOS.md: no toques los apartados 1 y 2. Rellena el apartado 3, «Qué NO comprueba el pipeline», como una lista corta e incómoda de lo que ninguno de los cinco trabajos afirma. Piensa en cosas como estas: que la imagen arranque y responda, migraciones contra una base real de producción, compatibilidad del esquema, el frontend, el comportamiento con las variables reales de producción, que el plan de infra coincida con lo que hay desplegado, los PR de forks en infra, vulnerabilidades de dependencias o de la imagen base, rendimiento, y que `make test` local y CI usen el mismo .env. Quédate solo con lo que sea cierto para el ci.yml que has escrito y justifica cada punto en una línea.
```

**Qué salió:**

`ci.yml` con los cinco trabajos (acciones fijadas a SHA resueltos por `git ls-remote`, `permissions: {}`, `infra-apply` en un grupo de concurrencia propio que nada puede cancelar), `make ci-lint` en verde a la primera, y el apartado 3 de `HALLAZGOS.md` relleno.
Añadió por su cuenta `DB_EXTERNA` en `db-up` para que `make test` no choque con el servicio del 54411, y avisó de que `railwayapp/config` usa por dentro acciones y `@railway/cli@latest` sin fijar.
