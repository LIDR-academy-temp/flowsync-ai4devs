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

## Prompt 1

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code (modo plan)

```
Voy a empaquetar el backend en una imagen de Docker. Antes de escribir nada, quiero que explores y me respondas. En este prompt no crees ni modifiques ningún archivo.

Contexto de mi máquina: Windows 11 con Git Bash (no WSL) y Docker Desktop. Las dos bases de datos ya están levantadas con make db-up.

Responde a esto citando archivo:línea en cada respuesta. No lo deduzcas de los nombres ni de memoria: el stack va en versiones más nuevas que tu documentación, así que si hace falta comprueba en backend/node_modules.

1. Qué variables de entorno valida backend/start/env.ts al arrancar, cuáles están declaradas como secreto, y cuáles de backend/.env no están en ese esquema. Solo los nombres, nunca los valores.
2. Qué deja exactamente `npm run build` (node ace build) en backend/build/: si copia package.json y package-lock.json, qué hace con .adonisjs/, y cuál es el punto de entrada que se ejecuta en producción.
3. Si en tiempo de ejecución la aplicación lee o escribe algo fuera de build/ (por ejemplo ../docs, tmp/, o regenerar .adonisjs/ al arrancar), y si eso puede fallar con un usuario sin privilegios.
4. Qué versión de Node exige el proyecto y dónde está declarada.
5. Si hay dependencias nativas o del sistema operativo que en mi máquina ya están y en una imagen vacía habría que instalar.

Termina con una lista de riesgos para el Dockerfile, de más a menos probable. Nada más.
```

**Qué salió:** exploración sin tocar archivos; sirvió de base para el prompt 2.

## Prompt 2

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Escribe la imagen del backend. Trabaja en la rama actual, pipeline-MC; no crees otra.

Archivos a crear o tocar: backend/Dockerfile, backend/.dockerignore y el Makefile de la raíz (tres atajos nuevos). Nada más.

Restricciones del Dockerfile (no negociables):
- Multietapa, con dos etapas.
- Etapa de construcción: Node 24, la misma línea que exige el proyecto; `npm ci` con todas las dependencias y `npm run build`, que deja la aplicación compilada en build/.
- Etapa final: imagen base de Node 24 lo más pequeña posible. Solo viaja build/, y dentro de build/ se instalan las dependencias de producción con `npm ci --omit=dev`, que es como AdonisJS documenta su despliegue. Ni el código fuente, ni las dependencias de desarrollo, ni ningún .env llegan a la imagen final.
- Ordena las capas para aprovechar la caché: primero lo que declara las dependencias y su instalación, después el código.
- Corre como usuario sin privilegios, expone el 3333 y arranca con `node bin/server.js`.
- Ninguna variable de entorno con valor dentro del Dockerfile (ni ENV ni ARG con valor por defecto). La configuración entra al arrancar el contenedor, no al construir la imagen.

.dockerignore: deja fuera node_modules, build, tmp y cualquier .env (incluidos .env.test y variantes).

Atajos del Makefile, con estos nombres exactos, que salgan en `make help` y que sigan el estilo del Makefile (un comentario encima de cada receta que explique el porqué):
- image: construye la imagen con la etiqueta flowsync-api:local.
- image-run: la arranca en segundo plano con el nombre de contenedor flowsync-api-local, publicando el puerto IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, con backend/.env como fichero de entorno y forzando encima tres valores: HOST=0.0.0.0, DB_HOST=host.docker.internal (dentro del contenedor localhost es el propio contenedor) y APP_URL=http://localhost:<IMAGE_PORT> (Docker no expande el ${HOST}:${PORT} que usa ese fichero). Termina con un curl -s a la raíz del puerto publicado.
- image-stop: para y borra el contenedor.
Los atajos tienen que funcionar en mi máquina (Windows con Git Bash y Docker Desktop) y en macOS/Linux.

No construyas ni arranques la imagen: make image, docker run y make image-run los lanzo yo después, y lo que salga es el dato que tengo que apuntar.

Al terminar:
1. Lista de archivos creados o modificados, una línea por archivo explicando por qué.
2. Una lista aparte con todo lo que hayas añadido por tu cuenta y no estaba en mis restricciones (instrucciones, paquetes del sistema, variables, flags, usuario), y por qué lo consideraste necesario.
3. Commit en pipeline-MC. No incluyas los cambios de solo finales de línea de backend/.adonisjs ni de backend/database/schema.ts.
```

**Qué salió:** funcionó a la primera (commit `be93e0a`). `make image` construyó en 29,9 s, `make image-run` respondió `{"hello":"world"}` y no hizo falta pedir ninguna corrección. Por su cuenta añadió `npm cache clean --force`, `--add-host=host.docker.internal:host-gateway`, `MSYS_NO_PATHCONV=1`, borrar un contenedor anterior antes de arrancar y un `curl` con reintentos.

## Prompt 3

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code (modo plan)

```
Ahora voy a escribir el pipeline del repositorio. Antes, explora y respóndeme. En este prompt no crees ni modifiques ningún archivo.

1. Lee .github/workflows/openapi.yml, revisor.yml y chromatic.yml y resúmeme su estilo: comentarios, permisos, concurrency, cómo fijan las acciones, timeouts y cómo tratan los pull requests que llegan desde un fork.
2. Sigue la cadena completa de `make test` en el Makefile (y todo lo que encadena) y dime qué haría paso a paso en un runner ubuntu-latest limpio, sin backend/.env, con un contenedor de servicio pgvector/pgvector:pg17 publicado en el 54411: qué contenedores intenta levantar y en qué puertos, contra qué base migra cada paso y con qué variables. Si algo choca con el contenedor de servicio o depende de un archivo que en el runner no existe, dímelo con archivo:línea. Todavía no lo arregles.
3. Qué variables exige backend/start/env.ts que no están en backend/.env.test. Solo los nombres.
4. Resuelve por red, no de memoria, el SHA de commit completo de: la última versión estable de actions/checkout, la de actions/setup-node, y railwayapp/config en la etiqueta v1.2.0. Usa `git ls-remote` y, si la etiqueta es anotada, el commit al que apunta (`^{}`). Pega la salida de los comandos.
5. Lee el action.yml de railwayapp/config en ese SHA y dime qué entradas acepta (el nombre exacto de la del comando y de la del token), si publica el plan como comentario del PR por sí sola y qué permisos del GITHUB_TOKEN necesita para hacerlo.

Termina con los riesgos que ves para el pipeline. Nada más.
```

**Qué salió:** exploración sin tocar archivos. Los SHA que resolvió (checkout v7.0.1, setup-node v7.1.0, railwayapp/config v1.2.0) coinciden con `git ls-remote`, y el choque de `make test` con el contenedor de servicio en el 54411 quedó resuelto en el prompt 4.

## Prompt 4

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Escribe el pipeline con lo que encontraste en la exploración. Archivos: .github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz. Si hace falta tocar alguna receta existente del Makefile, solo la mínima, explicada en un comentario. Trabaja en pipeline-MC.

Atajo ci-lint: valida todos los workflows de .github/workflows/ con actionlint sin instalar nada, usando la imagen oficial de Docker rhysd/actionlint:1.7.12, montando la raíz del repositorio y con -color. Tiene que funcionar con el mismo comando en mi máquina (Windows con Git Bash: ojo con la conversión de rutas de MSYS en -v y -w) y en ubuntu-latest. Que salga en make help.

ci.yml, con cinco trabajos. Cada uno empieza con un comentario que dice a qué pregunta responde y qué NO afirma:
1. test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con la imagen pgvector/pgvector:pg17 publicada en el puerto 54411, que es lo que ya espera backend/.env.test (usuario flowsync, contraseña flowsync, base flowsync_test), con healthcheck y esperando a que esté sano. El paso de pruebas es exactamente `make test`, el mismo comando que corro en mi máquina; ningún `node ace` a mano. Las variables que exige backend/start/env.ts y no están en .env.test van en el env del trabajo, como hace openapi.yml, con valores que no son secretos. Si `make test` choca en el runner con el contenedor de servicio, como viste en la exploración, resuélvelo con el cambio mínimo en el Makefile que no cambie lo que `make test` hace en mi máquina.
2. image: ¿el artefacto se puede fabricar desde cero? `make image`. Sin arrancar el contenedor, y con ese límite escrito en un comentario: este trabajo afirma que la imagen se construye, no que arranque.
3. lint-workflows: ¿los propios archivos del pipeline son válidos? `make ci-lint`.
4. infra-plan: ¿qué cambiaría en la infraestructura si este cambio se fusiona? Solo en pull requests que toquen .railway/** y solo si el pull request viene del propio repositorio y no de un fork, porque un fork no recibe los secretos. Con la acción railwayapp/config en v1.2.0, command: plan y el token en el secreto RAILWAY_TOKEN, para que el plan se publique como comentario del pull request.
5. infra-apply: el mismo plan con command: apply, solo cuando el pull request se fusiona.

Reglas para todo el archivo:
- Permisos mínimos declarados por trabajo, y a nivel de workflow nada más que lectura; nunca write-all.
- Cada acción de terceros fijada a su SHA de commit completo, con la etiqueta de versión en un comentario al lado. Usa los SHA que resolviste por red en la exploración, no otros.
- test, image y lint-workflows en paralelo, sin needs entre ellos.
- La ejecución anterior se cancela si llega otro push a la misma rama.
- Caché de npm con clave del package-lock.json del backend, como openapi.yml.
- El recuento de tests se publica en el resumen de la ejecución ($GITHUB_STEP_SUMMARY), no en un echo que se pierde en el registro, y sin tragarse el código de salida: si un test falla, el trabajo tiene que seguir poniéndose rojo.
- timeout-minutes en cada trabajo.
- Ningún secreto con valor en ningún archivo: RAILWAY_TOKEN solo se referencia.
- No crees la carpeta .railway/ ni ningún archivo de infraestructura, y no pidas ningún plan a ninguna plataforma.

No ejecutes make ci-lint: lo lanzo yo y lo que diga es el dato.

Al terminar: lista de archivos creados o modificados con una línea de por qué, una lista aparte de lo que añadiste por tu cuenta y no te pedí, y commit en pipeline-MC.
```

**Qué salió:** funcionó a la primera (commit `16718f5`). `make ci-lint` se quedó en silencio con código 0 y no hizo falta corrección. Para el choque del 54411, `db-up` y `migrate` cambian de comportamiento cuando `CI=true`. Por su cuenta añadió `persist-credentials: false`, el filtro de `.railway/` por la API (en vez de `paths:`), que el evento `closed` no cancele la ejecución en curso, y `shell: bash` (pipefail) para que el `tee` no se trague el código de salida.
