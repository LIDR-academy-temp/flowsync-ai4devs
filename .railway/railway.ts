/**
 * FlowSync en Railway: la base (`db`), su volumen (`db-data`) y la API (`api`).
 *
 * Lo que NO vive en este archivo:
 *
 * - La API no se despliega hasta que el pipeline de `main` pasa: es el ajuste
 *   «Wait for CI» del servicio `api` en la plataforma, no una línea de aquí.
 * - Los valores marcados con `preserve()` (`POSTGRES_PASSWORD`, `APP_URL`,
 *   `APP_KEY`) no están en ningún fichero: se dan de alta en la plataforma
 *   ANTES del primer arranque, con `--stdin` (ver `.railway/README.md`). Sin
 *   ellos, `db` no inicializa y la API no pasa la validación de `start/env.ts`.
 */
import { defineRailway, github, image, preserve, project, service, volume } from 'railway/iac'

/**
 * Repositorio desde el que se construye la API. Quien despliegue desde su fork
 * cambia solo esta línea.
 */
const REPOSITORIO = 'LIDR-academy/flowsync-ai4devs-fundacional'

export default defineRailway(() => {
  const dbData = volume('db-data')

  /**
   * La misma imagen que `compose.yaml` en local, no la plantilla de Postgres de
   * Railway, que va en otra versión mayor y sin pgvector.
   */
  const db = service('db', {
    source: image('pgvector/pgvector:pg17'),
    volumeMounts: { '/var/lib/postgresql/data': dbData },
    env: {
      // Subcarpeta del volumen: uno recién creado puede traer `lost+found`, y
      // PostgreSQL no inicializa un directorio que no está vacío.
      PGDATA: '/var/lib/postgresql/data/pgdata',
      // Los mismos valores que `db` en `compose.yaml`.
      POSTGRES_USER: 'flowsync',
      POSTGRES_DB: 'flowsync',
      POSTGRES_PASSWORD: preserve(),
    },
  })

  const api = service('api', {
    // Railway encuentra el `Dockerfile` en el directorio raíz del servicio.
    source: github(REPOSITORIO, { branch: 'main', rootDirectory: 'backend' }),
    // Comprueba la base, no solo que el proceso responda (`GET /` no lo hace).
    healthcheck: '/health',
    // Entre la construcción y el arranque; si sale con error, no se despliega.
    preDeploy: 'node ace migration:run --force',
    env: {
      NODE_ENV: 'production',
      PORT: '3333',
      HOST: '0.0.0.0',
      LOG_LEVEL: 'info',
      SESSION_DRIVER: 'cookie',
      // Por la red privada del proyecto: la base no tiene dominio público.
      DB_HOST: db.env.RAILWAY_PRIVATE_DOMAIN,
      DB_PORT: '5432',
      // Referencias a `db`, no copias: si cambian allí, cambian aquí.
      DB_USER: db.env.POSTGRES_USER,
      DB_DATABASE: db.env.POSTGRES_DB,
      DB_PASSWORD: db.env.POSTGRES_PASSWORD,
      APP_URL: preserve(),
      APP_KEY: preserve(),
    },
  })

  return project('flowsync', {
    resources: [db, dbData, api],
  })
})
