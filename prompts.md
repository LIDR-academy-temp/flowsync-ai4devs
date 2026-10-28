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

## Cómo se lanzaron

Lancé los tres prompts desde la raíz del repo, en la rama `pipeline-gt`, en una sola sesión de
Claude Code con la config aislada (`CLAUDE_CONFIG_DIR=~/.claude-aislado claude`). Esa config no
carga mi `CLAUDE.md` global ni mis hooks, así que el agente solo tenía lo del proyecto. Los
prompts los preparé con otra sesión de Claude a partir del enunciado y los lancé tal cual.

Antes del primer prompt medí la línea de partida en `s13/start` (`82f61e6`):

- `make test`: 69 tests pasan en 6 s.
- `ls .github/workflows backend/Dockerfile .railway`: no existen `backend/Dockerfile` ni
  `.railway/`. Workflows hay tres, no dos como dice el enunciado: `chromatic.yml`, `openapi.yml`
  y `revisor.yml`. Los tres fijan sus acciones por etiqueta (`@v7`), no por SHA.
- `backend/.env` tiene 14 variables: `TZ PORT HOST NODE_ENV LOG_LEVEL APP_KEY APP_URL
  SESSION_DRIVER DB_HOST DB_PORT DB_USER DB_PASSWORD DB_DATABASE DB_RO_PASSWORD`.
- `make test` depende de `migrate`, que depende de `db-up`, que levanta `db` y `db-test` con
  `docker compose`. No lo puse en el prompt de la parte B para ver si el agente lo encontraba.

---

# Parte A: la imagen

## Prompt 1

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.312 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)

```
Quiero empaquetar la API en una imagen de Docker. Armá backend/Dockerfile multietapa, backend/.dockerignore y tres atajos en el Makefile de la raíz.

Dockerfile:
- Etapa de build: Node 24 (la misma línea que exige el proyecto), npm ci con todas las dependencias y npm run build, que deja la app compilada en build/.
- Etapa final: la imagen base de Node 24 más chica posible, con solo build/ y, adentro de build/, las dependencias de producción (npm ci --omit=dev). Ni código fuente, ni dependencias de desarrollo, ni ningún .env en la imagen final.
- Corre con un usuario sin privilegios, expone el 3333 y arranca con node bin/server.js.
- Ninguna variable de entorno con valor en el Dockerfile: la configuración entra al arrancar el contenedor.

.dockerignore: node_modules, build, tmp y cualquier .env.

Makefile:
- image: construye la imagen con la etiqueta flowsync-api:local.
- image-run: la arranca en segundo plano con el nombre flowsync-api-local, publica IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, le pasa backend/.env como fichero de entorno y fuerza HOST=0.0.0.0, DB_HOST=host.docker.internal y APP_URL=http://localhost:<IMAGE_PORT>. Al final hace curl -s a la raíz del puerto publicado.
- image-stop: para y borra el contenedor.

No construyas la imagen ni arranques el contenedor: eso lo hago yo.
```

**Qué salió:** Antes de escribir miró cómo copia ficheros `node ace build`. Escribió los tres
archivos con `Write` y `Update`, no con `Bash` como en el módulo anterior. El Dockerfile cumple
todo: dos etapas sobre `node:24-alpine`, primero los manifiestos y después el código para
aprovechar la caché, `npm ci --omit=dev` dentro de `build/`, `USER node`, `EXPOSE 3333` y ni un
`ENV`. Por su cuenta agregó `--chown=node:node`, `.env.*` en el `.dockerignore`, una guarda si
falta `backend/.env` y un `curl` con `--retry-connrefused`. Lo declaró todo. También avisó que en
Linux `host.docker.internal` no resuelve sin `--add-host`. No construyó nada y no hizo commit,
aunque el `CLAUDE.md` pide commitear en cada petición. Lo commiteé yo. 1 min 44 s.

Después corrí yo los comandos:

- `make image`: 29,4 s la primera vez. El `npm ci` completo tardó 12,7 s.
- `docker images flowsync-api:local`: 378 MB.
- `docker run --rm flowsync-api:local`: murió al instante con un `EnvValidationException` y 12
  variables faltantes. La lista literal está en `HALLAZGOS.md`.
- Dentro de la imagen no hay ningún `.env` y corre como `node`. Pero `/app` trae `tests/`
  compilados y 82 sourcemaps: `node ace build` los deja en `build/` y se copió `build/` entero.
- `make image-run` con la base levantada: ❌ "Sin respuesta en el puerto 3334". El contenedor
  estaba arriba y un `curl` a mano respondía `{"hello":"world"}`. Lo reproduje: el primer `curl`
  sale con código 56 (conexión reseteada), porque Docker Desktop acepta la conexión antes de que
  Node escuche y después la corta. `--retry-connrefused` solo reintenta "connection refused", así
  que el retry nunca actuaba.

## Prompt 2

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.312 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** la misma que el Prompt 1

Es una corrección: el atajo `image-run` no funcionaba. No le di la solución, solo el síntoma.

```
make image-run arranca el contenedor pero termina con "Sin respuesta en el puerto 3334". El contenedor está arriba (en docker logs dice "started HTTP server on 0.0.0.0:3333") y un curl a mano unos segundos después responde {"hello":"world"}. El curl del atajo sale con código 56 en el primer intento y no reintenta. Corregí image-run para que espere de verdad a que el servidor responda. No toques el Dockerfile ni corras nada.
```

**Qué salió:** Diagnosticó bien el 56 y cambió el `curl --retry` por un bucle que prueba una vez
por segundo, hasta 30 s, y corta antes si el contenedor se cae. Encontró solo un bug que yo no
había visto: cuando no había respuesta, el atajo imprimía el ❌ pero salía con 0, así que un
fallo pasaba como éxito. Ahora sale con `exit 1`. No lo probó (se lo pedí) y no hizo commit.
`make image-run` respondió `{"hello":"world"}` y `make image-stop` lo paró. 18 s.

---

# Parte B: el pipeline

## Prompt 3

**Modelo:** Sonnet 5.5 (`claude-sonnet-5-5`), esfuerzo high
**Herramienta:** Claude Code 2.1.312 (config aislada, `CLAUDE_CONFIG_DIR=~/.claude-aislado`)
**Sesión:** la misma que los prompts 1 y 2

```
Ahora el pipeline. Armá .github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz. Leé antes openapi.yml y revisor.yml y seguí su estilo (comentarios que explican el porqué, concurrency, permisos).

ci-lint: valida todos los workflows de .github/workflows/ con actionlint sin instalar nada, usando la imagen oficial rhysd/actionlint:1.7.12, montando la raíz del repo y con -color.

ci.yml tiene cinco trabajos, cada uno responde a una pregunta:

1. test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con pgvector/pgvector:pg17 publicado en el 54411, que es lo que espera backend/.env.test (usuario flowsync, contraseña flowsync, base flowsync_test), esperando a que esté sano. Corre exactamente make test, el mismo comando que corro yo, nada de node ace a mano. Las variables que backend/start/env.ts exige y no están en .env.test van en el env del trabajo, como hace openapi.yml.
2. image: ¿la imagen se puede fabricar desde cero? make image, sin arrancar el contenedor. Dejá escrito en un comentario que este trabajo afirma que la imagen se construye, no que arranque.
3. lint-workflows: ¿los archivos del pipeline son válidos? make ci-lint.
4. infra-plan: ¿qué cambiaría en la infraestructura si se fusiona? Solo en pull requests que toquen .railway/** y solo si el PR viene del propio repo y no de un fork, porque un fork no recibe secretos. Usá railwayapp/config v1.2.0 con command: plan y el token en el secreto RAILWAY_TOKEN, para que el plan quede como comentario del PR.
5. infra-apply: el mismo plan con command: apply, solo cuando el PR se fusiona.

Reglas para todo el archivo:
- Permisos mínimos declarados por trabajo, nunca write-all.
- Cada acción de terceros fijada a su SHA de commit completo, con la etiqueta de versión en un comentario al lado. Resolvé cada SHA por red, no de memoria, y decime con qué comando lo resolviste.
- test, image y lint-workflows en paralelo.
- Si llega otro push a la misma rama, se cancela la ejecución anterior.
- El recuento de tests publicado en el resumen de la ejecución (GITHUB_STEP_SUMMARY), no en un echo.
- Ningún secreto con valor en ningún archivo.

No toques los otros workflows ni corras make ci-lint: eso lo hago yo.
```

**Qué salió:** Lo primero que dijo fue que `make test` no cabe con el servicio: `db-up` levanta
otro `db-test` con compose en el mismo 54411 y fallaría con "port is already allocated". Así que
no corrió `make test` literal sino `make -o db-up test`, que salta solo ese paso. Lo declaró como
desviación, lo explicó en un comentario del workflow y me ofreció dos alternativas. Agregó
`npm ci` antes, que `make test` no hace, y puso `NODE_ENV=test` en el job para que el `migrate`
del Makefile apunte a la base de pruebas. Usó `shell: bash` por el `pipefail`, para que el `tee`
no tape un test roto.

Resolvió los SHA con `git ls-remote --tags` y los comprobé yo con el mismo comando: checkout
v7.0.1 `3d3c42e5`, setup-node v7.1.0 `949feb24` y railwayapp/config v1.2.0 `9e17d413`. Todos
coinciden. Leyó el `action.yml` de Railway para sacar el nombre del input del token. Puso
`permissions: {}` arriba y los mínimos por trabajo. El filtro de `.railway/**` no lo hizo con
`paths:`, porque eso apagaría los otros tres trabajos. Lo hizo con un paso que consulta los
archivos del PR. Él mismo avisó que `railwayapp/config` usa por dentro acciones sin SHA. No tocó
los otros workflows, no corrió `ci-lint` y no hizo commit. Lo commiteé yo. 2 min 52 s.

Después corrí `make ci-lint; echo "exit=$?"`: en silencio y `exit=0`. Con `-verbose` comprobé que
revisó los cuatro workflows y no encontró errores. Ese verde incluye a los tres que usan `@v7`, así
que actionlint no comprueba que las acciones estén fijadas a SHA.
