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

**Modelo:** Opus 5.5 High
**Herramienta:** Claude Code

```
Crea un Dockerfile multietapa con 2 etapas Construccion/Build y  Ejecucion/Runtime:

1. Etapa Construccion: Sobre una docker image oficial estable de NodeJS 24, instala `npm ci` con todas sus dependencias asi como la generacion de los compilados con ```npm run build```, en AdonisJS deja la aplicacion compilada en build/. 

2. Etapa Ejecucion: La imagen mas frugal -usualmente las *alpine*- oficial y estable de NodeJs 24, que tenga solo build/ y las dependencias de produccion(```npm ci --omit=dev```). Excluye codigo fuente, dependencias de desarrollo, ningun .env viaja en esta etapa, solo lo estrictamente necesario para ejecutar esta aplicacion FlowSync. TRANSFIERE (COPY --from=) los compilados de la etapa anterior al directorio /build. 

- El .dockerignore excluye node_modules, build, tmp y cualquier .env.

- La imagen se ejecuta como usuario sin privilegios, se expone en el puerto 3333 y arranca con node bin/server.js

- Ninguna variable de entorno con valor va dentro del Dockerfile. La configuracion entra al arrancar el contenedor, no al construir la imagen.

```

**Qué salió:** Creo el DockerFile con las especificaciones que se pidieron pero inidco que el contendor arranca en 0.0.0.0 y aloerto de npm ci tiene 9 vulnerabiliades que hay que revisar con trivy o dockre scout. Hizo el commit

## Prompt 2

**Modelo:** Opus 5.5 xHigh
**Herramienta:** Claude Code

```
Crea 3 atajos en el Makefile, con los siguientes nombres y que hagan lo que se les pide:
- image: Construir una imagen con la etiqueta flowsync-api:local

- image-run: Arranca en segundo plano la imagen flowsync-api:local con el mismo nombre y con el puerto IMAGE_PORT=3333 al que le amarras el de defecto(IMAGE_PORT=3334), dandole backend/.env como archivo de entorno. Fuerza los siguientes valores: HOST=0.0.0.0, DB_HOST=host.docker.internal, APP_URL=http://localhost:<IMAGE_PORT>. Termina con un curl -s a la raíz del puerto publicado para verificar si esta funcionando.

-image-stop para y borra el contenedor.
```

**Qué salió:** : Creo las entradas en el makefile y encontro un problema, dijo que uso --retry-all-errors en lugar de --retry-connrefused para que el contendor pudiera ser accesible, porque docker acepta la connexcion antes que el servidor este listo y devuelve una respuesta vacia y sin reintentod la comprobacion siempre es vacia.


## Prompt 2

**Modelo:** Opus 5.5 xHigh
**Herramienta:** Claude Code

```
Crea un worflow de Github github/workflows/ci.yml y un atajo ci-lint en el Makefile de la raíz. El atajo valida todos los workflows de .github/workflows/ con actionlint sin instalar nada: usa su imagen oficial de Docker, rhysd/actionlint:1.7.12, montando la raíz del repositorio y con -color. El workflow tiene cinco trabajos, y cada uno responde a una pregunta, porque es lo que cumple el del directo:

1. test: ¿la suite del backend pasa en una máquina limpia? PostgreSQL como contenedor de servicio con la imagen pgvector/pgvector:pg17 publicada en el puerto 54411, que es el que backend/.env.test ya espera (usuario flowsync, contraseña flowsync, base flowsync_test), esperando a que esté sano. Y exactamente make test, el mismo comando que corres en tu máquina; ni un node ace a mano. Las variables que backend/start/env.ts exige y que no están en .env.test van en el entorno del trabajo, como hace openapi.yml.

2. image: ¿el artefacto se puede fabricar desde cero? make image. Sin arrancar el contenedor: este trabajo afirma que la imagen se construye, no que arranque, y ese límite tiene que estar escrito en un comentario.

3. lint-workflows: ¿los propios archivos del pipeline son válidos? make ci-lint.

4. infra-plan: ¿qué cambiaría en la infraestructura si este cambio se fusiona? Solo en pull requests que toquen .railway/**, y solo si el pull request viene del propio repositorio y no de un fork, porque un fork no recibe los secretos. Con la acción oficial railwayapp/config en su versión v1.2.0, command: plan y el token en el secreto RAILWAY_TOKEN, para que el plan se publique como comentario del pull request.

5. infra-apply: el mismo plan, con command: apply, solo cuando el pull request se fusiona.

Y las reglas para todo el archivo: permisos mínimos declarados por trabajo, nunca write-all; cada acción de terceros fijada a su SHA de commit completo (Secure Hash Algorithm, el identificador de un commit), con la etiqueta de versión en un comentario al lado y resuelto por red, no de memoria; test, image y lint-workflows en paralelo; la ejecución anterior cancelada si llega otro push a la misma rama; y el recuento de tests publicado en el resumen de la ejecución, no en un echo que se pierde en el registro.
```

**Qué salió:** : Creo el CI workflow, con todas las verificaciones solicitadas, creo en el Makefile su entrada make ci-lint que funciono dando 0.



