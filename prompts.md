# Prompts

Todos los prompts lanzados para el ejercicio de la sesión 13 (imagen + pipeline), en orden y tal cual.

---

## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Parte A del ejercicio: empaquetar la API (backend/, AdonisJS 7) en una imagen Docker.

Escribe backend/Dockerfile y backend/.dockerignore, y añade tres targets al Makefile de la raíz.

Dockerfile, multietapa con exactamente dos etapas:
- build: node:24 (la misma línea que exige el proyecto). Copia package.json y package-lock.json
  primero para cachear la capa de dependencias, npm ci con TODAS las dependencias, copia el resto
  y npm run build (deja la app compilada en build/).
- final: la imagen de Node 24 más pequeña razonable (alpine o slim, justifica cuál). Solo copia
  build/ desde la etapa anterior, y dentro de build/ instala las dependencias de producción con
  npm ci --omit=dev, que es como AdonisJS documenta el despliegue. Ni código fuente, ni
  devDependencies, ni ningún .env en la imagen final.
- Corre con un usuario sin privilegios (el `node` de la imagen vale), EXPOSE 3333 y
  CMD ["node", "bin/server.js"].
- Ninguna ENV con valor en el Dockerfile: la configuración entra al arrancar el contenedor.

.dockerignore: fuera node_modules, build, tmp y cualquier .env (.env, .env.*). Lo que no haga
falta para construir, también fuera.

Makefile (raíz), con estos nombres exactos y documentados con `## ...` como el resto:
- image: construye backend/ con la etiqueta flowsync-api:local.
- image-run: arranca la imagen en segundo plano con --name flowsync-api-local, publica
  IMAGE_PORT (por defecto 3334) sobre el 3333 del contenedor, --env-file backend/.env y encima
  -e HOST=0.0.0.0 -e DB_HOST=host.docker.internal -e APP_URL=http://localhost:$(IMAGE_PORT)
  (Docker no expande el ${HOST}:${PORT} del .env). Termina con curl -s a
  http://localhost:$(IMAGE_PORT)/ (dale unos segundos de margen al arranque).
- image-stop: para y borra el contenedor; que no falle si no existe.
Añádelos al .PHONY.

No ejecutes make image ni arranques el contenedor: eso lo hago yo. Sigue el estilo de comentarios
del Makefile (explicar el porqué). Commitea en la rama actual pipeline-Ivan-Cortes-Lexaris.
```

**Qué salió:** a la primera. `make image` construyó (382 MB en disco, 80,8 MB de contenido), `docker run --rm` sin variables murió reclamando 12, y `make image-run` respondió `{"hello":"world"}`. Elegí `node:24-alpine` tras comprobar que ninguna dependencia de producción trae binarios nativos. Al inspeccionar la imagen salió que `typescript` y `@japa/*` viajan como dependencias de producción (las arrastran `@adonisjs/auth` y `@japa/api-client`, declarado en `dependencies`) y que `build/` incluye `tests/` compilados: no lo arreglé, es dato para HALLAZGOS.

---

## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Parte B: el pipeline. Escribe .github/workflows/ci.yml y un target ci-lint en el Makefile de la
raíz. Lee antes openapi.yml y revisor.yml y sigue su estilo (comentarios en castellano que
explican el porqué, nombres de trabajo legibles, timeout-minutes en cada trabajo).

ci-lint: valida todos los workflows de .github/workflows/ con actionlint sin instalar nada, con
la imagen oficial rhysd/actionlint:1.7.12, montando la raíz del repo y con -color. Al .PHONY.

ci.yml, eventos: pull_request (opened, synchronize, reopened y closed, este último solo para
infra-apply) y push a main. Cinco trabajos, uno por pregunta:
1. test: ¿la suite del backend pasa en una máquina limpia? Servicio pgvector/pgvector:pg17
   publicado en 54411:5432 con usuario flowsync, contraseña flowsync y base flowsync_test (lo
   que espera backend/.env.test), con healthcheck pg_isready por TCP como compose.yaml, para que
   el trabajo espere a que esté sana. Node 24 con caché de npm, npm ci en backend/ y después
   exactamente `make test`, nada de node ace a mano. Las variables de start/env.ts que no están
   en .env.test van en el env del trabajo como hace openapi.yml (ojo: en CI no hay backend/.env).
   OJO, problema que ya veo: make test -> migrate -> db-up hace `docker compose up db db-test`,
   y en el runner eso intentaría publicar otra vez el 54411 y chocaría con el servicio. Haz que
   db-up no levante compose cuando CI=true (GitHub lo define) y dilo en un comentario; y pon
   NODE_ENV=test en el trabajo para que el `migration:run` "de desarrollo" de migrate también
   vaya contra .env.test, porque en CI no hay base en el 54410. No cambies nada más de make test.
   El recuento de tests (la línea "Tests N passed") va al resumen de la ejecución
   ($GITHUB_STEP_SUMMARY), también si la suite falla, no a un echo del registro.
2. image: ¿el artefacto se puede fabricar desde cero? make image, sin arrancar el contenedor.
   Escribe en un comentario que este trabajo afirma que la imagen se construye, no que arranque.
3. lint-workflows: ¿los propios archivos del pipeline son válidos? make ci-lint.
4. infra-plan: ¿qué cambiaría en la infraestructura si se fusiona? Solo en pull requests (no en
   closed) que vengan del propio repo y no de un fork, y solo si tocan .railway/**. Como el resto
   de trabajos tiene que correr siempre, no uses paths: a nivel de workflow; decide con un git
   diff contra la base dentro del trabajo y salta el paso si no cambia .railway/. Acción
   railwayapp/config v1.2.0, command: plan, railway-token: secrets.RAILWAY_TOKEN, para que
   publique el plan como comentario del PR. Lee su README/action.yml por red para los permisos.
5. infra-apply: lo mismo con command: apply, solo cuando el PR se cierra fusionado (mismo
   filtro de fork y de .railway/), con checkout del merge_commit_sha.

Reglas de todo el archivo:
- permissions: {} a nivel de workflow y permisos mínimos por trabajo; nunca write-all.
- Cada acción de terceros fijada a su SHA de commit completo con la etiqueta en un comentario
  al lado, resuelto por red con gh api (no de memoria). Usa la última versión publicada de
  actions/checkout y actions/setup-node.
- test, image y lint-workflows en paralelo (sin needs) y sin correr en el evento closed.
- concurrency por workflow y ref con cancel-in-progress, sin que un apply pueda cancelarse.
- Ningún secreto con valor en el archivo. Valores de mentira solo donde haga falta (APP_KEY).

Cuando termines, ejecuta make ci-lint y dime literalmente lo que salga. Si canta, NO lo corrijas
todavía: enséñamelo. Commitea en pipeline-Ivan-Cortes-Lexaris.
```

**Qué salió:** `make ci-lint` en silencio y con código 0 a la primera (la única salida fue la descarga de `rhysd/actionlint:1.7.12`). SHAs resueltos con `gh api repos/<owner>/<repo>/git/ref/tags/<tag>`: checkout v7.0.1, setup-node v7.1.0, railwayapp/config v1.2.0. Simulé el trabajo `test` en local (sin `backend/.env`, `CI=true` y el `env:` del job): 69 passed y la línea del recuento se extrae bien. El choque de `docker compose` con el servicio en el 54411 lo vi leyendo el Makefile antes de lanzar el prompt, no lo destapó actionlint, que no lo habría visto.

---

## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Parte C. Reescribe HALLAZGOS.md (trae la plantilla de otro ejercicio) con las tres líneas de
esta sesión, una sola línea por punto y con datos medidos, no supuestos:
1. Cuánto pesa la imagen (docker images flowsync-api:local) y qué tuvo que declarar el
   Dockerfile que mi portátil daba por hecho.
2. El mensaje literal de `docker run --rm flowsync-api:local` sin variables, cuántas son y
   cuáles son secreto y cuáles configuración (usa Env.schema.secret() de start/env.ts como
   referencia, pero razona cada una). Compáralo con las claves de backend/.env: qué sobra.
3. Qué NO comprueba el pipeline: lista corta y concreta de lo que ninguno de los cinco trabajos
   afirma. Nada de "faltan cosas".
Pega el mensaje literal entero debajo de la línea 2 como evidencia, sin códigos de color.
Commitea en pipeline-Ivan-Cortes-Lexaris.
```

**Qué salió:** a la primera.
