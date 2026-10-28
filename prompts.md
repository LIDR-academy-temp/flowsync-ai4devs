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

## Prompt 0 — Preparar los prompts a partir del enunciado

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
con respecto al entorno local, lo tengo habilitado (docker, node, make, etc). Ya tengo la rama de trabajo creada, se llama pipeline-marco-bello. Necesito que leas el documento, y que primero me indiques los prompts que deberia lanzar, la idea es que yo tome esos prompt y luego te los pase para su ejecución, debes guardar cada instrucción en el archivo prompts.md
```

**Qué salió:** el agente leyó el .docx del enunciado y redactó en este archivo los prompts 1 a 6;
los de corrección (2 y 4) quedaron como plantilla para rellenar con el error real.

---

## Prompt 1 — Parte A: la imagen

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Parte A del ejercicio de la sesión 13. Trabaja en la rama pipeline-marco-bello. Esto es infraestructura
de empaquetado, no una capability nueva: no hay endpoints, ni tests de contrato, ni OpenAPI que tocar.

Escribe backend/Dockerfile (multietapa), backend/.dockerignore y tres atajos en el Makefile de la raíz.

Dockerfile, dos etapas:
- Construcción: Node 24 (la misma línea que exige el proyecto), npm ci con todas las dependencias y
  npm run build, que deja la aplicación compilada en build/.
- Final: la imagen base de Node 24 más pequeña posible. Solo viaja build/, y dentro de build/ las
  dependencias de producción (npm ci --omit=dev), como documenta AdonisJS su despliegue. Ni código
  fuente, ni dependencias de desarrollo, ni ningún .env en la imagen final.
- Corre como usuario sin privilegios, expone el 3333 y arranca con node bin/server.js.
- Ninguna variable de entorno con valor dentro del Dockerfile: la configuración entra al arrancar el
  contenedor, no al construir la imagen.

.dockerignore: deja fuera node_modules, build, tmp y cualquier .env.

Atajos del Makefile, con estos nombres exactos y documentados con ## como el resto:
- image: construye la imagen con la etiqueta flowsync-api:local.
- image-run: la arranca en segundo plano con el nombre de contenedor flowsync-api-local, publicando
  el puerto IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, con --env-file backend/.env y
  forzando encima HOST=0.0.0.0, DB_HOST=host.docker.internal y APP_URL=http://localhost:$(IMAGE_PORT)
  (Docker no expande el ${HOST}:${PORT} de ese fichero). Termina con un curl -s a la raíz del puerto
  publicado. Ten en cuenta que estoy en Linux/WSL: host.docker.internal puede necesitar
  --add-host=host.docker.internal:host-gateway.
- image-stop: para y borra el contenedor.

Una sola pasada: escribe los archivos y para. NO ejecutes make image, docker run ni make image-run;
los lanzo yo a mano para apuntar lo que salga. Al terminar, dime qué has añadido por tu cuenta que no
te haya pedido y por qué. Commitea en esta rama.
```

Lanzado con: `descarta el cambio de .env.example y lanza el prompt 1`

**Qué salió:** a la primera, Dockerfile, .dockerignore y los tres atajos (commit f95acad). Añadió
por su cuenta reintentos al curl, `npm cache clean`, el `chown` de /app y el orden de capas para la
caché. `make image` construyó; `make image-run` falló con Error 56 (ver prompt 2).

> Después, a mano y en este orden (no son prompts):
> 1. `make image` y `docker images flowsync-api:local` → apuntar el tamaño.

   ```text
   IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
   flowsync-api:local   22fc91549bac   388MB        81.1MB
   ```

> 2. `docker run --rm flowsync-api:local` → copiar el mensaje de error entero.

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

> 3. `make image-run` con `make db-up` hecho → tiene que responder `{"hello":"world"}`; si no, `docker logs flowsync-api-local`. Después `make image-stop`.

---

## Prompt 2 — Parte A: corrección de image-run

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

Antes de este prompt le pasé el error tal cual (`ejecute el comando "make image-run" y me dio este
error: d4505453fa0d349b746c3723512bee518187d1533e920963358823f80dc68ae3 make: *** [Makefile:174: image-run] Error 56`);
miró `docker logs` y el puerto, me explicó la causa y me redactó este prompt, que lancé tal cual:

```
make image-run me dio este error:

d4505453fa0d349b746c3723512bee518187d1533e920963358823f80dc68ae3
make: *** [Makefile:174: image-run] Error 56

El contenedor sí arrancó (docker logs: "started HTTP server on 0.0.0.0:3333") y un curl
posterior a localhost:3334 responde {"hello":"world"}. Corrige solo el atajo image-run,
en una sola pasada, y explícame la causa. No ejecutes tú la imagen; la vuelvo a lanzar yo.
```

**Qué salió:** la imagen estaba bien; fallaba el curl del atajo. El proxy de Docker acepta en el
3334 antes de que Node escuche y corta la conexión (curl 56), y `--retry-connrefused` no reintenta
ese caso. Lo cambió por `--retry-all-errors` (commit 6a0208b). Fue una corrección pedida: es un hallazgo.
Al relanzar, `make image-run` dio `Error 125`: el contenedor del primer intento seguía vivo con el mismo
nombre (no había hecho `make image-stop`). Tras `make image-stop`, `make image-run` respondió
`{"hello":"world"}` desde dentro del contenedor.

---

## Prompt 3 — Parte B: el pipeline

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Parte B del ejercicio. Lee primero .github/workflows/openapi.yml y revisor.yml: el workflow nuevo vive
al lado y sigue su estilo.

Escribe .github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz.

ci-lint: valida todos los workflows de .github/workflows/ con actionlint sin instalar nada, usando la
imagen oficial rhysd/actionlint:1.7.12, montando la raíz del repositorio y con -color.

ci.yml, cinco trabajos, uno por pregunta:
- test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con
  pgvector/pgvector:pg17 publicado en el 54411 (usuario flowsync, contraseña flowsync, base
  flowsync_test, lo que espera backend/.env.test), esperando a que esté sano. Ejecuta exactamente
  make test, ni un node ace a mano. Las variables que exige backend/start/env.ts y no están en
  .env.test van en el env del trabajo, como hace openapi.yml. Publica el recuento de tests en
  $GITHUB_STEP_SUMMARY, no en un echo del registro.
- image: ¿el artefacto se puede fabricar desde cero? make image, sin arrancar el contenedor, y un
  comentario que diga que este trabajo afirma que la imagen se construye, no que arranque.
- lint-workflows: ¿los archivos del pipeline son válidos? make ci-lint.
- infra-plan: ¿qué cambiaría en la infraestructura si se fusiona? Solo en pull requests que toquen
  .railway/** y solo si el PR viene del propio repositorio y no de un fork. Acción oficial
  railwayapp/config v1.2.0, command: plan, token en el secreto RAILWAY_TOKEN, para que el plan se
  publique como comentario del PR.
- infra-apply: el mismo, con command: apply, solo cuando el PR se fusiona.

Reglas para todo el archivo:
- Permisos mínimos declarados por trabajo; nunca write-all.
- Cada acción de terceros fijada a su SHA de commit completo, con la etiqueta en un comentario al lado.
  Resuelve cada SHA por red (gh api o git ls-remote) y enséñame el comando y su salida; nada de memoria.
- test, image y lint-workflows en paralelo.
- concurrency que cancele la ejecución anterior si llega otro push a la misma rama.
- Ningún secreto con valor en ningún archivo.

No escribas la carpeta .railway/ ni pidas ningún plan a Railway. Una sola pasada: escribe los archivos
y para; make ci-lint lo lanzo yo. Si aun así lo ejecutas y corriges algo, dímelo explícitamente.
Commitea en esta rama.
```

**Qué salió:**

> Después, a mano: `make ci-lint; echo "código: $?"` → tiene que quedarse en silencio con código 0.

---

## Prompt 4 — Parte B: corrección (solo si make ci-lint canta)

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
make ci-lint ha devuelto esto:

<pegar la salida literal y el código de salida>

Corrige solo lo que señala, en una sola pasada, y explícame cada aviso.
```

**Qué salió:**

---

## Prompt 5 — Parte C: HALLAZGOS.md

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Escribe HALLAZGOS.md en la raíz con tres apartados, usando SOLO los datos que te pego (no los
reconstruyas ni vuelvas a ejecutar nada):

1. La imagen: pesa <tamaño de docker images>. Qué tuvo que declarar el Dockerfile que mi máquina daba
   por hecho (dependencias del sistema, versión, pasos de construcción). Revisa el Dockerfile y dímelo.
2. Lo que reclamó el contenedor al arrancar sin variables. Mensaje literal:
   <pegar el mensaje entero de docker run --rm flowsync-api:local>
   Cuántas son, y clasifica cada una en secreto (su conocimiento da acceso) o configuración (no pasaría
   nada si saliera en un registro público). Compáralas con las de backend/.env:
   <pegar los NOMBRES de las variables de backend/.env, sin valores>
3. Qué NO comprueba el pipeline: una lista corta y concreta de lo que ninguno de los cinco trabajos de
   ci.yml afirma. Nada genérico tipo «faltan cosas».

Añade también lo que pasó en las partes A y B: correcciones que tuve que pedir (<sí/no y cuáles>) y si
make ci-lint salió limpio a la primera. Commitea en esta rama.
```

**Qué salió:**

---

## Prompt 6 — Entrega

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Comprueba que prompts.md y HALLAZGOS.md están commiteados en pipeline-marco-bello y que no hay ningún
.env ni secreto en los commits de la rama. Si algún commit quedó en otra rama, tráelo con git merge.
Empuja la rama a mi fork (git push -u origin pipeline-marco-bello) y abre el pull request desde mi fork
hacia el repositorio del curso, el remoto upstream (LIDR-academy-temp/flowsync-ai4devs; comprueba que
el repo base es ese y no mi fork), con una
descripción completa del cambio.
```

**Qué salió:**
