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
**Herramienta:** Claude Code Desktop en Windows, sesión abierta en otro repositorio y operando sobre WSL, con la suscripción de Claude. Es la misma sesión que orquestó la s11 y la s12

```
Ok, ahora vamos con el S13, te mando el detalle.

[Aquí iba pegada, entera, la lección del curso «Ejercicio FlowSync: empaqueta la API y escribe su pipeline», unos 23.000 caracteres: el setup del entorno, las partes A, B y C y cómo se entrega. No se reproduce aquí.]

Queda pendiente el envivo y te comparto después la transcripción, ejecuta tu todo.
```

**Qué salió:** fue un solo mensaje, con la lección pegada en medio; hasta la revisión del PR aparecía aquí partido en dos bloques y sin decir qué se pegó. El orquestador creó `pipeline-RLL` desde `s13/start` (`82f61e6`) y midió la línea de partida: `make test` daba `Tests  69 passed (69)`; `ls .github/workflows backend/Dockerfile .railway` confirmó que no había imagen ni infraestructura, pero en `.github/workflows` había tres workflows y no los dos que dice el enunciado, porque también está `chromatic.yml`; `backend/.env` declara 14 variables (`TZ PORT HOST NODE_ENV LOG_LEVEL APP_KEY APP_URL SESSION_DRIVER DB_HOST DB_PORT DB_USER DB_PASSWORD DB_DATABASE DB_RO_PASSWORD`). Escribió los prompts de la parte A y de la parte B con las restricciones del enunciado y los lanzó, cada uno en una sesión nueva del CLI abierta en la raíz del repositorio, con permisos acotados: el agente podía leer, editar, compilar y commitear, pero no ejecutar `docker` ni `make`, porque el enunciado pide que construir y arrancar la imagen y validar el pipeline lo haga la persona. Esos pasos los ejecutó el orquestador después, en el orden del enunciado. Lo que escribió el agente se commiteó tal cual, sin retoques, porque el agente no hizo ningún commit.

---

## Prompt 2 · Parte A, la imagen

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), el que el CLI usa por defecto con la cuenta
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz (`claude -p --permission-mode acceptEdits`, con `Read`, `Edit`, `Write`, `Glob`, `Grep`, órdenes de lectura, `npm run build`, `git add` y `git commit` permitidos, y `docker`, `make`, `git push` y `gh` denegados), sesión nueva lanzada desde la raíz del repositorio en la rama `pipeline-RLL`

```
Empaqueta la API del backend en una imagen de Docker que se construya desde cero. Necesito tres cosas.

1. Un `backend/Dockerfile` multietapa, con dos etapas. La de construcción parte de Node 24, la misma línea que exige el proyecto, instala todas las dependencias con `npm ci` y ejecuta `npm run build`, que deja la aplicación compilada en `build/`. La final parte de una imagen de Node 24 lo más pequeña posible y lleva solo `build/`, con las dependencias de producción instaladas dentro de `build/` con `npm ci --omit=dev`, que es como AdonisJS documenta su despliegue. A la imagen final no viajan ni el código fuente, ni las dependencias de desarrollo, ni ningún `.env`. Corre como un usuario sin privilegios, expone el 3333 y arranca con `node bin/server.js`. Ninguna variable de entorno con valor dentro del Dockerfile: la configuración entra al arrancar el contenedor, no al construir la imagen.

2. Un `backend/.dockerignore` que deje fuera `node_modules`, `build`, `tmp` y cualquier `.env`.

3. Tres atajos en el `Makefile` de la raíz, con estos nombres y no otros. `image` construye la imagen con la etiqueta `flowsync-api:local`. `image-run` la arranca en segundo plano con el nombre de contenedor `flowsync-api-local`, publica el puerto `IMAGE_PORT` (por defecto 3334) sobre el 3333 del contenedor, le pasa `backend/.env` como fichero de entorno y fuerza encima tres valores: `HOST=0.0.0.0`; `DB_HOST=host.docker.internal`, porque dentro del contenedor `localhost` es el propio contenedor; y `APP_URL=http://localhost:<IMAGE_PORT>`, porque Docker no expande el `${HOST}:${PORT}` que usa ese fichero. Después termina con un `curl -s` a la raíz del puerto publicado. `image-stop` para y borra el contenedor.

No construyas ni arranques la imagen: eso lo hago yo después, a mano.
```

**Qué salió:** a la primera: 9 llamadas, 39 segundos y 0,43 USD. Dos órdenes se le denegaron (una escritura por shell y un `make -n`), y las rehízo con `Write` y `Edit`. Dos etapas sobre `node:24-alpine`, usuario `node`, ningún `ENV`, y tres cosas por su cuenta: `--add-host=host.docker.internal:host-gateway`, un `sleep 3` antes del `curl` y la línea `# syntax=`. No hizo commit: queda en `1a10e41`. Después, a mano y en el orden del enunciado: `make image` construyó en 35 segundos (436 MB en disco, 100 MB comprimida); `docker run --rm flowsync-api:local` murió en 1,5 segundos reclamando 12 variables; `make image-run`, con la base de desarrollo levantada, respondió `{"hello":"world"}`; y `make image-stop` lo paró y lo borró. No hizo falta ninguna corrección.

---

## Prompt 3 · Parte B, el pipeline

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz, en otra sesión nueva sobre la misma rama, con los mismos permisos que el Prompt 2 más `git ls-remote` y lectura web de GitHub para resolver los SHA por red; `curl`, `docker` y `make` denegados

```
Escribe el pipeline del repositorio: `.github/workflows/ci.yml` y un atajo `ci-lint` en el `Makefile` de la raíz.

`ci-lint` valida todos los workflows de `.github/workflows/` con actionlint sin instalar nada: usa su imagen oficial de Docker, `rhysd/actionlint:1.7.12`, montando la raíz del repositorio y con `-color`.

El workflow tiene cinco trabajos, y cada uno responde a una sola pregunta:

1. `test`: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con la imagen `pgvector/pgvector:pg17`, publicado en el puerto 54411, que es el que espera `backend/.env.test` (usuario `flowsync`, contraseña `flowsync`, base `flowsync_test`), y esperando a que esté sano. Ejecuta exactamente `make test`, el mismo comando que corro en mi máquina, sin ningún `node ace` a mano. Las variables que exige `backend/start/env.ts` y que no están en `.env.test` van en el entorno del trabajo, como hace `openapi.yml`.
2. `image`: ¿el artefacto se puede fabricar desde cero? `make image`, sin arrancar el contenedor. Este trabajo afirma que la imagen se construye, no que arranque, y ese límite tiene que quedar escrito en un comentario.
3. `lint-workflows`: ¿los propios archivos del pipeline son válidos? `make ci-lint`.
4. `infra-plan`: ¿qué cambiaría en la infraestructura si este cambio se fusiona? Solo en pull requests que toquen `.railway/**`, y solo si el pull request viene del propio repositorio y no de un fork, porque un fork no recibe los secretos. Con la acción oficial `railwayapp/config` en su versión `v1.2.0`, `command: plan` y el token en el secreto `RAILWAY_TOKEN`, para que el plan se publique como comentario del pull request.
5. `infra-apply`: el mismo plan, con `command: apply`, solo cuando el pull request se fusiona.

Reglas para todo el archivo: permisos mínimos declarados en cada trabajo, nunca `write-all`. Cada acción de terceros fijada al SHA completo de su commit, con la etiqueta de versión en un comentario al lado, y cada SHA resuelto por red, no de memoria. `test`, `image` y `lint-workflows` corren en paralelo. Si llega otro push a la misma rama, se cancela la ejecución anterior. El recuento de tests se publica en el resumen de la ejecución, no en un `echo` que se pierde en el registro. Sigue el estilo de los workflows que ya hay en `.github/workflows/`.

No escribas la carpeta `.railway/` ni pongas ningún secreto en ningún archivo. `make ci-lint` lo ejecuto yo después.
```

**Qué salió:** a la primera: 19 llamadas, 122 segundos y 0,66 USD, con Sonnet y algo de Haiku para leer páginas. Se le denegaron cinco órdenes (`gh api`, `curl`, un `git fetch`, un `grep` compuesto y un `python3`), y las rehízo con `git ls-remote`, `WebFetch` y `Edit`. Los tres SHA coinciden con los que devuelve la red. Por su cuenta vio que `make test` levanta `docker compose up db db-test`, que en CI chocaría en el 54411 con el contenedor de servicio, y añadió `DB_SERVICES` a `db-up`. No hizo commit: queda en `a054ea2`. `make ci-lint`, ejecutado después a mano, se quedó en silencio con código 0. Al revisarlo vi que el paso `make test 2>&1 | tee` no declaraba `shell:`, y una simulación local del trabajo `test` con un test en rojo a propósito lo confirmó: el paso salía con 0. Eso pedí corregir en el Prompt 4.

---

## Prompt 4 · Parte B, corrección del paso de la suite

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz, en otra sesión nueva sobre la misma rama, solo con `Read`, `Edit`, `Glob`, `Grep`, órdenes de lectura y `git`

```
En `.github/workflows/ci.yml`, el paso «Correr la suite» del trabajo `test` ejecuta `make test 2>&1 | tee "$RUNNER_TEMP/test.log"` sin declarar `shell:`. En GitHub Actions, un `run` sin `shell:` se ejecuta con `bash -e {0}`, sin `pipefail`, así que el paso termina con el código de `tee` y el trabajo sale en verde aunque fallen los tests. Lo he reproducido en local: con un test en rojo, ese paso sale con 0. El comentario que dice que el `bash` de Actions activa `pipefail` es falso. Corrígelo sin cambiar el comando, que sigue siendo `make test`, y corrige también el comentario. No toques nada más.
```

**Qué salió:** a la primera: 3 llamadas, 11 segundos y 0,31 USD. Añadió `shell: bash` al paso y corrigió el comentario, sin tocar nada más. `make ci-lint` siguió en silencio con código 0. Queda en `2ef9cd4`.

---

## Prompt 5 · la instrucción al orquestador tras la revisión del PR

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión de Claude Code Desktop que el Prompt 1

```
Sí, aplica los tres ajustes al PR #38
```

**Qué salió:** era la respuesta a una pregunta del orquestador. Había leído la revisión del PR y propuesto aplicar los dos ajustes importantes (la tubería de `gh api` en `infra-plan` e `infra-apply` y la versión completa en los comentarios de las acciones) y uno de los opcionales (la caché de npm). Antes de escribir el prompt al agente, comprobó con `git ls-remote --tags` que los SHA fijados son la `v7.0.1` de `actions/checkout` y la `v7.1.0` de `actions/setup-node`. Luego reprodujo el fallo: sacó los dos pasos tal cual del `ci.yml` y los ejecutó con un `gh` falso, con `bash -e`, como los ejecuta Actions, y con `bash -eo pipefail`, como los ejecutaría con `shell: bash`. Si `gh` sale con 1, los dos pasos salen con 0 y `touched=false` en los dos shells. Con `pipefail`, además, una lista larga que empieza por `.railway/` da `touched=false` por SIGPIPE.

---

## Prompt 6 · los ajustes de la revisión

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz, en otra sesión nueva sobre la misma rama, solo con `Read`, `Edit`, `Glob`, `Grep` y órdenes de lectura; `git add`, `git commit`, `git push`, `gh`, `docker`, `make` y `curl` denegados

```
La revisión del pull request pide tres ajustes sobre lo que ya está escrito. Aplícalos y no toques nada más.

1. En `.github/workflows/ci.yml`, el paso «¿Toca el PR .railway/**?» de `infra-plan` y el paso «¿Tocó el PR .railway/**?» de `infra-apply` meten `gh api ... | grep -q '^\.railway/'` en la condición de un `if`. Si `gh api` falla (permisos, límite de peticiones, red), el `if` lo lee como «no toca `.railway/`», escribe `touched=false` y el trabajo sale en verde: en `infra-apply` eso es no aplicar la infraestructura sin avisar. Lo he reproducido en local con un `gh` falso que sale con 1: los dos pasos salen con 0 y `touched=false`. Declarar `shell: bash` no lo arregla: dentro de la condición de un `if`, `-e` no aborta aunque haya `pipefail`; y cuando `grep -q` encuentra la línea y cierra la tubería antes de que `gh` termine de escribir, `gh` muere por SIGPIPE y el `if` da falso aunque el PR sí toque `.railway/`. También eso lo he reproducido. En los dos pasos, guarda primero la lista en una variable con `files=$(gh api ...)`, con los mismos argumentos, y busca después con `grep -q '^\.railway/' <<<"$files"`, para que un fallo de `gh api` aborte el paso.

2. En el mismo fichero, los comentarios de versión de `actions/checkout` y `actions/setup-node` dicen `# v7`, que es una etiqueta móvil. Los SHA no cambian: `3d3c42e5aac5ba805825da76410c181273ba90b1` es la `v7.0.1` de `actions/checkout` y `949feb2413d6458794dcd2491c4babbbce0c15c1` es la `v7.1.0` de `actions/setup-node`; lo he comprobado con `git ls-remote --tags`. Cambia esos comentarios a la versión completa.

3. En `backend/Dockerfile`, el `npm ci --omit=dev` de la etapa final deja 28 MB de caché de npm en `/home/node/.npm`. Bórrala en la misma capa con `npm cache clean --force`.

No construyas la imagen y no hagas commit: eso lo hago yo después.
```

**Qué salió:** 8 llamadas, 30 segundos y 0,37 USD, sin órdenes denegadas. Aplicó los tres ajustes, pero se le coló un cambio que no le pedí y que no mencionó en su respuesta: en los dos mensajes que esos pasos escriben en el resumen quitó el espacio antes de `.railway/**`, y quedaron «El PR no toca.railway/**» y «El PR no tocó.railway/**». Lo vi con `git diff --word-diff`. Devolverlo es el Prompt 7.

---

## Prompt 7 · devolver el espacio que quitó el Prompt 6

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** la misma que el Prompt 6, en otra sesión nueva

```
En `.github/workflows/ci.yml` hay dos cambios sin commitear que no pedí: en los mensajes que los pasos de `infra-plan` e `infra-apply` escriben en `$GITHUB_STEP_SUMMARY` ha desaparecido el espacio antes de `.railway/**`, y ahora dicen «El PR no toca.railway/**» y «El PR no tocó.railway/**». Devuélveles el espacio. No toques nada más y no hagas commit.
```

**Qué salió:** 4 llamadas, 18 segundos y 0,32 USD. Se le denegó un `sed -i` y lo rehízo con `Edit`. El diff quedó solo con los tres ajustes. Después, a mano:

- `make ci-lint` siguió en silencio, con código 0.
- La misma simulación de los dos pasos: si `gh` falla, ahora salen con 1. En los demás casos dan el `touched` correcto, también con la lista larga y con `pipefail`.
- `make image` construyó en 66 segundos una imagen de 388 MB en disco y 81 MB comprimida, frente a 436 y 100. `/home/node/.npm` pasa de 28 MB a 200 KB. La comparación no es solo de la caché: la reconstrucción trajo Node 24.22.2 en lugar de 24.22.1.
- `make image-run`, con la base de desarrollo levantada, respondió `{"hello":"world"}`, y `make image-stop` lo paró y lo borró.

Queda en `50f20c5` (el `ci.yml`) y `0a0f13e` (el `Dockerfile`).

---

## Prompt 8 · la instrucción al orquestador para anotar el fallo de OpenAPI

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión de Claude Code Desktop que el Prompt 1

```
continua.
```

**Qué salió:** respondía a la oferta del orquestador de anotar en `HALLAZGOS.md` y en la descripción del PR que `npm run openapi:check` falla desde `s13/start`, algo que salió al contrastar la rama con el directo. Lo volvió a medir sobre `71d72cb`: sale con 1. En un worktree aparte, con `jsonschema` fijado a 1.4.1 con `overrides`, como en `s13/end`, sale con 0. Lo anotó al final del punto 3 de `HALLAZGOS.md`. En ese momento solo se anotó; el `overrides` lo aplicó después el Prompt 10.

---

## Prompt 9 · la instrucción al orquestador para aplicar el `overrides` y cerrar los pendientes

**Modelo:** Opus 5.5 (`claude-opus-5-5`)
**Herramienta:** la misma sesión de Claude Code Desktop que el Prompt 1

```
Sí, aplica el overrides al PR y continua con todos los pendientes que tengas.
```

**Qué salió:** el orquestador escribió el Prompt 10 para el `overrides`. Como pendientes, aplicó dos opcionales de la revisión que dependían solo de los documentos: decir entre corchetes qué se pegó en el Prompt 1, y partir los puntos de `HALLAZGOS.md` en viñetas, con la línea de cada punto en la primera. El tercero, proteger `infra-apply` con un Environment de GitHub con aprobación, queda para cuando haya despliegue, como dice la revisión: hoy no hay `.railway/` ni `RAILWAY_TOKEN`, y las reglas de aprobación se configuran en el repositorio, no en el workflow.

---

## Prompt 10 · fijar `jsonschema` a 1.4.1

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`)
**Herramienta:** Claude Code CLI 2.1.312 en WSL, sin interfaz, en otra sesión nueva sobre la misma rama, con `Read`, `Edit`, `Glob`, `Grep`, órdenes de lectura y `npm install`; `npm run`, `git add`, `git commit`, `git push`, `gh`, `docker`, `make` y `curl` denegados

```
En `backend`, `npm run openapi:check` sale con 1 y `Invalid command exported from "openapi_check.js" file. Invalid URL`. Viene de la rama de partida: `backend/package-lock.json` instala `jsonschema` 1.5.0, que llega a través de `@adonisjs/core` y `@adonisjs/ace`. Lo he comprobado en una copia aparte de la rama: con `jsonschema` fijado a 1.4.1 mediante `overrides` en `backend/package.json`, la orden sale con 0 y dice que `docs/api/openapi.json` está al día.

Añade a `backend/package.json` un bloque `overrides` que fije `jsonschema` a `1.4.1`, y actualiza `backend/package-lock.json` con `npm install`, para que `npm ci` instale esa versión. No cambies ninguna otra dependencia ni ningún otro fichero. No ejecutes `openapi:check` ni los tests y no hagas commit: eso lo hago yo después.
```

**Qué salió:** 9 llamadas, 53 segundos y 0,38 USD. Se le denegaron dos órdenes que hacían `cd` antes de una orden de git, y las rehízo con `Grep` y con `npm install --prefix` sobre `backend`, `--package-lock-only` e `--ignore-scripts`. Añadió el bloque `overrides`, y el lockfile cambia solo en la entrada de `jsonschema`, que pasa a colgar de `@adonisjs/ace` en la 1.4.1. Después, a mano:

- `npm ci` desde el lockfile, y `npm ls jsonschema` da 1.4.1.
- `openapi:check` sale con 0 y dice que `docs/api/openapi.json` está al día.
- `make test` da `Tests 69 passed (69)`.
- `npm audit --omit=dev` sigue en 23: una crítica, una alta, 19 moderadas y 2 bajas.
- `make image` construye con la 1.4.1 dentro, y `make image-run` responde `{"hello":"world"}`.

Queda en `5211dd2`.
