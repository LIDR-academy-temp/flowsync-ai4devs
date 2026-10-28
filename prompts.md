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

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code

```
Necesito empaquetar el backend en una imagen de Docker.

Crea backend/Dockerfile en dos etapas y backend/.dockerignore, y tres atajos en el Makefile de la raíz.

Dockerfile: en la etapa de construcción, Node 24, npm ci con todas las dependencias y npm run build, que deja la aplicación compilada en build/. 

En la etapa final, la imagen de Node 24 más pequeña posible, solo con build/ y dentro de build/ las dependencias de producción (npm ci --omit=dev). 

Ni código fuente, ni dependencias de desarrollo, ni ningún .env en la imagen final. 

Que corra con un usuario sin privilegios, exponga el 3333 y arranque con node bin/server.js. 

Ninguna variable de entorno con valor dentro del Dockerfile.

.dockerignore: fuera node_modules, build, tmp y cualquier .env.

Atajos, con estos nombres exactos:
- image: construye la imagen con la etiqueta flowsync-api:local.
- image-run: la arranca en segundo plano con el nombre flowsync-api-local, publicando IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, con backend/.env como fichero de entorno y forzando HOST=0.0.0.0, DB_HOST=host.docker.internal y APP_URL=http://localhost:<IMAGE_PORT>. 

Termina con un curl -s a la raíz del puerto publicado.
- image-stop: para y borra el contenedor.

No construyas ni arranques la imagen: eso lo hago yo.
```

**Qué salió:** funcionó a la primera (378 MB; sin configuración pide las 12 variables; con `make image-run` responde `{"hello":"world"}`). Agregó por su cuenta `--add-host` para Linux, una espera antes del `curl` y un aviso si falta `backend/.env`.

## Prompt 2

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code

```
Necesito el pipeline del repositorio. 

Crea .github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz. 

Antes de escribir, lee openapi.yml y revisor.yml: el nuevo vive al lado y sigue su estilo.

ci-lint: valida todos los workflows de .github/workflows/ con la imagen oficial de Docker rhysd/actionlint:1.7.12, montando la raíz del repositorio y con -color. Sin instalar nada.

ci.yml, cinco trabajos, uno por pregunta, cada uno con un comentario que diga qué afirma y qué no:
1. test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con pgvector/pgvector:pg17 en el puerto 54411 (usuario flowsync, contraseña flowsync, base flowsync_test, lo que espera backend/.env.test), esperando a que esté sano. Ejecuta exactamente make test, nada de node ace a mano. Las variables que exige backend/start/env.ts y no están en .env.test van en el entorno del trabajo, como hace openapi.yml.
2. image: ¿la imagen se puede fabricar desde cero? make image, sin arrancar el contenedor. Deja escrito en un comentario que afirma que se construye, no que arranque.
3. lint-workflows: ¿los archivos del pipeline son válidos? make ci-lint.
4. infra-plan: solo en pull requests que toquen .railway/** y que vengan del propio repositorio, no de un fork. Acción oficial railwayapp/config v1.2.0, command: plan, token en el secreto RAILWAY_TOKEN, para que el plan salga como comentario del pull request.
5. infra-apply: lo mismo con command: apply, solo cuando el pull request se fusiona.

Reglas para todo el archivo: permisos mínimos por trabajo, nunca write-all. Cada acción de terceros fijada a su SHA de commit completo con la etiqueta en un comentario al lado, y el SHA resuelto consultando la red, no de memoria. test, image y lint-workflows en paralelo. Cancelar la ejecución anterior si llega otro push a la misma rama. El recuento de tests publicado en el resumen de la ejecución, no en un echo.

No pongas ningún secreto en ningún archivo. No crees la carpeta .railway/. No hagas commit ni push. Cuando termines, ejecuta make ci-lint y dime qué salió.
```

**Qué salió:** `make ci-lint` limpio a la primera (código 0, cuatro workflows). SHA resueltos con `git ls-remote` y la API. Cambió por su cuenta `db-up` del Makefile (variable `DB_EXTERNA`) porque el contenedor de servicio y compose chocarían en el 54411.

## Prompt 3

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code

```
Cuáles serían los siguientes pasos?
```

**Qué salió:** propuso seis pasos: commit, documentación, secreto, push con PR contra `main`, revisión y opcionales. El PR contra `main` no corresponde: la base del ejercicio es `s13/start`.

## Prompt 4

**Modelo:** Opus 5.5 Medio
**Herramienta:** Claude Code

```
Procede con lo que recomiendas en 1 y 2.
```

**Qué salió:** dos commits: el pipeline con el Makefile, y la documentación (`docs/ci.md` nuevo y una sección en `CLAUDE.md`). Esto revocó el «no hagas commit» del Prompt 2.
