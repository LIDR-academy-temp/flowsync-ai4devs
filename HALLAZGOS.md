# Hallazgos

## 1. Cuánto pesa la imagen y qué tuvo que declarar el Dockerfile

- La imagen pesa 378 MB. De eso, `/app` son 116,5 MB, casi todo `node_modules` de producción (115,4 MB). El resto es `node:24-alpine`. Mi `backend/` local pesa 177 MB, así que la segunda etapa no se copió todo.
- Lo que en mi máquina ya estaba y hubo que declarar: Node 24, las dependencias de producción instaladas dentro de `build/` (`npm ci --omit=dev`) y un usuario sin privilegios (`USER node`).
- Al arrancar hubo que forzar `HOST=0.0.0.0` y `DB_HOST=host.docker.internal`, porque dentro del contenedor `localhost` es el propio contenedor. También `APP_URL`, porque Docker no expande el `${HOST}:${PORT}` del `.env`.
- Lo que no esperaba: `node ace build` deja en `build/` los tests compilados y 82 sourcemaps, y viajan a la imagen final. Nadie los pidió y el agente no lo avisó.

## 2. Qué reclamó el contenedor al arrancar sin variables

`docker run --rm flowsync-api:local` murió con:

    EnvValidationException: Validation failed for one or more environment variables

    - Missing environment variable "NODE_ENV"
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

- Son 12. Mi `backend/.env` tiene 14: no reclama `TZ` (es opcional) ni `DB_RO_PASSWORD` (solo la lee el Makefile).
- Secretos: `APP_KEY` y `DB_PASSWORD`. Su conocimiento da acceso.
- Configuración: las otras 10. `DB_USER` la dejé como configuración: sola no da acceso, aunque junto con la contraseña sí.

## 3. Qué NO comprueba mi pipeline

- Que la imagen arranque. `image` solo la construye, y sin variables muere en menos de un segundo.
- Que `make test` funcione tal cual. En CI corre `make -o db-up test`, así que el `docker compose` del `db-up` no se prueba nunca.
- Que `image-run` funcione. En mi Mac el primer `curl` salía con 56 y el atajo daba ❌ con código 0. Lo arreglé con un prompt, pero CI no lo ejecuta.
- El frontend: ni build, ni lint, ni historias. `ci.yml` solo mira el backend.
- El lint del backend y la seguridad de las dependencias (`npm audit`). Tampoco las acciones que `railwayapp/config` usa por dentro sin SHA.
- Que las acciones estén fijadas a SHA: actionlint da verde con los `@v7` de los otros tres workflows.
- `infra-plan` e `infra-apply`: no corrieron nunca. No hay `.railway/` ni token, y un PR desde un fork no recibe secretos.
- El recuento de tests depende de un `grep` sobre la línea «Tests N passed» de Japa. Si cambia el formato, el resumen queda vacío pero el job sigue en verde.
