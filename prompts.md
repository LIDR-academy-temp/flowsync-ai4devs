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

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Trabaja como alguien que prepara una imagen para una máquina vacía:
no des nada por instalado ni configurado, y declara explícitamente
todo lo que la aplicación necesita para construirse y arrancar.

Contexto
Repositorio FlowSync (AdonisJS, backend en backend/). Mi entorno: WSL con Docker Engine.

Antes de escribir nada, lee y usa como fuente de verdad:
- backend/package.json (versión de Node exigida, script build)
- backend/start/env.ts (variables que exige la app)
- backend/.env.example
- Makefile de la raíz (estilo, .PHONY, ayuda)

Encargo
1. backend/Dockerfile multietapa.
2. backend/.dockerignore.
3. Tres atajos nuevos en el Makefile de la raíz, siguiendo su estilo.

Dockerfile
- Etapa build: Node 24 (la línea que exige el proyecto), npm ci con todas
  las dependencias, npm run build (deja la app compilada en build/).
- Etapa final: imagen base Node 24 lo más pequeña posible; justifica la elección.
  Solo copia build/ y, dentro de build/, instala dependencias de producción
  con npm ci --omit=dev (como documenta AdonisJS su despliegue).
- No viajan a la imagen final: código fuente, dependencias de desarrollo ni ningún .env.
- Corre como Usuario sin privilegios, EXPOSE 3333, arranque con node bin/server.js.
- Ninguna variable de entorno con valor en el Dockerfile: la configuración
  entra al arrancar el contenedor.
- Contexto de build: backend/.

.dockerignore
Excluye node_modules, build, tmp y cualquier .env.

Atajos (exactamente estos nombres)
- image: construye flowsync-api:local.
- image-run: arranca en segundo plano el contenedor flowsync-api-local,
  publicando IMAGE_PORT (por defecto 3334, sobreescribible) sobre el 3333,
  con --env-file backend/.env y forzando encima:
    HOST=0.0.0.0
    DB_HOST=host.docker.internal (dentro del contenedor localhost es él mismo;
      que funcione también en Linux)
    APP_URL=http://localhost:<IMAGE_PORT> (Docker no expande ${HOST}:${PORT})
  Si el contenedor ya existe, <bórralo antes | falla con un mensaje claro>.
  Termina con un curl -s a la raíz del puerto publicado, esperando con
  reintentos (máx. ~30 s) a que responda.
- image-stop: para y borra el contenedor.

Fuera de alcance
- No ejecutes docker build, docker run ni ningún make. Los ejecuto yo.
- No toques .github/ ni crees .railway/.
- No modifiques backend/.env ni el código de la aplicación.

Al terminar, informa
- Archivos creados o modificados.
- Decisiones que tomaste y que no estaban en estas instrucciones
  (imagen base, usuario, permisos, orden de capas…).
- Supuestos que hiciste sobre el proyecto y de qué archivo los sacaste.
```

## Prompt 2

**Modelo:** Opus 1M xHigh
**Herramienta:** Claude Code

```
Trabaja como si el pipeline fuera a ejecutar código que no escribiste tú:
cada trabajo recibe solo los permisos y secretos que necesita, nada se
da por confiable por venir de un PR, y cada trabajo afirma una sola cosa
y deja escrito lo que no afirma.

Contexto
Repositorio FlowSync. Rama pipeline-ra; no commitees en s13/start.
Ya existen backend/Dockerfile y los atajos image, image-run e image-stop del Makefile.

Antes de escribir, lee y usa como fuente de verdad:
- .github/workflows/openapi.yml y revisor.yml (estilo, cómo declaran variables y permisos)
- backend/start/env.ts (variables que exige la app)
- backend/.env.test (lo que ya está definido para tests)
- Makefile de la raíz (qué hace make test, estilo de los atajos)
- backend/package.json (versión de Node)

Encargo
1. .github/workflows/ci.yml con cinco trabajos.
2. Atajo ci-lint en el Makefile de la raíz.

ci-lint
Valida todos los workflows de .github/workflows/ con actionlint sin instalar nada:
docker run con la imagen rhysd/actionlint:1.7.12, montando la raíz del repo, con -color.

Trabajos (cada uno responde una sola pregunta; pon la pregunta en un comentario)
1. test — ¿la suite del backend pasa en una máquina limpia?
   - Servicio PostgreSQL: pgvector/pgvector:pg17, publicado en 54411
     (usuario flowsync, contraseña flowsync, base flowsync_test), con health check.
   - Node 24. Puedes instalar dependencias, pero los tests se ejecutan con
     exactamente `make test`. Nada de `node ace` a mano.
   - Las variables que exige env.ts y no están en .env.test van en el env del
     trabajo, como hace openapi.yml. Ningún secreto real.
   - Publica el recuento de tests en $GITHUB_STEP_SUMMARY, sacándolo de la
     salida de make test, sin perder su código de salida.
2. image — ¿el artefacto se puede fabricar desde cero?
   `make image`, sin arrancar el contenedor. Deja escrito en un comentario
   que este trabajo afirma que la imagen se construye, no que arranque.
3. lint-workflows — ¿los archivos del pipeline son válidos? `make ci-lint`.
4. infra-plan — ¿qué cambiaría en la infraestructura si se fusiona?
   - Solo en pull requests que modifiquen .railway/**. El filtro debe aplicarse
     a este trabajo, no a todo el workflow: test, image y lint-workflows
     corren en todos los PR.
   - Solo si el PR viene del propio repositorio, no de un fork.
   - Acción railwayapp/config v1.2.0, command: plan, token en secrets.RAILWAY_TOKEN,
     el plan se publica como comentario del PR.
5. infra-apply — lo mismo con command: apply, solo cuando el PR se fusiona en main
   <y toca .railway/** | siempre que se fusione>.
   Implementa "se fusiona" como pull_request closed + merged.

Reglas para todo el archivo
- permissions: {} a nivel de workflow; permisos mínimos declarados por trabajo.
  Nunca write-all.
- Cada acción de terceros fijada al SHA de commit completo, con la etiqueta de
  versión en un comentario al lado. Resuelve cada SHA por red (git ls-remote o
  gh api) y dime el comando. Si no puedes resolver alguno, déjalo marcado
  como TODO y avísame; no escribas un SHA de memoria.
- test, image y lint-workflows en paralelo.
- Concurrencia: cancela la ejecución anterior si llega otro push a la misma rama,
  pero nunca cancelar un infra-apply en curso.

Fuera de alcance
- No crees .railway/ ni pongas ningún secreto en ningún archivo.
- No modifiques openapi.yml, revisor.yml, el Dockerfile ni el código de la app.
- No ejecutes make ci-lint ni hagas push: los ejecuto yo.

Al terminar, informa
- Archivos creados o modificados.
- Cada acción usada, con su SHA, etiqueta y comando con que lo resolviste.
- Cómo implementaste el filtro de .railway/**, la detección de fork y la condición de merge.
- Decisiones que tomaste fuera de estas instrucciones.
```
