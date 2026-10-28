# Hallazgos

Las tres líneas del ejercicio del módulo 13 (empaqueta la API y escribe su pipeline), con lo que medí.

## 1. Cuánto pesa la imagen y qué tuvo que declarar el Dockerfile

- **388 MB** según `docker images` (con `docker history`: ~182 MB son la base `node:24-alpine`, 124 MB las dependencias de producción y 0,9 MB `build/`). Lo que mi máquina daba por hecho y hubo que declarar fue la versión de Node: en local tengo la 24.19.0 y la imagen trae la 24.22.1, porque `node:24-alpine` fija la línea pero es una etiqueta móvil. También había que escuchar en `0.0.0.0` en vez de en `localhost`, y saber que la base no está en `localhost` sino en `host.docker.internal`. Y apareció algo que no esperaba: `npm ci --omit=dev` **no** deja fuera `typescript` (23,6 MB), `@japa/runner` ni `@adonisjs/assembler`. Entran como dependencias de producción de `@japa/api-client` (declarado en `dependencies`) y de `@adonisjs/auth`, y además `build/` lleva los tests compilados (`/app/tests`).

## 2. Qué reclamó el contenedor al arrancar sin variables

- Reclamó **12 variables**, todas de golpe y con código de salida 1, que son exactamente el esquema de `start/env.ts`. De las 13 de mi `backend/.env`, `TZ` no la pidió. **Secretos (2):** `APP_KEY` (con ella se firman y cifran cookies y sesiones) y `DB_PASSWORD`. **Configuración (10):** `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `APP_URL`, `SESSION_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_DATABASE`. `DB_USER` la dejo como configuración porque sola no da acceso, aunque es media credencial. La clasificación coincide con las dos que el código declara como `Env.schema.secret()`.

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

 ⁃ at new EnvValidator (node_modules/@adonisjs/env/build/index.js:127:17)
 ⁃ at Env.rules (node_modules/@adonisjs/env/build/index.js:221:10)
 ⁃ at Env.create (node_modules/@adonisjs/env/build/index.js:205:23)
 ⁃ (async file://start/env.js:2:16)
```

## 3. Qué NO comprueba mi pipeline

- **Que la imagen arranque.** `image` solo la construye: la imagen que muere con las 12 variables de arriba sale en verde. Tampoco mira qué lleva dentro, así que no ve que viajen `typescript` y los tests, ni hay escaneo de vulnerabilidades.
- **Que `make test` en el runner sea lo mismo que en mi máquina.** El comando es el mismo, pero con `CI=true` se salta compose y la migración de desarrollo. El camino que se prueba en CI no es el que corro yo.
- **Nada fuera de la suite del backend contra una base vacía:** ni `lint` ni `typecheck` del backend, ni el frontend (`make test-ui`), ni migraciones sobre una base con datos.
- **Que el servicio responda tras desplegar.** No hay comprobación posterior al despliegue.
- **Que las acciones estén congeladas de verdad.** `railwayapp/config` está fijada a su SHA, pero por dentro usa `actions/setup-node@v4`, `actions/upload-artifact@v4` y `actions/github-script@v7` por etiqueta, e instala `@railway/cli` en `latest`. Nada avisa tampoco de versiones nuevas (no hay alertas de dependencias).
- **Que un `destroy` necesite a alguien.** `infra-apply` deja `confirm-destructive` en su valor por defecto (`true`), así que fusionar el PR equivale a aprobar las destrucciones del plan.
- **La mitad de infraestructura, en mi PR.** `infra-plan` e `infra-apply` no corren en un PR desde un fork ni en uno que no toque `.railway/`, y nada comprueba que exista `RAILWAY_TOKEN`. `make ci-lint` (silencio, código 0) solo valida la sintaxis de los workflows, no que funcionen.
