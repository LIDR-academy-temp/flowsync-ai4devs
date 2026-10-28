# Hallazgos

## 1. Cuánto pesa la imagen y qué tuvo que declarar el Dockerfile

- **378 MB en disco (80.2 MB de contenido comprimido)**, medido con `docker images flowsync-api:local`. En una máquina vacía hubo que declarar lo que mi portátil daba por hecho: la versión de Node (24), el paso de compilación (`npm run build`, que deja `build/` con su propio `package-lock.json`), una segunda instalación solo con dependencias de producción dentro de `build/`, y un usuario sin privilegios. Y al arrancarla aparecieron tres valores que en el contenedor tienen que ser otros: `HOST=0.0.0.0` (en local escucha en `localhost`), `DB_HOST=host.docker.internal` (la base no está dentro del contenedor) y el puerto publicado en `APP_URL`.

## 2. Qué reclamó el contenedor al arrancar sin variables

- `docker run --rm flowsync-api:local` falló con `EnvValidationException: Validation failed for one or more environment variables` y **12 variables**, la misma lista que exige `backend/start/env.ts`: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`. **Secreto: 2** (`APP_KEY`, `DB_PASSWORD`: su conocimiento da acceso). **Configuración: 10** (las demás). Mi `backend/.env` tiene 14: `TZ` y `DB_RO_PASSWORD` sobran para la aplicación (la segunda solo la lee el Makefile, y también es secreto).

## 3. Qué NO comprueba mi pipeline

- Que la imagen **arranque y responda**: `image` solo la construye. Que las pruebas pasen sobre el **código compilado**: `test` corre sobre el fuente, no sobre `build/`. Que la imagen esté **libre de vulnerabilidades**: nada la escanea. Que la infraestructura se pueda **planificar**: no hay `.railway/` ni `RAILWAY_TOKEN`, así que `infra-plan` e `infra-apply` nunca han corrido. Que `pgvector/pgvector:pg17` y `rhysd/actionlint:1.7.12` sean **siempre la misma imagen**: van por etiqueta, no por digest, y las acciones internas de `railwayapp/config` también. Y el trabajo `test` **no se ha ejecutado nunca** todavía: ni en el runner ni con `DB_EXTERNA` en local.
