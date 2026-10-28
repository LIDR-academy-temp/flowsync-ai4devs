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

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
Empaqueta la API en una imagen que se construya desde cero, con un backend/Dockerfile multietapa y un backend/.dockerignore. Además, crea tres atajos en el Makefile de la raíz. 

Lo que se tiene que cumplir:

Dos etapas. 
- En la de construcción, la misma línea de Node que exige el proyecto (24), npm ci con todas las dependencias y npm run build, que en AdonisJS deja la aplicación compilada en build/. 
- En la final, una imagen base de Node 24 lo más pequeña posible, solo build/, y dentro de build/ las dependencias de producción (npm ci --omit=dev), que es como el propio framework documenta su despliegue. La imagen final no lleva el código fuente ni las dependencias de desarrollo.
Ni el código fuente, ni las dependencias de desarrollo, ni ningún .env viajan a la imagen final. 
Ningún .env viaja dentro de la imagen final tampoco, y ninguna variable tiene valor escrito en el Dockerfile.


Corre como usuario sin privilegios, expone el 3333 y arranca con node bin/server.js. Ninguna variable de entorno con valor dentro del Dockerfile: la configuración entra al arrancar el contenedor, no al construir la imagen.

El .dockerignore deja fuera node_modules, build, tmp y cualquier .env.

Tres atajos, con estos nombres y no otros: image construye la imagen con la etiqueta flowsync-api:local; image-run la arranca en segundo plano con el nombre de contenedor flowsync-api-local, publicando el puerto IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, pasándole backend/.env como fichero de entorno y forzando encima tres valores (HOST=0.0.0.0 y DB_HOST=host.docker.internal, porque dentro del contenedor localhost es el propio contenedor, y APP_URL=http://localhost:<IMAGE_PORT>, porque Docker no expande el ${HOST}:${PORT} que ese fichero usa), y termina con un curl -s a la raíz del puerto publicado; image-stop para y borra el contenedor.
```

**Qué salió:** 
Creo lo pedido: backend/Dockerfile, backend/.dockerignore y los atajos image, image-run e image-stop en el Makefile, y los commiteo en el branch pipeline-OJE. Tambien dijo que comprobo con make -n que los atajos generan los comandos esperados.


## Prompt 2

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
Corrige el error del curl. El error 56 significa que la conexión se cortó mientras se recibían datos. Docker Desktop acepta la conexión en el 3334 antes de que el servidor escuche dentro del contenedor, y la corta. Como no es un "connection refused", --retry-connrefused no la reintenta y curl se rinde al primer intento. Un segundo después ya respondía. Se corrige añadiendo --retry-all-errors al curl del Makefile. 
```

**Qué salió:** 

Ya esta arreglado: make image-run ya imprime {"hello":"world"} y termina con código 0.

En el curl del Makefile cambio --retry-connrefused por --retry-all-errors, que también reintenta los rechazos de conexión. Lo ha probado con un ciclo completo de make image-run y make image-stop, y el contenedor ya está borrado.


## Prompt 3

**Modelo:** Opus 5.5 with high effort
**Herramienta:** Claude Code

```
 Crea un workflow .github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz. El atajo valida todos los workflows de .github/workflows/ con actionlint sin instalar nada: usa su imagen oficial de Docker, rhysd/actionlint:1.7.12, montando la raíz del repositorio y con -color. El workflow tiene cinco trabajos, y cada uno responde a una pregunta:

test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con la imagen pgvector/pgvector:pg17 publicada en el puerto 54411, que es el que backend/.env.test ya espera (usuario flowsync, contraseña flowsync, base flowsync_test), esperando a que esté sano. Y exactamente make test, el mismo comando que corres en tu máquina; ni un node ace a mano. Las variables que backend/start/env.ts exige y que no están en .env.test van en el entorno del trabajo, como hace openapi.yml.

image: ¿el artefacto se puede fabricar desde cero? make image. Sin arrancar el contenedor: este trabajo afirma que la imagen se construye, no que arranque, y ese límite tiene que estar escrito en un comentario.

lint-workflows: ¿los propios archivos del pipeline son válidos? make ci-lint.

infra-plan: ¿qué cambiaría en la infraestructura si este cambio se fusiona? Solo en pull requests que toquen .railway/**, y solo si el pull request viene del propio repositorio y no de un fork, porque un fork no recibe los secretos. Con la acción oficial railwayapp/config en su versión v1.2.0, command: plan y el token en el secreto RAILWAY_TOKEN, para que el plan se publique como comentario del pull request.

infra-apply: el mismo plan, con command: apply, solo cuando el pull request se fusiona.

Y las reglas para todo el archivo: permisos mínimos declarados por trabajo, nunca write-all; cada acción de terceros fijada a su SHA de commit completo (Secure Hash Algorithm, el identificador de un commit), con la etiqueta de versión en un comentario al lado y resuelto por red, no de memoria; test, image y lint-workflows en paralelo; la ejecución anterior cancelada si llega otro push a la misma rama; y el recuento de tests publicado en el resumen de la ejecución, no en un echo que se pierde en el registro.

```

**Qué salió:** 

make ci-lint ha pasado: actionlint no ha encontrado ningún problema en los cuatro workflows (ci.yml, openapi.yml, revisor.yml y chromatic.yml), y make no ha dado error, así que salió con código 0.
