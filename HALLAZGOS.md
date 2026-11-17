# Hallazgos

Medido en Windows con Git Bash y Docker Desktop 29.6.2 (no en WSL), Node 24.19.

## 1. Peso de la imagen y lo que el Dockerfile tuvo que declarar

**`flowsync-api:local` ocupa 388 MB en disco (81,3 MB de contenido comprimido)** según `docker images`: unos 260 MB son la base `node:24-alpine`, 124 MB la capa de `npm ci --omit=dev` (92 MB de `node_modules`) y 1,2 MB el código compilado. Lo que el Dockerfile tuvo que escribir y mi portátil daba por hecho: la **versión** de Node (`node:24-alpine` en las dos etapas; el proyecto declara 24 como mínimo), el **paso de construcción** (`npm run build`, lo único que produce `build/`), una **segunda instalación** solo de producción dentro de `build/` (el build no se lleva `node_modules`), el **usuario** sin privilegios (`node`, uid 1000, que la imagen oficial ya trae) y el **puerto** (`EXPOSE 3333`, que en el portátil lo decía `.env`). Ninguna dependencia de sistema: no hay módulos nativos en producción, así que Alpine sirve. Tres cosas que no esperaba: (a) la imagen **sí lleva `typescript` (23,6 MB)** aunque no sea una dependencia de desarrollo, porque entra por producción (`@adonisjs/auth` → `@adonisjs/assembler`), y también `tests/` compilado; no lleva ningún `.env` ni ningún `.ts` de código fuente; (b) mi `make image` falló a la primera por un DNS de Docker Desktop que no resolvía `cloudfront.docker.com` justo al arrancar, y la causa era mi línea `# syntax=docker/dockerfile:1`, que obliga a bajar un frontend de BuildKit más; repetido sin cambiar nada, construyó; (c) `make test` pasa por `make db-up`, que levanta `db-test` de compose en el 54411, **el mismo puerto** que el servicio de PostgreSQL del workflow, y tuve que cambiar `db-up` para que no levante compose cuando `CI` está definida.

## 2. Lo que reclamó el contenedor al arrancar sin variables

**Doce**, literal (`docker run --rm flowsync-api:local`, sale con código 1 en menos de un segundo):

```
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
```

**Secretos (2)**, los que el propio schema marca con `Env.schema.secret()`: `APP_KEY` (firma y cifra; quien la conoce falsifica sesiones y cookies) y `DB_PASSWORD` (da acceso a los datos). **Configuración (10)**, que en un registro público no abrirían nada: `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_DATABASE` (`DB_HOST` y `DB_USER` enseñan la topología, pero no dan acceso por sí solos). Contra mi `backend/.env`, la lista es la misma **menos** `DB_RO_PASSWORD`, que solo lee el Makefile: `make image-run` pasa todo `.env` con `--env-file` y la comprobé dentro del contenedor, así que esa contraseña de solo lectura viaja a él sin que la aplicación la pida; y `NODE_ENV=development` también, de modo que «la imagen de producción» arranca en `development` si el `.env` lo dice. Con `make image-run` (y los tres valores forzados) respondió `{"hello":"world"}` por el 3334.

## 3. Lo que NO comprueba mi pipeline

- **Que la imagen arranque**: `image` solo la construye. Ningún trabajo ejecuta el contenedor, valida las doce variables ni hace el `curl` a la raíz; yo lo hice a mano y el pipeline no lo repite.
- **Que el contenedor llegue a la base de datos**: `{"hello":"world"}` no toca PostgreSQL, así que ni mi prueba local ni el pipeline demuestran que `DB_HOST=host.docker.internal` conecte.
- **Que la imagen sea la que se despliega**: no se publica en ningún registro ni se escanea (lleva `typescript` y `tests/` sin que nadie lo vea), y `node:24-alpine` es una etiqueta que se mueve (no está fijada por digest).
- **La configuración de producción**: `test` corre con `NODE_ENV=test` y sesiones en memoria; `NODE_ENV=production` y `SESSION_DRIVER=cookie` o `database` no los ejerce nadie.
- **Las migraciones hacia atrás**: solo se prueba el `up` (dentro de `make test`); ningún trabajo hace ida, vuelta e ida ni mira el `down`.
- **El frontend entero**: no hay `lint`, `build` ni `make test-ui` en `ci.yml`; un frontend roto saldría en verde.
- **Lint y tipos del backend**: `npm run lint` y `npm run typecheck` no corren en ningún trabajo (el documento OpenAPI sí, pero en `openapi.yml`).
- **Que `infra-plan` e `infra-apply` funcionen**: no hay `.railway/`, ni `RAILWAY_TOKEN`, ni plataforma; esos dos trabajos están escritos y pasan `actionlint`, pero **nunca se han ejecutado**, y el filtro «¿toca `.railway/`?» (un paso con `gh api`, no un `paths:`) tampoco.
- **Que mi workflow funcione en un runner real**: `make ci-lint` (actionlint 1.7.12 en Docker) sale en silencio con código 0 y `make test` da 69 tests en verde en mi máquina, pero eso no es GitHub Actions. La guarda de `CI` en `db-up` y la publicación del resumen (el formato `Tests  69 passed (69)` sí lo vi en la salida real) no las he visto correr en Actions. Tampoco sé si correrá sobre el pull request: las Actions de quien colabora por primera vez suelen esperar aprobación.
