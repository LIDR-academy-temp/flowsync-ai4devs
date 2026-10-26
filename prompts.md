# Prompts

Todos los prompts lanzados para hacer el módulo 13, en el orden en que se lanzaron. Una sola
sesión, mismo modelo y misma herramienta en todos.

---

## Prompt 1

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Parte A del módulo 13 de FlowSync. Una sola pasada: si un comando falla, pega la salida completa, no lo reintentes y no improvises un segundo arreglo.

Antes de editar:
- Crea y cámbiate a la rama pipeline-afc desde upstream/s13/start. Si esa rama ya existe y no es main ni sN/*, sigue en ella. No toques main.
- No crees nada en .railway/. No escribas valores de entorno dentro del Dockerfile ni los commitees. No reescribas HALLAZGOS.md ni hagas el workflow de CI.

1. backend/.dockerignore
Excluye node_modules, build, tmp, .git y cualquier .env*.

2. backend/Dockerfile, dos etapas y cero variables de entorno:
- build: node:24 (o la variante slim/alpine que aguante las dependencias). npm ci con todas las dependencias y npm run build. El script de build es node ace build y deja el compilado en build/.
- production: la imagen Node 24 más pequeña que funcione. Copia solo build/ de la etapa anterior. Dentro de ese directorio, npm ci --omit=dev. No debe quedar TypeScript, ni devDependencies, ni ningún .env.
- Usuario sin privilegios (node). EXPOSE 3333. Comando de arranque: node bin/server.js.

3. En el Makefile de la raíz, tres targets con estos nombres y un comentario ## para que salgan en la ayuda:
- image: construye flowsync-api:local.
- image-run: docker run en segundo plano, contenedor flowsync-api-local, publica IMAGE_PORT (por defecto 3334) hacia el 3333, --env-file backend/.env, y sobrescribe HOST=0.0.0.0, DB_HOST=host.docker.internal y APP_URL=http://localhost:$(IMAGE_PORT). Al final, curl -s a la raíz de ese puerto. La ruta GET / devuelve {"hello":"world"}.
- image-stop: docker rm -f flowsync-api-local.
El Makefile ya usa SHELL := /bin/bash. No lo reescribas a cmd.exe.

4. Pruebas, en este orden, y pega cada salida:
- make image
- docker images flowsync-api:local
- docker run --rm flowsync-api:local
  Tiene que fallar al momento por falta de configuración. Copia la salida entera: es la lista de variables que la aplicación exige para existir.
- Con la base de desarrollo en marcha (make db-up si no lo está): make image-run
  Tiene que responder {"hello":"world"}. Si no, pega docker logs flowsync-api-local y para.
- make image-stop

5. En la respuesta final dime solo esto, con lo medido:
- El tamaño que imprimió docker images.
- Qué paquetes de sistema o pasos de compilación tuviste que declarar en el Dockerfile porque la máquina local ya los tenía.
- La salida literal del docker run en seco, cuántas variables reclama y, de cada una, si es secreto (su filtración da acceso) o configuración (puede aparecer en un log). APP_KEY y DB_PASSWORD son secretos; el resto de start/env.ts es configuración. No pegues valores de backend/.env.

No hagas commit.
```

**Qué salió:** el primer `make image` falló (`EACCES` por el orden de `USER node` y `npm ci`); se corrigió en la misma pasada y el resto de pruebas pasó a la primera.

## Prompt 2

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Cierra la parte A con la skill /commit. Stage solo backend/Dockerfile, backend/.dockerignore y el Makefile. No incluyas backend/.adonisjs/ ni ningún .env. Mensaje convencional, en español, que diga por qué existe la imagen.
```

**Qué salió:** funcionó a la primera.

## Prompt 3

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Parte B del módulo 13 de FlowSync, en la rama pipeline-afc. No cambies de rama. No crees nada en .railway/. No escribas tokens ni valores de .env. No reescribas HALLAZGOS.md salvo que actionlint falle. No hagas commit. No toques openapi.yml ni revisor.yml.

Una sola pasada: si make ci-lint imprime algo o sale distinto de 0, pega esa salida completa, documenta el error literal en HALLAZGOS.md y para. No arregles el workflow en esta misma pasada.

1. Makefile. Añade ci-lint a .PHONY y este target, con tabulador real y comentario ##:

ci-lint:
    docker run --rm -v "$$(pwd):/repo" -w /repo rhysd/actionlint:1.7.12 -color

2. .github/workflows/ci.yml, con exactamente estos cinco jobs. test, image y lint-workflows en paralelo: ninguno depende de otro.

Global:
- on: pull_request, y push a main. El filtro de .railway/** no va en el on, porque test, image y lint-workflows tienen que correr en cualquier push o PR.
- concurrency con cancel-in-progress, agrupado por github.ref.
- permissions: contents: read. Nunca write-all. Cada job repite solo los permisos que usa.
- Toda action de terceros va fijada al SHA completo de 40 hex, resuelto en esta sesión con la API de GitHub (no de memoria), y un comentario # vX.Y.Z al lado. Incluye actions/checkout, actions/setup-node si lo usas, y railwayapp/config en el tag v1.2.0. Lee el action.yml de ese tag para usar los inputs reales.

Jobs:
- test. ¿La suite pasa en una máquina limpia? runs-on ubuntu-latest. Servicio pgvector/pgvector:pg17, usuario flowsync, contraseña flowsync, base flowsync_test, puerto del host 54411, healthcheck que espere a que acepte conexiones. Node 24 y npm ci en backend antes de los tests, como openapi.yml. En el env del job, las variables que start/env.ts exige y que backend/.env.test no trae: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY y APP_URL. APP_KEY con un valor falso y no secreto, el mismo papel que en openapi.yml. El comando de tests es exactamente make test, desde la raíz. El conteo va a $GITHUB_STEP_SUMMARY, no solo a stdout. No modifiques los targets test, migrate ni db-up. make test también hace docker compose up de db-test en el 54411: déjalo escrito en un comentario del job, sin cambiar el Makefile para esquivarlo.
- image. ¿El artefacto se construye desde cero? make image. Comentario obligatorio en el job: este trabajo comprueba que la imagen se construye, no que arranque.
- lint-workflows. make ci-lint.
- infra-plan. Solo en pull_request que toque .railway/** y solo si github.event.pull_request.head.repo.full_name == github.repository. Sin un sexto job: el filtro de rutas va en el if o en un step de este mismo job. railwayapp/config@v1.2.0 con command plan y RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}.
- infra-apply. Solo en push a main cuando el push cambia .railway/**. En un push no existe pull_request.head: no reutilices esa condición o el job no correrá nunca. La misma action, command apply, mismo secreto.

3. Ejecuta make ci-lint. Tiene que terminar con código 0 y sin una sola línea de aviso.

4. En la respuesta final: el código de salida de make ci-lint, los cinco nombres de job, y cada SHA con su tag. Si actionlint protestó, la salida completa y la confirmación de que quedó anotada en HALLAZGOS.md.
```

**Qué salió:** el workflow quedó escrito, pero `make ci-lint` falló antes de llegar a actionlint (Git Bash convertía `-w /repo` en una ruta de Windows); se anotó en HALLAZGOS.md sin tocar nada más.

## Prompt 4

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Corrección de la parte B, en la rama pipeline-afc. No cambies de rama, no toques .github/workflows/ci.yml, no crees .railway/ y no hagas commit.

make ci-lint falló antes de llegar a actionlint. El error literal ya está en HALLAZGOS.md: Git Bash convierte -w /repo en C:/Program Files/Git/repo. El mismo target con MSYS_NO_PATHCONV=1 sí ejecuta actionlint.

1. En el target ci-lint del Makefile, pon MSYS_NO_PATHCONV=1 delante del docker run. No cambies la imagen rhysd/actionlint:1.7.12, el montaje ni -color. En ubuntu esa variable no hace nada; en Git Bash impide la conversión de /repo.

2. Ejecuta make ci-lint.
- Si el código de salida es 0 y no imprime nada, para y dímelo.
- Si actionlint imprime cualquier aviso o sale distinto de 0, pega la salida completa, añádela al punto 3 de HALLAZGOS.md y para. No edites ci.yml en esta pasada.
```

**Qué salió:** código 0 y ninguna línea de actionlint.

## Prompt 5

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Cierra la parte B con /commit: stage ci.yml, Makefile y HALLAZGOS.md
```

**Qué salió:** funcionó a la primera.

## Prompt 6

**Modelo:** Claude Fable 5.1
**Herramienta:** Claude Code

```
Parte C y entrega del módulo 13, en la rama pipeline-afc. No cambies de rama. No crees .railway/. No toques el Dockerfile, el workflow ni el Makefile. No incluyas backend/.adonisjs/ ni ningún .env.

1. Sustituye HALLAZGOS.md entero. Los encabezados de filas y de migración no son los de este módulo. Tres apartados, con lo medido, sin inventar cifras:

## 1. Cuánto pesa la imagen y qué hubo que declarar
- docker images flowsync-api:local imprimió: flowsync-api:local, 5ad692b2e75a, 431MB de uso en disco, 99.1MB de contenido.
- Ningún apk ni toolchain: las dos etapas son node:24-alpine. pg es JavaScript puro, el hash es scrypt de Node y el único install script del lockfile es @swc/core, que es dev y trae binario musl. node ace build no necesitó .env.
- El primer make image falló con EACCES porque USER node iba antes de npm ci --omit=dev. La corrección, en la misma pasada, fue instalar como root y pasar a USER node después.
- Dentro de la imagen final no hay .ts fuera de node_modules ni ficheros .env*. Sí quedan typescript@6.0.3 y @adonisjs/assembler@8.4.0, porque @adonisjs/core, auth, lucid, session, shield, cors y @tuyau/core los declaran como peerDependencies y npm ci --omit=dev los instala igual.

## 2. Qué reclamó el contenedor al arrancar sin variables
Pega la salida literal de docker run --rm flowsync-api:local (código 1), la de EnvValidationException con las 12 variables: NODE_ENV, PORT, HOST, LOG_LEVEL, APP_KEY, APP_URL, SESSION_DRIVER, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE. Son 12. Secretos, porque conocerlos da acceso: APP_KEY y DB_PASSWORD. Configuración, porque salir en un log no da acceso: las otras diez. No pegues valores de backend/.env.

## 3. Qué NO comprueba el pipeline
Lista concreta, no «faltan cosas»:
- image solo construye; no arranca el contenedor ni comprueba {"hello":"world"}.
- Ningún job mira si la imagen lleva .env, TypeScript o esas peerDependencies.
- test publica pgvector en el 54411 y luego make test vuelve a levantar db-test por Compose en el mismo puerto. El choque está comentado en el job y no está resuelto.
- No hay pruebas de carga, ni migraciones de producción, ni rollback.
- infra-plan e infra-apply no corren en este cambio: no existe .railway/. En un fork tampoco verían RAILWAY_TOKEN.
- En Git Bash, sin MSYS_NO_PATHCONV=1, ci-lint ni llega a actionlint. Con esa variable, make ci-lint salió con código 0 y actionlint no imprimió avisos.

2. Comprueba, y escribe el resultado al final de tu respuesta, estos seis puntos. Si uno falla, dilo y no lo tapes:
- la imagen final no lleva el fuente ni las devDependencies (el matiz de las peerDependencies va en la línea 1)
- ningún .env dentro y ninguna variable con valor en el Dockerfile
- el mensaje literal del arranque está copiado en HALLAZGOS.md
- make ci-lint: vuelve a ejecutarlo. Éxito = código 0 y ninguna línea de actionlint. La línea que make imprime del propio docker run no es un aviso
- cada action de terceros de ci.yml está en SHA de 40 hex con el tag al lado
- la tercera línea nombra comprobaciones concretas que ningún job hace

3. Sustituye prompts.md. Borra el ejemplo. Un apartado por prompt, en este orden, modelo Claude Fable 5.1, herramienta Claude Code, texto tal cual, sin reescribirlo. Son los cinco mensajes humanos de esta sesión, en orden:
- el de la parte A
- «Cierra la parte A con la skill /commit. Stage solo backend/Dockerfile, backend/.dockerignore y el Makefile. No incluyas backend/.adonisjs/ ni ningún .env. Mensaje convencional, en español, que diga por qué existe la imagen.»
- el de la parte B
- el de la corrección de MSYS_NO_PATHCONV
- «Cierra la parte B con /commit: stage ci.yml, Makefile y HALLAZGOS.md»
Y este mensaje como prompt 6.

4. Commit solo de HALLAZGOS.md y prompts.md, con /commit. Mensaje docs, en español, que diga por qué se reescriben los hallazgos.

5. git push -u origin pipeline-afc. Abre el pull request contra el repositorio del curso, que el README nombra github.com/lidr-academy-temp/flowsync-ai4devs, base main, head la rama del fork. La base tiene que ser ese repositorio, no el fork. Si gh no puede abrirlo porque el fork no cuelga de ese repo, pega el error y para.

6. Mira si las Actions del PR llegaron a correr o se quedaron esperando aprobación. Si eso cambia la tercera línea, añádelo a HALLAZGOS.md, haz otro commit y empújalo. No uses --amend.

Al final responde solo con la URL del pull request y el resultado de los seis puntos.
```
