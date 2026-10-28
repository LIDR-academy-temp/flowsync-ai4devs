# Hallazgos

## 1. Peso de la imagen y lo que hubo que declarar

**Tamaño:** 259 MB (`docker images flowsync-api:local` → `fa7c039bcf55`, 259MB).

Lo que `backend/Dockerfile` tuvo que escribir y que el portátil daba por hecho:

- **Versión de Node:** el repo no la fija (no hay `.nvmrc` ni `engines` en `backend/package.json`). El Dockerfile fija `node:24-alpine` porque las dependencias de AdonisJS 7 piden `>=24.0.0` y el CI usa la 24. El portátil va en la 25.6.1.
- **Dependencias del sistema:** ninguna. Hay dos módulos nativos, `@swc/core` (solo en el build) y `@ast-grep/napi` (también en producción, porque lo arrastra `@adonisjs/auth` → `@adonisjs/assembler`). Los dos traen binario para musl, así que en Alpine no hubo que instalar python, make ni g++.
- **Paso de construcción:** `npm ci` + `npm run build` (`node ace build`) en una etapa, y en la final solo `build/` con `npm ci --omit=dev` y `npm cache clean --force`. En local no existe ese paso: se trabaja con `node ace serve --hmr` sobre TypeScript.
- **Usuario:** `USER node`. En local el proceso corre con tu usuario.
- **Configuración:** ningún `ENV` ni `ARG` con valor; todo entra al arrancar.

No hizo falta ningún prompt de corrección: la imagen se construyó y `make image-run` respondió a la primera.

## 2. Qué reclamó el contenedor al arrancar sin variables

`docker run --rm flowsync-api:local`:

```text
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
```

**12 variables**, todas en el mismo error: no se para en la primera.

| Variable | Secreto o configuración | Por qué |
|---|---|---|
| `NODE_ENV` | Configuración | Solo elige el modo (`development`, `production` o `test`). |
| `PORT` | Configuración | El puerto interno en el que escucha. |
| `HOST` | Configuración | La interfaz en la que escucha. |
| `LOG_LEVEL` | Configuración | Solo decide cuánto se registra. |
| `APP_KEY` | **Secreto** | Firma y cifra cookies y valores de la app: quien la tiene puede falsificarlos o descifrarlos. |
| `APP_URL` | Configuración | La URL pública, que ya ve cualquiera. |
| `SESSION_DRIVER` | Configuración | Solo elige dónde se guarda la sesión. |
| `DB_HOST` | Configuración | Dice dónde está la base, pero sin la contraseña no da acceso. |
| `DB_PORT` | Configuración | Igual que `DB_HOST`. |
| `DB_USER` | Configuración | Sin la contraseña no da acceso, aunque facilita un ataque si la base estuviera expuesta. |
| `DB_PASSWORD` | **Secreto** | Junto con host y usuario, da acceso directo a todos los datos. |
| `DB_DATABASE` | Configuración | Solo el nombre de la base. |

Dos secretos y diez de configuración.

**Contra la hipótesis de la parte A:** acertó las 12, sin que sobrara ni faltara ninguna. También que no pediría `APP_NAME` (se lee en `config/logger.ts` pero no está en el schema) ni `TZ`. Lo que quedaba abierto, si las pediría todas de golpe, también se cumple.

**Contra `backend/.env`:**
- **Sobran dos variables:**
  - `TZ` no la valida nadie.
  - `DB_RO_PASSWORD` solo la usa el Makefile, pero `make image-run` la mete en el contenedor con `--env-file`. Es un secreto que la API no necesita y que acaba en su entorno.
- **No falta ninguna.**
- **Además,** `.env` trae `NODE_ENV=development`, así que la prueba de `make image-run` arrancó la imagen en modo desarrollo, no en producción.

## 3. Qué NO comprueba el pipeline

Ninguno de los cinco trabajos de `.github/workflows/ci.yml` afirma:

- **Que la imagen arranque y responda:** `make image-run` devolvió `{"hello":"world"}` en tu máquina, pero `image` solo construye; ningún trabajo hace `docker run` ni `curl`.
- **Que la API llegue a la base de datos:** ni siquiera tu prueba lo demuestra, porque `GET /` devuelve un literal y no consulta nada.
- **Que la imagen construida sea la que se despliega:** la de `image` se descarta al acabar el trabajo; no se publica ni se conecta con `infra-apply`.
- **El arranque en modo producción ni con las variables reales:** `test` corre con `NODE_ENV=test` y un `APP_KEY` de mentira, y tu prueba manual arrancó con `NODE_ENV=development`.
- **Migraciones contra datos reales, ni sus `down`:** solo se migra una `flowsync_test` vacía, y siempre hacia arriba.
- **Que `make test` en local y en CI recorran el mismo camino:** en CI no hay `backend/.env`, y `NODE_ENV=test` + `DB_EXTERNA=1` hacen que no se levante Compose ni se migre la base de desarrollo.
- **El frontend:** `ci.yml` no toca `frontend/`.
- **La infra que llega desde un fork:** se fusiona sin plan y sin apply, sin aviso.
- **Que un `infra-plan` en verde haya planificado algo:** si el PR no toca `.railway/`, los pasos se saltan y el trabajo sale verde igual.
- **Lo que de verdad ejecuta `railwayapp/config`:** el SHA fija la acción, pero dentro usa `setup-node@v4`, `upload-artifact@v4`, `github-script@v7` e instala `@railway/cli@latest`.
- **Vulnerabilidades ni rendimiento:** no hay `npm audit`, ni escaneo de `node:24-alpine` / `pgvector:pg17` (tags sin digest), ni ninguna medida de tiempos o de tamaño.
